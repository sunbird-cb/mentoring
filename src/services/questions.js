const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const questionQueries = require('../database/queries/questions')
module.exports = class questionsHelper {
	/**
	 * Create questions.
	 * @method
	 * @name create
	 * @param {Object} bodyData
	 * @returns {JSON} - Create questions
	 */

	static async create(bodyData, decodedToken) {
		try {
			if (!decodedToken.roles.some((role) => role.title === common.ORG_ADMIN_ROLE)) {
				return common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			bodyData['organization_id'] = decodedToken.organization_id
			console.log('BODY DATA: ', bodyData)
			let question = await questionQueries.createQuestion(bodyData)
			return common.successResponse({
				statusCode: httpStatusCode.created,
				message: 'QUESTION_CREATED_SUCCESSFULLY',
				result: question,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Update questions.
	 * @method
	 * @name update
	 * @param {String} questionId - question id.
	 * @param {Object} bodyData
	 * @returns {JSON} - Update questions.
	 */

	static async update(questionId, bodyData, decodedToken) {
		try {
			if (!decodedToken.roles.some((role) => role.title === common.ORG_ADMIN_ROLE)) {
				return common.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}
			const filter = { id: questionId, organization_id: decodedToken.organization_id }
			const result = await questionQueries.updateOneQuestion(filter, bodyData)
			if (result === 'QUESTION_NOT_FOUND') {
				return common.failureResponse({
					message: 'QUESTION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'QUESTION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/**
	 * Read question.
	 * @method
	 * @name read
	 * @param {String} questionId - question id.
	 * @returns {JSON} - Read question.
	 */

	static async read(questionId, decodedToken) {
		try {
			const filter = { id: questionId, organization_id: decodedToken.organization_id }
			const question = await questionQueries.findOneQuestion(filter)
			if (!question) {
				return common.failureResponse({
					message: 'QUESTION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'QUESTION_FETCHED_SUCCESSFULLY',
				result: question,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
