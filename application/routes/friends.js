
const security = require('../utils/securityMiddleware')


// application/friends.js
module.exports = function(app, express) {

	// get an instance of the router for main routes
    const friendsRoutes = express.Router()

    // =====================================
    // FRIENDS SECTION =====================
    // =====================================
    // list your friends
    friendsRoutes.get('/friends', security.rememberme, security.isLoggedInAndActivated, 
    	function(req, res) {
    		customheaders = []
            customscripts = []
            customnavs = []
            res.render('pages/friends' , {
            	username : req.user.local.username , 
                messagesuccess : req.flash('messagesuccess') , 
                messagedanger : req.flash('messagedanger') ,
                isadmin : req.user.isSuperAdmin(),
                customheaders : customheaders,
                customscripts : customscripts,
                customnavs : customnavs                 
            })
    	}
    )


    // apply the routes to our application
    app.use('/', friendsRoutes)
}