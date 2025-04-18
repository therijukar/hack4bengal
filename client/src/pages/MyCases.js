import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Define case status colors
const statusColors = {
  pending: 'warning',
  reviewing: 'info',
  assigned: 'primary',
  resolved: 'success',
  closed: 'default'
};

// Define case interface
const MyCases = () => {
  const auth = useContext(AuthContext);
  const currentUser = auth?.currentUser;
  const navigate = useNavigate();
  
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth?.isAuthenticated || !auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Fetch user's cases
    const fetchMyCases = async () => {
      setLoading(true);
      try {
        // In a real app, you would make an API call here
        // For now, we'll use mock data
        setTimeout(() => {
          const mockCases = [
            {
              id: '1',
              reportId: 'R-20230515-001',
              incidentType: 'harassment',
              description: 'I am being stalked by someone on my way to college.',
              status: 'assigned',
              createdAt: '2023-05-15T10:30:00Z',
              updatedAt: '2023-05-16T14:20:00Z',
              assignedOfficer: 'Officer Patel',
              comments: [
                {
                  id: 'c1',
                  text: 'We have assigned Officer Patel to your case.',
                  author: 'System',
                  timestamp: '2023-05-16T14:20:00Z'
                }
              ]
            },
            {
              id: '2',
              reportId: 'R-20230510-003',
              incidentType: 'cyber',
              description: 'Received threatening messages on social media.',
              status: 'reviewing',
              createdAt: '2023-05-10T15:45:00Z',
              updatedAt: '2023-05-11T09:10:00Z',
              assignedOfficer: null,
              comments: [
                {
                  id: 'c2',
                  text: 'Your case is being reviewed by our cyber crime division.',
                  author: 'System',
                  timestamp: '2023-05-11T09:10:00Z'
                }
              ]
            }
          ];
          setCases(mockCases);
          setLoading(false);
        }, 1500); // Simulate network delay
      } catch (error) {
        console.error('Error fetching cases:', error);
        setLoading(false);
        setError('Failed to load cases. Please try again later.');
      }
    };

    fetchMyCases();
  }, [auth, navigate]);

  const handleCaseSelect = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const handleOpenCommentDialog = () => {
    setCommentDialogOpen(true);
  };

  const handleCloseCommentDialog = () => {
    setCommentDialogOpen(false);
    setComment('');
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() || !currentUser) return;
    
    setSubmitting(true);
    
    try {
      // In a real app, you would make an API call here
      // For now, we'll simulate it
      setTimeout(() => {
        const newComment = {
          id: `c${Date.now()}`,
          text: comment,
          author: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'User',
          timestamp: new Date().toISOString()
        };
        
        const updatedCases = cases.map(c => {
          if (c.id === selectedCase.id) {
            return {
              ...c,
              comments: [...c.comments, newComment]
            };
          }
          return c;
        });
        
        setCases(updatedCases);
        
        // Update selected case to show the new comment
        setSelectedCase({
          ...selectedCase,
          comments: [...selectedCase.comments, newComment]
        });
        
        handleCloseCommentDialog();
        setSubmitting(false);
      }, 1000); // Simulate network delay
    } catch (error) {
      console.error('Error submitting comment:', error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Cases
      </Typography>
      
      {cases.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">You don't have any cases yet.</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            href="/report" 
            sx={{ mt: 2 }}
          >
            Report an Incident
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={selectedCase ? 5 : 12}>
            <Typography variant="h6" gutterBottom>
              Your Reported Cases
            </Typography>
            
            {cases.map((caseItem) => (
              <Card 
                key={caseItem.id} 
                sx={{ 
                  mb: 2, 
                  cursor: 'pointer',
                  border: selectedCase?.id === caseItem.id ? '2px solid' : 'none',
                  borderColor: 'primary.main'
                }}
                onClick={() => handleCaseSelect(caseItem)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">
                      Case #{caseItem.reportId}
                    </Typography>
                    <Chip 
                      label={caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                      color={statusColors[caseItem.status]}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {caseItem.description.length > 100 
                      ? `${caseItem.description.substring(0, 100)}...` 
                      : caseItem.description}
                  </Typography>
                  
                  <Typography variant="caption" display="block">
                    Reported on: {new Date(caseItem.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Grid>
          
          {selectedCase && (
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Case Details
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Case ID:</strong> {selectedCase.reportId}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Type:</strong> {selectedCase.incidentType.charAt(0).toUpperCase() + selectedCase.incidentType.slice(1)}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Status:</strong>{' '}
                    <Chip 
                      size="small"
                      label={selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
                      color={statusColors[selectedCase.status]}
                    />
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Reported:</strong> {new Date(selectedCase.createdAt).toLocaleString()}
                  </Typography>
                  {selectedCase.assignedOfficer && (
                    <Typography variant="body1" gutterBottom>
                      <strong>Assigned Officer:</strong> {selectedCase.assignedOfficer}
                    </Typography>
                  )}
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {selectedCase.description}
                </Typography>
                
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Case Activity
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={handleOpenCommentDialog}
                  >
                    Add Comment
                  </Button>
                </Box>
                
                {selectedCase.comments.map((comment) => (
                  <Paper key={comment.id} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <Typography variant="body1">
                      {comment.text}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        By: {comment.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Add Comment Dialog */}
      <Dialog open={commentDialogOpen} onClose={handleCloseCommentDialog}>
        <DialogTitle>Add a Comment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add a comment or question about your case. This will be visible to the assigned officers.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Your Comment"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCommentDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitComment} 
            disabled={!comment.trim() || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCases; 