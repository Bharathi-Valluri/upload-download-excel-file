const Sequelize = require('sequelize')
const sequelize = require('../db')
const UploadExcel = sequelize.define(
  'UploadExcel',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: true
    },
    Name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    Age: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: false
  }
)
module.exports = UploadExcel
