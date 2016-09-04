const generateLendings = () => {
	const lendings = [
		{name: 'Thorgal', date : '24/03/2014', friend: 'Thomas'},
		{name: '5é élément', date : '19/02/2015', friend: 'NaturalPad'}
	]
	lendings.map(lending => world.new(lending))
}