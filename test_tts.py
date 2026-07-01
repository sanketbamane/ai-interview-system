import pyttsx3

engine = pyttsx3.init()

voices = engine.getProperty("voices")

print("Available Voices:")

for voice in voices:
    print(voice.id)

engine.say("Hello Sanket. This is a test interview question.")

engine.runAndWait()