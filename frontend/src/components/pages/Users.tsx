import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Clear as ClearIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VideoBackground from '../common/VideoBackground';
import api from '../../utils/api';
import { User, STREAMS } from '../../types';

interface UserFilters {
  search: string;
  stream: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    stream: '',
    sortBy: 'reputation',
    sortOrder: 'desc'
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      // Add filters
      if (filters.search) params.append('search', filters.search);
      if (filters.stream) params.append('stream', filters.stream);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await api.get(`/users?${params.toString()}`);
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);

    } catch (err: any) {
      setError('Failed to load users');
      console.error('Users error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      stream: '',
      sortBy: 'reputation',
      sortOrder: 'desc'
    });
    setPage(1);
  };

  const UserCard = ({ user }: { user: User }) => (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'rgba(255, 255, 255, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        background: 'rgba(255, 255, 255, 0.15)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 30px rgba(139, 92, 246, 0.4)',
        border: '1px solid rgba(139, 92, 246, 0.5)',
      },
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56, 
              mr: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
            src={user.profilePicture}
          >
            {user.firstName[0]}{user.lastName[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 600 }}>
              {user.firstName} {user.lastName}
              {user.isVerified && (
                <Chip 
                  icon={<StarIcon />} 
                  label="Verified" 
                  color="primary" 
                  size="small" 
                  sx={{ 
                    ml: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                  }}
                />
              )}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              @{user.username}
            </Typography>
          </Box>
        </Box>

        <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)' }}>
          {user.bio ? user.bio.substring(0, 100) + (user.bio.length > 100 ? '...' : '') : 'No bio available'}
        </Typography>

        <Stack sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>{user.stream}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon fontSize="small" sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>{user.year}</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {user.college}
          </Typography>
        </Stack>

        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
              {user.reputation || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Reputation
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
              {user.uploadedResources?.length || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Resources
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 700 }}>
              {user.bookmarkedResources?.length || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Bookmarks
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      
      <CardContent sx={{ pt: 0 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate(`/users/${user._id}`)}
          sx={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              borderColor: 'rgba(139, 92, 246, 0.6)',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              color: '#8b5cf6',
            }
          }}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <VideoBackground overlay={false}>
      <Box sx={{ 
        minHeight: '100vh',
        pt: { xs: 11, sm: 12 },
        pb: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            p: 3,
            mb: 4,
            textAlign: 'center'
          }}>
            <Typography variant="h4" gutterBottom sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}>
              Engineering Students
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Connect with fellow engineering students from colleges worldwide
            </Typography>
          </Box>

          {/* Search and Filters */}
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  placeholder="Search students..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(139, 92, 246, 0.4)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(139, 92, 246, 0.6)',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Stream</InputLabel>
              <Select
                value={filters.stream}
                label="Stream"
                onChange={(e) => handleFilterChange('stream', e.target.value)}
              >
                <MenuItem value="">All Streams</MenuItem>
                {STREAMS.map((stream) => (
                  <MenuItem key={stream} value={stream}>
                    {stream}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="reputation">Reputation</MenuItem>
                <MenuItem value="createdAt">Newest</MenuItem>
                <MenuItem value="firstName">Name</MenuItem>
                <MenuItem value="uploadedResources">Most Resources</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Order</InputLabel>
              <Select
                value={filters.sortOrder}
                label="Order"
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
              >
                <MenuItem value="desc">Descending</MenuItem>
                <MenuItem value="asc">Ascending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {total} students found
          </Typography>
          <Button
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            size="small"
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Users Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : users.length > 0 ? (
        <>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)' 
            }, 
            gap: 3, 
            mb: 4 
          }}>
            {users.map((user) => (
              <Box key={user._id}>
                <UserCard user={user} />
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              size="large"
            />
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No students found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search criteria or be the first to join!
          </Typography>
          {!currentUser && (
            <Button
              variant="contained"
              onClick={() => navigate('/register')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)',
                }
              }}
            >
              Join Educate
            </Button>
          )}
        </Box>
      )}
        </Container>
      </Box>
    </VideoBackground>
  );
};

export default Users;
