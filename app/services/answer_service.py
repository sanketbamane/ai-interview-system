from sqlalchemy.orm import Session

from app.models.interview_answer import (
    InterviewAnswer,
)


class AnswerService:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def store_answer(
        self,
        session_id: int,
        question_id: int,
        transcript: str,
        audio_path: str | None = None,
    ):
        import wave
        duration_seconds = 0.0
        saved_audio_path = audio_path or ""

        if saved_audio_path:
            try:
                with wave.open(saved_audio_path, "rb") as wf:
                    duration_seconds = wf.getnframes() / float(wf.getframerate())
            except Exception:
                pass

        answer = InterviewAnswer(
            session_id=session_id,
            question_id=question_id,
            transcript=transcript,
            audio_path=saved_audio_path,
            duration_seconds=duration_seconds,
        )

        self.db.add(answer)

        self.db.commit()

        self.db.refresh(answer)

        return answer
