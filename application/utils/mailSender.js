
const MailSender = {

	'smtpTransport' : require('../../config/mailer') ,
	'urlService' : require('../../config/usefulvars').urlService
}

MailSender.sendMail = (emailto , subject, html, functionErrorResponse) => {
	const mailOptions = {
                        	to: emailto ,
                        	subject : subject ,
                        	html : html
                        }
    MailSender.smtpTransport.sendMail(mailOptions, functionErrorResponse)
}

//check to see if email is correctly spelled
MailSender.validateMail = (email) => {
    const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    console.log(email)
    if(!email.match(mailformat)) return false
    else return true
}

module.exports = MailSender