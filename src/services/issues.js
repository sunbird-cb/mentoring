const httpStatusCode = require('@generics/http-status')

const genericUtils = require('@utils/generic')
const emailUtils = require('@utils/email')
const kafkaCommunication = require('@generics/kafka-communication')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const issueQueries = require('../database/queries/issue')
const userRequests = require('@requests/user')
const responses = require('@helpers/responses')

module.exports = class issuesHelper {
	/**
	 * Report an issue.
	 * @method
	 * @name create
	 * @param {Object} bodyData - Reported issue body data.
	 * @param {String} decodedToken - Token information.
	 * @returns {JSON} - Success response.
	 */

	static async create(bodyData, decodedToken) {
		try {
			const userDetails = (await userRequests.details('', decodedToken.id)).data.result

			const name = userDetails.name
			const role = decodedToken.roles.some((role) => role.title === 'mentor') ? 'Mentor' : 'Mentee'
			const userEmailId = userDetails.email
			const email = process.env.SUPPORT_EMAIL_ID
			bodyData.user_id = decodedToken.id

			if (process.env.ENABLE_EMAIL_FOR_REPORT_ISSUE === 'true') {
				const templateData = await notificationTemplateQueries.findOneEmailTemplate(
					process.env.REPORT_ISSUE_EMAIL_TEMPLATE_CODE,
					decodedToken.organization_id
				)

				let metaItems = ''
				if (bodyData.meta_data) {
					for (const [key, value] of Object.entries(bodyData.meta_data)) {
						metaItems += `<li><b>${genericUtils.capitalize(key)}:</b> ${value}</li>\n`
					}
				}

				if (templateData) {
					const payload = {
						type: 'email',
						email: {
							to: email,
							replyTo: userEmailId,
							subject: templateData.subject,
							body: emailUtils.composeEmailBody(templateData.body, {
								name,
								role,
								userEmailId,
								userId: bodyData.user_id.toString(),
								description: bodyData.description,
								metaItems: metaItems || 'Not available',
							}),
						},
					}
					await kafkaCommunication.pushEmailToKafka(payload)

					bodyData.isEmailTriggered = true
				}
			}
			await issueQueries.create(bodyData)

			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'ISSUE_REPORTED_SUCCESSFULLY',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
