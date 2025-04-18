import React, { useContext, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme,
  Chip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import ReportIcon from '@mui/icons-material/Report';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { AuthContext } from '../context/AuthContext';
import { User } from '../types/user';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
  
  // Use AuthContext safely
  const auth = useContext(AuthContext);

  // Add effect to update login state when auth context changes
  useEffect(() => {
    const loggedIn = auth.isAuthenticated();
    console.log('Auth state in Header:', { 
      loggedIn, 
      user: auth.currentUser,
      isSuperAdmin: auth.isSuperAdmin()
    });
    setIsUserLoggedIn(loggedIn);
  }, [auth, auth.currentUser, auth.isAuthenticated, auth.isSuperAdmin]);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = () => {
    auth.logout();
    setIsUserLoggedIn(false);
    handleMenuClose();
    navigate('/');
  };

  // Helper to get user's display name
  const getUserName = (user: User | null): string => {
    if (!user) return '';
    return user.firstName || user.username || '';
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={RouterLink} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ReportIcon sx={{ mr: 1 }} />
          SafeGuard
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuClick}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleNavigation('/report')}>Report Incident</MenuItem>
              
              {isUserLoggedIn ? (
                <>
                  {auth.isSuperAdmin() && (
                    <MenuItem onClick={() => handleNavigation('/dashboard')}>
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => handleNavigation('/my-cases')}>My Cases</MenuItem>
                  <MenuItem onClick={() => handleNavigation('/profile')}>Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={() => handleNavigation('/login')}>Login</MenuItem>
                  <MenuItem onClick={() => handleNavigation('/register')}>Register</MenuItem>
                </>
              )}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/report"
              startIcon={<ReportIcon />}
              sx={{ mr: 1 }}
            >
              Report Incident
            </Button>
            
            {isUserLoggedIn ? (
              <>
                {auth.isSuperAdmin() && (
                  <Button 
                    color="inherit" 
                    component={RouterLink} 
                    to="/dashboard"
                    startIcon={<DashboardIcon />}
                    sx={{ mr: 1 }}
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/my-cases"
                  startIcon={<ListAltIcon />}
                  sx={{ mr: 1 }}
                >
                  My Cases
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  {auth.currentUser && (
                    <Chip
                      icon={<PersonIcon />}
                      label={getUserName(auth.currentUser)}
                      color="secondary"
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1, color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                    />
                  )}
                  <Button 
                    color="inherit"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  component={RouterLink} 
                  to="/login"
                  sx={{ mr: 1 }}
                >
                  Login
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  component={RouterLink} 
                  to="/register"
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header; 