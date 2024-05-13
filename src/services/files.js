// Dependencies
const cloudServices = require('@generics/cloud-services')
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const utils = require('@generics/utils')
const responses = require('@helpers/responses')
const { getDefaultOrgId } = require('@helpers/getDefaultOrgId')
const organisationExtensionQueries = require('@database/queries/organisationExtension')

module.exports = class FilesHelper {
	/**
	 * Get Signed Url
	 * @method
	 * @name getSignedUrl
	 * @param {JSON} req  request body.
	 * @param {string} req.query.fileName - name of the file
	 * @param {string} id  -  userId
	 * @returns {JSON} - Response contains signed url
	 */
	static async getSignedUrl(fileName, id, dynamicPath, isAssetBucket) {
		try {
			let destFilePath
			let cloudBucket
			if (dynamicPath != '') {
				destFilePath = dynamicPath + '/' + fileName
			} else {
				destFilePath = `session/${id}-${new Date().getTime()}-${fileName}`
			}
			// decide on which bucket has to be passed based on api call
			if (isAssetBucket) {
				cloudBucket = process.env.PUBLIC_ASSET_BUCKETNAME
			} else {
				cloudBucket = process.env.CLOUD_STORAGE_BUCKETNAME
			}

			const expiryInSeconds = parseInt(process.env.SIGNED_URL_EXPIRY_IN_SECONDS) || 900
			const response = await cloudServices.getSignedUrl(
				cloudBucket,
				destFilePath,
				common.WRITE_ACCESS,
				expiryInSeconds
			)

			return responses.successResponse({
				message: 'SIGNED_URL_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				responseCode: 'OK',
				result: response,
			})
		} catch (error) {
			throw error
		}
	}

	static async getDownloadableUrl(path, isAssetBucket = false) {
		try {
			let bucketName = process.env.CLOUD_STORAGE_BUCKETNAME
			let response
			let expiryInSeconds = parseInt(process.env.SIGNED_URL_EXPIRY_IN_SECONDS) || 300

			// downloadable url for public bucket
			if (isAssetBucket || process.env.CLOUD_STORAGE_BUCKET_TYPE != 'private') {
				response = await utils.getPublicDownloadableUrl(process.env.PUBLIC_ASSET_BUCKETNAME, path)
			} else {
				response = await cloudServices.getSignedUrl(bucketName, path, common.READ_ACCESS, expiryInSeconds)
				response = response.signedUrl
			}
			// let response = await utils.getDownloadableUrl(path, isAssetBucket)
			return responses.successResponse({
				message: 'DOWNLOAD_URL_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				responseCode: 'OK',
				result: response,
			})
		} catch (error) {
			throw error
		}
	}

	static async getSignedUrlByOrgId(fileName, id, orgId, dynamicPath) {
		try {
			let destFilePath
			if (dynamicPath != '') {
				destFilePath = dynamicPath + '/' + fileName
			} else {
				destFilePath = `session/${id}-${new Date().getTime()}-${fileName}`
			}
			let response
			if (process.env.CLOUD_STORAGE === 'GCP') {
				response = await cloudServices.getGcpSignedUrl(destFilePath)
			} else if (process.env.CLOUD_STORAGE === 'AWS') {
				response = await cloudServices.getAwsSignedUrl(destFilePath)
			} else if (process.env.CLOUD_STORAGE === 'AZURE') {
				response = await cloudServices.getAzureSignedUrl(destFilePath)
			} else if (process.env.CLOUD_STORAGE === 'OCI') {
				response = await cloudServices.getOciSignedUrl(destFilePath)
			}
			const defaultOrgId = await getDefaultOrgId()
			if (!defaultOrgId) {
				return responses.failureResponse({
					message: 'DEFAULT_ORG_ID_NOT_SET',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}

			const data = { sample_csv_path: destFilePath }
			if (orgId != defaultOrgId) {
				await organisationExtensionQueries.update(data, orgId)
			}

			response.destFilePath = destFilePath
			return responses.successResponse({
				message: 'SIGNED_URL_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				responseCode: 'OK',
				result: response,
			})
		} catch (error) {
			throw error
		}
	}
}
