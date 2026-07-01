from faster_whisper import WhisperModel


class FasterWhisperEngine:
    def __init__(self):
        self.model = WhisperModel(
            "base",
            device="cpu",
            compute_type="int8",
        )

    def transcribe(
        self,
        audio_path: str,
    ) -> str:
        segments, _ = self.model.transcribe(
            audio_path,
            beam_size=5,
            vad_filter=True,
        )

        return " ".join(
            segment.text.strip()
            for segment in segments
        )