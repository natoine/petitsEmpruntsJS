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
	remove(name) {
		//récupérer la liste des emprunts dont le nom n'est pas celui passé en paramètre
		const lendings = this.collection().filter( lending => lending.name !== name )
		//maintenant notre liste d'emprunts locale est cette liste filtrée
		localStorage.setItem('lendings', JSON.stringify(lendings))
	}
}