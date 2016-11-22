const Dom = {}

Dom.printUsername = (username) => {
	const usernameElm = document.querySelector("#username")
	usernameElm.innerHTML = username
}

Dom.changeButton = (status) => {
	if(status === "iloan")
	{
		document.querySelector("#iLoanLi").classList.add("active")
		document.querySelector("#iBorrowLi").classList.remove("active")
	}
	if(status === "iborrow")
	{
		document.querySelector("#iBorrowLi").classList.add("active")
		document.querySelector("#iLoanLi").classList.remove("active")
	}
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
	var count = 0
	lendings.map(lending => {
		count ++
		const tr = document.createElement('tr')
		const tdcount = document.createElement('td')
		tdcount.innerHTML = count 
		const tdMain = document.createElement('td')
		tdMain.innerHTML = `${lending.name} emprunté à ${lending.loaner} depuis le ${lending.date}`
		const tdButton = document.createElement('td')
		const buttonRm = document.createElement('button')
		buttonRm.setAttribute("class" , "btn btn-danger")
		buttonRm.innerHTML = `<i class="icon-remove icon-white"></i>`
		buttonRm.addEventListener("click" , function (event) {
			world.remove(lending.name)
			location.reload()
		})
		tdButton.appendChild(buttonRm)
		tr.appendChild(tdcount)
		tr.appendChild(tdMain)
		tr.appendChild(tdButton)
		document.querySelector('#lendingsIBorrowBody').appendChild(tr)
	})
}

//display the lendings Im the loaner
Dom.displayLendingsLoaner = (lendings) => {
	var count = 0
	lendings.map(lending => {
		count ++
		const tr = document.createElement('tr')
		const tdcount = document.createElement('td')
		tdcount.innerHTML = count
		const tdMain = document.createElement('td')
		tdMain.innerHTML = `${lending.name} emprunté par ${lending.borrower} depuis le ${lending.date}`
		const tdButton = document.createElement('td')
		const buttonRm = document.createElement('button')
		buttonRm.setAttribute("class" , "btn btn-danger")
		buttonRm.innerHTML = `<i class="icon-remove icon-white"></i>`
		buttonRm.addEventListener("click" , function (event) {
			world.remove(lending.name)
			location.reload()
		})
		tdButton.appendChild(buttonRm)
		tr.appendChild(tdcount)
		tr.appendChild(tdMain)
		tr.appendChild(tdButton)
		document.querySelector('#lendingsILoanBody').appendChild(tr)
	})
}

Dom.submitNewLoan = (username, status) => {
	const who = document.querySelector("#fieldWho").value.trim()
	const when = document.querySelector("#fieldWhen").value.trim()
	const what = document.querySelector("#fieldWhat").value.trim()

	//check no blank field
	if(who.length == 0) 
		{
			document.querySelector("#dangerWho").innerHTML = "<strong>Attention :</strong> veillez à remplir ce champ."
			document.querySelector("#dangerWho").removeAttribute("hidden")
		} 
		else document.querySelector("#dangerWho").setAttribute("hidden" , true) 
	if(when.length == 0) 
		{
			document.querySelector("#dangerWhen").innerHTML = "<strong>Attention :</strong> veillez à remplir ce champ."
			document.querySelector("#dangerWhen").removeAttribute("hidden")
		}
		else document.querySelector("#dangerWhen").setAttribute("hidden" , true)
	if(what.length == 0) 
		{
			document.querySelector("#dangerWhat").innerHTML = "<strong>Attention :</strong> veillez à remplir ce champ."
			document.querySelector("#dangerWhat").removeAttribute("hidden")
		}
		else document.querySelector("#dangerWhat").setAttribute("hidden" , true)

	if( !( who.length == 0 )
		&& !( when.length == 0 )
		&& !( what.length == 0 )
		)
	{
		var lending
		if(status === "iborrow") lending = {name: what, date: when, borrower: username , loaner: who}
		if(status === "iloan") lending = {name: what, date: when, borrower: who , loaner: username}
		//It works but you need to refresh the page.
		//should be an http request and an auto refresh through callback of list of lendings
		//no verification that values are not empty ...
		world.new(lending)
		location.reload()	
	}
	
}