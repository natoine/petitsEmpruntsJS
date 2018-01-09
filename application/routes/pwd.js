// load up the user model
const User            = require('../models/user')

//to send emails
const mailSender = require('../utils/mailSender')

const TIMINGTOCHANGEPWD = 3600000

const security = require('../utils/securityMiddleware')

module.exports = function(app, express) {

	// get an instance of the router for pwd routes
	const pwdRoutes = express.Router()

	// =====================================
    // PWD RECOVERY ==============================
    // =====================================
    // show the pwd recovery form ( form to ask an email to recover )
    // or if ?token="" shows the form to select a new pwd
    pwdRoutes.get('/pwdrecovery', function(req, res) {
        const token = req.query.token
        customheaders = []
        customscripts = []
        if(!token)
        {
            res.render('pages/pwdrecovery', 
                { 
                    messagedanger: req.flash('messagedanger') , 
                    messagesuccess: req.flash('messagesuccess'),
                    customheaders : customheaders,
                    customscripts : customscripts
                 })
        }
        else
        {
            User.findOne({ 'local.pwdrecotoken' :  token }, function(err, user) 
            {
                // if there are any errors, return the error
                if (err)
                {
                    console.log("pwd recovery - ERROR : " + err)
                    req.flash('messagedanger', 'An error occured, retry')
                    res.render('pages/pwdrecovery' , 
                        { 
                            messagedanger: req.flash('messagedanger') ,
                            messagesuccess: req.flash('messagesuccess'),
                            customheaders : customheaders,
                            customscripts : customscripts
                        })
                }
                if (user) 
                {
                    const now = new Date().getTime()
                    if( now - user.local.timepwdreco > TIMINGTOCHANGEPWD )
                    {
                        req.flash('messagedanger', 
                            'too late ! more than one hour since you asked to change pwd')
                        res.render('pages/pwdrecovery' , 
                            { 
                                messagedanger: req.flash('messagedanger') ,
                                messagesuccess: req.flash('messagesuccess'),
                                customheaders : customheaders,
                                customscripts : customscripts
                            })
                    }
                    else
                    {
                        res.render('pages/pwdrecoverylink' , 
                            { 
                                messagedanger: req.flash('messagedanger') ,
                                messagesuccess: req.flash('messagesuccess'), 
                                email: user.local.email, 
                                token: token })
                    }
                }
                else
                {
                    res.redirect('/')
                }
            })
        }
    })

    //process the ask for pwd recovery form
    pwdRoutes.post('/pwdrecovery' , function(req, res) {

        const email = req.body.email
        //check to see if email is correctly spelled
        if(!mailSender.validateMail(email))
        {
            req.flash('messagedanger', 'That email is not correctly spelled')
            res.redirect('/pwdrecovery')
        }
        else 
        {
            User.findOne({ 'local.email' :  email }, function(err, user) 
            {
                // if there are any errors, return the error
                if (err)
                {
                    console.log("pwd recovery - ERROR2 : " + err)
                    req.flash('messagedanger', 'An error occured, try later')
                    res.redirect('/pwdrecovery') 
                }
                // check to see if theres already a user with that email
                if (user) 
                {
                    const now = new Date().getTime()
                    user.local.timepwdreco = now
                    user.local.pwdrecotoken = user.generatePwdRecoToken(email , now)
                    user.save(function(err) 
                    {
                        if (err)
                        {
                            console.log("pwd recovery - ERROR3 : " + err)
                            //flash
                            req.flash('messagedanger', 'An error occured, try later')
                            res.redirect('/pwdrecovery')
                        }
                        else
                        {
                            //sends an email to recover password
                            var subject = "Récupération de votre mot de Passe petitsEmprunts"
                            var html = `Cliquez sur le lien suivant pour changer votre Mot de Passe : ` 
                                 + `<a href="${mailSender.urlService}/pwdrecovery?token=${user.local.pwdrecotoken}`
                                 + `">Password change</a>`
                            mailSender.sendMail(email, subject, html, function(error, response){
                                if(error)
                                {
                                    console.log("pwd recovery - ERROR4 : " + error)
                                    //flash
                                    req.flash('messagedanger', 'An error occured, try later')
                                    res.redirect('/pwdrecovery')
                                }
                            })

                            //flash
                            req.flash('messagesuccess', 'An email has been sent')
                            res.redirect('/pwdrecovery')
                        }
                    })      
                } 
                else {
                    //sends an email to prevent a missuse of email
                        var subject = "PetitsEmprunts tentative d'utilisation de votre mail"
                        var html = `Quelqu'un essaye d'utiliser votre mail pour se connecter sur PetitsEmprunts mais vous n'êtes pas inscrit ... `
                        + `vous pouvez découvrir Petits Emprunts ici : ` 
                        + `<a href="${mailSender.urlService}">Petits Emprunts</a>` 
                        mailSender.sendMail(email, subject, html, function(error, response){
                            if(error)
                            {
                                console.log("pwd recovery - ERROR5 : " + error)
                            }
                        })

                    //flash
                    req.flash('messagesuccess', 'An email has been sent')
                    res.redirect('/pwdrecovery')
                }

            })
        }
    })
   
    //process the new pwd recovery form
    pwdRoutes.post('/pwdchangerecovery' , function(req, res) {
        User.findOne({ 'local.email' :  req.body.email }, function(err, user) 
            {
                // if there are any errors, return the error
                if (err)
                {
                    console.log("pwd change recovery - ERROR : " + err)
                    req.flash('messagedanger', 'An error occured, try later')
                    res.redirect('/pwdrecovery')
                }
                if (user) 
                {
                    const now = new Date().getTime()
                    if( user.local.pwdrecotoken.localeCompare(req.body.token)!=0 || 
                        now - user.local.timepwdreco > TIMINGTOCHANGEPWD )
                    {
                        req.flash('messagedanger', 
                            'You have taken too long time or are not authorized to change. Try again.')
                        res.redirect('/pwdrecovery')
                    }
                    else
                    {
                        newpwd = req.body.password
                        if(newpwd.length != 0)
                        {
                            user.local.password = user.generateHash(newpwd)
                            user.local.pwdrecotoken = ""
                            user.local.timepwdreco = ""
                            user.local.mailvalidated = true //validate account in the same time. Afterall, if a guy recovers pwd but is not activated, we have verified its email in the same time.
                            user.save(function(err) {
                                if (err)
                                {
                                    console.log("pwd change recovery - ERROR2 : " + err)
                                    req.flash('messagedanger', 'An error occured, try later')
                                    res.redirect('/pwdrecovery')
                                }
                                else
                                {
                                    req.flash('messagesuccess', 'pwd changed. Try to login.')
                                    res.redirect("/")
                                }
                            })
                        }
                        else
                        {
                            req.flash('messagedanger', 'Bad pwd, try again')
                            res.render('pwdrecoverylink' , 
                            { 
                                messagedanger: req.flash('messagedanger'),
                                messagesuccess: req.flash('messagesuccess'),  
                                email: user.local.email, 
                                token: req.body.token 
                            })
                        }
                    }
                }
            })
    })

	// =====================================
	// CHANGE PWD ==============================
	// =====================================


    pwdRoutes.get('/changepwd', security.isLoggedInAndActivated, function(req, res) {
        res.render('pages/changepwd', {
            email: req.user.local.email, 
            messagedanger: req.flash('messagedanger'),
            messagesuccess: req.flash('messagesuccess'),
            username: req.user.local.username,
            isadmin : req.user.isSuperAdmin()
        })
    })

    pwdRoutes.post('/changepwd', security.isLoggedInAndActivated, function(req, res){
        const user = req.user
        if(!user.validPassword(req.body.currentpassword))
        {
            req.flash('messagedanger', 'not the right password')
            res.redirect('/changepwd')
        }
        else
        {
            user.local.password = user.generateHash(req.body.newpassword)
            user.save(function(err) 
            {
                if (err) 
                {
                    console.log("change pwd ERROR : " + err)
                    //flash
                    req.flash('messagedanger', 'An error occured, try later')
                    res.redirect('/changepwd')
                }
                else
                {
                    req.flash('messagelocalauthsuccess', 'pwd changed. Try to login.')
                    req.logout()
                    res.redirect('/')
                }
            })
        }
    })

	// apply the routes to our application
	app.use('/', pwdRoutes)
}