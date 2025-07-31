import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Pagination,
  IconButton,
  Badge,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  BookmarkBorder as BookmarkIcon,
  Bookmark as BookmarkFilledIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDown as ThumbDownIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  School as SchoolIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { Resource, STREAMS, RESOURCE_TYPES } from '../../types';

interface ResourceFilters {
  search: string;
  type: string;
  stream: string;
  difficulty: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const Resources: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [votedResources, setVotedResources] = useState<Map<string, 'up' | 'down'>>(new Map());

  const [filters, setFilters] = useState<ResourceFilters>({
    search: '',
    type: '',
    stream: '',
    difficulty: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      console.log('Fetching resources with filters:', filters, 'page:', page);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });

      // Add filters
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.stream) params.append('category', filters.stream); // Map stream to category
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      console.log('Making API request to:', `/resources?${params.toString()}`);
      const response = await api.get(`/resources?${params.toString()}`);
      console.log('Resources API response:', response.data);
      setResources(response.data.resources || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotal(response.data.pagination?.totalResources || 0);

      // Fetch user's bookmarks if authenticated
      if (user) {
        const bookmarksResponse = await api.get('/users/me/bookmarks');
        const bookmarkIds = new Set<string>(
          bookmarksResponse.data.bookmarks?.map((b: Resource) => b._id) || []
        );
        setBookmarkedIds(bookmarkIds);
      }

    } catch (err: any) {
      setError('Failed to load resources');
      console.error('Resources error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [page, filters, user]);

  const handleFilterChange = (key: keyof ResourceFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      stream: '',
      difficulty: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPage(1);
  };

  const handleBookmark = async (resourceId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const isBookmarked = bookmarkedIds.has(resourceId);
      
      if (isBookmarked) {
        await api.delete(`/resources/${resourceId}/bookmark`);
        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(resourceId);
          return newSet;
        });
      } else {
        await api.post(`/resources/${resourceId}/bookmark`);
        setBookmarkedIds(prev => new Set(prev).add(resourceId));
      }

      // Update the resource in the list
      setResources(prev => prev.map(resource => 
        resource._id === resourceId 
          ? { ...resource, bookmarks: resource.bookmarks + (isBookmarked ? -1 : 1) }
          : resource
      ));

    } catch (err: any) {
      console.error('Bookmark error:', err);
    }
  };

  const handleVote = async (resourceId: string, voteType: 'up' | 'down') => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const currentVote = votedResources.get(resourceId);
      
      if (currentVote === voteType) {
        // Remove vote
        await api.delete(`/resources/${resourceId}/vote`);
        setVotedResources(prev => {
          const newMap = new Map(prev);
          newMap.delete(resourceId);
          return newMap;
        });
      } else {
        // Add or change vote
        await api.post(`/resources/${resourceId}/vote`, { voteType });
        setVotedResources(prev => new Map(prev).set(resourceId, voteType));
      }

      // Refresh the resource data to get updated vote counts
      fetchResources();

    } catch (err: any) {
      console.error('Vote error:', err);
    }
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => {
    const isBookmarked = bookmarkedIds.has(resource._id);
    const userVote = votedResources.get(resource._id);

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, mr: 1 }}>
              {resource.title}
            </Typography>
            <Stack direction="row">
              <Chip label={resource.type} size="small" color="primary" />
              {resource.difficulty && (
                <Chip 
                  label={resource.difficulty} 
                  size="small" 
                  color={
                    resource.difficulty === 'Beginner' ? 'success' :
                    resource.difficulty === 'Intermediate' ? 'warning' : 'error'
                  }
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {resource.description.substring(0, 120)}...
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}
            >
              {resource.author.firstName[0]}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              by {resource.author.firstName} {resource.author.lastName}
            </Typography>
          </Box>

          <Stack direction="row" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ViewIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption">{resource.views}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DownloadIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption">{resource.downloads}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BookmarkIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption">{resource.bookmarks}</Typography>
            </Box>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: 'wrap', mb: 2 }}>
            {resource.tags.slice(0, 3).map((tag) => (
              <Chip 
                key={tag} 
                label={tag} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {resource.tags.length > 3 && (
              <Chip 
                label={`+${resource.tags.length - 3} more`} 
                size="small" 
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Stack>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
          <Stack direction="row">
            <IconButton
              size="small"
              onClick={() => handleVote(resource._id, 'up')}
              color={userVote === 'up' ? 'primary' : 'default'}
            >
              {userVote === 'up' ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
            </IconButton>
            <Typography variant="caption" sx={{ alignSelf: 'center' }}>
              {resource.votes.score}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleVote(resource._id, 'down')}
              color={userVote === 'down' ? 'error' : 'default'}
            >
              {userVote === 'down' ? <ThumbDownIcon /> : <ThumbDownOutlinedIcon />}
            </IconButton>
          </Stack>

          <Stack direction="row">
            <IconButton
              size="small"
              onClick={() => handleBookmark(resource._id)}
              color={isBookmarked ? 'primary' : 'default'}
            >
              {isBookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
            </IconButton>
            <Button 
              size="small" 
              onClick={() => navigate(`/resources/${resource._id}`)}
            >
              View
            </Button>
          </Stack>
        </CardActions>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Educational Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover and share educational content from engineering students worldwide
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <TextField
              fullWidth
              placeholder="Search resources..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Box>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {RESOURCE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <FormControl fullWidth>
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
          </Box>

          <Box>
            <FormControl fullWidth>
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={filters.difficulty}
                label="Difficulty"
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="createdAt">Latest</MenuItem>
                <MenuItem value="votes.score">Most Voted</MenuItem>
                <MenuItem value="views">Most Viewed</MenuItem>
                <MenuItem value="downloads">Most Downloaded</MenuItem>
                <MenuItem value="title">Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {total} resources found
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

      {/* Resources Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : resources.length > 0 ? (
        <>
          <Box sx={{ mb: 4 }}>
            {resources.map((resource) => (
              <Box>
                <ResourceCard resource={resource} />
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
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No resources found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search criteria or be the first to upload a resource!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/upload')}
          >
            Upload Resource
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Resources;
