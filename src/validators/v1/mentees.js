/**
 * name : validators/v1/mentees.js
 * author : Aman Gupta
 * Date : 19-Nov-2021
 * Description : Validations of mentees controller
 */

module.exports = {
	sessions: (req) => {},
	homeFeed: (req) => {},

	reports: (req) => {
		req.checkQuery('filterType')
			.notEmpty()
			.withMessage('filterType query is empty')
			.isIn(['MONTHLY', 'WEEKLY', 'QUARTERLY'])
			.withMessage('filterType is invalid')
	},

	joinSession: (req) => {
		req.checkParams('id')
			.notEmpty()
			.withMessage('id param is empty')
			.isNumeric()
			.withMessage('id param is invalid, must be an integer')
	},
}
