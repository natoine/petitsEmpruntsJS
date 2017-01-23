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
				'Content-Type': 'application/json'
			}),
			body: `{ "username" : "${user}" }`
		})

		fetch(request).then(function(response) {
			if(response.status == 200) window.location.href = `/${user}/borrow`
			//TODO prévoir si la réponse est pas ok de changer l'affichage avec un message d'erreur
		 })
	}
}

Nav.iBorrow = () => {
	const params = new URLSearchParams(document.location.search)
	const friendName = params.get("friendName")
	if(friendName != null) window.location.href = `/${username}/borrow?friendName=${friendName}`
	else window.location.href = `/${username}/borrow`
}

Nav.iLoan = () => {
	const params = new URLSearchParams(document.location.search)
	const friendName = params.get("friendName")
	if(friendName != null) window.location.href = `/${username}/loan?friendName=${friendName}`
	else window.location.href = `/${username}/loan`
}