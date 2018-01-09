const security = require('../utils/securityMiddleware')
// load up the user model
const User            = require('../models/user')
//load up the loan model
const Loan = require('../models/loan')

const mongo = require('mongodb')

module.exports = function(app, express) {

    // get an instance of the router for main routes
    const adminRoutes = express.Router()

    adminRoutes.get('/users', security.isSuperAdmin, function(req, res) {
    	User.find( {} ,
    		{
	    		"local.username" : true,
	    		"local.email" : true,
	    		"local.mailvalidated" : true,
	    		"facebook.email" : true,
	    		"facebook.name" : true,
	    		"google.email" : true,
	    		"google.name" : true
    		},
    		function(err, users) {
    			if(err) 
          {
            console.log("admin ERROR : " + err)
            //throw err
          }
          else 
          {
            customheaders = []
            customscripts = []
            customnavs = [{name:"utilisateurs", value:"<li><a href='/admin/users'>utilisateurs</a></li>"}, {name:"loans", value:"<li><a href='/admin/loans'>emprunts</a></li>"}]
            res.render('adminpages/users' , 
              {
                username : req.user.local.username, 
                users : users,
                messagesuccessadmin : req.flash("messagesuccessadmin"),
                messagedangeradmin : req.flash("messagedangeradmin"),
                isadmin : req.user.isSuperAdmin(),
                customheaders : customheaders,
                customscripts : customscripts,
                customnavs : customnavs
              })
          }
    		}
    	)
    })
    
    adminRoutes.get('/loans', security.isSuperAdmin, function(req, res) {
    	Loan.find( {} , {} , function(err, loans) {
    			if(err)
          {
            console.log("admin ERROR : " + err)
            //throw err
          }
          else 
          {
            customheaders = []
            customscripts = []
            customnavs = [{name:"utilisateurs", value:"<li><a href='/admin/users'>utilisateurs</a></li>"}, {name:"loans", value:"<li><a href='/admin/loans'>emprunts</a></li>"}]
            res.render('adminpages/loans' , 
              {
                username : req.user.local.username, 
                loans : loans,
                messagesuccessadmin : req.flash("messagesuccessadmin"),
                messagedangeradmin : req.flash("messagedangeradmin"),
                isadmin : req.user.isSuperAdmin(),
                customheaders : customheaders,
                customscripts : customscripts,
                customnavs : customnavs
              })
          }
    		})
    })

    adminRoutes.get('/loans/:userid', security.isSuperAdmin, function(req, res) {
      oId = new mongo.ObjectID(req.params.userid)
      User.findOne({"_id" : oId}, function(err, user) {
            if(err)
            {
              console.log("admin loans per user - ERROR : " + err)
              redirect('/admin/loans')
              //throw err
            } 
            else 
            {
              var hisborrows 
              Loan.find( { 'borrower' : user.local.email }, function(err, loans) {
                if(err) 
                {
                  console.log("admin loans per user - ERROR2 : " + err)
                  redirect('/admin/loans')
                  //throw err
                } 
                else 
                {
                  hisborrows = loans
                  var hisloans
                  Loan.find( { 'loaner' : user.local.email }, function(err, loans) {
                    if(err) 
                    {
                      console.log("admin loans per user - ERROR3 : " + err)
                      redirect('/admin/loans')
                      //throw err
                    } 
                    else 
                    {
                      hisloans = loans
                      customheaders = []
                      customscripts = []
                      customnavs = [{name:"utilisateurs", value:"<li><a href='/admin/users'>utilisateurs</a></li>"}, {name:"loans", value:"<li><a href='/admin/loans'>emprunts</a></li>"}]
                      res.render('adminpages/userloans' , 
                        { username : req.user.local.username, 
                          borrows : hisborrows , 
                          loans : hisloans , 
                          user: user, 
                          messagesuccessadmin : req.flash("messagesuccessadmin"),
                          messagedangeradmin : req.flash("messagedangeradmin"),
                          isadmin : req.user.isSuperAdmin(),
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

    //DELETE a LOAN
    //cause HTML cannot call DELETE and cause fetch will not have the user in the request
    adminRoutes.post("/deleteloan/:loanid", security.isSuperAdmin, function(req, res) {
        oId = new mongo.ObjectID(req.params.loanid)
        username = req.body.username
        Loan.findOne({"_id" : oId}, function(err, loan) {
            if(err) 
            {
              console.log('admin deleteloan ERROR : ' + err)
              res.redirect('/admin/loans/' + user._id)
            }
            if(loan) 
            {
                Loan.remove({"_id" : oId}, function(err, loan) {
                  if(err) 
                  {
                      req.flash("messagedangeradmin","an error occured, unable to delete loan")
                      console.log("admin deleteloan ERROR2 : " + err)
                      res.redirect('/admin/loans/' + user._id)
                  }
                  else
                  {
                    //verify user still exists
                    User.findOne({"local.username" : username}, function(err, user) {
                      if(err) 
                      {
                        req.flash("messagedangermain","an error occured, during deletion of the loan")
                        console.log("admin deleteloan ERROR3 : " + err)
                        res.redirect('/main')
                      }
                      else
                      {
                        req.flash("messagesuccessadmin", "loan deleted")
                        res.redirect('/admin/loans/' + user._id)
                      }
                    })
                  }
                })
            }
        })
    })

    adminRoutes.post('/activateuser/:userid', security.isSuperAdmin, function(req, res) {
      oId = new mongo.ObjectID(req.params.userid)
      User.findOne({"_id" : oId}, function(err, user) {
        if(err)
        {
          console.log("admin activateuser ERROR : " + err)
          req.flash("messagedangeradmin", "unable to activate user")
          res.redirect('/admin/users')
        }
        else 
        {
          if(user.isActivated())
          {
            req.flash("messagedangeradmin", "something odd, this user is already activ ...")
            res.redirect('/admin/users')
          } 
          else
          {
            //activate user
            user.local.mailvalidated = true
            user.save(function(err) {
              if(err)
              {
                console.log("admin activateuser ERROR2 : " + err)
                req.flash("messagedangeradmin", "unable to activate user")
                res.redirect('/admin/users')
              }
              else
              {
                req.flash("messagesuccessadmin" , "user activated")
                res.redirect('/admin/users') 
              }
            })
          }
        }
      })
    })
 

    adminRoutes.post('/deactivateuser/:userid', security.isSuperAdmin, function(req, res) {
      oId = new mongo.ObjectID(req.params.userid)
      User.findOne({"_id" : oId}, function(err, user) {
        if(err) 
        {
          console.log("admin deactivate ERROR : " + err)
          req.flash("messagedangeradmin", "unable to deactivate user")
          res.redirect('/admin/users')
        }
        else 
        {
          if(user.isActivated())
          {
            //deactivate user
            user.local.mailvalidated = false
            user.save(function(err) {
              if(err)
              {
                console.log("admin deactivate ERROR2 : " + err)
                req.flash("messagedangeradmin", "unable to deactivate user")
                res.redirect('/admin/users')
              }
              else
              {
                req.flash("messagesuccessadmin" , "user deactivated")
                res.redirect('/admin/users') 
              } 
            })
          } 
          else 
          {
            req.flash("messagedangeradmin", "something odd, this user is already deactiv ...")
            res.redirect('/admin/users')
          } 
        }
      })
    })

    //cause HTML cannot call DELETE and cause fetch will not have the user in the request
    adminRoutes.post('/deleteuser/:userid', security.isSuperAdmin, function(req, res) {
      oId = new mongo.ObjectID(req.params.userid)
      User.findOne({"_id" : oId}, function(err, user) {
        if(err) 
        {
          console.log("admin deleteuser ERROR : "+ err)
          req.flash("messagedangeradmin", "unable to delete user try later")
          res.redirect('/admin/users')
        }
        else 
        { 
          //don't delete its own account
          if(user._id.toString() !== req.user._id.toString())
          {
            User.remove({"_id" : oId}, function(err, user) {
              if(err) 
              {
                console.log("admin deleteuser ERROR2 : "+ err)
                req.flash("messagedangeradmin", "unable to delete user try later")
                res.redirect('/admin/users')
              }
              else
              {
                req.flash("messagesuccessadmin","user deleted")
                res.redirect('/admin/users')
              }
            })
          }
          else 
          {
            req.flash("messagedangeradmin", "cannot delete your own account")
            res.redirect('/admin/users')
          }
        }
      })
    })

    // apply the routes to our application
    app.use('/admin', adminRoutes)

}