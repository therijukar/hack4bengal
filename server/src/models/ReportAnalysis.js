const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const ReportAnalysis = sequelize.define(
    'ReportAnalysis',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      reportId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Reports',
          key: 'id',
        },
      },
      textSeverityScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      mediaSeverityScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      userCredibilityScore: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
      },
      spamProbability: {
        type: DataTypes.DECIMAL(5, 4),
        allowNull: true,
      },
      emergencyScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      aiNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: 'report_analysis',
      timestamps: true,
    }
  );

  // Define associations
  ReportAnalysis.associate = (models) => {
    ReportAnalysis.belongsTo(models.Report, {
      foreignKey: 'reportId',
      as: 'report',
    });
  };

  return ReportAnalysis;
}; 