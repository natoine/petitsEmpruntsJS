const generateLendings = () => {
	const lendings = [
		{name: 'Thorgal', date : '24/03/2014', friend: 'Thomas'},
		{name: '5é élément', date : '19/02/2015', friend: 'NaturalPad'}
	]
	lendings.map(lending => world.new(lending))
}

const world = new World()

//once the page html page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
	//find friends and build friend list
	const friends = world.findFriends()
	Dom.displayFriends(friends)
	//find loans and build laons list
	const query = document.location.search.split('?friendName=')[1]
	Dom.displayLendings(world.findLendings(query))

	//add the submit action onclick on the right button : submitNewLoanButton
	document.querySelector("#submitNewLoanButton").addEventListener("click", Dom.submitNewLoan)

})