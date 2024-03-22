const { filterRequestBody } = require('../common')
const { profile } = require('@constants/blacklistConfig')

module.exports = {
	create: (req) => {
		req.body = filterRequestBody(req.body, profile.create)

		req.checkBody('designation').optional().notEmpty().withMessage('Designation is required')

		req.checkBody('area_of_expertise').optional().isArray().withMessage('Area of expertise must be an array')

		req.checkBody('tags').optional().isArray().withMessage('Tags must be an array')
	},

	update: (req) => {
		req.body = filterRequestBody(req.body, profile.update)

		req.checkBody('designation').optional().notEmpty().withMessage('Designation is required')

		req.checkBody('area_of_expertise').optional().isArray().withMessage('Area of expertise must be an array')

		/* 		req.checkBody('education_qualification')
			.optional()
			.isArray()
			.withMessage('Education qualification must be an array') */

		req.checkBody('tags').optional().isArray().withMessage('Tags must be an array')

		req.checkBody('configs.notification')
			.optional()
			.isBoolean()
			.withMessage('Notification config must be a boolean')

		req.checkBody('configs.visibility').optional().notEmpty().withMessage('Visibility config is required')
	},
	getMenteeExtension: (req) => {
		req.checkQuery('id')
			.notEmpty()
			.withMessage('ID query parameter is empty')
			.isInt()
			.withMessage('ID must be an integer')
	},
}
