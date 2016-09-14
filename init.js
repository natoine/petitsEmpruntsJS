const generateLendings = () => {
	const lendings = [
		{name: 'Thorgal', date : '24/03/2014', friend: 'Thomas'},
		{name: '5é élément', date : '19/02/2015', friend: 'NaturalPad'}
	]
	lendings.map(lending => world.new(lending))
}

const world = new World()

document.addEventListener('DOMContentLoaded', () => {
	const friends = world.findFriends()
	Dom.displayFriends(friends)

	const query = document.location.search.split('?friendName=')[1]
	Dom.displayLendings(world.findLendings(query))
})