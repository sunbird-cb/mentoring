// Dependencies
const questionsService = require('@services/availability')

module.exports = class Questions {
	/**
	 * create questions
	 * @method
	 * @name create
	 * @param {Object} req -request data.
	 * @returns {JSON} - Question creation object.
	 */

	async create(req) {
		try {
			req.decodedToken = {
				id: 133,
			}
			const createdQuestion = await questionsService.create(req.body, req.decodedToken)
			return createdQuestion
		} catch (error) {
			return error
		}
	}

	/**
	 * updates question
	 * @method
	 * @name update
	 * @param {Object} req - request data.
	 * @returns {JSON} - Question updated response.
	 */

	async update(req) {
		try {
			return await questionsService.update(req.params.id, req.body, req.decodedToken)
		} catch (error) {
			return error
		}
	}

	/**
	 * reads question
	 * @method
	 * @name read
	 * @param {Object} req -request data.
	 * @returns {JSON} - question object.
	 */

	async read(req) {
		try {
			return await questionsService.read(req.query, req.params.id)
		} catch (error) {
			return error
		}
	}
	async isAvailable(req) {
		try {
			return await questionsService.isAvailable(req.query, req.params.id)
		} catch (error) {
			return error
		}
	}
	async availableUsers(req) {
		try {
			return await questionsService.availableUsers(req.query, req.params.id)
		} catch (error) {
			return error
		}
	}
}
