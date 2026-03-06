'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Phone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Phone.belongsTo(models.Group, { foreignKey: 'group_id' });
    }
  }
  Phone.init({
    phone: DataTypes.STRING,
    group_id: DataTypes.INTEGER,
    type: DataTypes.ENUM('whatsapp', 'sms'),
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Phone',
  });
  return Phone;
};