'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		queryInterface.addColumn('questions', 'organization_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
		})
		await queryInterface.removeConstraint('question_sets', 'question_sets_pkey')
		return queryInterface.addConstraint('question_sets', {
			fields: ['code', 'organization_id'],
			type: 'primary key',
			name: 'primary_key_qs_code_org_id',
		})
	},

	async down(queryInterface, Sequelize) {
		queryInterface.removeColumn('questions', 'organization_id')
		await queryInterface.removeConstraint('question_sets', 'primary_key_qs_code_org_id')
		return queryInterface.changeColumn('question_sets', 'id', {
			type: Sequelize.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
		})
	},
}
