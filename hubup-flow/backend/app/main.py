import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import Base, engine, get_db
from app.models import Board, BoardColumn, Card, Label, Subtask, User
from app.schemas import (
    AuthResponse,
    BoardCreate,
    BoardDetailOut,
    BoardMetricsOut,
    BoardSummaryOut,
    BoardUpdate,
    CardCreate,
    CardMove,
    CardOut,
    CardUpdate,
    ColumnMetricOut,
    ColumnOut,
    ColumnsReorder,
    ColumnUpdate,
    PasswordReset,
    PriorityMetricOut,
    SubtaskCreate,
    SubtaskOut,
    SubtaskUpdate,
    UserLogin,
    UserOut,
    UserRegister,
    WipAlertOut,
)

AUTH_SECRET = os.getenv("HUBFLOW_AUTH_SECRET", "hubflow-enterprise-secret-key-2026")


def hash_password(password: str, salt: Optional[str] = None) -> str:
    salt_hex = salt or secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_hex.encode("utf-8"), 100_000)
    return f"{salt_hex}${dk.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, expected_hex = stored_hash.split("$", 1)
    except ValueError:
        return False
    computed = hash_password(password, salt_hex).split("$", 1)[1]
    return hmac.compare_digest(computed, expected_hex)


def create_access_token(user: User) -> str:
    payload = {
        "sub": user.id,
        "email": user.email,
        "exp": int(time.time()) + 60 * 60 * 24 * 7,
    }
    raw = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8")
    sig = hmac.new(AUTH_SECRET.encode("utf-8"), raw.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{raw}.{sig}"


def decode_access_token(token: str) -> Optional[dict]:
    try:
        raw, sig = token.split(".", 1)
        expected_sig = hmac.new(AUTH_SECRET.encode("utf-8"), raw.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload = json.loads(base64.urlsafe_b64decode(raw.encode("utf-8")).decode("utf-8"))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="HubFlow API",
    description="Plataforma Kanban Corporativa Full-Stack do Ecossistema HubUP",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_board_full(db: Session, board_id: int) -> Board:
    stmt = (
        select(Board)
        .where(Board.id == board_id)
        .options(
            selectinload(Board.labels),
            selectinload(Board.columns)
            .selectinload(BoardColumn.cards)
            .selectinload(Card.subtasks),
            selectinload(Board.columns)
            .selectinload(BoardColumn.cards)
            .selectinload(Card.labels),
        )
    )
    board = db.execute(stmt).scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quadro não encontrado.")
    return board


def _build_board_detail(board: Board) -> BoardDetailOut:
    wip_alerts: List[WipAlertOut] = []
    columns_out: List[ColumnOut] = []

    for col in sorted(board.columns, key=lambda c: c.position):
        sorted_cards = sorted(col.cards, key=lambda c: (c.position, c.id))
        exceeded = bool(col.wip_limit and col.wip_limit > 0 and len(sorted_cards) > col.wip_limit)
        if exceeded:
            wip_alerts.append(
                WipAlertOut(
                    column_id=col.id,
                    column_name=col.name,
                    current_count=len(sorted_cards),
                    wip_limit=col.wip_limit or 0,
                )
            )
        columns_out.append(
            ColumnOut(
                id=col.id,
                board_id=col.board_id,
                name=col.name,
                position=col.position,
                wip_limit=col.wip_limit,
                color=col.color,
                is_done=col.is_done,
                wip_exceeded=exceeded,
                cards=[CardOut.model_validate(card) for card in sorted_cards],
            )
        )

    return BoardDetailOut(
        id=board.id,
        name=board.name,
        prefix_key=board.prefix_key,
        description=board.description,
        columns=columns_out,
        labels=board.labels,
        wip_alerts=wip_alerts,
    )


def _reindex_column_cards(db: Session, column_id: int) -> None:
    cards = (
        db.execute(
            select(Card)
            .where(Card.column_id == column_id)
            .order_by(Card.position, Card.id)
        )
        .scalars()
        .all()
    )
    for idx, item in enumerate(cards):
        item.position = idx


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "HubFlow",
        "version": "1.0.0",
    }


@app.post("/api/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Informe um e-mail válido.")

    existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Este e-mail já está cadastrado.")

    user = User(
        name=payload.name.strip(),
        email=email,
        password_hash=hash_password(payload.password),
        role="member",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(token=create_access_token(user), user=UserOut.model_validate(user))


@app.post("/api/auth/login", response_model=AuthResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha incorretos.")

    return AuthResponse(token=create_access_token(user), user=UserOut.model_validate(user))


@app.post("/api/auth/reset-password")
def reset_password(payload: PasswordReset, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma conta encontrada com este e-mail.",
        )
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Senha redefinida com sucesso!"}


@app.get("/api/auth/me", response_model=UserOut)
def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não autenticado.")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão expirada ou inválida.")

    user = db.execute(select(User).where(User.id == int(payload["sub"]))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado.")
    return UserOut.model_validate(user)


@app.get("/api/boards", response_model=List[BoardSummaryOut])
def list_boards(db: Session = Depends(get_db)):
    stmt = (
        select(Board)
        .options(selectinload(Board.columns).selectinload(BoardColumn.cards))
        .order_by(Board.id)
    )
    boards = db.execute(stmt).scalars().all()
    result: List[BoardSummaryOut] = []
    for board in boards:
        card_count = sum(len(col.cards) for col in board.columns)
        wip_alerts_count = sum(
            1
            for col in board.columns
            if col.wip_limit and col.wip_limit > 0 and len(col.cards) > col.wip_limit
        )
        result.append(
            BoardSummaryOut(
                id=board.id,
                name=board.name,
                prefix_key=board.prefix_key,
                description=board.description,
                card_count=card_count,
                wip_alerts_count=wip_alerts_count,
            )
        )
    return result


@app.post("/api/boards", response_model=BoardDetailOut, status_code=status.HTTP_201_CREATED)
def create_board(payload: BoardCreate, db: Session = Depends(get_db)):
    prefix = payload.prefix_key.strip().upper()
    existing = db.execute(select(Board).where(Board.prefix_key == prefix)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Já existe um quadro com prefixo '{prefix}'.",
        )

    board = Board(
        name=payload.name.strip(),
        prefix_key=prefix,
        description=payload.description,
        next_card_number=1,
    )
    db.add(board)
    db.flush()

    default_columns = [
        ("Backlog", 0, None, "#64748B", False),
        ("A Fazer", 1, 5, "#0EA5E9", False),
        ("Em Progresso", 2, 3, "#00F0FF", False),
        ("Code Review / QA", 3, 2, "#A855F7", False),
        ("Concluído", 4, None, "#10B981", True),
    ]
    for name, pos, wip, color, is_done in default_columns:
        db.add(
            BoardColumn(
                board_id=board.id,
                name=name,
                position=pos,
                wip_limit=wip,
                color=color,
                is_done=is_done,
            )
        )

    default_labels = [
        ("Backend", "#0EA5E9"),
        ("Frontend", "#00F0FF"),
        ("IA / LLM", "#A855F7"),
        ("Segurança", "#EF4444"),
        ("Infra", "#F59E0B"),
    ]
    for label_name, label_color in default_labels:
        db.add(Label(board_id=board.id, name=label_name, color=label_color))

    db.commit()
    return _build_board_detail(_load_board_full(db, board.id))


@app.get("/api/boards/{board_id}", response_model=BoardDetailOut)
def get_board(board_id: int, db: Session = Depends(get_db)):
    board = _load_board_full(db, board_id)
    return _build_board_detail(board)


@app.patch("/api/boards/{board_id}", response_model=BoardDetailOut)
def update_board(board_id: int, payload: BoardUpdate, db: Session = Depends(get_db)):
    board = db.execute(select(Board).where(Board.id == board_id)).scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quadro não encontrado.")

    data = payload.model_dump(exclude_unset=True)
    if "prefix_key" in data and data["prefix_key"] is not None:
        new_prefix = data["prefix_key"].strip().upper()
        if new_prefix != board.prefix_key:
            exists = db.execute(
                select(Board).where(Board.prefix_key == new_prefix, Board.id != board_id)
            ).scalar_one_or_none()
            if exists:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Já existe um quadro com prefixo '{new_prefix}'.",
                )
            board.prefix_key = new_prefix

    if "name" in data and data["name"] is not None:
        board.name = data["name"].strip()
    if "description" in data:
        board.description = data["description"]

    db.commit()
    return _build_board_detail(_load_board_full(db, board.id))


@app.delete("/api/boards/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(board_id: int, db: Session = Depends(get_db)):
    board = db.execute(select(Board).where(Board.id == board_id)).scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quadro não encontrado.")
    db.delete(board)
    db.commit()


@app.get("/api/boards/{board_id}/metrics", response_model=BoardMetricsOut)
def get_board_metrics(board_id: int, db: Session = Depends(get_db)):
    board = _load_board_full(db, board_id)

    all_cards: List[Card] = []
    column_metrics: List[ColumnMetricOut] = []
    wip_alerts: List[WipAlertOut] = []
    done_cards = 0
    done_story_points = 0

    for col in sorted(board.columns, key=lambda c: c.position):
        col_cards = list(col.cards)
        all_cards.extend(col_cards)
        col_points = sum(c.story_points or 0 for c in col_cards)
        exceeded = bool(col.wip_limit and col.wip_limit > 0 and len(col_cards) > col.wip_limit)

        if col.is_done:
            done_cards += len(col_cards)
            done_story_points += col_points

        if exceeded:
            wip_alerts.append(
                WipAlertOut(
                    column_id=col.id,
                    column_name=col.name,
                    current_count=len(col_cards),
                    wip_limit=col.wip_limit or 0,
                )
            )

        column_metrics.append(
            ColumnMetricOut(
                column_id=col.id,
                name=col.name,
                color=col.color,
                card_count=len(col_cards),
                story_points=col_points,
                wip_limit=col.wip_limit,
                wip_exceeded=exceeded,
                is_done=col.is_done,
            )
        )

    total_cards = len(all_cards)
    total_story_points = sum(c.story_points or 0 for c in all_cards)
    blocked_items = [c for c in all_cards if c.is_blocked]
    completion_rate = round((done_cards / total_cards) * 100, 1) if total_cards > 0 else 0.0

    total_subtasks = sum(len(c.subtasks) for c in all_cards)
    completed_subtasks = sum(
        sum(1 for st in c.subtasks if st.is_completed) for c in all_cards
    )

    priority_counts = {"critica": 0, "alta": 0, "media": 0, "baixa": 0}
    for card in all_cards:
        if card.priority in priority_counts:
            priority_counts[card.priority] += 1

    priorities_out = [
        PriorityMetricOut(priority=p, count=priority_counts[p])
        for p in ("critica", "alta", "media", "baixa")
    ]

    return BoardMetricsOut(
        board_id=board.id,
        board_name=board.name,
        total_cards=total_cards,
        done_cards=done_cards,
        blocked_cards=len(blocked_items),
        total_story_points=total_story_points,
        done_story_points=done_story_points,
        completion_rate=completion_rate,
        total_subtasks=total_subtasks,
        completed_subtasks=completed_subtasks,
        wip_alerts=wip_alerts,
        columns=column_metrics,
        priorities=priorities_out,
        blocked_items=[CardOut.model_validate(c) for c in blocked_items],
    )


@app.patch("/api/boards/{board_id}/columns/reorder", response_model=BoardDetailOut)
def reorder_columns(board_id: int, payload: ColumnsReorder, db: Session = Depends(get_db)):
    board = _load_board_full(db, board_id)
    col_by_id = {col.id: col for col in board.columns}

    pos = 0
    seen = set()
    for cid in payload.column_ids:
        if cid in col_by_id and cid not in seen:
            col_by_id[cid].position = pos
            pos += 1
            seen.add(cid)

    # Garante posição consistente para qualquer coluna não enviada no payload
    for col in sorted(board.columns, key=lambda c: c.position):
        if col.id not in seen:
            col.position = pos
            pos += 1

    db.commit()
    return _build_board_detail(_load_board_full(db, board_id))


@app.patch("/api/columns/{column_id}", response_model=ColumnOut)
def update_column(column_id: int, payload: ColumnUpdate, db: Session = Depends(get_db)):
    col = db.execute(
        select(BoardColumn)
        .where(BoardColumn.id == column_id)
        .options(
            selectinload(BoardColumn.cards).selectinload(Card.subtasks),
            selectinload(BoardColumn.cards).selectinload(Card.labels),
        )
    ).scalar_one_or_none()
    if not col:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coluna não encontrada.")

    update_data = payload.model_dump(exclude_unset=True)
    if "wip_limit" in update_data and update_data["wip_limit"] == 0:
        update_data["wip_limit"] = None

    for key, value in update_data.items():
        setattr(col, key, value)

    db.commit()
    db.refresh(col)

    sorted_cards = sorted(col.cards, key=lambda c: (c.position, c.id))
    exceeded = bool(col.wip_limit and col.wip_limit > 0 and len(sorted_cards) > col.wip_limit)
    return ColumnOut(
        id=col.id,
        board_id=col.board_id,
        name=col.name,
        position=col.position,
        wip_limit=col.wip_limit,
        color=col.color,
        is_done=col.is_done,
        wip_exceeded=exceeded,
        cards=[CardOut.model_validate(c) for c in sorted_cards],
    )


@app.post("/api/boards/{board_id}/cards", response_model=CardOut, status_code=status.HTTP_201_CREATED)
def create_card(board_id: int, payload: CardCreate, db: Session = Depends(get_db)):
    board = db.execute(select(Board).where(Board.id == board_id)).scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quadro não encontrado.")

    column = db.execute(
        select(BoardColumn).where(
            BoardColumn.id == payload.column_id,
            BoardColumn.board_id == board_id,
        )
    ).scalar_one_or_none()
    if not column:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coluna inválida para este quadro.",
        )

    existing_count = len(
        db.execute(select(Card.id).where(Card.column_id == column.id)).scalars().all()
    )

    code = f"{board.prefix_key}-{board.next_card_number}"
    board.next_card_number += 1

    card = Card(
        board_id=board.id,
        column_id=column.id,
        code=code,
        title=payload.title.strip(),
        description=payload.description,
        priority=payload.priority,
        story_points=payload.story_points,
        position=existing_count,
        assignee=payload.assignee,
        is_blocked=payload.is_blocked,
        blocked_reason=payload.blocked_reason if payload.is_blocked else None,
    )

    if payload.label_ids:
        labels = (
            db.execute(
                select(Label).where(
                    Label.id.in_(payload.label_ids),
                    Label.board_id == board.id,
                )
            )
            .scalars()
            .all()
        )
        card.labels = list(labels)

    db.add(card)
    db.flush()

    for idx, subtask_title in enumerate(payload.subtasks):
        clean_title = subtask_title.strip()
        if clean_title:
            db.add(
                Subtask(
                    card_id=card.id,
                    title=clean_title,
                    is_completed=False,
                    position=idx,
                )
            )

    db.commit()

    created = db.execute(
        select(Card)
        .where(Card.id == card.id)
        .options(selectinload(Card.subtasks), selectinload(Card.labels))
    ).scalar_one()
    return CardOut.model_validate(created)


@app.get("/api/cards/{card_id}", response_model=CardOut)
def get_card(card_id: int, db: Session = Depends(get_db)):
    card = db.execute(
        select(Card)
        .where(Card.id == card_id)
        .options(selectinload(Card.subtasks), selectinload(Card.labels))
    ).scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card não encontrado.")
    return CardOut.model_validate(card)


@app.patch("/api/cards/{card_id}", response_model=CardOut)
def update_card(card_id: int, payload: CardUpdate, db: Session = Depends(get_db)):
    card = db.execute(
        select(Card)
        .where(Card.id == card_id)
        .options(selectinload(Card.subtasks), selectinload(Card.labels))
    ).scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card não encontrado.")

    data = payload.model_dump(exclude_unset=True)
    old_column_id = card.column_id

    if "label_ids" in data:
        label_ids = data.pop("label_ids") or []
        labels = (
            db.execute(
                select(Label).where(
                    Label.id.in_(label_ids),
                    Label.board_id == card.board_id,
                )
            )
            .scalars()
            .all()
        )
        card.labels = list(labels)

    if "column_id" in data and data["column_id"] != card.column_id:
        new_col = db.execute(
            select(BoardColumn).where(
                BoardColumn.id == data["column_id"],
                BoardColumn.board_id == card.board_id,
            )
        ).scalar_one_or_none()
        if not new_col:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coluna inválida.")
        card.column_id = new_col.id
        card.position = 99999

    for key, value in data.items():
        if key != "column_id":
            setattr(card, key, value)

    if card.is_blocked is False:
        card.blocked_reason = None

    db.flush()
    if card.column_id != old_column_id:
        _reindex_column_cards(db, old_column_id)
        _reindex_column_cards(db, card.column_id)

    db.commit()
    db.refresh(card)
    return CardOut.model_validate(card)


@app.patch("/api/cards/{card_id}/move", response_model=CardOut)
def move_card(card_id: int, payload: CardMove, db: Session = Depends(get_db)):
    card = db.execute(
        select(Card)
        .where(Card.id == card_id)
        .options(selectinload(Card.subtasks), selectinload(Card.labels))
    ).scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card não encontrado.")

    target_column = db.execute(
        select(BoardColumn).where(
            BoardColumn.id == payload.target_column_id,
            BoardColumn.board_id == card.board_id,
        )
    ).scalar_one_or_none()
    if not target_column:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coluna de destino inválida para este quadro.",
        )

    source_column_id = card.column_id

    if source_column_id == target_column.id:
        cards_in_col = (
            db.execute(
                select(Card)
                .where(Card.column_id == source_column_id)
                .order_by(Card.position, Card.id)
            )
            .scalars()
            .all()
        )
        cards_in_col = [c for c in cards_in_col if c.id != card.id]
        insert_pos = min(max(payload.new_position, 0), len(cards_in_col))
        cards_in_col.insert(insert_pos, card)
        for idx, item in enumerate(cards_in_col):
            item.position = idx
    else:
        source_cards = (
            db.execute(
                select(Card)
                .where(Card.column_id == source_column_id, Card.id != card.id)
                .order_by(Card.position, Card.id)
            )
            .scalars()
            .all()
        )
        for idx, item in enumerate(source_cards):
            item.position = idx

        target_cards = (
            db.execute(
                select(Card)
                .where(Card.column_id == target_column.id)
                .order_by(Card.position, Card.id)
            )
            .scalars()
            .all()
        )
        card.column_id = target_column.id
        insert_pos = min(max(payload.new_position, 0), len(target_cards))
        target_cards.insert(insert_pos, card)
        for idx, item in enumerate(target_cards):
            item.position = idx

    db.commit()
    db.refresh(card)
    return CardOut.model_validate(card)


@app.delete("/api/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(card_id: int, db: Session = Depends(get_db)):
    card = db.execute(select(Card).where(Card.id == card_id)).scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card não encontrado.")

    column_id = card.column_id
    db.delete(card)
    db.flush()
    _reindex_column_cards(db, column_id)
    db.commit()


@app.post("/api/cards/{card_id}/subtasks", response_model=SubtaskOut, status_code=status.HTTP_201_CREATED)
def create_subtask(card_id: int, payload: SubtaskCreate, db: Session = Depends(get_db)):
    card = db.execute(select(Card).where(Card.id == card_id)).scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card não encontrado.")

    count = len(db.execute(select(Subtask.id).where(Subtask.card_id == card_id)).scalars().all())
    subtask = Subtask(
        card_id=card_id,
        title=payload.title.strip(),
        is_completed=payload.is_completed,
        position=count,
    )
    db.add(subtask)
    db.commit()
    db.refresh(subtask)
    return SubtaskOut.model_validate(subtask)


@app.patch("/api/subtasks/{subtask_id}", response_model=SubtaskOut)
def update_subtask(subtask_id: int, payload: SubtaskUpdate, db: Session = Depends(get_db)):
    subtask = db.execute(select(Subtask).where(Subtask.id == subtask_id)).scalar_one_or_none()
    if not subtask:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtarefa não encontrada.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(subtask, key, value)

    db.commit()
    db.refresh(subtask)
    return SubtaskOut.model_validate(subtask)


@app.delete("/api/subtasks/{subtask_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subtask(subtask_id: int, db: Session = Depends(get_db)):
    subtask = db.execute(select(Subtask).where(Subtask.id == subtask_id)).scalar_one_or_none()
    if not subtask:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subtarefa não encontrada.")

    db.delete(subtask)
    db.commit()


# Fallback para servir o frontend diretamente quando executado fora do container Nginx
FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="frontend-static")

    @app.get("/", include_in_schema=False)
    def serve_index():
        return FileResponse(FRONTEND_DIR / "index.html")

    @app.get("/app.js", include_in_schema=False)
    def serve_app_js():
        return FileResponse(FRONTEND_DIR / "app.js", media_type="application/javascript")
