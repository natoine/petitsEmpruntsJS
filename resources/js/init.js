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
	const url = new URL(document.location)
	const urlNav = url.pathname.split("/")
	const username = urlNav[1]
	const status = urlNav[2]
	//print Username
	Dom.printUsername(username)
	//print iloan or iborrow button
	Dom.changeButton(status)

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