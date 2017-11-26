// load up the user model
const User            = require('../models/user')
//load up the loan model
const Loan = require('../models/loan')

const mongo = require('mongodb')

const security = require('../utils/securityMiddleware')

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
    app.get('/main', security.isLoggedInAndActivated, function(req, res) {
        
        //get the ?friend= query tagid from request
        friend = req.query.friend || "none"
        
        what = req.flash('what')
        whom = req.flash('whom')
        when = req.flash('when')
        action = req.flash('action')
        if(action.length === 0) action = "iBorrow" 

        user = req.user
        borrowsQuery = { 'borrower' : user.local.email }
        loansQuery = { 'loaner' : user.local.email }
        if(friend !== "none")
        {
            borrowsQuery.loaner = friend
            loansQuery.borrower = friend
        }

        friendList = new Set()
        //TODO
        //=================
        // we should not send borrows and loans in this request
        // but make an API with token and fetch them from browser
        var myborrows
        Loan.find( borrowsQuery, function(err, loans) {
            if(err) throw err
            else 
                {
                    myborrows = loans
                    myborrows.map(loan => {if(!friendList.has(loan.loaner)) friendList.add(loan.loaner)})
                    var myloans
                    Loan.find(loansQuery, function(err, loans) {
                        if(err) throw err
                        else 
                            {
                                myloans = loans
                                myloans.map(loan => {if(!friendList.has(loan.borrower)) friendList.add(loan.borrower)})
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
                                        myloans : myloans ,
                                        friendList : friendList
                                })
                            }
                    })
                }
        })
        
    })

    //creates a new loan !!! 
    app.post('/newloan', security.isLoggedInAndActivated, function(req, res) {
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
                           console.log("nouvel emprunt")
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
                            console.log("nouveau prêt")
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
        }
        req.flash('action', action)
        res.redirect('/main')
    })

    //cause HTML cannot call DELETE and cause fetch will not have the user in the request
    app.post("/deleteloan/:loanid", security.isLoggedInAndActivated, function(req, res) {
        oId = new mongo.ObjectID(req.params.loanid)
        Loan.findOne({"_id" : oId}, function(err, loan) {
            if(err) throw err
            else {
                if(loan.loaner === req.user.local.username || loan.borrower === req.user.local.username)
                {
                    Loan.remove({"_id" : oId}, function(err, loan) {
                        if(err) 
                            {
                                console.log("unable to delete loan : " + req.params.loanid)
                                throw err
                            }
                            else
                            {
                                console.log("delete loan : " + req.params.loanid)
                                res.redirect('/main')
                            }

                    })
                }
                else
                {
                    console.log("not authorized to suppress this loan")
                    res.redirect('/main')
                }
            }
        })
    })

// =====================================
    // PROFILE SECTION =====================
    // =====================================
    // TODO should test is username is req.user cause we will want to see page of other users
    app.get('/user/:username', security.isLoggedInAndActivated, function(req, res) {
        res.render('profile', {
            user : req.user, // get the user out of session and pass to template
            message : req.flash('messageusername')
        })
    })
    
    //to change username
    app.post('/changeusername', security.isLoggedInAndActivated, function(req, res) {
        newusername = req.body.username.trim()
        if( newusername == "" || req.user.local.username == newusername ) 
        {
                res.redirect('/user/' + req.user.local.username)
        }
        else 
        {
            User.findOne({"local.username" : newusername}, function(err, user) {
                if(err) throw err
                else 
                {
                    if(user)
                    {
                        req.flash("messageusername", "this username is already in use")
                        res.redirect('/user/' + req.user.local.username)   
                    }
                    else
                    {
                        req.user.local.username = newusername
                        req.user.save()
                        res.redirect('/user/' + newusername)
                    }
                }
            })

        }
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
        app.get('/connect/local', security.isLoggedInAndActivated, function(req, res) {
            res.render('connect-local', { message: req.flash('loginMessage') })
        })
        app.post('/connect/local', security.isLoggedInAndActivated, passport.authenticate('local-signup', {
            successRedirect : '/main', // redirect to the secure main section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }))

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', security.isLoggedInAndActivated, passport.authorize('facebook', { scope : 'email' }))

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback', security.isLoggedInAndActivated,
            passport.authorize('facebook', {
                successRedirect : '/main',
                failureRedirect : '/'
            }))

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', security.isLoggedInAndActivated, passport.authorize('twitter', { scope : 'email' }))

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback', security.isLoggedInAndActivated,
            passport.authorize('twitter', {
                successRedirect : '/main',
                failureRedirect : '/'
            }))

    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', security.isLoggedInAndActivated, passport.authorize('google', { scope : ['profile', 'email'] }))

        // the callback after google has authorized the user
        app.get('/connect/google/callback', security.isLoggedInAndActivated,
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
    app.get('/unlink/local', security.isLoggedInAndActivated, function(req, res) {
        var user            = req.user
        user.local.email    = undefined
        user.local.password = undefined
        user.save(function(err) {
            res.redirect('/main')
        })
    })

    // facebook -------------------------------
    app.get('/unlink/facebook', security.isLoggedInAndActivated, function(req, res) {
        var user            = req.user
        user.facebook.token = undefined
        user.save(function(err) {
            res.redirect('/main')
        })
    })

    // twitter --------------------------------
    app.get('/unlink/twitter', security.isLoggedInAndActivated, function(req, res) {
        var user           = req.user
        user.twitter.token = undefined
        user.save(function(err) {
           res.redirect('/main')
        })
    })

    // google ---------------------------------
    app.get('/unlink/google', security.isLoggedInAndActivated, function(req, res) {
        var user          = req.user
        user.google.token = undefined
        user.save(function(err) {
           res.redirect('/main')
        })
    })

}