'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Group.hasMany(models.Phone, { foreignKey: 'group_id' });
      Group.hasMany(models.Transaction, { foreignKey: 'group_id' });
    }
  }
  Group.init({
    title: DataTypes.STRING,
    type: DataTypes.ENUM('whatsapp', 'sms'),
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};