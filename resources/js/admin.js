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
	id = deletebuttonid.split("deleteuser")[1]
	var form = document.createElement("form")
	form.method = "POST"
    form.action = "/admin/deleteuser/" + id
    form.style.display = "none"
    document.body.appendChild(form)
    form.submit()
}