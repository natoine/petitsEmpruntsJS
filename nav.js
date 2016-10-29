const Nav = {}

Nav.connect = () => {
	const user = document.querySelector("#username").value ;
	if(user.length && user.trim().length) window.location.href = `choose.html?user=${user}`
}

Nav.iBorrow = () => {
	window.location.href = `main.html?user=${username}&status=iborrow`
}

Nav.iLoan = () => {
	window.location.href = `main.html?user=${username}&status=iloan`
}