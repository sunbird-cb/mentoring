const userBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL
const request = require('@generics/requests')
const endpoints = require('@constants/endpoints')
const common = require('@constants/common')
const httpStatusCode = require('@generics/http-status')

const menteeQueries = require('../../database/queries/userextension')
const mentorQueries = require('../../database/queries/mentorextension')

module.exports = class UserHelper {
	/**
	 * User list.
	 * @method
	 * @name list
	 * @param {Boolean} userType - mentor/mentee.
	 * @param {Number} page - page No.
	 * @param {Number} limit - page limit.
	 * @param {String} search - search field.
	 * @returns {JSON} - List of users
	 */

	static async list(userType, pageNo, pageSize, searchText) {
		try {
			const apiUrl =
				userBaseUrl +
				endpoints.USERS_LIST +
				'?type=' +
				userType +
				'&page=' +
				pageNo +
				'&limit=' +
				pageSize +
				'&search=' +
				searchText
			const userDetails = await request.get(apiUrl, false, true)

			const ids = userDetails.data.result.data.map((item) => item.values[0].id)
			let extensionDetails
			if (userType == common.MENTEE_ROLE) {
				extensionDetails = await menteeQueries.getUsersByUserIds(ids, {
					attributes: ['user_id', 'rating'],
				})
			} else if (userType == common.MENTOR_ROLE) {
				extensionDetails = await mentorQueries.getMentorsByUserIds(ids, {
					attributes: ['user_id', 'rating'],
				})
			}

			const extensionDataMap = new Map(extensionDetails.map((newItem) => [newItem.user_id, newItem]))

			userDetails.data.result.data.forEach((existingItem) => {
				const user_id = existingItem.values[0].id
				if (extensionDataMap.has(user_id)) {
					const newItem = extensionDataMap.get(user_id)
					existingItem.values[0] = { ...existingItem.values[0], ...newItem }
				}
				delete existingItem.values[0].user_id
			})

			return common.successResponse({
				statusCode: httpStatusCode.ok,
				message: userDetails.data.message,
				result: userDetails.data.result,
			})
		} catch (error) {
			return error
		}
	}
}
