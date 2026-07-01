from sqlalchemy.orm import Session
from datetime import datetime

from app.audio.recorder import (
    AudioRecorder,
)

from app.models.interview_question import (
    InterviewQuestion,
)

from app.models.interview_session import (
    InterviewSession,
)

from app.services.answer_service import (
    AnswerService,
)

from app.services.tts_service import (
    TTSService,
)

from app.transcription.groq_engine import (
    GroqTranscriptionEngine,
)

class InterviewOrchestrator:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

        self.tts = TTSService()

        self.recorder = AudioRecorder()

        self.transcriber = (
            GroqTranscriptionEngine()
        )

        self.answer_service = (
            AnswerService(db)
        )

    def run_interview_sync(
        self,
        session_id: int,
    ):
        questions = (
            self.db.query(
                InterviewQuestion,
            )
            .order_by(
                InterviewQuestion.sequence_order
            )
            .all()
        )

        print(
            f"Loaded {len(questions)} questions"
        )

        for question in questions:
            session = self.db.get(
                InterviewSession,
                session_id,
            )

            if not session or not session.active:
                print("Interview stopped")
                return

            print(
                f"Asking question: {question.question_text}"
            )

            self.tts.speak(
                question.question_text
            )

            print(
                "Listening for answer..."
            )

            audio_path = (
                self.recorder.record_until_silence()
            )

            print(
                f"Audio saved: {audio_path}"
            )

            transcript = (
                self.transcriber.transcribe(
                    audio_path
                )
            )

            print(
                f"Transcript: {transcript}"
            )

            self.answer_service.store_answer(
                session_id=session_id,
                question_id=question.id,
                transcript=transcript,
                audio_path=audio_path,
            )

        print(
            "Interview completed"
        )

        session = self.db.get(
            InterviewSession,
            session_id,
        )

        if session:
            session.active = False
            session.ended_at = datetime.utcnow()
            self.db.commit()
