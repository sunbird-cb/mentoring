'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		// update the body correct the end date and time
		let updateData = {
			body: '<p>Dear {name},</p> Please note that the Mentor has rescheduled the session - {sessionTitle} from {oldStartDate} {oldStartTime} - {oldEndDate} {oldEndTime} to {newStartDate} {newStartTime} - {newEndDate} {newEndTime} Please make note of the changes.',
		}
		let updateFilter = {
			code: 'mentor_session_reschedule',
			organization_id: defaultOrgId,
		}
		// Update operation
		let check = await queryInterface.bulkUpdate('notification_templates', updateData, updateFilter)
	},

	async down(queryInterface, Sequelize) {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		let updateData = {
			body: '<p>Dear {name},</p> Please note that the Mentor has rescheduled the session - {sessionTitle} from {oldStartDate} {oldStartTime} - {oldEndDate} {oldEndTime} to {newStartDate} {newStartTime} - {newStartDate} {newStartTime} Please make note of the changes.',
		}
		let updateFilter = {
			code: 'mentor_session_reschedule',
			organization_id: defaultOrgId,
		}
		// Update operation
		let check = await queryInterface.bulkUpdate('notification_templates', updateData, updateFilter)
	},
}
