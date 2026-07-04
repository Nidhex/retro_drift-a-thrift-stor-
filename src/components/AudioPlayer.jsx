import React, { useState, useEffect, useRef } from 'react';
import './AudioPlayer.css';

export default function AudioPlayer({ isPlaying, setIsPlaying, mode2AM }) {
  const audioCtxRef = useRef(null);
  
  // Schedulers and synthesizers refs
  const schedulerRef = useRef(null);
  const rainNodeRef = useRef(null);
  const rainFilterRef = useRef(null);
  const rainGainRef = useRef(null);
  const thunderIntervalRef = useRef(null);

  const nextNoteTimeRef = useRef(0.0);
  const currentBeatRef = useRef(0);
  
  const tempo = 76; // slower, chill lofi tempo for the immersive update
  const secondsPerBeat = 60.0 / tempo;
  const scheduleAheadTime = 0.1;
  const lookahead = 25.0;

  // Sound Synthesizer: 2AM Ambient Rain (bandpass filtered white noise)
  const startRainSynth = (ctx) => {
    try {
      if (rainNodeRef.current) return;

      const bufferSize = ctx.sampleRate * 2.0; // 2 seconds of noise loop
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.value = 1.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, ctx.currentTime); // subtle background rain

      // Slowly sweep filter frequency to simulate rain swell waves
      const sweep = () => {
        if (!rainNodeRef.current) return;
        const targetFreq = Math.random() * 600 + 500;
        const targetGain = Math.random() * 0.05 + 0.05;
        filter.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 3.0);
        gain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 3.0);
        setTimeout(sweep, 3000);
      };

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      
      rainNodeRef.current = noise;
      rainFilterRef.current = filter;
      rainGainRef.current = gain;
      
      sweep();
    } catch (e) {
      console.warn("Rain synthesizer failed:", e);
    }
  };

  const stopRainSynth = () => {
    if (rainNodeRef.current) {
      try {
        rainNodeRef.current.stop();
      } catch (e) {}
      rainNodeRef.current = null;
    }
  };

  // Sound Synthesizer: Occasional Thunder rumble
  const triggerThunderSynth = (ctx) => {
    try {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      // Very low frequency rumble
      osc.frequency.setValueAtTime(25, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(5, ctx.currentTime + 6.0);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(45, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      // Fade in quickly, then long rumble fade out
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 7.0);
    } catch (e) {
      console.warn("Thunder synthesizer failed:", e);
    }
  };

  // Sequencer beat synths: Kick
  const playKick = (time, ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.35);
    
    gain.gain.setValueAtTime(0.42, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
    
    osc.start(time);
    osc.stop(time + 0.35);
  };

  // Sequencer beat synths: Soft Hi-Hats
  const playHihat = (time, ctx) => {
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(time);
    noise.stop(time + 0.04);
  };

  // Chord pad sequencer (Minor 7th and Minor 9th chords for 2AM cyber vibes)
  const playChords = (time, ctx, step) => {
    // Am9 [A3, C4, E4, G4, B4] vs Dm9 [D3, F3, A3, C4, E4]
    let freqs = [220.00, 261.63, 329.63, 392.00, 493.88]; // Am9
    if (Math.floor(step / 8) % 2 === 1) {
      freqs = [146.83, 174.61, 220.00, 261.63, 329.63]; // Dm9
    }

    if (step % 8 !== 0) return;

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, time);
      filter.frequency.exponentialRampToValueAtTime(220, time + 2.8);
      
      gain.gain.setValueAtTime(0.06, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 2.8);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 3.0);
    });
  };

  const scheduleNextBeat = (beatNumber, time, ctx) => {
    // 8-step Grid
    if (beatNumber === 0 || beatNumber === 4 || beatNumber === 7) {
      playKick(time, ctx);
    }
    // Snare slap on 2, 6, and a micro sweep on 6.5
    if (beatNumber === 2 || beatNumber === 6) {
      playHihat(time, ctx);
      
      // Crackle snare
      const snareOsc = ctx.createOscillator();
      const snareGain = ctx.createGain();
      snareOsc.type = 'triangle';
      snareOsc.frequency.setValueAtTime(160, time);
      snareOsc.frequency.exponentialRampToValueAtTime(10, time + 0.15);
      
      snareGain.gain.setValueAtTime(0.1, time);
      snareGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      
      snareOsc.connect(snareGain);
      snareGain.connect(ctx.destination);
      snareOsc.start(time);
      snareOsc.stop(time + 0.15);
    }
    
    if (beatNumber % 2 === 1) {
      playHihat(time, ctx);
    }
    
    playChords(time, ctx, beatNumber);
  };

  const scheduler = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      scheduleNextBeat(currentBeatRef.current, nextNoteTimeRef.current, ctx);
      nextNoteTimeRef.current += secondsPerBeat / 2;
      currentBeatRef.current = (currentBeatRef.current + 1) % 16;
    }
    
    schedulerRef.current = setTimeout(scheduler, lookahead);
  };

  useEffect(() => {
    if (isPlaying) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      nextNoteTimeRef.current = ctx.currentTime + 0.05;
      scheduler();

      // Synthesize weather loops (Rain & Thunder) if 2AM/Night Mode is enabled
      if (mode2AM) {
        startRainSynth(ctx);
        thunderIntervalRef.current = setInterval(() => {
          triggerThunderSynth(ctx);
        }, 25000); // thunder every 25s — infrequent, surprising
      }
    } else {
      if (schedulerRef.current) {
        clearTimeout(schedulerRef.current);
      }
      if (thunderIntervalRef.current) {
        clearInterval(thunderIntervalRef.current);
      }
      stopRainSynth();
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
    }

    return () => {
      if (schedulerRef.current) {
        clearTimeout(schedulerRef.current);
      }
      if (thunderIntervalRef.current) {
        clearInterval(thunderIntervalRef.current);
      }
      stopRainSynth();
    };
  }, [isPlaying, mode2AM]);

  return (
    <div className="audio-deck-widget">
      <div className="deck-body">
        <div className="tape-window">
          <svg className={`tape-reel ${isPlaying ? 'reels-spinning' : ''}`} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#1c1c1f" stroke="#444" strokeWidth="4" />
            <circle cx="50" cy="50" r="15" fill="#000" />
            <path d="M 50 5 L 50 35 M 50 65 L 50 95 M 5 50 L 35 50 M 65 50 L 95 50" stroke="#f5f3ef" strokeWidth="3" />
          </svg>
          
          <div className="tape-label">
            <span className="tape-label-text">{mode2AM ? 'TAPE_02 // RAIN_MODE' : 'TAPE_01 // LO-FI'}</span>
            <div className="tape-meter">
              <div className={`tape-meter-needle ${isPlaying ? 'needle-active' : ''}`}></div>
            </div>
            {mode2AM && <span className="tape-ambient-alert">☔ AMBIENT_ON</span>}
          </div>

          <svg className={`tape-reel ${isPlaying ? 'reels-spinning' : ''}`} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#1c1c1f" stroke="#444" strokeWidth="4" />
            <circle cx="50" cy="50" r="15" fill="#000" />
            <path d="M 50 5 L 50 35 M 50 65 L 50 95 M 5 50 L 35 50 M 65 50 L 95 50" stroke="#f5f3ef" strokeWidth="3" />
          </svg>
        </div>

        <button 
          className="deck-play-btn" 
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? "Pause Tape" : "Play Tape"}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <rect x="4" y="4" width="6" height="16" />
              <rect x="14" y="4" width="6" height="16" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
