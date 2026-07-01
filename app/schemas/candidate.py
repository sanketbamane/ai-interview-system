from pydantic import BaseModel

class CandidateCreate(BaseModel):
    name: str

class CandidateResponse(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}
