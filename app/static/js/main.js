let specialistsCache = [];

document.addEventListener('DOMContentLoaded', () => {

    console.log("🚀 Initialisation des statistiques...");
    
    // Tester d'abord l'API
    testStatsAPI().then(success => {
        if (success) {
            // Charger les vraies stats
            loadRealStats();
        } else {
            // Fallback sur les stats par défaut
            console.log("📊 Utilisation des stats par défaut");
            setupStatsCounter();
        }
    });
    
    setupHeroRdvButton();
    setupFadeInAnimation();
    setupStatsCounter();
    loadSpecialistes();
    setupConsultationForm();
    loadAnnoncesPageAccueil();
    initializeSearch();
});

function setupHeroRdvButton() {
    const btn = document.getElementById('heroRdvBtn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const section = document.getElementById('specialists');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

function setupFadeInAnimation() {
    const elements = document.querySelectorAll('.fade-in');
    const reveal = () => {
        elements.forEach((el) => {
            const top = el.getBoundingClientRect().top;
            if (top < window.innerHeight - 120) {
                el.classList.add('active');
            }
        });
    };
    reveal();
    window.addEventListener('scroll', reveal);
}

function setupStatsCounter() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach((el) => {
        const targetRaw = el.getAttribute('data-count') || '0';
        
        // Gérer les nombres avec virgule (comme 99.9)
        const target = parseFloat(targetRaw);
        
        if (isNaN(target)) return;
        
        // Déterminer si c'est un nombre entier ou décimal
        const isInteger = Number.isInteger(target);
        
        let current = 0;
        const steps = 60;
        const increment = target / steps;
        
        // Fonction d'animation
        const tick = () => {
            current += increment;
            
            if (current < target) {
                if (isInteger) {
                    el.textContent = Math.floor(current).toLocaleString('fr-FR');
                } else {
                    el.textContent = current.toFixed(1);
                }
                requestAnimationFrame(tick);
            } else {
                // Valeur finale
                if (isInteger) {
                    el.textContent = Math.round(target).toLocaleString('fr-FR');
                } else {
                    el.textContent = target.toFixed(1);
                }
            }
        };
        
        tick();
    });
}



async function loadSpecialistes() {
    const grid = document.getElementById('specialistsGrid');
    if (!grid) return;

    try {
        const response = await fetch('/api/public/specialistes');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const specialistes = await response.json();
        specialistsCache = Array.isArray(specialistes) ? specialistes : [];

        if (!Array.isArray(specialistes) || specialistes.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-light">Aucun spécialiste disponible pour le moment.</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = specialistes.map((m) => {
            const fullName = `Dr. ${m.prenom} ${m.nom}`;
            const photo = m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0066cc&color=fff&size=320`;
            return `
                <div class="col-md-6 col-lg-4">
                    <div class="specialist-card text-center h-100 d-flex flex-column">
                        <div class="specialist-photo">
                            <img src="${photo}" alt="${fullName}">
                        </div>
                        <h5>${fullName}</h5>
                        <p class="mb-1"><strong>Spécialité:</strong> ${m.specialite}</p>
                        <p class="mb-1"><strong>Expérience:</strong> ${m.annees_experience} ans</p>
                        <p class="mb-1"><strong>Cabinet:</strong> ${m.adresse_cabinet}</p>
                        <p class="mb-1"><strong>Téléphone:</strong> ${m.telephone}</p>
                        <p class="mb-3"><strong>Consultation:</strong> ${m.prix_consultation} FCFA</p>
                        <button class="btn btn-primary mt-auto js-rdv-btn" data-medecin-id="${m.id}">Prendre un rendez-vous</button>
                    </div>
                </div>
            `;
        }).join('');

        bindSpecialistRdvButtons();
    } catch (error) {
        console.error('Erreur chargement spécialistes:', error);
        grid.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">Impossible de charger les spécialistes.</div>
            </div>
        `;
    }
}

function openConsultationModalById(medecinId) {
    const medecin = specialistsCache.find((m) => Number(m.id) === Number(medecinId));
    if (!medecin) return;
    document.getElementById('consultMedecinId').value = medecin.id;
    document.getElementById('consultMedecinNom').value = `Dr. ${medecin.prenom} ${medecin.nom}`;

    showRdvModal();
}

function bindSpecialistRdvButtons() {
    const grid = document.getElementById('specialistsGrid');
    if (!grid) return;

    grid.querySelectorAll('.js-rdv-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const medecinId = Number(btn.getAttribute('data-medecin-id'));
            openConsultationModalById(medecinId);
        });
    });
}

function showRdvModal() {
    const modalElement = document.getElementById('rdvModal');
    if (!modalElement) return;

    if (window.bootstrap && bootstrap.Modal) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.show();
        return;
    }

    // Fallback si bootstrap JS n'est pas disponible
    modalElement.classList.add('show');
    modalElement.style.display = 'block';
    modalElement.removeAttribute('aria-hidden');
    modalElement.setAttribute('aria-modal', 'true');
    document.body.classList.add('modal-open');
}

function hideRdvModal() {
    const modalElement = document.getElementById('rdvModal');
    if (!modalElement) return;

    if (window.bootstrap && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(modalElement).hide();
        return;
    }

    modalElement.classList.remove('show');
    modalElement.style.display = 'none';
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.removeAttribute('aria-modal');
    document.body.classList.remove('modal-open');
}

function setupConsultationForm() {
    const form = document.getElementById('publicConsultationForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            medecin_id: Number(document.getElementById('consultMedecinId').value),
            visiteur_prenom: document.getElementById('consultPrenom').value.trim(),
            visiteur_nom: document.getElementById('consultNom').value.trim(),
            motif_consultation: document.getElementById('consultMotif').value.trim(),
            date_heure: document.getElementById('consultDateHeure').value,
            visiteur_email: document.getElementById('consultEmail').value.trim(),
            visiteur_telephone: document.getElementById('consultTelephone').value.trim()
        };

        try {
            const response = await fetch('/api/public/consultations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Erreur lors de la soumission');
            }

            alert('Votre demande a été envoyée avec succès. Un email récapitulatif vous a été transmis.');
            form.reset();
            hideRdvModal();
        } catch (error) {
            console.error('Erreur soumission consultation:', error);
            alert(error.message || 'Une erreur est survenue.');
        }
    });
}



/// Fonction pour charger et afficher les annonces
async function loadAnnoncesPageAccueil() {
    const announcementsContainer = document.getElementById('announcementsContainer');
    if (!announcementsContainer) return;

    try {
        // CORRECTION : Enlever '/admin' du chemin
        const response = await fetch('/admin/api/public/annonces');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const annonces = await response.json();

        if (!Array.isArray(annonces) || annonces.length === 0) {
            announcementsContainer.innerHTML = '';
            return;
        }

        let announcementHTML = `
            <section class="announcements-section py-4 bg-light">
                <div class="container">
                    <h2 class="mb-4">Actualités & Annonces</h2>
                    <div class="row g-4">
        `;

        annonces.forEach((annonce) => {
            const imageUrl = annonce.image_url || 'https://via.placeholder.com/400x200?text=Annonce';
            const description = annonce.description_courte || annonce.contenu.substring(0, 150) + '...';
            const categorie = annonce.categorie ? `<span class="badge bg-primary me-2">${escapeHtml(annonce.categorie)}</span>` : '';
            
            announcementHTML += `
                <div class="col-md-6 col-lg-4">
                    <div class="announcement-card h-100 d-flex flex-column">
                        <div class="announcement-image">
                            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(annonce.titre)}" class="img-fluid">
                            ${categorie}
                        </div>
                        <div class="announcement-content flex-grow-1 d-flex flex-column">
                            <h5 class="announcement-title">${escapeHtml(annonce.titre)}</h5>
                            <p class="announcement-text flex-grow-1">${escapeHtml(description)}</p>
                            <div class="announcement-footer">
                                <small class="text-muted">${formatDate(annonce.date_creation)}</small>
                                ${annonce.lien_cible ? `
                                    <a href="${escapeHtml(annonce.lien_cible)}" class="btn btn-sm btn-primary mt-2">
                                        ${escapeHtml(annonce.lien_texte || 'En savoir plus')}
                                    </a>
                                ` : `
                                    <button class="btn btn-sm btn-primary mt-2" onclick="viewAnnouncementDetail(${annonce.id})">
                                        Voir plus
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        announcementHTML += `
                    </div>
                </div>
            </section>
        `;

        announcementsContainer.innerHTML = announcementHTML;
        
        // Ajouter le modal si nécessaire
        if (!document.getElementById('announcementModal')) {
            addAnnouncementModal();
        }

    } catch (error) {
        console.error('Erreur chargement annonces:', error);
        announcementsContainer.innerHTML = '';
    }
}

// Ajouter le modal des annonces
function addAnnouncementModal() {
    if (document.getElementById('announcementModal')) return;

    const modalHTML = `
        <div class="modal fade" id="announcementModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="announcementTitle">Annonce</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <img id="announcementImage" src="" alt="" class="img-fluid mb-3" style="max-height: 300px; object-fit: cover;">
                        <div id="announcementContent"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Voir les détails d'une annonce
window.viewAnnouncementDetail = async function(announcementId) {
    try {
        const response = await fetch('/admin/api/public/annonces');
        const annonces = await response.json();
        const annonce = annonces.find(a => a.id === announcementId);

        if (!annonce) return;

        document.getElementById('announcementTitle').textContent = escapeHtml(annonce.titre);
        document.getElementById('announcementImage').src = escapeHtml(annonce.image_url || 'https://via.placeholder.com/400x200');
        
        let contentHTML = `
            <p><strong>Catégorie:</strong> ${escapeHtml(annonce.categorie || '-')}</p>
            <p><strong>Date:</strong> ${formatDate(annonce.date_creation)}</p>
            <hr>
            <div class="announcement-body">${escapeHtml(annonce.contenu)}</div>
        `;

        if (annonce.lien_cible) {
            contentHTML += `
                <hr>
                <a href="${escapeHtml(annonce.lien_cible)}" class="btn btn-primary" target="_blank">
                    ${escapeHtml(annonce.lien_texte || 'Visiter le lien')}
                </a>
            `;
        }

        document.getElementById('announcementContent').innerHTML = contentHTML;

        const modal = new bootstrap.Modal(document.getElementById('announcementModal'));
        modal.show();
    } catch (error) {
        console.error('Erreur:', error);
    }
};


function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ============================================
// FONCTION DE RECHERCHE SUR LA PAGE
// ============================================

let searchTimeout = null;

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchButton || !searchResults) return;
    
    // Fonction principale de recherche
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            searchResults.innerHTML = '';
            searchResults.classList.remove('show');
            return;
        }
        
        // Récupérer tout le contenu texte de la page
        const pageContent = document.body.innerText || document.body.textContent;
        const lines = pageContent.split('\n');
        
        // Chercher les lignes contenant le terme de recherche
        const matches = [];
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        
        lines.forEach((line, index) => {
            line = line.trim();
            if (line && regex.test(line)) {
                // Trouver le contexte autour du match
                const matchIndex = line.toLowerCase().indexOf(searchTerm.toLowerCase());
                const start = Math.max(0, matchIndex - 30);
                const end = Math.min(line.length, matchIndex + searchTerm.length + 30);
                
                let context = line.substring(start, end);
                if (start > 0) context = '...' + context;
                if (end < line.length) context = context + '...';
                
                // Mettre en évidence le terme recherché
                const highlightedContext = context.replace(regex, match => `<mark>${match}</mark>`);
                
                matches.push({
                    text: line,
                    context: highlightedContext,
                    index: index
                });
            }
        });
        
        // Afficher les résultats
        displaySearchResults(matches, searchTerm);
    }
    
    function displaySearchResults(matches, searchTerm) {
        if (matches.length === 0) {
            searchResults.innerHTML = `
                <div class="alert alert-info">
                    Aucun résultat trouvé pour "<strong>${escapeHtml(searchTerm)}</strong>"
                </div>
            `;
        } else {
            const resultsList = matches.slice(0, 10).map((match, idx) => `
                <div class="search-result-item p-2 border-bottom" style="cursor: pointer;" onclick="scrollToText('${escapeHtml(match.text)}')">
                    <div class="small text-muted">Résultat ${idx + 1}/${matches.length}</div>
                    <div class="mt-1">${match.context}</div>
                </div>
            `).join('');
            
            searchResults.innerHTML = `
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        ${matches.length} résultat(s) trouvé(s) pour "<strong>${escapeHtml(searchTerm)}</strong>"
                    </div>
                    <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                        ${resultsList}
                    </div>
                </div>
            `;
        }
        
        searchResults.classList.add('show');
    }
    
    // Recherche en temps réel avec délai
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    });
    
    // Recherche au clic sur le bouton
    searchButton.addEventListener('click', performSearch);
    
    // Recherche avec la touche Entrée
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
    
    // Fermer les résultats en cliquant ailleurs
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !searchButton.contains(e.target)) {
            searchResults.classList.remove('show');
        }
    });
}

// Fonction pour faire défiler jusqu'au texte trouvé
window.scrollToText = function(text) {
    // Nettoyer le texte pour la recherche
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    
    // Parcourir tous les éléments pour trouver celui qui contient le texte
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                if (node.parentElement.tagName === 'SCRIPT' || 
                    node.parentElement.tagName === 'STYLE' ||
                    node.parentElement.classList.contains('search-result-item')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    const textNodes = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }
    
    // Chercher le noeud contenant le texte
    for (let node of textNodes) {
        if (node.nodeValue.includes(cleanText)) {
            // Mettre en évidence temporairement
            const range = document.createRange();
            range.selectNode(node);
            
            // Faire défiler jusqu'à l'élément
            node.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Ajouter un effet de surbrillance
            const originalBg = node.parentElement.style.backgroundColor;
            node.parentElement.style.backgroundColor = '#fff3cd';
            node.parentElement.style.transition = 'background-color 1s';
            
            setTimeout(() => {
                node.parentElement.style.backgroundColor = originalBg;
            }, 2000);
            
            break;
        }
    }
    
    // Fermer les résultats
    document.getElementById('searchResults').classList.remove('show');
};

// Fonction utilitaire pour échapper le HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialiser la recherche au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
});


// === Fonction pour charger les statistiques réelles depuis la base de données ===
async function loadRealStats() {
    try {
        console.log("📊 Chargement des statistiques depuis la base de données...");
        
        const response = await fetch('/api/public/stats');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        console.log("✅ Statistiques reçues:", data);
        
        if (data.success && data.stats) {
            // Mettre à jour les éléments avec les vraies données
            updateStatElement('patients_geres', data.stats.patients_geres);
            updateStatElement('professionnels_sante', data.stats.professionnels_sante);
            updateStatElement('consultations_realisees', data.stats.consultations_realisees);
            updateStatElement('taux_satisfaction', data.stats.taux_satisfaction);
            
            // Déclencher l'animation des compteurs
            setupStatsCounter();
        } else {
            console.warn("⚠️ Données de statistiques invalides, utilisation des valeurs par défaut");
            // Utiliser les valeurs par défaut du HTML
            setupStatsCounter();
        }
        
    } catch (error) {
        console.error('❌ Erreur chargement statistiques:', error);
        // En cas d'erreur, utiliser les valeurs par défaut du HTML
        setupStatsCounter();
    }
}

function updateStatElement(statName, value) {
    // Trouver l'élément correspondant à la statistique
    let element = null;
    
    switch(statName) {
        case 'patients_geres':
            element = document.querySelector('.stat-number[data-count="50000"]');
            break;
        case 'professionnels_sante':
            element = document.querySelector('.stat-number[data-count="1500"]');
            break;
        case 'consultations_realisees':
            element = document.querySelector('.stat-number[data-count="200000"]');
            break;
        case 'taux_satisfaction':
            element = document.querySelector('.stat-number[data-count="99.9"]');
            break;
    }
    
    if (element) {
        // Formater le nombre
        let formattedValue = value;
        if (statName === 'taux_satisfaction') {
            formattedValue = value.toFixed(1);
        } else {
            formattedValue = Math.round(value).toLocaleString('fr-FR');
        }
        
        // Mettre à jour l'attribut data-count
        element.setAttribute('data-count', formattedValue);
        console.log(`✅ Statistique ${statName} mise à jour: ${formattedValue}`);
    } else {
        console.warn(`⚠️ Élément pour ${statName} non trouvé`);
    }
}

// Fonction de test pour vérifier que les stats fonctionnent
async function testStatsAPI() {
    try {
        console.log("🔍 Test de l'API stats...");
        const response = await fetch('/api/public/stats');
        const data = await response.json();
        console.log("📊 Résultat du test:", data);
        
        if (data.success) {
            console.log("✅ API stats fonctionne correctement");
            return true;
        } else {
            console.warn("⚠️ API stats a retourné une erreur");
            return false;
        }
    } catch (error) {
        console.error("❌ Erreur lors du test API stats:", error);
        return false;
    }
}