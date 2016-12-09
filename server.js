const http = require('http')  
const port = 3000

const requestHandler = (request, response) => {  
	var headers = request.headers;
	var method = request.method;
	var url = request.url;
	console.log(`method : ${method}`)
	console.log(`url : ${url}`)
	console.log(`headers : ${headers}`)
	var body = [];

	request.on('error', function(err) {
			console.error(err) 
		}).on('data', function(chunk) {
    		body.push(chunk)
    	}).on('end', function() {
    		body = Buffer.concat(body).toString()
    		console.log(`body : ${body}`)
    // At this point, we have the headers, method, url and body, and can now
    // do whatever we need to in order to respond to this request.
  		})

	response.end('Hello Node.js Server!')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})