
const security = require('../utils/securityMiddleware')

//load up the friendlist model
const FriendList = require('../models/friendlist')

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
    		FriendList.find( {'creator' : user} , function(err, friendListDB) {
	            if(err)
	            {
	            	console.log("friends ERROR : " + err)
	            	req.flash('messagedanger' , 'something odd happened trying to fetch your friends')
	            	res.redirect('/main')
	            }
	            else 
	            {
	            	customheaders = []
            		customscripts = []
            		customnavs = []
            		res.render('pages/friends' , {
		            	username : req.user.local.username , 
		                messagesuccess : req.flash('messagesuccess') , 
		                messagedanger : req.flash('messagedanger') ,
		                friendlist : friendListDB ,
		                isadmin : req.user.isSuperAdmin(),
		                customheaders : customheaders,
		                customscripts : customscripts,
		                customnavs : customnavs                 
		            })
	            }
	        })
    	}
    )


    // apply the routes to our application
    app.use('/', friendsRoutes)
}