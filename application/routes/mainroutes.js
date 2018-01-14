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
                //user is the loaner
                if(loaner === user.local.username || loaner === user.local.email)
                {
                    if(!mailcontent.length > 0)
                        mailcontent = `Bonjour ${borrower}, ${user.local.username} (${user.local.email})`
                            + ` utilise petitsEmprunts pour vous rappeler de lui rendre`
                            + ` ${loan.what}, emprunté depuis le ${loan.when}`
                        
                    FriendList.findOne({'creator' : user, 'friendname' : borrower} , 
                        function(err, friend) {
                            if(err) throw err
                            else 
                            {
                                if(othermail.length > 0 
                                    && mailSender.validateMail(""+othermail) 
                                    && (friend.friendmail.length == null ) )
                                {
                                    friend.friendmail = othermail
                                    friend.save(function(err)
                                    {
                                        if (err) throw err
                                    })
                                }
                                else
                                {
                                    if(friend.friendmail != null && friend.friendmail.length > 0) othermail = friend.friendmail
                                }
                                customheaders = []
                                customnavs = [{name:"mes emprunts" , value:"<li><a href='/main'>mes emprunts</a></li>"}]
                                customscripts = []
                                res.render('pages/reminder' , {
                                    loanid : req.params.loanid,
                                    username : user.local.username,
                                    otherusername : borrower,
                                    othermail : othermail,
                                    mailcontent : mailcontent,
                                    messageMail : messageMail,
                                    messageContent : messageContent,
                                    isadmin : user.isSuperAdmin(),
                                    customheaders : customheaders,
                                    customscripts : customscripts,
                                    customnavs : customnavs
                                })
                            }
                        })

                }
                //user is the borrower
                else if(borrower === user.local.username || borrower === user.local.email)
                {
                    if(!mailcontent.length > 0)
                        mailcontent = `Bonjour ${loaner}, ${user.local.username}(${user.local.email})`
                            + ` utilise petitsEmprunts pour vous rappeler qu'il/elle a toujours votre`
                            + ` ${loan.what}, emprunté depuis le ${loan.when}`
                    
                    FriendList.findOne({'creator' : user, 'friendname' : loaner} , 
                        function(err, friend) {
                            if(err) throw err
                            else 
                            {
                                if(othermail.length > 0 
                                    && mailSender.validateMail(""+othermail) 
                                    && (friend.friendmail == null ) )
                                {
                                    friend.friendmail = othermail
                                    friend.save(function(err)
                                    {
                                        if (err) throw err
                                    })
                                }
                                else
                                {
                                    if(friend.friendmail != null && friend.friendmail.length > 0) othermail = friend.friendmail
                                }
                            }
                            customheaders = []
                            customscripts = []
                            customnavs = [{name:"mes emprunts" , value:"<li><a href='/main'>mes emprunts</a></li>"}]
                            res.render('pages/reminder' , {
                                loanid : req.params.loanid,
                                username : user.local.username,
                                otherusername : loaner,
                                othermail : othermail,
                                mailcontent : mailcontent,
                                messageMail : messageMail,
                                messageContent : messageContent,
                                isadmin : user.isSuperAdmin(),
                                customheaders : customheaders,
                                customscripts : customscripts,
                                customnavs : customnavs
                            })
                        })
                }
                else 
                {
                    req.flash('messagedanger', 'cet emprunt ne vous concerne pas')
                    res.redirect('/main')
                }
            }
            else 
            {
                req.flash('messagedanger', "cet emprunt n'existe pas")                   
                res.redirect('/main')
            }
        })
    })

    mainRoutes.post("/newreminder/:loanid", security.isLoggedInAndActivated, function(req, res) {  
        mail = req.body.inputothermail
        msg = req.body.inputremindermsg
        if(!mailSender.validateMail(mail))
        {
            req.flash('messageMail' , "ce n'est pas un email valide")
            if(msg.length > 0) req.flash('mailcontent' , msg)
            else req.flash('messageContent' , "ce n'est pas un message valide")
            res.redirect(`/remind/${req.params.loanid}`)
        }
        else
        {
            if(!msg.length > 0)
            {
                req.flash('messageContent' , "ce n'est pas un message valide")
                req.flash('othermail' , mail)
                res.redirect(`/remind/${req.params.loanid}`)
            }
            else
            {
                
                //send email and update loan to have a date of last reminder
                subject = `petitsEmprunts : rappel d'emprunt de ${req.user.local.username}`
                html = msg + `<br> <a href="${mailSender.urlService}">Découvrez PetitsEmprunts</a>`
                mailSender.sendMail(mail, subject, html, function(error, resp){
                    if(error)
                    {
                        console.log("rappel d'emprunt envoi mail - ERROR" + error)
                        req.flash('messagedanger', "impossible d'envoyer un message. Essayez plus tard.")
                        res.redirect('/main')
                    } 
                    else
                    {
                        req.flash('messagesuccess', 'message de relance envoyé')
                        //update loan to add date of last reminder
                        oId = new mongo.ObjectID(req.params.loanid)
                        Loan.findOne({"_id" : oId}, function(err, loan) {
                            if(err) throw err
                            if(loan)
                            {
                                moment.locale('fr')
                                loan.lastreminder = moment()
                                loan.save()
                                //find if user is loaner or borrower and update FriendList data
                                var dbrequest 
                                if(loan.loaner == req.user.local.username) 
                                    dbrequest = {creator : req.user, friendname : loan.borrower}
                                else dbrequest = {creator : req.user, friendname : loan.loaner}
                                FriendList.findOne(dbrequest, function(err, friend) {
                                    if(err) throw err
                                    else
                                    {
                                        friend.friendmail = mail
                                        friend.save()
                                    }   
                                })
                            }
                        })
                        res.redirect('/main')
                    }
                })
            }
        }
    })

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // TODO should be able to see pages of other users maybe ?
    mainRoutes.get('/user/:username', security.rememberme, security.isLoggedInAndActivated, function(req, res) {
        if(req.user.local.username !== req.params.username)
        {
            res.redirect(`/user/${req.user.local.username}`)
        }
        customheaders = []
        customscripts = []
        customnavs = [{name:"mes emprunts" , value:"<li><a href='/main'>mes emprunts</a></li>"}]
        res.render('pages/profile', {
            user : req.user, // get the user out of session and pass to template
            messagesuccess : req.flash('messagesuccess'),
            messagedanger : req.flash('messagedanger'),
            username : req.user.local.username,
            isadmin : user.isSuperAdmin(),
            customheaders : customheaders,
            customscripts : customscripts,
            customnavs : customnavs
        })
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
                        res.redirect(`/user/${newusername}`)
                    }
                }
            })

        }
    })

    // apply the routes to our application
    app.use('/', mainRoutes)

}