const kafkaCommunication = require('@generics/kafka-communication')

module.exports = {
	sessionDataToKafka(doc) {
		try {
			let sessionData = JSON.parse(JSON.stringify(doc.value))
			let keysToRemove = [
				'deleted',
				'feedbacks',
				'internalMeetingId',
				'isStarted',
				'menteeFeedbackForm',
				'menteePassword',
				'mentorFeedbackForm',
				'mentorPassword',
				'recordingUrl',
				'skippedFeedback',
				'status',
				'userId',
				'__v',
			]
			Object.keys(sessionData).forEach((key) => {
				if (keysToRemove.includes(key)) {
					delete sessionData[key]
				}
			})
			kafkaCommunication.pushSessionToKafka(sessionData)
		} catch (error) {
			console.log(error)
		}
	},
}
