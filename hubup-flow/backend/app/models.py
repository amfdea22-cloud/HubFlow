from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import Boolean, Column as SAColumn, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


card_labels = Table(
    "card_labels",
    Base.metadata,
    SAColumn("card_id", ForeignKey("cards.id", ondelete="CASCADE"), primary_key=True),
    SAColumn("label_id", ForeignKey("labels.id", ondelete="CASCADE"), primary_key=True),
)


class Board(Base):
    __tablename__ = "boards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    prefix_key: Mapped[str] = mapped_column(String(12), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    next_card_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    columns: Mapped[List["BoardColumn"]] = relationship(
        "BoardColumn",
        back_populates="board",
        order_by="BoardColumn.position",
        cascade="all, delete-orphan",
    )
    cards: Mapped[List["Card"]] = relationship(
        "Card",
        back_populates="board",
        cascade="all, delete-orphan",
    )
    labels: Mapped[List["Label"]] = relationship(
        "Label",
        back_populates="board",
        order_by="Label.name",
        cascade="all, delete-orphan",
    )


class BoardColumn(Base):
    __tablename__ = "board_columns"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    board_id: Mapped[int] = mapped_column(ForeignKey("boards.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    wip_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    color: Mapped[str] = mapped_column(String(20), default="#00F0FF", nullable=False)
    is_done: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    board: Mapped["Board"] = relationship("Board", back_populates="columns")
    cards: Mapped[List["Card"]] = relationship(
        "Card",
        back_populates="column",
        order_by="Card.position",
        cascade="all, delete-orphan",
    )


class Label(Base):
    __tablename__ = "labels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    board_id: Mapped[int] = mapped_column(ForeignKey("boards.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    color: Mapped[str] = mapped_column(String(20), default="#00F0FF", nullable=False)

    board: Mapped["Board"] = relationship("Board", back_populates="labels")
    cards: Mapped[List["Card"]] = relationship("Card", secondary=card_labels, back_populates="labels")


class Card(Base):
    __tablename__ = "cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    board_id: Mapped[int] = mapped_column(ForeignKey("boards.id", ondelete="CASCADE"), nullable=False, index=True)
    column_id: Mapped[int] = mapped_column(ForeignKey("board_columns.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(24), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="media", nullable=False)
    story_points: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    blocked_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assignee: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False
    )

    board: Mapped["Board"] = relationship("Board", back_populates="cards")
    column: Mapped["BoardColumn"] = relationship("BoardColumn", back_populates="cards")
    subtasks: Mapped[List["Subtask"]] = relationship(
        "Subtask",
        back_populates="card",
        order_by="Subtask.position, Subtask.id",
        cascade="all, delete-orphan",
    )
    labels: Mapped[List["Label"]] = relationship("Label", secondary=card_labels, back_populates="cards")


class Subtask(Base):
    __tablename__ = "subtasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    card_id: Mapped[int] = mapped_column(ForeignKey("cards.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    card: Mapped["Card"] = relationship("Card", back_populates="subtasks")
