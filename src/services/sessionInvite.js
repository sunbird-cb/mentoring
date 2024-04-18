// Dependencies
const _ = require('lodash')
const utils = require('@generics/utils')
const fs = require('fs')
const path = require('path')
const csv = require('csvtojson')
const axios = require('axios')
const common = require('@constants/common')
const fileService = require('@services/files')
const request = require('request')
const userRequests = require('@requests/user')
const sessionService = require('@services/sessions')
const { isAMentor } = require('@generics/utils')
const ProjectRootDir = path.join(__dirname, '../')
const fileUploadQueries = require('@database/queries/fileUpload')
const notificationTemplateQueries = require('@database/queries/notificationTemplate')
const inviteeFileDir = ProjectRootDir + common.tempFolderForBulkUpload

module.exports = class UserInviteHelper {
	static async uploadSession(data) {
		return new Promise(async (resolve, reject) => {
			try {
				const filePath = data.fileDetails.input_path
				const userId = data.user.id
				const orgId = data.user.organization_id
				const notifyUser = true
				const roles = await userRequests.details('', userId)
				const isMentor = isAMentor(roles.data.result.user_roles)

				// download file to local directory
				const response = await this.downloadCSV(filePath)
				if (!response.success) throw new Error('FAILED_TO_DOWNLOAD')

				// extract data from csv
				const parsedFileData = await this.extractDataFromCSV(response.result.downloadPath)
				if (!parsedFileData.success) throw new Error('FAILED_TO_READ_CSV')
				const invitees = parsedFileData.result.data

				// create outPut file and create invites
				const createResponse = await this.processSessionDetails(
					invitees,
					inviteeFileDir,
					userId,
					orgId,
					notifyUser,
					isMentor
				)
				const outputFilename = path.basename(createResponse.result.outputFilePath)

				// upload output file to cloud
				const uploadRes = await this.uploadFileToCloud(outputFilename, inviteeFileDir, userId)
				const output_path = uploadRes.result.uploadDest
				const update = {
					output_path,
					updated_by: userId,
					status:
						createResponse.result.isErrorOccured == true ? common.FAILED_STATUS : common.PROCESSED_STATUS,
				}
				//update output path in file uploads
				const rowsAffected = await fileUploadQueries.update(
					{ id: data.fileDetails.id, organization_id: orgId },
					update
				)
				if (rowsAffected === 0) {
					throw new Error('FILE_UPLOAD_MODIFY_ERROR')
				}

				// send email to admin
				const templateCode = process.env.SESSION_UPLOAD_EMAIL_TEMPLATE_CODE
				if (templateCode) {
					const templateData = await notificationTemplateQueries.findOneEmailTemplate(
						templateCode,
						data.user.organization_id
					)

					if (templateData) {
						const sessionUploadURL = await utils.getDownloadableUrl(output_path)
						await this.sendInviteeEmail(templateData, data.user, sessionUploadURL) //Rename this to function to generic name since this function is used for both Invitee & Org-admin.
					}
				}

				// delete the downloaded file and output file.
				utils.clearFile(response.result.downloadPath)
				utils.clearFile(createResponse.result.outputFilePath)

				return resolve({
					success: true,
					message: 'CSV_UPLOADED_SUCCESSFULLY',
				})
			} catch (error) {
				console.log(error, 'CSV PROCESSING ERROR')
				return reject({
					success: false,
					message: error.message,
				})
			}
		})
	}

	static async downloadCSV(filePath) {
		try {
			const downloadableUrl = await utils.getDownloadableUrl(filePath)
			let fileName = path.basename(downloadableUrl)

			// Find the index of the first occurrence of '?'
			const index = fileName.indexOf('?')
			// Extract the portion of the string before the '?' if it exists, otherwise use the entire string
			fileName = index !== -1 ? fileName.substring(0, index) : fileName
			const downloadPath = path.join(inviteeFileDir, fileName)
			const response = await axios.get(downloadableUrl, {
				responseType: common.responseType,
			})

			const writeStream = fs.createWriteStream(downloadPath)
			response.data.pipe(writeStream)

			await new Promise((resolve, reject) => {
				writeStream.on('finish', resolve)
				writeStream.on('error', (err) => {
					reject(new Error('FAILED_TO_DOWNLOAD_FILE'))
				})
			})

			return {
				success: true,
				result: {
					destPath: inviteeFileDir,
					fileName,
					downloadPath,
				},
			}
		} catch (error) {
			return {
				success: false,
				message: error.message,
			}
		}
	}
	static async extractDataFromCSV(csvFilePath) {
		try {
			const parsedCSVData = []
			const csvToJsonData = await csv().fromFile(csvFilePath)
			if (csvToJsonData.length > 0) {
				csvToJsonData.forEach((row) => {
					const {
						'Session Title': title,
						Description: description,
						'Session Type': type,
						'Mentor(Email/Mobile Num)': mentor_id,
						'Mentees(Email/Mobile Num)': mentees,
						'Date(DD-MM-YYYY)': date,
						'Time Zone(IST/UTC)': time_zone,
						'Time (24 hrs)': time24hrs,
						'Duration(Min)': duration,
						'Recommended For(Not Mandatory)': recommended_for,
						'Categories(Not Mandatory)': categories,
						Medium: medium,
						'Meeting Link': meetingLinkValue,
					} = row
					// Check if the required fields exist in the row
					if (
						title &&
						description &&
						type &&
						mentor_id &&
						date &&
						time_zone &&
						time24hrs &&
						duration &&
						medium
					) {
						const menteesList = mentees
							? mentees
									.replace(/"/g, '')
									.split(',')
									.map((item) => item.trim())
							: []
						const recommendedList = recommended_for
							? recommended_for
									.replace(/"/g, '')
									.split(',')
									.map((item) => item.trim())
							: []
						const categoriesList = categories
							? categories
									.replace(/"/g, '')
									.split(',')
									.map((item) => item.trim())
							: []

						parsedCSVData.push({
							title,
							description,
							type,
							mentor_id,
							mentees: menteesList,
							date,
							time_zone,
							time24hrs,
							duration,
							recommended_for: recommendedList,
							categories: categoriesList,
							medium: [medium],
							meeting_info: { link: meetingLinkValue },
						})
					}
				})
			}
			return {
				success: true,
				result: { data: parsedCSVData },
			}
		} catch (error) {
			return {
				success: false,
				message: error.message,
			}
		}
	}

	static async processSessionDetails(csvData, sessionFileDir, userId, orgId, notifyUser, isMentor) {
		try {
			const outputFileName = utils.generateFileName(common.sessionOutputFile, common.csvExtension)
			let rowsWithStatus = []
			let validRowsCount = 0
			let invalidRowsCount = 0
			// Process each session detail from CSV data
			for (const session of csvData) {
				// Check compulsory fields
				if (
					!session.title &&
					!session.description &&
					!session.date &&
					!session.time24hrs &&
					!session.medium &&
					!session.type &&
					!session.mentor_id &&
					!session.duration &&
					!session.time_zone
				) {
					session.status = 'Invalid data: Compulsory field(s) missing'
					rowsWithStatus.push(session)
					invalidRowsCount++
				} else {
					session.status = 'Valid'
					validRowsCount++
					session.start_date = utils.convertToEpochTime(session.date, session.time24hrs, session.time_zone)
					const durationTime = utils.addDurationToTime(session.time24hrs, session.duration)
					session.end_date = utils.convertToEpochTime(session.date, durationTime, session.time_zone)
					if (session.mentees.length === 0 || session.mentees === '[]') {
						return
					} else {
						if (session.mentees && Array.isArray(session.mentees)) {
							for (let i = 0; i < session.mentees.length; i++) {
								const menteeEmail = session.mentees[i].toLowerCase()
								const encryptedMenteeEmail = utils.encrypt(menteeEmail)
								const menteeId = await userRequests.getListOfUserDetailsByEmail(encryptedMenteeEmail)
								if (menteeId.result != {}) {
									session.mentees[i] = menteeId.result.id
								} else {
									session.mentees[i] = ''
									session.status = 'Invalid Mentee Email'
									validRowsCount--
									invalidRowsCount++
								}
							}
						}
					}
					const mentorEmail = session.mentor_id.toLowerCase()
					const encryptedMentorEmail = utils.encrypt(mentorEmail)
					const mentorId = await userRequests.getListOfUserDetailsByEmail(encryptedMentorEmail)
					if (mentorId.result != {}) {
						session.mentor_id = mentorId.result.id
					} else {
						session.status = 'Invalid Mentor Email'
						validRowsCount--
						invalidRowsCount++
					}

					rowsWithStatus.push(session)
				}
			}
			const outputArray = rowsWithStatus.map((item) => ({
				type: item.type,
				mentor_id: item.mentor_id,
				title: item.title,
				description: item.description,
				start_date: item.start_date,
				end_date: item.end_date,
				recommended_for: item.recommended_for,
				categories: item.categories,
				medium: item.medium,
				time_zone: item.time_zone,
				meeting_info: item.meeting_info,
			}))

			const sessionCreationOutput = await this.processCsvData(outputArray, userId, orgId, isMentor, notifyUser)
			const csvContent = utils.generateCSVContent(sessionCreationOutput)
			const outputFilePath = path.join(sessionFileDir, outputFileName)
			fs.writeFileSync(outputFilePath, csvContent)

			if (validRowsCount > 0) {
				return {
					success: true,
					result: {
						sessionCreationOutput,
						outputFilePath,
						validRowsCount,
						invalidRowsCount,
					},
				}
			} else {
				return {
					success: false,
					message: 'No valid rows found. Please check your input data.',
				}
			}
		} catch (error) {
			return {
				success: false,
				message: error,
			}
		}
	}
	static async processCsvData(dataArray, userId, orgId, isMentor, notifyUser) {
		const output = []
		for (const data of dataArray) {
			const sessionCreation = await sessionService.create(data, userId, orgId, isMentor, notifyUser)
			if (
				sessionCreation.responseCode === 'OK' &&
				sessionCreation.statusCode === common.STATUSCODE &&
				sessionCreation.message === common.STATUSMESSAGE
			) {
				data.status = sessionCreation.message
				output.push(data)
			} else {
				data.status = sessionCreation.message
				output.push(data)
			}
		}
		return output
	}

	static async uploadFileToCloud(fileName, folderPath, userId = '', dynamicPath = '') {
		try {
			const getSignedUrl = await fileService.getSignedUrl(fileName, userId, dynamicPath)
			if (!getSignedUrl.result) {
				throw new Error('FAILED_TO_GENERATE_SIGNED_URL')
			}

			const fileUploadUrl = getSignedUrl.result.signedUrl
			const filePath = `${folderPath}/${fileName}`
			const fileData = fs.readFileSync(filePath, 'utf-8')

			const result = await new Promise((resolve, reject) => {
				try {
					request(
						{
							url: fileUploadUrl,
							method: 'put',
							headers: {
								'x-ms-blob-type': common.azureBlobType,
								'Content-Type': 'multipart/form-data',
							},
							body: fileData,
						},
						(error, response, body) => {
							if (error) reject(error)
							else resolve(response.statusCode)
						}
					)
				} catch (error) {
					reject(error)
				}
			})

			return {
				success: true,
				result: {
					uploadDest: getSignedUrl.result.destFilePath,
				},
			}
		} catch (error) {
			return {
				success: false,
				message: error.message,
			}
		}
	}

	static async sendInviteeEmail(templateData, userData, inviteeUploadURL = null, subjectComposeData = {}) {
		try {
			const payload = {
				type: common.notificationEmailType,
				email: {
					to: userData.email,
					subject:
						subjectComposeData && Object.keys(subjectComposeData).length > 0
							? utils.composeEmailBody(templateData.subject, subjectComposeData)
							: templateData.subject,
					body: utils.composeEmailBody(templateData.body, {
						name: userData.name,
						role: userData.role || '',
						orgName: userData.org_name || '',
						appName: process.env.APP_NAME,
						inviteeUploadURL,
						portalURL: process.env.PORTAL_URL,
						roles: userData.roles || '',
					}),
				},
			}

			await kafkaCommunication.pushEmailToKafka(payload)
			return {
				success: true,
			}
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
