
document.addEventListener('DOMContentLoaded', () => {

	document.querySelector("#IBorrowButton").addEventListener("click", alertBorrow )
	document.querySelector("#ILoanButton").addEventListener("click", alertLoan )

})
//j'emprunte
alertBorrow = () => {
	document.querySelector("#iBorrowLi").classList.add("active")
	document.querySelector("#iLoanLi").classList.remove("active")
	document.querySelector("#actionMain").innerHTML = "Vous empruntez : "
}
//je prête
alertLoan = () => {
	document.querySelector("#iLoanLi").classList.add("active")
	document.querySelector("#iBorrowLi").classList.remove("active")
	document.querySelector("#actionMain").innerHTML = "Vous prêtez : "
}