class World {
	new(lending) {
		const lendings = this.collection()
		lendings.push(lending)
		localStorage.setItem('lendings', JSON.stringify(lendings))
	}
	
	collection() {
		return JSON.parse(localStorage.getItem('lendings')) || []
	}
	
	findLendingsILoan(friendName){
		if (! friendName) {
			return this.collection()
		}
		return this.collection().filter(lending => lending.borrower === friendName)
	}

	findLendingsIBorrow(friendName){
		if (! friendName) {
			return this.collection()
		}
		return this.collection().filter(lending => lending.loaner === friendName)
	}
	
	//remove by name means you cannot lend two things with a same name in a same time. Should be checked ob remove by Id.
	remove(name) {
		//récupérer la liste des emprunts dont le nom n'est pas celui passé en paramètre
		const lendings = this.collection().filter( lending => lending.name !== name )
		//maintenant notre liste d'emprunts locale est cette liste filtrée
		localStorage.setItem('lendings', JSON.stringify(lendings))
	}

	findFriends(username) {
		var friends = new Set()
		const collectionLoaner = this.collection().filter(lending => lending.loaner === username)
		collectionLoaner.map( lending => {if(!friends.has(lending.borrower)) friends.add(lending.borrower)})
		const collectionBorrower = this.collection().filter(lending => lending.borrower === username)
		collectionBorrower.map( lending => {if(!friends.has(lending.loaner)) friends.add(lending.loaner)})
		return friends
	}

	flush() {
		localStorage.clear()
	}
}