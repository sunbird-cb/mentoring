/**
 * name : cloud-services.js
 * author : Aman Gupta
 * created-date : 09-Nov-2021
 * Description : Cloud services controllers.
 */
const filesService = require('@services/files')

module.exports = class CloudServices {
	/**
	 * Get Signed Url
	 * @method
	 * @name getSignedUrl
	 * @param {JSON} req  request body.
	 * @returns {JSON} Response with status message and result.
	 */
	async getSignedUrl(req) {
		try {
			const signedUrlResponse = await filesService.getSignedUrlByOrgId(
				req.query.fileName,
				req.decodedToken.id,
				req.decodedToken.organization_id,
				req.query.dynamicPath ? req.query.dynamicPath : ''
			)
			return signedUrlResponse
		} catch (error) {
			return error
		}
	}

	/**
	 * Get downlodable Url
	 * @method
	 * @name getDownloadableUrl
	 * @param {JSON} req  request body.
	 * @returns {JSON} Response with status message and result.
	 */
	async getDownloadableUrl(req) {
		try {
			const downlopadUrlResponse = await filesService.getDownloadableUrl(req.query.filePath)
			return downlopadUrlResponse
		} catch (error) {
			return error
		}
	}

	/**
	 * Get sample bulk upload csv downloadable Url
	 * @method
	 * @name getSampleCSV
	 * @param {JSON} req  request body.
	 * @returns {JSON} Response with status message and result.
	 */
	async getSampleCSV(req) {
		try {
			const downloadUrlResponse = await filesService.getDownloadableUrlByOrgId(req.decodedToken.organization_id)
			return downloadUrlResponse
		} catch (error) {
			return error
		}
	}
}
