class World {
	new(lending) {
		const lendings = this.collection()
		lendings.push(lending)
		localStorage.setItem('lendings', JSON.stringify(lendings))
	}
	collection() {
		return JSON.parse(localStorage.getItem('lendings')) || []
	}
	findLendings(query){
		if (! query) {
			return this.collection()
		}
		//return this.collection().filter(lending => lending.state === query)
	}
}