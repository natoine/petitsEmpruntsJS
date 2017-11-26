//needed for filesystem
const fs = require('fs')

module.exports = function(app, express) {

	// get an instance of the router for clientfiles routes
	const clientFilesRoutes = express.Router()

	// =============================================================================
// PETITSEMPRUNTS CLIENT JS =============================================================
// =============================================================================

    clientFilesRoutes.get('/main.js', function(req, res) {
        fs.readFile("resources/js/main.js", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.write(data)
            res.end()
        })
    })


// =============================================================================
// BOOTSTRAP CSS JS =============================================================
// =============================================================================

    clientFilesRoutes.get('/bootstrap.min.css', function(req, res) {
        fs.readFile("resources/bootstrap/css/bootstrap.min.css", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/css'})
            res.write(data)
            res.end()
        })
    })

    clientFilesRoutes.get('/bootstrap-responsive.css', function(req, res) {
        fs.readFile("resources/bootstrap/css/bootstrap-responsive.css", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/css'})
            res.write(data)
            res.end()
        })
    })

    clientFilesRoutes.get('/bootstrap.min.js', function(req, res) {
        fs.readFile("resources/bootstrap/js/bootstrap.min.js", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.write(data)
            res.end()
        })
    })

    clientFilesRoutes.get('/img/glyphicons-halflings-white.png', function(req, res) {
        fs.readFile("resources/bootstrap/img/glyphicons-halflings-white.png", function(err, data) {
            res.writeHead(200, {'Content-Type': 'image/png'})
            res.write(data)
            res.end()
        })
    })    

// =============================================================================
// MOMENT PICKADAY JS =============================================================
// =============================================================================

    clientFilesRoutes.get('/moment.js', function(req, res) {
        fs.readFile("resources/js/libs/moment.js", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.write(data)
            res.end()
        })
    })

    clientFilesRoutes.get('/pikaday.js', function(req, res) {
        fs.readFile("resources/js/libs/pikaday/pikaday.js", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.write(data)
            res.end()
        })
    })

    clientFilesRoutes.get('/pikaday.css', function(req, res) {
        fs.readFile("resources/js/libs/pikaday/css/pikaday.css", function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/css'})
            res.write(data)
            res.end()
        })
    })

	// apply the routes to our application
	app.use('/', clientFilesRoutes)
}