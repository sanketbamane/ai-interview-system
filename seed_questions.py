from app.db.session import SessionLocal

from app.models.interview_question import (
    InterviewQuestion,
)

db = SessionLocal()

questions = [
    "Tell me about yourself.",
    "Explain REST APIs.",
    "What is dependency injection?",
    "Explain multithreading.",
    "What are SOLID principles?",
]

for index, text in enumerate(questions):
    q = InterviewQuestion(
        question_text=text,
        sequence_order=index + 1,
        category="general",
    )

    db.add(q)

db.commit()

print("Questions inserted")