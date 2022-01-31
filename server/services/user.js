const User = require('../models/User')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail')
const tokenService = require('./token')
const UserDto = require('../dtos/user')
const ApiError = require('../exceptions/error')

class UserService {
	async registration(email, password) {
		const candidate = await User.findOne({ email })
		if (candidate) {
			throw ApiError.BadRequest('This email is already registered.')
		}

		password = await bcrypt.hash(password, 12)
		const activationLink = uuid.v4()

		const user = await User.create({ email, password, activationLink })
		await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

		const userDto = new UserDto(user)
		const tokens = tokenService.generateTokens({ ...userDto })
		await tokenService.saveToken(userDto.id, tokens.refreshToken)

		return { ...tokens, user: { ...userDto, activationLink: activationLink } }
	}

	async activate(activationLink) {
		const user = await User.findOne({ activationLink })
		if (!user) {
			throw ApiError.BadRequest('Incorrect activation link')
		}
		user.isActivated = true
		await user.save()
	}

	async login(email, password) {
		const user = await User.findOne({ email })
		if (!user) {
			throw ApiError.BadRequest('This email is not registered')
		}

		const isValidPass = await bcrypt.compare(password, user.password)
		if (!isValidPass) {
			throw ApiError.BadRequest('Wrong credentials')
		}

		const userDto = new UserDto(user)
		const tokens = tokenService.generateTokens({ ...userDto })
		await tokenService.saveToken(userDto.id, tokens.refreshToken)

		return { ...tokens, user: userDto }
	}

	async logout(refreshToken) {
		const token = await tokenService.removeToken(refreshToken)
		return token
	}

	async refresh(refreshToken) {
		if (!refreshToken) {
			throw ApiError.Unauthorized()
		}
		const userData = tokenService.validateRefreshToken(refreshToken)
		const tokenInDB = await tokenService.findToken(refreshToken)

		if (!userData || !tokenInDB) {
			throw ApiError.Unauthorized()
		}

		const user = await User.findById(userData.id)
		const userDto = new UserDto(user)
		const tokens = tokenService.generateTokens({ ...userDto })
		await tokenService.saveToken(userDto.id, tokens.refreshToken)

		return { ...tokens, user: userDto }
	}

	async getAll() {
		const users = await User.find()
		return users
	}
}

module.exports = new UserService()