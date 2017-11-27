const security = require('../utils/securityMiddleware')
// load up the user model
const User            = require('../models/user')
//load up the loan model
const Loan = require('../models/loan')

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
    			if(err) throw err
            	else 
               	{
               		res.render('admin/users' , 
               			{username : req.user.local.username, users : users})
               	}
    		}
    	)
    })

    adminRoutes.get('/loans', security.isSuperAdmin, function(req, res) {
    	Loan.find( {} , {} , function(err, loans) {
    			if(err) throw err
            	else 
               	{
               		res.render('admin/loans' , 
               			{username : req.user.local.username, loans : loans})
               	}
    		})
    })

    // apply the routes to our application
    app.use('/admin', adminRoutes)

}