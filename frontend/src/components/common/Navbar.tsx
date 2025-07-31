import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  InputBase,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {/* Logo */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 0, 
            mr: 3, 
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
          onClick={() => navigate('/')}
        >
          <SchoolIcon />
          Educate
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ 
              fontWeight: isActive('/') ? 600 : 400,
              bgcolor: isActive('/') ? alpha('#fff', 0.1) : 'transparent'
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
              bgcolor: isActive('/resources') ? alpha('#fff', 0.1) : 'transparent'
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
              bgcolor: isActive('/users') ? alpha('#fff', 0.1) : 'transparent'
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
                  bgcolor: isActive('/dashboard') ? alpha('#fff', 0.1) : 'transparent'
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
                  bgcolor: isActive('/upload') ? alpha('#fff', 0.1) : 'transparent'
                }}
              >
                Upload
              </Button>
            </>
          )}
        </Box>

        {/* Search Bar */}
        <Search sx={{ mx: 2 }}>
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

        {/* User Section */}
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notifications */}
            <IconButton color="inherit">
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar
                alt={user.firstName}
                src={user.profilePicture}
                sx={{ width: 32, height: 32 }}
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
            >
              <MenuItem disabled>
                <Typography variant="body2" color="textSecondary">
                  {user.firstName} {user.lastName}
                </Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" color="textSecondary">
                  @{user.username}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => navigate('/dashboard')}>
                <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => navigate(`/users/${user._id}`)}>
                <PersonIcon sx={{ mr: 1 }} fontSize="small" />
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              variant={isActive('/login') ? 'outlined' : 'text'}
            >
              Login
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/register')}
              variant={isActive('/register') ? 'outlined' : 'text'}
            >
              Register
            </Button>
          </Box>
        )}

        {/* Mobile Menu */}
        <IconButton
          sx={{ display: { xs: 'block', md: 'none' }, ml: 1 }}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
