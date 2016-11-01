const Dom = {}

Dom.printUsername = (username) => {
	const usernameElm = document.querySelector("#username")
	usernameElm.innerHTML = username
}

Dom.titlePage = (status) => {
	const titleElm = document.querySelector("#titleAction")
	if(status === "iborrow") titleElm.innerHTML = "J'emprunte"
	if(status === "iloan") titleElm.innerHTML = "Je prête"
}

Dom.changeButton = (status) => {
	var newStatus
	const buttonChangeElm = document.querySelector("#wantToChangeButton")
	if(status === "iborrow") 
		{
			buttonChangeElm.innerHTML = "Je prête"
			newStatus = "iloan"
		}
	if(status === "iloan") 
		{
			buttonChangeElm.innerHTML = "J'emprunte"
			newStatus = "iborrow"
		}
	buttonChangeElm.addEventListener("click" , function (event) {
			const params = new URLSearchParams(document.location.search)
			const user = params.get("user")
			const friendName = params.get("friendName")
			var url = document.location.href.split("?")[0] + `?user=${user}&status=${newStatus}`
			if(friendName != null) url = url + `&friendName=${friendName}`
			location.assign(url)
		})
}

Dom.displayFriends = (friends, username, status) => {
	const li = document.createElement('li')
	li.innerHTML = `<a href="?user=${username}&status=${status}">Tous</a>`
	document.querySelector('#friends').appendChild(li)
	friends.forEach(friend => {
		const li = document.createElement('li')
		li.innerHTML = `<a href="?friendName=${friend}&user=${username}&status=${status}">${friend}</a>`
		document.querySelector('#friends').appendChild(li)
	})
}

//display the lendings Im the borrower
Dom.displayLendingsBorrower = (lendings) => {
	lendings.map(lending => {
		const li = document.createElement('li')
		li.innerHTML = `${lending.name} emprunté à ${lending.loaner} depuis le ${lending.date}`
		const buttonRm = document.createElement('button')
		buttonRm.innerHTML = `x`
		buttonRm.addEventListener("click" , function (event) {
			world.remove(lending.name)
			location.reload()
		})
		li.appendChild(buttonRm)
		document.querySelector('#lendingsIBorrow').appendChild(li)
	})
}

//display the lendings Im the loaner
Dom.displayLendingsLoaner = (lendings) => {
	lendings.map(lending => {
		const li = document.createElement('li')
		li.innerHTML = `${lending.name} emprunté par ${lending.borrower} depuis le ${lending.date}`
		const buttonRm = document.createElement('button')
		buttonRm.innerHTML = `x`
		buttonRm.addEventListener("click" , function (event) {
			world.remove(lending.name)
			location.reload()
		})
		li.appendChild(buttonRm)
		document.querySelector('#lendingsILoan').appendChild(li)
	})
}

Dom.submitNewLoan = (username, status) => {
	console.log("new loan")
	console.log(username)
	const who = document.querySelector("#fieldWho").value ;
	const when = document.querySelector("#fieldWhen").value
	const what = document.querySelector("#fieldWhat").value
	var lending
	if(status === "iborrow") lending = {name: what, date: when, borrower: username , loaner: who}
	if(status === "iloan") lending = {name: what, date: when, borrower: who , loaner: username}
	//It works but you need to refresh the page.
	//should be an http request and an auto refresh through callback of list of lendings
	//no verification that values are not empty ...
	world.new(lending)
	location.reload()
}