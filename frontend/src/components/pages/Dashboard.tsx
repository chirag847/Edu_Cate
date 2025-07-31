import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  LinearProgress,
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
import api from '../../utils/api';
import { Resource, User } from '../../types';

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
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {resource.title}
          </Typography>
          <Chip 
            label={resource.type} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {resource.description.substring(0, 100)}...
        </Typography>
        <Stack direction="row" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ViewIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption">{resource.views}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ThumbUpIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption">{resource.votes.score}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DownloadIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="caption">{resource.downloads}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
          {resource.tags.slice(0, 3).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          onClick={() => navigate(`/resources/${resource._id}`)}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Box sx={{ p: 3 }}>
          <Typography>Loading dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your activity overview and recent resources
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/upload')}
          size="large"
        >
          Upload Resource
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
        <Box>
          <StatCard
            title="Resources Uploaded"
            value={stats.totalUploads}
            icon={<UploadIcon />}
            color="primary"
          />
        </Box>
        <Box>
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            icon={<ViewIcon />}
            color="secondary"
          />
        </Box>
        <Box>
          <StatCard
            title="Downloads"
            value={stats.totalDownloads}
            icon={<DownloadIcon />}
            color="success"
          />
        </Box>
        <Box>
          <StatCard
            title="Bookmarks"
            value={stats.totalBookmarks}
            icon={<BookmarkIcon />}
            color="warning"
          />
        </Box>
        <Box>
          <StatCard
            title="Reputation"
            value={stats.reputationScore}
            icon={<TrendingIcon />}
            color="success"
          />
        </Box>
      </Box>

      {/* Content Grid */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Recent Uploads */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Your Recent Uploads</Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/resources')}
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
                <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  You haven't uploaded any resources yet
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/upload')}
                  sx={{ mt: 2 }}
                >
                  Upload Your First Resource
                </Button>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Bookmarked Resources */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Bookmarked Resources</Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/profile')}
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
                <BookmarkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  No bookmarked resources yet
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/resources')}
                  sx={{ mt: 2 }}
                >
                  Browse Resources
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate('/upload')}
          >
            Upload Resource
          </Button>
          <Button
            variant="outlined"
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/resources')}
          >
            Browse Resources
          </Button>
          <Button
            variant="outlined"
            startIcon={<CommentIcon />}
            onClick={() => navigate('/profile')}
          >
            View Profile
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default Dashboard;
