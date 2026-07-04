import React from 'react';

export default function CRTOverlay({ showScanlines, showGrain }) {
  return (
    <>
      {showGrain && <div className="noise-overlay" />}
      {showScanlines && (
        <>
          <div className="scanline-overlay" />
          <div className="scanline-line" />
          <div className="crt-vignette" />
        </>
      )}
    </>
  );
}
