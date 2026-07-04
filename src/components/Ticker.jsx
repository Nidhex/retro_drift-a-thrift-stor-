import React from 'react';

export default function Ticker({ text, speed = '20s', reverse = false, color = 'var(--color-green)' }) {
  const content = text || 'RETRO DRIFT ARCHIVE DROP // 1 OF 1 // SOLD OUT = GONE FOREVER // ONLY THE BEST SHIT // ';
  
  // Multiply the text to ensure it stretches beyond the viewport width for infinite marquee wrapping
  const repeatedText = Array(8).fill(content).join('');

  const style = {
    animationDuration: speed,
    animationDirection: reverse ? 'reverse' : 'normal',
  };

  const textStyle = {
    color: color
  };

  return (
    <div className="ticker-container">
      <div className="ticker-wrap" style={style}>
        <span className="ticker-text" style={textStyle}>{repeatedText}</span>
      </div>
    </div>
  );
}
