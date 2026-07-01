from app.db.base import Base
from app.db.session import engine

from app.models.candidate import Candidate
from app.models.interview_session import InterviewSession
from app.models.interview_question import InterviewQuestion
from app.models.interview_answer import InterviewAnswer

Base.metadata.create_all(bind=engine)

print("Tables created")