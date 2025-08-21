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
  DialogActions
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDown as ThumbDownIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Download as DownloadIcon,
  Link as LinkIcon,
  GetApp as GetAppIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VideoBackground from '../common/VideoBackground';
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
      <VideoBackground overlay={false}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', 
            py: 8,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            px: 4,
          }}>
            <CircularProgress sx={{ color: '#667eea', mb: 2 }} />
            <Typography sx={{ color: 'white' }}>Loading resource...</Typography>
          </Box>
        </Container>
      </VideoBackground>
    );
  }

  if (error || !resource) {
    return (
      <VideoBackground overlay={false}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert 
            severity="error"
            sx={{
              background: 'rgba(244, 67, 54, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: '12px',
              color: 'white',
              '& .MuiAlert-icon': {
                color: '#ef4444',
              },
            }}
          >
            {error || 'Resource not found'}
          </Alert>
        </Container>
      </VideoBackground>
    );
  }

  return (
    <VideoBackground overlay={false}>
      <Box sx={{ 
        minHeight: '100vh',
        pt: { xs: 11, sm: 12 },
        pb: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, 
            gap: 4,
            alignItems: 'start',
          }}>
            {/* Main Content */}
            <Box>
              <Card sx={{ 
                mb: 3,
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
                },
              }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Chip 
                        label={resource.type} 
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          fontWeight: 500,
                          border: 'none'
                        }}
                      />
                      <Chip 
                        label={resource.difficulty} 
                        sx={{
                          background: resource.difficulty === 'Beginner' ? 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)' :
                                    resource.difficulty === 'Intermediate' ? 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)' : 
                                    'linear-gradient(135deg, #F44336 0%, #E91E63 100%)',
                          color: 'white',
                          fontWeight: 500,
                          border: 'none'
                        }}
                      />
                      {resource.featured && (
                        <Chip 
                          label="Featured" 
                          sx={{
                            background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
                            color: 'white',
                            fontWeight: 500,
                            border: 'none'
                          }}
                        />
                      )}
                    </Stack>
                <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
                  {resource.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} paragraph>
                  {resource.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              {/* Metadata */}
              <Box sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Category
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {resource.category}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Subject
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {resource.subject}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Semester
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {resource.semester}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Views
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white' }}>
                    {resource.views}
                  </Typography>
                </Box>
              </Box>

              {/* Tags */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                  Tags
                </Typography>
                <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {resource.tags.map((tag) => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      onClick={() => navigate(`/resources?search=${tag}`)}
                      sx={{ 
                        cursor: 'pointer',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                          background: 'rgba(139, 92, 246, 0.2)',
                          borderColor: 'rgba(139, 92, 246, 0.5)',
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Content */}
              {resource.content && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                    Content
                  </Typography>
                  <Paper sx={{ 
                    p: 3, 
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                  }}>
                    <Typography variant="body2" sx={{ 
                      whiteSpace: 'pre-wrap',
                      color: 'rgba(255, 255, 255, 0.9)',
                      lineHeight: 1.6,
                    }}>
                      {resource.content}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Files */}
              {resource.files && resource.files.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                    Files
                  </Typography>
                  <List sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    p: 1,
                  }}>
                    {resource.files.map((file, index) => (
                      <ListItem 
                        key={index}
                        sx={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)', 
                          borderRadius: '8px', 
                          mb: 1,
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}>
                            <GetAppIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={file.originalName}
                          secondary={`${formatFileSize(file.size)} • ${file.mimeType}`}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: 'white',
                              fontWeight: 500,
                            },
                            '& .MuiListItemText-secondary': {
                              color: 'rgba(255, 255, 255, 0.7)',
                            },
                          }}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(index, file.originalName)}
                          sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            '&:hover': {
                              borderColor: 'rgba(139, 92, 246, 0.5)',
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            }
                          }}
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
                  <Typography variant="subtitle2" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                    External Links
                  </Typography>
                  <List sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    p: 1,
                  }}>
                    {resource.externalLinks.map((link, index) => (
                      <ListItem 
                        key={index}
                        sx={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)', 
                          borderRadius: '8px', 
                          mb: 1,
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}>
                            <LinkIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={link.title}
                          secondary={link.url}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: 'white',
                              fontWeight: 500,
                            },
                            '& .MuiListItemText-secondary': {
                              color: 'rgba(255, 255, 255, 0.7)',
                            },
                          }}
                        />
                        <Button
                          variant="outlined"
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            '&:hover': {
                              borderColor: 'rgba(139, 92, 246, 0.5)',
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                            }
                          }}
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
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
            },
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
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
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'rgba(139, 92, 246, 0.5)',
                        },
                        '& input, & textarea': {
                          color: 'white',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                      },
                      '& .MuiOutlinedInput-input::placeholder': {
                        color: 'rgba(255, 255, 255, 0.5)',
                        opacity: 1,
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={commentLoading || !newComment.trim()}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                      },
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'rgba(255, 255, 255, 0.3)',
                      }
                    }}
                  >
                    {commentLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Post Comment'}
                  </Button>
                </Box>
              ) : (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    background: 'rgba(33, 150, 243, 0.1)',
                    borderColor: 'rgba(33, 150, 243, 0.3)',
                    color: 'white',
                    '& .MuiAlert-icon': {
                      color: 'rgba(33, 150, 243, 0.8)',
                    },
                  }}
                >
                  Please <Button 
                    onClick={() => navigate('/login')}
                    sx={{ 
                      color: 'rgba(33, 150, 243, 0.9)',
                      textTransform: 'none',
                      p: 0,
                      minWidth: 'auto',
                      '&:hover': {
                        background: 'transparent',
                        color: '#2196f3',
                      }
                    }}
                  >log in</Button> to add comments
                </Alert>
              )}

              {/* Comments List */}
              <List>
                {comments.map((comment) => (
                  <ListItem 
                    key={comment._id}
                    sx={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      borderRadius: '12px', 
                      mb: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{
                        background: 'linear-gradient(135deg, #ff7b7b 0%, #f093fb 100%)',
                      }}>
                        {comment.user.firstName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {comment.user.firstName} {comment.user.lastName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </Typography>
                        </Stack>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.8)' }}>
                          {comment.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {comments.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      No comments yet. Be the first to comment!
                    </Typography>
                  </Box>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar */}
        <Box>
          {/* Action Buttons */}
          <Card sx={{ 
            mb: 3,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
            },
          }}>
            <CardContent>
              <Stack spacing={2}>
                {/* Vote Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconButton
                    onClick={() => handleVote('up')}
                    color={userVote === 'up' ? 'primary' : 'default'}
                    size="large"
                    sx={{
                      color: userVote === 'up' ? '#4caf50' : 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        background: 'rgba(76, 175, 80, 0.1)',
                      }
                    }}
                  >
                    {userVote === 'up' ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                  </IconButton>
                  <Typography variant="h6" sx={{ mx: 2, color: 'white', fontWeight: 'bold' }}>
                    {resource.votes.score}
                  </Typography>
                  <IconButton
                    onClick={() => handleVote('down')}
                    color={userVote === 'down' ? 'error' : 'default'}
                    size="large"
                    sx={{
                      color: userVote === 'down' ? '#f44336' : 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        background: 'rgba(244, 67, 54, 0.1)',
                      }
                    }}
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
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: isBookmarked ? 'rgba(255, 193, 7, 0.2)' : 'transparent',
                    '&:hover': {
                      borderColor: 'rgba(255, 193, 7, 0.5)',
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    }
                  }}
                >
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={() => setShareDialogOpen(true)}
                  fullWidth
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      borderColor: 'rgba(139, 92, 246, 0.5)',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    }
                  }}
                >
                  Share
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Author Info */}
          <Card sx={{ 
            mb: 3,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
            },
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                Author
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  mr: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}>
                  {resource.author.firstName[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
                    {resource.author.firstName} {resource.author.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {resource.author.stream}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {resource.author.college}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                onClick={() => navigate(`/users/${resource.author._id}`)}
                fullWidth
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(139, 92, 246, 0.5)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  }
                }}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>

          {/* Resource Stats */}
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.08)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
            },
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                Statistics
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Views</Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>{resource.views}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Downloads</Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>{resource.downloads}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Bookmarks</Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>{resource.bookmarks}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Comments</Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>{comments.length}</Typography>
                </Box>
                <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Created</Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
          </Box>

      {/* Share Dialog */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(32, 32, 32, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
          }
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>Share Resource</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={window.location.href}
            InputProps={{
              readOnly: true,
            }}
            sx={{ 
              mt: 1,
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.05)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '& input': {
                  color: 'white',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShareDialogOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleShare} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>
        </Container>
      </Box>
    </VideoBackground>
  );
};

export default ResourceDetail;
