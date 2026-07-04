import React from 'react';
import './EditorialCollage.css';

import hoodieImg from '../assets/hoodie.png';
import babyteeImg from '../assets/babytee.png';
import jacketImg from '../assets/jacket.png';

export default function EditorialCollage() {
  return (
    <div className="editorial-collage-container">
      <div className="collage-grid">
        
        {/* Left Column: Big distressed clipping */}
        <div className="collage-item col-main">
          <div className="duct-tape duct-tape-blue tape-overlap-top">
            ARCHIVE RELEASE // Vol 04
          </div>
          <div className="magazine-clipping">
            <img src={jacketImg} alt="Streetwear clipping" className="clipping-img" />
            <div className="clipping-overlay-text">
              <h2>DRIFT_</h2>
              <h2>SYSTEM.</h2>
            </div>
          </div>
          <div className="scrapbook-sticker sticker-overlap">
            SOLD<br/>OUT
          </div>
        </div>

        {/* Right Column: Layered snapshots */}
        <div className="collage-item col-sub">
          <div className="editorial-polaroid polaroid-tilted-right">
            <img src={hoodieImg} alt="Model fitting" />
            <div className="polaroid-caption">FIT_082 // NO REGRETS</div>
          </div>

          <div className="editorial-polaroid polaroid-tilted-left">
            <img src={babyteeImg} alt="Fitted cyber baby tee" />
            <div className="polaroid-caption">CYBER FLY TEE // PREVIEW</div>
          </div>

          <div className="editorial-manifesto">
            <h3>MANIFESTO //</h3>
            <p>
              WE DON'T DO RESTOCKS. WE DON'T DO MASS PRODUCTION. 
              EACH ITEM IS HAND-CURATED, WASHED, REWORKED, AND SOURCE-IDENTIFIED 
              FROM THE DEPTHS OF THE ARCHIVE. ONCE IT'S SOLD, IT CODES OUT FOREVER.
            </p>
            <span className="manifesto-stamp">EST. 2026</span>
          </div>
        </div>

      </div>
    </div>
  );
}
