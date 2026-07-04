import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import VhsLoader from './components/VhsLoader';
import CRTOverlay from './components/CRTOverlay';
import CamcorderWidget from './components/CamcorderWidget';
import AudioPlayer from './components/AudioPlayer';
import Ticker from './components/Ticker';
import ProductSection from './components/ProductSection';
import EditorialCollage from './components/EditorialCollage';
import FlashlightCursor from './components/FlashlightCursor';

import hoodieImg from './assets/hoodie.png';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showScanlines, setShowScanlines] = useState(true);
  const [showGrain, setShowGrain] = useState(true);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [flashlightActive, setFlashlightActive] = useState(false);

  const [mode2AM, setMode2AM] = useState(false);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [driftDistortion, setDriftDistortion] = useState(false);
  const [alertText, setAlertText] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const keyBufferRef = useRef('');
  const keyTimeoutRef = useRef(null);

  // Rolling drop countdown
  const [countdown, setCountdown] = useState({ d: 2, h: 14, m: 22, s: 45 });

  // Synthesize a subtle UI beep
  const playTypeBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.008, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {}
  };

  // Easter egg activation sound — short zap
  const playAlarmZap = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  };

  // Countdown tick
  useEffect(() => {
    const clock = setInterval(() => {
      setCountdown(prev => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        if (d < 0) { d = h = m = s = 0; clearInterval(clock); }
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Time-based theme
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 22 || hr < 5) setMode2AM(true);
  }, []);

  // Global keyboard easter eggs
  useEffect(() => {
    if (loading) return;

    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      playTypeBeep();

      if (keyTimeoutRef.current) clearTimeout(keyTimeoutRef.current);
      keyBufferRef.current = (keyBufferRef.current + e.key.toUpperCase()).slice(-15);

      if (keyBufferRef.current.includes('2AM')) {
        setMode2AM(p => !p);
        playAlarmZap();
        triggerAlert('2AM_MODE_TOGGLED');
        keyBufferRef.current = '';
      } else if (keyBufferRef.current.includes('ARCHIVE')) {
        setSecretUnlocked(true);
        playAlarmZap();
        triggerAlert('SECRET_VAULT_UNLOCKED');
        keyBufferRef.current = '';
      } else if (keyBufferRef.current.includes('DRIFT')) {
        setDriftDistortion(p => !p);
        playAlarmZap();
        triggerAlert('DRIFT_WARP_TOGGLED');
        keyBufferRef.current = '';
      }

      keyTimeoutRef.current = setTimeout(() => { keyBufferRef.current = ''; }, 2500);
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      if (keyTimeoutRef.current) clearTimeout(keyTimeoutRef.current);
    };
  }, [loading]);

  const triggerAlert = (msg) => {
    setAlertText(msg);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3500);
  };

  const handleEnterArchive = () => {
    setLoading(false);
    setAudioPlaying(true);
  };

  const pad = (n) => String(n).padStart(2, '0');

  if (loading) {
    return (
      <>
        <CRTOverlay showScanlines={showScanlines} showGrain={showGrain} />
        <VhsLoader onEnter={handleEnterArchive} />
      </>
    );
  }

  return (
    <div className={`app-root ${mode2AM ? 'theme-2am' : 'theme-day'} ${driftDistortion ? 'drift-warp' : ''}`}>

      <CRTOverlay showScanlines={showScanlines} showGrain={showGrain} />

      <FlashlightCursor active={flashlightActive} mode2AM={mode2AM} />

      <CamcorderWidget
        showScanlines={showScanlines}
        setShowScanlines={setShowScanlines}
        showGrain={showGrain}
        setShowGrain={setShowGrain}
        audioPlaying={audioPlaying}
        toggleAudio={() => setAudioPlaying(p => !p)}
        flashlightActive={flashlightActive}
        setFlashlightActive={setFlashlightActive}
        mode2AM={mode2AM}
      />

      <AudioPlayer isPlaying={audioPlaying} setIsPlaying={setAudioPlaying} mode2AM={mode2AM} />

      {/* Easter egg toast */}
      {showAlert && (
        <div className="easter-toast" role="alert">
          <span className="toast-label">// SYSTEM_EVENT</span>
          <span className="toast-msg">{alertText}</span>
        </div>
      )}

      {/* ── TOP NAV ── */}
      <header className="site-header">
        <div className="header-logo">
          <span className="logo-wordmark glitch-text" data-text="RETRO_DRIFT">RETRO_DRIFT</span>
          <span className={`live-badge ${mode2AM ? 'badge-red' : ''}`}>
            {mode2AM ? '2AM' : 'LIVE'}
          </span>
        </div>
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#hero"    className="nav-link">HOME</a>
          <a href="#collage" className="nav-link">LOOKBOOK</a>
          <a href="#archive" className="nav-link">ARCHIVE</a>
        </nav>
        <div className="header-hint" aria-hidden="true">
          TYPE <span className="hint-key">'ARCHIVE'</span> TO UNLOCK SECRETS
        </div>
      </header>

      <main className="content-root">

        {/* ── HERO ── */}
        <section className="hero-section" id="hero">
          <div className="hero-grid">
            <div className="hero-text">
              <p className="hero-eyebrow">
                {mode2AM ? '⚠ 2AM CRITICAL // LOST MEDIA DETECTED' : 'WARNING — 1 OF 1 ARCHIVE PIECES ONLY'}
              </p>
              <h1 className="hero-heading">
                UNDER<span className="heading-stroke">GROUND</span><br/>
                STREET<br/>
                WEAR
              </h1>
              <p className="hero-body">
                A digital thrift vault — rare Y2K, Japanese streetwear, 
                distressed garments. No restocks. No copies. Once it's gone, it's archived.
              </p>
              <div className="kbd-hint">
                <span className="kbd-key">TYPE</span>
                <code className="kbd-code">'2AM'</code>
                <code className="kbd-code">'ARCHIVE'</code>
                <code className="kbd-code">'DRIFT'</code>
                <span className="kbd-sub">to decrypt the vault</span>
              </div>
              <div className="hero-ctas">
                <a href="#archive" className="btn-cyber btn-cyber-green">[ ENTER VAULT ]</a>
                <a href="#collage" className="btn-cyber">[ VIEW LOOKBOOK ]</a>
              </div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="hero-polaroid">
                <img src={hoodieImg} alt="Stüssy Archive — XL" />
                <span className="hero-polaroid-caption">STÜSSY ARCHIVE // SZ XL</span>
                <div className="hero-polaroid-meta">FOUND: TOKYO // 2003</div>
              </div>
              <div className="hero-sticker">1&nbsp;OF&nbsp;1</div>
            </div>
          </div>
        </section>

        {/* ── COUNTDOWN ── */}
        <section className="countdown-strip" aria-label="Next drop countdown">
          <div className="countdown-inner">
            <div className="countdown-label">
              <span className="cd-dot">●</span>
              NEXT DROP
            </div>
            <div className="countdown-clock">
              {[
                { v: countdown.d, u: 'DAYS'  },
                { v: countdown.h, u: 'HRS'   },
                { v: countdown.m, u: 'MINS'  },
                { v: countdown.s, u: 'SECS', accent: true },
              ].map(({ v, u, accent }, i) => (
                <React.Fragment key={u}>
                  {i > 0 && <span className="cd-sep" aria-hidden="true">:</span>}
                  <div className={`cd-unit ${accent ? 'cd-accent' : ''}`}>
                    <span className="cd-val">{pad(v)}</span>
                    <span className="cd-lbl">{u}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <Ticker
          text="RETRO_DRIFT ARCHIVE DROP // 1-OF-1 VINTAGE GARMENTS // SOLD OUT = GONE // CURATED NOT COLLECTED // "
          speed="20s"
        />

        <div className="ripped-divider" aria-hidden="true" />

        {/* ── LOOKBOOK ── */}
        <section id="collage" className="page-section">
          <div className="section-header">
            <span className="section-tag">LIFESTYLE //</span>
            <h2 className="section-title">EDITORIAL SCRAPBOOK</h2>
          </div>
          <EditorialCollage />
        </section>

        <Ticker
          text="OUTERWEAR // TOPS // BOTTOMS // HARAJUKU // HYSTERIC GLAMOUR // OAKLEY ARCHIVE // CARHARTT // "
          speed="24s"
          reverse={true}
          color="var(--color-cyan)"
        />

        <div className="ripped-divider" aria-hidden="true" />

        {/* ── ARCHIVE ── */}
        <ProductSection secretUnlocked={secretUnlocked} />

      </main>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <h3 className="footer-logo glitch-text" data-text="RETRO_DRIFT">RETRO_DRIFT</h3>
            <p className="footer-bio">
              Curated vintage thrift vault. Y2K cyberspace and underground streetwear — hand-picked, not mass-produced.
            </p>
          </div>
          <div className="footer-sys">
            <h4 className="footer-sys-title">[SYSTEM]</h4>
            <ul className="footer-sys-list">
              <li>NODE: DRIFT_VAULT_01</li>
              <li>ENCRYPT: SSL_ACTIVE</li>
              <li>MODE: {mode2AM ? 'NIGHT_VISION' : 'STANDARD'}</li>
              <li>VAULT: {secretUnlocked ? 'UNLOCKED' : 'LOCKED'}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 RETRO_DRIFT — ALL RIGHTS ENCRYPTED</span>
          <span>MADE FOR THE UNDERGROUND</span>
        </div>
      </footer>

      {/* ── MOBILE NAV DOCK ── */}
      <nav className="mobile-dock" aria-label="Mobile navigation">
        <a href="#hero"    className="dock-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>HOME</span>
        </a>
        <a href="#collage" className="dock-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          <span>LOOKS</span>
        </a>
        <a href="#archive" className="dock-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          <span>VAULT</span>
        </a>
      </nav>
    </div>
  );
}
