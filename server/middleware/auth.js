const ApiError = require('../exceptions/error')
const tokenService = require('../services/token')

module.exports = function (req, res, next) {
	try {
		const header = req.headers.authorization
		if (!header) {
			return next(ApiError.Unauthorized())
		}

		const accessToken = header.split(' ')[1]
		if (!accessToken) {
			return next(ApiError.Unauthorized())
		}

		const userData = tokenService.validateAccessToken(accessToken)
		if (!userData) {
			return next(ApiError.Unauthorized())
		}

		req.user = userData
		next()
	} catch (e) {
		return next(ApiError.Unauthorized())
	}
}