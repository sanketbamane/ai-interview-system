from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.candidates import (
    router as candidate_router,
)

from app.api.routes.interviews import (
    router as interview_router,
)

app = FastAPI(
    title="AI Interview System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(candidate_router)
app.include_router(interview_router)
