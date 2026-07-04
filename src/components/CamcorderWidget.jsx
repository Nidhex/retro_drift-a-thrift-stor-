import React, { useState, useEffect } from 'react';
import './CamcorderWidget.css';

export default function CamcorderWidget({
  showScanlines,
  setShowScanlines,
  showGrain,
  setShowGrain,
  audioPlaying,
  toggleAudio,
  flashlightActive,
  setFlashlightActive,
  mode2AM
}) {
  const [timecode, setTimecode] = useState({ h: 0, m: 4, s: 20 });
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [decibels, setDecibels] = useState([12, 8, 15, 6]);
  const [focusDistance, setFocusDistance] = useState("AUTO");
  const [exposure, setExposure] = useState(0.0);

  // Timecode recorder clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimecode((prev) => {
        let s = prev.s + 1;
        let m = prev.m;
        let h = prev.h;
        if (s >= 60) {
          s = 0;
          m += 1;
        }
        if (m >= 60) {
          m = 0;
          h += 1;
        }
        return { h, m, s };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Jittering sound bar indicators
  useEffect(() => {
    if (!audioPlaying) {
      setDecibels([2, 2, 2, 2]);
      return;
    }
    const decibelTimer = setInterval(() => {
      setDecibels([
        Math.floor(Math.random() * 22) + 2,
        Math.floor(Math.random() * 16) + 4,
        Math.floor(Math.random() * 26) + 1,
        Math.floor(Math.random() * 20) + 3
      ]);
    }, 150);

    return () => clearInterval(decibelTimer);
  }, [audioPlaying]);

  // Periodic exposure shifts
  useEffect(() => {
    const expTimer = setInterval(() => {
      setExposure((Math.random() * 0.4 - 0.2).toFixed(1));
    }, 4000);
    return () => clearInterval(expTimer);
  }, []);

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <>
      {/* Global Camera Viewfinder Corner Grid lines on the entire screen */}
      <div className="viewfinder-global-frame">
        <div className="corner-bracket top-left"></div>
        <div className="corner-bracket top-right"></div>
        <div className="corner-bracket bottom-left"></div>
        <div className="corner-bracket bottom-right"></div>
        <div className="crosshair-center">+</div>
      </div>

      <div className="camcorder-widget-container">
        <div className="cam-header">
          <div className="cam-rec-status">
            <span className="cam-rec-dot blinking"></span>
            <span>REC</span>
          </div>
          <div className="cam-battery">
            <span>{batteryLevel}%</span>
            <div className="battery-icon">
              <div className="battery-fill" style={{ width: `${batteryLevel}%` }}></div>
            </div>
          </div>
        </div>

        <div className="cam-stats">
          <div className="cam-stat-row">
            <span className="stat-label">TC</span>
            <span className="stat-val">{pad(timecode.h)}:{pad(timecode.m)}:{pad(timecode.s)}</span>
          </div>
          <div className="cam-stat-row">
            <span className="stat-label">FOCUS</span>
            <span className="stat-val" style={{ color: 'var(--color-cream)' }}>{focusDistance}</span>
          </div>
          <div className="cam-stat-row">
            <span className="stat-label">EXP</span>
            <span className="stat-val">{exposure >= 0 ? `+${exposure}` : exposure}dB</span>
          </div>
          <div className="cam-stat-row">
            <span className="stat-label">AUDIO</span>
            <div className="audio-meter">
              {decibels.map((db, idx) => (
                <div
                  key={idx}
                  className="audio-bar"
                  style={{ height: `${(db / 28) * 100}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Diagnostic Mode Indicators */}
        <div className="cam-diagnostics">
          <span>MODE: {mode2AM ? 'NIGHT_VISION' : 'STANDARD'}</span>
          <span>FPS: 29.97</span>
        </div>

        <div className="cam-controls">
          <button 
            className={`cam-btn ${showScanlines ? 'active' : ''}`}
            onClick={() => setShowScanlines(!showScanlines)}
            title="Toggle Scanlines"
          >
            CRT
          </button>
          <button 
            className={`cam-btn ${showGrain ? 'active' : ''}`}
            onClick={() => setShowGrain(!showGrain)}
            title="Toggle Film Grain"
          >
            GRAIN
          </button>
          <button 
            className={`cam-btn ${flashlightActive ? 'active' : ''}`}
            onClick={() => setFlashlightActive(!flashlightActive)}
            title="Toggle Flashlight Spotlight"
          >
            LIGHT
          </button>
        </div>
      </div>
    </>
  );
}
