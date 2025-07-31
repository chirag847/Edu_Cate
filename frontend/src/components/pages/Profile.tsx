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
  Divider,
  Stack,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
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
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  CloudUpload as UploadIcon,
  Bookmark as BookmarkIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  ThumbUp as ThumbUpIcon,
  CalendarToday as CalendarIcon,
  Email as EmailIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userResources, setUserResources] = useState<Resource[]>([]);
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
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
      const response = await api.put('/users/me', editFormData);
      
      if (response.data.user) {
        setProfileUser(response.data.user);
        updateUser(response.data.user);
        setEditDialogOpen(false);
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {resource.title}
          </Typography>
          <Chip label={resource.type} size="small" color="primary" />
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
        <Typography variant="caption" color="text.secondary">
          {new Date(resource.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!profileUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profile Header */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Box>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                fontSize: '3rem',
                bgcolor: 'primary.main'
              }}
              src={profileUser.profilePicture}
            >
              {profileUser.firstName[0]}{profileUser.lastName[0]}
            </Avatar>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {profileUser.firstName} {profileUser.lastName}
                  {profileUser.isVerified && (
                    <Chip 
                      icon={<StarIcon />} 
                      label="Verified" 
                      color="primary" 
                      size="small" 
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
                <Stack direction="row" sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{profileUser.stream}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{profileUser.year}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{profileUser.college}</Typography>
                  </Box>
                </Stack>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {profileUser.bio || 'No bio available'}
                </Typography>
                <Stack direction="row">
                  <Box>
                    <Typography variant="h6" color="primary">
                      {stats.reputation}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Reputation
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="primary">
                      {stats.totalUploads}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Resources
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" color="primary">
                      {stats.totalViews}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Views
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditDialogOpen(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="fullWidth"
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
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No resources uploaded yet
            </Typography>
            {isOwnProfile && (
              <Button
                variant="contained"
                onClick={() => navigate('/upload')}
                sx={{ mt: 2 }}
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
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BookmarkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No bookmarked resources yet
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/resources')}
                sx={{ mt: 2 }}
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
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Box>
              <TextField
                fullWidth
                label="First Name"
                value={editFormData.firstName}
                onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Last Name"
                value={editFormData.lastName}
                onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={3}
                value={editFormData.bio}
                onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="College/University"
                value={editFormData.college}
                onChange={(e) => setEditFormData(prev => ({ ...prev, college: e.target.value }))}
              />
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Stream</InputLabel>
                <Select
                  value={editFormData.stream}
                  label="Stream"
                  onChange={(e) => setEditFormData(prev => ({ ...prev, stream: e.target.value }))}
                >
                  {STREAMS.map((stream) => (
                    <MenuItem key={stream} value={stream}>
                      {stream}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={editFormData.year}
                  label="Year"
                  onChange={(e) => setEditFormData(prev => ({ ...prev, year: e.target.value }))}
                >
                  {YEARS.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditProfile}
            variant="contained"
            disabled={editLoading}
          >
            {editLoading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
