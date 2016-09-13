const Dom = {}

Dom.displayFriends = (friends) => {
	friends.forEach(friend => {
		const li = document.createElement('li')
		li.innerHTML = `<a href="?friendName=${friend}">${friend}</a>`
		document.querySelector('#friends').appendChild(li)
	})
}