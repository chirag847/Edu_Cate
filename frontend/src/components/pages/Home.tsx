import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  AutoStories as AutoStoriesIcon,
  Group as GroupIcon,
  Lightbulb as LightbulbIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VideoBackground from '../common/VideoBackground';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 48, color: '#667eea' }} />,
      title: 'Quality Education',
      description: 'Access high-quality educational resources from top engineering colleges across the globe.',
    },
    {
      icon: <AutoStoriesIcon sx={{ fontSize: 48, color: '#f093fb' }} />,
      title: 'Vast Library',
      description: 'Extensive collection of notes, books, research papers, and study materials for all engineering streams.',
    },
    {
      icon: <GroupIcon sx={{ fontSize: 48, color: '#4facfe' }} />,
      title: 'Community Driven',
      description: 'Connect with students from different colleges, share knowledge, and collaborate on projects.',
    },
    {
      icon: <LightbulbIcon sx={{ fontSize: 48, color: '#fa709a' }} />,
      title: 'Innovation Hub',
      description: 'Discover innovative projects, research papers, and cutting-edge developments in engineering.',
    },
  ];

  // Engineering streams for the educational platform
  const engineeringStreams = [
    'Computer Science Engineering', 'Information Technology', 'Electronics & Communication', 
    'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
    'Chemical Engineering', 'Aerospace Engineering', 'Biomedical Engineering', 
    'Industrial Engineering', 'Petroleum Engineering', 'Mining Engineering'
  ];

  return (
    <VideoBackground overlay={false}>
      <Box sx={{ 
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(26, 32, 44, 0.1) 100%)',
        minHeight: '100vh',
      }}>
        {/* Hero Section */}
        <Container maxWidth="lg">
          <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center',
            position: 'relative',
            pt: 12, // Added padding top for navbar
          }}>
            <Grid container spacing={6} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#667eea',
                        fontWeight: 600,
                        mb: 2,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Engineering Education Platform
                    </Typography>
                    <Typography
                      variant="h1"
                      component="h1"
                      sx={{
                        fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                        fontWeight: 800,
                        color: 'white',
                        lineHeight: 1.1,
                        mb: 3,
                      }}
                    >
                      Empowering{' '}
                      <Box
                        component="span"
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                        Engineering
                      </Box>{' '}
                      Students Worldwide
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: { xs: '1rem', md: '1.2rem' },
                        lineHeight: 1.6,
                        maxWidth: '500px',
                      }}
                    >
                      Connect with students from different colleges, share notes, books, projects, and collaborate on your engineering journey.
                    </Typography>
                  </Box>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={3}
                    justifyContent="center"
                  >
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<StarIcon />}
                      onClick={() => navigate(user ? '/dashboard' : '/register')}
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        py: 1.5,
                        px: 4,
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {user ? 'Go to Dashboard' : 'Get Started'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate('/resources')}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        py: 1.5,
                        px: 4,
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#667eea',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        },
                      }}
                    >
                      Explore Resources
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Container>

        {/* Features Section */}
        <Box
          sx={{
            py: 12,
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.15) 100%)',
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                mb: 2,
              }}
            >
              Why Choose Educate?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                mb: 8,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Discover the features that make our platform the perfect choice for engineering students
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '20px',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-10px)',
                        background: 'rgba(255, 255, 255, 0.08)',
                        boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          color: 'white',
                          mb: 2,
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 1.6,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Categories Section */}
        <Box
          sx={{
            py: 12,
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.05) 100%)',
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: '2rem', md: '2.5rem' },
                fontWeight: 700,
                color: 'white',
                textAlign: 'center',
                mb: 2,
              }}
            >
              Popular Engineering Streams
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                mb: 8,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Explore resources for different engineering disciplines and find your stream
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              {engineeringStreams.map((stream, index) => (
                <Chip
                  key={index}
                  label={stream}
                  onClick={() => navigate(`/resources?stream=${encodeURIComponent(stream)}`)}
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: '1rem',
                    fontWeight: 500,
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    color: '#667eea',
                    '&:hover': {
                      background: 'rgba(102, 126, 234, 0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Box>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: 12,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            },
          }}
        >
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <Box textAlign="center">
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 700,
                  color: 'white',
                  mb: 3,
                }}
              >
                Ready to Join Our Community?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Join thousands of engineering students sharing knowledge and building the future together
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                justifyContent="center"
              >
                {!user && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    startIcon={<StarIcon />}
                    sx={{
                      px: 6,
                      py: 3,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: '50px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Get Started Now
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/resources')}
                  sx={{
                    px: 6,
                    py: 3,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '50px',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: '#667eea',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    },
                  }}
                >
                  Browse Resources
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>
      </Box>
    </VideoBackground>
  );
};

export default Home;