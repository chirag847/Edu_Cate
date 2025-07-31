import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <SchoolIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Share Knowledge',
      description: 'Upload and share your notes, books, projects, and study materials with fellow engineering students.',
    },
    {
      icon: <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Discover Resources',
      description: 'Find high-quality educational resources across all engineering streams and semesters.',
    },
    {
      icon: <PeopleIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Connect & Collaborate',
      description: 'Connect with students from different colleges and collaborate on engineering projects.',
    },
    {
      icon: <StarIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Quality Content',
      description: 'Upvote and downvote resources to help maintain quality and discover the best content.',
    },
  ];

  const popularCategories = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics & Communication',
    'Chemical Engineering',
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Welcome to Educate
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            The ultimate platform for engineering students to share and discover educational resources
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {!user ? (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/resources')}
                  sx={{ px: 4, py: 1.5, borderColor: 'white', '&:hover': { borderColor: 'white' } }}
                >
                  Browse Resources
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/upload')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Upload Resource
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/dashboard')}
                  sx={{ px: 4, py: 1.5, borderColor: 'white', '&:hover': { borderColor: 'white' } }}
                >
                  Go to Dashboard
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
          Why Choose Educate?
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 6 }}>
          Empowering engineering students with collaborative learning
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Card key={index} sx={{ width: { xs: '100%', sm: '45%', md: '22%' }, textAlign: 'center', p: 2 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Popular Categories */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
            Popular Engineering Streams
          </Typography>
          <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 4 }}>
            Explore resources across different engineering disciplines
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {popularCategories.map((category) => (
              <Chip
                key={category}
                label={category}
                variant="outlined"
                clickable
                onClick={() => navigate(`/resources?category=${encodeURIComponent(category)}`)}
                sx={{ fontSize: '1rem', py: 2, px: 1 }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Statistics Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', textAlign: 'center' }}>
          <Paper sx={{ p: 4, width: { xs: '100%', sm: '30%' } }}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              10K+
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Resources Shared
            </Typography>
          </Paper>
          <Paper sx={{ p: 4, width: { xs: '100%', sm: '30%' } }}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              5K+
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Active Students
            </Typography>
          </Paper>
          <Paper sx={{ p: 4, width: { xs: '100%', sm: '30%' } }}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              500+
            </Typography>
            <Typography variant="h6" color="textSecondary">
              Engineering Colleges
            </Typography>
          </Paper>
        </Box>
      </Container>

      {/* Call to Action */}
      {!user && (
        <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Ready to Start Learning?
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                Join thousands of engineering students sharing and discovering resources
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ px: 6, py: 2 }}
              >
                Join Educate Today
              </Button>
            </Box>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default Home;
