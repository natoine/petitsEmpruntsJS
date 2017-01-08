
const express = require('express')
const app = express()
//needed for filesystem
const fs = require('fs')
//needed to parse body with express
const bodyParser = require('body-parser')

app.use(bodyParser.json()); // for parsing application/json

app.listen(3000, function () 
{
  console.log('Petits Emprunts Express started on port 3000')
})

/////////////////////////////////////////////////////////////////////////////////////////////

//app routing

app.get('/', function (request, response) 
{
	fs.readFile("resources/renderHtml/index.html", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/html'})
	  	response.write(data)
	  	response.end()
	})
})

app.post('/connect' , function(request, response) 
{
	console.log("request post /connect")
	var body = request.body
	var username = body.username
	console.log(username + " tries to connect")
	console.log("for now on it's ok everybody can connect ... but it will have to change !!!! ")
	//response.redirect(`/${username}/borrow`)
	//now, always reply OK !
	response.writeHead(200, {'Content-Type': 'text/html'})
	response.end()
})

app.get('/disconnect' , function(request, response)
{
	console.log("try to disconnect")	
})

app.get('/:username/borrow' , function(request, response)
{
	//TODO should first try to see if user is really connected
	fs.readFile("resources/renderHtml/main.html", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/html'})
	  	response.write(data)
	  	response.end()
	})
})

app.get('/:username/loan' , function(request, response)
{
	//TODO should first try to see if user is really connected
	fs.readFile("resources/renderHtml/main.html", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/html'})
	  	response.write(data)
	  	response.end()
	})
})

///////////////////////////////////////////////////////////////////////////////////////////

//js client scripts routing

app.get('/nav.js', function (request, response) 
{
	fs.readFile("resources/js/nav.js", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/plain'})
	  	response.write(data)
	  	response.end()
	})	
})

app.get('/world.js', function (request, response) 
{
	fs.readFile("resources/js/world.js", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/plain'})
	  	response.write(data)
	  	response.end()
	})	
})

app.get('/dom.js', function (request, response) 
{
	fs.readFile("resources/js/dom.js", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/plain'})
	  	response.write(data)
	  	response.end()
	})	
})

app.get('/init.js', function (request, response) 
{
	fs.readFile("resources/js/init.js", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/plain'})
	  	response.write(data)
	  	response.end()
	})	
})

//////////////////////////////////////////////////////////////////////////////////////////

//bootstrap routing

app.get('/bootstrap.min.css', function (request, response) 
{
	fs.readFile("resources/bootstrap/css/bootstrap.min.css", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/css'})
	  	response.write(data)
	  	response.end()
	})
})

app.get('/bootstrap.min.js', function (request, response) 
{
	fs.readFile("resources/bootstrap/js/bootstrap.min.js", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/plain'})
	  	response.write(data)
	  	response.end()
	})
})

app.get('/bootstrap-responsive.css', function (request, response)
{
	fs.readFile("resources/bootstrap/css/bootstrap-responsive.css", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/css'})
	  	response.write(data)
	  	response.end()
	})
})

/////////////////////////////////////////////////////////////////////////////////////////////

//Pickaday routing

app.get('/pikaday.css', function (request, response) 
{
	fs.readFile("resources/js/libs/pikaday/css/pikaday.css", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/css'})
	  	response.write(data)
	  	response.end()
	})
})

app.get('/pikaday.js', function (request, response) 
{
	fs.readFile("resources/js/libs/pikaday/pikaday.js", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/plain'})
	  	response.write(data)
	  	response.end()
	})
})

/////////////////////////////////////////////////////////////////////////////////////////////

//Moment routing

app.get('/moment.js', function (request, response) 
{
	fs.readFile("resources/js/libs/moment.js", function(err, data)
	{
	  	response.writeHead(200, {'Content-Type': 'text/plain'})
	  	response.write(data)
	  	response.end()
	})
})

/////////////////////////////////////////////////////////////////////////////////////////////

//handle 404
app.use(function(request, response, next){
  response.status(404)
  console.log("404 request. URL : " + request.url + " method : " + request.method )
})
