import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const TestVideo: React.FC = () => {
  return (
    <Box sx={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      {/* Direct video test */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
        }}
        onLoadStart={() => console.log('Video loading started')}
        onCanPlay={() => console.log('Video can play')}
        onPlay={() => console.log('Video is playing')}
        onError={(e) => console.error('Video error:', e)}
      >
        <source src="/galaxy.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 2,
        }}
      />
      
      {/* Content */}
      <Container
        sx={{
          position: 'relative',
          zIndex: 3,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h2" sx={{ color: 'white', textAlign: 'center', mb: 2 }}>
          Video Background Test
        </Typography>
        <Typography variant="h5" sx={{ color: 'white', textAlign: 'center' }}>
          If you can see the galaxy video behind this text, it's working!
        </Typography>
      </Container>
    </Box>
  );
};

export default TestVideo;
