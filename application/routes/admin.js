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
            throw err
          }
          else 
          {
            res.render('admin/users' , 
              {
                username : req.user.local.username, 
                users : users,
                messagesuccessadmin : req.flash("messagesuccessadmin"),
                messagedangeradmin : req.flash("messagedangeradmin")
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
            throw err
          }
          else 
          {
            res.render('admin/loans' , 
              {
                username : req.user.local.username, 
                loans : loans,
                messagesuccessadmin : req.flash("messagesuccessadmin"),
                messagedangeradmin : req.flash("messagedangeradmin")
              })
          }
    		})
    })

    adminRoutes.get('/loans/:userid', security.isSuperAdmin, function(req, res) {
      oId = new mongo.ObjectID(req.params.userid)
      User.findOne({"_id" : oId}, function(err, user) {
            if(err) throw err
            else 
            {
              var hisborrows 
              Loan.find( { 'borrower' : user.local.email }, function(err, loans) {
                if(err) throw err
                else 
                {
                  hisborrows = loans
                  var hisloans
                  Loan.find( { 'loaner' : user.local.email }, function(err, loans) {
                    if(err) throw err
                    else 
                    {
                      hisloans = loans
                      res.render('admin/userloans' , 
                        { username : req.user.local.username, 
                          borrows : hisborrows , 
                          loans : hisloans , 
                          user: user, 
                          messagesuccessadmin : req.flash("messagesuccessadmin"),
                          messagedangeradmin : req.flash("messagedangeradmin")
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
            if(err) throw err
            if(loan) 
            {
                Loan.remove({"_id" : oId}, function(err, loan) {
                  if(err) 
                  {
                      console.log("unable to delete loan : " + req.params.loanid)
                      req.flash("messagedangeradmin","an error occured, unable to delete loan")
                      console.lof("admin deleteloan ERROR : " + err)
                      res.redirect('/admin/loans/' + user._id)
                  }
                  else
                  {
                    //verify user still exists
                    User.findOne({"local.username" : username}, function(err, user) {
                      if(err) 
                      {
                        req.flash("messagedangeradmin","an error occured, during deletion of the loan")
                        console.lof("admin deleteloan ERROR2 : " + err)
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
            if(err) throw err
            else 
            {
              if(user.isActivated()) console.log("pb already activated ...")
              else
              {
                console.log("activate user")
                //activate user
                user.local.mailvalidated = true
                user.save(function(err) {
                  if(err) throw err
                })
              }
            }
            res.redirect('/admin/users')
          })
    })

    adminRoutes.post('/deactivateuser/:userid', security.isSuperAdmin, function(req, res) {
      oId = new mongo.ObjectID(req.params.userid)
      User.findOne({"_id" : oId}, function(err, user) {
            if(err) throw err
            else 
            {
              if(user.isActivated())
              {
                console.log("deactivate user")
                //deactivate user
                user.local.mailvalidated = false
                user.save(function(err) {
                  if(err) throw err
                })
              } 
              else console.log("pb already deactivated ...")
            }
            res.redirect('/admin/users')
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