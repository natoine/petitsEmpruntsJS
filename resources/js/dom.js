const Dom = {}

Dom.printUsername = (username) => {
	const usernameElm = document.querySelector("#username")
	usernameElm.innerHTML = username
}

Dom.changeButton = (status) => {
	if(status === "loan")
	{
		document.querySelector("#iLoanLi").classList.add("active")
		document.querySelector("#iBorrowLi").classList.remove("active")
	}
	if(status === "borrow")
	{
		document.querySelector("#iBorrowLi").classList.add("active")
		document.querySelector("#iLoanLi").classList.remove("active")
	}
}

Dom.displayFriends = (friends, username, status) => {
	const li = document.createElement('li')
	li.innerHTML = `<a href="/${username}/${status}">Tous</a>`
	document.querySelector('#friends').appendChild(li)
	friends.forEach(friend => {
		const li = document.createElement('li')
		li.innerHTML = `<a href="?friendName=${friend}">${friend}</a>`
		document.querySelector('#friends').appendChild(li)
	})
}

//display the lendings Im the borrower
Dom.displayLendingsBorrower = (lendings) => {
	if(lendings)
	{
		//var count = 0
		lendings.map(lending => {
			//count ++
			Dom.addALendingBorrower(lending)
		})
	}
}

Dom.addALendingBorrower = (lending) => {
	const tr = document.createElement('tr')
	const tdcount = document.createElement('td')
	tdcount.innerHTML =  lending._id
	const tdMain = document.createElement('td')
	tdMain.innerHTML = `${lending.name} emprunté à ${lending.loaner} depuis le ${lending.date}`
	const tdButton = document.createElement('td')
	const buttonRm = document.createElement('button')
	buttonRm.setAttribute("class" , "btn btn-danger")
	buttonRm.innerHTML = `<i class="icon-remove icon-white"></i>`
	/*buttonRm.addEventListener("click" , function (event) {
		world.remove(lending.name)
		location.reload()
	})*/
	tdButton.appendChild(buttonRm)
	tr.appendChild(tdcount)
	tr.appendChild(tdMain)
	tr.appendChild(tdButton)
	document.querySelector('#lendingsIBorrowBody').appendChild(tr)
}

//display the lendings Im the loaner
Dom.displayLendingsLoaner = (lendings) => {
	if(lendings)
	{
		//var count = 0
		lendings.map(lending => {
			//count ++
			Dom.addALendingLoaner(lending)
		})
	}
}

Dom.addALendingLoaner = (lending) => {
	const tr = document.createElement('tr')
	const tdcount = document.createElement('td')
	tdcount.innerHTML = lending._id
	const tdMain = document.createElement('td')
	tdMain.innerHTML = `${lending.name} emprunté par ${lending.borrower} depuis le ${lending.date}`
	const tdButton = document.createElement('td')
	const buttonRm = document.createElement('button')
	buttonRm.setAttribute("class" , "btn btn-danger")
	buttonRm.innerHTML = `<i class="icon-remove icon-white"></i>`
	/*buttonRm.addEventListener("click" , function (event) {
		world.remove(lending.name)
		location.reload()
	})*/
	tdButton.appendChild(buttonRm)
	tr.appendChild(tdcount)
	tr.appendChild(tdMain)
	tr.appendChild(tdButton)
	document.querySelector('#lendingsILoanBody').appendChild(tr)
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
		if(status === "borrow") lending = {name: what, date: when, borrower: username , loaner: who}
		if(status === "loan") lending = {name: what, date: when, borrower: who , loaner: username}
		//no verification that values are not empty ...
		world.new(lending, Dom.addLendingElt, Dom.errorLending)
	}
	
}

Dom.addLendingElt = (jsonlending) => {
	const username = document.querySelector("#username").innerHTML
	if(username === jsonlending.borrower) 
	{
		//add in borrow list
		Dom.addALendingBorrower(jsonlending)
	}
	else 
	{
		//add in loan list
		Dom.addALendingLoaner(jsonlending)
	}
}

//Print errors in Dom

Dom.errorLending = (lending) => {
	alert("not ok" + lending)
}

Dom.errorRetrievingLendings = () => {
	alert("pb retrieving lendings")
}

Dom.errorRetrievingBorrows = () => {
	alert("pb retrieving borrows")
}