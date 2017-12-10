document.addEventListener('DOMContentLoaded', () => {
	deletebuttons = document.querySelectorAll(".btndelete")
	for(deletebutton of deletebuttons ) 
	{
		deletebutton.addEventListener("click" , function(){postDeleteButton(this)})
	}
})

//je supprime un utilisateur (j'aurai aimé faire un fetch DELETE ...)
postDeleteButton = (deletebutton) => {
	deletebuttonid = deletebutton.id
	id = deletebuttonid.split("deleteloan")[1]
	var form = document.createElement("form")
	form.method = "POST"
    form.action = "/admin/deleteloan/" + id
    form.style.display = "none"
    inputUsername = document.createElement("input")
    inputUsername.type = "hidden"
	inputUsername.id = "username"
	inputUsername.name = "username"
	inputUsername.value = document.querySelector("#username").innerText
	form.appendChild(inputUsername)
    document.body.appendChild(form)
    form.submit()
}