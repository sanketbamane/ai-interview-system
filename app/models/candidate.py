from sqlalchemy import String
from sqlalchemy.orm import mapped_column, Mapped
from app.db.base import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
