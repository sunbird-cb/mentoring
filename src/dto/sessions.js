/**
 * name : sessions.js
 * author : Nevil Mathew
 * created-date : 17-Jan-2023
 * Description : DTO for sessions.
 */
const ObjectId = require('mongoose').Types.ObjectId
const sessionData = require('@db/sessions/queries')
const userProfile = require('../services/helper/userProfile')

const transformSessionData = async (sessionId, userId) => {
	try {
		const filter = {}

		if (ObjectId.isValid(sessionId)) {
			filter._id = sessionId
		}
		const projection = {
			deleted: 0,
			feedbacks: 0,
			internalMeetingId: 0,
			isStarted: 0,
			menteeFeedbackForm: 0,
			menteePassword: 0,
			mentorFeedbackForm: 0,
			mentorPassword: 0,
			recordingUrl: 0,
			skippedFeedback: 0,
			status: 0,
			userId: 0,
			__v: 0,
		}
		let sessionDetails = await sessionData.findOneSession(filter, projection)
		let mentorsDetails = await userProfile.details('', userId)

		const mentorFilter = ['_id', 'name', 'image', 'rating', 'gender']

		const filteredMentorDetails = Object.keys(mentorsDetails.data.result)
			.filter((key) => mentorFilter.includes(key))
			.reduce((obj, key) => {
				obj[key] = mentorsDetails.data.result[key]
				return obj
			}, {})

		const organizationFilter = ['_id', 'name', 'code', 'description']
		let organizationDetails = await userProfile.getOrganizationData(mentorsDetails.data.result.organisationId)
		const filteredOrganizationDetails = Object.keys(organizationDetails.result)
			.filter((key) => organizationFilter.includes(key))
			.reduce((obj, key) => {
				obj[key] = organizationDetails.result[key]
				return obj
			}, {})

		sessionDetails.mentor = filteredMentorDetails
		sessionDetails.organization = filteredOrganizationDetails
		return sessionDetails
	} catch (error) {
		throw error
	}
}

module.exports = {
	transformSessionData,
}
