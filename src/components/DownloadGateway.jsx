import { useState, useEffect } from 'react';
import { ShieldCheck, Zap, ShieldAlert, ArrowRight } from 'lucide-react';
import './DownloadGateway.css';

const DownloadGateway = ({ downloadUrl, directAdUrl, onComplete }) => {
  const [countdown, setCountdown] = useState(5);
  const [canDownload, setCanDownload] = useState(false);

  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setCanDownload(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleAreaClick = () => {
    if (!canDownload) {
      // While timer is running, clicking opens the ad in a new tab
      window.open(directAdUrl, '_blank');
    }
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation(); // Prevent triggering the area click
    if (canDownload) {
      window.open(downloadUrl, '_blank');
      onComplete(); // Close the gateway
    }
  };

  return (
    <div className="gateway-overlay">
      <div className="gateway-card" onClick={handleAreaClick}>
        <div className="gateway-header">
          <div className="gateway-logo">
            <span className="logo-icon">📺</span> MovieDekho
          </div>
        </div>
        
        <div className="gateway-content">
          <div className="gateway-progress-steps">
            <div className="step active"><ShieldCheck size={16} /></div>
            <div className="step-line"></div>
            <div className="step active"><Zap size={16} /></div>
            <div className="step-line"></div>
            <div className="step current"><ArrowRight size={16} /></div>
          </div>

          <h2>Please Wait...</h2>
          <p className="gateway-subtitle">Preparing your destination link...</p>

          <div className="countdown-circle">
            {canDownload ? (
              <span className="countdown-done">✓</span>
            ) : (
              <span className="countdown-number">{countdown}</span>
            )}
            {!canDownload && (
              <svg className="progress-ring" width="120" height="120">
                <circle
                  className="progress-ring__circle"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r="54"
                  cx="60"
                  cy="60"
                  style={{
                    strokeDasharray: 339.292,
                    strokeDashoffset: 339.292 - (339.292 * ((5 - countdown) / 5))
                  }}
                />
              </svg>
            )}
          </div>

          <div className="gateway-badges">
            <div className="badge-item">
              <ShieldCheck size={24} className="badge-icon success" />
              <div className="badge-text">
                <strong>Secure</strong>
                <span>Encrypted</span>
              </div>
            </div>
            <div className="badge-item">
              <Zap size={24} className="badge-icon warning" />
              <div className="badge-text">
                <strong>Fast</strong>
                <span>Quick redirect</span>
              </div>
            </div>
            <div className="badge-item">
              <ShieldAlert size={24} className="badge-icon info" />
              <div className="badge-text">
                <strong>Safe</strong>
                <span>Verified link</span>
              </div>
            </div>
          </div>

          {canDownload ? (
            <button 
              className="gateway-download-btn pulse"
              onClick={handleDownloadClick}
            >
              Get Link
            </button>
          ) : (
            <div className="gateway-footer-text">
              <span className="info-icon">ℹ️</span> You will be redirected automatically after the countdown. Click the button when it appears to proceed.
            </div>
          )}
        </div>
        
        <div className="gateway-footer-brand">
          Protected by secure link verification
        </div>
      </div>
    </div>
  );
};

export default DownloadGateway;
