const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define(
    'Report',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      incidentType: {
        type: DataTypes.ENUM('physical', 'cyber', 'harassment', 'other'),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      locationLat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      locationLng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      locationAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isAnonymous: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      emergencyScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'reviewing', 'assigned', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      assignedAgencyId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Agencies',
          key: 'id',
        },
      },
      assignedStaffId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      isSpam: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'reports',
      timestamps: true,
    }
  );

  // Define associations
  Report.associate = (models) => {
    Report.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'reporter',
    });

    Report.belongsTo(models.Agency, {
      foreignKey: 'assignedAgencyId',
      as: 'assignedAgency',
    });

    Report.belongsTo(models.User, {
      foreignKey: 'assignedStaffId',
      as: 'assignedStaff',
    });

    Report.hasMany(models.ReportMedia, {
      foreignKey: 'reportId',
      as: 'media',
    });

    Report.hasOne(models.ReportAnalysis, {
      foreignKey: 'reportId',
      as: 'analysis',
    });

    Report.hasMany(models.CaseActivity, {
      foreignKey: 'reportId',
      as: 'activities',
    });
  };

  return Report;
}; 