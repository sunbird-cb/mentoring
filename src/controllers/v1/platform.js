const platformService = require('@services/platform')

module.exports = class Config {
	/**
	 * Get app related config details
	 * @method
	 * @name getConfig
	 * @returns {JSON} - returns success response.
	 */

	async config(req) {
		try {
			const config = await platformService.getConfig(req.decodedToken)
			return config
		} catch (error) {
			return error
		}
	}
}
