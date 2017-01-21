class World {
	new(lending, ifok, ifnotok) {
		console.log(lending)
		var request =  new Request('/newloan', {
			method: 'POST', 
			redirect: 'follow',
			headers: new Headers({
				'Content-Type': 'application/json'
			}),
			body: JSON.stringify(lending)
		})

		fetch(request).then(function(response) {
			if(response.status == 200) 
				{
					response.json().then(function(json){
						ifok(json)
					})
				}
			else ifnotok(lending)
		 })
	}
	
	collection() {
		return JSON.parse(localStorage.getItem('lendings')) || []
	}
	
	findLendingsILoan(friendName, username, ifok, ifnotok){
		if(! friendName)
		{
			var request =  new Request(`/${username}/loans`, {
			method: 'GET', 
			redirect: 'follow',
			headers: new Headers({
				'Content-Type': 'application/json'
				})
			})
		}
		else
		{
			var request =  new Request(`/${username}/loans/${friendName}`, {
			method: 'GET', 
			redirect: 'follow',
			headers: new Headers({
				'Content-Type': 'application/json'
				})
			})
		}
		
		fetch(request).then(function(response) {
			if(response.status == 200)
			{
				response.json().then(function(json) {
					return ifok(json)
				})
			}
			else return ifnotok()
		})
		
		

/*		var collectionUser = this.collection().filter(lending => lending.loaner === username)
		if (! friendName) {
			return collectionUser
		}
		return collectionUser.filter(lending => lending.borrower === friendName)
*/
	}

	findLendingsIBorrow(friendName, username, ifok, ifnotok){
		if(! friendName)
		{
			var request =  new Request(`/${username}/borrows`, {
			method: 'GET', 
			redirect: 'follow',
			headers: new Headers({
				'Content-Type': 'application/json'
				})
			})
		}
		else
		{
			var request =  new Request(`/${username}/borrows/${friendName}`, {
			method: 'GET', 
			redirect: 'follow',
			headers: new Headers({
				'Content-Type': 'application/json'
				})
			})
		}
		
		fetch(request).then(function(response) {
			if(response.status == 200)
			{
				response.json().then(function(json) {
					return ifok(json)
				})
			}
			else return ifnotok()
		})
/*		var collectionUser = this.collection().filter(lending => lending.borrower === username)
		if (! friendName) {
			return collectionUser
		}
		return collectionUser.filter(lending => lending.loaner === friendName)
*/
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