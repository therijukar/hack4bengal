const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const agencyController = require('../controllers/agencyController');
const { authenticate, authorize } = require('../middleware/auth');

// Validation middleware for agency creation
const validateAgency = [
  body('name')
    .notEmpty()
    .withMessage('Agency name is required')
    .isLength({ max: 100 })
    .withMessage('Agency name must not exceed 100 characters'),
  body('jurisdiction')
    .notEmpty()
    .withMessage('Jurisdiction is required')
    .isLength({ max: 100 })
    .withMessage('Jurisdiction must not exceed 100 characters'),
  body('address')
    .optional()
    .isString()
    .withMessage('Address must be a string'),
  body('contactEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  body('contactPhone')
    .optional()
    .isString()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),
];

/**
 * @route GET /api/agencies
 * @desc Get all agencies
 * @access Public
 */
router.get('/', agencyController.getAgencies);

/**
 * @route GET /api/agencies/:id
 * @desc Get agency by ID
 * @access Public
 */
router.get('/:id', agencyController.getAgencyById);

/**
 * @route POST /api/agencies
 * @desc Create a new agency
 * @access Private (admin only)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateAgency,
  agencyController.createAgency
);

/**
 * @route PUT /api/agencies/:id
 * @desc Update agency information
 * @access Private (admin only)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateAgency,
  agencyController.updateAgency
);

/**
 * @route GET /api/agencies/:id/staff
 * @desc Get all staff members of an agency
 * @access Private (agency admin and staff only)
 */
router.get(
  '/:id/staff',
  authenticate,
  authorize(['agency_admin', 'agency_staff']),
  agencyController.getAgencyStaff
);

/**
 * @route POST /api/agencies/:id/staff
 * @desc Add staff to agency
 * @access Private (agency admin only)
 */
router.post(
  '/:id/staff',
  authenticate,
  authorize('agency_admin'),
  [
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('role')
      .isIn(['agency_admin', 'agency_staff'])
      .withMessage('Invalid role'),
  ],
  agencyController.addStaffToAgency
);

/**
 * @route DELETE /api/agencies/:id/staff/:userId
 * @desc Remove staff from agency
 * @access Private (agency admin only)
 */
router.delete(
  '/:id/staff/:userId',
  authenticate,
  authorize('agency_admin'),
  agencyController.removeStaffFromAgency
);

/**
 * @route GET /api/agencies/:id/reports
 * @desc Get all reports assigned to an agency
 * @access Private (agency admin and staff only)
 */
router.get(
  '/:id/reports',
  authenticate,
  authorize(['agency_admin', 'agency_staff']),
  agencyController.getAgencyReports
);

module.exports = router; 