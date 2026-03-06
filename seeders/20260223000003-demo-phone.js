'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Phones', [{
            phone: '08123456789',
            group_id: 1,
            type: 'whatsapp',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            phone: '08987654321',
            group_id: 2,
            type: 'sms',
            status: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Phones', null, {});
    }
};
