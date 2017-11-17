
document.addEventListener('DOMContentLoaded', () => {
	deletebuttons = document.querySelectorAll(".btndelete")
	for(deletebutton of deletebuttons ) 
	{
		deletebutton.addEventListener("click" , function(){postDeleteButton(this)})
	}
	document.querySelector("#submitILoanButton").addEventListener("click" , function(){postNewLoan("iLoan")} )
	document.querySelector("#submitIBorrowButton").addEventListener("click" , function(){postNewLoan("iBorrow")} )
})

//je supprime un emprunt (j'aurai aimé faire un fetch DELETE ...)
postDeleteButton = (deletebutton) => {
	deletebuttonid = deletebutton.id
	id = deletebuttonid.split("deleteloan")[1]
	var form = document.createElement("form")
	form.method = "POST"
    form.action = "/deleteloan/" + id
    form.style.display = "none"
    document.body.appendChild(form)
    form.submit()
}

postNewLoan = (loanOrBorrow) => {
	form = document.querySelector("#mainform")
	inputAction = document.createElement("input")
	inputAction.type = "hidden"
	inputAction.id = "actionMainForm"
	inputAction.name = "action"
	inputAction.value = loanOrBorrow
	form.appendChild(inputAction)
	form.submit()
}