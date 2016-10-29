const generateLendings = () => {
	const lendings = [
		{name: 'Thorgal', date : '24/03/2014', borrower: 'Thomas', loaner:'me'},
		{name: '5é élément', date : '19/02/2015', borrower: 'NaturalPad', loaner:'me'}
	]
	lendings.map(lending => world.new(lending))
}

const world = new World()

//once the page html page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
	//manage parameters
	const params = new URLSearchParams(document.location.search)
	//print username
	const username = params.get("user")
	if(!username) window.location.href = `index.html`
	Dom.printUsername(username)
	//change title page (iborrow or iloan)
	const status = params.get("status")
	Dom.titlePage(status)
	
	//find friends and build friend list
	const friends = world.findFriends(username)
	Dom.displayFriends(friends, username, status)
	//find loans and build the 2 loans list
	const friendname = params.get("friendName")
	Dom.displayLendingsBorrower(world.findLendingsIBorrow(friendname, username))
	Dom.displayLendingsLoaner(world.findLendingsILoan(friendname, username))

	//add the submit action onclick on the right button : submitNewLoanButton
	document.querySelector("#submitNewLoanButton").addEventListener("click", function() {Dom.submitNewLoan(username, status)})

})