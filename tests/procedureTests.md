Procédure de test de Petits Emprunts

* vider la base de données
	** sudo mongo
	** use petitsEmprunts
	** db.users.drop()
	** db.loans.drop()
	** db.friendlists.drop()

----- test des connexions ( signup, login ) -----

* aller sur petitsEmprunts dans le navigateur : localhost:8080
* tester la connexion avec google plus
	** cliquer sur connexion avec google plus devrait créer un compte
* tester la connexion avec facebook
	** cliquer sur connexion avec facebook devrait créer un compte ( attention ne marche que si admin ou développeur sur facebook dans l'application petitsEmprunts)
* tester la création de compte local
** cliquer sur besoin de créer un compte -> arrivée sur /signup
	** tester le message d'erreur d'un mail mal formé
		*** rentrer un truc sans @ dans le champ -> message d'erreur : "That email is not correctly spelled"
	** tester la création d'un compte : saisir un email valide et un mot de passe -> message succés: We have sent you an activation email. Et dans la boîte mail un mail d'activation.
		*** tester l'activation en cliquant sur le message d'activation dans la boîte mail-> arriver dans la page /activateaccount avec message succés : Account Activated
	** tester le message d'erreur d'un mail déjà utilisé
		*** revenir sur la page de création de compte /signup et saisir à nouveau le même mail -> message d'erreur : that email is already token 
* tester le message d'erreur de connexion avec google plus
	**	après avoir créé un compte par la procédure locale en utilisant son mail @gmail.com, cliquer sur connexion avec google plus -> message d'erreur : user email already exists by local strat
* tester le message d'erreur de connexion avec facebook
	** après avoir créé un compte par la procédure locale en utilisant son mail facebook, cliquer sur connexion avec facebook -> message d'erreur : user email already exists by local strat
* tester la récupération de mot de passe.
	** cliquer sur mot de passe perdu
	** tester le message d'erreur de mail mal formé -> message d'erreur : That email is not correctly spelled
	** saisir un email bien formé d'un utilisateur -> message succès : An email has been sent. Et dans la boîte mail devrait être reçu un mail : Récupération de votre mot de Passe petitsEmprunts.
		*** tester le formulaire de changement de mote de passe
			**** dans le mail reçu cliquer sur le lien : Password change
			**** dans la page /pwdrecovery saisir un nouveau mot de passe -> retour sur index et message succès : pwd changed. Try to login
			**** se connecter avec le nouveau mot de passe. 
	
----- main features ------

* tester un emprunt
	** tester les messages d'erreur :
		*** ne pas remplir le premier champ (Quoi ?) -> message d'erreur : Précisez ce qui est emprunté
		***  ne pas remplir le deuxième champ (A qui ? - mail ) -> message d'erreur : Précisez avec qui se passe l'emprunt
		*** ne pas remplir le troisième champ (Quand ?) -> message d'erreur : Précisez quand l'emprunt a lieu
	** saisir de vraies valeurs, cliquer sur j'emprunte : -> dans Mes amis devrait apparaître le nom saisi dans "A qui", dans la liste Mes Emprunts devrait apparaître l'emprunt. Dans la base de données, création d'un élément FriendList, s'il n'existait pas avant.
* tester un prêt
	** saisir de vraies valeurs, cliquer sur je prête : -> dans Mes amis devrait apparaître le nom saisi dans "A qui", dans la liste Mes Prêts devrait apparaître l'emprunt. Dans la base de données, création d'un élément FriendList, s'il n'existait pas avant.
* tester de supprimer un emprunt
	** cliquer sur le bouton de suppression -> message : emprunt supprimé. Constater que l'emprunt n'est plus listé et a bien disparu de la bdd.
* tester de relancer quelqu'un
	** cliquer sur le bouton relancer d'un emprunt. -> /remind formulaire de relance
	** tester le formulaire de relance
		*** tester le message d'erreur pour mail non valide. Remplir le champ mail avec un mail non valide ou rien-> message d'erreur : ce n'est pas un email valide
		*** tester le message d'erreur pour un message non valide, c'est à dire un message vide -> message d'erreur : ce n'est pas un message valide.
		*** envoyer un message valide à une bonne adresse -> retour page principale /main avec message success : message de relance envoyé. A l'adresse mail renseignée, réception d'un mail de relance contenant le message saisi. En base de données, l'élément FriendList renseigne désormais le mail de l'ami à qui on a envoyé le mail. Si on revient sur relance pour ce même ami, on a directement le mail renseigné dans le formulaire de relance.

----- MonProfil features -----
* tester que l'on accède à son profil. Sur la page main, en haut à droite si je clique sur mon pseudo j'arrive sur une page : http://localhost:8080/user/[monpseudo]
* tester de changer de nom d'utilisateur.
	** remplir le formulaire avec un nouveau nom d'utilisateur et valider
		*** s'il est déjà pris -> message d'erreur 
		*** sinon -> Message succès "nom d'utilisateur changé" et désormais que ce soit sur le lien de profil ou dans la case du nom d'utilisateur, il y a le nouveau nom utilisateur
* tester de supprimer son compte.
	** saisir son mot de passe et cliquer sur "supprimer mon compte"
		*** si mauvais mot de passe -> message d'erreur "Ce n'est pas le bon mot de passe"
		*** si bon mot de passe -> redirigé vers / avec message de succès : "Compte supprimé". Le compte n'est plus présent en base de données.
* associer mon compte facebook.
	** cliquer sur "connect facebook" -> vous êtes redirigés sur vos emprunts et si vous cliquez sur votre pseudo en haut à droite, vous retrouvez votre page de profil avec dans la section facebook des informations sur votre compte fb.
	** cliquez sur "unlink" -> vous êtes redirigés sur vos emprunts et si vous cliquez sur votre pseudo en haut à droite, vous retrouvez votre page de profil avec dans la section facebook aucunes informations
* associer mon compte google
	** cliquer sur "connect Google" -> vous êtes redirigés sur vos emprunts et si vous cliquez sur votre pseudo en haut à droite, vous retrouvez votre page de profil avec dans la section Google des informations sur votre compte google.
	** cliquez sur "unlink" -> vous êtes redirigés sur vos emprunts et si vous cliquez sur votre pseudo en haut à droite, vous retrouvez votre page de profil avec dans la section Google aucunes informations

----- admin features -----

* se connecter avec le compte antoineseilles@gmail.com
* cliquer sur le lien admin dans la nav-bar
** à partir de là, vous êtes sur la page d'admin qui présente la liste des utilisateurs avec pour chacun un bouton pour désactiver / activer, un lien "emprunts" pour accéder à leurs emprunts, un bouton pour supprimer l'utilisateur.
	*** tester la suppression d'un emprunt
		**** sur leurs emprunts vous arrivez à la liste des emprunts d'un utilisateur et vous pouvez les supprimer. Si la suppression se passe bien -> message succès "loan deleted" Sinon -> message erreur : "an error occured, unable to delete loan"
	*** tester l'activation / désactivation
	*** tester la suppression d'un utilisateur
** dans la navbar il y a un lien pour revenir sur votre compte ( votre pseudo), "vos emprunts" et toujours "Daconnexion".


