from sqlalchemy import (
    ForeignKey,
    Text,
    String,
    Float,
)

from sqlalchemy.orm import (
    mapped_column,
    Mapped,
)

from app.db.base import Base


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    session_id: Mapped[int] = mapped_column(
        ForeignKey("interview_sessions.id"),
        index=True,
    )

    question_id: Mapped[int] = mapped_column()

    transcript: Mapped[str] = mapped_column(
        Text,
    )

    audio_path: Mapped[str] = mapped_column(
        String(1024),
    )

    duration_seconds: Mapped[float] = mapped_column(
        Float,
    )