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
	** saisir de vraies valeurs, cliquer sur j'emprunte : -> dans Mes amis devrait apparaître le nom saisi dans "A qui", dans la liste Mes Emprunts devrait apparaître l'emprunt.
* tester un prêt
	** saisir de vraies valeurs, cliquer sur je prête : -> dans Mes amis devrait apparaître le nom saisi dans "A qui", dans la liste Mes Prêts devrait apparaître l'emprunt. 

----- admin features -----

* se connecter avec le compte antoineseilles@gmail.com
* cliquer sur le lien admin dans la nav-bar
