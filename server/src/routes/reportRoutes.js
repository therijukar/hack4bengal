const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

// Validation middleware for report submission
const validateReport = [
  body('incidentType')
    .isIn(['physical', 'cyber', 'harassment', 'other'])
    .withMessage('Invalid incident type'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('location.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude value'),
  body('location.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude value'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean value'),
];

/**
 * @route POST /api/reports
 * @desc Submit a new report
 * @access Public
 */
router.post(
  '/', 
  uploadMiddleware.array('media', 5), 
  validateReport, 
  reportController.submitReport
);

/**
 * @route GET /api/reports
 * @desc Get all reports (with pagination and filtering)
 * @access Private (agency users only)
 */
router.get('/', authenticate, reportController.getReports);

/**
 * @route GET /api/reports/queue
 * @desc Get priority queue of reports
 * @access Private (agency users only)
 */
router.get('/queue', authenticate, reportController.getPriorityQueue);

/**
 * @route GET /api/reports/:id
 * @desc Get a single report by ID
 * @access Private (with authorization)
 */
router.get('/:id', authenticate, reportController.getReportById);

/**
 * @route PATCH /api/reports/:id/status
 * @desc Update report status
 * @access Private (agency users only)
 */
router.patch(
  '/:id/status', 
  authenticate, 
  [
    body('status')
      .isIn(['pending', 'reviewing', 'assigned', 'resolved', 'closed'])
      .withMessage('Invalid status value'),
    body('note').optional().isString(),
  ],
  reportController.updateReportStatus
);

/**
 * @route POST /api/reports/:id/assign
 * @desc Assign report to agency staff
 * @access Private (agency admin only)
 */
router.post(
  '/:id/assign',
  authenticate,
  [
    body('staffId').isUUID().withMessage('Invalid staff ID'),
    body('priority')
      .optional()
      .isIn(['critical', 'high', 'medium', 'low'])
      .withMessage('Invalid priority value'),
    body('note').optional().isString(),
  ],
  reportController.assignReport
);

/**
 * @route GET /api/reports/user/me
 * @desc Get reports submitted by the authenticated user
 * @access Private
 */
router.get('/user/me', authenticate, reportController.getMyReports);

/**
 * @route GET /api/reports/assigned/me
 * @desc Get reports assigned to the authenticated staff member
 * @access Private (agency staff only)
 */
router.get('/assigned/me', authenticate, reportController.getAssignedReports);

/**
 * @route POST /api/reports/:id/media
 * @desc Add additional media to an existing report
 * @access Private (with authorization)
 */
router.post(
  '/:id/media', 
  authenticate, 
  uploadMiddleware.array('media', 5), 
  reportController.addReportMedia
);

module.exports = router; 