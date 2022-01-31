const nodemailer = require('nodemailer')

const { SMTP_PORT, SMTP_HOST, SMTP_PASSWORD, SMTP_USER } = process.env

class MailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: SMTP_HOST,
			port: SMTP_PORT,
			secure: true,
			auth: {
				user: SMTP_USER,
				pass: SMTP_PASSWORD
			}
		})
	}

	async sendActivationMail(to, link) {
		console.log(link)
		await this.transporter.sendMail({
			from: SMTP_USER,
			to,
			subject: 'Account activating',
			text: '',
			html: `
				<div>
					<h1>Follow the link below to activate your account</h1>
					<a href='${link}'>Activate</a>
				</div>
				`
		})
	}
}

module.exports = new MailService()