// load up the user model
const User            = require('../models/user')
//load up the loan model
const Loan = require('../models/loan')

const mongo = require('mongodb')

const security = require('../utils/securityMiddleware')

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for main routes
    const mainRoutes = express.Router()

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    mainRoutes.get('/', function(req, res) {
        req.logout()
        res.render('index')// load the index.ejs file
    })

    // =====================================
    // MAIN SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    mainRoutes.get('/main', security.isLoggedInAndActivated, function(req, res) {
        
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
    mainRoutes.post('/newloan', security.isLoggedInAndActivated, function(req, res) {
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
            newLoan.creator = user
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
    mainRoutes.post("/deleteloan/:loanid", security.isLoggedInAndActivated, function(req, res) {
        oId = new mongo.ObjectID(req.params.loanid)
        Loan.findOne({"_id" : oId}, function(err, loan) {
            if(err) throw err
            else {
                if(loan.loaner === req.user.local.username || loan.loaner === req.user.local.email
                   || loan.borrower === req.user.local.username || loan.borrower === req.user.local.email)
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
    mainRoutes.get('/user/:username', security.isLoggedInAndActivated, function(req, res) {
        res.render('profile', {
            user : req.user, // get the user out of session and pass to template
            message : req.flash('messageusername')
        })
    })
    
    //to change username
    mainRoutes.post('/changeusername', security.isLoggedInAndActivated, function(req, res) {
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

    // apply the routes to our application
    app.use('/', mainRoutes)

}