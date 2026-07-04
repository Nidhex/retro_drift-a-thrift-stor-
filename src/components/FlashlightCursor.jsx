import React, { useState, useEffect } from 'react';
import './FlashlightCursor.css';

export default function FlashlightCursor({ active, mode2AM }) {
  const [coords, setCoords] = useState({ x: -1000, y: -1000 });
  const [isHoveringProduct, setIsHoveringProduct] = useState(false);

  useEffect(() => {
    if (!active) return;

    const handleMouseMove = (e) => {
      setCoords({ x: e.clientX, y: e.clientY });

      // Check if mouse is hovering over a polaroid card or interactive link
      const target = e.target;
      if (target && (
        target.closest('.polaroid-card-wrapper') || 
        target.closest('.btn-cyber') ||
        target.closest('.magazine-clipping')
      )) {
        setIsHoveringProduct(true);
      } else {
        setIsHoveringProduct(false);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        setCoords({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [active]);

  if (!active) return null;

  // Flashlight radius adapts based on hover status
  const radius = isHoveringProduct ? '240px' : '150px';
  // If in 2AM mode, introduce a slight toxic cyber-green or electric red edge to the spotlight
  const glowColor = mode2AM 
    ? 'rgba(0, 255, 102, 0.05) 0%, rgba(0, 0, 0, 0) 70%' 
    : 'rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0) 70%';

  const maskStyle = {
    '--x': `${coords.x}px`,
    '--y': `${coords.y}px`,
    '--radius': radius,
    '--glow-color': glowColor,
    background: `radial-gradient(circle var(--radius) at var(--x) var(--y), var(--glow-color), rgba(8, 8, 10, 0.97) 100%)`
  };

  return (
    <div className="flashlight-overlay" style={maskStyle}>
      {/* Secret floating coordinates text that only becomes slightly visible inside the flashlight scope */}
      <div 
        className="flashlight-stats" 
        style={{ transform: `translate(${coords.x + 15}px, ${coords.y + 15}px)` }}
      >
        <span>X: {Math.round(coords.x)}</span>
        <span>Y: {Math.round(coords.y)}</span>
        {isHoveringProduct && <span className="stat-lock">// VAULT_LOCK_ON</span>}
      </div>
    </div>
  );
}
