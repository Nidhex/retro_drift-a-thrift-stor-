import React, { useState, useEffect } from 'react';
import './ProductSection.css';

import hoodieImg from '../assets/hoodie.png';
import cargosImg from '../assets/cargos.png';
import babyteeImg from '../assets/babytee.png';
import jacketImg from '../assets/jacket.png';

const BASE_PRODUCTS = [
  {
    id: 1,
    title: "SPIDERWEB ZIP-UP",
    price: "$78",
    size: "XL (BAGGY)",
    brand: "STÜSSY ARCHIVE",
    category: "TOPS",
    sticker: "1 OF 1",
    img: hoodieImg,
    rotate: "-2deg",
    tapeColor: "var(--color-cream)",
    year: "2003",
    found: "TOKYO",
    status: "DISCOVERED",
    sold: false
  },
  {
    id: 2,
    title: "M-65 UTILITY CARGOS",
    price: "$110",
    size: "32 (ADJUSTED)",
    brand: "90S MILITARY",
    category: "BOTTOMS",
    sticker: "GRAIL",
    img: cargosImg,
    rotate: "3deg",
    tapeColor: "var(--color-cyan)",
    year: "1997",
    found: "SEATTLE",
    status: "CURATED",
    sold: false
  },
  {
    id: 3,
    title: "TRIBAL CYBER FLY TEE",
    price: "$42",
    size: "M (FITTED)",
    brand: "HYSTERIC GLAMOUR",
    category: "TOPS",
    sticker: "RARE",
    img: babyteeImg,
    rotate: "-1.8deg",
    tapeColor: "var(--color-red)",
    year: "2001",
    found: "LONDON",
    status: "VAULT_LOCKED",
    sold: true,
    stampText: "VAULT_CLOSED"
  },
  {
    id: 4,
    title: "GRAFFITI WORKER",
    price: "$135",
    size: "L (BOXY)",
    brand: "CARHARTT REWORK",
    category: "OUTERWEAR",
    sticker: "RESTOCK",
    img: jacketImg,
    rotate: "2deg",
    tapeColor: "var(--color-cream)",
    year: "2004",
    found: "BERLIN",
    status: "DISCOVERED",
    sold: false
  },
  {
    id: 5,
    title: "OAKLEY APXS EYEWEAR",
    price: "$95",
    size: "OS (WRAP)",
    brand: "OAKLEY ARCHIVE",
    category: "OUTERWEAR",
    sticker: "SOLD",
    img: cargosImg, // fallbacks
    rotate: "-3deg",
    tapeColor: "var(--color-cyan)",
    year: "2002",
    found: "OSAKA",
    status: "LOST_MEDIA",
    sold: true,
    stampText: "SOLD_TO_THE_STREETS"
  },
  // Secret Product - Unlocked via Easter Egg code input
  {
    id: 99,
    title: "SECRET HYSTERIC KNIT",
    price: "$165",
    size: "XL (OVERSIZED)",
    brand: "HYSTERIC EXCLUSIVE",
    category: "TOPS",
    sticker: "EASTER_EGG",
    img: babyteeImg,
    rotate: "4deg",
    tapeColor: "var(--color-green)",
    year: "2000",
    found: "HARAJUKU",
    status: "DECRYPTED_MEDIA",
    sold: false,
    isSecret: true
  }
];

export default function ProductSection({ secretUnlocked }) {
  const [products, setProducts] = useState(BASE_PRODUCTS);
  const [filter, setFilter] = useState('ALL');
  const [claimingItem, setClaimingItem] = useState(null);
  const [terminalText, setTerminalText] = useState([]);
  const [terminalStep, setTerminalStep] = useState(0);
  const [cameraFlash, setCameraFlash] = useState(false);

  // Play Camera shutter snap synthetically via Web Audio API
  const playCameraSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Mirror Slap Slap
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(600, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(6000, ctx.currentTime + 0.06);
      gain1.gain.setValueAtTime(0.4, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.1);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(100, ctx.currentTime);
      osc2.frequency.setValueAtTime(35, ctx.currentTime + 0.05);
      gain2.gain.setValueAtTime(0.7, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.12);
    } catch(e) {}
  };

  // Play low frequency static buzz sound
  const playBuzzSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(35, ctx.currentTime + 0.4);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 160;

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  const filteredProducts = products.filter(p => {
    if (p.isSecret && !secretUnlocked) return false;
    if (filter === 'ALL') return true;
    return p.category === filter;
  });

  const runClaimSequence = (product) => {
    setClaimingItem(product);
    setTerminalStep(0);
    setTerminalText([
      `Initializing booking node for: ${product.title}...`,
    ]);

    const steps = [
      `Resolving lock vector [SECTOR_082]...`,
      `Validating sizing constraints: SZ ${product.size}...`,
      `Syncing terminal timestamps...`,
      `LOCK SECURED. Initiating lens capture...`
    ];

    steps.forEach((line, idx) => {
      setTimeout(() => {
        setTerminalText(prev => [...prev, line]);
        setTerminalStep(idx + 1);
        
        // Trigger camera shutter flash at step 4
        if (idx === 3) {
          playCameraSound();
          setCameraFlash(true);
          setTimeout(() => setCameraFlash(false), 250);
        }
      }, (idx + 1) * 700);
    });
  };

  const finalizePurchase = () => {
    // Stamp the purchased item as sold out dynamically!
    setProducts(prev => prev.map(p => {
      if (p.id === claimingItem.id) {
        return { ...p, sold: true, stampText: "ARCHIVED" };
      }
      return p;
    }));
    closeTerminal();
  };

  const closeTerminal = () => {
    setClaimingItem(null);
    setTerminalText([]);
  };

  return (
    <section className="products-section-container" id="archive">
      {/* Fullscreen Camera Shutter Flash Element */}
      {cameraFlash && <div className="fullscreen-shutter-flash" />}

      <div className="filter-tabs-wrapper">
        <span className="filter-title">ARCHIVE_INDEX //</span>
        <div className="filter-tabs">
          {['ALL', 'TOPS', 'BOTTOMS', 'OUTERWEAR'].map(cat => (
            <button
              key={cat}
              className={`filter-tab-btn ${filter === cat ? 'active-tab' : ''}`}
              onClick={() => setFilter(cat)}
            >
              [{cat}]
            </button>
          ))}
        </div>
        {secretUnlocked && <span className="secret-indicator-alert">☣ SECRET_VAULT_DECRYPTED</span>}
      </div>

      <div className="polaroid-grid">
        {filteredProducts.map((prod) => (
          <div 
            key={prod.id} 
            className={`polaroid-card-wrapper ${prod.sold ? 'item-sold-out' : ''}`}
            style={{ transform: `rotate(${prod.rotate})` }}
            onMouseEnter={() => {
              if (prod.sold) playBuzzSound();
            }}
          >
            <div 
              className="duct-tape" 
              style={{ 
                backgroundColor: prod.tapeColor,
                top: '-15px', 
                left: '28%',
                transform: `rotate(${prod.id % 2 === 0 ? '-5deg' : '5deg'})`
              }}
            >
              #{prod.brand.split(' ')[0]} // {prod.sticker}
            </div>

            <div className="polaroid-card">
              <div className="polaroid-image-container">
                <img 
                  src={prod.img} 
                  alt={prod.title} 
                  className="polaroid-image"
                  loading="lazy"
                />
                <div className="viewfinder-brackets">
                  <div className="bracket br-top-left"></div>
                  <div className="bracket br-top-right"></div>
                  <div className="bracket br-bottom-left"></div>
                  <div className="bracket br-bottom-right"></div>
                </div>

                {/* Polaroid stamp image filters */}
                <div className="polaroid-grain-overlay"></div>
              </div>

              {/* Distressed Red Stamped Overlay when Sold Out */}
              {prod.sold && (
                <div className="sold-out-stamp">
                  {prod.stampText || "ARCHIVED"}
                </div>
              )}

              <div className="polaroid-details">
                {/* Archive details block */}
                <div className="polaroid-archive-logs">
                  <span>FOUND: {prod.found}</span>
                  <span>YEAR: {prod.year}</span>
                  <span>STATUS: {prod.status}</span>
                </div>

                <div className="polaroid-meta">
                  <span className="brand-tag">{prod.brand}</span>
                  <span className="size-tag">SZ: {prod.size}</span>
                </div>
                
                <h3 className="polaroid-title">{prod.title}</h3>
                
                <div className="polaroid-action-row">
                  <span className="polaroid-price">{prod.price}</span>
                  {prod.sold ? (
                    <button className="btn-cyber btn-cyber-red claim-btn" disabled>
                      [ ARCHIVED ]
                    </button>
                  ) : (
                    <button 
                      className="btn-cyber btn-cyber-green claim-btn"
                      onClick={() => runClaimSequence(prod)}
                    >
                      [ CLAIM ]
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {claimingItem && (
        <div className="terminal-modal-overlay">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="term-dot dot-red"></span>
                <span className="term-dot dot-yellow"></span>
                <span className="term-dot dot-green"></span>
              </div>
              <span className="terminal-title">drift_vault_lock.sh</span>
              <button className="terminal-close" onClick={closeTerminal}>✕</button>
            </div>
            
            <div className="terminal-body">
              {terminalText.map((txt, idx) => (
                <div key={idx} className="terminal-line">
                  <span className="term-prompt">$</span> {txt}
                </div>
              ))}
              
              {terminalStep < 4 && (
                <div className="terminal-cursor">█</div>
              )}

              {terminalStep === 4 && (
                <div className="terminal-success-box">
                  <h4>SUCCESS // SECURE_LOCK_GRANTED</h4>
                  <p>TRANSACTION_KEY: RD-{Math.floor(Math.random() * 900000 + 100000)}</p>
                  <p className="claim-sub">This item is locked. Confirming will close the vault on this 1-of-1 archive file.</p>
                  <button 
                    className="btn-cyber btn-cyber-red terminal-done-btn"
                    onClick={finalizePurchase}
                  >
                    [ LOCK & CLOSE VAULT ]
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
