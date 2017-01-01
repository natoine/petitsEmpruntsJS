const Nav = {}

Nav.connect = () => {
	const user = document.querySelector("#username").value
	const userTrim = user.trim()
	//changes it to POST !!! so server can make a redirect /username
	if(userTrim.length) window.location.href = `main.html?user=${userTrim}&status=iborrow`
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