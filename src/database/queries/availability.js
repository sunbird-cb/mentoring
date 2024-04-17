const Question = require('../models/index').Availability

module.exports = class QuestionsData {
	static async createAvailability(data) {
		try {
			const question = await Question.create(data, { returning: true })
			return question
		} catch (error) {
			console.log(error)
			return error
		}
	}

	static async findAvailability(filter, projection = {}) {
		try {
			const questionData = await Question.findAll({
				where: filter,
				attributes: projection,
				raw: true,
				order: [['start_time', 'ASC']],
			})
			return questionData
		} catch (error) {
			console.log(error)
			return error
		}
	}

	static async updateAvailability(filter, update, options = {}) {
		try {
			return await Question.update(update, {
				where: filter,
				...options,
			})
		} catch (error) {
			throw error
		}
	}
}
