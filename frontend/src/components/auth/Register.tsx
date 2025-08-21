import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  MenuItem,
  Stack,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import VideoBackground from '../common/VideoBackground';
import { RegisterData, STREAMS, YEARS } from '../../types';

const schema = yup.object({
  username: yup
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    )
    .required('Password is required'),
  firstName: yup
    .string()
    .required('First name is required'),
  lastName: yup
    .string()
    .required('Last name is required'),
  college: yup
    .string()
    .required('College name is required'),
  stream: yup
    .string()
    .oneOf(STREAMS as any, 'Please select a valid stream')
    .required('Stream is required'),
  year: yup
    .string()
    .oneOf(YEARS as any, 'Please select a valid year')
    .required('Year is required'),
});

const Register: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  // Common styling for text fields
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      color: 'white',
      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
      '&:hover fieldset': { borderColor: 'rgba(139, 92, 246, 0.4)' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(139, 92, 246, 0.6)' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
    '& .MuiFormHelperText-root': { color: 'rgba(255, 255, 255, 0.6)' },
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RegisterData>({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      college: '',
      stream: '',
      year: '',
    },
  });

  // Watch the stream and year values
  const streamValue = watch('stream') || '';
  const yearValue = watch('year') || '';

  const onSubmit = async (data: RegisterData) => {
    try {
      setError('');
      setLoading(true);
      await registerUser(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <VideoBackground overlay={false}>
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 4,
            marginBottom: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            pt: 12,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)',
                transform: 'translateY(-2px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
          <Typography 
            component="h1" 
            variant="h4" 
            gutterBottom
            sx={{ 
              color: 'white',
              fontWeight: 700,
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)' 
            }}
          >
            Join Educate
          </Typography>
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              mb: 3,
              color: 'rgba(255, 255, 255, 0.8)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)' 
            }}
          >
            Create your account to start sharing and discovering engineering resources
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  {...register('firstName')}
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  sx={textFieldStyle}
                />
                <TextField
                  {...register('lastName')}
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                  sx={textFieldStyle}
                />
              </Box>
              <TextField
                {...register('username')}
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                error={!!errors.username}
                helperText={errors.username?.message}
                sx={textFieldStyle}
              />
              <TextField
                {...register('email')}
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={textFieldStyle}
              />
              <TextField
                {...register('password')}
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                sx={textFieldStyle}
              />
              <TextField
                {...register('college')}
                required
                fullWidth
                id="college"
                label="College/University"
                name="college"
                error={!!errors.college}
                helperText={errors.college?.message}
                sx={textFieldStyle}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  {...register('stream')}
                  required
                  fullWidth
                  select
                  id="stream"
                  label="Engineering Stream"
                  name="stream"
                  value={streamValue}
                  onChange={(e) => setValue('stream', e.target.value)}
                  error={!!errors.stream}
                  helperText={errors.stream?.message}
                  sx={textFieldStyle}
                >
                  <MenuItem value="">
                    <em>Select your stream</em>
                  </MenuItem>
                  {STREAMS.map((stream) => (
                    <MenuItem key={stream} value={stream}>
                      {stream}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  {...register('year')}
                  required
                  fullWidth
                  select
                  id="year"
                  label="Current Year"
                  name="year"
                  value={yearValue}
                  onChange={(e) => setValue('year', e.target.value)}
                  error={!!errors.year}
                  helperText={errors.year?.message}
                  sx={textFieldStyle}
                >
                  <MenuItem value="">
                    <em>Select your year</em>
                  </MenuItem>
                  {YEARS.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Stack>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Already have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{ cursor: 'pointer', color: '#8b5cf6' }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
    </VideoBackground>
  );
};

export default Register;
