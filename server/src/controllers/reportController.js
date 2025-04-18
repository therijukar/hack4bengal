const { validationResult } = require('express-validator');
const { 
  Report, 
  ReportMedia, 
  ReportAnalysis, 
  User, 
  Agency, 
  CaseActivity,
  sequelize
} = require('../models');
const axios = require('axios');
const path = require('path');

/**
 * Submit a new report
 * @route POST /api/reports
 */
exports.submitReport = async (req, res, next) => {
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
      incidentType, 
      description, 
      isAnonymous = false, 
      location 
    } = req.body;
    
    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Create report
      const report = await Report.create({
        userId: req.user ? req.user.id : null,
        incidentType,
        description,
        locationLat: location?.lat || null,
        locationLng: location?.lng || null,
        locationAddress: location?.address || null,
        isAnonymous,
        status: 'pending',
      }, { transaction });

      // Handle uploaded media files
      let mediaFiles = [];
      if (req.files && req.files.length > 0) {
        mediaFiles = await Promise.all(
          req.files.map(async (file) => {
            return ReportMedia.create({
              reportId: report.id,
              fileType: getFileType(file.mimetype),
              filePath: `/uploads/${file.filename}`,
              fileName: file.filename,
              fileSize: file.size,
            }, { transaction });
          })
        );
      }

      // Initially set default analysis values
      let emergencyScore = 0;
      
      // If AI service is available, analyze report
      try {
        // Request to AI service for analysis
        const aiResponse = await axios.post(process.env.AI_SERVICE_URL + '/analyze', {
          reportId: report.id,
          text: description,
          userId: req.user ? req.user.id : null,
          mediaFiles: mediaFiles.map(m => m.filePath),
        });
        
        // Create report analysis from AI response
        if (aiResponse.data) {
          const { 
            textSeverityScore, 
            mediaSeverityScore, 
            userCredibilityScore,
            spamProbability,
            emergencyScore: calculatedScore,
            aiNotes
          } = aiResponse.data;
          
          await ReportAnalysis.create({
            reportId: report.id,
            textSeverityScore,
            mediaSeverityScore,
            userCredibilityScore,
            spamProbability,
            emergencyScore: calculatedScore,
            aiNotes
          }, { transaction });
          
          emergencyScore = calculatedScore;
          
          // Update report with emergency score and spam flag
          await report.update({
            emergencyScore,
            isSpam: spamProbability > 0.8 // Mark as spam if probability > 80%
          }, { transaction });
        }
      } catch (aiError) {
        console.error('AI service error:', aiError.message);
        // If AI service fails, create a basic analysis with default values
        await ReportAnalysis.create({
          reportId: report.id,
          textSeverityScore: 0,
          mediaSeverityScore: 0,
          userCredibilityScore: req.user ? req.user.credibilityScore : 1,
          spamProbability: 0,
          emergencyScore: 0,
          aiNotes: 'AI analysis unavailable'
        }, { transaction });
      }

      // Commit transaction
      await transaction.commit();

      res.status(201).json({
        status: 'success',
        data: {
          report: {
            id: report.id,
            incidentType: report.incidentType,
            description: report.description,
            isAnonymous: report.isAnonymous,
            status: report.status,
            emergencyScore,
            createdAt: report.createdAt,
          },
          media: mediaFiles,
        },
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reports (with pagination)
 * @route GET /api/reports
 */
exports.getReports = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      incidentType, 
      agencyId, 
      sortBy = 'emergencyScore', 
      order = 'DESC' 
    } = req.query;
    
    // Build query options
    const options = {
      offset: (page - 1) * limit,
      limit: parseInt(limit),
      order: [[sortBy, order]],
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username', 'credibilityScore'],
        },
        {
          model: Agency,
          as: 'assignedAgency',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['id', 'username', 'firstName', 'lastName'],
        },
        {
          model: ReportAnalysis,
          as: 'analysis',
        },
      ],
    };
    
    // Add filters
    const where = {};
    if (status) where.status = status;
    if (incidentType) where.incidentType = incidentType;
    if (agencyId) where.assignedAgencyId = agencyId;
    
    // Add where clause to options
    if (Object.keys(where).length > 0) {
      options.where = where;
    }

    // Find reports with pagination
    const { count, rows: reports } = await Report.findAndCountAll(options);

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

/**
 * Get priority queue of reports
 * @route GET /api/reports/queue
 */
exports.getPriorityQueue = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get reports sorted by emergency score, only pending and reviewing
    const reports = await Report.findAll({
      where: {
        status: ['pending', 'reviewing'],
        isSpam: false,
      },
      order: [['emergencyScore', 'DESC']],
      limit: parseInt(limit),
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username', 'credibilityScore'],
        },
        {
          model: ReportAnalysis,
          as: 'analysis',
        },
      ],
    });

    res.status(200).json({
      status: 'success',
      data: {
        reports,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single report by ID
 * @route GET /api/reports/:id
 */
exports.getReportById = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    
    // Find report with all associations
    const report = await Report.findByPk(reportId, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username', 'credibilityScore'],
        },
        {
          model: Agency,
          as: 'assignedAgency',
          attributes: ['id', 'name', 'jurisdiction'],
        },
        {
          model: User,
          as: 'assignedStaff',
          attributes: ['id', 'username', 'firstName', 'lastName'],
        },
        {
          model: ReportMedia,
          as: 'media',
        },
        {
          model: ReportAnalysis,
          as: 'analysis',
        },
        {
          model: CaseActivity,
          as: 'activities',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'role'],
            },
          ],
        },
      ],
    });

    if (!report) {
      return res.status(404).json({
        status: 'error',
        message: 'Report not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update report status
 * @route PATCH /api/reports/:id/status
 */
exports.updateReportStatus = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array(),
      });
    }

    const reportId = req.params.id;
    const { status, note } = req.body;
    const userId = req.user.id;
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Find report
      const report = await Report.findByPk(reportId, { transaction });
      
      if (!report) {
        await transaction.rollback();
        return res.status(404).json({
          status: 'error',
          message: 'Report not found',
        });
      }
      
      // Update report status
      await report.update({ status }, { transaction });
      
      // Log activity
      await CaseActivity.create({
        reportId,
        userId,
        activityType: 'status_update',
        description: `Status updated to ${status}${note ? ': ' + note : ''}`,
      }, { transaction });
      
      // Commit transaction
      await transaction.commit();
      
      res.status(200).json({
        status: 'success',
        data: {
          report: {
            id: report.id,
            status: report.status,
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
 * Assign report to agency staff
 * @route POST /api/reports/:id/assign
 */
exports.assignReport = async (req, res, next) => {
  // Placeholder implementation
  res.status(501).json({
    status: 'error',
    message: 'Not implemented yet',
  });
};

/**
 * Get reports submitted by the authenticated user
 * @route GET /api/reports/user/me
 */
exports.getMyReports = async (req, res, next) => {
  // Placeholder implementation
  res.status(501).json({
    status: 'error',
    message: 'Not implemented yet',
  });
};

/**
 * Get reports assigned to the authenticated staff member
 * @route GET /api/reports/assigned/me
 */
exports.getAssignedReports = async (req, res, next) => {
  // Placeholder implementation
  res.status(501).json({
    status: 'error',
    message: 'Not implemented yet',
  });
};

/**
 * Add additional media to an existing report
 * @route POST /api/reports/:id/media
 */
exports.addReportMedia = async (req, res, next) => {
  // Placeholder implementation
  res.status(501).json({
    status: 'error',
    message: 'Not implemented yet',
  });
};

/**
 * Helper function to determine file type from mimetype
 */
function getFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'document';
} 