/**
 * name : validators/v1/questions.js
 * author : Rakesh Kumar
 * Date : 01-Dec-2021
 * Description : Validations of user questions controller
 */
const { filterRequestBody } = require('../common')
const { questions } = require('@constants/blacklistConfig').default
module.exports = {
	create: (req) => {
		req.body = filterRequestBody(req.body, questions.create)

		req.checkBody('name').notEmpty().withMessage('name is required').isString().withMessage('name must be a string')
		req.checkBody('question')
			.notEmpty()
			.withMessage('question is required')
			.isString()
			.withMessage('question must be a string')
		req.checkBody('type').notEmpty().withMessage('Type is required').isString().withMessage('type must be a string')
		req.checkBody('no_of_stars').optional().isInt().withMessage('No of stars must be an integer')
		req.checkBody('category').optional().isObject().withMessage('Category must be an object')
		req.checkBody('rendering_data').optional().isObject().withMessage('Rendering data must be an object')
		req.checkBody('options').optional().isArray().withMessage('Options must be an array')
	},
	update: (req) => {
		req.body = filterRequestBody(req.body, questions.update)

		req.checkParams('id').notEmpty().withMessage('id param is empty').isInt().withMessage('id must be an integer')

		req.checkBody('name')
			.optional()
			.notEmpty()
			.withMessage('name is required')
			.isString()
			.withMessage('name must be a string')
		req.checkBody('question')
			.optional()
			.notEmpty()
			.withMessage('question is required')
			.isString()
			.withMessage('question must be a string')
		req.checkBody('type')
			.optional()
			.notEmpty()
			.withMessage('Type is required')
			.isString()
			.withMessage('type must be a string')
		req.checkBody('no_of_stars').optional().optional().isInt().withMessage('No of stars must be an integer')
		req.checkBody('category').optional().isObject().withMessage('Category must be an object')
		req.checkBody('rendering_data').optional().isObject().withMessage('Rendering data must be an object')
		req.checkBody('options').optional().isArray().withMessage('Options must be an array')
	},
	read: (req) => {
		req.checkParams('id').notEmpty().withMessage('id param is empty')
	},
}
