// load up the user model
const User            = require('../models/user')

const security = require('../utils/securityMiddleware')

module.exports = function(app, express, passport) {

	// get an instance of the router for auth routes
	const authRoutes = express.Router()

	// =====================================
    // LOGIN ===============================
    // =====================================   
    // process the login form
    authRoutes.post('/login', passport.authenticate('local-login', {
        failureRedirect : '/', // redirect back to the index page if there is an error
        failureFlash : true // allow flash messages
    }),
    function(req, res, next){
        if(req.body.rememberme == "yes") 
        {
            user = req.user
            //generates rememberme token
            tokenrem = user.generatesRememberMeToken()
            user.local.remembermetoken = tokenrem
            user.save(function(err) 
            {
                if (err) 
                {
                    console.log("unable to save rememberme token - error : " + err)
                    res.redirect('/main')
                }
                else 
                {
                    //stores rememberme token in cookie with user email
                    res.clearCookie('useremail')
                    res.clearCookie('remembermetoken')
                    res.cookie("useremail", user.local.email)
                    res.cookie("remembermetoken", user.local.remembermetoken, {maxAge: 604800000})//7 days
                    res.redirect('/main')
                }
            })
        }
        else 
        {
            res.clearCookie('useremail')
            res.clearCookie('remembermetoken')
            res.redirect('/main')
        }
    })

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    authRoutes.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('pages/signup', 
            {   message: req.flash('signupMessage'),
                messageSuccess: req.flash('signupMessageSuccess') })
    })

    // process the signup form
    authRoutes.post('/signup', passport.authenticate('local-signup', {
        //successRedirect : '/signup', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    })
    , 
    function(req, res) {
        if(req) req.logout()
        res.redirect('/signup')
    })

    // =====================================
    // ACTIVATE ACCOUNT ==============================
    // =====================================
    authRoutes.get('/activateaccount', function(req, res) {
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
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    authRoutes.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }))

    // handle the callback after facebook has authenticated the user
    authRoutes.get('/auth/facebook/callback',
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
    authRoutes.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }))

    // the callback after google has authenticated the user
    authRoutes.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/main',
                    failureRedirect : '/'
            }))


    // =====================================
    // LOGOUT ==============================
    // =====================================
    authRoutes.get('/logout', function(req, res) { 
        res.clearCookie('remembermetoken')
        res.clearCookie('useremail')
        req.logout()
        res.redirect('/')
    })

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        authRoutes.get('/connect/local', security.isLoggedInAndActivated, function(req, res) {
            res.render('connect-local', { message: req.flash('loginMessage') })
        })
        authRoutes.post('/connect/local', security.isLoggedInAndActivated, passport.authenticate('local-signup', {
            successRedirect : '/main', // redirect to the secure main section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }))

    // facebook -------------------------------

        // send to facebook to do the authentication
        authRoutes.get('/connect/facebook', security.isLoggedInAndActivated, passport.authorize('facebook', { scope : 'email' }))

        // handle the callback after facebook has authorized the user
        authRoutes.get('/connect/facebook/callback', security.isLoggedInAndActivated,
            passport.authorize('facebook', {
                successRedirect : '/main',
                failureRedirect : '/'
            }))

    // twitter --------------------------------

        // send to twitter to do the authentication
        authRoutes.get('/connect/twitter', security.isLoggedInAndActivated, passport.authorize('twitter', { scope : 'email' }))

        // handle the callback after twitter has authorized the user
        authRoutes.get('/connect/twitter/callback', security.isLoggedInAndActivated,
            passport.authorize('twitter', {
                successRedirect : '/main',
                failureRedirect : '/'
            }))

    // google ---------------------------------

        // send to google to do the authentication
        authRoutes.get('/connect/google', security.isLoggedInAndActivated, passport.authorize('google', { scope : ['profile', 'email'] }))

        // the callback after google has authorized the user
        authRoutes.get('/connect/google/callback', security.isLoggedInAndActivated,
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
    authRoutes.get('/unlink/local', security.isLoggedInAndActivated, function(req, res) {
        var user            = req.user
        user.local.email    = undefined
        user.local.password = undefined
        user.save(function(err) {
            res.redirect('/main')
        })
    })

    // facebook -------------------------------
    authRoutes.get('/unlink/facebook', security.isLoggedInAndActivated, function(req, res) {
        var user            = req.user
        user.facebook.token = undefined
        user.save(function(err) {
            res.redirect('/main')
        })
    })

    // twitter --------------------------------
    authRoutes.get('/unlink/twitter', security.isLoggedInAndActivated, function(req, res) {
        var user           = req.user
        user.twitter.token = undefined
        user.save(function(err) {
           res.redirect('/main')
        })
    })

    // google ---------------------------------
    authRoutes.get('/unlink/google', security.isLoggedInAndActivated, function(req, res) {
        var user          = req.user
        user.google.token = undefined
        user.save(function(err) {
           res.redirect('/main')
        })
    })

	// apply the routes to our application with the prefix /rsc
	app.use('/', authRoutes)

}