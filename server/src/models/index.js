const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database')[env];
const db = {};

// Create Sequelize instance
let sequelize;
try {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
} catch (error) {
  console.error('Error creating Sequelize instance:', error);
  throw error;
}

// Import model definitions manually to avoid the dynamic loading error
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Agency = require('./Agency')(sequelize, Sequelize.DataTypes);
const Report = require('./Report')(sequelize, Sequelize.DataTypes);
const ReportMedia = require('./ReportMedia')(sequelize, Sequelize.DataTypes);
const ReportAnalysis = require('./ReportAnalysis')(sequelize, Sequelize.DataTypes);
const CaseActivity = require('./CaseActivity')(sequelize, Sequelize.DataTypes);
const AuditLog = require('./AuditLog')(sequelize, Sequelize.DataTypes);

// Add models to db object
db.User = User;
db.Agency = Agency;
db.Report = Report;
db.ReportMedia = ReportMedia;
db.ReportAnalysis = ReportAnalysis;
db.CaseActivity = CaseActivity;
db.AuditLog = AuditLog;

// Set up model associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db; 