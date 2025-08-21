import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

interface VideoBackgroundProps {
  children: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ 
  children, 
  overlay = true, 
  overlayOpacity = 0.1 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Force play the video
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video playback started successfully');
            setVideoLoaded(true);
          })
          .catch((error) => {
            console.error('Video play failed:', error);
            setVideoError(true);
          });
      }
    }
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: videoError ? '#0a0a0a' : 'transparent', // Fallback background
      }}
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -100,
          opacity: videoLoaded ? 1 : 0,
          transition: 'opacity 1s ease-in-out',
        }}
        onLoadedData={() => {
          console.log('Video data loaded');
          setVideoLoaded(true);
        }}
        onCanPlay={() => {
          console.log('Video can play');
        }}
        onPlaying={() => {
          console.log('Video is playing');
          setVideoLoaded(true);
        }}
        onError={(e) => {
          console.error('Video loading error:', e);
          setVideoError(true);
        }}
        onLoadStart={() => {
          console.log('Video loading started');
        }}
      >
        <source src="/galaxy.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Fallback gradient background if video fails */}
      {videoError && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            zIndex: -99,
          }}
        />
      )}

      {/* Overlay */}
      {overlay && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
            zIndex: -98,
          }}
        />
      )}

      {/* Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: 1,
            borderRadius: 1,
            fontSize: '12px',
            zIndex: 1000,
          }}
        >
          Video: {videoLoaded ? '✓ Loaded' : videoError ? '✗ Error' : '⏳ Loading'}
        </Box>
      )}
    </Box>
  );
};

export default VideoBackground;
