module.exports = {
	create: (req) => {
		req.checkBody('description')
			.trim()
			.notEmpty()
			.withMessage('description field is empty')
			.isString()
			.withMessage('description is invalid')
			.matches(/^[a-zA-Z0-9\-.,\s]+$/)
			.withMessage('invalid description')
	},
}
