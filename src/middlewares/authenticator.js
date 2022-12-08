/**
 * name : middlewares/authenticator
 * author : Aman Kumar Gupta
 * Date : 04-Nov-2021
 * Description : Validating authorized requests
 */

const jwt = require('jsonwebtoken')

const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const requests = require('@generics/requests')
const endpoints = require('@constants/endpoints')

module.exports = async function (req, res, next) {
	try {
		let internalAccess = false
		let guestUrl = false

		const authHeader = req.get('X-auth-token')

		common.internalAccessUrs.map(function (path) {
			if (req.path.includes(path)) {
				if (
					req.headers.internal_access_token &&
					process.env.INTERNAL_ACCESS_TOKEN == req.headers.internal_access_token
				) {
					internalAccess = true
				}
			}
		})

		common.guestUrls.map(function (path) {
			if (req.path.includes(path)) {
				guestUrl = true
			}
		})

		if ((internalAccess || guestUrl) && !authHeader) {
			next()
			return
		}

		if (!authHeader) {
			throw common.failureResponse({
				message: 'UNAUTHORIZED_REQUEST',
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'UNAUTHORIZED',
			})
		}
		const authHeaderArray = authHeader.split(' ')
		if (authHeaderArray[0] !== 'bearer') {
			throw common.failureResponse({
				message: 'UNAUTHORIZED_REQUEST',
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'UNAUTHORIZED',
			})
		}
		let decodedToken
		try {
			decodedToken = jwt.verify(authHeaderArray[1], process.env.ACCESS_TOKEN_SECRET)
			console.log('DECODED TOKEN: ', decodedToken)
		} catch (err) {
			err.statusCode = httpStatusCode.unauthorized
			err.responseCode = 'UNAUTHORIZED'
			err.message = 'ACCESS_TOKEN_EXPIRED'
			throw err
		}

		if (!decodedToken) {
			throw common.failureResponse({
				message: 'UNAUTHORIZED_REQUEST',
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'UNAUTHORIZED',
			})
		}

		/* Invalidate token when user role is updated, say from mentor to mentee or vice versa */
		const userBaseUrl = process.env.USER_SERIVCE_HOST + process.env.USER_SERIVCE_BASE_URL
		const profileUrl = userBaseUrl + endpoints.USER_PROFILE_DETAILS + '/' + decodedToken.data._id

		const user = await requests.get(
			profileUrl,
			'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6IjYzOTA5ZDVhNmUxYTBlMjJhMDgwNjIxMSIsImVtYWlsIjoiam9mZmluYkB0dW5lcmxhYnMuY29tIiwibmFtZSI6ImpvZmZpbmIiLCJpc0FNZW50b3IiOnRydWV9LCJpYXQiOjE2NzA0MjE4NTAsImV4cCI6MTY3MDUwODI1MH0.O6Wbr49HWjiFhUhSfcHguLUJB5YocC-D9eNL3rqVXZU',
			true
		)

		console.log('USSSSSSSSSSSSSSSSSSSSSSSSSSER : ', user)

		if (user.data.result.isAMentor !== decodedToken.data.isAMentor) {
			throw common.failureResponse({
				message: 'USER_ROLE_UPDATED',
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'UNAUTHORIZED',
			})
		}

		req.decodedToken = {
			_id: decodedToken.data._id,
			email: decodedToken.data.email,
			isAMentor: decodedToken.data.isAMentor,
			name: decodedToken.data.name,
			token: authHeader,
		}
		next()
	} catch (err) {
		next(err)
	}
}
