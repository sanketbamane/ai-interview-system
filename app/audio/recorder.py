import sounddevice as sd
import numpy as np
from pathlib import Path
from datetime import datetime
import collections
from app.core.config import settings
from app.audio.vad import VoiceActivityDetector
from app.audio.wav_writer import save_wav

class AudioRecorder:
    def __init__(self):
        self.sample_rate = settings.AUDIO_SAMPLE_RATE
        self.channels = settings.AUDIO_CHANNELS
        self.frame_duration_ms = settings.FRAME_DURATION_MS
        self.silence_duration_ms = settings.SILENCE_DURATION_MS
        self.recordings_dir = Path(settings.RECORDINGS_DIR)
        
        # Calculate frame size in samples
        self.frame_size = int(self.sample_rate * self.frame_duration_ms / 1000)
        # Calculate silence threshold in frames
        self.max_silence_frames = int(self.silence_duration_ms / self.frame_duration_ms)
        
        # webrtcvad aggressiveness level (0 to 3, 3 is most aggressive at filtering noise)
        self.vad = VoiceActivityDetector(aggressiveness=3)

    def record_until_silence(self) -> str:
        self.recordings_dir.mkdir(parents=True, exist_ok=True)
        
        print("Initializing microphone...", flush=True)
        
        # Maintain a pre-buffer of ~500ms to avoid clipping the start of speech
        pre_buffer_duration_ms = 500
        pre_buffer_size = int(pre_buffer_duration_ms / self.frame_duration_ms)
        pre_buffer = collections.deque(maxlen=pre_buffer_size)
        
        audio_buffer = []
        speech_detected = False
        silence_frames_count = 0
        
        # Open an input stream with sounddevice
        # webrtcvad expects mono 16-bit signed PCM
        with sd.RawInputStream(
            samplerate=self.sample_rate,
            channels=self.channels,
            dtype='int16'
        ) as stream:
            print("Listening... Please speak.", flush=True)
            
            # Safety timeout limit (e.g., 60 seconds max recording duration)
            max_frames = int(60000 / self.frame_duration_ms)
            frame_count = 0
            
            while frame_count < max_frames:
                frame_data, overflowed = stream.read(self.frame_size)
                frame_count += 1
                
                # Check for speech in this frame
                is_speech = self.vad.is_speech(bytes(frame_data), self.sample_rate)
                
                if not speech_detected:
                    # Phase 1: Waiting for speech to begin
                    pre_buffer.append(frame_data)
                    if is_speech:
                        print("Speech detected! Recording...", flush=True)
                        speech_detected = True
                        audio_buffer.extend(pre_buffer)
                else:
                    # Phase 2: Recording speech and waiting for silence
                    audio_buffer.append(frame_data)
                    
                    if is_speech:
                        silence_frames_count = 0
                    else:
                        silence_frames_count += 1
                        
                    # Stop recording when consecutive silence frames reach the threshold
                    if silence_frames_count >= self.max_silence_frames:
                        print("Silence detected. Stopping recording.", flush=True)
                        break
        
        # Combine all frames into a single bytes object
        audio_bytes = b"".join(audio_buffer)
        
        filename = f"{datetime.utcnow().timestamp()}.wav"
        path = self.recordings_dir / filename
        
        save_wav(audio_bytes, self.sample_rate, path)
        print(f"Audio saved to: {path}", flush=True)
        
        return str(path)

    def record_answer(self) -> str:
        return self.record_until_silence()