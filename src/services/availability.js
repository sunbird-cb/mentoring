const httpStatusCode = require('@generics/http-status')
const availabilityQueries = require('@database/queries/availability')
const sessionQueries = require('@database/queries/sessions')
const responses = require('@helpers/responses')
const { Op } = require('sequelize')
const moment = require('moment')
const { performance, PerformanceObserver } = require('perf_hooks')
const { getAvailabilitiesByDay, buildUserAvailabilities } = require('@dtos/availability')

module.exports = class questionsHelper {
	static async create(bodyData, decodedToken) {
		try {
			bodyData['created_by'] = decodedToken.id
			bodyData['updated_by'] = decodedToken.id

			const minimumDurationForAvailability = parseInt(process.env.MINIMUM_DURATION_FOR_AVAILABILITY, 10)
			if (minimumDurationForAvailability !== 0) {
				const availabilityStart = moment(bodyData.start_time * 1000)
				const availabilityEnd = moment(bodyData.end_time * 1000)
				const diffInMinutes = Math.abs(availabilityStart.diff(availabilityEnd, 'minutes'))
				if (minimumDurationForAvailability >= diffInMinutes) {
					return responses.successResponse({
						statusCode: httpStatusCode.created,
						message: 'MIN_DURATION',
					})
				}
			}

			let availability = await availabilityQueries.createAvailability(bodyData)
			return responses.successResponse({
				statusCode: httpStatusCode.created,
				message: 'availability_CREATED_SUCCESSFULLY',
				result: availability,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async update(id, bodyData, decodedToken) {
		try {
			const filter = { id, created_by: decodedToken.id }
			const [rowsAffected] = await availabilityQueries.updateAvailability(filter, bodyData)

			if (rowsAffected === 0) {
				return responses.failureResponse({
					message: 'QUESTION_NOT_FOUND',
					statusCode: httpStatusCode.bad_request,
					responseCode: 'CLIENT_ERROR',
				})
			}
			return responses.successResponse({
				statusCode: httpStatusCode.accepted,
				message: 'QUESTION_UPDATED_SUCCESSFULLY',
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	/* 	static getEventsByDay(startEpoch, endEpoch, events) {
		try {
			const startDate = moment.unix(startEpoch).startOf('day')
			const endDate = moment.unix(endEpoch).endOf('day')

			const dates = []
			let currentDate = startDate.clone()

			while (currentDate <= endDate) {
				const epochStartOfDay = currentDate.startOf('day').unix()
				const epochEndOfDay = currentDate.endOf('day').unix()
				dates.push({ date: currentDate.format('YYYY-MM-DD'), epochStartOfDay, epochEndOfDay })
				currentDate.add(1, 'day')
			}

			const arrayOfDays = new Map()

			dates.forEach((date) => {
				arrayOfDays.set(
					date.epochStartOfDay,
					events.filter(
						(event) => event.start_time >= date.epochStartOfDay && event.start_time <= date.epochEndOfDay
					)
				)
			})

			return arrayOfDays
		} catch (error) {
			console.log(error)
			return null
		}
	} */

	static updateAvailabilities(sessions, availabilities) {
		//Return the availabilities as it is if sessions is empty
		if (sessions.length === 0 || Object.keys(sessions[0]).length === 0) {
			return availabilities
		}

		let updatedAvailabilities = [...availabilities]

		sessions.forEach((session) => {
			const sessionStart = moment(session.start_date * 1000)
			const sessionEnd = moment(session.end_date * 1000)

			updatedAvailabilities.forEach((availability, index) => {
				const availabilityStart = moment(availability.start_time * 1000)
				const availabilityEnd = moment(availability.end_time * 1000)

				const isSessionWithinAvailability =
					sessionStart.isBetween(availabilityStart, availabilityEnd) &&
					sessionEnd.isBetween(availabilityStart, availabilityEnd)
				const isAvailabilityWithinSession =
					sessionStart.isSameOrBefore(availabilityStart) && sessionEnd.isSameOrAfter(availabilityEnd)
				const isSessionOverlapStart =
					sessionStart.isSameOrBefore(availabilityStart) &&
					sessionEnd.isAfter(availabilityStart) &&
					sessionEnd.isBefore(availabilityEnd)
				const isSessionOverlapEnd =
					sessionStart.isAfter(availabilityStart) &&
					sessionStart.isBefore(availabilityEnd) &&
					sessionEnd.isSameOrAfter(availabilityEnd)

				switch (true) {
					case isSessionWithinAvailability:
						// Session is within the availability, split the availability
						const newAvailability1 = {
							...availability,
							end_time: sessionStart.unix(),
							event_name: 'First Split',
						}
						const newAvailability2 = {
							...availability,
							start_time: sessionEnd.unix(),
							event_name: 'Second Split',
						}
						// Remove the original availability and insert the split ones

						updatedAvailabilities.splice(index, 1, newAvailability1, newAvailability2)

						break
					case isAvailabilityWithinSession:
						// Availability is within the session, remove the availability
						updatedAvailabilities.splice(index, 1)
						break
					case isSessionOverlapStart:
						// Session overlaps the beginning of availability, adjust the start time
						availability.start_time = sessionEnd.unix()
						updatedAvailabilities[index] = availability
						break
					case isSessionOverlapEnd:
						//Session overlaps the end of availability, adjust the end time
						availability.end_time = sessionStart.unix()
						updatedAvailabilities[index] = availability
						break
					default:
						break
				}
			})
		})

		return updatedAvailabilities
	}
	static filterAvailabilitiesByMinimumDuration(availabilities) {
		const minimumDurationForAvailability = parseInt(process.env.MINIMUM_DURATION_FOR_AVAILABILITY, 10)

		// Return the availabilities as it is based on env config
		if (minimumDurationForAvailability === 0) {
			return availabilities
		}

		return availabilities.filter((availability) => {
			const availabilityStart = moment(availability.start_time * 1000)
			const availabilityEnd = moment(availability.end_time * 1000)
			const diffInMinutes = Math.abs(availabilityStart.diff(availabilityEnd, 'minutes'))
			return diffInMinutes >= minimumDurationForAvailability
		})
	}
	/**
	 * Read question.
	 * @method
	 * @name read
	 * @param {String} questionId - question id.
	 * @returns {JSON} - Read question.
	 */

	static async read(query, userId) {
		try {
			const filter = {
				[Op.or]: [
					{
						start_time: {
							[Op.between]: [query.startEpoch, query.endEpoch],
						},
						repeat_unit: null, // Include one-time events
					},
					{
						repeat_unit: {
							[Op.not]: null, // Include recurring events
						},
					},
				],
				user_id: userId,
			}
			let userAvailabilities = await availabilityQueries.findAvailability(filter)
			const sessions = await sessionQueries.findAll(
				{
					start_date: {
						[Op.between]: [query.startEpoch, query.endEpoch],
					},
				},
				{}
			)
			if (userAvailabilities.length === 0 && sessions.length === 0) {
				const availabilitiesByDay = getAvailabilitiesByDay({
					startEpoch: query.startEpoch,
					endEpoch: query.endEpoch,
					availabilities: [{}],
				})
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'Events fetchedDD',
					result: availabilitiesByDay,
				})
			}

			// Filter out recurring events and generate instances within the date range
			const start = performance.now()
			userAvailabilities = buildUserAvailabilities({
				startEpoch: query.startEpoch,
				endEpoch: query.endEpoch,
				userAvailabilities: userAvailabilities,
			})
			/* 			userAvailabilities.forEach((userAvailability) => {
				if (userAvailability.repeat_unit == null) {
					// if its a onetime event include it
					allEvents.push(userAvailability)
				} else {
					// if its a recurring event generate events in the date range
					const start = moment(startDate * 1000).startOf('day') // Convert start date to milliseconds and set time to start of day
					const end = moment(endDate * 1000).endOf('day') // Convert end date to milliseconds and set time to end of day
					let occurrenceDate = moment(userAvailability.start_time * 1000) // Convert event start time to milliseconds and set time to start of day
					let occurrenceEndDate = moment(userAvailability.end_time * 1000) // Convert event start time to milliseconds and set time to start of day

					while (occurrenceDate.isSameOrBefore(end)) {
						const occurrenceDateClone = moment(occurrenceDate) //clone of occurrenceDate

						if (
							occurrenceDate.isSameOrAfter(start) &&
							(userAvailability.repeat_on == null ||
								userAvailability.repeat_on.includes(moment.weekdays()[occurrenceDate.day()])) &&
							(userAvailability.expiration_date == null ||
								occurrenceDate.isSameOrBefore(moment.unix(userAvailability.expiration_date))) &&
							(userAvailability.exceptions == null ||
								userAvailability.exceptions[occurrenceDateClone.startOf('day').unix()] == undefined)
						) {
							allEvents.push({
								...userAvailability,
								start_time: occurrenceDate.unix(),
								end_time: occurrenceEndDate.unix(),
								start_time_date: occurrenceDate.utcOffset('+05:30').format('YYYY-MMM-DD hh:mm A'),
								end_time_date: occurrenceEndDate.utcOffset('+05:30').format('YYYY-MMM-DD hh:mm A'),
							})
						} else if (
							userAvailability?.exceptions !== null &&
							userAvailability?.exceptions[occurrenceDateClone.startOf('day').unix()] !== undefined &&
							userAvailability?.exceptions[occurrenceDateClone.startOf('day').unix()]?.start_time !==
								undefined
						) {
							// if an exception exists for the occurrence date use the updated time from the exception
							const { start_time, end_time } =
								userAvailability.exceptions[occurrenceDate.startOf('day').unix()]

							allEvents.push({ ...userAvailability, start_time: start_time, end_time: end_time })
						}
						occurrenceDate.add(
							userAvailability.repeat_increment || 1,
							userAvailability.repeat_unit.toLowerCase()
						)
						occurrenceEndDate.add(
							userAvailability.repeat_increment || 1,
							userAvailability.repeat_unit.toLowerCase()
						)
						if (
							userAvailability.repeat_unit === 'MONTH' &&
							userAvailability.repeat_on &&
							userAvailability.occurrence_in_month
						) {
							//console.log('inside IF 189')
							// If repeat_on is specified for monthly events, adjust the occurrenceDate to match the specified occurrence within the month
							const dayOfWeek = moment.weekdays().indexOf(userAvailability.repeat_on[0])
							//console.log('dayOfWeek::', dayOfWeek)
							occurrenceDate = occurrenceDate.clone().startOf('month').day(dayOfWeek)
							//console.log('occurrenceDate::', occurrenceDate)

							const occurrenceWeek = userAvailability.occurrence_in_month // Adjust occurrence_in_month to array index
							//console.log('occurrenceWeek::', occurrenceWeek)

							occurrenceDate.add(occurrenceWeek, 'weeks')
						}
					}
				}
			}) */
			const end = performance.now()
			console.log(`Elapsed time: ${end - start} milliseconds`)

			let updatedAvailabilities = userAvailabilities
			if (sessions) {
				updatedAvailabilities = this.updateAvailabilities(sessions, userAvailabilities)
				updatedAvailabilities = this.filterAvailabilitiesByMinimumDuration(userAvailabilities)
			}
			console.log('After split::', updatedAvailabilities)

			const availabilitiesByDay = getAvailabilitiesByDay({
				startEpoch: query.startEpoch,
				endEpoch: query.endEpoch,
				availabilities: updatedAvailabilities,
			})
			if (!availabilitiesByDay) {
				return responses.successResponse({
					statusCode: httpStatusCode.internal_server_error,
					message: 'Events fetched',
					result: flag,
				})
			}
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'Events fetched',
				result: availabilitiesByDay,
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async isAvailable(query, userId) {
		try {
			const filter = {
				[Op.or]: [
					{
						start_time: {
							[Op.between]: [query.startEpoch, query.endEpoch],
						},
						repeat_unit: null, // Include one-time events
					},
					{
						repeat_unit: {
							[Op.not]: null, // Include recurring events
						},
					},
				],
				user_id: userId,
			}
			let userAvailabilities = await availabilityQueries.findAvailability(filter)
			const sessions = await sessionQueries.findAll(
				{
					start_date: {
						[Op.between]: [query.startEpoch, query.endEpoch],
					},
				},
				{}
			)
			if (userAvailabilities.length === 0) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'Events fetched',
					result: {
						is_available: false,
					},
				})
			}

			// Filter out recurring events and generate instances within the date range
			const start = performance.now()
			userAvailabilities = buildUserAvailabilities({
				startEpoch: query.startEpoch,
				endEpoch: query.endEpoch,
				userAvailabilities: userAvailabilities,
			})
			/* 			userAvailabilities.forEach((userAvailability) => {
				if (userAvailability.repeat_unit == null) {
					// if its a onetime event include it
					allEvents.push(userAvailability)
				} else {
					// if its a recurring event generate events in the date range
					const start = moment(startDate * 1000).startOf('day') // Convert start date to milliseconds and set time to start of day
					const end = moment(endDate * 1000).endOf('day') // Convert end date to milliseconds and set time to end of day
					let occurrenceDate = moment(userAvailability.start_time * 1000) // Convert event start time to milliseconds and set time to start of day
					let occurrenceEndDate = moment(userAvailability.end_time * 1000) // Convert event start time to milliseconds and set time to start of day

					while (occurrenceDate.isSameOrBefore(end)) {
						const occurrenceDateClone = moment(occurrenceDate) //clone of occurrenceDate

						if (
							occurrenceDate.isSameOrAfter(start) &&
							(userAvailability.repeat_on == null ||
								userAvailability.repeat_on.includes(moment.weekdays()[occurrenceDate.day()])) &&
							(userAvailability.expiration_date == null ||
								occurrenceDate.isSameOrBefore(moment.unix(userAvailability.expiration_date))) &&
							(userAvailability.exceptions == null ||
								userAvailability.exceptions[occurrenceDateClone.startOf('day').unix()] == undefined)
						) {
							allEvents.push({
								...userAvailability,
								start_time: occurrenceDate.unix(),
								end_time: occurrenceEndDate.unix(),
								start_time_date: occurrenceDate.utcOffset('+05:30').format('YYYY-MMM-DD hh:mm A'),
								end_time_date: occurrenceEndDate.utcOffset('+05:30').format('YYYY-MMM-DD hh:mm A'),
							})
						} else if (
							userAvailability?.exceptions !== null &&
							userAvailability?.exceptions[occurrenceDateClone.startOf('day').unix()] !== undefined &&
							userAvailability?.exceptions[occurrenceDateClone.startOf('day').unix()]?.start_time !==
								undefined
						) {
							// if an exception exists for the occurrence date use the updated time from the exception
							const { start_time, end_time } =
								userAvailability.exceptions[occurrenceDate.startOf('day').unix()]

							allEvents.push({ ...userAvailability, start_time: start_time, end_time: end_time })
						}
						occurrenceDate.add(
							userAvailability.repeat_increment || 1,
							userAvailability.repeat_unit.toLowerCase()
						)
						occurrenceEndDate.add(
							userAvailability.repeat_increment || 1,
							userAvailability.repeat_unit.toLowerCase()
						)
						if (
							userAvailability.repeat_unit === 'MONTH' &&
							userAvailability.repeat_on &&
							userAvailability.occurrence_in_month
						) {
							//console.log('inside IF 189')
							// If repeat_on is specified for monthly events, adjust the occurrenceDate to match the specified occurrence within the month
							const dayOfWeek = moment.weekdays().indexOf(userAvailability.repeat_on[0])
							//console.log('dayOfWeek::', dayOfWeek)
							occurrenceDate = occurrenceDate.clone().startOf('month').day(dayOfWeek)
							//console.log('occurrenceDate::', occurrenceDate)

							const occurrenceWeek = userAvailability.occurrence_in_month // Adjust occurrence_in_month to array index
							//console.log('occurrenceWeek::', occurrenceWeek)

							occurrenceDate.add(occurrenceWeek, 'weeks')
						}
					}
				}
			}) */
			const end = performance.now()
			console.log(`Elapsed time: ${end - start} milliseconds`)

			let updatedAvailabilities = userAvailabilities
			if (sessions) {
				updatedAvailabilities = this.updateAvailabilities(sessions, userAvailabilities)
				updatedAvailabilities = this.filterAvailabilitiesByMinimumDuration(userAvailabilities)
			}

			const isInAnyAvailability = updatedAvailabilities
				.map((availability) => {
					return query.startEpoch >= availability.start_time && query.endEpoch <= availability.end_time
				})
				.includes(true)
			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'Events fetched',
				result: {
					is_available: isInAnyAvailability,
				},
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}

	static async availableUsers(query) {
		try {
			const filter = {
				[Op.or]: [
					{
						start_time: {
							[Op.between]: [query.startEpoch, query.endEpoch],
						},
						repeat_unit: null, // Include one-time events
					},
					{
						repeat_unit: {
							[Op.not]: null, // Include recurring events
						},
					},
				],
			}
			let userAvailabilities = await availabilityQueries.findAvailability(filter)
			const sessions = await sessionQueries.findAll(
				{
					start_date: {
						[Op.between]: [query.startEpoch, query.endEpoch],
					},
				},
				{}
			)
			if (userAvailabilities.length === 0) {
				return responses.successResponse({
					statusCode: httpStatusCode.ok,
					message: 'Events fetched',
					result: {
						is_available: false,
					},
				})
			}

			// Filter out recurring events and generate instances within the date range
			const start = performance.now()
			userAvailabilities = buildUserAvailabilities({
				startEpoch: query.startEpoch,
				endEpoch: query.endEpoch,
				userAvailabilities: userAvailabilities,
			})
			/* 			userAvailabilities.forEach((userAvailability) => {
				if (userAvailability.repeat_unit == null) {
					// if its a onetime event include it
					allEvents.push(userAvailability)
				} else {
					// if its a recurring event generate events in the date range
					const start = moment(startDate * 1000).startOf('day') // Convert start date to milliseconds and set time to start of day
					const end = moment(endDate * 1000).endOf('day') // Convert end date to milliseconds and set time to end of day
					let occurrenceDate = moment(userAvailability.start_time * 1000) // Convert event start time to milliseconds and set time to start of day
					let occurrenceEndDate = moment(userAvailability.end_time * 1000) // Convert event start time to milliseconds and set time to start of day

					while (occurrenceDate.isSameOrBefore(end)) {
						const occurrenceDateClone = moment(occurrenceDate) //clone of occurrenceDate

						if (
							occurrenceDate.isSameOrAfter(start) &&
							(userAvailability.repeat_on == null ||
								userAvailability.repeat_on.includes(moment.weekdays()[occurrenceDate.day()])) &&
							(userAvailability.expiration_date == null ||
								occurrenceDate.isSameOrBefore(moment.unix(userAvailability.expiration_date))) &&
							(userAvailability.exceptions == null ||
								userAvailability.exceptions[occurrenceDateClone.startOf('day').unix()] == undefined)
						) {
							allEvents.push({
								...userAvailability,
								start_time: occurrenceDate.unix(),
								end_time: occurrenceEndDate.unix(),
								start_time_date: occurrenceDate.utcOffset('+05:30').format('YYYY-MMM-DD hh:mm A'),
								end_time_date: occurrenceEndDate.utcOffset('+05:30').format('YYYY-MMM-DD hh:mm A'),
							})
						} else if (
							userAvailability?.exceptions !== null &&
							userAvailability?.exceptions[occurrenceDateClone.startOf('day').unix()] !== undefined &&
							userAvailability?.exceptions[occurrenceDateClone.startOf('day').unix()]?.start_time !==
								undefined
						) {
							// if an exception exists for the occurrence date use the updated time from the exception
							const { start_time, end_time } =
								userAvailability.exceptions[occurrenceDate.startOf('day').unix()]

							allEvents.push({ ...userAvailability, start_time: start_time, end_time: end_time })
						}
						occurrenceDate.add(
							userAvailability.repeat_increment || 1,
							userAvailability.repeat_unit.toLowerCase()
						)
						occurrenceEndDate.add(
							userAvailability.repeat_increment || 1,
							userAvailability.repeat_unit.toLowerCase()
						)
						if (
							userAvailability.repeat_unit === 'MONTH' &&
							userAvailability.repeat_on &&
							userAvailability.occurrence_in_month
						) {
							//console.log('inside IF 189')
							// If repeat_on is specified for monthly events, adjust the occurrenceDate to match the specified occurrence within the month
							const dayOfWeek = moment.weekdays().indexOf(userAvailability.repeat_on[0])
							//console.log('dayOfWeek::', dayOfWeek)
							occurrenceDate = occurrenceDate.clone().startOf('month').day(dayOfWeek)
							//console.log('occurrenceDate::', occurrenceDate)

							const occurrenceWeek = userAvailability.occurrence_in_month // Adjust occurrence_in_month to array index
							//console.log('occurrenceWeek::', occurrenceWeek)

							occurrenceDate.add(occurrenceWeek, 'weeks')
						}
					}
				}
			}) */
			const end = performance.now()
			console.log(`Elapsed time: ${end - start} milliseconds`)

			let updatedAvailabilities = userAvailabilities
			if (sessions) {
				updatedAvailabilities = this.updateAvailabilities(sessions, userAvailabilities)
				updatedAvailabilities = this.filterAvailabilitiesByMinimumDuration(userAvailabilities)
			}

			const available_users = updatedAvailabilities.map(({ user_id }) => user_id)

			return responses.successResponse({
				statusCode: httpStatusCode.ok,
				message: 'Events fetched',
				result: {
					available_users,
				},
			})
		} catch (error) {
			console.log(error)
			throw error
		}
	}
}
