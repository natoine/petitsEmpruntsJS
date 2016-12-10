const http = require('http')
const port = 3000
//needed for content negociation
const accepts = require('accepts')
//needed for filesystem
const fs = require('fs') 

const requestHandler = (request, response) => {  
	var headers = request.headers
	var method = request.method
	var url = request.url
	var body = []

	request.on('error', function(err) {
			console.error(err) 
		}).on('data', function(chunk) {
    		body.push(chunk)
    	}).on('end', function() {
    		body = Buffer.concat(body).toString()
	   
	    //build response
	    response.on('error', function(err) {
	      console.error(err)
	    })

	    if( method === "GET" )
	    {	
	    	//routing
	    	switch(url)
	    	{
	    		//navigation in the app
	    		case '/':
		    		fs.readFile("resources/renderHtml/index.html", function(err, data)
		    		{
	  					response.writeHead(200, {'Content-Type': 'text/html'})
	  					response.write(data)
	  					response.end()
					})
	    			break
	    		//JS for client ( except bootstrap )
	    		case '/nav.js':
	    			fs.readFile("resources/js/nav.js", function(err, data)
		    		{
	  					response.writeHead(200, {'Content-Type': 'text/plain'})
	  					response.write(data)
	  					response.end()
					})
	    		break
	    		//bootstrap
	    		case '/bootstrap.min.css':
	    			fs.readFile("resources/bootstrap/css/bootstrap.min.css", function(err, data)
		    		{
	  					response.writeHead(200, {'Content-Type': 'text/css'})
	  					response.write(data)
	  					response.end()
					})
	    		break
	    		case '/bootstrap.min.js':
	    			fs.readFile("resources/bootstrap/js/bootstrap.min.js", function(err, data)
		    		{
	  					response.writeHead(200, {'Content-Type': 'text/plain'})
	  					response.write(data)
	  					response.end()
					})
	    		break
	    		case '/bootstrap-responsive.css':
	    			fs.readFile("resources/bootstrap/css/bootstrap-responsive.css", function(err, data)
		    		{
	  					response.writeHead(200, {'Content-Type': 'text/css'})
	  					response.write(data)
	  					response.end()
					})
	    		break
	    		//default 404
	    		default:
	    			console.log("unexpected url : " + url)
	    			response.statusCode = 404
	    			response.write(`<b>no resource here for you at : ${url}</b>`)
	    			response.end()
	    			break
	    	}
	    	//Content Negotiation
	    	//console.log(headers.accept)
	    	/*var accept = headers.accept.split(",")
	    	console.log(accept.length)
	    	console.log(accept)*/
	    	
	    	/*const accept = accepts(request)
	    	 switch(accept.type(['html', 'json', 'xml', 'rdf+xml'])) 
	    	 {
			   case 'html':
			   	response.statusCode = 200
			    response.setHeader('Content-Type', 'text/html')
			    response.write('<b>Want text/html</b>')
			    break
			   case 'xml':
			  	//not implemented yet
			   	response.statusCode = 200
			    response.setHeader('Content-Type', 'application/xml')
			    response.write('<xml><content>Hello World</content></xml>')
			    break
			   case 'json':
			   	//not implemented yet
			   	response.statusCode = 200
			    response.setHeader('Content-Type', 'application/json')
			    response.write('{"hello":"world!"}')
			    break
			    case 'rdf+xml':
			   	//not implemented yet
			   	response.statusCode = 200
			    response.setHeader('Content-Type', 'application/json')
			    response.write('{"hello":"world!"}')
			    break
			   default:
			    // the fallback is text/plain, so no need to specify it above 
			    response.statusCode = 200
			    response.setHeader('Content-Type', 'text/plain')
			    response.write('hello, world!')
			    break
			  }*/
	    }

  	})
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})