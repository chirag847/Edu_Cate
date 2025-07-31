import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  Stack,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDown as ThumbDownIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Link as LinkIcon,
  GetApp as GetAppIcon,
  Share as ShareIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { Resource, Comment as CommentType } from '../../types';

const ResourceDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id: resourceId } = useParams();
  const { user } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    console.log('ResourceDetail useEffect - resourceId:', resourceId);
    
    const fetchResourceDetail = async () => {
      try {
        setLoading(true);
        console.log('Fetching resource details for ID:', resourceId);
        
        // Fetch resource details
        const resourceResponse = await api.get(`/resources/${resourceId}`);
        console.log('Resource response:', resourceResponse.data);
        setResource(resourceResponse.data.resource);
        
        // Fetch comments
        console.log('Fetching comments for resource:', resourceId);
        const commentsResponse = await api.get(`/resources/${resourceId}/comments`);
        console.log('Comments response:', commentsResponse.data);
        setComments(commentsResponse.data.comments || []);
        
        // Check if user has bookmarked this resource
        if (user) {
          try {
            const bookmarksResponse = await api.get('/users/me/bookmarks');
            const bookmarkIds = bookmarksResponse.data.bookmarks?.map((b: Resource) => b._id) || [];
            setIsBookmarked(bookmarkIds.includes(resourceId));
          } catch (err) {
            console.error('Error fetching bookmarks:', err);
          }
        }
        
      } catch (err: any) {
        setError('Failed to load resource details');
        console.error('Resource detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (resourceId) {
      fetchResourceDetail();
    } else {
      console.error('No resourceId found in URL params');
      setError('Invalid resource ID');
      setLoading(false);
    }
  }, [resourceId, user]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Send vote request to backend (backend handles removal if same vote type)
      const response = await api.post(`/resources/${resourceId}/vote`, { voteType: voteType === 'up' ? 'upvote' : 'downvote' });
      
      // Update local vote state based on response
      if (response.data.message.includes('removed')) {
        setUserVote(null);
      } else {
        setUserVote(voteType);
      }

      // Refresh resource data
      const resourceResponse = await api.get(`/resources/${resourceId}`);
      setResource(resourceResponse.data.resource);

    } catch (err: any) {
      console.error('Vote error:', err);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        await api.delete(`/resources/${resourceId}/bookmark`);
        setIsBookmarked(false);
      } else {
        await api.post(`/resources/${resourceId}/bookmark`);
        setIsBookmarked(true);
      }

      // Update resource bookmark count
      if (resource) {
        setResource({
          ...resource,
          bookmarks: resource.bookmarks + (isBookmarked ? -1 : 1)
        });
      }

    } catch (err: any) {
      console.error('Bookmark error:', err);
    }
  };

  const handleDownload = async (fileIndex: number, fileName: string) => {
    try {
      const response = await api.get(`/resources/${resourceId}/download/${fileIndex}`);
      
      if (response.data.success && response.data.downloadUrl) {
        // For Cloudinary files, open the URL directly
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.setAttribute('download', fileName);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Fallback for blob response (legacy local files)
        const blobResponse = await api.get(`/resources/${resourceId}/download/${fileIndex}`, {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([blobResponse.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      // Update download count
      if (resource) {
        setResource({
          ...resource,
          downloads: resource.downloads + 1
        });
      }

    } catch (err: any) {
      console.error('Download error:', err);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const response = await api.post(`/resources/${resourceId}/comments`, {
        content: newComment
      });
      
      setComments([response.data.comment, ...comments]);
      setNewComment('');
      
    } catch (err: any) {
      console.error('Comment error:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareDialogOpen(false);
    // You could show a toast notification here
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !resource) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Resource not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Main Content */}
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" sx={{ mb: 2 }}>
                  <Chip label={resource.type} color="primary" />
                  <Chip 
                    label={resource.difficulty} 
                    color={
                      resource.difficulty === 'Beginner' ? 'success' :
                      resource.difficulty === 'Intermediate' ? 'warning' : 'error'
                    }
                    variant="outlined"
                  />
                  {resource.featured && (
                    <Chip label="Featured" color="secondary" />
                  )}
                </Stack>
                <Typography variant="h4" gutterBottom>
                  {resource.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {resource.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Metadata */}
              <Box sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body2">
                    {resource.category}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Subject
                  </Typography>
                  <Typography variant="body2">
                    {resource.subject}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Semester
                  </Typography>
                  <Typography variant="body2">
                    {resource.semester}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Views
                  </Typography>
                  <Typography variant="body2">
                    {resource.views}
                  </Typography>
                </Box>
              </Box>

              {/* Tags */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
                  {resource.tags.map((tag) => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                      onClick={() => navigate(`/resources?search=${tag}`)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Content */}
              {resource.content && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Content
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {resource.content}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Files */}
              {resource.files && resource.files.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Files
                  </Typography>
                  <List>
                    {resource.files.map((file, index) => (
                      <ListItem 
                        key={index}
                        sx={{ 
                          border: 1, 
                          borderColor: 'divider', 
                          borderRadius: 1, 
                          mb: 1 
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <GetAppIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={file.originalName}
                          secondary={`${formatFileSize(file.size)} • ${file.mimeType}`}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(index, file.originalName)}
                        >
                          Download
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* External Links */}
              {resource.externalLinks && resource.externalLinks.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    External Links
                  </Typography>
                  <List>
                    {resource.externalLinks.map((link, index) => (
                      <ListItem 
                        key={index}
                        sx={{ 
                          border: 1, 
                          borderColor: 'divider', 
                          borderRadius: 1, 
                          mb: 1 
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <LinkIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={link.title}
                          secondary={link.url}
                        />
                        <Button
                          variant="outlined"
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comments ({comments.length})
              </Typography>
              
              {/* Add Comment */}
              {user ? (
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={commentLoading || !newComment.trim()}
                  >
                    {commentLoading ? <CircularProgress size={20} /> : 'Post Comment'}
                  </Button>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Please <Button onClick={() => navigate('/login')}>log in</Button> to add comments
                </Alert>
              )}

              {/* Comments List */}
              <List>
                {comments.map((comment) => (
                  <ListItem key={comment._id}>
                    <ListItemAvatar>
                      <Avatar>
                        {comment.user.firstName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row">
                          <Typography variant="subtitle2">
                            {comment.user.firstName} {comment.user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {comment.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box>
          {/* Action Buttons */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack>
                {/* Vote Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconButton
                    onClick={() => handleVote('up')}
                    color={userVote === 'up' ? 'primary' : 'default'}
                    size="large"
                  >
                    {userVote === 'up' ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  </IconButton>
                  <Typography variant="h6" sx={{ mx: 2 }}>
                    {resource.votes.score}
                  </Typography>
                  <IconButton
                    onClick={() => handleVote('down')}
                    color={userVote === 'down' ? 'error' : 'default'}
                    size="large"
                  >
                    {userVote === 'down' ? <ThumbDownIcon /> : <ThumbDownOutlinedIcon />}
                  </IconButton>
                </Box>

                {/* Action Buttons */}
                <Button
                  variant={isBookmarked ? 'contained' : 'outlined'}
                  startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  onClick={handleBookmark}
                  fullWidth
                >
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={() => setShareDialogOpen(true)}
                  fullWidth
                >
                  Share
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Author Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Author
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>
                  {resource.author.firstName[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {resource.author.firstName} {resource.author.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resource.author.stream}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resource.author.college}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                onClick={() => navigate(`/users/${resource.author._id}`)}
                fullWidth
              >
                View Profile
              </Button>
            </CardContent>
          </Card>

          {/* Resource Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Stack>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Views</Typography>
                  <Typography variant="body2">{resource.views}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Downloads</Typography>
                  <Typography variant="body2">{resource.downloads}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Bookmarks</Typography>
                  <Typography variant="body2">{resource.bookmarks}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Comments</Typography>
                  <Typography variant="body2">{comments.length}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Created</Typography>
                  <Typography variant="body2">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Resource</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={window.location.href}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShare} variant="contained">
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ResourceDetail;
