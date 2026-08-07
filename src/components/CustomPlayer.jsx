import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import './CustomPlayer.css';

const CustomPlayer = ({ src, onReady }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const defaultOptions = {
      controls: [
        'play-large', 
        'play', 
        'progress', 
        'current-time', 
        'duration',
        'mute', 
        'volume', 
        'settings', 
        'pip', 
        'airplay', 
        'fullscreen'
      ],
      settings: ['quality', 'speed'],
      autoplay: true,
      keyboard: { focused: true, global: true },
      tooltips: { controls: true, seek: true },
    };

    if (src.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxMaxBufferLength: 100,
        });
        hlsRef.current = hls;
        
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
          const availableQualities = hls.levels.map((l) => l.height);
          // Add 'Auto' (0) at the beginning
          availableQualities.unshift(0);

          defaultOptions.quality = {
            default: 0,
            options: availableQualities,
            forced: true,
            onChange: (newQuality) => {
              if (newQuality === 0) {
                hls.currentLevel = -1; // Auto
              } else {
                hls.levels.forEach((level, levelIndex) => {
                  if (level.height === newQuality) {
                    hls.currentLevel = levelIndex;
                  }
                });
              }
            },
          };

          // Initialize Plyr
          playerRef.current = new Plyr(video, defaultOptions);
          
          if (onReady) onReady(playerRef.current);
          
          // Auto play
          setTimeout(() => {
            playerRef.current?.play().catch(e => console.log('Autoplay prevented', e));
          }, 500);
        });
        
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error("fatal network error encountered, try to recover");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error("fatal media error encountered, try to recover");
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native support
        video.src = src;
        playerRef.current = new Plyr(video, defaultOptions);
        if (onReady) onReady(playerRef.current);
      }
    } else {
      // Regular MP4 or other video
      video.src = src;
      playerRef.current = new Plyr(video, defaultOptions);
      if (onReady) onReady(playerRef.current);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [src]);

  return (
    <div className="custom-player-container">
      <video ref={videoRef} className="plyr-react" crossOrigin="anonymous" playsInline></video>
    </div>
  );
};

export default CustomPlayer;
