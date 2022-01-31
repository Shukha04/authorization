const Router = require('express').Router
const userController = require('../controllers/user')
const router = new Router()
const { body } = require('express-validator')
const authMiddleware = require('../middleware/auth')

router.post('/register',
	body('email').isEmail(),
	body('password').isLength({ min: 8, max: 32 }),
	userController.registration)
router.post('/login', userController.login)
router.get('/refresh', userController.refresh)
router.post('/logout', userController.logout)
router.get('/activate', userController.activate)
router.get('/users', authMiddleware, userController.getUsers)

module.exports = router