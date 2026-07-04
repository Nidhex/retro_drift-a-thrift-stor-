import React, { useState, useEffect } from 'react';
import './VhsLoader.css';

export default function VhsLoader({ onEnter }) {
  const [percent, setPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [bootLogs, setBootLogs] = useState([]);
  const [isRewinding, setIsRewinding] = useState(false);
  const [mode2AM, setMode2AM] = useState(false);

  // Time based checker for Night Mode
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 22 || hr < 5) {
      setMode2AM(true);
    }
  }, []);

  // Synthesize rewinding tape swoosh and lock clicks
  const playTapeIntroSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Tape Rewind Frequency Swoosh
      const oscSwoosh = audioCtx.createOscillator();
      const gainSwoosh = audioCtx.createGain();
      oscSwoosh.type = 'sawtooth';
      
      // Start low frequency, ramp up high to mimic motor acceleration
      oscSwoosh.frequency.setValueAtTime(80, audioCtx.currentTime);
      oscSwoosh.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.35);
      
      // High pass filter sweep
      const filterSwoosh = audioCtx.createBiquadFilter();
      filterSwoosh.type = 'highpass';
      filterSwoosh.frequency.setValueAtTime(300, audioCtx.currentTime);
      filterSwoosh.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.35);
      
      gainSwoosh.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gainSwoosh.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.2);
      gainSwoosh.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
      
      oscSwoosh.connect(filterSwoosh);
      filterSwoosh.connect(gainSwoosh);
      gainSwoosh.connect(audioCtx.destination);
      oscSwoosh.start();
      oscSwoosh.stop(audioCtx.currentTime + 0.45);

      // Main heavy solenoid mechanical click (Engages tape head)
      setTimeout(() => {
        const oscClick = audioCtx.createOscillator();
        const gainClick = audioCtx.createGain();
        oscClick.type = 'triangle';
        oscClick.frequency.setValueAtTime(140, audioCtx.currentTime);
        oscClick.frequency.setValueAtTime(45, audioCtx.currentTime + 0.08);
        gainClick.gain.setValueAtTime(0.7, audioCtx.currentTime);
        gainClick.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        
        oscClick.connect(gainClick);
        gainClick.connect(audioCtx.destination);
        oscClick.start();
        oscClick.stop(audioCtx.currentTime + 0.2);
      }, 350);

    } catch (e) {
      console.warn("Audio Context blocked or unsupported:", e);
    }
  };

  // Diagnostic loading logs
  useEffect(() => {
    const logs = [
      "BOOTING RETRO_DRIFT_ARCHIVE...",
      "ACCESSING VAULT FILES...",
      "STÜSSY ARCHIVE DECRYPTER ENGAGED",
      mode2AM ? "2AM_NIGHT_MODE_LOCKED_IN" : "SECURE_SYSTEM_CONNECTION_RESOLVED",
      "INJECTING VHS SYNAPSE EMULATORS...",
      "DEEP VAULT CACHE LOADED"
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setBootLogs(prev => [...prev, log]);
      }, index * 400);
    });
  }, [mode2AM]);

  // Percentage counting loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 2;
        return Math.min(prev + increment, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Visual flickers
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 1500);

    return () => clearInterval(glitchInterval);
  }, []);

  const handleEnter = () => {
    setIsRewinding(true);
    playTapeIntroSound();
    
    // Simulate high-distortion static tape flash right before entrance
    setTimeout(() => {
      onEnter();
    }, 700);
  };

  return (
    <div className={`vhs-loader-screen ${glitch ? 'screen-glitch' : ''} ${isRewinding ? 'screen-rewind-flash' : ''}`}>
      <div className="vhs-hud-top">
        <div className="rec-indicator">
          <span className="rec-dot"></span>
          <span>{isRewinding ? 'REW ◀◀' : 'PLAY ▶'}</span>
        </div>
        <div className="vhs-format">SP // 30fps</div>
      </div>

      <div className="vhs-center-text">
        <h1 className="vhs-brand glitch-text" data-text="RETRO_DRIFT">RETRO_DRIFT</h1>
        
        {/* Terminal Boot Log lines */}
        <div className="terminal-boot-logs">
          {bootLogs.map((log, idx) => (
            <div key={idx} className="boot-log-line">
              <span className="boot-prompt">&gt;</span> {log}
            </div>
          ))}
        </div>

        <div className="loader-box">
          {!isReady ? (
            <div className="loading-bar-wrapper">
              <div className="loading-bar" style={{ width: `${percent}%` }}></div>
              <div className="loading-data">
                <span>INDEXING_ARCHIVE...</span>
                <span>{percent}%</span>
              </div>
            </div>
          ) : (
            <button className={`enter-button ${isRewinding ? 'rewinding' : ''}`} onClick={handleEnter} disabled={isRewinding}>
              {isRewinding ? 'REWINDING...' : '[ ACCESS THE VAULT ]'}
            </button>
          )}
        </div>
      </div>

      <div className="vhs-hud-bottom">
        <div className="vhs-timestamp">JUN. 14, 2026</div>
        <div className="vhs-timecode">0:00:{percent < 10 ? `0${percent}` : percent}</div>
      </div>

      {/* Screen static distortion lines */}
      <div className="tracking-line"></div>
      <div className="tracking-line line-two"></div>
      {isRewinding && <div className="rewind-static-bar"></div>}
    </div>
  );
}
