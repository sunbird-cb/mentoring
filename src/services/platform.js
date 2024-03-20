const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')
const responses = require('@helpers/responses')

module.exports = class platformHelper {
	/**
	 * Get application configuration.
	 *
	 * @static
	 * @async
	 * @method
	 * @name getConfig
	 * @returns {Promise<Object>} - A promise that resolves with the application configuration.
	 * @throws {Error} - Throws an error if there's an issue during configuration retrieval.
	 */
	static async getConfig(decodedToken) {
		try {
			if (!decodedToken) {
				return responses.failureResponse({
					message: 'UNAUTHORIZED_REQUEST',
					statusCode: httpStatusCode.unauthorized,
					responseCode: 'UNAUTHORIZED',
				})
			}

			let config = {
				meeting_platform: process.env.DEFAULT_MEETING_SERVICE,
				session_mentee_limit: process.env.SESSION_MENTEE_LIMIT,
			}

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'APP_CONFIG_FETCHED_SUCCESSFULLY',
				result: config,
			})
		} catch (error) {
			console.error(error)
			throw error
		}
	}
}
