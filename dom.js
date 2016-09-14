const Dom = {}

Dom.displayFriends = (friends) => {
	friends.forEach(friend => {
		const li = document.createElement('li')
		li.innerHTML = `<a href="?friendName=${friend}">${friend}</a>`
		document.querySelector('#friends').appendChild(li)
	})
}

Dom.displayLendings = (lendings) => {
	lendings.map(lending => {
		const li = document.createElement('li')
		//way to add remove button seems to be dirty to me ... shouldn't I use the dom and addElement ?
		li.innerHTML = `${lending.name} emprunté par ${lending.friend} depuis le ${lending.date} <button type="button" onclick="remove('${lending.name}')">Remove</button>`
		document.querySelector('#lendings').appendChild(li)
	})
}