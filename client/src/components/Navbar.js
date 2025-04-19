import React, { useContext, useState, useEffect } from 'react';
import { AppBar, Toolbar, Button, Typography, Container, IconButton, Box, useMediaQuery, Menu, MenuItem, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';

const Navbar = () => {
  const { currentUser, isAuthenticated, logout, isSuperAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Effect to log auth state for debugging
  useEffect(() => {
    console.log('Navbar auth state:', { 
      isAuthenticated: isAuthenticated(),
      currentUser,
      isSuperAdmin: isSuperAdmin()
    });
  }, [currentUser, isAuthenticated, isSuperAdmin]);

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Report Incident', path: '/report-incident' },
    { name: 'Dashboard', path: '/dashboard', authRequired: true },
  ];

  const renderMobileMenu = () => (
    <Menu
      anchorEl={mobileMenuAnchor}
      open={Boolean(mobileMenuAnchor)}
      onClose={handleMobileMenuClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {navLinks.map((link) => {
        // Skip dashboard link for unauthenticated users
        if (link.authRequired && !isAuthenticated()) return null;
        
        return (
          <MenuItem 
            key={link.name} 
            onClick={handleMobileMenuClose}
            component={RouterLink} 
            to={link.path}
          >
            {link.name}
          </MenuItem>
        );
      })}
      
      <Divider />
      
      {isAuthenticated() ? (
        [
          <MenuItem key="profile" onClick={handleMobileMenuClose} component={RouterLink} to="/profile">
            Profile
          </MenuItem>,
          <MenuItem key="logout" onClick={handleLogout}>
            Logout
          </MenuItem>
        ]
      ) : (
        [
          <MenuItem key="login" onClick={handleMobileMenuClose} component={RouterLink} to="/login">
            Login
          </MenuItem>,
          <MenuItem key="register" onClick={handleMobileMenuClose} component={RouterLink} to="/register">
            Register
          </MenuItem>
        ]
      )}
    </Menu>
  );

  const renderUserMenu = () => (
    <Menu
      anchorEl={userMenuAnchor}
      open={Boolean(userMenuAnchor)}
      onClose={handleUserMenuClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem onClick={handleUserMenuClose} component={RouterLink} to="/profile">
        Profile
      </MenuItem>
      {isSuperAdmin() && (
        <MenuItem onClick={handleUserMenuClose} component={RouterLink} to="/admin">
          Admin Panel
        </MenuItem>
      )}
      <MenuItem onClick={handleLogout}>
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar position="sticky" color="primary" sx={{ backgroundColor: '#2A335B' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo/Brand */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontWeight: 'bold',
              letterSpacing: '1px',
            }}
          >
            CrimeReport
          </Typography>

          {/* Mobile view */}
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              {renderMobileMenu()}
            </>
          ) : (
            /* Desktop view */
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Nav links */}
              {navLinks.map((link) => {
                // Skip dashboard link for unauthenticated users
                if (link.authRequired && !isAuthenticated()) return null;
                
                return (
                  <Button
                    key={link.name}
                    component={RouterLink}
                    to={link.path}
                    color="inherit"
                    sx={{ textTransform: 'none', fontSize: '1rem' }}
                  >
                    {link.name}
                  </Button>
                );
              })}

              {/* Auth buttons */}
              {isAuthenticated() ? (
                <Box>
                  <IconButton
                    color="inherit"
                    onClick={handleUserMenuOpen}
                    sx={{ ml: 1 }}
                  >
                    <PersonIcon />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {currentUser?.firstName || currentUser?.username || 'User'}
                    </Typography>
                  </IconButton>
                  {renderUserMenu()}
                </Box>
              ) : (
                <Box>
                  <Button
                    component={RouterLink}
                    to="/login"
                    color="inherit"
                    sx={{ textTransform: 'none', fontSize: '1rem' }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    color="success"
                    sx={{ textTransform: 'none', fontSize: '1rem', ml: 1 }}
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 