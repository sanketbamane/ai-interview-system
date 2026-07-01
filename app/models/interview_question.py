from sqlalchemy import (
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import (
    mapped_column,
    Mapped,
)

from app.db.base import Base


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
    )

    question_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    sequence_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )