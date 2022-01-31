const userService = require('../services/user')
const { validationResult } = require('express-validator')
const ApiError = require('../exceptions/error')

class UserController {
	async registration(req, res, next) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return next(ApiError.BadRequest('Validation error', errors.array()))
			}

			const { email, password } = req.body
			const userData = await userService.registration(email, password)
			res.cookie('refresh-token', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true
			})

			return res.json(userData)
		} catch (e) {
			next(e)
		}
	}

	async login(req, res, next) {
		try {
			const { identifier, password } = req.body
			const userData = await userService.login(identifier, password)
			res.cookie('refresh-token', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true
			})

			return res.json(userData)
		} catch (e) {
			next(e)
		}
	}

	async logout(req, res, next) {
		try {
			const refreshToken = req.cookies['refresh-token']
			const token = await userService.logout(refreshToken)
			res.clearCookie('refresh-token')

			return res.json(token)
		} catch (e) {
			next(e)
		}
	}

	async activate(req, res, next) {
		try {
			const activationLink = req.query.link
			await userService.activate(activationLink)
			return res.redirect(process.env.CLIENT_URL)
		} catch (e) {
			next(e)
		}
	}

	async refresh(req, res, next) {
		try {
			const refreshToken = req.cookies['refresh-token']
			const userData = await userService.refresh(refreshToken)
			res.cookie('refresh-token', userData.refreshToken, {
				maxAge: 30 * 24 * 60 * 60 * 1000,
				httpOnly: true
			})

			return res.json(userData)
		} catch (e) {
			next(e)
		}
	}

	async getUsers(req, res, next) {
		try {
			const users = await userService.getAll()
			return res.json(users)
		} catch (e) {
			next(e)
		}
	}
}

module.exports = new UserController()