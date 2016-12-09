const http = require('http')  
const port = 3000
//needed fot content negociation
const accepts = require('accepts')

const requestHandler = (request, response) => {  
	//dans tous les cas je veux récupérer et logger ces infos
	var headers = request.headers
	var method = request.method
	var url = request.url
	//console.log(`method : ${method}`)
	//console.log(`url : ${url}`)
	//console.log(`headers : ${headers}`)
	var body = []

	request.on('error', function(err) {
			console.error(err) 
		}).on('data', function(chunk) {
    		body.push(chunk)
    	}).on('end', function() {
    		body = Buffer.concat(body).toString()
    		//console.log(`body : ${body}`)
	   
	    //build response
	    response.on('error', function(err) {
	      console.error(err)
	    })

	    if( method === "GET" )
	    {	

	    	//routing
	    	switch(url)
	    	{
	    		case '/':
	    			response.statusCode = 200
	    			response.setHeader('Content-Type', 'text/html')
	    			response.write('<b>Want Index</b>')
	    			break
	    		default:
	    			console.log("unexpected url : " + url)
	    			response.statusCode = 404
	    			response.write(`<b>no resource here for you at : ${url}</b>`)
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

		    response.end()
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