// ============================================================
// DESKBOT — NAVIGATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initialiserNavigation();
  initialiserRechercheGlobale();
  initialiserSidebar();
});

// ============================================================
// NAVIGATION ENTRE LES SECTIONS
// ============================================================

function initialiserNavigation() {
  const boutons = document.querySelectorAll(".nav-item[data-section]");

  boutons.forEach((bouton) => {
    bouton.addEventListener("click", () => {
      const section = bouton.dataset.section;

      if (section) {
        changerSection(section);
      }
    });
  });

  // Section sauvegardée
  const sectionSauvegardee = localStorage.getItem("deskbot-section");

  if (
    sectionSauvegardee &&
    document.getElementById(`section-${sectionSauvegardee}`)
  ) {
    changerSection(sectionSauvegardee);
  } else {
    changerSection("accueil");
  }
}

// ============================================================
// CHANGER DE SECTION
// ============================================================

function changerSection(nomSection) {
  if (!nomSection) {
    return;
  }

  const sections = document.querySelectorAll(".app-section");

  const boutons = document.querySelectorAll(".nav-item[data-section]");

  const sectionCible = document.getElementById(`section-${nomSection}`);

  if (!sectionCible) {
    console.warn(`Section introuvable : ${nomSection}`);
    return;
  }

  // Masquer toutes les sections
  sections.forEach((section) => {
    section.classList.remove("active");
  });

  // Afficher la section demandée
  sectionCible.classList.add("active");

  // Mettre à jour les boutons de navigation
  boutons.forEach((bouton) => {
    const active = bouton.dataset.section === nomSection;

    bouton.classList.toggle("active", active);
  });

  // Sauvegarder la section
  localStorage.setItem("deskbot-section", nomSection);

  // Revenir en haut de la page
  const main = document.querySelector(".main-content");

  if (main) {
    main.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Événement utilisable par d'autres scripts
  document.dispatchEvent(
    new CustomEvent("deskbot:section-changee", {
      detail: {
        section: nomSection,
      },
    }),
  );
}

// ============================================================
// SIDEBAR
// ============================================================

function initialiserSidebar() {
  const sidebar = document.getElementById("sidebar");

  if (!sidebar) {
    return;
  }

  const sidebarReduite =
    localStorage.getItem("deskbot-sidebar-reduite") === "true";

  if (sidebarReduite) {
    sidebar.classList.add("collapsed");
  }
}

// ============================================================
// OUVRIR / FERMER LA SIDEBAR
// ============================================================

function basculerSidebar() {
  const sidebar = document.getElementById("sidebar");

  if (!sidebar) {
    return;
  }

  sidebar.classList.toggle("collapsed");

  const reduite = sidebar.classList.contains("collapsed");

  localStorage.setItem("deskbot-sidebar-reduite", reduite);

  const bouton = document.querySelector(".sidebar-toggle");

  if (bouton) {
    bouton.setAttribute(
      "aria-label",
      reduite ? "Agrandir la barre latérale" : "Réduire la barre latérale",
    );

    const fleche = bouton.querySelector("span");

    if (fleche) {
      fleche.textContent = reduite ? "›" : "‹";
    }
  }
}

// ============================================================
// CONNEXION DEPUIS LA NAVIGATION
// ============================================================

function ouvrirConnexionDepuisNavigation() {
  const popup = document.getElementById("popup-login");

  if (!popup) {
    console.warn("Popup de connexion introuvable.");
    return;
  }

  popup.style.display = "flex";

  const input = document.getElementById("mot-de-passe");

  if (input) {
    setTimeout(() => {
      input.focus();
    }, 100);
  }
}

// ============================================================
// RECHERCHE GLOBALE
// ============================================================

function initialiserRechercheGlobale() {
  const recherche = document.getElementById("recherche-globale");

  if (!recherche) {
    return;
  }

  recherche.addEventListener("input", effectuerRechercheGlobale);

  recherche.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      recherche.value = "";
      effectuerRechercheGlobale();
    }
  });
}

function effectuerRechercheGlobale() {
  const recherche = document.getElementById("recherche-globale");

  if (!recherche) {
    return;
  }

  const texte = recherche.value.toLowerCase().trim();

  const cartes = document.querySelectorAll(".feature-card[data-search]");

  // Si aucune recherche : tout afficher
  if (!texte) {
    cartes.forEach((carte) => {
      carte.style.display = "";
    });

    return;
  }

  const mots = texte.split(/\s+/).filter(Boolean);

  cartes.forEach((carte) => {
    const contenu = (carte.dataset.search || "").toLowerCase();

    const titre = (
      carte.querySelector("strong")?.textContent || ""
    ).toLowerCase();

    const description = (
      carte.querySelector("small")?.textContent || ""
    ).toLowerCase();

    const rechercheComplete = `${contenu} ${titre} ${description}`;

    const correspond = mots.every((mot) => rechercheComplete.includes(mot));

    carte.style.display = correspond ? "" : "none";
  });
}

function focusCommande() {
  document.getElementById("commande").focus({ focusVisible: true });
}

// ============================================================
// COMPATIBILITÉ AVEC LES ANCIENS SCRIPTS
// ============================================================

window.changerSection = changerSection;
window.basculerSidebar = basculerSidebar;
window.ouvrirConnexionDepuisNavigation = ouvrirConnexionDepuisNavigation;
