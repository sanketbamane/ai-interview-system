from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
)

from sqlalchemy.orm import (
    mapped_column,
    Mapped,
)

from app.db.base import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    candidate_id: Mapped[int] = mapped_column(
        ForeignKey("candidates.id"),
        index=True,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime,
    )

    ended_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
    )