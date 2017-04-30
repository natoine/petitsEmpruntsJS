class World {
	new(lending, ifok, ifnotok) 
	{
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
	
	collection() 
	{
		return JSON.parse(localStorage.getItem('lendings')) || []
	}
	
	findLendingsILoan(friendName, username, ifok, ifnotok)
	{
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
	}

	findLendingsIBorrow(friendName, username, ifok, ifnotok)
	{
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
	}

	remove(id, ifok, ifnotok) 
	{
		var request =  new Request(`/loan/${id}`, {
			method: 'DELETE', 
			headers: new Headers({
				'Content-Type': 'application/json'
			}),
			body: `{"id" : "${id}" }`
		})

		fetch(request).then(function(response) {
			if(response.status == 200) ifok(id)
			else ifnotok(id)
		 })	
	}

	findFriends(username) 
	{
		var friends = new Set()
		const collectionLoaner = this.collection().filter(lending => lending.loaner === username)
		collectionLoaner.map( lending => {if(!friends.has(lending.borrower)) friends.add(lending.borrower)})
		const collectionBorrower = this.collection().filter(lending => lending.borrower === username)
		collectionBorrower.map( lending => {if(!friends.has(lending.loaner)) friends.add(lending.loaner)})
		return friends
	}

	flush() 
	{
		localStorage.clear()
	}
}