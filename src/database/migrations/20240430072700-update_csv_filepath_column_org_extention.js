'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('organization_extension', 'sample_csv_path', {
			type: Sequelize.STRING,
			allowNull: true,
		})
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('organization_extension', 'sample_csv_path')
	},
}
