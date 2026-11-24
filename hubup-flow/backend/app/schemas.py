from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

PriorityType = Literal["critica", "alta", "media", "baixa"]
FIBONACCI_POINTS = {1, 2, 3, 5, 8, 13}


class SubtaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    is_completed: bool = False


class SubtaskCreate(SubtaskBase):
    pass


class SubtaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    is_completed: Optional[bool] = None


class SubtaskOut(SubtaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    card_id: int
    position: int


class LabelBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: str = Field(default="#00F0FF", max_length=20)


class LabelCreate(LabelBase):
    pass


class LabelOut(LabelBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    board_id: int


class CardCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    column_id: int
    description: Optional[str] = None
    priority: PriorityType = "media"
    story_points: Optional[int] = None
    assignee: Optional[str] = Field(default=None, max_length=80)
    is_blocked: bool = False
    blocked_reason: Optional[str] = None
    label_ids: List[int] = Field(default_factory=list)
    subtasks: List[str] = Field(default_factory=list)

    @field_validator("story_points")
    @classmethod
    def validate_story_points(cls, value: Optional[int]) -> Optional[int]:
        if value is not None and value not in FIBONACCI_POINTS:
            raise ValueError("Story Points deve seguir Fibonacci: 1, 2, 3, 5, 8 ou 13.")
        return value


class CardUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    column_id: Optional[int] = None
    description: Optional[str] = None
    priority: Optional[PriorityType] = None
    story_points: Optional[int] = None
    assignee: Optional[str] = Field(default=None, max_length=80)
    is_blocked: Optional[bool] = None
    blocked_reason: Optional[str] = None
    label_ids: Optional[List[int]] = None

    @field_validator("story_points")
    @classmethod
    def validate_story_points(cls, value: Optional[int]) -> Optional[int]:
        if value is not None and value not in FIBONACCI_POINTS:
            raise ValueError("Story Points deve seguir Fibonacci: 1, 2, 3, 5, 8 ou 13.")
        return value


class CardMove(BaseModel):
    target_column_id: int
    new_position: int = Field(ge=0)


class CardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    board_id: int
    column_id: int
    code: str
    title: str
    description: Optional[str] = None
    priority: PriorityType
    story_points: Optional[int] = None
    position: int
    is_blocked: bool
    blocked_reason: Optional[str] = None
    assignee: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    subtasks: List[SubtaskOut] = Field(default_factory=list)
    labels: List[LabelOut] = Field(default_factory=list)


class ColumnUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=80)
    wip_limit: Optional[int] = Field(default=None, ge=0)
    color: Optional[str] = Field(default=None, max_length=20)


class ColumnsReorder(BaseModel):
    column_ids: List[int] = Field(..., min_length=1)


class ColumnOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    board_id: int
    name: str
    position: int
    wip_limit: Optional[int] = None
    color: str
    is_done: bool
    wip_exceeded: bool = False
    cards: List[CardOut] = Field(default_factory=list)


class WipAlertOut(BaseModel):
    column_id: int
    column_name: str
    current_count: int
    wip_limit: int


class BoardSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    prefix_key: str
    description: Optional[str] = None
    card_count: int = 0
    wip_alerts_count: int = 0


class BoardCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    prefix_key: str = Field(..., min_length=2, max_length=12)
    description: Optional[str] = None


class BoardDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    prefix_key: str
    description: Optional[str] = None
    columns: List[ColumnOut] = Field(default_factory=list)
    labels: List[LabelOut] = Field(default_factory=list)
    wip_alerts: List[WipAlertOut] = Field(default_factory=list)


class ColumnMetricOut(BaseModel):
    column_id: int
    name: str
    color: str
    card_count: int
    story_points: int
    wip_limit: Optional[int] = None
    wip_exceeded: bool
    is_done: bool


class PriorityMetricOut(BaseModel):
    priority: PriorityType
    count: int


class BoardMetricsOut(BaseModel):
    board_id: int
    board_name: str
    total_cards: int
    done_cards: int
    blocked_cards: int
    total_story_points: int
    done_story_points: int
    completion_rate: float
    total_subtasks: int
    completed_subtasks: int
    wip_alerts: List[WipAlertOut] = Field(default_factory=list)
    columns: List[ColumnMetricOut] = Field(default_factory=list)
    priorities: List[PriorityMetricOut] = Field(default_factory=list)
    blocked_items: List[CardOut] = Field(default_factory=list)
