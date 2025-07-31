import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { ResourceFormData, RESOURCE_TYPES, CATEGORIES, SEMESTERS } from '../../types';

// Local interface for the form that matches Yup schema exactly
interface FormData {
  title: string;
  description: string;
  type: 'notes' | 'book' | 'blog' | 'recommendation' | 'project' | 'assignment' | 'research_paper';
  category: string;
  subject: string;
  semester: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string;
}

const schema = yup.object({
  title: yup
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters')
    .required('Title is required'),
  description: yup
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be at most 1000 characters')
    .required('Description is required'),
  type: yup
    .string()
    .oneOf(RESOURCE_TYPES as any, 'Please select a valid type')
    .required('Type is required'),
  category: yup
    .string()
    .required('Category is required'),
  subject: yup
    .string()
    .required('Subject is required'),
  semester: yup
    .string()
    .required('Semester is required'),
  difficulty: yup
    .string()
    .oneOf(['Beginner', 'Intermediate', 'Advanced'], 'Please select a valid difficulty')
    .required('Difficulty is required'),
  content: yup
    .string()
    .default('')
});

const UploadResource: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [externalLinks, setExternalLinks] = useState<Array<{url: string, title: string}>>([]);
  const [newLink, setNewLink] = useState({ url: '', title: '' });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: '',
      description: '',
      type: 'notes',
      category: '',
      subject: '',
      semester: '',
      difficulty: 'Beginner',
      content: ''
    }
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validate file size (10MB max per file) and type
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/zip',
        'application/x-rar-compressed'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError(`File ${file.name} has an unsupported format. Please use PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR, or image files.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
      setError('');
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    if (newLink.url.trim() && newLink.title.trim()) {
      setExternalLinks([...externalLinks, { ...newLink }]);
      setNewLink({ url: '', title: '' });
    }
  };

  const handleRemoveLink = (index: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Basic validation
      if (files.length === 0 && !data.content.trim() && externalLinks.length === 0) {
        setError('Please add at least one file, some content, or an external link.');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      // Add tags
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }

      // Add external links
      if (externalLinks.length > 0) {
        formData.append('externalLinks', JSON.stringify(externalLinks));
      }

      // Add files
      files.forEach(file => {
        formData.append('files', file);
      });

      console.log('Submitting resource with files:', files.length);

      const response = await api.post('/resources', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for large files
      });

      setSuccess('Resource uploaded successfully!');
      console.log('Upload successful:', response.data);
      
      // Reset form
      reset();
      setFiles([]);
      setTags([]);
      setExternalLinks([]);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Upload error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        setError(err.response.data.errors.map((e: any) => e.msg).join(', '));
      } else if (err.code === 'ECONNABORTED') {
        setError('Upload timed out. Please try again with smaller files.');
      } else {
        setError('Failed to upload resource. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Please log in to upload resources.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload Educational Resource
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share your knowledge with fellow engineering students
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Upload Failed:</strong> {error}
          <br />
          <small>If the problem persists, try:</small>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Check your internet connection</li>
            <li>Ensure files are under 10MB each</li>
            <li>Try uploading fewer files at once</li>
            <li>Refresh the page and try again</li>
          </ul>
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit as any)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <TextField
                      {...register('title')}
                      fullWidth
                      label="Title"
                      placeholder="Enter a descriptive title for your resource"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  </Box>
                  <Box>
                    <TextField
                      {...register('description')}
                      fullWidth
                      label="Description"
                      multiline
                      rows={4}
                      placeholder="Describe what this resource covers and how it can help other students"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Classification */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Classification
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.type}>
                          <InputLabel>Resource Type</InputLabel>
                          <Select {...field} label="Resource Type">
                            {RESOURCE_TYPES.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.type && (
                            <Typography variant="caption" color="error">
                              {errors.type.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>
                  <Box>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.category}>
                          <InputLabel>Category</InputLabel>
                          <Select {...field} label="Category">
                            {CATEGORIES.map((category) => (
                              <MenuItem key={category} value={category}>
                                {category}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.category && (
                            <Typography variant="caption" color="error">
                              {errors.category.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>
                  <Box>
                    <TextField
                      {...register('subject')}
                      fullWidth
                      label="Subject"
                      placeholder="e.g., Data Structures, Calculus, Physics"
                      error={!!errors.subject}
                      helperText={errors.subject?.message}
                    />
                  </Box>
                  <Box>
                    <Controller
                      name="semester"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.semester}>
                          <InputLabel>Semester</InputLabel>
                          <Select {...field} label="Semester">
                            {SEMESTERS.map((semester) => (
                              <MenuItem key={semester} value={semester}>
                                {semester}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.semester && (
                            <Typography variant="caption" color="error">
                              {errors.semester.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>
                  <Box>
                    <Controller
                      name="difficulty"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.difficulty}>
                          <InputLabel>Difficulty Level</InputLabel>
                          <Select {...field} label="Difficulty Level">
                            <MenuItem value="Beginner">Beginner</MenuItem>
                            <MenuItem value="Intermediate">Intermediate</MenuItem>
                            <MenuItem value="Advanced">Advanced</MenuItem>
                          </Select>
                          {errors.difficulty && (
                            <Typography variant="caption" color="error">
                              {errors.difficulty.message}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Tags */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" sx={{ mb: 2 }}>
                    <TextField
                      size="small"
                      label="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddTag}
                      disabled={!newTag.trim() || tags.length >= 10}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Add up to 10 relevant tags to help others find your resource
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Content */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Content (Optional)
                </Typography>
                <TextField
                  {...register('content')}
                  fullWidth
                  label="Additional Content"
                  multiline
                  rows={6}
                  placeholder="Add any additional text content, notes, or instructions here"
                  error={!!errors.content}
                  helperText={errors.content?.message}
                />
              </CardContent>
            </Card>
          </Box>

          {/* File Upload */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Files
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<UploadIcon />}
                      fullWidth
                      sx={{ py: 2 }}
                    >
                      Upload Files
                    </Button>
                  </label>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP, RAR, JPG, PNG, GIF (Max 10MB per file)
                  </Typography>
                </Box>
                {files.length > 0 && (
                  <List>
                    {files.map((file, index) => (
                      <ListItem key={index}>
                        <FileIcon sx={{ mr: 2 }} />
                        <ListItemText
                          primary={file.name}
                          secondary={`${formatFileSize(file.size)} • ${file.type || 'Unknown type'}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => handleRemoveFile(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* External Links */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  External Links (Optional)
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <TextField
                        size="small"
                        fullWidth
                        label="URL"
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </Box>
                    <Box>
                      <TextField
                        size="small"
                        fullWidth
                        label="Title"
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                        placeholder="Link description"
                      />
                    </Box>
                    <Box>
                      <Button
                        variant="outlined"
                        onClick={handleAddLink}
                        disabled={!newLink.url.trim() || !newLink.title.trim()}
                        fullWidth
                      >
                        Add
                      </Button>
                    </Box>
                  </Box>
                </Box>
                {externalLinks.length > 0 && (
                  <List>
                    {externalLinks.map((link, index) => (
                      <ListItem key={index}>
                        <LinkIcon sx={{ mr: 2 }} />
                        <ListItemText
                          primary={link.title}
                          secondary={link.url}
                        />
                        <ListItemSecondaryAction>
                          <IconButton onClick={() => handleRemoveLink(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Submit */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/resources')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
              >
                {loading ? 'Uploading...' : 'Upload Resource'}
              </Button>
            </Box>
          </Box>
        </Box>
      </form>
    </Container>
  );
};

export default UploadResource;
