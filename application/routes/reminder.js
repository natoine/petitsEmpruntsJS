const mongo = require('mongodb')

// load up the user model
const User            = require('../models/user')
//load up the loan model
const Loan = require('../models/loan')
//load up the friendlist model
const FriendList = require('../models/friendlist')

const mailSender = require('../utils/mailSender')

const security = require('../utils/securityMiddleware')

const moment = require('moment')
moment().format()

// application/routes.js
module.exports = function(app, express) {

    // get an instance of the router for reminder routes
    const reminder = express.Router()

    //RENDER FORM TO REMIND A LOAN
    reminder.get('/remind/:loanid', security.isLoggedInAndActivated, function(req, res) {
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
                                        else
                                        {
                                            User.findOne({"local.email" : friend.friendmail} 
                                                , function(err, user) { 
                                                    if(err)
                                                    {
                                                        console.log("remindLoan error : " + err)
                                                    }
                                                    else
                                                    {
                                                        if(user)
                                                        {
                                                            friend.frienduserid = user
                                                            friend.friendusername = user.local.username
                                                            console.log("will add user to friend")
                                                            friend.save()
                                                        }
                                                    }
                                            })
                                        }
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
                                        else
                                        {
                                            User.findOne({"local.email" : friend.friendmail} 
                                                , function(err, user) { 
                                                    if(err)
                                                    {
                                                        console.log("remindLoan error : " + err)
                                                    }
                                                    else
                                                    {
                                                        if(user)
                                                        {
                                                            friend.frienduserid = user
                                                            friend.friendusername = user.local.username
                                                            console.log("will add user to friend")
                                                            friend.save()
                                                        }
                                                    }
                                            })
                                        }
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

	//POSTS THE REMINDER
    reminder.post("/newreminder/:loanid", security.isLoggedInAndActivated, function(req, res) {  
        mail = req.body.inputothermail
        msg = req.body.inputremindermsg
        if(!mailSender.validateMail(mail))
        {
            req.flash('messageMail' , "ce n'est pas un email valide")
            if(msg.length > 0) req.flash('mailcontent' , msg)
            else req.flash('messageContent' , "ce n'est pas un message valide")
            res.redirect(`/remind/${req.params.loanid}`)
        }
        else if(mail == req.user.local.email)
        {
			req.flash('messageMail' , "ce ne peut pas être votre propre mail")
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
                                        friend.save(function(err)
                                        {
                                            if (err) throw err
                                            else
                                            {
                                                User.findOne({"local.email" : friend.friendmail} 
                                                    , function(err, user) { 
                                                        if(err)
                                                        {
                                                            console.log("remindLoan error : " + err)
                                                        }
                                                        else
                                                        {
                                                            if(user)
                                                            {
                                                                friend.frienduserid = user
                                                                friend.friendusername = user.local.username
                                                                console.log("will add user to friend")
                                                                friend.save()
                                                            }
                                                        }
                                                })
                                            }
                                        })
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

    // apply the routes to our application
    app.use('/', reminder)

}