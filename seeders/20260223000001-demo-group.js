'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Groups', [{
            id: 1,
            title: 'VIP Customers',
            type: 'whatsapp',
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }, {
            id: 2,
            title: 'General SMS List',
            type: 'sms',
            status: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Groups', null, {});
    }
};
