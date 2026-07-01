from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env"
       
    )

    GROQ_API_KEY: str    

    APP_NAME: str = "AI Interview System"

    DATABASE_URL: str

    WHISPER_MODEL: str = "base"

    WHISPER_DEVICE: str = "cpu"

    WHISPER_COMPUTE_TYPE: str = "int8"

    AUDIO_SAMPLE_RATE: int = 16000

    AUDIO_CHANNELS: int = 1

    FRAME_DURATION_MS: int = 30

    SILENCE_DURATION_MS: int = 1200

    RECORDINGS_DIR: str = "recordings"


settings = Settings()