const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const CaseActivity = sequelize.define(
    'CaseActivity',
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
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      activityType: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'case_activities',
      timestamps: true,
      updatedAt: false,
    }
  );

  // Define associations
  CaseActivity.associate = (models) => {
    CaseActivity.belongsTo(models.Report, {
      foreignKey: 'reportId',
      as: 'report',
    });

    CaseActivity.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return CaseActivity;
}; 