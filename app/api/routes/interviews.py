import threading
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.db.session import SessionLocal

from app.models.interview_session import (
    InterviewSession,
)

from app.models.interview_answer import (
    InterviewAnswer,
)

from app.models.interview_question import (
    InterviewQuestion,
)

from app.schemas.interview import (
    InterviewAnswerCreate,
    InterviewAnswerResponse,
    InterviewQuestionResponse,
    StartInterviewRequest,
    VoiceAnswerCreate,
)

from app.services.answer_service import (
    AnswerService,
)

from app.services.tts_service import (
    TTSService,
)

from app.audio.recorder import (
    AudioRecorder,
)

from app.transcription.groq_engine import (
    GroqTranscriptionEngine,
)

from app.services.interview_orchestrator import (
    InterviewOrchestrator,
)

router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def run_interview_in_background(session_id: int):
    db = SessionLocal()
    try:
        orchestrator = InterviewOrchestrator(db)
        orchestrator.run_interview_sync(session_id)
    except Exception as e:
        print(f"Error during background interview execution: {e}")
    finally:
        db.close()


@router.post("/start")
async def start_interview(
    payload: StartInterviewRequest,
    db: Session = Depends(get_db),
):
    session = InterviewSession(
        candidate_id=payload.candidate_id,
        started_at=datetime.utcnow(),
        active=True,
    )

    db.add(session)

    db.commit()

    db.refresh(session)

    if payload.use_audio_assistant:
        thread = threading.Thread(
            target=run_interview_in_background,
            args=(session.id,),
            daemon=True,
        )

        thread.start()

    return {
        "session_id": session.id,
        "status": "started",
        "mode": "audio" if payload.use_audio_assistant else "manual",
    }


@router.get(
    "/questions",
    response_model=list[InterviewQuestionResponse],
)
async def get_questions(
    db: Session = Depends(get_db),
):
    return (
        db.query(
            InterviewQuestion,
        )
        .order_by(
            InterviewQuestion.sequence_order
        )
        .all()
    )


@router.get("/{session_id}/status")
async def get_interview_status(
    session_id: int,
    db: Session = Depends(get_db),
):
    session = db.get(
        InterviewSession,
        session_id,
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    total_questions = (
        db.query(
            InterviewQuestion,
        )
        .count()
    )

    saved_answers = (
        db.query(
            InterviewAnswer,
        )
        .filter(
            InterviewAnswer.session_id
            == session_id
        )
        .count()
    )

    return {
        "session_id": session.id,
        "active": session.active,
        "started_at": session.started_at,
        "ended_at": session.ended_at,
        "saved_answers": saved_answers,
        "total_questions": total_questions,
        "all_answers_saved": saved_answers >= total_questions
        and total_questions > 0,
    }


@router.post(
    "/{session_id}/answers",
    response_model=InterviewAnswerResponse,
)
async def submit_answer(
    session_id: int,
    payload: InterviewAnswerCreate,
    db: Session = Depends(get_db),
):
    session = db.get(
        InterviewSession,
        session_id,
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    question = db.get(
        InterviewQuestion,
        payload.question_id,
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    transcript = payload.transcript.strip()

    if not transcript:
        raise HTTPException(
            status_code=400,
            detail="Answer transcript is required",
        )

    answer = AnswerService(db).store_answer(
        session_id=session_id,
        question_id=payload.question_id,
        transcript=transcript,
        audio_path=payload.audio_path,
    )

    total_questions = (
        db.query(
            InterviewQuestion,
        )
        .count()
    )

    saved_answers = (
        db.query(
            InterviewAnswer,
        )
        .filter(
            InterviewAnswer.session_id
            == session_id
        )
        .count()
    )

    if saved_answers >= total_questions and total_questions > 0:
        session.active = False
        session.ended_at = datetime.utcnow()
        db.commit()

    return answer


@router.post("/{session_id}/speak-question")
async def speak_question(
    session_id: int,
    payload: VoiceAnswerCreate,
    db: Session = Depends(get_db),
):
    session = db.get(
        InterviewSession,
        session_id,
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    question = db.get(
        InterviewQuestion,
        payload.question_id,
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    TTSService().speak(
        question.question_text,
    )

    return {
        "status": "spoken",
        "question_id": question.id,
    }


@router.post(
    "/{session_id}/record-answer",
    response_model=InterviewAnswerResponse,
)
async def record_answer(
    session_id: int,
    payload: VoiceAnswerCreate,
    db: Session = Depends(get_db),
):
    session = db.get(
        InterviewSession,
        session_id,
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    question = db.get(
        InterviewQuestion,
        payload.question_id,
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found",
        )

    try:
        audio_path = AudioRecorder().record_answer()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Microphone recording failed: {exc}",
        ) from exc

    try:
        transcript = GroqTranscriptionEngine().transcribe(
            audio_path,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {exc}",
        ) from exc

    if not transcript.strip():
        raise HTTPException(
            status_code=400,
            detail="No speech was transcribed",
        )

    answer = AnswerService(db).store_answer(
        session_id=session_id,
        question_id=payload.question_id,
        transcript=transcript.strip(),
        audio_path=audio_path,
    )

    total_questions = (
        db.query(
            InterviewQuestion,
        )
        .count()
    )

    saved_answers = (
        db.query(
            InterviewAnswer,
        )
        .filter(
            InterviewAnswer.session_id
            == session_id
        )
        .count()
    )

    if saved_answers >= total_questions and total_questions > 0:
        session.active = False
        session.ended_at = datetime.utcnow()
        db.commit()

    return answer


@router.post("/{session_id}/stop")
async def stop_interview(
    session_id: int,
    db: Session = Depends(get_db),
):
    session = db.get(
        InterviewSession,
        session_id,
    )

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    session.active = False

    session.ended_at = datetime.utcnow()

    db.commit()

    return {
        "status": "stopped",
    }


@router.get("/{session_id}/transcripts")
async def get_transcripts(
    session_id: int,
    db: Session = Depends(get_db),
):
    transcripts = (
        db.query(
            InterviewAnswer,
        )
        .filter(
            InterviewAnswer.session_id
            == session_id
        )
        .order_by(
            InterviewAnswer.id
        )
        .all()
    )

    return transcripts
