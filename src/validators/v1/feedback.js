/**
 * name : validators/v1/mentees.js
 * author : Aman Gupta
 * Date : 19-Nov-2021
 * Description : Validations of mentees controller
 */
const { filterRequestBody } = require('../common')
const { feedback } = require('@constants/blacklistConfig').default
module.exports = {
	forms: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
	submit: (req) => {
		req.body = filterRequestBody(req.body, feedback.submit)

		req.checkParams('id')
			.notEmpty()
			.withMessage('id param is empty')
			.isNumeric()
			.withMessage('id must be an integer')

		req.checkBody('feedback_as')
			.notEmpty()
			.withMessage('feedback_as field is empty')
			.isString()
			.withMessage('feedback_as must be a string')
			.isIn(['mentor', 'mentee'])
			.withMessage('feedback_as must be in mentor, mentee')

		req.checkBody('feedbacks')
			.optional()
			.notEmpty()
			.withMessage('feedbacks field is empty')
			.isArray()
			.withMessage('feedbacks must be an array')

		req.checkBody('is_feedback_skipped')
			.optional()
			.notEmpty()
			.withMessage('is_feedback_skipped field is empty')
			.isBoolean()
			.withMessage('is_feedback_skipped must be boolean')
	},
}
