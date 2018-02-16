
const security = require('../utils/securityMiddleware')
const mailSender = require('../utils/mailSender')

//load up the friendlist model
const FriendList = require('../models/friendlist')
var User = require('../models/user')

const mongo = require('mongodb')

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

    //changes data about a friend
    friendsRoutes.post('/updatefriend/:friendlistid' , security.rememberme, security.isLoggedInAndActivated, 
    	function(req, res) { 
    		newfriendname = req.body.newfriendname.trim()
    		newfriendmail = req.body.newfriendmail.trim()
    		console.log("mail : " + newfriendmail + " name : " + newfriendname)
    		if(newfriendname.length == 0 && newfriendmail.length == 0)
    		{
    			req.flash('messagedanger', "rien à modifier")
    			res.redirect('/friends')	
    		}
    		else
    		{
    			if(newfriendmail.length != 0 && !mailSender.validateMail(newfriendmail))
    			{
    				req.flash('messagedanger', "mail non valide")
    				res.redirect('/friends')
    			}
    			else
    			{
    				oId = new mongo.ObjectID(req.params.friendlistid)
	    			FriendList.findOne({"_id" : oId}, function(err, friend) {
		    			if(err)
		    			{
		    				req.flash('messagedanger', "impossible de modifier les informations de cet ami.")
			                res.redirect('/friends')
		    			}
		    			else if(friend)
		    			{
		    				if(
		    					(friend.friendname == newfriendname && friend.friendmail == newfriendmail)
		    					|| (newfriendname.length == 0 && newfriendmail.length == 0)
		    					)
		    				{
		    					req.flash('messagedanger', "nothing to change")
		    					res.redirect('/friends')
		    				}
		    				else
		    				{
		    					if(newfriendname.length != 0) friend.friendname = newfriendname
			    				if(newfriendmail.length != 0) friend.friendmail = newfriendmail
			    				console.log("will try to change friend")
			    				friend.save()
			    				console.log("friendmail : " + friend.friendmail + " friendname : " + friend.friendname)
			    				User.findOne({"local.email" : newfriendmail} 
			    					, function(err, user) {
			    						if(err)
			    						{
			    							req.flash('messagedanger', "impossible de chercher un utilisateur avec ce mail")
			    							res.redirect('/friends')
			    						}
			    						else if(user)
			    						{
			    							friend.frienduserid = user
			    							friend.friendusername = user.local.username
			    							friend.save(function(err){
			    								if(err) 
			    								{
			    									req.flash('messagedanger', "impossible de lier un profil utilisateur à cet ami")
			    									res.redirect('/friends')			
			    								}
			    								else
			    								{
			    									req.flash('messagesuccess', "ami mis à jour et lié à un profil utilisateur")
			    									res.redirect('/friends')	
			    								}
			    							})
			    						}
			    						else
			    						{
			    							res.redirect('/friends')
			    						}
			    				})
			    			}
		    			}
	    				else redirect('/friends')
	    			})
    			}	    		
    		}
    	})

    // apply the routes to our application
    app.use('/', friendsRoutes)
}