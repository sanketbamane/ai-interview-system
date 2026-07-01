from pydantic import BaseModel


class StartInterviewRequest(BaseModel):
    candidate_id: int
    use_audio_assistant: bool = True


class InterviewQuestionResponse(BaseModel):
    id: int
    question_text: str
    sequence_order: int
    category: str

    model_config = {"from_attributes": True}


class InterviewAnswerCreate(BaseModel):
    question_id: int
    transcript: str
    audio_path: str | None = None


class VoiceAnswerCreate(BaseModel):
    question_id: int


class InterviewAnswerResponse(BaseModel):
    id: int
    session_id: int
    question_id: int
    transcript: str
    audio_path: str
    duration_seconds: float

    model_config = {"from_attributes": True}
