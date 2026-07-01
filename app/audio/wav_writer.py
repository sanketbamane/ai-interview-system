import wave
from pathlib import Path


def save_wav(
    audio_bytes: bytes,
    sample_rate: int,
    path: Path,
):
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(audio_bytes)