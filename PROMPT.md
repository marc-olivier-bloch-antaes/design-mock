Nous allons créer un nouveau projet. Le problème initial est le site https://www.lausanne.ch/vie-pratique/energies-et-eau/services-industriels qui est vieillissant. Le but est de faire un proof-of-concept pour le marketing pour se projeter d'à quoi pourrait ressembler une refonte moderne, responsive, mobile-friendly.

Pour cela, je te propose d'organiser plusieurs agents pour ce travail. Définis le model de chaque agent de façon adéquate à la tâche:
- Un crawler qui va prendre les fichiers utiles à cette adresse et suivre quelques pages (pas forcément de tous les faire, d'autant plus que certains demandent un login, pas besoin de reprendre celles-ci), ni de reprendre les pages du site principal lausanne.ch qui est hors scope du prototype: ne prend que la partie SIL. Stock ces fichiers localement pour pouvoir travailler dessus. Ne considère dans cette première itération que ~15-20 pages.
- Un UX designer qui va définir la charte graphique, et look & feel du nouveau site. Il faut respecter les couleurs de base et le logo, mais tu as le droit de prendre des libertés artistiques: le but avant tout est d'avoir un site moderne au look pro, c'est plus prioritaire que de respecter scrupuleusement l'actuel vieillissant. À noter que les couleurs des SIL est le noir et le rouge: le vert en plus n'est que pour ce site pour se différencier du site de base, car c'est une autre entité. Utilise donc principalement le rouge, noir et blanc.
- Un architecte qui va préparer le socle de l'application, en React
- Un développeur qui va faire le travail, page par page, de migration des pages (aucun besoin fonctionnel sinon la navigation de page en page)
- Un testeur qui vérifie le résultat

Pose toute question que tu as au préalable, puis démarre
