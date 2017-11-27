const security = require('../utils/securityMiddleware')
// load up the user model
const User            = require('../models/user')

module.exports = function(app, express) {

    // get an instance of the router for main routes
    const adminRoutes = express.Router()

    adminRoutes.get('/admin', security.isSuperAdmin, function(req, res) {
    	res.render('admin/users' , {username : req.user.local.username})
    })

    // apply the routes to our application
    app.use('/', adminRoutes)

}