'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.Group, { foreignKey: 'group_id' });
      Transaction.belongsTo(models.Template, { foreignKey: 'template_id' });
    }
  }
  Transaction.init({
    group_id: DataTypes.INTEGER,
    template_id: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};