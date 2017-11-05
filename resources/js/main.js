
document.addEventListener('DOMContentLoaded', () => {

	document.querySelector("#IBorrowButton").addEventListener("click", changetoborrow )
	document.querySelector("#ILoanButton").addEventListener("click", changetoloan )
	deletebuttons = document.querySelectorAll(".btndelete")
	for(deletebutton of deletebuttons ) 
	{
		deletebutton.addEventListener("click" , function(){postDeleteButton(this)})
	}
})
//j'emprunte
changetoborrow = () => {
	document.querySelector("#iBorrowLi").classList.add("active")
	document.querySelector("#iLoanLi").classList.remove("active")
	document.querySelector("#actionMain").innerHTML = "Vous empruntez : "
	document.querySelector("#actionMainForm").value = "iBorrow"
}

//je prête
changetoloan = () => {
	document.querySelector("#iLoanLi").classList.add("active")
	document.querySelector("#iBorrowLi").classList.remove("active")
	document.querySelector("#actionMain").innerHTML = "Vous prêtez : "
	document.querySelector("#actionMainForm").value = "iLoan"
}

//je supprime un emprunt (j'aurai aimé faire un fetch DELETE ...)
postDeleteButton = (deletebutton) => {
	deletebuttonid = deletebutton.id
	id = deletebuttonid.split("deleteloan")[1]
	var form = document.createElement("form")
	form.method = "POST"
    form.action = "/deleteloan/" + id
    form.submit()
}