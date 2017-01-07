const Nav = {}

Nav.connect = () => {
	const user = document.querySelector("#username").value
	const userTrim = user.trim()
	//changes it to POST !!! so server can make a redirect /username
	if(userTrim.length) 
	{
		var request =  new Request('/connect', {
			method: 'POST', 
			redirect: 'follow',
			headers: new Headers({
				'Content-Type': 'text/plain'
			}),
			body: user
		})

		fetch(request).then(function(response) {
			return response.json()
		 }).then(function(json) {
			console.log( "response :" + json )
			})
	}

		//window.location.href = `main.html?user=${userTrim}&status=iborrow`
}

Nav.iBorrow = () => {
	console.log("iBorrow")
	const params = new URLSearchParams(document.location.search)
	const friendName = params.get("friendName")
	if(friendName != null) window.location.href = `main.html?user=${username}&status=iborrow&friendName=${friendName}`
	else window.location.href = `main.html?user=${username}&status=iborrow`
}

Nav.iLoan = () => {
	console.log("iLoan")
	const params = new URLSearchParams(document.location.search)
	const friendName = params.get("friendName")
	if(friendName != null) window.location.href = `main.html?user=${username}&status=iloan&friendName=${friendName}`
	else window.location.href = `main.html?user=${username}&status=iloan`
}