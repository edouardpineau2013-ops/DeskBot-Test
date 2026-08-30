let API_URL = "https://deskbot-q7ce.onrender.com";
let modeEnceinte = false;

function changeSlide(checkbox) {
  const texte_slide = document.getElementById("texte-slide");

  modeEnceinte = checkbox.checked;

  if (modeEnceinte) {
    API_URL = "https://api.gogekko.fr";
    texte_slide.textContent = "Enceinte DeskBot";
  } else {
    API_URL = "https://deskbot-q7ce.onrender.com";
    texte_slide.textContent = "Serveur";
  }

  // Actualiser immédiatement Micro et Audio
  if (dernierEtatDeskBot) {
    afficherEtatDeskBot(dernierEtatDeskBot);
  }
}

let TOKEN =
  localStorage.getItem("deskbot_token") ||
  sessionStorage.getItem("deskbot_token");

function afficherLogin() {
  document.getElementById("popup-login").style.display = "flex";
}

function gererErreur401(response) {
  if (response.status === 401) {
    console.warn("⚠️ Token refusé par le serveur.");

    localStorage.removeItem("deskbot_token");
    sessionStorage.removeItem("deskbot_token");

    TOKEN = null;

    afficherLogin();

    return true;
  }

  return false;
}

if (!TOKEN) {
  afficherLogin();
}

function reinitialiserConnexion() {
  localStorage.removeItem("deskbot_token");
  sessionStorage.removeItem("deskbot_token");
  TOKEN = null;
  afficherLogin();
}

function seConnecter() {
  const motDePasse = document.getElementById("mot-de-passe").value;
  const seSouvenir = document.getElementById("checkbox-se-souvenir").checked;

  fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mot_de_passe: motDePasse }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.succes) {
        TOKEN = data.token;
        if (seSouvenir) {
          localStorage.setItem("deskbot_token", TOKEN);
        } else {
          sessionStorage.setItem("deskbot_token", TOKEN);
        }
        document.getElementById("popup-login").style.display = "none";
        chargerChronometre();
      } else {
        document.getElementById("erreur-login").textContent =
          "Mot de passe incorrect.";
      }
    });
}

if (!TOKEN) {
  afficherLogin();
}

function envoyerCommande() {
  const commande = document.getElementById("commande").value;

  if (!TOKEN) {
    afficherLogin();
    return;
  }

  fetch(`${API_URL}/commande`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({
      texte: commande,
    }),
  })
    .then((response) => {
      if (gererErreur401(response)) {
        return null;
      }

      return response.json();
    })
    .then((data) => {
      if (!data) return;

      document.getElementById("reponse").textContent =
        "Réponse: " + data.reponse;

      let reponse = data.reponse;

      afficherReponse(commande, reponse);

      chargerChronometre();
    })
    .catch((erreur) => {
      console.error("Erreur commande :", erreur);
    });
}

function envoyerCommandePrédéfinie(commande) {
  fetch(`${API_URL}/commande`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({
      texte: commande,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      document.getElementById("reponse").textContent =
        "Réponse: " + data.reponse;

      let reponse = data.reponse;

      afficherReponse(commande, reponse);

      chargerChronometre();
    });
}

function afficherReponse(commande, reponse) {
  if (
    commande.includes("stats youtube") ||
    commande.includes("youtube") ||
    commande.includes("statistiques") ||
    commande.includes("Statistiques YouTube")
  ) {
    document.getElementById("reponse-stats-yt").textContent = reponse;
  } else if (
    commande.includes("recherche") ||
    commande.includes("google") ||
    commande.includes("Recherche sur google")
  ) {
    document.getElementById("reponse-recherche").textContent = reponse;
  } else if (
    commande.includes("calculer") ||
    commande.includes("trajet") ||
    commande.includes("Calculer le trajet")
  ) {
    document.getElementById("reponse-trajet").textContent = reponse;
  } else if (
    commande.includes("demande") ||
    commande.includes("IA") ||
    commande.includes("Demande à l'IA")
  ) {
    document.getElementById("reponse-question-ia").textContent = reponse;
  } else if (commande.includes("convertis") || commande.includes("Convertis")) {
    document.getElementById("reponse-convertir").textContent = reponse;
  } else if (commande.includes("traduis") || commande.includes("Traduis")) {
    document.getElementById("reponse-traduction").textContent = reponse;
  } else if (
    commande.includes("hasard") ||
    commande.includes("aléatoire") ||
    commande.includes("pile") ||
    commande.includes("face") ||
    commande.includes("nombre") ||
    commande.includes("choix")
  ) {
    document.getElementById("reponse-hasard").textContent = reponse;
  } else if (
    commande.includes("résume") ||
    commande.includes("resume") ||
    commande.includes("résumer") ||
    commande.includes("resumer") ||
    commande.includes("résume ce texte: ")
  ) {
    document.getElementById("reponse-resumer").textContent = reponse;
  } else if (
    commande.includes("corrige") ||
    commande.includes("corriger") ||
    commande.includes("Corrige ce texte")
  ) {
    document.getElementById("reponse-corriger").textContent = reponse;
  }
}

let derniereReponseDeskBot = "";

function surveillerReponseDeskBot() {
  if (!TOKEN) {
    return;
  }

  fetch(`${API_URL}/etat`, {
    headers: {
      Authorization: "Bearer " + TOKEN,
    },
  })
    .then((r) => r.json())
    .then((data) => {
      const reponse = data.reponse;

      if (!reponse) {
        return;
      }

      // Ne pas afficher plusieurs fois la même réponse
      if (reponse === derniereReponseDeskBot) {
        return;
      }

      derniereReponseDeskBot = reponse;

      // AFFICHER LA RÉPONSE DU MODE VOCAL DANS #reponse
      document.getElementById("reponse").textContent = "Réponse : " + reponse;
    })
    .catch((erreur) => {
      console.error("Erreur récupération réponse DeskBot :", erreur);

      afficherEtatDeskBot("hors_ligne");
    });
}

setInterval(surveillerReponseDeskBot, 1000);

function rechercherCommandes() {
  const input = document.getElementById("recherche-commandes");

  if (!input) {
    return;
  }

  const recherche = input.value.toLowerCase().trim();

  const classes = document.querySelectorAll(".classe-commandes");

  classes.forEach((classe) => {
    const commandes = classe.querySelectorAll(".commande-prédéfinie");

    let commandeTrouvee = false;

    commandes.forEach((commande) => {
      const texteElement = commande.querySelector(".commande-texte");

      if (!texteElement) {
        return;
      }

      const texte = texteElement.textContent.toLowerCase().trim();

      if (recherche === "" || texte.includes(recherche)) {
        commande.classList.remove("commande-cachee");

        commandeTrouvee = true;
      } else {
        commande.classList.add("commande-cachee");
      }
    });

    /*
     * Si aucune commande de la classe
     * ne correspond, on cache la classe.
     */

    if (commandeTrouvee) {
      classe.classList.remove("classe-cachee");
    } else {
      classe.classList.add("classe-cachee");
    }
  });
}

function ouvrirMusique() {
  document.getElementById("popup-musique").style.display = "flex";
}

function fermerMusique() {
  document.getElementById("popup-musique").style.display = "none";
}

function definirVolume() {
  const volume = document.getElementById("input-volume").value;

  envoyerCommandePrédéfinie("mets le volume à " + volume);
}

function ouvrirMeteo() {
  document.getElementById("popup-meteo").style.display = "flex";
}

function fermerMeteo() {
  document.getElementById("popup-meteo").style.display = "none";
}

function envoyerMeteo() {
  const ville = document.getElementById("ville").value;
  const date = document.getElementById("date").value;

  fetch(`${API_URL}/commande`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({
      texte: "quelle est la météo à " + ville + " " + date,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      document.getElementById("reponse").textContent =
        "Réponse: " + data.reponse;
      document.getElementById("reponse-meteo").textContent =
        "Réponse: " + data.reponse;
    });
}

let departChrono = null;
let chronoActif = false;
let pauseTotale = 0;
let tempsPause = null;
let enMarche = false;
let enPause = false;
let secondes = 0;

function chargerChronometre() {
  fetch(`${API_URL}/chronometre`, {
    headers: { Authorization: "Bearer " + TOKEN },
  })
    .then((response) => response.json())
    .then((data) => {
      departChrono = data.depart;
      pauseTotale = data.pause_totale;
      tempsPause = data.temps_pause;
      enMarche = data.en_marche;
      enPause = data.en_pause;
      secondes = data.secondes;

      const bouton = document.getElementById("PausePlay");

      if (enPause) {
        bouton.src = "img/play.svg";
      } else {
        bouton.src = "img/pause.svg";
      }
    });
}

chargerChronometre();

setInterval(() => {
  if (enMarche && !enPause) {
    secondes++;
  }

  let minutes = Math.floor(secondes / 60);
  let secondesRestantes = secondes % 60;

  document.getElementById("chrono").textContent =
    `Chronomètre : ${minutes} min ${secondesRestantes} sec`;
}, 1000);

function PausePlayChrono() {
  let commande;

  if (enPause) {
    commande = "reprends le chronomètre";
  } else {
    commande = "pause le chronomètre";
  }

  fetch(`${API_URL}/commande`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({
      texte: commande,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      document.getElementById("reponse").textContent =
        "Réponse : " + data.reponse;

      chargerChronometre();
    });
}

function StopChrono() {
  envoyerCommandePrédéfinie("stop le chronomètre");
}

function RepeatChrono() {
  envoyerCommandePrédéfinie("remets le chronomètre à zéro");
}

function GoChrono() {
  envoyerCommandePrédéfinie("démarre le chronomètre");
}

document.getElementById("commande").addEventListener("keydown", (event) => {
  if (event.key === "Enter") envoyerCommande();
});

function ouvrirMinuteur() {
  document.getElementById("popup-set-minuteur").style.display = "flex";
}

function fermerMinuteur() {
  document.getElementById("popup-set-minuteur").style.display = "none";
}

function SetMinuteur() {
  ouvrirMinuteur();
}

function ajusterMinuteur(unite, delta) {
  const champ = document.getElementById(
    unite === "minutes" ? "minuteur-minutes" : "minuteur-secondes",
  );
  let valeur = parseInt(champ.value, 10) || 0;
  valeur += delta;

  if (valeur < 0) valeur = 0;
  if (unite === "secondes" && valeur > 59) valeur = 59;

  champ.value = valeur;
}

function demarrerMinuteurDepuisPopup() {
  const minutes =
    parseInt(document.getElementById("minuteur-minutes").value, 10) || 0;
  const secondes =
    parseInt(document.getElementById("minuteur-secondes").value, 10) || 0;

  envoyerCommandePrédéfinie(
    `démarre un minuteur de ${minutes} minutes et ${secondes} secondes`,
  );
  fermerMinuteur();
  setTimeout(chargerMinuteur, 300); // laisse le temps au serveur de traiter la commande
}

let enMarcheMinuteur = false;
let enPauseMinuteur = false;
let secondesMinuteur = 0;
let notificationEnvoyee = false;
let minuteurActifPrecedent = false;

function afficherMinuteur() {
  let minutes = Math.floor(secondesMinuteur / 60);
  let secondesRestantes = secondesMinuteur % 60;
  document.getElementById("minuteur-texte").textContent =
    `Minuteur : ${minutes} min ${secondesRestantes} sec`;
}

function chargerMinuteur() {
  if (!TOKEN) {
    return;
  }

  fetch(`${API_URL}/minuteur`, {
    headers: {
      Authorization: "Bearer " + TOKEN,
    },
  })
    .then((response) => {
      if (gererErreur401(response)) {
        return null;
      }

      return response.json();
    })
    .then((data) => {
      if (!data) return;

      const nouveauDemarrage = data.actif && !minuteurActifPrecedent;

      minuteurActifPrecedent = data.actif;

      enMarcheMinuteur = data.actif;
      enPauseMinuteur = data.en_pause;
      secondesMinuteur = data.secondes;

      if (nouveauDemarrage) {
        notificationEnvoyee = false;
      }

      const bouton = document.getElementById("PausePlayMinuteur");

      bouton.src = enPauseMinuteur ? "img/play.svg" : "img/pause.svg";

      afficherMinuteur();
    })
    .catch((erreur) => {
      console.error("Erreur minuteur :", erreur);
    });
}

chargerMinuteur();

if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

setInterval(() => {
  if (enMarcheMinuteur && !enPauseMinuteur) {
    if (secondesMinuteur > 0) {
      secondesMinuteur--;
    } else if (!notificationEnvoyee) {
      notificationEnvoyee = true;
      enMarcheMinuteur = false;

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🔔 Minuteur terminé");
      } else {
        document.getElementById("reponse").textContent = "🔔 Minuteur terminé";
      }
    }
  }

  afficherMinuteur();
}, 1000);

// Petite synchronisation périodique avec le serveur, utile si le minuteur
// est démarré ou arrêté à la voix pendant que le site reste ouvert
setInterval(chargerMinuteur, 5000);

function PausePlayMinuteur() {
  let commande = enPauseMinuteur ? "reprends le minuteur" : "pause le minuteur";

  fetch(`${API_URL}/commande`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({ texte: commande }),
  })
    .then((r) => r.json())
    .then((data) => {
      document.getElementById("reponse").textContent =
        "Réponse : " + data.reponse;
      chargerMinuteur();
    });
}

function RepeatMinuteur() {
  envoyerCommandePrédéfinie("arrête le minuteur");
  chargerMinuteur();
}

let alarmeActive = false;
let dernierEtatAlarme = null;

function chargerAlarme() {
  fetch(`${API_URL}/alarme`, {
    headers: { Authorization: "Bearer " + TOKEN },
  })
    .then((r) => r.json())
    .then((data) => {
      dernierEtatAlarme = data;
      alarmeActive = data.existe && data.active;

      let texte;
      if (!data.existe || data.jours_restants === null) {
        texte = "Alarme : --";
      } else if (data.jours_restants > 0) {
        texte = `Alarme : dans ${data.jours_restants}j ${data.heures_restantes}h${String(data.minutes_restantes).padStart(2, "0")}`;
      } else {
        texte = `Alarme : dans ${data.heures_restantes}h${String(data.minutes_restantes).padStart(2, "0")}`;
      }

      document.getElementById("alarme-texte").textContent = texte;

      const cloche = document.getElementById("ActiveSlashAlarme");
      cloche.src = alarmeActive ? "img/bell-active.svg" : "img/bell-slash.svg";
    });
}

chargerAlarme();
setInterval(chargerAlarme, 30000);

function SetAlarme() {
  if (dernierEtatAlarme && dernierEtatAlarme.existe) {
    document.getElementById("alarme-heure").value = dernierEtatAlarme.heure;
    document.getElementById("alarme-minute").value = dernierEtatAlarme.minute;
    document.querySelectorAll(".jour-checkbox").forEach((cb) => {
      cb.checked = dernierEtatAlarme.jours.includes(parseInt(cb.value, 10));
    });
  } else {
    document.getElementById("alarme-heure").value = 0;
    document.getElementById("alarme-minute").value = 0;
    document
      .querySelectorAll(".jour-checkbox")
      .forEach((cb) => (cb.checked = false));
  }

  document.getElementById("popup-set-alarme").style.display = "flex";
}

function fermerReglageAlarme() {
  document.getElementById("popup-set-alarme").style.display = "none";
}

function ajusterAlarme(unite, delta) {
  const champ = document.getElementById(
    unite === "heure" ? "alarme-heure" : "alarme-minute",
  );
  let valeur = parseInt(champ.value, 10) || 0;
  valeur += delta;

  const max = unite === "heure" ? 23 : 59;
  if (valeur < 0) valeur = max;
  if (valeur > max) valeur = 0;

  champ.value = valeur;
}

function enregistrerAlarme() {
  const heure =
    parseInt(document.getElementById("alarme-heure").value, 10) || 0;
  const minute =
    parseInt(document.getElementById("alarme-minute").value, 10) || 0;

  const nomsJours = [
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
    "samedi",
    "dimanche",
  ];
  const joursCoches = Array.from(
    document.querySelectorAll(".jour-checkbox:checked"),
  ).map((cb) => nomsJours[parseInt(cb.value, 10)]);

  let texte = `programme une alarme à ${heure}h${String(minute).padStart(2, "0")}`;
  if (joursCoches.length > 0) {
    texte += " " + joursCoches.join(" ");
  }

  envoyerCommandePrédéfinie(texte);
  fermerReglageAlarme();
  setTimeout(chargerAlarme, 300);
}

function ActiveSlashAlarme() {
  const commande = alarmeActive ? "eteins l'alarme" : "allume l'alarme";
  envoyerCommandePrédéfinie(commande);
  setTimeout(chargerAlarme, 300);
}

function supprimerAlarme() {
  envoyerCommandePrédéfinie("supprime l'alarme");
  setTimeout(chargerAlarme, 300);
}

function sonnerieAlarme() {
  document.getElementById("popup-sonnerie-alarme").style.display = "flex";
}

function fermerSonnerieAlarme() {
  document.getElementById("popup-sonnerie-alarme").style.display = "none";
}

function enregistrerSonnerie() {
  const choix = document.querySelector('input[name="sonnerie"]:checked');
  if (!choix) return;

  const numero = choix.value.replace("alarme", "");
  envoyerCommandePrédéfinie(`choisis la sonnerie alarme ${numero}`);
  fermerSonnerieAlarme();
}

function ouvrirMails() {
  document.getElementById("popup-mails").style.display = "flex";
  document.getElementById("formulaire-envoi-mail").style.display = "none";
  document.getElementById("result-mail").style.display = "none";
  chargerMails();
}

function fermerMails() {
  document.getElementById("popup-mails").style.display = "none";
}

function chargerMails() {
  fetch(`${API_URL}/mails`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  })
    .then((r) => r.json())
    .then((data) => {
      const texteNonLus =
        data.non_lus === 0
          ? "Vous n'avez aucun mail non lu."
          : data.non_lus === 1
            ? "Vous avez 1 mail non lu."
            : `Vous avez ${data.non_lus} mails non lus.`;

      document.getElementById("mails-non-lus").textContent = texteNonLus;

      const conteneur = document.getElementById("mail");
      conteneur.innerHTML = "";

      if (data.mails.length === 0) {
        conteneur.innerHTML = "<p class='indication'>Aucun mail non lu.</p>";
        return;
      }

      data.mails.forEach((mail) => {
        conteneur.innerHTML += `
                <div class="mail-item">
                    <p><strong>Expéditeur :</strong> ${mail.expediteur}</p>
                    <p><strong>Objet :</strong> ${mail.objet}</p>
                </div>
            `;
      });
    })
    .catch(() => {
      document.getElementById("mails-non-lus").textContent =
        "Impossible de récupérer les mails.";

      document.getElementById("mail").innerHTML = "";
    });
}

function ouvrirImportCours() {
  document.getElementById("popup-import-cours").style.display = "flex";
}

function fermerImportCours() {
  document.getElementById("popup-import-cours").style.display = "none";
}

function envoyerImportCours() {
  const matiere = document.getElementById("import-matiere").value;
  const chapitre = document.getElementById("import-chapitre").value;
  const fichier = document.getElementById("import-fichier").files[0];

  if (!matiere || !chapitre || !fichier) {
    document.getElementById("import-cours-statut").textContent =
      "Remplis tous les champs.";
    return;
  }

  const donnees = new FormData();
  donnees.append("matiere", matiere);
  donnees.append("chapitre", chapitre);
  donnees.append("fichier", fichier);
  document.getElementById("import-cours-statut").textContent = `Chargement...`;

  fetch(`${API_URL}/cours/importer`, {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN },
    body: donnees,
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.succes) {
        document.getElementById("import-cours-statut").textContent =
          `Importé (${data.caracteres_extraits} caractères extraits).`;
      } else {
        document.getElementById("import-cours-statut").textContent =
          "Erreur : " + data.erreur;
      }
    });
}

function ouvrirStatsYoutube() {
  document.getElementById("popup-stats-yt").style.display = "flex";
}

function fermerStatsYoutube() {
  document.getElementById("popup-stats-yt").style.display = "none";
}

function envoyerStatsYoutube() {
  const chaine = document.getElementById("stats-yt-chaine").value;
  envoyerCommandePrédéfinie(`Statistiques YouTube de ${chaine}`);
}

function ouvrirRecherche() {
  document.getElementById("popup-recherche").style.display = "flex";
}

function fermerRecherche() {
  document.getElementById("popup-recherche").style.display = "none";
}

function envoyerRecherche() {
  const texte = document.getElementById("recherche-texte").value;
  envoyerCommandePrédéfinie(`Recherche sur google "${texte}"`);
}

function ouvrirTrajet() {
  document.getElementById("popup-trajet").style.display = "flex";
}

function fermerTrajet() {
  document.getElementById("popup-trajet").style.display = "none";
}

function envoyerTrajet() {
  const depart = document.getElementById("trajet-depart").value;
  const destination = document.getElementById("trajet-destination").value;
  const moyen = document.getElementById("trajet-moyen").value;
  envoyerCommandePrédéfinie(
    `Calculer le trajet de ${depart} à ${destination} en ${moyen}`,
  );
}

function ouvrirPronote() {
  document.getElementById("popup-pronote").style.display = "flex";
}

function fermerPronote() {
  document.getElementById("popup-pronote").style.display = "none";
}

let dernierProfilRevision = null;

function ouvrirRevisionAccueil() {
  document.getElementById("popup-revision-accueil").style.display = "flex";
  chargerProfilRevision();
}

function fermerRevisionAccueil() {
  document.getElementById("popup-revision-accueil").style.display = "none";
}

function chargerProfilRevision() {
  fetch(`${API_URL}/revision/profil`, {
    headers: { Authorization: "Bearer " + TOKEN },
  })
    .then((r) => r.json())
    .then((data) => {
      dernierProfilRevision = data;

      document.getElementById("revision-points-total").textContent =
        data.points;

      document.getElementById("revision-serie-total").textContent =
        data.serie || 0;

      document.getElementById("bouton-ouvrir-boite").disabled =
        data.points < 20;
    });
}

function ouvrirStatistiquesRevision() {
  document.getElementById("popup-statistiques-revision").style.display = "flex";

  fetch(`${API_URL}/revision/profil`, {
    headers: { Authorization: "Bearer " + TOKEN },
  })
    .then((r) => r.json())
    .then((data) => {
      const conteneurStats = document.getElementById("revision-stats-matieres");
      conteneurStats.innerHTML = "";

      for (const matiere in data.stats_matieres) {
        const s = data.stats_matieres[matiere];
        const pourcentage =
          s.tentatives > 0 ? Math.round((100 * s.correctes) / s.tentatives) : 0;
        conteneurStats.innerHTML += `<p>${matiere} : ${pourcentage}%</p>`;
      }

      const conteneurCollection = document.getElementById(
        "revision-collection",
      );
      conteneurCollection.innerHTML = "";

      data.collection.forEach((entree) => {
        const image = entree.obtenu
          ? `img/profs/${entree.slug}.png`
          : `img/profs/silhouette-inconnue.png`;

        conteneurCollection.innerHTML += `
                    <div class="carte-collection rarete-${entree.rarete}">
                        <img src="${image}" class="image-collection">
                        <p>${entree.obtenu ? entree.nom : "???"}</p>
                    </div>
                `;
      });
    });
}

function fermerStatistiquesRevision() {
  document.getElementById("popup-statistiques-revision").style.display = "none";
}

function ouvrirBoiteMystere() {
  document.getElementById("popup-ouverture-boite").style.display = "flex";

  const animation = document.getElementById("animation-ouverture-boite");
  const resultatTexte = document.getElementById("resultat-ouverture-boite");
  const boutonFermer = document.getElementById("bouton-fermer-resultat");
  const iconeProfObtenu = document.getElementById("icone-prof-obtenu");

  animation.style.display = "block";

  resultatTexte.textContent = "";
  iconeProfObtenu.innerHTML = "";
  iconeProfObtenu.className = "";

  boutonFermer.style.display = "none";

  animation.currentTime = 0;
  animation.play();

  fetch(`${API_URL}/revision/boite`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + TOKEN,
    },
  })
    .then((r) => r.json())
    .then((data) => {
      const afficherResultat = () => {
        animation.style.display = "none";

        if (!data.succes) {
          resultatTexte.textContent =
            "Pas assez de points pour ouvrir une boîte.";

          iconeProfObtenu.className = "sans-skin";
          iconeProfObtenu.textContent = "🥲";
        } else if (data.type === "skin") {
          resultatTexte.textContent = `Nouveau skin obtenu : ${data.prof} (${data.rarete}) !`;

          iconeProfObtenu.className = `rarete-${data.rarete}`;

          iconeProfObtenu.innerHTML = `<img src="img/profs/${data.slug}.png" class="image-collection">`;
        } else if (data.type === "doublon") {
          resultatTexte.textContent = `Tu avais déjà ${data.prof} : +${data.points_gagnes} points bonus.`;

          iconeProfObtenu.className = `rarete-${data.rarete}`;

          iconeProfObtenu.innerHTML = `<img src="img/profs/${data.slug}.png" class="image-collection">`;
        } else {
          resultatTexte.textContent = `Pas de skin cette fois : +${data.points_gagnes} points.`;

          iconeProfObtenu.className = "sans-skin";
          iconeProfObtenu.textContent = "🥲";
        }

        boutonFermer.style.display = "inline-block";

        chargerProfilRevision();
      };

      if (animation.ended) {
        afficherResultat();
      } else {
        animation.onended = afficherResultat;
      }
    });
}

function fermerOuvertureBoite() {
  document.getElementById("popup-ouverture-boite").style.display = "none";
}

function demarrerRevisionDepuisPopup() {
  const matiere = document.getElementById("revision-matiere").value;
  const chapitre = document.getElementById("revision-chapitre").value;

  if (!matiere || !chapitre) return;

  fetch(`${API_URL}/revision/demarrer`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },

    body: JSON.stringify({
      matiere: matiere,
      chapitre: chapitre,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (!data.succes) {
        alert(data.erreur);
        return;
      }

      revisionIndex = 0;
      revisionTotal = data.nb_questions;
      premierEssai = true;
      revisionScore = 0;

      fermerRevisionAccueil();

      ouvrirRevision();

      afficherQuestion(data.question, data.stats);
    });
}

let revisionIndex = 0;
let revisionTotal = 0;
let premierEssai = true;
let revisionScore = 0;

function ouvrirRevision() {
  document.getElementById("popup-revision").style.display = "flex";
}

function fermerRevision() {
  document.getElementById("popup-revision").style.display = "none";
}

function afficherQuestion(question, stats) {
  premierEssai = revisionIndex + 1 < 6;

  document.getElementById("revision-question").textContent = question;

  document.getElementById("revision-reponse").value = "";

  const barre = document.getElementById("revision-progression-barre");

  const nbQuestionsIncorrectes = stats.nb_incorrectes;
  const revisionNumero = document.getElementById("revision-numero");

  if (revisionIndex + 1 < 6) {
    document.getElementById("revision-numero").textContent =
      `Question: ${revisionIndex + 1} / ${revisionTotal}`;
    barre.style.backgroundColor = "#00ff00";
    revisionNumero.style.color = "#00ff00";
  } else {
    document.getElementById("revision-numero").textContent =
      `Rattrapage: ${revisionIndex - 4} / ${nbQuestionsIncorrectes}`;
    barre.style.backgroundColor = "#ff0000";
    revisionNumero.style.color = "#ff0000";
  }

  let pourcentage;

  if (revisionIndex < 5) {
    pourcentage = ((revisionIndex + 1) / revisionTotal) * 100;
  } else {
    const indexRattrapage = revisionIndex - revisionTotal + 1;
    pourcentage = (indexRattrapage / nbQuestionsIncorrectes) * 100;
  }

  barre.style.transition = "width .45s ease";
  barre.style.width = pourcentage + "%";

  revisionScore =
    stats.nb_correctes + (stats.nb_incorrectes - nbQuestionsIncorrectes);
}

document
  .getElementById("revision-valider")
  .addEventListener("click", validerReponseRevision);

function validerReponseRevision() {
  const bouton = document.getElementById("revision-valider");

  bouton.disabled = true;

  const reponse = document.getElementById("revision-reponse").value.trim();

  if (!reponse) {
    bouton.disabled = false;
    return;
  }

  fetch(`${API_URL}/revision/repondre`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },

    body: JSON.stringify({
      reponse: reponse,
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      afficherFeedback(data);
    });
}

function afficherFeedback(data) {
  const panneau = document.getElementById("revision-resultat");

  const icone = document.getElementById("revision-resultat-icone");

  const titre = document.getElementById("revision-resultat-titre");

  const explication = document.getElementById("revision-resultat-explication");

  panneau.classList.remove("correct");
  panneau.classList.remove("incorrect");
  const barre = document.getElementById("revision-progression-barre");

  if (data.correcte) {
    panneau.classList.add("correct");
    icone.textContent = "✅";
    titre.textContent = "Bonne réponse !";
    if (premierEssai) {
      afficherGainOrbes(1);
    }
  } else {
    premierEssai = false;

    panneau.classList.add("incorrect");
    icone.textContent = "❌";
    titre.textContent = "Ce n'est pas ça";
  }

  explication.textContent = data.explication;

  panneau.classList.add("visible");

  // On prépare le bouton
  document.getElementById("revision-continuer").style.display = "block";

  if (data.termine) {
    document.getElementById("revision-continuer").textContent =
      "Voir le résultat";
  } else {
    document.getElementById("revision-continuer").textContent = "Continuer";
  }

  // On garde la réponse pour après le clic
  window.feedbackRevision = data;
}

function afficherGainOrbes(nb) {
  const gain = document.getElementById("gain-orbes");

  gain.textContent = "+" + nb;

  gain.classList.remove("cache");

  setTimeout(() => {
    gain.classList.add("cache");
  }, 800);
}

function afficherFinRevision(stats) {
  document.getElementById("revision-note-image").src =
    `img/notes/${stats.note_sur_5}_sur_5.png`;

  const commentaires = [
    "Il va falloir relire le cours 📚",
    "Encore un petit effort !",
    "Pas mal !",
    "Très bon travail !",
    "Excellent !",
    "Parfait, tu maîtrises ce chapitre !",
  ];

  document.getElementById("revision-commentaire").textContent =
    commentaires[stats.note_sur_5];

  document.getElementById("revision-score").textContent = `+${revisionScore}`;

  document.getElementById("popup-fin-revision").style.display = "flex";

  const bouton = document.getElementById("revision-valider");

  bouton.disabled = false;
}

function fermerFinRevision() {
  document.getElementById("popup-fin-revision").style.display = "none";
  chargerProfilRevision();
}

function questionSuivanteRevision() {
  const data = window.feedbackRevision;

  const panneau = document.getElementById("revision-resultat");

  panneau.classList.remove("visible");

  setTimeout(() => {
    if (data.termine) {
      fermerRevision();

      afficherFinRevision(data.stats);

      return;
    }

    revisionIndex++;

    afficherQuestion(data.question, data.stats);

    document.getElementById("revision-valider").disabled = false;
  }, 300);
}

// =========================================================
// TO-DO LIST
// =========================================================

function ouvrirTodo() {
  document.getElementById("popup-todo").style.display = "flex";

  chargerTodo();

  setTimeout(() => {
    document.getElementById("todo-input").focus();
  }, 100);
}

function fermerTodo() {
  document.getElementById("popup-todo").style.display = "none";
}

/* ---------------------------------------------------------
   Charger les tâches
   --------------------------------------------------------- */

function chargerTodo() {
  fetch(`${API_URL}/taches`, {
    headers: {
      Authorization: "Bearer " + TOKEN,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      afficherTodo(data.taches);
    })
    .catch((error) => {
      console.error("Erreur chargement To-Do :", error);

      document.getElementById("todo-liste").innerHTML = `<p class="todo-vide">
                Impossible de récupérer les tâches.
            </p>`;
    });
}

/* ---------------------------------------------------------
   Afficher les tâches
   --------------------------------------------------------- */

function afficherTodo(taches) {
  const liste = document.getElementById("todo-liste");

  liste.innerHTML = "";

  if (!taches || taches.length === 0) {
    liste.innerHTML = `
            <p class="todo-vide">
                🎉 Aucune tâche ! Ta liste est vide.
            </p>
        `;

    return;
  }

  taches.forEach((tache) => {
    const element = document.createElement("div");

    element.className = "todo-tache" + (tache.terminee ? " terminee" : "");

    element.innerHTML = `

            <input
                type="checkbox"
                class="todo-checkbox"
                ${tache.terminee ? "checked" : ""}
                onchange="changerEtatTache(${tache.id}, this.checked)"
            >

            <span class="todo-texte">
                ${echapperHTML(tache.texte)}
            </span>

            <button
                class="todo-supprimer"
                onclick="supprimerTacheDepuisSite(${tache.id})"
                title="Supprimer"
            >
                🗑️
            </button>

        `;

    liste.appendChild(element);
  });
}

/* ---------------------------------------------------------
   Ajouter une tâche
   --------------------------------------------------------- */

function ajouterTacheDepuisSite() {
  const input = document.getElementById("todo-input");

  const texte = input.value.trim();

  if (!texte) {
    afficherMessageTodo("Écris une tâche avant de l'ajouter.");
    return;
  }

  envoyerCommandePrédéfinie(`ajoute "${texte}"`);
  setTimeout(chargerTodo, 300);
}

/* ---------------------------------------------------------
   Terminer / réactiver une tâche
   --------------------------------------------------------- */

function changerEtatTache(id, terminee) {
  const commande = terminee
    ? `termine la tâche ${id}`
    : `annule la tâche ${id}`;

  envoyerCommandePrédéfinie(commande);
  setTimeout(chargerTodo, 300);
}

/* ---------------------------------------------------------
   Supprimer une tâche
   --------------------------------------------------------- */

function supprimerTacheDepuisSite(id) {
  envoyerCommandePrédéfinie(`supprime la tâche ${id}`);
  setTimeout(chargerTodo, 300);
}

/* ---------------------------------------------------------
   Supprimer les tâches terminées
   --------------------------------------------------------- */

function supprimerTachesTerminees() {
  envoyerCommandePrédéfinie("supprime les tâches terminées");
  setTimeout(chargerTodo, 300);
}

/* ---------------------------------------------------------
   Vider toute la To-Do
   --------------------------------------------------------- */

function viderTodoDepuisSite() {
  envoyerCommandePrédéfinie("vide la liste de tâches");
  setTimeout(chargerTodo, 300);
}

/* ---------------------------------------------------------
   Message
   --------------------------------------------------------- */

function afficherMessageTodo(message) {
  const element = document.getElementById("todo-message");

  element.textContent = message;

  clearTimeout(window.todoMessageTimeout);

  window.todoMessageTimeout = setTimeout(() => {
    element.textContent = "";
  }, 2500);
}

/* ---------------------------------------------------------
   Sécurité HTML
   --------------------------------------------------------- */

function echapperHTML(texte) {
  const div = document.createElement("div");

  div.textContent = texte;

  return div.innerHTML;
}

/* ---------------------------------------------------------
   Entrée clavier
   --------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("todo-input");

  if (!input) return;

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      ajouterTacheDepuisSite();
    }
  });
});

function ouvrirQuestionIA() {
  document.getElementById("popup-question-ia").style.display = "flex";
}

function fermerQuestionIA() {
  document.getElementById("popup-question-ia").style.display = "none";
}

function questionIA() {
  const question = document.getElementById("question-ia-input").value;
  envoyerCommandePrédéfinie(`Demande à l'IA ${question}`);
}

function ouvrirRepeter() {
  document.getElementById("popup-repeter").style.display = "flex";
}

function fermerRepeter() {
  document.getElementById("popup-repeter").style.display = "none";
}

function repeter() {
  const repeter = document.getElementById("repeter-input").value;
  envoyerCommandePrédéfinie(`Répète ${repeter}`);
}

// =========================================================
// CALCULATRICE
// =========================================================

let calculatriceExpression = "";

function ouvrirCalculatrice() {
  document.getElementById("popup-calculatrice").style.display = "flex";

  calculatriceExpression = "";
  afficherCalculatrice();
}

function fermerCalculatrice() {
  document.getElementById("popup-calculatrice").style.display = "none";
}

function afficherCalculatrice() {
  const affichage = document.getElementById("calculatrice-affichage");

  if (!calculatriceExpression) {
    affichage.textContent = "0";
    return;
  }

  affichage.textContent = calculatriceExpression
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/\./g, ",");
}

function calculatriceEntrer(valeur) {
  if (calculatriceExpression === "Erreur") {
    calculatriceExpression = "";
  }

  calculatriceExpression += valeur;

  afficherCalculatrice();
}

function calculatriceEffacer() {
  calculatriceExpression = "";

  afficherCalculatrice();
}

function calculatriceSupprimer() {
  calculatriceExpression = calculatriceExpression.slice(0, -1);

  afficherCalculatrice();
}

function calculatricePourcentage() {
  if (!calculatriceExpression) return;

  calculatriceExpression += "%";

  afficherCalculatrice();
}

function calculatriceCalculer() {
  if (!calculatriceExpression) return;

  try {
    let expression = calculatriceExpression;

    // Remplace les pourcentages par /100
    expression = expression.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

    // Vérification des caractères autorisés
    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
      throw new Error("Expression invalide");
    }

    // Calcul
    const resultat = Function('"use strict"; return (' + expression + ")")();

    if (!Number.isFinite(resultat)) {
      throw new Error("Calcul impossible");
    }

    calculatriceExpression = String(
      Math.round((resultat + Number.EPSILON) * 100000000) / 100000000,
    );

    afficherCalculatrice();
  } catch (erreur) {
    calculatriceExpression = "Erreur";

    afficherCalculatrice();

    setTimeout(() => {
      calculatriceExpression = "";
      afficherCalculatrice();
    }, 1000);
  }
}

const unitésConversion = {
  longueur: {
    mm: "millimètre",
    cm: "centimètre",
    m: "mètre",
    km: "kilomètre",
    in: "pouce",
    ft: "pied",
    yd: "yard",
    mile: "mile",
  },
  masse: {
    mg: "milligramme",
    g: "gramme",
    kg: "kilogramme",
    t: "tonne",
    oz: "once",
    lb: "livre",
  },
  volume: {
    ml: "millilitre",
    cl: "centilitre",
    dl: "décilitre",
    l: "litre",
    m3: "mètre cube",
    gal: "gallon",
  },
  surface: {
    mm2: "millimètre carré",
    cm2: "centimètre carré",
    m2: "mètre carré",
    km2: "kilomètre carré",
    hectare: "hectare",
    acre: "acre",
  },
  vitesse: {
    "m/s": "mètre par seconde",
    "km/h": "kilomètre par heure",
    mph: "mile par heure",
    noeud: "nœud",
  },
  temps: {
    ms: "milliseconde",
    s: "seconde",
    min: "minute",
    h: "heure",
    jour: "jour",
    semaine: "semaine",
  },
  monnaie: {
    EUR: "euro",
    USD: "dollar",
    GBP: "livre sterling",
    JPY: "yen",
    CHF: "franc suisse",
    CAD: "dollar canadien",
    AUD: "dollar australien",
    CNY: "yuan",
    DKK: "couronne danoise",
    SEK: "couronne suédoise",
    NOK: "couronne norvégienne",
    PLN: "zloty",
    CZK: "couronne tchèque",
    HUF: "forint",
    TRY: "livre turque",
    BRL: "real brésilien",
    RUB: "rouble",
  },
};

function ouvrirConvertir() {
  document.getElementById("popup-convertir").style.display = "flex";
  changerCategorieConversion();
}

function fermerConvertir() {
  document.getElementById("popup-convertir").style.display = "none";
}

function changerCategorieConversion() {
  const catégorie = document.getElementById("unité-convertir").value;
  const départ = document.getElementById("select-mesures-unitées");
  const arrivée = document.getElementById("select-mesures-unitées-fin");

  départ.innerHTML = "";
  arrivée.innerHTML = "";

  Object.entries(unitésConversion[catégorie]).forEach(([value, nom]) => {
    départ.innerHTML += `<option value="${value}">${nom}</option>`;
    arrivée.innerHTML += `<option value="${value}">${nom}</option>`;
  });

  if (arrivée.options.length > 1) {
    arrivée.selectedIndex = 1;
  }
}

function convertir() {
  const valeur = document.getElementById("chiffre-de-depart").value;
  const unitéDépart = document.getElementById("select-mesures-unitées").value;
  const unitéArrivée = document.getElementById(
    "select-mesures-unitées-fin",
  ).value;

  if (!valeur) {
    return;
  }

  envoyerCommandePrédéfinie(
    `Convertis ${valeur} ${unitéDépart} en ${unitéArrivée}`,
  );
}

function ouvrirTraduction() {
  document.getElementById("popup-traduction").style.display = "flex";
}

function fermerTraduction() {
  document.getElementById("popup-traduction").style.display = "none";
}

function traduire() {
  const mot_traduction = document.getElementById("traduction-mot-input").value;
  const langue_traduction = document.getElementById(
    "traduction-langue-input",
  ).value;

  envoyerCommandePrédéfinie(
    `Traduis ${mot_traduction} en ${langue_traduction}`,
  );
}

function ouvrirNotification() {
  document.getElementById("popup-notification").style.display = "flex";
}

function fermerNotification() {
  document.getElementById("popup-notification").style.display = "none";
}

function programmerNotification() {
  const maintenant = new Date();

  const mois = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  const champJour = document.getElementById("notification-jour");
  const champMois = document.getElementById("notification-mois");
  const champHeure = document.getElementById("notification-heure");
  const champMinutes = document.getElementById("notification-minutes");
  const champContenu = document.getElementById("notification-contenu");

  const jour = champJour.value || maintenant.getDate();

  const moisChoisi = champMois.value || mois[maintenant.getMonth()];

  const heure =
    champHeure.value !== "" ? champHeure.value : maintenant.getHours();

  const minutes =
    champMinutes.value !== "" ? champMinutes.value : maintenant.getMinutes();

  const contenu = champContenu.value.trim();

  if (!contenu) {
    return;
  }

  const commande = `Programme une notification le ${jour} ${moisChoisi} à ${heure} heures ${minutes} ${contenu}`;

  envoyerCommandePrédéfinie(commande);

  fermerNotification();
}

// =========================================================
// AGENDA
// =========================================================

let dateAgenda = new Date();

// ---------------------------------------------------------
// OUVRIR / FERMER
// ---------------------------------------------------------

function ouvrirAgenda() {
  document.getElementById("popup-agenda").style.display = "flex";

  fermerFormulairesAgenda();

  document.getElementById("agenda-reponse").textContent = "";

  chargerEvenementsAgenda();
}

function fermerAgenda() {
  document.getElementById("popup-agenda").style.display = "none";
}

// ---------------------------------------------------------
// CALENDRIER
// ---------------------------------------------------------

function afficherCalendrierAgenda() {
  const calendrier = document.getElementById("agenda-calendrier");
  const titre = document.getElementById("agenda-mois-annee");

  const mois = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  const annee = dateAgenda.getFullYear();
  const moisActuel = dateAgenda.getMonth();

  titre.textContent = `${mois[moisActuel]} ${annee}`;

  calendrier.innerHTML = "";

  const premierJour = new Date(annee, moisActuel, 1);

  let jourDebut = premierJour.getDay();

  if (jourDebut === 0) {
    jourDebut = 6;
  } else {
    jourDebut--;
  }

  const nombreJours = new Date(annee, moisActuel + 1, 0).getDate();

  for (let i = 0; i < jourDebut; i++) {
    const caseVide = document.createElement("div");
    caseVide.className = "agenda-case agenda-case-vide";
    calendrier.appendChild(caseVide);
  }

  const maintenant = new Date();

  for (let jour = 1; jour <= nombreJours; jour++) {
    const caseJour = document.createElement("div");
    caseJour.className = "agenda-case";

    const dateJour = `${annee}-${String(moisActuel + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;

    if (
      jour === maintenant.getDate() &&
      moisActuel === maintenant.getMonth() &&
      annee === maintenant.getFullYear()
    ) {
      caseJour.classList.add("agenda-aujourd-hui");
    }

    const numeroJour = document.createElement("div");
    numeroJour.className = "agenda-jour";
    numeroJour.textContent = jour;

    caseJour.appendChild(numeroJour);

    caseJour.dataset.date = dateJour;

    caseJour.onclick = function () {
      document.getElementById("agenda-ajout-date").value = dateJour;
    };

    // Vérifie s'il y a un événement ce jour-là
    const evenementsDuJour = evenementsAgenda.filter(
      (evenement) => evenement.date === dateJour,
    );

    if (evenementsDuJour.length > 0) {
      const point = document.createElement("div");

      point.className = "agenda-evenement-point";

      caseJour.appendChild(point);
    }

    calendrier.appendChild(caseJour);
  }
}

// ---------------------------------------------------------
// CHANGER DE MOIS
// ---------------------------------------------------------

function changerMoisAgenda(delta) {
  dateAgenda.setMonth(dateAgenda.getMonth() + delta);

  chargerEvenementsAgenda();
}

// ---------------------------------------------------------
// FORMULAIRES
// ---------------------------------------------------------

function fermerFormulairesAgenda() {
  document.getElementById("agenda-ajout").style.display = "none";
  document.getElementById("agenda-suppression").style.display = "none";
  document.getElementById("agenda-modification").style.display = "none";
}

function ouvrirAjoutEvenement() {
  fermerFormulairesAgenda();

  document.getElementById("agenda-ajout").style.display = "block";
}

function ouvrirSuppressionEvenement() {
  fermerFormulairesAgenda();

  document.getElementById("agenda-suppression").style.display = "block";
}

function ouvrirModificationEvenement() {
  fermerFormulairesAgenda();

  document.getElementById("agenda-modification").style.display = "block";
}

// ---------------------------------------------------------
// CONVERSION DATE
// ---------------------------------------------------------

function dateEnTexteAgenda(date) {
  const [annee, mois, jour] = date.split("-");

  const moisNoms = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  return `${parseInt(jour)} ${moisNoms[parseInt(mois) - 1]}`;
}

// ---------------------------------------------------------
// CONVERSION HEURE
// ---------------------------------------------------------

function heureEnTexteAgenda(heure) {
  const [heures, minutes] = heure.split(":");

  return `${parseInt(heures)} heures ${parseInt(minutes)} minutes`;
}

// ---------------------------------------------------------
// AJOUTER
// ---------------------------------------------------------

function ajouterEvenementAgenda() {
  const titre = document.getElementById("agenda-ajout-titre").value.trim();
  const date = document.getElementById("agenda-ajout-date").value;
  const heure = document.getElementById("agenda-ajout-heure").value;

  if (!titre || !date || !heure) {
    document.getElementById("agenda-reponse").textContent =
      "Remplis tous les champs.";

    return;
  }

  const [annee, mois, jour] = date.split("-");
  const dateTexte = `${jour}/${mois}/${annee}`;
  const heureTexte = heureEnTexteAgenda(heure);

  const commande = `Ajoute un événement ${titre} ${dateTexte} à ${heureTexte}`;

  envoyerCommandePrédéfinie(commande);
  setTimeout(chargerEvenementsAgenda, 2000);

  fermerFormulairesAgenda();

  document.getElementById("agenda-ajout-titre").value = "";
  document.getElementById("agenda-ajout-date").value = "";
  document.getElementById("agenda-ajout-heure").value = "";
}

function ajouterEvenementDepuisURL() {
  const url = document.getElementById("agenda-ajout-url").value;

  envoyerCommandePrédéfinie(`Ajoute cet évenement: ${url}`);
}

// ---------------------------------------------------------
// PROCHAINS ÉVÉNEMENTS
// ---------------------------------------------------------

function afficherProchainsEvenements() {
  fermerFormulairesAgenda();

  envoyerCommandePrédéfinie("Donne-moi mes prochains événements");
  setTimeout(chargerEvenementsAgenda, 2000);
}

// ---------------------------------------------------------
// SUPPRIMER
// ---------------------------------------------------------

function supprimerEvenementAgenda() {
  const titre = document
    .getElementById("agenda-suppression-titre")
    .value.trim();
  const date = document.getElementById("agenda-suppression-date").value;
  const heure = document.getElementById("agenda-suppression-heure").value;

  if (!titre || !date || !heure) {
    document.getElementById("agenda-reponse").textContent =
      "Remplis tous les champs.";

    return;
  }

  const dateTexte = dateEnTexteAgenda(date);
  const heureTexte = heureEnTexteAgenda(heure);

  const commande = `Supprime l'événement ${titre} le ${dateTexte} à ${heureTexte}`;

  envoyerCommandePrédéfinie(commande);
  setTimeout(chargerEvenementsAgenda, 3000);

  fermerFormulairesAgenda();

  document.getElementById("agenda-suppression-titre").value = "";
  document.getElementById("agenda-suppression-date").value = "";
  document.getElementById("agenda-suppression-heure").value = "";
}

// ---------------------------------------------------------
// MODIFIER
// ---------------------------------------------------------

function modifierEvenementAgenda() {
  const ancien = document
    .getElementById("agenda-modification-ancien")
    .value.trim();
  const date = document.getElementById("agenda-modification-date").value;
  const heure = document.getElementById("agenda-modification-heure").value;

  if (!ancien || !date || !heure) {
    document.getElementById("agenda-reponse").textContent =
      "Remplis tous les champs.";

    return;
  }

  const dateTexte = dateEnTexteAgenda(date);
  const heureTexte = heureEnTexteAgenda(heure);

  const commande = `Modifie l'événement ${ancien} le ${dateTexte} à ${heureTexte}`;

  envoyerCommandePrédéfinie(commande);
  setTimeout(chargerEvenementsAgenda, 2000);

  fermerFormulairesAgenda();

  document.getElementById("agenda-modification-ancien").value = "";
  document.getElementById("agenda-modification-date").value = "";
  document.getElementById("agenda-modification-heure").value = "";
}

let evenementsAgenda = [];

function chargerEvenementsAgenda() {
  const annee = dateAgenda.getFullYear();
  const mois = dateAgenda.getMonth() + 1;

  fetch(`${API_URL}/agenda?annee=${annee}&mois=${mois}`, {
    headers: {
      Authorization: "Bearer " + TOKEN,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.succes) {
        console.error("Erreur récupération agenda :", data.erreur);
        evenementsAgenda = [];
        afficherCalendrierAgenda();
        return;
      }

      evenementsAgenda = data.evenements || [];

      afficherCalendrierAgenda();
    })
    .catch((error) => {
      console.error("Erreur connexion agenda :", error);
    });
}

function ouvrirHasard() {
  document.getElementById("popup-hasard").style.display = "flex";
}

function fermerHasard() {
  document.getElementById("popup-hasard").style.display = "none";
}

function pileOuFace() {
  envoyerCommandePrédéfinie("pile ou face");
}

function lancerDe() {
  const input = document.getElementById("lancer-de-input");
  const faces = parseInt(input.value);

  if (isNaN(faces) || faces < 2) {
    document.getElementById("reponse-hasard").textContent =
      "Réponse : un dé doit avoir au moins 2 faces.";
    return;
  }

  envoyerCommandePrédéfinie(`lance un dé de ${faces} faces`);
}

function choixAleatoire() {
  const input = document.getElementById("choix-hasard-input");
  const texte = input.value.trim();

  if (!texte) {
    document.getElementById("reponse-hasard").textContent =
      "Réponse : entre au moins deux choix.";
    return;
  }

  const choix = texte
    .split(",")
    .map((element) => element.trim())
    .filter((element) => element.length > 0);

  if (choix.length < 2) {
    document.getElementById("reponse-hasard").textContent =
      "Réponse : entre au moins deux choix.";
    return;
  }

  envoyerCommandePrédéfinie(`choix au hasard entre ${choix.join(", ")}`);
}

function nombreAleatoireSite() {
  const minimum = parseInt(document.getElementById("nombre-min-input").value);

  const maximum = parseInt(document.getElementById("nombre-max-input").value);

  if (isNaN(minimum) || isNaN(maximum)) {
    document.getElementById("reponse-hasard").textContent =
      "Réponse : entre deux nombres valides.";
    return;
  }

  if (minimum > maximum) {
    document.getElementById("reponse-hasard").textContent =
      "Réponse : le minimum doit être inférieur au maximum.";
    return;
  }

  envoyerCommandePrédéfinie(`nombre au hasard entre ${minimum} et ${maximum}`);
}

/* ---------------------------------------------------------
   NOTES
   --------------------------------------------------------- */

function ouvrirNotes() {
  document.getElementById("popup-notes").style.display = "flex";

  chargerNotes();
}

function fermerNotes() {
  document.getElementById("popup-notes").style.display = "none";
}

/* ---------------------------------------------------------
   Charger les notes
   --------------------------------------------------------- */

async function chargerNotes() {
  const liste = document.getElementById("notes-liste");
  const message = document.getElementById("notes-message");

  liste.innerHTML = '<p class="notes-vide">Chargement...</p>';
  message.textContent = "";

  try {
    const reponse = await fetch(`${API_URL}/notes`, {
      method: "GET",

      headers: {
        Authorization: "Bearer " + TOKEN,
      },
    });

    const resultat = await reponse.json();

    if (!reponse.ok) {
      throw new Error(resultat.erreur || "Erreur lors du chargement.");
    }

    const notes = resultat.notes || [];

    liste.innerHTML = "";

    if (notes.length === 0) {
      liste.innerHTML = '<p class="notes-vide">Aucune note enregistrée.</p>';

      return;
    }

    notes.forEach((note) => {
      const bloc = document.createElement("div");
      bloc.className = "note";

      const contenu = document.createElement("div");
      contenu.className = "note-contenu";

      const titre = document.createElement("h3");
      titre.textContent = note.titre;

      const texte = document.createElement("p");
      texte.textContent = note.texte || "Cette note est vide.";

      const actions = document.createElement("div");
      actions.className = "note-actions";

      const boutonModifier = document.createElement("button");

      boutonModifier.className = "note-modifier";
      boutonModifier.textContent = "Modifier";

      boutonModifier.onclick = function () {
        modifierNoteDepuisSite(note);
      };

      const boutonSupprimer = document.createElement("button");

      boutonSupprimer.className = "note-supprimer";
      boutonSupprimer.textContent = "Supprimer";

      boutonSupprimer.onclick = function () {
        supprimerNoteDepuisSite(note.titre);
      };

      actions.appendChild(boutonModifier);
      actions.appendChild(boutonSupprimer);

      contenu.appendChild(titre);
      contenu.appendChild(texte);
      contenu.appendChild(actions);

      bloc.appendChild(contenu);

      liste.appendChild(bloc);
    });
  } catch (erreur) {
    console.error("Erreur notes :", erreur);

    liste.innerHTML =
      '<p class="notes-vide">Impossible de charger les notes.</p>';

    message.textContent = erreur.message;
  }
}

/* ---------------------------------------------------------
   Ajouter une note
   --------------------------------------------------------- */

async function ajouterNoteDepuisSite() {
  const titreInput = document.getElementById("note-titre");

  const texteInput = document.getElementById("note-texte");

  const message = document.getElementById("notes-message");

  const titre = titreInput.value.trim();
  const texte = texteInput.value.trim();

  if (!titre) {
    message.textContent = "Le titre de la note est obligatoire.";

    return;
  }

  try {
    const reponse = await fetch(`${API_URL}/notes`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      },

      body: JSON.stringify({
        titre: titre,
        texte: texte,
      }),
    });

    const resultat = await reponse.json();

    if (!reponse.ok) {
      message.textContent = resultat.erreur || "Impossible d'ajouter la note.";

      return;
    }

    titreInput.value = "";
    texteInput.value = "";

    message.textContent = "Note ajoutée !";

    chargerNotes();
  } catch (erreur) {
    console.error("Erreur ajout note :", erreur);

    message.textContent = "Erreur lors de l'ajout de la note.";
  }
}

/* ---------------------------------------------------------
   Modifier une note
   --------------------------------------------------------- */

async function modifierNoteDepuisSite(note) {
  const nouveauTexte = prompt(
    "Modifier la note « " + note.titre + " » :",
    note.texte || "",
  );

  if (nouveauTexte === null) {
    return;
  }

  try {
    const reponse = await fetch(
      `${API_URL}/notes/` + encodeURIComponent(note.titre),
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + TOKEN,
        },

        body: JSON.stringify({
          texte: nouveauTexte,
        }),
      },
    );

    const resultat = await reponse.json();

    if (!reponse.ok) {
      document.getElementById("notes-message").textContent =
        resultat.erreur || "Impossible de modifier la note.";

      return;
    }

    document.getElementById("notes-message").textContent = "Note modifiée !";

    chargerNotes();
  } catch (erreur) {
    console.error("Erreur modification note :", erreur);

    document.getElementById("notes-message").textContent =
      "Erreur lors de la modification.";
  }
}

/* ---------------------------------------------------------
   Supprimer une note
   --------------------------------------------------------- */

async function supprimerNoteDepuisSite(titre) {
  if (!confirm('Supprimer la note "' + titre + '" ?')) {
    return;
  }

  try {
    const reponse = await fetch(
      `${API_URL}/notes/` + encodeURIComponent(titre),
      {
        method: "DELETE",

        headers: {
          Authorization: "Bearer " + TOKEN,
        },
      },
    );

    const resultat = await reponse.json();

    if (!reponse.ok) {
      document.getElementById("notes-message").textContent =
        resultat.erreur || "Impossible de supprimer la note.";

      return;
    }

    document.getElementById("notes-message").textContent = "Note supprimée !";

    chargerNotes();
  } catch (erreur) {
    console.error("Erreur suppression note :", erreur);

    document.getElementById("notes-message").textContent =
      "Erreur lors de la suppression.";
  }
}

function ouvrirResumer() {
  document.getElementById("popup-resumer").style.display = "flex";
}

function fermerResumer() {
  document.getElementById("popup-resumer").style.display = "none";
}

function resumer() {
  const texte = document.getElementById("resumer-textarea").value;
  envoyerCommandePrédéfinie(`Résume ce texte: ${texte}`);
}

// =========================================================
// ANALYSE D'IMAGE
// =========================================================

function ouvrirAnalyserImage() {
  const popup = document.getElementById("popup-analyser-image");
  const input = document.getElementById("image-a-analyser");
  const statut = document.getElementById("statut-analyse-image");
  const resultat = document.getElementById("resultat-analyse-image");
  const texte = document.getElementById("texte-image");
  const apercuContainer = document.getElementById("apercu-image-container");
  const apercu = document.getElementById("apercu-image");

  if (popup) {
    popup.style.display = "flex";
  }

  if (input) {
    input.value = "";
  }

  if (statut) {
    statut.textContent = "";
  }

  if (resultat) {
    resultat.style.display = "none";
  }

  if (texte) {
    texte.value = "";
  }

  if (apercuContainer) {
    apercuContainer.style.display = "none";
  }

  if (apercu) {
    apercu.src = "";
  }
}

function fermerAnalyserImage() {
  const popup = document.getElementById("popup-analyser-image");

  if (popup) {
    popup.style.display = "none";
  }
}

async function analyserImage() {
  const input = document.getElementById("image-a-analyser");
  const statut = document.getElementById("statut-analyse-image");
  const resultat = document.getElementById("resultat-analyse-image");
  const texteImage = document.getElementById("texte-image");
  const apercuContainer = document.getElementById("apercu-image-container");
  const apercu = document.getElementById("apercu-image");
  const bouton = document.getElementById("bouton-analyser-image");

  if (!input || input.files.length === 0) {
    statut.textContent = "Sélectionne une image.";
    return;
  }

  const fichier = input.files[0];

  if (!fichier.type.startsWith("image/")) {
    statut.textContent = "Le fichier sélectionné n'est pas une image.";
    return;
  }

  // Aperçu
  if (apercu && apercuContainer) {
    apercu.src = URL.createObjectURL(fichier);
    apercuContainer.style.display = "block";
  }

  statut.textContent = "Analyse de l'image en cours...";

  if (bouton) {
    bouton.disabled = true;
    bouton.textContent = "🔍 Analyse...";
  }

  const donnees = new FormData();
  donnees.append("image", fichier);

  try {
    const resultatRequete = await fetch(`${API_URL}/analyser-image`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + TOKEN,
      },
      body: donnees,
    });

    const data = await resultatRequete.json();

    if (!resultatRequete.ok) {
      statut.textContent = data.erreur || "Impossible d'analyser l'image.";
      return;
    }

    if (!data.succes) {
      statut.textContent = data.erreur || "Impossible d'analyser l'image.";
      return;
    }

    // IMPORTANT :
    // Flask renvoie "texte"
    const texte = data.texte || "";

    if (!texte) {
      statut.textContent = "Aucun texte n'a été détecté.";
      return;
    }

    // Affichage du texte détecté
    texteImage.value = texte;

    resultat.style.display = "block";

    statut.textContent = "Analyse terminée.";

    // Affichage également dans la réponse principale
    document.getElementById("reponse").textContent = "Réponse : " + texte;
  } catch (erreur) {
    console.error("Erreur analyse image :", erreur);

    statut.textContent = "Erreur lors de l'analyse de l'image.";
  } finally {
    if (bouton) {
      bouton.disabled = false;
      bouton.textContent = "🔍 Analyser";
    }
  }
}

// =========================================================
// COPIER LE TEXTE DÉTECTÉ
// =========================================================

async function copierTexteImage() {
  const textarea = document.getElementById("texte-image");

  if (!textarea || !textarea.value.trim()) {
    return;
  }

  try {
    await navigator.clipboard.writeText(textarea.value);

    const statut = document.getElementById("statut-analyse-image");

    if (statut) {
      statut.textContent = "Texte copié dans le presse-papiers.";
    }
  } catch (erreur) {
    console.error("Erreur copie texte image :", erreur);

    // Fallback pour les navigateurs qui bloquent
    textarea.select();
    document.execCommand("copy");

    const statut = document.getElementById("statut-analyse-image");

    if (statut) {
      statut.textContent = "Texte copié dans le presse-papiers.";
    }
  }
}

// =========================================================
// TÉLÉCHARGER TXT
// =========================================================

function telechargerTexteImage() {
  const textarea = document.getElementById("texte-image");

  if (!textarea || !textarea.value.trim()) {
    return;
  }

  const blob = new Blob([textarea.value], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const lien = document.createElement("a");

  lien.href = url;
  lien.download = "texte-image.txt";

  document.body.appendChild(lien);

  lien.click();

  document.body.removeChild(lien);

  URL.revokeObjectURL(url);
}

// =========================================================
// TÉLÉCHARGER PDF
// =========================================================

function telechargerPdfImage() {
  const textarea = document.getElementById("texte-image");

  if (!textarea || !textarea.value.trim()) {
    return;
  }

  const texte = textarea.value;

  const fenetre = window.open("", "_blank");

  if (!fenetre) {
    alert(
      "Impossible d'ouvrir la fenêtre PDF. Vérifie que les popups sont autorisées.",
    );
    return;
  }

  fenetre.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Texte détecté</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    line-height: 1.6;
                    white-space: pre-wrap;
                }

                h1 {
                    margin-bottom: 30px;
                }
            </style>
        </head>

        <body>

            <h1>Texte détecté</h1>

            ${texte
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/\n/g, "<br>")}

        </body>
        </html>
    `);

  fenetre.document.close();

  fenetre.focus();

  setTimeout(() => {
    fenetre.print();
  }, 300);
}

function ouvrirCorrection() {
  document.getElementById("popup-correction").style.display = "flex";
}

function fermerCorrection() {
  document.getElementById("popup-correction").style.display = "none";
}

function corriger() {
  const texte = document.getElementById("corriger-textarea").value;

  envoyerCommandePrédéfinie(`Corrige ce texte: ${texte}`);
}

function ouvrirStlGcode() {
  document.getElementById("popup-stl-gcode").style.display = "flex";
}

function fermerStlGcode() {
  document.getElementById("popup-stl-gcode").style.display = "none";
}

const stlFichier = document.getElementById("stl-fichier");
const stlConvertir = document.getElementById("stl-convertir");
const stlStatut = document.getElementById("stl-statut");

if (stlFichier && stlConvertir && stlStatut) {
  stlConvertir.addEventListener("click", async () => {
    const fichier = stlFichier.files[0];

    if (!fichier) {
      stlStatut.style.display = "flex";
      stlStatut.textContent = "❌ Sélectionne un fichier STL.";
      return;
    }

    if (!fichier.name.toLowerCase().endsWith(".stl")) {
      stlStatut.style.display = "flex";
      stlStatut.textContent = "❌ Le fichier doit être au format .stl.";
      return;
    }

    stlConvertir.disabled = true;
    stlStatut.style.display = "flex";
    stlStatut.textContent = "⏳ Conversion en cours...";

    try {
      const formData = new FormData();

      formData.append("fichier", fichier);

      const response = await fetch(`${API_URL}/stl-gcode`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "Erreur pendant la conversion.";

        try {
          const data = await response.json();

          if (data.erreur) {
            message = data.erreur;
          }
        } catch {
          // Réponse non JSON
        }

        throw new Error(message);
      }

      // Récupérer le G-code
      const blob = await response.blob();

      // Nom par défaut
      let nomGcode = fichier.name.replace(/\.stl$/i, ".gcode");

      // Récupérer le vrai nom envoyé par Flask
      const disposition = response.headers.get("Content-Disposition");

      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/i);

        if (match && match[1]) {
          nomGcode = match[1];
        }
      }

      // Créer le téléchargement
      const url = window.URL.createObjectURL(blob);

      const lien = document.createElement("a");

      lien.href = url;
      lien.download = nomGcode;

      document.body.appendChild(lien);

      lien.click();

      lien.remove();

      window.URL.revokeObjectURL(url);

      stlStatut.style.display = "flex";
      stlStatut.textContent =
        "✅ Conversion terminée ! " + "Le G-code a été téléchargé.";
    } catch (erreur) {
      console.error("Erreur STL → G-code :", erreur);

      stlStatut.style.display = "flex";
      stlStatut.textContent = "❌ " + erreur.message;
    } finally {
      stlConvertir.disabled = false;
    }
  });
}

// =========================================================
// COMPRESSEUR DE FICHIERS
// =========================================================

function ouvrirCompresseur() {
  const popup = document.getElementById("popup-compresseur");

  if (popup) {
    popup.style.display = "flex";
  }

  const input = document.getElementById("fichiers-a-compresser");
  const liste = document.getElementById("liste-fichiers-compresseur");
  const statut = document.getElementById("statut-compresseur");
  const bouton = document.getElementById("bouton-compresser");

  if (input) {
    input.value = "";
  }

  if (liste) {
    liste.textContent = "Aucun fichier sélectionné.";
  }

  if (statut) {
    statut.textContent = "";
    statut.style.display = "none";
  }

  if (bouton) {
    bouton.disabled = false;
    bouton.textContent = "Compresser";
  }
}

function fermerCompresseur() {
  const popup = document.getElementById("popup-compresseur");

  if (popup) {
    popup.style.display = "none";
  }
}

// Affichage des fichiers sélectionnés
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("fichiers-a-compresser");
  const liste = document.getElementById("liste-fichiers-compresseur");

  if (!input || !liste) {
    return;
  }

  input.addEventListener("change", () => {
    const fichiers = Array.from(input.files);

    if (fichiers.length === 0) {
      liste.textContent = "Aucun fichier sélectionné.";
      return;
    }

    liste.innerHTML = "";

    const titre = document.createElement("strong");

    titre.textContent = `${fichiers.length} fichier${fichiers.length > 1 ? "s" : ""} sélectionné${fichiers.length > 1 ? "s" : ""} :`;

    liste.appendChild(titre);

    const ul = document.createElement("ul");

    fichiers.forEach((fichier) => {
      const li = document.createElement("li");

      li.textContent = `${fichier.name} (${formaterTailleFichier(fichier.size)})`;

      ul.appendChild(li);
    });

    liste.appendChild(ul);
  });
});

// Formatage de la taille
function formaterTailleFichier(taille) {
  if (taille < 1024) {
    return `${taille} o`;
  }

  if (taille < 1024 * 1024) {
    return `${(taille / 1024).toFixed(1)} Ko`;
  }

  if (taille < 1024 * 1024 * 1024) {
    return `${(taille / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return `${(taille / (1024 * 1024 * 1024)).toFixed(1)} Go`;
}

// Compression
async function compresserFichiers() {
  const input = document.getElementById("fichiers-a-compresser");
  const bouton = document.getElementById("bouton-compresser");
  const statut = document.getElementById("statut-compresseur");

  if (!input || !bouton || !statut) {
    console.error("Éléments du compresseur introuvables.");
    return;
  }

  const fichiers = Array.from(input.files);

  if (fichiers.length === 0) {
    statut.textContent = "❌ Sélectionne au moins un fichier.";

    statut.style.display = "block";

    return;
  }

  // Création du formulaire
  const formData = new FormData();

  fichiers.forEach((fichier) => {
    formData.append("fichiers", fichier);
  });

  // Interface pendant la compression
  bouton.disabled = true;
  bouton.textContent = "Compression en cours...";

  statut.style.display = "block";

  statut.textContent = "⏳ Compression des fichiers en cours...";

  try {
    const TOKEN =
      localStorage.getItem("deskbot_token") ||
      sessionStorage.getItem("deskbot_token");

    const headers = {};

    if (TOKEN) {
      headers["Authorization"] = `Bearer ${TOKEN}`;
    }

    const response = await fetch(`${API_URL}/compresser`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      let message = "Une erreur est survenue pendant la compression.";

      const type = response.headers.get("content-type") || "";

      if (type.includes("application/json")) {
        const data = await response.json();

        message = data.erreur || data.error || data.message || message;
      } else {
        const texte = await response.text();

        if (texte) {
          message = texte;
        }
      }

      throw new Error(message);
    }

    // Récupération du ZIP
    const blob = await response.blob();

    // Nom du fichier
    let nomFichier = "fichiers_compresse.zip";

    const disposition = response.headers.get("Content-Disposition");

    if (disposition) {
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);

      if (match && match[1]) {
        try {
          nomFichier = decodeURIComponent(match[1]);
        } catch {
          nomFichier = match[1];
        }
      }
    }

    // Téléchargement
    const url = URL.createObjectURL(blob);

    const lien = document.createElement("a");

    lien.href = url;
    lien.download = nomFichier;

    document.body.appendChild(lien);

    lien.click();

    lien.remove();

    URL.revokeObjectURL(url);

    statut.textContent =
      "✅ Compression terminée ! Le fichier ZIP a été téléchargé.";

    bouton.textContent = "Compresser";
  } catch (erreur) {
    console.error("Erreur compression :", erreur);

    statut.textContent = `❌ ${erreur.message || "Erreur lors de la compression."}`;

    bouton.textContent = "Réessayer";
  } finally {
    bouton.disabled = false;
  }
}

// ============================================================
// CONVERTISSEUR DE FICHIERS
// ============================================================

const formatsConvertisseurFichier = {
  image: [
    { extension: ".jpg", nom: "JPG" },
    { extension: ".png", nom: "PNG" },
    { extension: ".webp", nom: "WEBP" },
    { extension: ".bmp", nom: "BMP" },
    { extension: ".gif", nom: "GIF" },
    { extension: ".tiff", nom: "TIFF" },
  ],

  audioVideo: [
    { extension: ".mp3", nom: "MP3" },
    { extension: ".wav", nom: "WAV" },
    { extension: ".ogg", nom: "OGG" },
    { extension: ".flac", nom: "FLAC" },
    { extension: ".m4a", nom: "M4A" },
    { extension: ".aac", nom: "AAC" },
    { extension: ".mp4", nom: "MP4" },
    { extension: ".mkv", nom: "MKV" },
    { extension: ".avi", nom: "AVI" },
    { extension: ".mov", nom: "MOV" },
    { extension: ".webm", nom: "WEBM" },
  ],

  texte: [{ extension: ".pdf", nom: "PDF" }],
};

// ------------------------------------------------------------
// OUVRIR
// ------------------------------------------------------------

function ouvrirConvertisseurFichier() {
  const popup = document.getElementById("popup-convertisseur-fichier");

  document.getElementById("bouton-convertir-fichier").style.disabled = "none";

  if (!popup) return;

  popup.style.display = "flex";

  const input = document.getElementById("fichier-a-convertir");

  const select = document.getElementById("format-conversion-fichier");

  const nomFichier = document.getElementById("nom-fichier-convertisseur");

  const statut = document.getElementById("statut-convertisseur-fichier");

  if (input) {
    input.value = "";
  }

  if (select) {
    select.innerHTML = '<option value="">Choisir un format</option>';
  }

  if (nomFichier) {
    nomFichier.textContent = "Aucun fichier sélectionné.";
  }

  if (statut) {
    statut.style.display = "none";
    statut.textContent = "";
  }
}

// ------------------------------------------------------------
// FERMER
// ------------------------------------------------------------

function fermerConvertisseurFichier() {
  const popup = document.getElementById("popup-convertisseur-fichier");

  if (popup) {
    popup.style.display = "none";
  }
}

// ------------------------------------------------------------
// DÉTECTION DU TYPE
// ------------------------------------------------------------

function obtenirCategorieFichierConvertisseur(nomFichier) {
  const extension = nomFichier
    .substring(nomFichier.lastIndexOf("."))
    .toLowerCase();

  const extensionsImage = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".bmp",
    ".gif",
    ".tiff",
  ];

  const extensionsAudioVideo = [
    ".mp3",
    ".wav",
    ".ogg",
    ".flac",
    ".m4a",
    ".aac",
    ".mp4",
    ".mkv",
    ".avi",
    ".mov",
    ".webm",
  ];

  const extensionsTexte = [".txt"];

  if (extensionsImage.includes(extension)) {
    return "image";
  }

  if (extensionsAudioVideo.includes(extension)) {
    return "audioVideo";
  }

  if (extensionsTexte.includes(extension)) {
    return "texte";
  }

  return null;
}

// ------------------------------------------------------------
// AFFICHER LES FORMATS
// ------------------------------------------------------------

function afficherFormatsConvertisseurFichier(categorie, extensionActuelle) {
  const select = document.getElementById("format-conversion-fichier");

  if (!select) return;

  select.innerHTML = '<option value="">Choisir un format</option>';

  const formats = formatsConvertisseurFichier[categorie];

  if (!formats) return;

  formats.forEach((format) => {
    // Ne pas proposer le même format
    if (format.extension === extensionActuelle) {
      return;
    }

    const option = document.createElement("option");

    option.value = format.extension;
    option.textContent = format.nom;

    select.appendChild(option);
  });
}

// ------------------------------------------------------------
// SÉLECTION DU FICHIER
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("fichier-a-convertir");

  if (!input) return;

  input.addEventListener("change", () => {
    const fichier = input.files[0];

    const nomFichier = document.getElementById("nom-fichier-convertisseur");

    const select = document.getElementById("format-conversion-fichier");

    const statut = document.getElementById("statut-convertisseur-fichier");

    if (!fichier) {
      if (nomFichier) {
        nomFichier.textContent = "Aucun fichier sélectionné.";
      }

      if (select) {
        select.innerHTML = '<option value="">Choisir un format</option>';
      }

      return;
    }

    if (nomFichier) {
      nomFichier.textContent = fichier.name;
    }

    const categorie = obtenirCategorieFichierConvertisseur(fichier.name);

    const extension = fichier.name
      .substring(fichier.name.lastIndexOf("."))
      .toLowerCase();

    if (!categorie) {
      if (select) {
        select.innerHTML = '<option value="">Format non supporté</option>';
      }

      if (statut) {
        statut.style.display = "block";
        statut.textContent = "❌ Ce type de fichier n'est pas encore supporté.";
      }

      return;
    }

    if (statut) {
      statut.style.display = "none";
      statut.textContent = "";
    }

    afficherFormatsConvertisseurFichier(categorie, extension);
  });
});

// ------------------------------------------------------------
// CONVERTIR
// ------------------------------------------------------------

async function convertirFichierDepuisSite() {
  const input = document.getElementById("fichier-a-convertir");

  const select = document.getElementById("format-conversion-fichier");

  const statut = document.getElementById("statut-convertisseur-fichier");

  const bouton = document.getElementById("bouton-convertir-fichier");

  if (!input || !input.files.length) {
    if (statut) {
      statut.style.display = "block";
      statut.textContent = "❌ Sélectionne un fichier.";
    }

    return;
  }

  if (!select || !select.value) {
    if (statut) {
      statut.style.display = "block";
      statut.textContent = "❌ Choisis un format de sortie.";
    }

    return;
  }

  const fichier = input.files[0];
  const format = select.value;

  const formulaire = new FormData();

  formulaire.append("fichier", fichier);

  formulaire.append("format", format);

  if (bouton) {
    bouton.disabled = true;
    bouton.textContent = "Conversion...";
  }

  if (statut) {
    statut.style.display = "block";
    statut.textContent = "⏳ Conversion du fichier...";
  }

  try {
    const reponse = await fetch(`${API_URL}/convertir`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      body: formulaire,
    });

    if (!reponse.ok) {
      let message = "Erreur lors de la conversion.";

      try {
        const erreur = await reponse.json();

        if (erreur.erreur) {
          message = erreur.erreur;
        }
      } catch (e) {
        // Réponse non JSON
      }

      throw new Error(message);
    }

    const blob = await reponse.blob();

    // ----------------------------------------------------
    // RÉCUPÉRATION DU NOM DU FICHIER
    // ----------------------------------------------------

    let nomFichierSortie = fichier.name;

    const extension = format.startsWith(".") ? format : "." + format;

    nomFichierSortie = nomFichierSortie.replace(/\.[^/.]+$/, extension);

    // Si le serveur fournit un nom,
    // on l'utilise.
    const disposition = reponse.headers.get("Content-Disposition");

    if (disposition) {
      const correspondance = disposition.match(/filename="?([^"]+)"?/i);

      if (correspondance && correspondance[1]) {
        nomFichierSortie = correspondance[1];
      }
    }

    // ----------------------------------------------------
    // TÉLÉCHARGEMENT
    // ----------------------------------------------------

    const url = window.URL.createObjectURL(blob);

    const lien = document.createElement("a");

    lien.href = url;
    lien.download = nomFichierSortie;

    document.body.appendChild(lien);

    lien.click();

    lien.remove();

    window.URL.revokeObjectURL(url);

    if (statut) {
      statut.textContent = "✅ Conversion terminée !";
    }
  } catch (erreur) {
    console.error("Erreur convertisseur :", erreur);

    if (statut) {
      statut.style.display = "block";
      statut.textContent = "❌ " + erreur.message;
    }
  } finally {
    if (bouton) {
      bouton.disabled = false;
      bouton.textContent = "Convertir";
    }
  }
}

// =========================================================
// GÉNÉRATION D'IMAGE
// =========================================================

function ouvrirGenererImage() {
  const popup = document.getElementById("popup-generer-image");

  if (!popup) {
    console.error("Popup génération d'image introuvable.");
    return;
  }

  popup.style.display = "flex";

  const prompt = document.getElementById("prompt-generer-image");

  const statut = document.getElementById("statut-generer-image");

  const resultat = document.getElementById("resultat-generer-image");

  const image = document.getElementById("image-generee");

  const bouton = document.getElementById("bouton-generer-image");

  const formatImage = document.getElementById("format-generer-image");

  const qualiteImage = document.getElementById("qualite-generer-image");

  if (prompt) {
    prompt.value = "";
  }

  if (statut) {
    statut.style.display = "none";
    statut.textContent = "";
  }

  if (resultat) {
    resultat.style.display = "none";
  }

  if (image) {
    image.removeAttribute("src");
  }

  if (bouton) {
    bouton.disabled = false;
    bouton.textContent = "Générer l'image";
  }

  if (formatImage) {
    formatImage.value = "1:1";
  }

  if (qualiteImage) {
    qualiteImage.value = "moyenne";
  }
}

function fermerGenererImage() {
  const popup = document.getElementById("popup-generer-image");

  if (popup) {
    popup.style.display = "none";
  }
}

async function genererImageDepuisSite() {
  const prompt = document.getElementById("prompt-generer-image");

  const bouton = document.getElementById("bouton-generer-image");

  const statut = document.getElementById("statut-generer-image");

  const resultat = document.getElementById("resultat-generer-image");

  const image = document.getElementById("image-generee");

  const formatImage = document.getElementById("format-generer-image");

  const qualiteImage = document.getElementById("qualite-generer-image");

  if (
    !prompt ||
    !bouton ||
    !statut ||
    !resultat ||
    !image ||
    !formatImage ||
    !qualiteImage
  ) {
    console.error("Éléments de génération d'image introuvables.");
    return;
  }

  const texte = prompt.value.trim();

  const format = formatImage.value;

  const qualite = qualiteImage.value;

  if (!texte) {
    statut.style.display = "block";

    statut.textContent = "❌ Décris l'image que tu veux générer.";

    return;
  }

  if (!TOKEN) {
    afficherLogin();
    return;
  }

  bouton.disabled = true;

  bouton.textContent = "Génération en cours...";

  statut.style.display = "block";

  statut.textContent = "⏳ DeskBot génère ton image...";

  resultat.style.display = "none";

  try {
    const response = await fetch(`${API_URL}/generer-image`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${TOKEN}`,
      },

      body: JSON.stringify({
        prompt: texte,
        format: formatImage.value,
        qualite: qualiteImage.value,
      }),
    });

    if (response.status === 401) {
      gererErreur401(response);

      return;
    }

    if (!response.ok) {
      let message = "Erreur lors de la génération de l'image.";

      try {
        const data = await response.json();

        if (data.erreur) {
          message = data.erreur;
        }
      } catch {
        // Réponse non JSON
      }

      throw new Error(message);
    }

    const blob = await response.blob();

    if (!blob.type.startsWith("image/")) {
      throw new Error("Le serveur n'a pas retourné une image.");
    }

    const url = URL.createObjectURL(blob);

    image.src = url;

    resultat.style.display = "block";

    statut.textContent = "✅ Image générée !";

    // -----------------------------------------------------
    // Permet de télécharger l'image plus tard.
    // -----------------------------------------------------

    image.dataset.url = url;
  } catch (erreur) {
    console.error("Erreur génération image :", erreur);

    statut.textContent = `❌ ${erreur.message || "Erreur lors de la génération."}`;

    resultat.style.display = "none";
  } finally {
    bouton.disabled = false;

    bouton.textContent = "Générer l'image";
  }
}

function telechargerImageGeneree() {
  const image = document.getElementById("image-generee");

  if (!image || !image.dataset.url) {
    return;
  }

  const lien = document.createElement("a");

  lien.href = image.dataset.url;

  lien.download = "deskbot-image.jpg";

  document.body.appendChild(lien);

  lien.click();

  lien.remove();
}

function ouvrirDeskTube() {
  window.open("youtube.html", "_blank");
}

function afficherFormulaireMail() {
  const formulaire = document.getElementById("formulaire-envoi-mail");

  if (formulaire) {
    formulaire.style.display = "block";
  }
}

async function envoyerMail() {
  const destinataire = document
    .getElementById("mail-destinataire")
    .value.trim();
  const objet = document.getElementById("mail-objet").value.trim();
  const contenu = document.getElementById("mail-contenu").value.trim();
  const result = document.getElementById("result-mail");

  if (!destinataire || !objet || !contenu) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  try {
    const token = TOKEN;

    const reponse = await fetch(`${API_URL}/mails/envoyer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        destinataire: destinataire,
        objet: objet,
        contenu: contenu,
      }),
    });

    const texte = await reponse.text();

    let resultat;

    try {
      resultat = JSON.parse(texte);
    } catch {
      throw new Error(
        `Réponse serveur invalide (${reponse.status}) : ${texte}`,
      );
    }

    if (!reponse.ok) {
      throw new Error(
        resultat.erreur || resultat.message || `Erreur HTTP ${reponse.status}`,
      );
    }

    result.style.display = "flex";
    result.innerHTML = "Mail envoyé avec succès !";

    document.getElementById("mail-destinataire").value = "";
    document.getElementById("mail-objet").value = "";
    document.getElementById("mail-contenu").value = "";

    document.getElementById("formulaire-envoi-mail").style.display = "none";
  } catch (erreur) {
    console.error("❌ Erreur envoi mail :", erreur);

    alert("Impossible d'envoyer le mail.\n\n" + erreur.message);
  }
}

function ouvrirMotsDePasses() {
  document.getElementById("popup-mots-de-passes").style.display = "flex";
}

function fermerMotsDePasses() {
  document.getElementById("popup-mots-de-passes").style.display = "none";
}

let mot_de_passe_genere = "";

async function creerMotDePasse() {
  const longueur = parseInt(
    document.getElementById("longueur-input").value,
    10,
  );
  const majuscules = document.getElementById("majuscules-checkbox").checked;
  const minuscules = document.getElementById("minuscules-checkbox").checked;
  const chiffres = document.getElementById("chiffres-checkbox").checked;
  const symboles = document.getElementById("symboles-checkbox").checked;
  const exclure_ambigus = document.getElementById(
    "exclure-ambigus-checkbox",
  ).checked;

  const payload = {
    longueur: longueur,
    majuscules: majuscules,
    minuscules: minuscules,
    chiffres: chiffres,
    symboles: symboles,
    exclure_ambigus: exclure_ambigus,
  };

  try {
    const response = await fetch(`${API_URL}/mots-de-passes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      },
      body: JSON.stringify(payload),
    });

    // 1. Récupérer d'abord le texte brut de la réponse
    const textData = await response.text();

    // 2. Tenter de parser le JSON seulement s'il y a du contenu
    const result = textData ? JSON.parse(textData) : {};

    if (response.ok) {
      document.getElementById("mdp-result").style.display = "flex";
      document.getElementById("copier-mdp").style.display = "flex";
      document.getElementById("copier-mdp-button").style.display = "flex";
      document.getElementById("mdp-result").innerHTML =
        `Mot de passe: ${result.mot_de_passe}`;
      mot_de_passe_genere = result.mot_de_passe;
    } else {
      console.error(
        `Erreur HTTP ${response.status} :`,
        result.erreur || "Réponse vide du serveur",
      );
    }
  } catch (error) {
    console.error("Erreur réseau ou syntaxe :", error);
  }
}

async function copierMotDePasse() {
  try {
    await navigator.clipboard.writeText(mot_de_passe_genere);
  } catch (err) {
    console.error("Échec de la copie : ", err);
  }
}

window.onclick = function (event) {
  const popups = [
    "popup-musique",
    "popup-meteo",
    "popup-set-minuteur",
    "popup-set-alarme",
    "popup-sonnerie-alarme",
    "popup-mails",
    "popup-import-cours",
    "popup-revision-accueil",
    "popup-statistiques-revision",
    "popup-ouverture-boite",
    "popup-stats-yt",
    "popup-recherche",
    "popup-trajet",
    "popup-pronote",
    "popup-question-ia",
    "popup-repeter",
    "popup-calculatrice",
    "popup-convertir",
    "popup-traduction",
    "popup-notification",
    "popup-agenda",
    "popup-hasard",
    "popup-notes",
    "popup-resumer",
    "popup-analyser-image",
    "popup-correction",
    "popup-stl-gcode",
    "popup-compresseur",
    "popup-convertisseur-fichier",
    "popup-generer-image",
    "popup-mots-de-passes",
  ];
  for (const id of popups) {
    const popup = document.getElementById(id);
    if (event.target === popup) {
      popup.style.display = "none";
    }
  }
};

let dernierEtatDeskBot = null;

const ETATS_DESKBOT = {
  connecté: {
    nom: "En ligne",
    image: "img/en_ligne.svg",
    classe: "etat-connecté",
    description: "Le système est disponible.",
  },

  attente: {
    nom: "En veille",
    image: "img/hors_ligne.svg",
    classe: "etat-attente",
    description: "DeskBot est en veille.",
  },

  ecoute: {
    nom: "Écoute",
    image: "img/microphone.svg",
    classe: "etat-ecoute",
    description: "DeskBot écoute actuellement.",
  },

  reflexion: {
    nom: "Réflexion",
    image: "img/cerveau.svg",
    classe: "etat-reflexion",
    description: "DeskBot traite une demande.",
  },

  parle: {
    nom: "Parle",
    image: "img/parler.svg",
    classe: "etat-parle",
    description: "DeskBot est en train de parler.",
  },

  hors_ligne: {
    nom: "Hors ligne",
    image: "img/hors_ligne.svg",
    classe: "etat-hors-ligne",
    description: "DeskBot est inaccessible.",
  },
};

function afficherEtatDeskBot(etat) {
  const infos = ETATS_DESKBOT[etat];

  if (!infos) {
    console.warn("État DeskBot inconnu :", etat);
    return;
  }

  dernierEtatDeskBot = etat;

  // ==========================================
  // ANCIEN BLOC ÉTAT DESKBOT
  // ==========================================

  const image = document.getElementById("etat-deskbot-image");
  const texte = document.getElementById("etat-deskbot-texte");
  const carte = document.getElementById("etat-deskbot");

  if (image) {
    image.src = infos.image;
  }

  if (texte) {
    texte.textContent = infos.nom;
  }

  if (carte) {
    carte.className = "system-legacy-state etat-deskbot " + infos.classe;
  }

  // ==========================================
  // BADGE "EN LIGNE"
  // ==========================================

  const livePill = document.getElementById("deskbot-live-pill");
  const liveText = document.getElementById("deskbot-live-text");

  if (livePill) {
    livePill.className = "live-pill " + infos.classe;
  }

  if (liveText) {
    liveText.textContent = infos.nom;
  }

  // ==========================================
  // BLOC PRINCIPAL "DESKBOT EST PRÊT"
  // ==========================================

  const titre = document.getElementById("deskbot-status-title");
  const description = document.getElementById("deskbot-status-description");

  if (titre) {
    if (etat === "connecté") {
      titre.textContent = "DeskBot est prêt";
    } else if (etat === "hors_ligne") {
      titre.textContent = "DeskBot est hors ligne";
    } else {
      titre.textContent = "DeskBot " + infos.nom.toLowerCase();
    }
  }

  if (description) {
    description.textContent = infos.description;
  }

  // ==========================================
  // SIDEBAR
  // ==========================================

  const titre_sidebar = document.getElementById("sidebar-status-title");

  const description_sidebar = document.getElementById("sidebar-status-text");

  const point_sidebar = document.getElementById("sidebar-status-dot");

  const bloc_sidebar = document.getElementById("sidebar-status");

  if (titre_sidebar) {
    titre_sidebar.textContent = "DeskBot";
  }

  if (description_sidebar) {
    description_sidebar.textContent = infos.nom;
  }

  if (point_sidebar) {
    point_sidebar.className = "status-dot " + infos.classe;
  }

  if (bloc_sidebar) {
    bloc_sidebar.className = "sidebar-status " + infos.classe;
  }

  // ==========================================
  // SERVEUR
  // ==========================================

  const serveur = document.getElementById("system-serveur-text");

  if (serveur) {
    serveur.textContent = etat === "hors_ligne" ? "Hors ligne" : "Connecté";
  }

  // ==========================================
  // MICRO
  // ==========================================

  const micro = document.getElementById("system-micro-text");

  const microCard = document.getElementById("system-micro");

  const microDisponible = modeEnceinte && etat !== "hors_ligne";

  if (micro) {
    micro.textContent = microDisponible ? "Disponible" : "Indisponible";
  }

  if (microCard) {
    microCard.classList.toggle("indisponible", !microDisponible);
  }

  // ==========================================
  // AUDIO
  // ==========================================

  const audio = document.getElementById("system-audio-text");

  const audioCard = document.getElementById("system-audio");

  const audioDisponible = modeEnceinte && etat !== "hors_ligne";

  if (audio) {
    audio.textContent = audioDisponible ? "Disponible" : "Indisponible";
  }

  if (audioCard) {
    audioCard.classList.toggle("indisponible", !audioDisponible);
  }

  // ==========================================
  // SERVICES
  // ==========================================

  const services = document.getElementById("system-services-text");

  if (services) {
    services.textContent =
      etat === "hors_ligne" ? "Indisponibles" : "Opérationnels";
  }
}

async function chargerEtatDeskBot() {
  if (!TOKEN) {
    afficherEtatDeskBot("hors_ligne");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/etat`, {
      headers: {
        Authorization: "Bearer " + TOKEN,
      },

      cache: "no-store",
    });

    if (response.status === 401) {
      gererErreur401(response);
      afficherEtatDeskBot("hors_ligne");
      return;
    }

    if (!response.ok) {
      throw new Error("Serveur inaccessible : HTTP " + response.status);
    }

    const data = await response.json();

    if (!data.etat) {
      throw new Error("La réponse /etat ne contient aucun état.");
    }

    afficherEtatDeskBot(data.etat);

    if (data.reponse) {
      const reponse = document.getElementById("reponse");

      if (reponse) {
        reponse.textContent = "Réponse: " + data.reponse;
      }
    }
  } catch (erreur) {
    console.error("Impossible de récupérer l'état du DeskBot :", erreur);

    afficherEtatDeskBot("hors_ligne");
  }
}

// Vérification immédiate
chargerEtatDeskBot();

// Puis toutes les secondes
setInterval(chargerEtatDeskBot, 1000);
