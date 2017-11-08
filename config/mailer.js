// config/mailer.js

const nodemailer = require('nodemailer')

const smtpTransport = nodemailer.createTransport({
	    service: "gmail",
	    host: "smtp.gmail.com",
	    auth: {
	        user: process.env.userGMAILPetitsEmprunts,
	        pass: process.env.pwdGMAILPetitsEmprunts
	    }
	})

module.exports = smtpTransport
