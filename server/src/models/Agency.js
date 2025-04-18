const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Agency = sequelize.define(
    'Agency',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      jurisdiction: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contactEmail: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      contactPhone: {
        type: DataTypes.STRING(20),
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
      tableName: 'agencies',
      timestamps: true,
    }
  );

  // Define associations
  Agency.associate = (models) => {
    Agency.hasMany(models.User, {
      foreignKey: 'agencyId',
      as: 'staff',
    });

    Agency.hasMany(models.Report, {
      foreignKey: 'assignedAgencyId',
      as: 'assignedReports',
    });
  };

  return Agency;
}; 