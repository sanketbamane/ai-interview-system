import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import './App.css'
import { InterviewerAvatar } from './components/InterviewerAvatar'
import type { PersonaId } from './components/InterviewerAvatar'

const API_BASE_URL = 'http://localhost:8000'

type Question = {
  id: number
  question_text: string
  sequence_order: number
  category: string
}

type SavedAnswer = {
  id: number
  session_id: number
  question_id: number
  transcript: string
}

type InterviewStatus = {
  active: boolean
  saved_answers: number
  total_questions: number
  all_answers_saved: boolean
}

const getRequestErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (!error.response) {
      return 'API is not reachable. Start the backend on http://localhost:8000.'
    }

    return `Request failed with status ${error.response.status}.`
  }

  return 'Unexpected error.'
}

function App() {
  const [candidateName, setCandidateName] = useState('')
  const [candidateId, setCandidateId] = useState<number | null>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answerText, setAnswerText] = useState('')
  const [lastTranscript, setLastTranscript] = useState('')
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([])
  const [status, setStatus] = useState<InterviewStatus | null>(null)
  const [isBusy, setIsBusy] = useState(false)
  const [isAutoRunning, setIsAutoRunning] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(true)
  const [voicePhase, setVoicePhase] = useState<'idle' | 'speaking' | 'listening' | 'saving'>(
    'idle',
  )
  const [activePersona, setActivePersona] = useState<PersonaId>('sarah')
  const [notice, setNotice] = useState('Ready to begin.')
  const [error, setError] = useState('')
  const autoStopRef = useRef(false)

  const currentQuestion = questions[currentIndex]
  const progressPercent = useMemo(() => {
    if (!questions.length) {
      return 0
    }

    return Math.round((savedAnswers.length / questions.length) * 100)
  }, [questions.length, savedAnswers.length])

  const startInterview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const name = candidateName.trim()

    if (!name) {
      setError('Candidate name is required.')
      return
    }

    setIsBusy(true)
    setError('')

    try {
      const candidateResponse = await axios.post(`${API_BASE_URL}/candidates`, {
        name,
      })
      const createdCandidateId = candidateResponse.data.id

      const [questionsResponse, sessionResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/interviews/questions`),
        axios.post(`${API_BASE_URL}/interviews/start`, {
          candidate_id: createdCandidateId,
          use_audio_assistant: false,
        }),
      ])

      setCandidateId(createdCandidateId)
      setSessionId(sessionResponse.data.session_id)
      setQuestions(questionsResponse.data)
      setCurrentIndex(0)
      setSavedAnswers([])
      setStatus(null)
      setAnswerText('')
      setLastTranscript('')
      autoStopRef.current = false
      setNotice(`Session ${sessionResponse.data.session_id} started.`)
      await refreshStatus(sessionResponse.data.session_id)

      if (isVoiceMode) {
        setTimeout(() => {
          startAutomaticVoiceFlow(sessionResponse.data.session_id, questionsResponse.data, 0)
        }, 300)
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setIsBusy(false)
    }
  }

  const refreshStatus = async (activeSessionId = sessionId) => {
    if (!activeSessionId) {
      return
    }

    const response = await axios.get(
      `${API_BASE_URL}/interviews/${activeSessionId}/status`,
    )

    setStatus(response.data)
  }

  const confirmAnswerSaved = async (
    activeSessionId: number,
    answerId: number,
  ) => {
    const response = await axios.get(
      `${API_BASE_URL}/interviews/${activeSessionId}/transcripts`,
    )

    return response.data.some((answer: SavedAnswer) => answer.id === answerId)
  }

  const submitAnswer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!sessionId || !currentQuestion) {
      return
    }

    const transcript = answerText.trim()

    if (!transcript) {
      setError('Answer text is required.')
      return
    }

    setIsBusy(true)
    setError('')

    try {
      const response = await axios.post(
        `${API_BASE_URL}/interviews/${sessionId}/answers`,
        {
          question_id: currentQuestion.id,
          transcript,
        },
      )
      const savedAnswer = response.data as SavedAnswer
      const nextIndex = currentIndex + 1

      setSavedAnswers((answers) => {
        const filtered = answers.filter((ans) => ans.question_id !== currentQuestion.id)
        return [...filtered, savedAnswer]
      })
      setAnswerText('')
      setCurrentIndex(nextIndex)
      const confirmed = await confirmAnswerSaved(sessionId, savedAnswer.id)

      setNotice(
        confirmed
          ? `Answer confirmed in DB with id ${savedAnswer.id}.`
          : `Answer returned id ${savedAnswer.id}, but DB confirmation failed.`,
      )
      await refreshStatus(sessionId)

      if (isVoiceMode && isAutoRunning && nextIndex < questions.length) {
        setTimeout(() => {
          startAutomaticVoiceFlow(sessionId, questions, nextIndex)
        }, 300)
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setIsBusy(false)
    }
  }

  const captureQuestionAnswer = async (
    activeSessionId: number,
    question: Question,
    questionIndex: number,
  ) => {
    setCurrentIndex(questionIndex)
    setAnswerText('')
    setVoicePhase('speaking')
    setNotice(`Speaking question ${question.sequence_order}.`)
    await axios.post(`${API_BASE_URL}/interviews/${activeSessionId}/speak-question`, {
      question_id: question.id,
    })

    if (autoStopRef.current) {
      setVoicePhase('idle')
      throw new Error('Interview paused')
    }

    setVoicePhase('listening')
    setNotice('Listening now. Speak naturally and pause when finished.')
    const response = await axios.post(
      `${API_BASE_URL}/interviews/${activeSessionId}/record-answer`,
      {
        question_id: question.id,
      },
    )

    setVoicePhase('saving')
    const savedAnswer = response.data as SavedAnswer
    const confirmed = await confirmAnswerSaved(activeSessionId, savedAnswer.id)

    setSavedAnswers((answers) => {
      const filtered = answers.filter((ans) => ans.question_id !== question.id)
      return [...filtered, savedAnswer]
    })
    setLastTranscript(savedAnswer.transcript)
    setAnswerText('')
    setCurrentIndex(questionIndex + 1)
    setNotice(
      confirmed
        ? `Transcribed answer confirmed in DB with id ${savedAnswer.id}.`
        : `Transcription returned id ${savedAnswer.id}, but DB confirmation failed.`,
    )
    await refreshStatus(activeSessionId)

    return savedAnswer
  }

  const startAutomaticVoiceFlow = async (
    activeSessionId: number,
    allQuestions: Question[],
    startIndex: number,
  ) => {
    if (!activeSessionId || !allQuestions.length) return
    autoStopRef.current = false
    setIsAutoRunning(true)
    setIsBusy(true)
    setError('')

    try {
      for (let index = startIndex; index < allQuestions.length; index += 1) {
        if (autoStopRef.current) {
          setNotice('Automatic interview paused.')
          break
        }
        await captureQuestionAnswer(activeSessionId, allQuestions[index], index)
      }
      if (!autoStopRef.current) {
        setNotice('Automatic interview complete. All captured answers were confirmed.')
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setVoicePhase('idle')
      setIsAutoRunning(false)
      setIsBusy(false)
    }
  }

  const captureVoiceAnswer = async () => {
    if (!sessionId || !currentQuestion) {
      return
    }

    setIsBusy(true)
    setError('')

    try {
      await captureQuestionAnswer(sessionId, currentQuestion, currentIndex)
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setVoicePhase('idle')
      setIsBusy(false)
    }
  }

  const runAutomaticInterview = async () => {
    if (!sessionId || !questions.length || isComplete) {
      return
    }
    await startAutomaticVoiceFlow(sessionId, questions, currentIndex)
  }

  const pauseAutomaticInterview = () => {
    autoStopRef.current = true
    setNotice('Will pause after the current answer is processed.')
  }

  const stopInterview = async () => {
    if (!sessionId) {
      return
    }

    autoStopRef.current = true
    setIsBusy(true)
    setError('')

    try {
      await axios.post(`${API_BASE_URL}/interviews/${sessionId}/stop`)
      await refreshStatus(sessionId)
      setNotice(`Session ${sessionId} stopped.`)
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setIsBusy(false)
    }
  }

  const skipQuestion = async () => {
    if (!sessionId || !currentQuestion) return
    setIsBusy(true)
    setError('')
    try {
      const response = await axios.post(
        `${API_BASE_URL}/interviews/${sessionId}/answers`,
        {
          question_id: currentQuestion.id,
          transcript: '[Question Skipped]',
        },
      )
      const savedAnswer = response.data as SavedAnswer
      const nextIndex = currentIndex + 1

      setSavedAnswers((prev) => {
        const filtered = prev.filter((ans) => ans.question_id !== currentQuestion.id)
        return [...filtered, savedAnswer]
      })
      setAnswerText('')
      setCurrentIndex(nextIndex)
      await refreshStatus(sessionId)
      setNotice(`Question ${currentQuestion.sequence_order} skipped.`)
      
      if (isAutoRunning) {
        setTimeout(() => {
          startAutomaticVoiceFlow(sessionId, questions, nextIndex)
        }, 100)
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError))
    } finally {
      setIsBusy(false)
    }
  }

  const isComplete = questions.length > 0 && savedAnswers.length >= questions.length

  return (
    <main className="app-shell">
      <section className="top-bar">
        <div className="branding">
          <p className="eyebrow">AI Interview System</p>
          <h1>Interview Console</h1>
        </div>
        <div className="session-summary" aria-live="polite">
          <div className="summary-detail">
            <span className="dot-indicator" style={{ backgroundColor: sessionId ? '#10b981' : '#64748b' }}></span>
            <span>{sessionId ? `Session #${sessionId}` : 'No active session'}</span>
          </div>
          <strong>{progressPercent}%</strong>
        </div>
      </section>

      <section className="workspace">
        <aside className="setup-panel">
          <form onSubmit={startInterview} className="setup-form">
            <div className="form-group">
              <label htmlFor="candidateName">Candidate Name</label>
              <input
                id="candidateName"
                value={candidateName}
                onChange={(event) => setCandidateName(event.target.value)}
                placeholder="e.g. John Doe"
                disabled={isBusy || Boolean(sessionId)}
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isVoiceMode}
                  onChange={(event) => setIsVoiceMode(event.target.checked)}
                  disabled={isBusy || Boolean(sessionId)}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">Interactive Voice Assistant Mode (Hands-free)</span>
              </label>
            </div>

            <button type="submit" className="primary-btn" disabled={isBusy || Boolean(sessionId)}>
              Start Session
            </button>
          </form>

          <div className="metric-grid">
            <div className="metric-card">
              <span>Candidate ID</span>
              <strong>{candidateId ?? '-'}</strong>
            </div>
            <div className="metric-card">
              <span>Progress</span>
              <strong>
                {savedAnswers.length}/{questions.length}
              </strong>
            </div>
            <div className="metric-card">
              <span>Session Status</span>
              <strong className={status?.all_answers_saved ? 'status-saved' : 'status-active'}>
                {status?.all_answers_saved
                  ? 'Completed'
                  : status?.active
                    ? 'Active'
                    : sessionId
                      ? 'Open'
                      : '-'}
              </strong>
            </div>
          </div>

          <div className="sidebar-footer">
            <button
              type="button"
              className="stop-btn"
              onClick={stopInterview}
              disabled={!sessionId || isComplete}
            >
              Terminate Session
            </button>
          </div>

          <div className="transcripts-log">
            <h3>Completed Answers</h3>
            {savedAnswers.length === 0 ? (
              <p className="no-transcripts">No answers saved yet.</p>
            ) : (
              <div className="transcripts-list">
                {savedAnswers.slice().reverse().map((ans) => {
                  const q = questions.find((q) => q.id === ans.question_id)
                  return (
                    <div key={ans.id} className="transcript-card">
                      <div className="transcript-card-header">
                        <span>Question {q?.sequence_order || '#'}</span>
                        <span className="badge">{q?.category || 'general'}</span>
                      </div>
                      <p className="transcript-card-text">"{ans.transcript}"</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="interview-panel">
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>

          {currentQuestion && !isComplete ? (
            <div className="answer-form">
              <div className="question-header">
                <span className="seq-badge">Question {currentQuestion.sequence_order} of {questions.length}</span>
                <span className="category-badge">{currentQuestion.category}</span>
              </div>
              
              <h2 className="question-text">{currentQuestion.question_text}</h2>

              <div className="assistant-state-box">
                <InterviewerAvatar
                  phase={voicePhase}
                  activePersona={activePersona}
                  onChangePersona={setActivePersona}
                  isAutoRunning={isAutoRunning}
                />

                <div className="voice-guidance">
                  {voicePhase === 'speaking' && <p className="guidance-text speaking">AI Assistant is speaking aloud...</p>}
                  {voicePhase === 'listening' && <p className="guidance-text listening">Listening... Speak into your microphone now.</p>}
                  {voicePhase === 'saving' && <p className="guidance-text saving">Processing audio & transcribing...</p>}
                  {voicePhase === 'idle' && (
                    <p className="guidance-text idle">
                      {isAutoRunning ? 'Initializing next question...' : 'Voice mode is paused.'}
                    </p>
                  )}
                </div>
              </div>

              <div className="voice-actions">
                {isAutoRunning ? (
                  <button
                    type="button"
                    className="pause-btn"
                    onClick={pauseAutomaticInterview}
                    disabled={isBusy}
                  >
                    Pause Auto-Flow
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={runAutomaticInterview}
                      disabled={isBusy}
                    >
                      Resume Auto-Flow
                    </button>
                    
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={captureVoiceAnswer}
                      disabled={isBusy}
                    >
                      Speak & Record Once
                    </button>

                    <button
                      type="button"
                      className="secondary-btn warn-btn"
                      onClick={skipQuestion}
                      disabled={isBusy}
                    >
                      Skip Question
                    </button>
                  </>
                )}
              </div>

              <form className="manual-fallback" onSubmit={submitAnswer}>
                <label htmlFor="answerText">Edit Transcription or Enter Manually</label>
                <textarea
                  id="answerText"
                  value={answerText}
                  onChange={(event) => setAnswerText(event.target.value)}
                  placeholder="The speech transcript will load here automatically once you speak. You can correct it or type manually."
                  disabled={isBusy}
                />
                <button type="submit" className="save-typed-btn" disabled={isBusy || !answerText.trim()}>
                  Save Text Response
                </button>
              </form>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">{isComplete ? '🎉' : '🖥️'}</div>
              <h2>{isComplete ? 'Interview Complete' : 'Welcome to AI Interview System'}</h2>
              <p>
                {isComplete
                  ? 'All questions have been answered and saved successfully.'
                  : 'Please register the candidate name to launch the interview.'}
              </p>
            </div>
          )}
        </section>
      </section>

      <section className="confirmation-panel" aria-live="polite">
        <div className="status-message">
          <span className="label">Status:</span>
          <span className="value">{notice}</span>
          {error && <p className="error-text">❌ {error}</p>}
          {lastTranscript && (
            <p className="transcript-preview">
              <span className="label">Last Answer:</span> "{lastTranscript}"
            </p>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
