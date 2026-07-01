import pyttsx3


class TTSService:
    def __init__(self):
        self.engine = pyttsx3.init()

    def speak(
        self,
        text: str,
    ) -> None:
        self.engine.say(text)
        self.engine.runAndWait()