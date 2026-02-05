import { useState, useEffect, useRef } from 'react';

const DEFAULT_PRESENTATION_MINUTES = 7;
const DEFAULT_QA_MINUTES = 3;

export default function Timer({ allTeamsPresented }) {
  const [phase, setPhase] = useState('presentation');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [inputMinutes, setInputMinutes] = useState(DEFAULT_PRESENTATION_MINUTES);
  const intervalRef = useRef(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const startTimer = (minutes, timerPhase) => {
    const totalSeconds = Math.floor(minutes * 60);
    setSecondsLeft(totalSeconds);
    setPhase(timerPhase);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetToCurrentPhase = () => {
    stopTimer();
    if (phase === 'presentation') {
      setInputMinutes(DEFAULT_PRESENTATION_MINUTES);
    } else {
      setInputMinutes(DEFAULT_QA_MINUTES);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            
            if (phase === 'presentation') {
              setPhase('qa');
              setInputMinutes(DEFAULT_QA_MINUTES);
              return 0;
            } else {
              setPhase('done');
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, phase]);

  const handleStartReset = () => {
    if (isRunning) {
      resetToCurrentPhase();
    } else {
      const mins = Number(inputMinutes);
      if (!Number.isFinite(mins) || mins <= 0) {
        alert('Please enter valid minutes');
        return;
      }
      startTimer(mins, phase);
    }
  };

  const isWarning = phase === 'presentation' && secondsLeft <= 120 && isRunning;
  const isStartDisabled = (!isRunning && allTeamsPresented) || phase === 'done';

  return (
    <section className="card">
      <h2 className="card-title">Dual-Phase Timer</h2>
      
      <div className="card-content timer">
        <div className="timer-mode">
          Current Event: <strong id="timer-mode">
            {phase === 'presentation' ? 'Presentation' : phase === 'qa' ? 'Q&A' : 'Done!'}
          </strong>
          {phase === 'presentation' && isRunning && (
            <div className="timer-next-event">Next Event: Q&A</div>
          )}
        </div>

        <div className="timer-input">
          {!isRunning ? (
            <>
              <input
                className="input"
                type="number"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                min="1"
              />
              <span className="timer-unit">Minutes</span>
            </>
          ) : (
            <span className={`timer-countdown ${isWarning ? 'alert' : ''}`}>
              {formatTime(secondsLeft)}
            </span>
          )}
        </div>

        <button
          className="btn"
          type="button"
          onClick={handleStartReset}
          disabled={isStartDisabled}
        >
          {isRunning ? 'Reset' : 'Start'}
        </button>
      </div>
    </section>
  );
}

// Export reset function for use by parent component
export { DEFAULT_PRESENTATION_MINUTES };
