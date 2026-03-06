'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Transactions', [{
            group_id: 1,
            template_id: 1,
            status: true,
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Transactions', null, {});
    }
};
