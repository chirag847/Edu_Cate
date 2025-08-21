import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Stack,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  Star as StarIcon,
  CloudUpload as UploadIcon,
  Bookmark as BookmarkIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  ThumbUp as ThumbUpIcon,
  Email as EmailIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VideoBackground from '../common/VideoBackground';
import api from '../../utils/api';
import { User, Resource, STREAMS, YEARS } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    college: '',
    stream: '',
    year: ''
  });

  const isOwnProfile = !userId || userId === currentUser?._id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userResponse = userId && !isOwnProfile 
          ? await api.get(`/users/${userId}`)
          : { data: { user: currentUser } };
        
        if (!userResponse.data.user) {
          setError('User not found');
          setLoading(false);
          return;
        }
        
        const user = userResponse.data.user;
        setProfileUser(user);
        
        // Set edit form data if it's own profile
        if (isOwnProfile && user) {
          setEditFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            bio: user.bio || '',
            college: user.college || '',
            stream: user.stream || '',
            year: user.year || ''
          });
        }

        // Fetch user's uploaded resources
        const resourcesResponse = await api.get(`/resources?author=${user._id}&limit=20`);
        setUserResources(resourcesResponse.data.resources || []);

        // Fetch bookmarked resources if it's own profile
        if (isOwnProfile) {
          const bookmarksResponse = await api.get('/users/me/bookmarks');
          setBookmarkedResources(bookmarksResponse.data.bookmarks || []);
        }

      } catch (err: any) {
        setError('Failed to load profile data');
        console.error('Profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser || userId) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [userId, currentUser, isOwnProfile]);

  const handleEditProfile = async () => {
    try {
      setEditLoading(true);
      setError(''); // Clear any previous errors
      setSuccess(''); // Clear any previous success messages
      
      console.log('Sending profile update with data:', editFormData);
      
      const response = await api.put('/auth/profile', editFormData);
      
      console.log('Profile update response:', response.data);
      
      if (response.data.user) {
        // Update both profile user and current user context
        setProfileUser(response.data.user);
        updateUser(response.data.user);
        
        // Update form data with the response to ensure consistency
        setEditFormData({
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          bio: response.data.user.bio || '',
          college: response.data.user.college || '',
          stream: response.data.user.stream || '',
          year: response.data.user.year || ''
        });
        
        setSuccess('Profile updated successfully!');
        
        // Close dialog after a short delay to show success message
        setTimeout(() => {
          setEditDialogOpen(false);
          setSuccess('');
        }, 1500);
        
        console.log('Profile updated successfully:', response.data.user);
      } else {
        setError('Failed to update profile - invalid response');
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const openEditDialog = () => {
    // Initialize form data with current user data
    if (profileUser) {
      setEditFormData({
        firstName: profileUser.firstName || '',
        lastName: profileUser.lastName || '',
        bio: profileUser.bio || '',
        college: profileUser.college || '',
        stream: profileUser.stream || '',
        year: profileUser.year || ''
      });
    }
    setError('');
    setSuccess('');
    setEditDialogOpen(true);
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card sx={{ 
      mb: 2,
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.12)',
        transform: 'translateY(-6px) scale(1.02)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(139, 92, 246, 0.4)',
        border: '1px solid rgba(139, 92, 246, 0.5)',
      }
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'flex-start' }, 
          mb: 2,
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h6" component="div" sx={{ 
            flexGrow: 1,
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.3,
            mb: { xs: 1, sm: 0 }
          }}>
            {resource.title}
          </Typography>
          <Chip 
            label={resource.type} 
            size="small" 
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 500,
              border: 'none',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              alignSelf: { xs: 'flex-start', sm: 'center' }
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ 
          mb: 2, 
          color: 'rgba(255, 255, 255, 0.8)', 
          lineHeight: 1.6,
          fontSize: { xs: '0.8rem', sm: '0.875rem' }
        }}>
          {resource.description.substring(0, 150)}...
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={{ xs: 1, sm: 3 }} 
          sx={{ 
            mb: 2,
            alignItems: { xs: 'flex-start', sm: 'center' }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: { xs: 2, sm: 3 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ViewIcon fontSize="small" sx={{ mr: 0.5, color: 'rgba(255, 255, 255, 0.6)' }} />
              <Typography variant="caption" sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}>
                {resource.views}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ThumbUpIcon fontSize="small" sx={{ mr: 0.5, color: 'rgba(255, 255, 255, 0.6)' }} />
              <Typography variant="caption" sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}>
                {resource.votes.score}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DownloadIcon fontSize="small" sx={{ mr: 0.5, color: 'rgba(255, 255, 255, 0.6)' }} />
              <Typography variant="caption" sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}>
                {resource.downloads}
              </Typography>
            </Box>
          </Box>
        </Stack>
        <Typography variant="caption" sx={{ 
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: { xs: '0.7rem', sm: '0.75rem' }
        }}>
          {new Date(resource.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ 
        mt: { xs: 2, sm: 4 }, 
        mb: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          py: { xs: 4, sm: 8 }
        }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container maxWidth="lg" sx={{ 
        mt: { xs: 2, sm: 4 }, 
        mb: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 }
      }}>
        <Alert severity="error" sx={{
          borderRadius: '16px',
          background: 'rgba(211, 47, 47, 0.1)',
          border: '1px solid rgba(211, 47, 47, 0.3)',
          color: 'white'
        }}>
          User not found
        </Alert>
      </Container>
    );
  }

  const stats = {
    totalUploads: userResources.length,
    totalViews: userResources.reduce((sum, resource) => sum + resource.views, 0),
    totalDownloads: userResources.reduce((sum, resource) => sum + resource.downloads, 0),
    reputation: profileUser.reputation || 0
  };

  return (
    <VideoBackground overlay={false}>
      <Box sx={{ 
        minHeight: '100vh',
        pt: { xs: 10, sm: 12 },
        pb: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 0 }
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                background: 'rgba(211, 47, 47, 0.1)',
                border: '1px solid rgba(211, 47, 47, 0.3)',
                borderRadius: '16px',
                color: 'white'
              }}
            >
              {error}
            </Alert>
          )}

      {/* Profile Header */}
          <Paper sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            mb: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-2px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(139, 92, 246, 0.2)',
            },
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 3 }, 
              alignItems: { xs: 'center', sm: 'flex-start' },
              textAlign: { xs: 'center', sm: 'left' }
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: { xs: 80, sm: 100, md: 120 }, 
                    height: { xs: 80, sm: 100, md: 120 }, 
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '3px solid rgba(255, 255, 255, 0.2)'
                  }}
                  src={profileUser.profilePicture}
                >
                  {profileUser.firstName[0]}{profileUser.lastName[0]}
                </Avatar>
              </Box>
              <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: { xs: 'center', sm: 'space-between' }, 
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box>
                    <Typography variant="h4" gutterBottom sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                    }}>
                      {profileUser.firstName} {profileUser.lastName}
                      {profileUser.isVerified && (
                        <Chip 
                      icon={<StarIcon />} 
                      label="Verified" 
                      color="primary" 
                      size="small" 
                      sx={{ ml: { xs: 1, sm: 2 }, mt: { xs: 1, sm: 0 } }}
                    />
                  )}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 4 }} sx={{ mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    p: { xs: 1, sm: 1.5 },
                    minWidth: { sm: '200px' },
                    width: { xs: '100%', sm: 'auto' },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                    },
                  }}>
                    <SchoolIcon fontSize="small" sx={{ mr: 1.5, color: 'rgba(139, 92, 246, 0.8)' }} />
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
                        Stream
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                        {profileUser.stream}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    p: { xs: 1, sm: 1.5 },
                    minWidth: { sm: '150px' },
                    width: { xs: '100%', sm: 'auto' },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                    },
                  }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'rgba(139, 92, 246, 0.8)' }} />
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
                        Year
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
                        {profileUser.year}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: { xs: 'center', sm: 'flex-start' },
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    p: { xs: 1, sm: 1.5 },
                    minWidth: { sm: '220px' },
                    width: { xs: '100%', sm: 'auto' },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                    },
                  }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1.5, color: 'rgba(139, 92, 246, 0.8)' }} />
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
                        College
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)', 
                          fontWeight: 600,
                          wordBreak: { xs: 'break-word', sm: 'normal' },
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        {profileUser.college}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 2, 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    lineHeight: 1.6
                  }}
                >
                  {profileUser.bio || 'No bio available'}
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={{ xs: 1, sm: 3 }} 
                  sx={{ 
                    flexWrap: 'wrap', 
                    gap: { xs: 1, sm: 2 },
                    justifyContent: { xs: 'center', sm: 'flex-start' }
                  }}
                >
                  <Box sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    p: { xs: 1.5, sm: 2.5 },
                    textAlign: 'center',
                    minWidth: { xs: '80px', sm: '100px' },
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: '1', sm: 'none' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 12px 24px rgba(139, 92, 246, 0.3)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                    },
                  }}>
                    <Typography variant="h5" sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: { xs: '1.2rem', sm: '1.5rem' }
                    }}>
                      {stats.reputation}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontWeight: 500,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}>
                      Reputation
                    </Typography>
                  </Box>
                  <Box sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    p: { xs: 1.5, sm: 2.5 },
                    textAlign: 'center',
                    minWidth: { xs: '80px', sm: '100px' },
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: '1', sm: 'none' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 12px 24px rgba(139, 92, 246, 0.3)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                    },
                  }}>
                    <Typography variant="h5" sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: { xs: '1.2rem', sm: '1.5rem' }
                    }}>
                      {stats.totalUploads}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontWeight: 500,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}>
                      Resources
                    </Typography>
                  </Box>
                  <Box sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    p: { xs: 1.5, sm: 2.5 },
                    textAlign: 'center',
                    minWidth: { xs: '80px', sm: '100px' },
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: '1', sm: 'none' },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-4px) scale(1.02)',
                      boxShadow: '0 12px 24px rgba(139, 92, 246, 0.3)',
                      border: '1px solid rgba(139, 92, 246, 0.4)',
                    },
                  }}>
                    <Typography variant="h5" sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: { xs: '1.2rem', sm: '1.5rem' }
                    }}>
                      {stats.totalViews}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontWeight: 500,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}>
                      Total Views
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={openEditDialog}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: 600,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1, sm: 1.5 },
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    alignSelf: { xs: 'center', sm: 'flex-start' },
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: { xs: '200px', sm: 'none' },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(139, 92, 246, 0.1)',
                      borderColor: 'rgba(139, 92, 246, 0.5)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)',
                    }
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ 
        mb: 3,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 20px rgba(139, 92, 246, 0.1)',
        },
      }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          variant={isMobile ? "fullWidth" : "standard"}
          centered={!isMobile}
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 600,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              minHeight: { xs: 56, sm: 48 },
              '&.Mui-selected': {
                color: 'white',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
              }
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: '3px',
              borderRadius: '3px'
            }
          }}
        >
          <Tab 
            icon={<UploadIcon />} 
            label={`Uploads (${userResources.length})`}
            iconPosition="start"
          />
          {isOwnProfile && (
            <Tab 
              icon={<BookmarkIcon />} 
              label={`Bookmarks (${bookmarkedResources.length})`}
              iconPosition="start"
            />
          )}
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {userResources.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {userResources.map((resource) => (
              <Box>
                <ResourceCard resource={resource} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 8 } }}>
            <UploadIcon sx={{ 
              fontSize: { xs: 48, sm: 64 }, 
              color: 'text.secondary', 
              mb: 2 
            }} />
            <Typography variant="h6" gutterBottom sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}>
              No resources uploaded yet
            </Typography>
            {isOwnProfile && (
              <Button
                variant="contained"
                onClick={() => navigate('/upload')}
                sx={{ 
                  mt: 2,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  px: { xs: 2, sm: 3 }
                }}
              >
                Upload Your First Resource
              </Button>
            )}
          </Box>
        )}
      </TabPanel>

      {isOwnProfile && (
        <TabPanel value={tabValue} index={1}>
          {bookmarkedResources.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {bookmarkedResources.map((resource) => (
                <Box>
                  <ResourceCard resource={resource} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 8 } }}>
              <BookmarkIcon sx={{ 
                fontSize: { xs: 48, sm: 64 }, 
                color: 'text.secondary', 
                mb: 2 
              }} />
              <Typography variant="h6" gutterBottom sx={{ 
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}>
                No bookmarked resources yet
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/resources')}
                sx={{ 
                  mt: 2,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  px: { xs: 2, sm: 3 }
                }}
              >
                Browse Resources
              </Button>
            </Box>
          )}
        </TabPanel>
      )}

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: { xs: 0, sm: '20px' },
            color: 'white',
            margin: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' }
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontWeight: 700,
          fontSize: { xs: '1.2rem', sm: '1.5rem' },
          py: { xs: 2, sm: 3 }
        }}>
          Edit Profile
        </DialogTitle>
        <DialogContent sx={{ 
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 3 }
        }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                background: 'rgba(211, 47, 47, 0.1)',
                border: '1px solid rgba(211, 47, 47, 0.3)',
                borderRadius: '12px',
                color: 'white'
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2,
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                borderRadius: '12px',
                color: 'white'
              }}
            >
              {success}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="First Name"
              value={editFormData.firstName}
              onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8b5cf6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#8b5cf6',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Last Name"
              value={editFormData.lastName}
              onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8b5cf6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#8b5cf6',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={3}
              value={editFormData.bio}
              onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8b5cf6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#8b5cf6',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="College/University"
              value={editFormData.college}
              onChange={(e) => setEditFormData(prev => ({ ...prev, college: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8b5cf6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#8b5cf6',
                  },
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-focused': { color: '#8b5cf6' } }}>
                Stream
              </InputLabel>
              <Select
                value={editFormData.stream}
                label="Stream"
                onChange={(e) => setEditFormData(prev => ({ ...prev, stream: e.target.value }))}
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8b5cf6',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: 'rgba(20, 20, 20, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '& .MuiMenuItem-root': {
                        color: 'white',
                        '&:hover': {
                          background: 'rgba(139, 92, 246, 0.2)',
                        },
                      },
                    },
                  },
                }}
              >
                {STREAMS.map((stream) => (
                  <MenuItem key={stream} value={stream}>
                    {stream}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-focused': { color: '#8b5cf6' } }}>
                Year
              </InputLabel>
              <Select
                value={editFormData.year}
                label="Year"
                onChange={(e) => setEditFormData(prev => ({ ...prev, year: e.target.value }))}
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8b5cf6',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: 'rgba(20, 20, 20, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '& .MuiMenuItem-root': {
                        color: 'white',
                        '&:hover': {
                          background: 'rgba(139, 92, 246, 0.2)',
                        },
                      },
                    },
                  },
                }}
              >
                {YEARS.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 }, 
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'stretch'
        }}>
          <Button 
            onClick={() => setEditDialogOpen(false)}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              order: { xs: 2, sm: 1 },
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditProfile}
            variant="contained"
            disabled={editLoading}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 600,
              px: 3,
              order: { xs: 1, sm: 2 },
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            {editLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
        </Container>
      </Box>
    </VideoBackground>
  );
};

export default Profile;
