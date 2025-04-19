import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const ComplaintTracker = () => {
  const { currentUser } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchUserComplaints = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        // In a real app, this would be an API call to fetch user's complaints
        // For now, we'll simulate some complaints
        setTimeout(() => {
          const mockComplaints = [
            {
              id: '1',
              title: 'Noise complaint',
              category: 'noise',
              status: 'resolved',
              createdAt: '2024-04-10T12:00:00Z',
              updatedAt: '2024-04-12T14:30:00Z'
            },
            {
              id: '2',
              title: 'Suspicious activity',
              category: 'safety',
              status: 'pending',
              createdAt: '2024-04-15T08:15:00Z',
              updatedAt: '2024-04-15T08:15:00Z'
            },
            {
              id: '3',
              title: 'Property damage',
              category: 'property',
              status: 'investigating',
              createdAt: '2024-04-08T16:45:00Z',
              updatedAt: '2024-04-09T10:20:00Z'
            }
          ];
          
          setComplaints(mockComplaints);
          setLoading(false);
        }, 1000); // Simulate network delay
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to load your complaints. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchUserComplaints();
  }, [currentUser]);
  
  // Helper function to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Helper function to render status chips with appropriate colors
  const renderStatusChip = (status) => {
    let color;
    switch (status) {
      case 'pending':
        color = 'warning';
        break;
      case 'investigating':
        color = 'info';
        break;
      case 'resolved':
        color = 'success';
        break;
      case 'rejected':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        color={color} 
        size="small" 
      />
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (complaints.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>
        You haven't submitted any complaints yet.
      </Typography>
    );
  }
  
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Title</strong></TableCell>
            <TableCell><strong>Category</strong></TableCell>
            <TableCell><strong>Date Filed</strong></TableCell>
            <TableCell><strong>Last Updated</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id} hover>
              <TableCell>{complaint.title}</TableCell>
              <TableCell>{complaint.category}</TableCell>
              <TableCell>{formatDate(complaint.createdAt)}</TableCell>
              <TableCell>{formatDate(complaint.updatedAt)}</TableCell>
              <TableCell>{renderStatusChip(complaint.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ComplaintTracker; 