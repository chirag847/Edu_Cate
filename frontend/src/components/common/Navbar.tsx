import React, { useState } from 'react';
import {
  AppBar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  InputBase,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '50px',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(20px)',
  display: 'flex',
  alignItems: 'center',
  minHeight: '28px',
  height: '28px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  '&:focus-within': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.6)',
    boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(2),
    width: '280px',
    minWidth: '220px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  zIndex: 1,
  color: 'rgba(255, 255, 255, 0.7)',
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  height: '28px',
  '& .MuiInputBase-input': {
    padding: `0 ${theme.spacing(1)} 0 calc(0.8em + ${theme.spacing(3.5)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.9rem',
    lineHeight: '28px',
    height: '28px',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.7)',
      opacity: 1,
    },
    [theme.breakpoints.up('sm')]: {
      width: '18ch',
      '&:focus': {
        width: '25ch',
      },
    },
  },
}));

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleMobileNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'rgba(30, 41, 59, 0.3)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        height: '80px',
        zIndex: 1100,
      }}
    >
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between', 
        alignItems: 'center',
        height: '80px',
        width: '100%',
        px: { xs: 1, sm: 2, md: 3, lg: 4 },
        gap: { xs: 1, sm: 2 },
      }}>
        {/* Logo */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 0, 
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, sm: 1.5 },
            fontSize: { xs: '1.2rem', sm: '1.5rem' },
            color: 'white',
            transition: 'transform 0.2s ease',
            height: 'auto',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
          onClick={() => navigate('/')}
        >
          <SchoolIcon sx={{ 
            fontSize: { xs: 24, sm: 32 }, 
            color: '#6366f1',
          }} />
          <Box sx={{ display: 'block' }}>
            Educate
          </Box>
        </Typography>

        {/* Navigation Links - Desktop Only */}
        <Box sx={{ 
          flexGrow: 1, 
          display: { xs: 'none', md: 'flex' }, 
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          mx: { md: 2, lg: 4 },
          height: 'auto',
        }}>
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ 
              fontWeight: isActive('/') ? 600 : 400,
              bgcolor: isActive('/') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              borderRadius: '8px',
              px: 2,
              py: 1,
              mx: 0.5,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              height: 'auto',
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.3)',
              },
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/resources')}
            sx={{ 
              fontWeight: isActive('/resources') ? 600 : 400,
              bgcolor: isActive('/resources') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              borderRadius: '8px',
              px: 2,
              py: 1,
              mx: 0.5,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              height: 'auto',
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.3)',
              },
            }}
          >
            Resources
          </Button>
          <Button
            color="inherit"
            startIcon={<PersonIcon />}
            onClick={() => navigate('/users')}
            sx={{ 
              fontWeight: isActive('/users') ? 600 : 400,
              bgcolor: isActive('/users') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              borderRadius: '8px',
              px: 2,
              py: 1,
              mx: 0.5,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              height: 'auto',
              '&:hover': {
                bgcolor: 'rgba(99, 102, 241, 0.3)',
              },
            }}
          >
            Users
          </Button>
          {user && (
            <>
              <Button
                color="inherit"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  fontWeight: isActive('/dashboard') ? 600 : 400,
                  bgcolor: isActive('/dashboard') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  height: 'auto',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.3)',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                startIcon={<AddIcon />}
                onClick={() => navigate('/upload')}
                sx={{ 
                  fontWeight: isActive('/upload') ? 600 : 400,
                  bgcolor: isActive('/upload') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  mx: 0.5,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  height: 'auto',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.3)',
                  },
                }}
              >
                Upload
              </Button>
            </>
          )}
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, height: 'auto' }}>
          {/* Search Bar - Hidden on mobile */}
          <Search sx={{ display: { xs: 'none', sm: 'block' } }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <form onSubmit={handleSearch}>
              <StyledInputBase
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </form>
          </Search>

          {/* User Section - Desktop */}
          {!isMobile && user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 'auto' }}>
              {/* User Menu */}
              <IconButton 
                onClick={handleMenuOpen} 
                sx={{ 
                  p: 0.5,
                  borderRadius: '50%',
                  transition: 'background-color 0.3s ease',
                  height: 'auto',
                  width: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Avatar
                  alt={user.firstName}
                  src={user.profilePicture}
                  sx={{ 
                    width: { xs: 32, sm: 36 }, 
                    height: { xs: 32, sm: 36 },
                    border: '2px solid rgba(99, 102, 241, 0.4)',
                    transition: 'border-color 0.3s ease',
                    '&:hover': {
                      borderColor: 'rgba(99, 102, 241, 0.8)',
                    },
                  }}
                >
                  {user.firstName.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: '16px',
                    mt: 1,
                    minWidth: 200,
                    background: 'rgba(30, 41, 59, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  },
                  '& .MuiMenuItem-root': {
                    color: 'white',
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    },
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                  '& .MuiDivider-root': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    mx: 1,
                  },
                }}
              >
                <MenuItem disabled sx={{ py: 1.5 }}>
                  <Typography variant="body2" color="textSecondary">
                    {user.firstName} {user.lastName}
                  </Typography>
                </MenuItem>
                <MenuItem disabled sx={{ py: 0.5 }}>
                  <Typography variant="caption" color="textSecondary">
                    @{user.username}
                  </Typography>
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={() => navigate('/dashboard')} sx={{ py: 1 }}>
                  <DashboardIcon sx={{ mr: 2 }} fontSize="small" />
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => navigate(`/users/${user._id}`)} sx={{ py: 1 }}>
                  <PersonIcon sx={{ mr: 2 }} fontSize="small" />
                  Profile
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout} sx={{ py: 1 }}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : !isMobile && !user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 'auto' }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
                variant={isActive('/login') ? 'outlined' : 'text'}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(99, 102, 241, 0.6)',
                  borderRadius: '25px',
                  px: { sm: 2, md: 3 },
                  fontSize: { sm: '0.8rem', md: '0.875rem' },
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    borderColor: 'rgba(99, 102, 241, 0.8)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  },
                }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/register')}
                variant={isActive('/register') ? 'contained' : 'outlined'}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(99, 102, 241, 0.6)',
                  backgroundColor: isActive('/register') ? 'rgba(99, 102, 241, 0.8)' : 'rgba(99, 102, 241, 0.2)',
                  borderRadius: '25px',
                  px: { sm: 2, md: 3 },
                  fontSize: { sm: '0.8rem', md: '0.875rem' },
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.9)',
                    borderColor: 'rgba(99, 102, 241, 0.8)',
                  },
                }}
              >
                Register
              </Button>
            </Box>
          ) : null}

          {/* Mobile Menu Button */}
          <IconButton
            onClick={handleMobileMenuToggle}
            sx={{ 
              display: { xs: 'block', md: 'none' }, 
              color: 'white',
              height: 'auto',
              width: 'auto',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                bgcolor: alpha('#fff', 0.15),
              },
            }}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Menu
          </Typography>
          <IconButton onClick={handleMobileMenuClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Mobile Search */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Search sx={{ width: '100%' }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <form onSubmit={handleSearch} style={{ width: '100%' }}>
              <StyledInputBase
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
                sx={{ width: '100%' }}
              />
            </form>
          </Search>
        </Box>

        <List sx={{ px: 1 }}>
          {/* Navigation Items */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleMobileNavigation('/')}
              sx={{ 
                borderRadius: '12px',
                mb: 0.5,
                bgcolor: isActive('/') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" sx={{ color: 'white' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleMobileNavigation('/resources')}
              sx={{ 
                borderRadius: '12px',
                mb: 0.5,
                bgcolor: isActive('/resources') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText primary="Resources" sx={{ color: 'white' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => handleMobileNavigation('/users')}
              sx={{ 
                borderRadius: '12px',
                mb: 0.5,
                bgcolor: isActive('/users') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Users" sx={{ color: 'white' }} />
            </ListItemButton>
          </ListItem>

          {user && (
            <>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleMobileNavigation('/dashboard')}
                  sx={{ 
                    borderRadius: '12px',
                    mb: 0.5,
                    bgcolor: isActive('/dashboard') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" sx={{ color: 'white' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleMobileNavigation('/upload')}
                  sx={{ 
                    borderRadius: '12px',
                    mb: 0.5,
                    bgcolor: isActive('/upload') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Upload" sx={{ color: 'white' }} />
                </ListItemButton>
              </ListItem>
            </>
          )}

          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

          {/* User Section */}
          {user ? (
            <>
              <ListItem sx={{ px: 2, py: 1 }}>
                <Avatar
                  alt={user.firstName}
                  src={user.profilePicture}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    mr: 2,
                    border: '2px solid rgba(99, 102, 241, 0.4)',
                  }}
                >
                  {user.firstName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    @{user.username}
                  </Typography>
                </Box>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleMobileNavigation(`/users/${user._id}`)}
                  sx={{ 
                    borderRadius: '12px',
                    mb: 0.5,
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Profile" sx={{ color: 'white' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton 
                  onClick={handleLogout}
                  sx={{ 
                    borderRadius: '12px',
                    mb: 0.5,
                    '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'rgba(244, 67, 54, 0.8)', minWidth: 40 }}>
                    <CloseIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" sx={{ color: 'rgba(244, 67, 54, 0.8)' }} />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleMobileNavigation('/login')}
                  sx={{ 
                    borderRadius: '12px',
                    mb: 0.5,
                    bgcolor: isActive('/login') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText primary="Login" sx={{ color: 'white' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleMobileNavigation('/register')}
                  sx={{ 
                    borderRadius: '12px',
                    mb: 0.5,
                    bgcolor: isActive('/register') ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)' }
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    <RegisterIcon />
                  </ListItemIcon>
                  <ListItemText primary="Register" sx={{ color: 'white' }} />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
