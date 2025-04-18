const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const ReportMedia = sequelize.define(
    'ReportMedia',
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
      fileType: {
        type: DataTypes.ENUM('image', 'video', 'audio', 'document'),
        allowNull: false,
      },
      filePath: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mediaSeverityScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'report_media',
      timestamps: true,
      updatedAt: false,
    }
  );

  // Define associations
  ReportMedia.associate = (models) => {
    ReportMedia.belongsTo(models.Report, {
      foreignKey: 'reportId',
      as: 'report',
    });
  };

  return ReportMedia;
}; 