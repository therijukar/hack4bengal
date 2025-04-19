import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TodayIcon from '@mui/icons-material/Today';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Define types for our report data
interface Report {
  id: string;
  incidentType: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  emergencyScore: number;
  status: 'pending' | 'reviewing' | 'assigned' | 'resolved' | 'closed';
  isAnonymous: boolean;
  createdAt: string;
  mediaCount: number;
  contactInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

// Mock data for the dashboard
const mockReports: Report[] = [
  {
    id: '1',
    incidentType: 'physical',
    description: 'Witnessed a fight outside a bar. Several people involved, one person appeared to be injured.',
    location: {
      lat: 22.572645,
      lng: 88.363892,
      address: '22 Park Street, Kolkata',
    },
    emergencyScore: 8.7,
    status: 'pending',
    isAnonymous: false,
    createdAt: '2023-05-15T10:30:00Z',
    mediaCount: 2,
    contactInfo: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '9876543210',
    },
  },
  {
    id: '2',
    incidentType: 'harassment',
    description: 'I am being stalked by someone on my way to college. The same person has been following me for the past three days.',
    location: {
      lat: 22.562645,
      lng: 88.373892,
      address: '15 College Street, Kolkata',
    },
    emergencyScore: 7.5,
    status: 'reviewing',
    isAnonymous: false,
    createdAt: '2023-05-14T14:45:00Z',
    mediaCount: 1,
    contactInfo: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '9876543211',
    },
  },
  {
    id: '3',
    incidentType: 'cyber',
    description: 'I have been receiving threatening messages on social media from an unknown account. They have my personal details.',
    location: {
      lat: 22.552645,
      lng: 88.353892,
      address: '7 Salt Lake, Kolkata',
    },
    emergencyScore: 6.2,
    status: 'pending',
    isAnonymous: true,
    createdAt: '2023-05-15T09:15:00Z',
    mediaCount: 3,
  },
  {
    id: '4',
    incidentType: 'physical',
    description: 'Domestic violence in the apartment next door. I can hear screaming and things being broken.',
    location: {
      lat: 22.582645,
      lng: 88.383892,
      address: '33 Howrah Bridge, Kolkata',
    },
    emergencyScore: 9.1,
    status: 'pending',
    isAnonymous: false,
    createdAt: '2023-05-15T11:20:00Z',
    mediaCount: 0,
    contactInfo: {
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      phone: '9876543212',
    },
  },
  {
    id: '5',
    incidentType: 'harassment',
    description: 'Group of individuals constantly harassing shopkeepers in the market area, demanding protection money.',
    location: {
      lat: 22.592645,
      lng: 88.343892,
      address: '45 New Market, Kolkata',
    },
    emergencyScore: 7.8,
    status: 'assigned',
    isAnonymous: true,
    createdAt: '2023-05-14T16:30:00Z',
    mediaCount: 1,
  },
];

// Staff assignment dialog component
interface AssignDialogProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
}

const AssignDialog: React.FC<AssignDialogProps> = ({ open, onClose, report }) => {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock staff data
  const staffMembers = [
    { id: 'staff1', name: 'Officer Singh' },
    { id: 'staff2', name: 'Officer Patel' },
    { id: 'staff3', name: 'Officer Khan' },
    { id: 'staff4', name: 'Officer Sharma' },
  ];

  const handleAssign = () => {
    if (!selectedStaff) return;
    
    setIsSubmitting(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      // Reset and close dialog after delay
      setTimeout(() => {
        setSelectedStaff('');
        setNote('');
        setSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Case #{report?.id}
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ my: 2 }}>
            Case successfully assigned to staff member.
          </Alert>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              Incident Type: {report?.incidentType === 'physical' ? 'Physical Violence' : 
                             report?.incidentType === 'cyber' ? 'Cyber Violence/Harassment' : 
                             report?.incidentType === 'harassment' ? 'Harassment/Stalking' : 'Other'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Emergency Score: <Chip 
                color={report?.emergencyScore && report.emergencyScore > 8 ? 'error' : 
                      report?.emergencyScore && report.emergencyScore > 6 ? 'warning' : 'info'} 
                label={report?.emergencyScore} 
                size="small" 
              />
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Assign to Staff</InputLabel>
              <Select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                label="Assign to Staff"
              >
                {staffMembers.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Assignment Note"
              multiline
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions for the assigned staff member..."
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Priority</InputLabel>
              <Select
                defaultValue="high"
                label="Priority"
              >
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleAssign} 
          variant="contained" 
          color="primary" 
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
          disabled={!selectedStaff || isSubmitting || success}
        >
          {isSubmitting ? 'Assigning...' : 'Assign Case'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Report detail view
interface ReportDetailProps {
  report: Report;
  onAssign: (report: Report) => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onAssign }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Case #{report.id}
              </Typography>
              <Chip 
                color={report.emergencyScore > 8 ? 'error' : 
                      report.emergencyScore > 6 ? 'warning' : 'info'} 
                icon={<PriorityHighIcon />} 
                label={`Score: ${report.emergencyScore}`} 
              />
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <TodayIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              Reported on {new Date(report.createdAt).toLocaleString()}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <LocationOnIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
              {report.location.address}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Incident Type: {report.incidentType === 'physical' ? 'Physical Violence' : 
                             report.incidentType === 'cyber' ? 'Cyber Violence/Harassment' : 
                             report.incidentType === 'harassment' ? 'Harassment/Stalking' : 'Other'}
            </Typography>
            <Typography variant="body1">
              {report.description}
            </Typography>
          </Grid>
          
          {report.mediaCount > 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                {report.mediaCount} media file(s) attached
              </Typography>
            </Grid>
          )}
          
          {!report.isAnonymous && report.contactInfo && (
            <Grid item xs={12}>
              <Box mt={2} p={2} bgcolor="background.default" borderRadius={1}>
                <Typography variant="subtitle2" gutterBottom>
                  Reporter Contact Information
                </Typography>
                <Typography variant="body2">
                  Name: {report.contactInfo.name}
                </Typography>
                <Typography variant="body2">
                  Email: {report.contactInfo.email}
                </Typography>
                <Typography variant="body2">
                  Phone: {report.contactInfo.phone}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          variant="outlined" 
          startIcon={<PhoneIcon />}
          disabled={report.isAnonymous || !report.contactInfo}
        >
          Contact Reporter
        </Button>
        <Button 
          size="small" 
          variant="contained" 
          color="primary"
          startIcon={<AssignmentIcon />}
          onClick={() => onAssign(report)}
        >
          Assign Case
        </Button>
      </CardActions>
    </Card>
  );
};

// Main Dashboard component
const Dashboard: React.FC = () => {
  // Add authentication check
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Define all state hooks at the top level of the component
  const [tabValue, setTabValue] = useState(0);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [emergencyScoreFilter, setEmergencyScoreFilter] = useState<string>('all');
  
  // Check if user is admin and redirect if not
  useEffect(() => {
    if (!auth.loading && !auth.isSuperAdmin()) {
      console.log('Unauthorized access to dashboard, redirecting');
      navigate('/');
    }
  }, [auth, navigate]);
  
  // Load mock data - only fetch data if user is admin
  useEffect(() => {
    if (!auth.loading && auth.isSuperAdmin()) {
      // Simulate API call
      setTimeout(() => {
        setReports(mockReports);
        setLoading(false);
      }, 1000);
    }
  }, [auth]);
  
  // If still loading, show a loading indicator
  if (auth.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // If not admin, don't render anything (will be redirected by useEffect)
  if (!auth.isSuperAdmin()) {
    return null;
  }

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter reports based on search query and filters
  const filteredReports = reports.filter(report => {
    // Status filter
    if (statusFilter !== 'all' && report.status !== statusFilter) {
      return false;
    }
    
    // Emergency score filter
    if (emergencyScoreFilter === 'high' && report.emergencyScore <= 8) {
      return false;
    } else if (emergencyScoreFilter === 'medium' && (report.emergencyScore <= 6 || report.emergencyScore > 8)) {
      return false;
    } else if (emergencyScoreFilter === 'low' && report.emergencyScore > 6) {
      return false;
    }
    
    // Search query
    const searchLower = searchQuery.toLowerCase();
    return searchQuery === '' || 
           report.description.toLowerCase().includes(searchLower) ||
           report.location.address.toLowerCase().includes(searchLower) ||
           (report.contactInfo?.name?.toLowerCase().includes(searchLower) || false);
  });

  // Sort reports by emergency score
  const sortedReports = [...filteredReports].sort((a, b) => b.emergencyScore - a.emergencyScore);

  // Handle report selection
  const handleReportSelect = (report: Report) => {
    setSelectedReport(report);
  };

  // Handle assignment dialog
  const handleAssignDialogOpen = (report: Report) => {
    setSelectedReport(report);
    setAssignDialogOpen(true);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Agency Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label={
            <Badge badgeContent={sortedReports.filter(r => r.status === 'pending').length} color="error">
              Priority Queue
            </Badge>
          } />
          <Tab label="Map View" />
          <Tab label="Reports" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Search and Filter section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search reports..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="reviewing">Reviewing</MenuItem>
            <MenuItem value="assigned">Assigned</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={emergencyScoreFilter}
            onChange={(e) => setEmergencyScoreFilter(e.target.value)}
            label="Priority"
          >
            <MenuItem value="all">All Priorities</MenuItem>
            <MenuItem value="high">High (8-10)</MenuItem>
            <MenuItem value="medium">Medium (6-8)</MenuItem>
            <MenuItem value="low">Low (0-6)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Tab panels */}
          {tabValue === 0 && (
            // Priority Queue View
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 'calc(100vh - 250px)', overflow: 'auto' }}>
                  <Typography variant="h6" gutterBottom>
                    Cases ({sortedReports.length})
                  </Typography>
                  
                  {sortedReports.length === 0 ? (
                    <Typography variant="body1" align="center" sx={{ py: 3 }}>
                      No reports match your filters
                    </Typography>
                  ) : (
                    sortedReports.map((report) => (
                      <Card 
                        key={report.id} 
                        sx={{ 
                          mb: 2, 
                          cursor: 'pointer',
                          border: selectedReport?.id === report.id ? '2px solid' : '1px solid',
                          borderColor: selectedReport?.id === report.id ? 'primary.main' : 'divider',
                        }}
                        onClick={() => handleReportSelect(report)}
                      >
                        <CardContent sx={{ pb: 1 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1">
                              Case #{report.id} - {report.incidentType}
                            </Typography>
                            <Chip 
                              size="small"
                              color={report.emergencyScore > 8 ? 'error' : 
                                    report.emergencyScore > 6 ? 'warning' : 'info'} 
                              label={report.emergencyScore} 
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {report.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            {new Date(report.createdAt).toLocaleString()} | {report.location.address}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, height: 'calc(100vh - 250px)', overflow: 'auto' }}>
                  {selectedReport ? (
                    <ReportDetail 
                      report={selectedReport} 
                      onAssign={handleAssignDialogOpen}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        Select a case to view details
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
          
          {tabValue === 1 && (
            // Map View
            <Paper sx={{ height: 'calc(100vh - 250px)', p: 2 }}>
              <Box sx={{ height: '100%', width: '100%' }}>
                <MapContainer 
                  center={[22.572645, 88.363892]} 
                  zoom={12} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {sortedReports.map((report) => (
                    <Marker 
                      key={report.id}
                      position={[report.location.lat, report.location.lng]}
                      eventHandlers={{
                        click: () => {
                          handleReportSelect(report);
                        },
                      }}
                    >
                      <Popup>
                        <Typography variant="subtitle2">
                          Case #{report.id} - {report.incidentType}
                        </Typography>
                        <Typography variant="body2">
                          Emergency Score: {report.emergencyScore}
                        </Typography>
                        <Typography variant="body2">
                          Status: {report.status}
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={() => handleAssignDialogOpen(report)}
                          sx={{ mt: 1 }}
                        >
                          Assign
                        </Button>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            </Paper>
          )}
        </>
      )}
      
      {/* Assignment Dialog */}
      <AssignDialog 
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        report={selectedReport}
      />
    </Box>
  );
};

export default Dashboard; 