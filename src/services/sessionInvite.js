// Dependencies
const _ = require('lodash')
const utils = require('@generics/utils')
const httpStatusCode = require('@generics/http-status')
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
const moment = require('moment')
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
				const uploadRes = await this.uploadFileToCloud(outputFilename, inviteeFileDir, userId, orgId)
				const output_path = uploadRes.result.uploadDest
				const update = {
					output_path,
					updated_by: userId,
					status:
						createResponse.result.isErrorOccured == true ? common.STATUS.FAILED : common.STATUS.PROCESSED,
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
						await this.sendSessionManagerEmail(templateData, data.user, sessionUploadURL) //Rename this to function to generic name since this function is used for both Invitee & Org-admin.
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
						Action: action,
						'Session ID (blank if action is create and for Edit/Delete session id is mandatory)':
							session_id,
						'Session Title': title,
						Description: description,
						'Session Type': type,
						'Mentor(Email/Mobile Num)': mentor_id,
						'Mentees(Email/Mobile Num)': mentees,
						'Date(DD-MM-YYYY)': date,
						'Time Zone(IST/UTC)': time_zone,
						'Time (24 hrs)': time24hrs,
						'Duration(Min)': duration,
						'Recommended For': recommended_for,
						Categories: categories,
						Medium: medium,
						'Meeting Platform': meetingPlatform,
						'Meeting Link or Meeting ID': meetingLinkOrId,
						'Meeting Passcode (if needed)': meetingPasscode,
					} = row

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
					const mediumList = medium
						? medium
								.replace(/"/g, '')
								.split(',')
								.map((item) => item.trim())
						: []

					parsedCSVData.push({
						action,
						session_id,
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
						medium: mediumList,
						meeting_info: {
							platform: meetingPlatform,
							value: '',
							link: meetingLinkOrId,
							meta: {},
						},
					})

					if (meetingPlatform.includes('Zoom')) {
						parsedCSVData[parsedCSVData.length - 1].meeting_info.value = 'Zoom'
						const isNumeric = /^\d+$/.test(meetingLinkOrId)
						if (isNumeric) {
							parsedCSVData[parsedCSVData.length - 1].meeting_info.meta.meetingId = meetingLinkOrId
							parsedCSVData[parsedCSVData.length - 1].meeting_info.meta.password = `"${meetingPasscode}"`
						}
					} else if (meetingPlatform.includes('WhatsApp')) {
						parsedCSVData[parsedCSVData.length - 1].meeting_info.value = 'WhatsApp'
					} else if (meetingPlatform.includes('Google Meet')) {
						parsedCSVData[parsedCSVData.length - 1].meeting_info.value = 'Google Meet'
						parsedCSVData[parsedCSVData.length - 1].meeting_info.platform = 'Gmeet'
					} else if (meetingPlatform.includes('Big Blue Button')) {
						parsedCSVData[parsedCSVData.length - 1].meeting_info.value = 'BBB'
						parsedCSVData[parsedCSVData.length - 1].meeting_info.platform = 'BigBlueButton'
					} else {
						parsedCSVData[parsedCSVData.length - 1].status = 'Invalid'
						parsedCSVData[parsedCSVData.length - 1].statusMessage += 'Invlaid Meeting Link'
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

	static async processSession(session, validRowsCount, invalidRowsCount) {
		const requiredFields = [
			'action',
			'title',
			'description',
			'date',
			'type',
			'mentor_id',
			'time_zone',
			'time24hrs',
			'duration',
			'medium',
			'recommended_for',
			'categories',
			'meeting_info',
		]

		const missingFields = requiredFields.filter((field) => !session[field])
		session.statusMessage = ''
		if (missingFields.length > 0) {
			session.status = 'Invalid'
			session.statusMessage += ` Mandatory fields ${missingFields.join(', ')} not filled`
			invalidRowsCount++
		} else {
			if (session.meeting_info.platform !== 'BigBlueButton' && session.meeting_info.link === '') {
				session.status = 'Invalid'
				session.statusMessage += ' Meeting Link or ID is required for platforms other than Big Blue Button'
				invalidRowsCount++
			} else {
				validRowsCount++
				session.status = 'Valid'

				const { date, time_zone, time24hrs } = session
				const time = time24hrs.replace(' Hrs', '')
				const dateTimeString = date + ' ' + time
				const timeZone = time_zone == 'IST' ? 'Asia/Kolkata' : '+00:00'
				const momentFromJSON = moment.tz(dateTimeString, 'DD-MM-YYYY HH:mm', timeZone)
				const currentMoment = moment().tz(timeZone)
				const isDateValid = momentFromJSON.isSame(currentMoment, 'day')
				if (isDateValid) {
					const differenceTime = momentFromJSON.unix() - currentMoment.unix()
					if (differenceTime >= 0) {
						session.start_date = momentFromJSON.unix()
						const momentEndDateTime = momentFromJSON.add(session.duration, 'minutes')
						session.end_date = momentEndDateTime.unix()
					} else {
						session.status = 'Invalid'
						session.statusMessage += ' Invalid Time'
					}
				} else {
					session.status = 'Invalid'
					session.statusMessage += ' Invalid Date'
				}

				if (session.mentees && Array.isArray(session.mentees)) {
					for (let i = 0; i < session.mentees.length; i++) {
						const menteeEmail = session.mentees[i].toLowerCase()
						const menteeId = await userRequests.getListOfUserDetailsByEmail(menteeEmail)

						if (!menteeId.result.id) {
							session.mentees[i] = menteeEmail
							session.statusMessage += ' Invalid Mentee Email'
						} else {
							session.mentees[i] = menteeId.result.id
						}
					}
				}

				const mentorEmail = session.mentor_id.toLowerCase()
				const mentorId = await userRequests.getListOfUserDetailsByEmail(mentorEmail)

				if (Array.isArray(mentorId.result) && mentorId.result.length === 0) {
					session.status = 'Invalid'
					session.statusMessage += ' Invalid Mentor Email'
					invalidRowsCount++
				} else {
					session.mentor_id = mentorId.result.id
				}

				if (session.meeting_info.link === '{}') {
					session.meeting_info.link = ''
				}
			}
		}

		return { validRowsCount, invalidRowsCount }
	}

	static async processSessionDetails(csvData, sessionFileDir, userId, orgId, notifyUser, isMentor) {
		try {
			const outputFileName = utils.generateFileName(common.sessionOutputFile, common.csvExtension)
			let rowsWithStatus = []
			let validRowsCount = 0
			let invalidRowsCount = 0
			for (const session of csvData) {
				if (session.action === 'Create') {
					if (session.session_id === '') {
						const { validRowsCount: valid, invalidRowsCount: invalid } = await this.processSession(
							session,
							validRowsCount,
							invalidRowsCount
						)
						validRowsCount = valid
						invalidRowsCount = invalid
						rowsWithStatus.push(session)
					} else {
						session.status = 'Invalid'
						session.statusMessage = ' Invalid Row Action'
						rowsWithStatus.push(session)
					}
				} else if (session.action === 'Edit') {
					if (session.session_id === '') {
						session.statusMessage = ' Mandatory fields Session ID not filled'
						session.status = 'Invalid'
						rowsWithStatus.push(session)
					} else {
						const { validRowsCount: valid, invalidRowsCount: invalid } = await this.processSession(
							session,
							validRowsCount,
							invalidRowsCount
						)
						validRowsCount = valid
						invalidRowsCount = invalid
						session.method = 'POST'
						rowsWithStatus.push(session)
					}
				} else if (session.action === 'Delete') {
					if (session.session_id === '') {
						session.statusMessage = ' Mandatory fields Session ID not filled'
						session.status = 'Invalid'
						rowsWithStatus.push(session)
					} else {
						const { validRowsCount: valid, invalidRowsCount: invalid } = await this.processSession(
							session,
							validRowsCount,
							invalidRowsCount
						)
						validRowsCount = valid
						invalidRowsCount = invalid
						session.status = 'Valid'
						session.method = 'DELETE'
						rowsWithStatus.push(session)
					}
				} else {
					session.status = 'Invalid'
					session.statusMessage = ' Action is empty or wrong'
				}
			}
			const BodyDataArray = rowsWithStatus.map((item) => ({
				title: item.title,
				description: item.description,
				start_date: item.start_date,
				end_date: item.end_date,
				recommended_for: item.recommended_for,
				categories: item.categories,
				medium: item.medium,
				image: [],
				time_zone: item.time_zone,
				mentor_id: item.mentor_id,
				mentees: item.mentees,
				type: item.type,
				date: item.date,
				time24hrs: item.time24hrs,
				duration: item.duration,
				status: item.status,
				statusMessage: item.statusMessage,
				action: item.action,
				session_id: item.session_id,
				method: item.method,
				meeting_info: item.meeting_info,
			}))

			const sessionCreationOutput = await this.processCreateData(
				BodyDataArray,
				userId,
				orgId,
				isMentor,
				notifyUser
			)

			await this.fetchMentorIds(sessionCreationOutput)
			const modifiedCsv = sessionCreationOutput.map(
				({
					start_date,
					end_date,
					image,
					method,
					created_by,
					updated_by,
					mentor_name,
					custom_entity_text,
					mentor_organization_id,
					visibility,
					visible_to_organizations,
					mentee_feedback_question_set,
					mentor_feedback_question_set,
					meta,
					...rest
				}) => rest
			)

			const OutputCSVData = []
			modifiedCsv.forEach((row) => {
				const {
					title,
					description,
					recommended_for,
					categories,
					medium,
					time_zone,
					mentor_id,
					mentees,
					type,
					date,
					time24hrs,
					duration,
					status,
					statusMessage,
					action,
					session_id,
					meeting_info,
				} = row

				const meetingPlatform = meeting_info.platform
				const meetingLinkOrId = meeting_info.link
				let meetingPasscode = ''
				if (meetingPlatform == 'Zoom') {
					meetingPasscode = meeting_info.meta.password ? meeting_info.meta.password.match(/\d+/)[0] : ''
				}

				const mappedRow = {
					Action: action,
					'Session ID (blank if action is create and for Edit/Delete session id is mandatory)': session_id,
					'Session Title': title,
					Description: description,
					'Session Type': type,
					'Mentor(Email/Mobile Num)': mentor_id,
					'Mentees(Email/Mobile Num)': mentees.join(', '),
					'Date(DD-MM-YYYY)': date,
					'Time Zone(IST/UTC)': time_zone,
					'Time (24 hrs)': time24hrs,
					'Duration(Min)': duration,
					'Recommended For': recommended_for.join(', '),
					Categories: categories.join(', '),
					Medium: medium.join(', '),
					'Meeting Platform': meetingPlatform,
					'Meeting Link or Meeting ID': meetingLinkOrId,
					'Meeting Passcode (if needed)': meetingPasscode,
					Status: status,
					'Status Message': statusMessage,
				}
				OutputCSVData.push(mappedRow)
			})

			const csvContent = utils.generateCSVContent(OutputCSVData)
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

	static async processCreateData(dataArray, userId, orgId, isMentor, notifyUser) {
		const output = []
		for (const data of dataArray) {
			if (data.status != 'Invalid') {
				if (data.action == 'Create') {
					data.status = common.PUBLISHED_STATUS
					const sessionCreation = await sessionService.create(data, userId, orgId, isMentor, notifyUser)
					if (sessionCreation.statusCode === httpStatusCode.created) {
						data.statusMessage = sessionCreation.message
						data.session_id = sessionCreation.result.id
						output.push(data)
					} else {
						data.status = 'Invalid'
						data.statusMessage = sessionCreation.message
						output.push(data)
					}
				} else if (data.action == 'Edit' || data.action == 'Delete') {
					const sessionUpdateOrDelete = await sessionService.update(
						data.session_id,
						data,
						userId,
						data.method,
						orgId,
						notifyUser
					)
					if (sessionUpdateOrDelete.statusCode === httpStatusCode.accepted) {
						data.statusMessage = sessionUpdateOrDelete.message
						output.push(data)
					} else {
						data.status = 'Invalid'
						data.statusMessage = sessionUpdateOrDelete.message
						output.push(data)
					}
				}
			} else {
				output.push(data)
			}
		}
		return output
	}

	static async fetchMentorIds(sessionCreationOutput) {
		for (const item of sessionCreationOutput) {
			const mentorIdPromise = item.mentor_id
			if (typeof mentorIdPromise === 'number' && Number.isInteger(mentorIdPromise)) {
				const mentorId = await userRequests.details('', mentorIdPromise)
				item.mentor_id = mentorId.data.result.email
			} else {
				item.mentor_id = item.mentor_id
			}

			if (Array.isArray(item.mentees)) {
				const menteeEmails = []
				for (let i = 0; i < item.mentees.length; i++) {
					const menteeId = item.mentees[i]
					if (typeof menteeId === 'number' && Number.isInteger(menteeId)) {
						const mentee = await userRequests.details('', menteeId)
						menteeEmails.push(mentee.data.result.email)
					} else {
						menteeEmails.push(menteeId)
					}
				}
				item.mentees = menteeEmails
			}
		}
	}

	static async uploadFileToCloud(fileName, folderPath, userId = '', orgId, dynamicPath = '') {
		try {
			const getSignedUrl = await fileService.getSignedUrl(fileName, userId, orgId, dynamicPath)
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

	static async sendSessionManagerEmail(templateData, userData, sessionUploadURL = null, subjectComposeData = {}) {
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
						sessionUploadURL,
					}),
				},
			}

			if (sessionUploadURL != null) {
				const currentDate = new Date().toISOString().split('T')[0].replace(/-/g, '')

				payload.email.attachments = [
					{
						url: sessionUploadURL,
						filename: `session-creation-status_${currentDate}.csv`,
						type: 'text/csv',
					},
				]
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
