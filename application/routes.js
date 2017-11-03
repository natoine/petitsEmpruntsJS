// load up the user model
const User            = require('../application/models/user')
//load up the loan model
const Loan = require('../application/models/loan')

//to send emails
const smtpTransport = require('../config/mailer')

const TIMINGTOCHANGEPWD = 3600000

//needed for filesystem
const fs = require('fs')

// application/routes.js
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        req.logout()
        res.render('index')// load the index.ejs file
    })

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login', { message: req.flash('loginMessage') })
    })

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/main', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }))

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup', { message: req.flash('signupMessage') })
    })

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/signup', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }))

    // =====================================
    // PWD RECOVERY ==============================
    // =====================================
    // show the pwd recovery form
    app.get('/pwdrecovery', function(req, res) {
        const token = req.query.token
        if(!token)
        {
            res.render('pwdrecovery', 
                { messagedanger: req.flash('pwdrecoveryMessage') , 
                messageok: req.flash('pwdrecoveryokMessage') })
        }
        else
        {
            User.findOne({ 'local.pwdrecotoken' :  token }, function(err, user) 
            {
                // if there are any errors, return the error
                if (err)
                {
                    console.log(err)
                    req.flash('pwdrecoveryMessage', 'An error occured, try later')
                    res.render('pwdrecovery' , 
                        { messagedanger: req.flash('pwdrecoveryMessage') , messageok: ""})
                }
                if (user) 
                {
                    const now = new Date().getTime()
                    if( now - user.local.timepwdreco > TIMINGTOCHANGEPWD ) 
                    {
                        req.flash('pwdrecoveryMessage', 
                            'too late ! more than one hour since you asked to change pwd')
                        res.render('pwdrecovery' , 
                            { messagedanger: req.flash('pwdrecoveryMessage') , messageok: "" })
                    }
                    else
                    {
                        res.render('pwdrecoverylink' , 
                            { message: req.flash('pwdrecoverylinkMessage'), 
                                email: user.local.email, token: token })
                    }
                }
                else
                {
                    res.redirect('/')
                }
            })
        }
    })

    //process the pwd recovery form
    app.post('/pwdrecovery' , function(req, res) {

        const email = req.body.email
        //check to see if email is correctly spelled
        const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        if(!email.match(mailformat)) {
            req.flash('pwdrecoveryMessage', 'That email is not correctly spelled')
            res.render('pwdrecovery', { messagedanger: req.flash('pwdrecoveryMessage') , messageok: ""})
        }
        else 
        {
            User.findOne({ 'local.email' :  email }, function(err, user) 
            {
                // if there are any errors, return the error
                if (err)
                {
                    console.log(err)
                    req.flash('pwdrecoveryMessage', 'An error occured, try later')
                    res.render('pwdrecovery', 
                        { messagedanger: req.flash('pwdrecoveryMessage') , messageok: "" })
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
                            console.log(err)
                            //flash
                            req.flash('pwdrecoveryMessage', 'An error occured, try later')
                            req.flash('pwdrecoveryokMessage', '')
                            res.render('pwdrecovery', 
                                { messageok: req.flash('pwdrecoveryokMessage') , 
                                messagedanger: req.flash('pwdrecoveryMessage') })
                        }
                        else
                        {
                            //sends an email to recover password
                            const mailOptions =
                            {
                                to : email,
                                subject : "petitsEmprunts pwd recovery ok",
                                html : "you seem to have lost your pwd. "
                                 + "Click on the following link to change your password : " 
                                 + "<a href=\"http://localhost:8080/pwdrecovery?token=" + user.local.pwdrecotoken
                                 + "\">Password change</a>"
                            }
                            smtpTransport.sendMail(mailOptions, function(error, response){
                                if(error)
                                {
                                    console.log(error)
                                    //flash
                                    req.flash('pwdrecoveryMessage', 'An error occured, try later')
                                    req.flash('pwdrecoveryokMessage', '')
                                    res.render('pwdrecovery', 
                                        { messageok: req.flash('pwdrecoveryokMessage') , 
                                        messagedanger: req.flash('pwdrecoveryMessage') })
                                }
                            })

                            //flash
                            req.flash('pwdrecoveryokMessage', 'An email has been sent')
                            req.flash('pwdrecoveryMessage', '')
                            res.render('pwdrecovery', 
                                { messageok: req.flash('pwdrecoveryokMessage') , 
                                messagedanger: req.flash('pwdrecoveryMessage') })
                        }
                    })      
                } 
                else {
                    //sends an email to prevent a missuse of email
                    const mailOptions =
                    {
                        to : email,
                        subject : "petitsEmprunts pwd recovery notok",
                        text : "someone thinks you use our service"
                    }
                    smtpTransport.sendMail(mailOptions, function(error, response){
                        if(error)
                        {
                            console.log(error)
                        }
                    })
                    //flash
                    req.flash('pwdrecoveryokMessage', 'An email has been sent')
                    res.render('pwdrecovery', 
                        { messageok: req.flash('pwdrecoveryokMessage') , 
                        messagedanger: "" })
                }

            })
        }
    })
   
    //process the pwd recovery form
    app.post('/pwdchangerecovery' , function(req, res) {
        User.findOne({ 'local.email' :  req.body.email }, function(err, user) 
            {
                // if there are any errors, return the error
                if (err)
                {
                    console.log(err)
                    req.flash('pwdrecoveryMessage', 'An error occured, try later')
                    res.render('pwdrecovery', 
                        { messagedanger: req.flash('pwdrecoveryMessage') , messageok: "" })
                }
                if (user) 
                {
                    const now = new Date().getTime()
                    if( user.local.pwdrecotoken.localeCompare(req.body.token)!=0 || 
                        now - user.local.timepwdreco > TIMINGTOCHANGEPWD )
                    {
                        req.flash('pwdrecoveryMessage', 
                            'You have taken too long time or are not authorized to change. Try again.')
                        req.flash('pwdrecoveryokMessage', '')
                        res.render('pwdrecovery', { messageok: req.flash('pwdrecoveryokMessage') ,
                         messagedanger: req.flash('pwdrecoveryMessage') })
                    }
                    else
                    {
                        user.local.password = user.generateHash(req.body.password)
                        user.local.pwdrecotoken = ""
                        user.local.timepwdreco = ""
                        user.local.mailvalidated = true //validate account in the same time. Afterall, if a guy recovers pwd but is not activated, we have verified its email in the same time.
                        user.save(function(err) {
                            if (err)
                            {
                                console.log(err)
                                //flash
                                req.flash('pwdrecoveryMessage', 'An error occured, try later')
                                req.flash('pwdrecoveryokMessage', '')
                                res.render('pwdrecovery', { messageok: req.flash('pwdrecoveryokMessage') , 
                                    messagedanger: req.flash('pwdrecoveryMessage') })
                            }
                            else
                            {
                                req.flash('loginMessage', 'pwd changed. Try to login.')
                                res.render('login', { message: req.flash('loginMessage') })
                            }
                        })
                    }
                }
            })
    })

   // =====================================
    // CHANGE PWD ==============================
    // =====================================


    app.get('/changepwd', isLoggedInAndActivated, function(req, res) {
        res.render('changepwd', {email: req.user.local.email, message: req.flash('changepwdMessage')})
    })

    app.post('/changepwd', isLoggedInAndActivated, function(req, res){
        const user = req.user
        if(!user.validPassword(req.body.currentpassword))
        {
            req.flash('changepwdMessage', 'not the right password')
            res.render('changepwd', {email: user.local.email, message: req.flash('changepwdMessage')})
        }
        else
        {
            user.local.password = user.generateHash(req.body.newpassword)
            user.save(function(err) 
            {
                if (err) 
                {
                    console.log(err)
                    //flash
                    req.flash('changepwdMessage', 'An error occured, try later')
                    res.render('changepwd', {email: user.local.email, message: req.flash('changepwdMessage')})
                }
                else
                {
                    req.flash('loginMessage', 'pwd changed. Try to login.')
                    res.render('login', { message: req.flash('loginMessage') })
                }
            })
        }
    })

    // =====================================
    // ACTIVATE ACCOUNT ==============================
    // =====================================
    app.get('/activateaccount', function(req, res) {
        const token = req.query.token
        User.findOne({ 'local.activationtoken' : token }, function(err, user) 
            {
                // if there are any errors, return the error
                if (err)
                {
                    console.log(err)
                    req.flash('activateAccountDangerMessage', 'An error occured, try later')
                    res.render('activateaccount', 
                        { messagedanger: req.flash('activateAccountDangerMessage') , messageok: "" })
                }
                if(user)
                {
                    if(user.local.email.localeCompare(req.query.email)==0)
                    {
                        if(user.isActivated())
                        {
                            console.log("user already activated")
                            res.redirect('/')
                        }
                        else
                        {
                            user.local.mailvalidated = true
                            user.save(function(err) 
                            {
                                if (err) 
                                {
                                    console.log(err)
                                    //flash
                                    req.flash('activateAccountDangerMessage', 'An error occured, try later')
                                    res.render('activateaccount', 
                                        { messagedanger: req.flash('activateAccountDangerMessage') , 
                                        messageok: "" })
                                }
                                else
                                {
                                    req.flash('activateAccountOkMessage', 'Account activated !')
                                    res.render('activateaccount', 
                                        { messagedanger: "" , messageok: req.flash('activateAccountOkMessage') })
                                }
                            })
                        }    
                    }
                    else {
                        res.redirect('/')
                    }
                }
                else {
                        res.redirect('/')
                }
            })
    })

    // =====================================
    // MAIN SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/main', isLoggedInAndActivated, function(req, res) {
        what = req.flash('what')
        whom = req.flash('whom')
        when = req.flash('when')
        action = req.flash('action')
        if(action.length === 0) action = "iBorrow" 

        user = req.user
        //TODO
        //=================
        // we should not send borrows and loans in this request
        // but make an API with token and fetch them from browser
        var myborrows
        Loan.find({ 'borrower' : user.local.email }, function(err, loans) {
            if(err) throw err
            else 
                {
                    myborrows = loans
                    var myloans
                    Loan.find({ 'loaner' : user.local.email }, function(err, loans) {
                        if(err) throw err
                        else 
                            {
                                myloans = loans
                                res.render('main', {
                                    username : user.local.username , 
                                        messagedangerwhat: req.flash('messagedangerwhat') , 
                                        messagedangerwhom: req.flash('messagedangerwhom') ,
                                        messagedangerwhen: req.flash('messagedangerwhen') ,
                                        what : what ,
                                        whom : whom ,
                                        when : when ,
                                        action : action ,
                                        myborrows : myborrows ,
                                        myloans : myloans
                                })
                            }
                    })
                }
        })
        
    })

    //creates a new loan !!! 
    app.post('/newloan', isLoggedInAndActivated, function(req, res) {
        what = req.body.what.trim()
        whom = req.body.whom.trim()
        when = req.body.when.trim()
        action = req.body.action
        user = req.user
        cancreateloan = true
        if(!what) 
        {
                console.log("what is empty")
                cancreateloan = false
                req.flash('messagedangerwhat', 'Précisez ce qui est emprunté')
        }
        if(!whom) 
        {
                console.log("whom is empty")
                cancreateloan = false
                req.flash('messagedangerwhom', 'Précisez avec qui se passe l\'emprunt')
        }
        if(!when) 
        {
                console.log("when is empty")
                cancreateloan = false
                req.flash('messagedangerwhen', 'Précisez quand l\'emprunt a lieu')
        }
        if(cancreateloan)
        {
            console.log("can create loan")
            var newLoan = new Loan()
            switch(action) 
            {
                case 'iBorrow':
                    newLoan.borrower = user.local.email
                    newLoan.loaner = whom
                    newLoan.what = what
                    newLoan.when = when
                    newLoan.save(function(err){
                        if (err) throw err
                        else 
                        {
                            const mailOptions =
                        {
                            to : newLoan.borrower,
                            subject : "petitsEmprunts nouvel emprunt",
                            html : "Vous venez d'emprunter " + what + " à " + whom
                        }
                        smtpTransport.sendMail(mailOptions, function(error, response){
                            if(error)
                            {
                                console.log(error)
                            }
                        })
                        }
                    })
                    break ;
                case 'iLoan' :
                    newLoan.loaner = user.local.email
                    newLoan.borrower = whom
                    newLoan.what = what
                    newLoan.when = when
                    newLoan.save(function(err){
                        if (err) throw err
                        else 
                        {
                            const mailOptions =
                        {
                            to : newLoan.loaner,
                            subject : "petitsEmprunts nouveau prêt",
                            html : "Vous venez de prêter " + what + " à " + whom
                        }
                        smtpTransport.sendMail(mailOptions, function(error, response){
                            if(error)
                            {
                                console.log(error)
                            }
                        })
                        }
                    })

                    break ;
            }

        }
        else
        {
            req.flash('what', what)
            req.flash('when', when)
            req.flash('whom', whom)
            req.flash('action', action)
            console.log("action : " + action)
        }
        res.redirect('/main')
    })

// =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/user/:username', isLoggedInAndActivated, function(req, res) {
        res.render('profile', {
            user : req.user // get the user out of session and pass to template
        })
    })

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }))

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/main',
            failureRedirect : '/'
        }))

 // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }))

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/main',
                    failureRedirect : '/'
            }))


    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) { 
        req.logout()
        res.redirect('/')
    })

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', isLoggedInAndActivated, function(req, res) {
            res.render('connect-local', { message: req.flash('loginMessage') })
        })
        app.post('/connect/local', isLoggedInAndActivated, passport.authenticate('local-signup', {
            successRedirect : '/main', // redirect to the secure main section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }))

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', isLoggedInAndActivated, passport.authorize('facebook', { scope : 'email' }))

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback', isLoggedInAndActivated,
            passport.authorize('facebook', {
                successRedirect : '/main',
                failureRedirect : '/'
            }))

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', isLoggedInAndActivated, passport.authorize('twitter', { scope : 'email' }))

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback', isLoggedInAndActivated,
            passport.authorize('twitter', {
                successRedirect : '/main',
                failureRedirect : '/'
            }))

    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', isLoggedInAndActivated, passport.authorize('google', { scope : ['profile', 'email'] }))

        // the callback after google has authorized the user
        app.get('/connect/google/callback', isLoggedInAndActivated,
            passport.authorize('google', {
                successRedirect : '/main',
                failureRedirect : '/'
            }))

        // =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedInAndActivated, function(req, res) {
        var user            = req.user
        user.local.email    = undefined
        user.local.password = undefined
        user.save(function(err) {
            res.redirect('/main')
        })
    })

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedInAndActivated, function(req, res) {
        var user            = req.user
        user.facebook.token = undefined
        user.save(function(err) {
            res.redirect('/main')
        })
    })

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedInAndActivated, function(req, res) {
        var user           = req.user
        user.twitter.token = undefined
        user.save(function(err) {
           res.redirect('/main')
        })
    })

    // google ---------------------------------
    app.get('/unlink/google', isLoggedInAndActivated, function(req, res) {
        var user          = req.user
        user.google.token = undefined
        user.save(function(err) {
           res.redirect('/main')
        })
    })

// =============================================================================
// PETITSEMPRUNTS CLIENT JS =============================================================
// =============================================================================

    app.get('/main.js', function(req, res) {
        fs.readFile("resources/js/main.js", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.write(data)
            res.end()
        })
    })


// =============================================================================
// BOOTSTRAP CSS JS =============================================================
// =============================================================================

    app.get('/bootstrap.min.css', function(req, res) {
        fs.readFile("resources/bootstrap/css/bootstrap.min.css", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/css'})
            res.write(data)
            res.end()
        })
    })

    app.get('/bootstrap-responsive.css', function(req, res) {
        fs.readFile("resources/bootstrap/css/bootstrap-responsive.css", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/css'})
            res.write(data)
            res.end()
        })
    })

    app.get('/bootstrap.min.js', function(req, res) {
        fs.readFile("resources/bootstrap/js/bootstrap.min.js", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.write(data)
            res.end()
        })
    })

// =============================================================================
// MOMENT PICKADAY JS =============================================================
// =============================================================================

    app.get('/moment.js', function(req, res) {
        fs.readFile("resources/js/libs/moment.js", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.write(data)
            res.end()
        })
    })

    app.get('/pikaday.js', function(req, res) {
        fs.readFile("resources/js/libs/pikaday/pikaday.js", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.write(data)
            res.end()
        })
    })

    app.get('/pikaday.css', function(req, res) {
        fs.readFile("resources/js/libs/pikaday/css/pikaday.css", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/css'})
            res.write(data)
            res.end()
        })
    })

}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next()

    // if they aren't redirect them to the home page
    res.redirect('/')
}

function isLoggedInAndActivated(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated() && req.user.isActivated())
    {
        if(req.user.local.email || req.user.facebook.token || req.user.twitter.token || req.user.google.token)
        return next()
    }

    // if they aren't redirect them to the home page
    res.redirect('/')
}