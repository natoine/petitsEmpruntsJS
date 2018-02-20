// load up the user model
const User            = require('../models/user')
//load up the loan model
const Loan = require('../models/loan')
//load up the friendlist model
const FriendList = require('../models/friendlist')

const moment = require('moment')
moment().format()

const mongo = require('mongodb')

const security = require('../utils/securityMiddleware')

const mailSender = require('../utils/mailSender')

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const mainRoutes = express.Router()

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    mainRoutes.get('/', security.rememberme, function(req, res) {
        if(req.isAuthenticated() && req.user.isActivated()) res.redirect('/main')
        else 
        {
            customheaders = []
            customscripts = []
                res.render('pages/index', 
            {   messagesuccess: req.flash('messagesuccess'),
                messagedanger: req.flash('messagedanger'),
                messagelocalauthsuccess : req.flash('messagelocalauthsuccess'),
                messagelocalauthdanger : req.flash('messagelocalauthdanger'),
                googleSignupMessage: req.flash('googleSignupMessage'),
                fbSignupMessage: req.flash('fbSignupMessage'),
                customheaders : customheaders,
                customscripts : customscripts })// load the index.ejs file
            }
    })

    // =====================================
    // MAIN SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    mainRoutes.get('/main', security.rememberme, security.isLoggedInAndActivated, function(req, res) {
        
        //get the ?friend= query tagid from request
        reqfriend = req.query.friend || "none"
        
        what = req.flash('what')
        whom = req.flash('whom')
        when = req.flash('when')
        action = req.flash('action')
        if(action.length === 0) action = "iBorrow" 

        user = req.user
        borrowsQuery = { 'borrower' : user.local.email }
        loansQuery = { 'loaner' : user.local.email }
        if(reqfriend !== "none")
        {
            borrowsQuery.loaner = reqfriend
            loansQuery.borrower = reqfriend
        }
        FriendList.find( {'creator' : user} , function(err, friendListDB) {
            if(err) throw err
            else 
            {
                friendList = new Set()
                friendListDB.map(friend => {
                    if(!friendList.has(friend.friendname)) friendList.add(friend.friendname)
                })
                //=================
                // we should not send borrows and loans in this request
                // but make an API with token and fetch them from browser
                var myborrows
                Loan.find( borrowsQuery, function(err, loans) {
                    if(err) throw err
                    else 
                    {
                        myborrows = loans
                        myborrows.map(loan => {
                            if(!friendList.has(loan.loaner)) 
                                {
                                    friendList.add(loan.loaner)
                                    var updateFL = new FriendList()
                                    updateFL.creator = user
                                    updateFL.friendname = loan.loaner
                                    if(mailSender.validateMail(loan.loaner)) updateFL.friendmail = loan.loaner
                                    updateFL.save(function(err)
                                    {
                                        if (err) throw err
                                    })
                                }
                        })
                        var myloans
                        Loan.find(loansQuery, function(err, loans) {
                            if(err) throw err
                            else 
                            {
                                myloans = loans
                                myloans.map(loan => {
                                    if(!friendList.has(loan.borrower)) 
                                    {
                                        friendList.add(loan.borrower)
                                        var updateFL = new FriendList()
                                        updateFL.creator = user
                                        updateFL.friendname = loan.borrower
                                        if(mailSender.validateMail(loan.borrower)) updateFL.friendmail = loan.borrower
                                        updateFL.save(function(err)
                                        {
                                            if (err) throw err
                                        })
                                    }
                                })

                                customheaders = [{name : "pickaday", value:"<link rel='stylesheet' href='/pikaday.css'>"}]
                                customscripts = []
                                customnavs = []
                                res.render('pages/main', {
                                    username : user.local.username , 
                                    messagesuccess : req.flash('messagesuccess') , 
                                    messagedanger : req.flash('messagedanger') ,
                                    messagedangerwhat: req.flash('messagedangerwhat') , 
                                    messagedangerwhom: req.flash('messagedangerwhom') ,
                                    messagedangerwhen: req.flash('messagedangerwhen') ,
                                    what : what ,
                                    whom : whom ,
                                    when : when ,
                                    action : action ,
                                    myborrows : myborrows ,
                                    myloans : myloans ,
                                    friendList : friendList,
                                    reqfriend : reqfriend,
                                    isadmin : user.isSuperAdmin(),
                                    customheaders : customheaders,
                                    customscripts : customscripts,
                                    customnavs : customnavs
                                })
                            }
                        })
                    }
                })
            }
        })
    })

    //creates a new loan !!! 
    mainRoutes.post('/newloan', security.isLoggedInAndActivated, function(req, res) {
        what = req.body.what.trim()
        whom = req.body.whom.trim()
        when = req.body.when.trim()
        action = req.body.action
        user = req.user
        cancreateloan = true
        messagesuccessmain = ""
        if(!what) 
        {
                cancreateloan = false
                req.flash('messagedangerwhat', 'Précisez ce qui est emprunté')
        }
        if(!whom) 
        {
                cancreateloan = false
                req.flash('messagedangerwhom', "Précisez avec qui se passe l'emprunt")
        }
        if(!when) 
        {
                cancreateloan = false
                req.flash('messagedangerwhen', "Précisez quand l'emprunt a lieu")
        }
        if(cancreateloan)
        {
            var newLoan = new Loan()
            newLoan.creator = user
            newLoan.what = what
            newLoan.when = when
            switch(action) 
            {
                case 'iBorrow':
                    newLoan.borrower = user.local.email
                    newLoan.loaner = whom
                    newLoan.save(function(err){
                        if (err) 
                            {
                                throw err
                                req.flash('messagedanger', 'unable to create borrow. Try later')
                                req.flash('action', action)
                                res.redirect('/main')
                            }
                        else 
                        {   
                            req.flash('messagesuccess', 'nouvel emprunt créé')
                            req.flash('action', action)
                            res.redirect('/main')
                        }
                    })
                    break ;
                case 'iLoan' :
                    newLoan.loaner = user.local.email
                    newLoan.borrower = whom
                    newLoan.save(function(err){
                        if (err) 
                            {
                                throw err
                                req.flash('messagedanger', 'unable to create loan. Try later')
                                req.flash('action', action)
                                res.redirect('/main')
                            }
                        else 
                        {
                            req.flash('messagesuccess', 'nouveau prêt créé')
                            req.flash('action', action)
                            res.redirect('/main')
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
            res.redirect('/main')
        }
    })

    //DELETE a LOAN
    //cause HTML cannot call DELETE and cause fetch will not have the user in the request
    mainRoutes.post("/deleteloan/:loanid", security.isLoggedInAndActivated, function(req, res) {
        oId = new mongo.ObjectID(req.params.loanid)
        Loan.findOne({"_id" : oId}, function(err, loan) {
            if(err) 
            {
                req.flash('messagedanger', "pas possible de supprimer l'emprunt. Cet emprunt n'existe déjà plus.")
                //throw err
                res.redirect('/main')
            }
            if(loan) 
            {
                if(loan.loaner === req.user.local.username || loan.loaner === req.user.local.email
                   || loan.borrower === req.user.local.username || loan.borrower === req.user.local.email)
                {
                    Loan.remove({"_id" : oId}, function(err, loan) {
                        if(err) 
                            {
                                req.flash('messagedanger', "pas possible de supprimer l'emprunt. Essayez plus tard.")
                                //throw err
                                res.redirect('/main')
                            }
                            else
                            {
                                req.flash('messagesuccess', 'emprunt supprimé')
                                res.redirect('/main')
                            }

                    })
                }
                else
                {
                    req.flash('messagedanger', "pas authorisé à supprimer l'emprunt.")
                    res.redirect('/main')
                }
            }
            else
            {
                req.flash('messagedanger', "cet emprunt n'existe pas.")
                res.redirect('/main')
            } 
        })
    })

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    mainRoutes.get('/user/:username', security.rememberme, security.isLoggedInAndActivated, function(req, res) {
        //show my own user page
        if(req.user.local.username == req.params.username)
        {
            customheaders = []
            customscripts = []
            customnavs = [{name:"mes emprunts" , value:"<li><a href='/main'>mes emprunts</a></li>"}]
            res.render('pages/myprofile', {
                user : req.user, // get the user out of session and pass to template
                messagesuccess : req.flash('messagesuccess'),
                messagedanger : req.flash('messagedanger'),
                username : req.user.local.username,
                isadmin : user.isSuperAdmin(),
                customheaders : customheaders,
                customscripts : customscripts,
                customnavs : customnavs
            })
        }
        //show another user page
        else
        {
            User.findOne({"local.username" : req.params.username}, function(err, user) {
                if(err) throw err
                else 
                {
                    if(user)
                    {
                        customheaders = []
                        customscripts = []
                        customnavs = [{name:"mes emprunts" , value:"<li><a href='/main'>mes emprunts</a></li>"}]
                        res.render('pages/profile', {
                            user : req.user,
                            username : req.user.local.username,
                            messagesuccess : req.flash('messagesuccess'),
                            messagedanger : req.flash('messagedanger'),
                            friendname : user.local.username,
                            isadmin : req.user.isSuperAdmin(),
                            customheaders : customheaders,
                            customscripts : customscripts,
                            customnavs : customnavs
                        })
                    }
                    else
                    {
                        req.flash('messagedanger', 'no user with this username : ' + req.params.username)
                        res.redirect('/user/' + req.user.local.username)
                    }
                }
            })   
        }
    })
    
    //to delete Account
    mainRoutes.post('/deleteaccount', security.isLoggedInAndActivated, function(req, res) {
        // if the password is wrong
        if (!req.user.validPassword(req.body.password))
        {
            req.flash("messagedanger","Ce n'est pas le bon mot de passe")
            res.redirect(`/user/${req.user.local.username}`)
        }
        else
        {
            req.user.remove('' , function(err, user) {
                if(err) 
                {
                    console.log("unable to suppress user : " + user.local.username + "ERROR : " + err)
                    req.flash("messagedanger","unable to suppress user. Try later.")
                    res.redirect('/user/' + req.user.local.username)
                }
                else
                {
                    req.flash("messagesuccess","Compte supprimé")
                    res.redirect('/')
                }
            })
        }
    })

    //to change username
    mainRoutes.post('/changeusername', security.isLoggedInAndActivated, function(req, res) {
        newusername = req.body.username.trim()
        if( newusername == "" || req.user.local.username == newusername ) 
        {
                res.redirect(`/user/${req.user.local.username}`)
        }
        else 
        {
            User.findOne({"local.username" : newusername}, function(err, user) {
                if(err) throw err
                else 
                {
                    if(user)
                    {
                        req.flash("messagedanger", "ce nom d'utilisateur est déjà utilisé")
                        res.redirect(`/user/${req.user.local.username}`)   
                    }
                    else
                    {
                        req.flash("messagesuccess", "nom d'utilisateur changé")
                        req.user.local.username = newusername
                        req.user.save()
                        //must now also change friendusername in all friendlists
                        //TODO
                        res.redirect(`/user/${newusername}`)
                    }
                }
            })

        }
    })

    // apply the routes to our application
    app.use('/', mainRoutes)

}