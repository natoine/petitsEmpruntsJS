
document.addEventListener('DOMContentLoaded', () => {

	document.querySelector("#IBorrowButton").addEventListener("click", alertBorrow )
	document.querySelector("#ILoanButton").addEventListener("click", alertLoan )

})

alertBorrow = () => {
	console.log("iBorrow")
}

alertLoan = () => {
	console.log("iLoan")
}