const organizationService = require('@services/organization')

module.exports = class Organization {
	async update(req) {
		try {
			return await organizationService.update(req.body, req.decodedToken)
		} catch (error) {
			return error
		}
	}

	async eventListener(req) {
		try {
			console.log('CONTROLLER REQUEST BODY: ', req.body)
			return await organizationService.createOrgExtension(req.body)
		} catch (error) {
			throw error
		}
	}
}
