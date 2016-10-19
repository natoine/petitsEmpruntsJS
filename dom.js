const Dom = {}

Dom.displayFriends = (friends) => {
	friends.forEach(friend => {
		const li = document.createElement('li')
		li.innerHTML = `<a href="?friendName=${friend}">${friend}</a>`
		document.querySelector('#friends').appendChild(li)
	})
}

Dom.displayLendings = (lendings) => {
	lendings.map(lending => {
		const li = document.createElement('li')
		li.innerHTML = `${lending.name} emprunté par ${lending.friend} depuis le ${lending.date}`
		const buttonRm = document.createElement('button')
		buttonRm.innerHTML = `x`
		buttonRm.addEventListener("click" , function (event) {
			world.remove(lending.name)
			location.reload()
		})
		li.appendChild(buttonRm)
		document.querySelector('#lendings').appendChild(li)
	})
}

Dom.submitNewLoan = () => {
	const who = document.querySelector("#fieldWho").value ;
	const when = document.querySelector("#fieldWhen").value
	const what = document.querySelector("#fieldWhat").value
	const lending = {name: what, date : when, friend: who}
	//It works but you need to refresh the page.
	//should be an http request and list of lendings update through callback
	world.new(lending)
	location.reload()
}