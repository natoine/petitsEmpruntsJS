
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
	console.log(body)
})

///////////////////////////////////////////////////////////////////////////////////////////

//js scripts routing

app.get('/nav.js', function (request, response) 
{
	fs.readFile("resources/js/nav.js", function(err, data)
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

//handle 404
app.use(function(request, response, next){
  response.status(404)
  console.log("404 request. URL : " + request.url + " method : " + request.method )
})
