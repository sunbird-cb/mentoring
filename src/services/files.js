const cloudServices = require('@generics/cloud-services')
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const utils = require('@generics/utils')
const responses = require('@helpers/responses')
const { getDefaultOrgId } = require('@helpers/getDefaultOrgId')
const organisationExtensionQueries = require('@database/queries/organisationExtension')

module.exports = class FilesHelper {
	static async getSignedUrl(fileName, id, dynamicPath) {
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

	static async getDownloadableUrl(path) {
		try {
			let response = await utils.getDownloadableUrl(path)
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

	static async getDownloadableUrlByOrgId(orgId) {
		try {
			const defaultOrgId = await getDefaultOrgId()
			if (!defaultOrgId) {
				return responses.failureResponse({
					message: 'DEFAULT_ORG_ID_NOT_SET',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			let path = process.env.SAMPLE_CSV_FILE_PATH
			console.log('organization_id ', organization_id)
			if (orgId != defaultOrgId) {
				const result = await organisationExtensionQueries.findOne(
					{ orgId },
					{ attributes: ['sample_csv_path'] }
				)
				if (result && result.sample_csv_path) {
					path = result.sample_csv_path
				}
			}

			const response = await utils.getDownloadableUrl(path)
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
}
