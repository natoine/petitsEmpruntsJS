const Nav = {}

Nav.connect = () => {
	const user = document.querySelector("#username").value
	const userTrim = user.trim()
	if(userTrim.length) window.location.href = `choose.html?user=${userTrim}`
}

Nav.iBorrow = () => {
	window.location.href = `main.html?user=${username}&status=iborrow`
}

Nav.iLoan = () => {
	window.location.href = `main.html?user=${username}&status=iloan`
}