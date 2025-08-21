import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  BookmarkBorder as BookmarkIcon,
  CloudUpload as UploadIcon,
  TrendingUp as TrendingIcon,
  School as SchoolIcon,
  Visibility as ViewIcon,
  ThumbUp as ThumbUpIcon,
  Download as DownloadIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VideoBackground from '../common/VideoBackground';
import api from '../../utils/api';
import { Resource } from '../../types';

interface DashboardStats {
  totalUploads: number;
  totalViews: number;
  totalDownloads: number;
  totalBookmarks: number;
  reputationScore: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUploads: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalBookmarks: 0,
    reputationScore: 0
  });
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's uploaded resources
        const uploadedResponse = await api.get(`/resources?author=${user?._id}&limit=5`);
        setRecentResources(uploadedResponse.data.resources || []);
        
        // Fetch bookmarked resources
        const bookmarksResponse = await api.get('/users/me/bookmarks?limit=5');
        setBookmarkedResources(bookmarksResponse.data.bookmarks || []);
        
        // Calculate stats
        const userResources = uploadedResponse.data.resources || [];
        const totalViews = userResources.reduce((sum: number, resource: Resource) => sum + resource.views, 0);
        const totalDownloads = userResources.reduce((sum: number, resource: Resource) => sum + resource.downloads, 0);
        
        setStats({
          totalUploads: userResources.length,
          totalViews,
          totalDownloads,
          totalBookmarks: bookmarksResponse.data.bookmarks?.length || 0,
          reputationScore: user?.reputation || 0
        });
        
      } catch (err: any) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const StatCard = ({ title, value, icon, color = 'primary' }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning';
  }) => (
    <Card sx={{ 
      height: '100%',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '20px',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px) scale(1.05)',
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4)',
      },
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            mr: 2,
            width: 56,
            height: 56,
          }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div" sx={{ color: 'white', fontWeight: 700 }}>
              {value}
            </Typography>
            <Typography color="rgba(255, 255, 255, 0.8)" variant="body2">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card sx={{ 
      mb: 2,
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        background: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)',
      },
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: 600 }}>
            {resource.title}
          </Typography>
          <Chip 
            label={resource.type} 
            size="small" 
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 500,
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)' }}>
          {resource.description.substring(0, 100)}...
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ViewIcon fontSize="small" sx={{ mr: 0.5, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{resource.views}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ThumbUpIcon fontSize="small" sx={{ mr: 0.5, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{resource.votes.score}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DownloadIcon fontSize="small" sx={{ mr: 0.5, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{resource.downloads}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {resource.tags.slice(0, 3).map((tag) => (
            <Chip 
              key={tag} 
              label={tag} 
              size="small" 
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          ))}
        </Stack>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => navigate(`/resources/${resource._id}`)}
          sx={{
            color: 'white',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            }
          }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <VideoBackground overlay={false}>
        <Container maxWidth="lg" sx={{ 
          pt: { xs: 11, sm: 12 }, 
          pb: { xs: 2, sm: 4 }, 
          px: { xs: 1, sm: 2 },
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Box sx={{ 
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            p: 4,
          }}>
            <CircularProgress sx={{ color: '#667eea', mb: 2 }} />
            <Typography sx={{ color: 'white' }}>Loading dashboard...</Typography>
          </Box>
        </Container>
      </VideoBackground>
    );
  }

  return (
    <VideoBackground overlay={false}>
      <Box sx={{ 
        minHeight: '100vh',
        pt: { xs: 11, sm: 12 }, // Responsive padding for mobile navbar
        pb: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 0 }
      }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            p: 3,
          }}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}>
                Welcome back, {user?.firstName}!
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Here's your activity overview and recent resources
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/upload')}
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50px',
                px: 3,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.6)',
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                },
              }}
            >
              Upload Resource
            </Button>
          </Box>

      {error && (
        <Alert severity="error" sx={{ 
          mb: 3,
          background: 'rgba(244, 67, 54, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          borderRadius: '12px',
          color: 'white',
        }}>
          {error}
        </Alert>
      )}

      {/* Stats Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(5, 1fr)' 
        }, 
        gap: 3, 
        mb: 4 
      }}>
        <StatCard
          title="Resources Uploaded"
          value={stats.totalUploads}
          icon={<UploadIcon />}
          color="primary"
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews}
          icon={<ViewIcon />}
          color="secondary"
        />
        <StatCard
          title="Downloads"
          value={stats.totalDownloads}
          icon={<DownloadIcon />}
          color="success"
        />
        <StatCard
          title="Bookmarks"
          value={stats.totalBookmarks}
          icon={<BookmarkIcon />}
          color="warning"
        />
        <StatCard
          title="Reputation"
          value={stats.reputationScore}
          icon={<TrendingIcon />}
          color="success"
        />
      </Box>

      {/* Content Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Recent Uploads */}
        <Box>
          <Box sx={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            p: 3,
            height: 'fit-content',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            },
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Your Recent Uploads</Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/resources')}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                variant="outlined"
              >
                View All
              </Button>
            </Box>
            {recentResources.length > 0 ? (
              recentResources.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <SchoolIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                  You haven't uploaded any resources yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/upload')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '25px',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    }
                  }}
                >
                  Upload Your First Resource
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        {/* Bookmarked Resources */}
        <Box>
          <Box sx={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            p: 3,
            height: 'fit-content',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            },
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Bookmarked Resources</Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/profile')}
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
                variant="outlined"
              >
                View All
              </Button>
            </Box>
            {bookmarkedResources.length > 0 ? (
              bookmarkedResources.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BookmarkIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.5)', mb: 2 }} />
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                  No bookmarked resources yet
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/resources')}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '25px',
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    }
                  }}
                >
                  Browse Resources
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ 
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        p: 3,
        mt: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.08)',
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        },
      }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate('/upload')}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Upload Resource
          </Button>
          <Button
            variant="outlined"
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/resources')}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Browse Resources
          </Button>
          <Button
            variant="outlined"
            startIcon={<CommentIcon />}
            onClick={() => navigate('/profile')}
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '25px',
              textTransform: 'none',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            View Profile
          </Button>
        </Stack>
      </Box>
        </Container>
      </Box>
    </VideoBackground>
  );
};

export default Dashboard;
