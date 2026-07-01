from groq import Groq

from app.core.config import settings


class GroqTranscriptionEngine:
    def __init__(self):
        self.client = Groq(
            api_key=settings.GROQ_API_KEY,
        )

    def transcribe(
        self,
        audio_path: str,
    ) -> str:
        with open(audio_path, "rb") as audio_file:
            response = (
                self.client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-large-v3",
                    language="en",
                    response_format="verbose_json",
                )
            )

        return response.text