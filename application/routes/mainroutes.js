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
                                        friendList : friendList,
                                        reqfriend : reqfriend,
                                        isadmin : user.isSuperAdmin()
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
            newLoan.what = what
            newLoan.when = when
            switch(action) 
            {
                case 'iBorrow':
                    newLoan.borrower = user.local.email
                    newLoan.loaner = whom
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

    //DELETE a LOAN
    //cause HTML cannot call DELETE and cause fetch will not have the user in the request
    mainRoutes.post("/deleteloan/:loanid", security.isLoggedInAndActivated, function(req, res) {
        oId = new mongo.ObjectID(req.params.loanid)
        Loan.findOne({"_id" : oId}, function(err, loan) {
            if(err) throw err
            if(loan) 
            {
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
            else
            {
                console.log("this loan doesn't exist")
                res.redirect('/main')
            } 
        })
    })

    //REMIND A LOAN
    mainRoutes.get('/remind/:loanid', security.isLoggedInAndActivated, function(req, res) {
        oId = new mongo.ObjectID(req.params.loanid)
        Loan.findOne({"_id" : oId}, function(err, loan) {
            if(err) throw err
            if(loan)
            {
                messageMail = req.flash("messageMail") || "" 
                messageContent = req.flash("messageContent") || "" 
                mailcontent = req.flash('mailcontent') || ""

                loaner = loan.loaner
                borrower = loan.borrower
                user = req.user
                othermail = req.flash('othermail') || ""
                if(loaner === user.local.username || loaner === user.local.email)
                {
                    if(!mailcontent.length > 0)
                        mailcontent = "Bonjour " + borrower + ", " + user.local.username 
                            + " (" + user.local.email + ") utilise petitsEmprunts"
                            + " pour vous rappeler de lui rendre " + loan.what + ", emprunté depuis le " + loan.when  
                    if((!othermail.length > 0) && mailSender.validateMail(borrower)) othermail = borrower
                    console.log("you re the loaner")
                    res.render('reminder' , {
                        loanid : req.params.loanid,
                        username : user.local.username,
                        otherusername : borrower,
                        othermail : othermail,
                        mailcontent : mailcontent,
                        messageMail : messageMail,
                        messageContent : messageContent
                    })
                }
                else if(borrower === user.local.username || borrower === user.local.email)
                {
                    if(!mailcontent.length > 0)
                        mailcontent = "Bonjour " + loaner + ", " + user.local.username 
                            + " (" + user.local.email + ") utilise petitsEmprunts"
                            + " pour vous rappeler qu'il/elle a toujours votre " + loan.what + ", emprunté depuis le " + loan.when
                    if((!othermail.length > 0) && mailSender.validateMail(loaner)) othermail = loaner
                    console.log("you re the borrower")
                    res.render('reminder' , {
                        loanid : req.params.loanid,
                        username : user.local.username,
                        otherusername : loaner,
                        othermail : othermail,
                        mailcontent : mailcontent,
                        messageMail : messageMail,
                        messageContent : messageContent
                    })
                }
                else 
                {
                    console.log("this loan doesn't concern you")
                    res.redirect('/main')
                }
            }
            else 
            {
                console.log("this loan doesn't exist")
                res.redirect('/main')
            }
        })
    })

    mainRoutes.post("/newreminder/:loanid", security.isLoggedInAndActivated, function(req, res) {  
        mail = req.body.inputothermail
        msg = req.body.inputremindermsg
        if(!mailSender.validateMail(mail))
        {
            req.flash('messageMail' , 'not a valid email')
            if(msg.length > 0) req.flash('mailcontent' , msg)
            else req.flash('messageContent' , 'not a valid message' )
            res.redirect("/remind/" + req.params.loanid)
        }
        else
        {
            if(!msg.length > 0)
            {
                req.flash('messageContent' , 'not a valid message' )
                req.flash('othermail' , mail)
                res.redirect("/remind/" + req.params.loanid)
            }
            else
            {
                //send email and update loan to have a date of last reminder
                console.log("might send email")
                subject = "petitsEmprunts : rappel d'emprunt de " + req.user.local.username
                html = msg + "<br> <a href=\""+ mailSender.urlService + "\">Découvrez PetitsEmprunts</a>"
                mailSender.sendMail(mail, subject, html, function(error, resp){
                    if(error) console.log(error)
                    else
                    {
                        //update loan to add date of last reminder
                        oId = new mongo.ObjectID(req.params.loanid)
                        Loan.findOne({"_id" : oId}, function(err, loan) {
                            if(err) throw err
                            if(loan)
                            {
                                moment.locale('fr')
                                loan.lastreminder = moment()
                                loan.save()
                            }
                        })
                    }
                })
                res.redirect('/main')
            }
        }
    })

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // TODO should see some page of other users maybe ?
    mainRoutes.get('/user/:username', security.isLoggedInAndActivated, function(req, res) {
        if(req.user.local.username !== req.params.username)
        {
            res.redirect('/user/' + req.user.local.username)
        }
        res.render('profile', {
            user : req.user, // get the user out of session and pass to template
            message : req.flash('messageusername'),
            messageDeleteUser : req.flash('messageDeleteUser')
        })
    })
    
    //to delete Account
    mainRoutes.post('/deleteaccount', security.isLoggedInAndActivated, function(req, res) {
        // if the password is wrong
        if (!req.user.validPassword(req.body.password))
        {
            req.flash("messageDeleteUser","Wrong Password")
            res.redirect('/user/' + req.user.local.username)
        }
        else
        {
            req.user.remove('' , function(err, user) {
                if(err) throw err
                else
                {
                    console.log("delete user : " + req.user.local.username)
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