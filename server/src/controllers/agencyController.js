const { validationResult } = require('express-validator');
const { Agency, User, Report, sequelize } = require('../models');

/**
 * Get all agencies
 * @route GET /api/agencies
 */
exports.getAgencies = async (req, res, next) => {
  try {
    const agencies = await Agency.findAll({
      attributes: ['id', 'name', 'jurisdiction', 'contactEmail', 'contactPhone']
    });

    res.status(200).json({
      status: 'success',
      data: {
        agencies,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get agency by ID
 * @route GET /api/agencies/:id
 */
exports.getAgencyById = async (req, res, next) => {
  try {
    const agencyId = req.params.id;
    
    const agency = await Agency.findByPk(agencyId);
    
    if (!agency) {
      return res.status(404).json({
        status: 'error',
        message: 'Agency not found',
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        agency,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new agency
 * @route POST /api/agencies
 */
exports.createAgency = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array(),
      });
    }
    
    const {
      name,
      jurisdiction,
      address,
      contactEmail,
      contactPhone,
    } = req.body;
    
    // Create new agency
    const agency = await Agency.create({
      name,
      jurisdiction,
      address,
      contactEmail,
      contactPhone,
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        agency,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update agency information
 * @route PUT /api/agencies/:id
 */
exports.updateAgency = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array(),
      });
    }
    
    const agencyId = req.params.id;
    const {
      name,
      jurisdiction,
      address,
      contactEmail,
      contactPhone,
    } = req.body;
    
    // Find agency
    const agency = await Agency.findByPk(agencyId);
    
    if (!agency) {
      return res.status(404).json({
        status: 'error',
        message: 'Agency not found',
      });
    }
    
    // Update agency
    await agency.update({
      name,
      jurisdiction,
      address,
      contactEmail,
      contactPhone,
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        agency,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all staff members of an agency
 * @route GET /api/agencies/:id/staff
 */
exports.getAgencyStaff = async (req, res, next) => {
  try {
    const agencyId = req.params.id;
    
    // Check if agency exists
    const agency = await Agency.findByPk(agencyId);
    
    if (!agency) {
      return res.status(404).json({
        status: 'error',
        message: 'Agency not found',
      });
    }
    
    // Get staff members
    const staff = await User.findAll({
      where: {
        agencyId,
        role: ['agency_admin', 'agency_staff'],
      },
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role'],
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        staff,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add staff to agency
 * @route POST /api/agencies/:id/staff
 */
exports.addStaffToAgency = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array(),
      });
    }
    
    const agencyId = req.params.id;
    const { userId, role } = req.body;
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Check if agency exists
      const agency = await Agency.findByPk(agencyId, { transaction });
      
      if (!agency) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Agency not found',
        });
      }
      
      // Check if user exists
      const user = await User.findByPk(userId, { transaction });
      
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'User not found',
        });
      }
      
      // Update user role and agency
      await user.update({
        role,
        agencyId,
      }, { transaction });
      
      // Commit transaction
      await transaction.commit();
      
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            agencyId: user.agencyId,
          },
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Remove staff from agency
 * @route DELETE /api/agencies/:id/staff/:userId
 */
exports.removeStaffFromAgency = async (req, res, next) => {
  try {
    const agencyId = req.params.id;
    const userId = req.params.userId;
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Check if agency exists
      const agency = await Agency.findByPk(agencyId, { transaction });
      
      if (!agency) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Agency not found',
        });
      }
      
      // Find user
      const user = await User.findOne({
        where: {
          id: userId,
          agencyId,
        },
        transaction,
      });
      
      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'User not found or not associated with this agency',
        });
      }
      
      // Remove agency association and reset role to citizen
      await user.update({
        role: 'citizen',
        agencyId: null,
      }, { transaction });
      
      // Commit transaction
      await transaction.commit();
      
      res.status(200).json({
        status: 'success',
        message: 'Staff member removed from agency',
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reports assigned to an agency
 * @route GET /api/agencies/:id/reports
 */
exports.getAgencyReports = async (req, res, next) => {
  try {
    const agencyId = req.params.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Check if agency exists
    const agency = await Agency.findByPk(agencyId);
    
    if (!agency) {
      return res.status(404).json({
        status: 'error',
        message: 'Agency not found',
      });
    }
    
    // Build query
    const where = { assignedAgencyId: agencyId };
    if (status) where.status = status;
    
    // Get reports
    const { count, rows: reports } = await Report.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username'],
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['id', 'username', 'firstName', 'lastName'],
        },
      ],
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        reports,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}; 