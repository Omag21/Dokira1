let inscriptionsEnAttente = [];
let inscriptionSelectionnee = null;
let tousLesMedecins = [];

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupEventListeners();
    loadAdminProfile();
    refreshInscriptionsData();
    loadTousLesMedecinsParSpecialite();
    loadMedecinsActifsDuJour();
    loadPatientsList();
    loadNominationData();
    loadRevenueStats();
    initAnnoncesSection();
    loadDashboardData();
    initSearch(); 
});

async function apiFetch(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erreur ${response.status}`);
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }
    return null;
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');

    if (sectionId === 'tous-medecins') {
        loadTousLesMedecinsParSpecialite();
    }
    if (sectionId === 'medecins-actifs') {
        loadMedecinsActifsDuJour();
    }
    if (sectionId === 'patients') {
        loadPatientsList();
    }
    if (sectionId === 'ajouter-medecin') {
        loadNominationData();
    }
}

function setupEventListeners() {
    const approveBtn = document.getElementById('approveMedecinBtn');
    const rejectBtn = document.getElementById('rejectMedecinBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const toggleBtn = document.getElementById('toggleSidebar');

    if (approveBtn) approveBtn.addEventListener('click', approveInscription);
    if (rejectBtn) rejectBtn.addEventListener('click', rejectInscription);
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/admin/deconnexionAdmin';
        });
    }
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.querySelector('.sidebar')?.classList.toggle('open');
        });
    }

    // AJOUTER CES LIGNES POUR LES STATISTIQUES
    const refreshBtn = document.querySelector('.btn-primary .fa-sync-alt')?.closest('button');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            refreshStats();
        });
    }

    const periodSelect = document.getElementById('statsPeriod');
    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            const period = e.target.value;
            loadRevenueStatsWithPeriod(period);
        });
    }

    const chartPeriodSelect = document.getElementById('chartPeriod');
    if (chartPeriodSelect) {
        chartPeriodSelect.addEventListener('change', (e) => {
            const period = e.target.value;
            updateChartPeriod(period);
        });
    }
    // FIN DE L'AJOUT

    document.addEventListener('click', e => {
        if (e.target.classList.contains('close-modal')) {
            e.target.closest('.modal')?.classList.remove('show');
        }
    });

    const filterCategory = document.getElementById('filterCategory');
    if (filterCategory) {
        filterCategory.addEventListener('change', () => {
            renderTousMedecinsBySpecialite(filterCategory.value || '');
        });
    }

    const addForm = document.getElementById('addMedecinForm');
    if (addForm) {
        addForm.addEventListener('submit', onNommerAdminSubmit);
    }
}


// Fonction pour charger les stats avec une période spécifique
async function loadRevenueStatsWithPeriod(period) {
    try {
        // Afficher un indicateur de chargement
        showStatsLoading(true);
        
        // Ici vous pouvez appeler une API avec le paramètre period si votre backend le supporte
        // Pour l'instant, on recharge simplement les données
        await loadRevenueStats();
        
        // Mettre à jour le texte du filtre pour indiquer la période sélectionnée
        const periodText = {
            'today': "aujourd'hui",
            'week': 'cette semaine',
            'month': 'ce mois',
            'year': 'cette année'
        }[period] || '';
        
        console.log(`Données actualisées pour ${periodText}`);
        
    } catch (error) {
        console.error('Erreur chargement période:', error);
    } finally {
        showStatsLoading(false);
    }
}

// Fonction pour mettre à jour la période du graphique
function updateChartPeriod(period) {
    console.log(`Mise à jour du graphique pour les ${period} derniers jours`);
    // Ici vous pouvez recharger le graphique avec de nouvelles données
    // Pour l'instant, on recharge juste les stats
    loadRevenueStats();
}

// Fonction pour afficher/masquer un indicateur de chargement
function showStatsLoading(show) {
    const statsCards = document.querySelectorAll('.stat-card');
    if (show) {
        statsCards.forEach(card => {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
        });
    } else {
        statsCards.forEach(card => {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        });
    }
}

// Amélioration de la fonction refreshStats existante
function refreshStats() {
    // Ajouter un effet visuel sur le bouton
    const refreshBtn = document.querySelector('.btn-primary .fa-sync-alt')?.closest('button');
    if (refreshBtn) {
        const icon = refreshBtn.querySelector('i');
        if (icon) {
            icon.classList.add('fa-spin');
        }
    }
    
    // Recharger les stats
    loadRevenueStats().finally(() => {
        // Enlever l'animation après 1 seconde
        setTimeout(() => {
            const icon = refreshBtn?.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-spin');
            }
        }, 1000);
    });
}


async function loadAdminProfile() {
    try {
        const profile = await apiFetch('/admin/api/profile');
        const fullName = profile?.nom_complet || 'Administrateur';
        const photo = profile?.photo_profil_url || 'https://via.placeholder.com/40';

        const adminName = document.getElementById('adminName');
        const adminPhoto = document.getElementById('adminPhoto');
        const settingsPhoto = document.getElementById('settingsAdminPhoto');
        const adminFullName = document.getElementById('adminFullName');
        const adminEmail = document.getElementById('adminEmail');
        const adminPhone = document.getElementById('adminPhone');

        if (adminName) adminName.textContent = fullName;
        if (adminPhoto) adminPhoto.src = photo;
        if (settingsPhoto) settingsPhoto.src = photo;
        if (adminFullName) adminFullName.value = fullName;
        if (adminEmail) adminEmail.value = profile?.email || '';
        if (adminPhone) adminPhone.value = profile?.telephone || '';
    } catch (error) {
        console.error(error);
    }
}

async function refreshInscriptionsData() {
    await Promise.all([
        loadInscriptionsEnAttente(),
        updateDashboardCounters(),
        loadPendingWidget()
    ]);
}

async function loadTousLesMedecinsParSpecialite() {
    try {
        tousLesMedecins = await apiFetch('/admin/api/tous-medecins');
    } catch (error) {
        console.error(error);
        tousLesMedecins = [];
    }
    buildCategoryFilter();
    renderTousMedecinsBySpecialite(document.getElementById('filterCategory')?.value || '');
}

function buildCategoryFilter() {
    const filter = document.getElementById('filterCategory');
    if (!filter) return;
    const categories = [...new Set(tousLesMedecins.map(m => m.specialite || 'Non définie'))].sort((a, b) => a.localeCompare(b));
    filter.innerHTML = '<option value="">Toutes les catégories</option>' + categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function renderTousMedecinsBySpecialite(selectedCategory = '') {
    const container = document.getElementById('medecinsByCategory');
    if (!container) return;

    let list = [...tousLesMedecins];
    if (selectedCategory) {
        list = list.filter(m => (m.specialite || 'Non définie') === selectedCategory);
    }

    if (!list.length) {
        container.innerHTML = '<p class="empty-state">Aucun médecin trouvé</p>';
        return;
    }

    const byCategory = {};
    list.forEach(m => {
        const key = m.specialite || 'Non définie';
        if (!byCategory[key]) byCategory[key] = [];
        byCategory[key].push(m);
    });

    const categories = Object.keys(byCategory).sort((a, b) => a.localeCompare(b));
    container.innerHTML = categories.map(category => {
        const medecins = byCategory[category];
        return `
            <div style="margin-bottom:24px;">
                <h3 style="margin-bottom:10px;">${escapeHtml(category)} (${medecins.length})</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Statut</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${medecins.map(m => `
                                <tr>
                                    <td>${escapeHtml(m.nom_complet || `${m.prenom || ''} ${m.nom || ''}`.trim())}</td>
                                    <td>${escapeHtml(m.email || '-')}</td>
                                    <td>${escapeHtml(m.telephone || '-')}</td>
                                    <td>${escapeHtml(m.statut_inscription || '-')}</td>
                                    <td>
                                        <button class="btn btn-small btn-primary" onclick="viewMedecinProfessionnel(${m.id})">
                                            <i class="fas fa-eye"></i> Voir
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }).join('');
}

window.viewMedecinProfessionnel = async function (medecinId) {
    try {
        const profile = await apiFetch(`/admin/api/medecins/${medecinId}/profil-professionnel`);
        const detailsContainer = document.getElementById('medecinDetails');
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Informations professionnelles du médecin';

        const rows = [
            ['Nom complet', profile.nom_complet || '-'],
            ['Spécialité', profile.specialite || '-'],
            ['Email', profile.email || '-'],
            ['Téléphone', profile.telephone || '-'],
            ['Numéro ordre', profile.numero_ordre || '-'],
            ['Adresse', profile.adresse || '-'],
            ['Ville', profile.ville || '-'],
            ['Code postal', profile.code_postal || '-'],
            ['Langues', profile.langues || '-'],
            ['Biographie', profile.biographie || '-'],
            ['Années d\'expérience', profile.annees_experience ?? '-'],
            ['Prix consultation', profile.prix_consultation ?? '-'],
            ['Statut', profile.statut_inscription || '-']
        ];

        if (detailsContainer) {
            detailsContainer.innerHTML = rows.map(([label, value]) => `
                <div class="detail-item">
                    <span class="detail-label">${escapeHtml(label)}:</span>
                    <span class="detail-value">${escapeHtml(value)}</span>
                </div>
            `).join('');
        }

        toggleApprovalControls(false);
        document.getElementById('medecinModal')?.classList.add('show');
    } catch (error) {
        console.error(error);
        alert('Impossible de charger le profil professionnel du médecin.');
    }
};

async function loadMedecinsActifsDuJour() {
    const section = document.getElementById('medecins-actifs');
    if (!section) return;
    let container = document.getElementById('activeDayCards');
    if (!container) {
        container = document.createElement('div');
        container.id = 'activeDayCards';
        container.style.marginTop = '16px';
        section.appendChild(container);
    }

    try {
        const payload = await apiFetch('/admin/api/medecins-actifs-jour');
        const cards = payload.cards || [];
        if (!cards.length) {
            container.innerHTML = '<p class="empty-state">Aucun médecin actif avec consultation/rendez-vous prévu aujourd\'hui.</p>';
            return;
        }

        container.innerHTML = cards.map(c => {
            const medecin = c.medecin || {};
            const patient = c.patient || {};
            return `
                <div class="card" style="margin-bottom:14px;">
                    <div class="card-content" style="padding:14px;">
                        <p style="margin:0 0 8px 0;font-weight:700;">${c.event_type === 'consultation' ? 'Consultation' : 'Rendez-vous'} - ${formatDateTime(c.date_heure)}</p>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                            <div style="background:#f8fafc;padding:10px;border-radius:8px;">
                                <h4 style="margin:0 0 8px 0;">Médecin</h4>
                                <p style="margin:0;">${escapeHtml(medecin.nom_complet || '-')}</p>
                                <p style="margin:0;">Spécialité: ${escapeHtml(medecin.specialite || '-')}</p>
                                <p style="margin:0;">Email: ${escapeHtml(medecin.email || '-')}</p>
                                <p style="margin:0;">Tél: ${escapeHtml(medecin.telephone || '-')}</p>
                                <p style="margin:0;">Adresse: ${escapeHtml([medecin.adresse, medecin.ville].filter(Boolean).join(', ') || '-')}</p>
                            </div>
                            <div style="background:#f8fafc;padding:10px;border-radius:8px;">
                                <h4 style="margin:0 0 8px 0;">Patient</h4>
                                <p style="margin:0;">${escapeHtml(patient.nom_complet || '-')}</p>
                                <p style="margin:0;">Email: ${escapeHtml(patient.email || '-')}</p>
                                <p style="margin:0;">Tél: ${escapeHtml(patient.telephone || '-')}</p>
                                <p style="margin:0;">Adresse: ${escapeHtml([patient.adresse, patient.ville].filter(Boolean).join(', ') || '-')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="empty-state">Erreur lors du chargement des médecins actifs du jour.</p>';
    }
}

async function loadPatientsList() {
    const tbody = document.getElementById('patientTable');
    if (!tbody) return;
    try {
        const patients = await apiFetch('/admin/api/patients');
        if (!patients.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Aucun patient</td></tr>';
            return;
        }

        tbody.innerHTML = patients.map(p => `
            <tr>
                <td><img src="${escapeHtml(p.photo_profil_url || 'https://via.placeholder.com/80')}" alt="${escapeHtml(p.nom_complet || '')}" class="table-photo"></td>
                <td>${escapeHtml(p.nom_complet || '-')}</td>
                <td>${escapeHtml(p.email || '-')}</td>
                <td>${escapeHtml(p.telephone || '-')}</td>
                <td>${escapeHtml(formatDate(p.date_creation))}</td>
                <td>${escapeHtml(String(p.consultations_count ?? 0))}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="viewPatientProfil(${p.id})">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Erreur de chargement des patients</td></tr>';
    }
}

window.viewPatientProfil = async function (patientId) {
    try {
        const profile = await apiFetch(`/admin/api/patients/${patientId}/profil`);
        const detailsContainer = document.getElementById('medecinDetails');
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.textContent = 'Informations du patient';

        const rows = [
            ['Nom complet', profile.nom_complet || '-'],
            ['Email', profile.email || '-'],
            ['Téléphone', profile.telephone || '-'],
            ['Téléphone urgence', profile.telephone_urgence || '-'],
            ['Date de naissance', profile.date_naissance ? formatDate(profile.date_naissance) : '-'],
            ['Genre', profile.genre || '-'],
            ['Adresse', [profile.adresse, profile.adresse_ligne2, profile.ville, profile.code_postal, profile.pays].filter(Boolean).join(', ') || '-'],
            ['NSS', profile.numero_securite_sociale || '-'],
            ['Groupe sanguin', profile.groupe_sanguin || '-'],
            ['Allergies', profile.allergies || '-'],
            ['Antécédents médicaux', profile.antecedents_medicaux || '-'],
            ['Antécédents familiaux', profile.antecedents_familiaux || '-'],
            ['Traitements en cours', profile.traitements_en_cours || '-'],
            ['Mutuelle', [profile.mutuelle_nom, profile.mutuelle_numero].filter(Boolean).join(' - ') || '-'],
            ['Médecin traitant', [profile.medecin_traitant_nom, profile.medecin_traitant_telephone].filter(Boolean).join(' - ') || '-'],
            ['Date inscription', formatDate(profile.date_creation)]
        ];

        if (detailsContainer) {
            detailsContainer.innerHTML = rows.map(([label, value]) => `
                <div class="detail-item">
                    <span class="detail-label">${escapeHtml(label)}:</span>
                    <span class="detail-value">${escapeHtml(value)}</span>
                </div>
            `).join('');
        }

        toggleApprovalControls(false);
        document.getElementById('medecinModal')?.classList.add('show');
    } catch (error) {
        console.error(error);
        alert('Impossible de charger le profil patient.');
    }
};

async function loadNominationData() {
    await renderNominationSection();
}

async function renderNominationSection() {
    const section = document.getElementById('ajouter-medecin');
    if (!section) return;

    section.innerHTML = `
        <h2>Nommer un médecin comme administrateur</h2>
        <form class="form-container" id="addMedecinForm">
            <div class="form-group">
                <label>Sélectionner un médecin</label>
                <select id="selectMedecinToAdmin" required>
                    <option value="">Choisir un médecin</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary">Nommer Admin</button>
        </form>
        <div style="margin-top:24px;">
            <h3>Administrateurs actuels</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                        </tr>
                    </thead>
                    <tbody id="adminsCurrentTable">
                        <tr><td colspan="3" class="empty-state">Chargement...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const [admins, medecins] = await Promise.all([
        apiFetch('/admin/api/administrateurs').catch(() => []),
        apiFetch('/admin/api/tous-medecins').catch(() => [])
    ]);

    const adminEmails = new Set(admins.map(a => (a.email || '').toLowerCase()));
    const eligibles = medecins.filter(m => {
        const isApproved = (m.statut_inscription || '').toUpperCase() === 'APPROUVEE';
        const isActive = Boolean(m.est_actif);
        const email = (m.email || '').toLowerCase();
        return isApproved && isActive && email && !adminEmails.has(email);
    });

    const select = document.getElementById('selectMedecinToAdmin');
    if (select) {
        select.innerHTML = '<option value="">Choisir un médecin</option>' +
            eligibles.map(m => `<option value="${m.id}">${escapeHtml(m.nom_complet || m.email)}</option>`).join('');
    }

    const adminsTable = document.getElementById('adminsCurrentTable');
    if (adminsTable) {
        adminsTable.innerHTML = admins.length
            ? admins.map(a => `
                <tr>
                    <td>${escapeHtml(a.nom_complet || `${a.prenom || ''} ${a.nom || ''}`.trim())}</td>
                    <td>${escapeHtml(a.email || '-')}</td>
                    <td>${escapeHtml(a.telephone || '-')}</td>
                </tr>
              `).join('')
            : '<tr><td colspan="3" class="empty-state">Aucun administrateur</td></tr>';
    }

    const form = document.getElementById('addMedecinForm');
    if (form) {
        form.addEventListener('submit', onNommerAdminSubmit);
    }
}

async function onNommerAdminSubmit(e) {
    e.preventDefault();
    const select = document.getElementById('selectMedecinToAdmin');
    if (!select || !select.value) {
        alert('Veuillez sélectionner un médecin.');
        return;
    }

    try {
        const result = await apiFetch(`/admin/api/administrateurs/nommer/${encodeURIComponent(select.value)}`, {
            method: 'POST'
        });
        alert(result?.message || 'Médecin nommé administrateur.');
        await renderNominationSection();
    } catch (error) {
        console.error(error);
        alert('Erreur lors de la nomination.');
    }
}

async function loadInscriptionsEnAttente() {
    try {
        inscriptionsEnAttente = await apiFetch('/admin/api/inscriptions-en-attente');
    } catch (error) {
        console.error(error);
        inscriptionsEnAttente = [];
    }
    renderInscriptionsTable();
}

function renderInscriptionsTable() {
    const tbody = document.getElementById('pendingMedecinTable');
    if (!tbody) return;

    if (!inscriptionsEnAttente.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Aucune inscription en attente</td></tr>';
        return;
    }

    tbody.innerHTML = inscriptionsEnAttente.map(item => {
        const photo = item.photo_profil_url || 'https://via.placeholder.com/80';
        const name = item.nom_complet || `${item.prenom || ''} ${item.nom || ''}`.trim();
        const typeLabel = item.profil_type === 'admin' ? 'Admin' : 'Médecin';
        const spec = item.specialite || '-';
        const phone = item.telephone || '-';
        const dateInscription = formatDate(item.date_creation);
        return `
            <tr>
                <td><img src="${escapeHtml(photo)}" alt="${escapeHtml(name)}" class="table-photo"></td>
                <td><span style="font-weight:600;">${escapeHtml(name)}</span><br><small>${typeLabel}</small></td>
                <td>${escapeHtml(item.email || '-')}</td>
                <td>${escapeHtml(spec)}</td>
                <td>${escapeHtml(phone)}</td>
                <td>${escapeHtml(dateInscription)}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="viewInscriptionDetails('${item.profil_type}', ${item.id})">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function loadPendingWidget() {
    const pendingList = document.getElementById('pendingList');
    if (!pendingList) return;

    if (!inscriptionsEnAttente.length) {
        pendingList.innerHTML = '<p class="empty-state">Aucune inscription en attente</p>';
        return;
    }

    pendingList.innerHTML = inscriptionsEnAttente.slice(0, 8).map(item => {
        const typeLabel = item.profil_type === 'admin' ? 'Admin' : 'Médecin';
        return `
            <div style="padding:10px;border-bottom:1px solid #eee;">
                <p style="margin:0;font-weight:600;">${escapeHtml(item.nom_complet || item.email || '')}</p>
                <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">${typeLabel}</p>
            </div>
        `;
    }).join('');
}

async function updateDashboardCounters() {
    try {
        const stats = await apiFetch('/admin/api/inscriptions/statistiques');
        const pending = Number(stats.pending_total || 0);
        const approved = Number(stats.approved_total || 0);
        const rejected = Number(stats.rejected_total || 0);

        const cardPending = document.getElementById('cardPending');
        const badgePending = document.getElementById('badge-attente');
        if (cardPending) cardPending.textContent = String(pending);
        if (badgePending) badgePending.textContent = String(pending);

        ensureDecisionCards();
        const cardApproved = document.getElementById('cardApprovedInscriptions');
        const cardRejected = document.getElementById('cardRejectedInscriptions');
        if (cardApproved) cardApproved.textContent = String(approved);
        if (cardRejected) cardRejected.textContent = String(rejected);
    } catch (error) {
        console.error(error);
    }
}

function ensureDecisionCards() {
    if (document.getElementById('cardApprovedInscriptions') && document.getElementById('cardRejectedInscriptions')) {
        return;
    }

    const cardsContainer = document.querySelector('#tableau-bord .dashboard-cards');
    if (!cardsContainer) return;

    const approvedCard = document.createElement('div');
    approvedCard.className = 'card';
    approvedCard.innerHTML = `
        <div class="card-icon" style="background:#16a34a;">
            <i class="fas fa-check-circle"></i>
        </div>
        <div class="card-content">
            <h3>Validées</h3>
            <p class="card-number" id="cardApprovedInscriptions">0</p>
        </div>
    `;

    const rejectedCard = document.createElement('div');
    rejectedCard.className = 'card';
    rejectedCard.innerHTML = `
        <div class="card-icon" style="background:#dc2626;">
            <i class="fas fa-times-circle"></i>
        </div>
        <div class="card-content">
            <h3>Rejetées</h3>
            <p class="card-number" id="cardRejectedInscriptions">0</p>
        </div>
    `;

    cardsContainer.appendChild(approvedCard);
    cardsContainer.appendChild(rejectedCard);
}

window.viewInscriptionDetails = function (profilType, id) {
    const item = inscriptionsEnAttente.find(x => x.profil_type === profilType && Number(x.id) === Number(id));
    if (!item) return;
    inscriptionSelectionnee = item;

    const detailsContainer = document.getElementById('medecinDetails');
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = `Détails inscription ${item.profil_type === 'admin' ? 'Administrateur' : 'Médecin'}`;
    }

    const rows = [
        ['Type', item.profil_type === 'admin' ? 'Administrateur' : 'Médecin'],
        ['Nom', item.nom || '-'],
        ['Prénom', item.prenom || '-'],
        ['Email', item.email || '-'],
        ['Téléphone', item.telephone || '-'],
        ['Spécialité', item.specialite || '-'],
        ['Numéro ordre', item.numero_ordre || '-'],
        ['Adresse', item.adresse || '-'],
        ['Ville', item.ville || '-'],
        ['Code postal', item.code_postal || '-'],
        ['Langues', item.langues || '-'],
        ['Biographie', item.biographie || '-'],
        ['Date inscription', formatDate(item.date_creation)]
    ];

    if (detailsContainer) {
        detailsContainer.innerHTML = rows.map(([label, value]) => `
            <div class="detail-item">
                <span class="detail-label">${escapeHtml(label)}:</span>
                <span class="detail-value">${escapeHtml(value || '-')}</span>
            </div>
        `).join('');
    }

    const rejectInput = document.getElementById('rejectReasonInput');
    if (rejectInput) rejectInput.value = '';
    toggleApprovalControls(true);
    const modal = document.getElementById('medecinModal');
    modal?.classList.add('show');
};

async function approveInscription() {
    if (!inscriptionSelectionnee) return;
    try {
        await apiFetch(
            `/admin/api/inscriptions/${encodeURIComponent(inscriptionSelectionnee.profil_type)}/${inscriptionSelectionnee.id}/approuver`,
            { method: 'POST' }
        );
        closeModal('medecinModal');
        await refreshInscriptionsData();
        alert('Inscription approuvée.');
    } catch (error) {
        console.error(error);
        alert('Erreur lors de l’approbation.');
    }
}

async function rejectInscription() {
    if (!inscriptionSelectionnee) return;
    const rejectInput = document.getElementById('rejectReasonInput');
    const motif = rejectInput ? rejectInput.value.trim() : '';
    const formData = new FormData();
    formData.append('motif_refus', motif);

    try {
        await apiFetch(
            `/admin/api/inscriptions/${encodeURIComponent(inscriptionSelectionnee.profil_type)}/${inscriptionSelectionnee.id}/rejeter`,
            {
                method: 'POST',
                body: formData
            }
        );
        closeModal('medecinModal');
        await refreshInscriptionsData();
        alert('Inscription rejetée.');
    } catch (error) {
        console.error(error);
        alert('Erreur lors du rejet.');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('show');
}

function toggleApprovalControls(show) {
    const approveBtn = document.getElementById('approveMedecinBtn');
    const rejectBtn = document.getElementById('rejectMedecinBtn');
    const rejectInput = document.getElementById('rejectReasonInput');
    if (approveBtn) approveBtn.style.display = show ? '' : 'none';
    if (rejectBtn) rejectBtn.style.display = show ? '' : 'none';
    if (rejectInput) {
        const wrap = rejectInput.closest('.form-group');
        if (wrap) wrap.style.display = show ? '' : 'none';
    }
}

function formatDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('fr-FR');
}

function formatDateTime(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('fr-FR');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


// ============= STATISTIQUES AMÉLIORÉES =============

async function loadRevenueStats(period = 'month') {
    try {
        // Ajouter le paramètre period à l'URL si votre backend le supporte
        const url = `/admin/api/statistiques/tableau-bord${period ? `?period=${period}` : ''}`;
        
        const [medecins, categories, dashboard] = await Promise.all([
            apiFetch('/admin/api/statistiques/revenus-medecins'),
            apiFetch('/admin/api/statistiques/revenus-categories'),
            apiFetch(url)  // Utiliser l'URL avec période
        ]);

        updateStatsCards(dashboard);
        displayRevenueByDoctorsTable(medecins);
        displayRevenueByCategoryCards(categories);
        initChart(dashboard);
    } catch (error) {
        console.error('Erreur chargement statistiques:', error);
    }
}

function updateStatsCards(stats) {
    // Mettre à jour les cartes principales
    document.getElementById('totalConsultations').textContent = stats.total_consultations || 0;
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.total_revenu || 0);
    document.getElementById('monthRevenue').textContent = formatCurrency(stats.revenu_mois || 0);
    
    // Calculer la moyenne par jour
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const avgDaily = (stats.revenu_mois || 0) / daysInMonth;
    document.getElementById('avgDaily').textContent = formatCurrency(avgDaily);
}

function displayRevenueByDoctorsTable(medecins) {
    const tbody = document.getElementById('revenueByDoctorsBody');
    if (!tbody) return;

    if (!medecins || medecins.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Aucune donnée</td></tr>';
        return;
    }

    tbody.innerHTML = medecins.map(m => {
        const performance = calculatePerformance(m.total_consultations);
        const initials = m.nom_complet.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return `
            <tr>
                <td>
                    <div class="doctor-info">
                        <div class="doctor-avatar">${initials}</div>
                        <strong>${escapeHtml(m.nom_complet)}</strong>
                    </div>
                </td>
                <td><span class="specialty-badge">${escapeHtml(m.specialite)}</span></td>
                <td><strong>${m.total_consultations}</strong></td>
                <td><span class="stat-value-small">${formatCurrency(m.revenu_total)}</span></td>
                <td>
                    <div class="performance-bar">
                        <div class="performance-fill" style="width: ${performance}%"></div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function displayRevenueByCategoryCards(categories) {
    const container = document.getElementById('revenueByCategoryBody');
    if (!container) return;

    if (!categories || categories.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucune donnée</p>';
        return;
    }

    const maxRevenue = Math.max(...categories.map(c => c.revenu_total));
    
    container.innerHTML = `
        <div class="category-cards">
            ${categories.map(c => {
                const percentage = (c.revenu_total / maxRevenue) * 100;
                return `
                    <div class="category-item">
                        <div class="category-name">
                            <i class="fas fa-stethoscope"></i>
                            ${escapeHtml(c.categorie)}
                        </div>
                        <div class="category-stats">
                            <div class="category-stat-row">
                                <span class="category-stat-label">Médecins</span>
                                <span class="category-stat-value">${c.medecins_count}</span>
                            </div>
                            <div class="category-stat-row">
                                <span class="category-stat-label">Consultations</span>
                                <span class="category-stat-value">${c.total_consultations}</span>
                            </div>
                            <div class="category-stat-row">
                                <span class="category-stat-label">Revenu total</span>
                                <span class="category-stat-value">${formatCurrency(c.revenu_total)}</span>
                            </div>
                            <div class="stat-progress">
                                <div class="stat-progress-bar" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function initChart(stats) {
    // Initialiser un graphique simple avec Chart.js si disponible
    if (typeof Chart !== 'undefined') {
        const ctx = document.getElementById('consultationsChart')?.getContext('2d');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                    datasets: [{
                        label: 'Consultations',
                        data: [12, 19, 15, stats.total_consultations || 0],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }
}

function calculatePerformance(consultations) {
    // Calculer un pourcentage de performance (exemple)
    const max = 30; // Objectif de consultations
    return Math.min(100, (consultations / max) * 100);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount).replace('XOF', 'FCFA');
}

function refreshStats() {
    loadRevenueStats();
}

function exportToExcel(type) {
    // Fonction pour exporter les données
    alert(`Export des données ${type} en cours...`);
}


function updateDashboardWithRevenue(stats) {
    const revenueCard = document.getElementById('totalRevenueCard');
    const revenueMonthCard = document.getElementById('revenueMonthCard');
    const consultationsCard = document.getElementById('totalConsultationsCard');

    if (revenueCard) revenueCard.textContent = (stats.total_revenu || 0).toFixed(2) + ' FCFA';
    if (revenueMonthCard) revenueMonthCard.textContent = (stats.revenu_mois || 0).toFixed(2) + ' FCFA';
    if (consultationsCard) consultationsCard.textContent = stats.total_consultations || 0;

    ensureRevenueCards(stats);
}

function ensureRevenueCards(stats) {
    const cardsContainer = document.querySelector('#tableau-bord .dashboard-cards');
    if (!cardsContainer || document.getElementById('totalRevenueCard')) return;

    const revenueCard = document.createElement('div');
    revenueCard.className = 'card';
    revenueCard.innerHTML = `
        <div class="card-icon" style="background:#8b5cf6;"><i class="fas fa-coins"></i></div>
        <div class="card-content"><h3>Revenus Totaux</h3><p class="card-number" id="totalRevenueCard">${(stats.total_revenu || 0).toFixed(2)} FCFA</p></div>
    `;
    cardsContainer.appendChild(revenueCard);

    const revenueMonthCard = document.createElement('div');
    revenueMonthCard.className = 'card';
    revenueMonthCard.innerHTML = `
        <div class="card-icon" style="background:#f59e0b;"><i class="fas fa-dollar-sign"></i></div>
        <div class="card-content"><h3>Revenus Mois</h3><p class="card-number" id="revenueMonthCard">${(stats.revenu_mois || 0).toFixed(2)} FCFA</p></div>
    `;
    cardsContainer.appendChild(revenueMonthCard);

    const consultationsCard = document.createElement('div');
    consultationsCard.className = 'card';
    consultationsCard.innerHTML = `
        <div class="card-icon" style="background:#10b981;"><i class="fas fa-stethoscope"></i></div>
        <div class="card-content"><h3>Consultations</h3><p class="card-number" id="totalConsultationsCard">${stats.total_consultations || 0}</p></div>
    `;
    cardsContainer.appendChild(consultationsCard);
}




// ============= GESTION DES ANNONCES =============

// Initialiser la section annonces
function initAnnoncesSection() {
    const form = document.getElementById('addAnnonceForm');
    if (form) {
        // Remplacer le comportement par défaut du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // EMPÊCHE LA REDIRECTION
            await addAnnonce(e);
        });
    }
    
    // Charger les annonces quand la section est affichée
    const annoncesLink = document.querySelector('[data-section="annonces"]');
    if (annoncesLink) {
        annoncesLink.addEventListener('click', () => {
            setTimeout(loadAnnonces, 100);
        });
    }
}

// Charger la liste des annonces
async function loadAnnonces() {
    const container = document.getElementById('annoncesList');
    if (!container) return;

    try {
        const annonces = await apiFetch('/admin/api/annonces');
        
        if (!annonces || annonces.length === 0) {
            container.innerHTML = '<p class="empty-state text-center p-4">Aucune annonce active</p>';
            return;
        }

        let html = `
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>Image</th>
                        <th>Titre</th>
                        <th>Catégorie</th>
                        <th>Contenu</th>
                        <th>Date création</th>
                        <th>Expiration</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        annonces.forEach(annonce => {
            const imageHtml = annonce.image_url 
                ? `<img src="${escapeHtml(annonce.image_url)}" alt="${escapeHtml(annonce.titre)}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">`
                : '<span class="text-muted">-</span>';
            
            const categorieHtml = annonce.categorie 
                ? `<span class="badge bg-${getCategoryColor(annonce.categorie)}">${escapeHtml(annonce.categorie)}</span>`
                : '-';
            
            const contenuCourt = annonce.contenu.length > 50 
                ? annonce.contenu.substring(0, 50) + '...' 
                : annonce.contenu;
            
            html += `
                <tr>
                    <td>${imageHtml}</td>
                    <td><strong>${escapeHtml(annonce.titre)}</strong></td>
                    <td>${categorieHtml}</td>
                    <td>${escapeHtml(contenuCourt)}</td>
                    <td>${formatDate(annonce.dateCreation)}</td>
                    <td>${annonce.date_expiration ? formatDate(annonce.date_expiration) : '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteAnnonce(${annonce.id})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    } catch (error) {
        console.error('Erreur chargement annonces:', error);
        container.innerHTML = '<p class="empty-state text-danger text-center p-4">Erreur lors du chargement des annonces</p>';
    }
}

// Obtenir la couleur de la catégorie pour le badge
function getCategoryColor(categorie) {
    const colors = {
        'promotion': 'success',
        'info': 'info',
        'urgence': 'danger',
        'evenement': 'warning'
    };
    return colors[categorie.toLowerCase()] || 'secondary';
}

// Ajouter une annonce
async function addAnnonce(event) {
    event.preventDefault(); // S'assurer que le formulaire ne redirige pas
    
    const form = document.getElementById('addAnnonceForm');
    const formData = new FormData(form);
    
    // Ajouter les champs optionnels s'ils sont vides
    if (!formData.get('description_courte')) {
        formData.delete('description_courte');
    }
    if (!formData.get('lien_cible')) {
        formData.delete('lien_cible');
    }
    if (!formData.get('lien_texte')) {
        formData.delete('lien_texte');
    }
    if (!formData.get('date_expiration')) {
        formData.delete('date_expiration');
    }
    
    try {
        // Afficher un indicateur de chargement
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ajout en cours...';
        submitBtn.disabled = true;

        const response = await fetch('/admin/api/annonces/ajouter', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors de l\'ajout');
        }

        const result = await response.json();
        
        // Réinitialiser le formulaire
        form.reset();
        
        // Recharger la liste
        await loadAnnonces();
        
        // Afficher un message de succès
        alert('✅ Annonce ajoutée avec succès !');
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de l\'ajout de l\'annonce: ' + error.message);
    } finally {
        // Restaurer le bouton
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Ajouter l\'annonce';
        submitBtn.disabled = false;
    }
}

// Supprimer une annonce
async function deleteAnnonce(annonceId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/admin/api/annonces/${annonceId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Erreur lors de la suppression');
        }

        await loadAnnonces(); // Recharger la liste
        alert('✅ Annonce supprimée avec succès');
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur lors de la suppression: ' + error.message);
    }
}




// ============= MISE À JOUR DU TABLEAU DE BORD =============

// Fonction pour charger toutes les données du tableau de bord
async function loadDashboardData() {
    try {
        // Charger le nombre de médecins actifs
        await loadActiveDoctorsCount();
        
        // Charger le nombre total de patients
        await loadTotalPatientsCount();
        
        // Charger le nombre d'inscriptions en attente
        await loadPendingCount();
        
        // Charger les revenus du mois
        await loadMonthlyRevenue();
        
        // Charger les activités récentes
        await loadRecentActivities();
        
    } catch (error) {
        console.error('Erreur chargement tableau de bord:', error);
    }
}

// Fonction pour charger le nombre de médecins actifs
async function loadActiveDoctorsCount() {
    try {
        const medecins = await apiFetch('/admin/api/tous-medecins');
        const activeDoctors = medecins.filter(m => m.est_actif === true).length;
        
        // Mettre à jour l'affichage dans la carte
        const activeDoctorsCard = document.querySelector('.dashboard-cards .card:nth-child(1) .card-number');
        if (activeDoctorsCard) {
            activeDoctorsCard.textContent = activeDoctors;
        }
        
        // Alternative: chercher par le texte "Médecins Actifs"
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (card.textContent.includes('Médecins Actifs')) {
                const numberElement = card.querySelector('.card-number');
                if (numberElement) numberElement.textContent = activeDoctors;
            }
        });
        
    } catch (error) {
        console.error('Erreur chargement médecins actifs:', error);
    }
}

// Fonction pour charger le nombre total de patients
async function loadTotalPatientsCount() {
    try {
        const patients = await apiFetch('/admin/api/patients');
        const totalPatients = patients.length;
        
        // Mettre à jour l'affichage dans la carte
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (card.textContent.includes('Patients')) {
                const numberElement = card.querySelector('.card-number');
                if (numberElement) numberElement.textContent = totalPatients;
            }
        });
        
    } catch (error) {
        console.error('Erreur chargement patients:', error);
    }
}


// Fonction pour charger les revenus du mois
async function loadMonthlyRevenue() {
    try {
        const dashboard = await apiFetch('/admin/api/statistiques/tableau-bord');
        const monthlyRevenue = dashboard.revenu_mois || 0;
        
        // Formater le montant
        const formattedRevenue = formatCurrency(monthlyRevenue);
        
        // Mettre à jour l'affichage dans la carte
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (card.textContent.includes('Revenus (Mois)') || card.textContent.includes('Revenus Mois')) {
                const numberElement = card.querySelector('.card-number');
                if (numberElement) numberElement.textContent = formattedRevenue;
            }
        });
        
    } catch (error) {
        console.error('Erreur chargement revenus du mois:', error);
    }
}

// Fonction pour charger les activités récentes de l'admin
async function loadRecentActivities() {
    try {
        // Récupérer les activités depuis différentes sources
        const activities = [];
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 heure
        
        // Récupérer les inscriptions approuvées/récentes
        const inscriptions = await apiFetch('/admin/api/inscriptions/statistiques');
        
        // Récupérer les dernières annonces ajoutées
        const annonces = await apiFetch('/admin/api/annonces');
        
        // Construire la liste des activités
        if (annonces && annonces.length > 0) {
            const recentAnnonces = annonces.filter(a => {
                const dateCreation = new Date(a.dateCreation);
                return dateCreation > oneHourAgo;
            });
            
            recentAnnonces.forEach(annonce => {
                activities.push({
                    type: 'annonce',
                    description: `Nouvelle annonce: "${annonce.titre}"`,
                    time: new Date(annonce.dateCreation),
                    icon: 'fa-bullhorn',
                    color: '#3498db'
                });
            });
        }
        
        // Ajouter quelques activités simulées si nécessaire
        if (activities.length === 0) {
            activities.push({
                type: 'info',
                description: 'Aucune activité récente',
                time: new Date(),
                icon: 'fa-info-circle',
                color: '#95a5a6'
            });
        }
        
        // Trier par date (plus récent d'abord)
        activities.sort((a, b) => b.time - a.time);
        
        // Afficher les activités
        displayRecentActivities(activities);
        
    } catch (error) {
        console.error('Erreur chargement activités récentes:', error);
        
        // En cas d'erreur, afficher un message
        const activityContainer = document.querySelector('.dashboard-grid .widget:first-child');
        if (activityContainer) {
            activityContainer.innerHTML = `
                <h3>Activité Récente</h3>
                <div class="activity-list">
                    <div class="activity-item">
                        <i class="fas fa-exclamation-circle" style="color: #e74c3c;"></i>
                        <div class="activity-content">
                            <p>Impossible de charger les activités</p>
                            <small>${formatDateTime(new Date())}</small>
                        </div>
                    </div>
                </div>
            `;
        }
    }
}

// Fonction pour afficher les activités récentes
function displayRecentActivities(activities) {
    const activityContainer = document.querySelector('.dashboard-grid .widget:first-child');
    if (!activityContainer) return;
    
    const activityHtml = `
        <h3>Activité Récente</h3>
        <div class="activity-list">
            ${activities.map(activity => `
                <div class="activity-item">
                    <i class="fas ${activity.icon}" style="color: ${activity.color};"></i>
                    <div class="activity-content">
                        <p>${escapeHtml(activity.description)}</p>
                        <small>${formatTimeAgo(activity.time)}</small>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    activityContainer.innerHTML = activityHtml;
}

// Fonction pour formater le temps écoulé
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    
    return formatDate(date);
}


// ============= RECHERCHE GLOBALE =============

let searchTimeout = null;
let allSearchData = {
    medecins: [],
    patients: [],
    annonces: [],
    inscriptions: []
};

// Initialiser la recherche
function initSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (!searchInput) return;
    
    // Créer le conteneur de résultats s'il n'existe pas
    if (!document.getElementById('searchResults')) {
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'searchResults';
        resultsDiv.className = 'search-results';
        searchInput.parentElement.appendChild(resultsDiv);
    }
    
    // Ajouter l'écouteur d'événement
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear previous timeout
        if (searchTimeout) clearTimeout(searchTimeout);
        
        if (query.length < 2) {
            hideSearchResults();
            return;
        }
        
        // Debounce pour éviter trop de requêtes
        searchTimeout = setTimeout(() => performSearch(query), 300);
    });
    
    // Cacher les résultats quand on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-bar')) {
            hideSearchResults();
        }
    });
}

// Effectuer la recherche
async function performSearch(query) {
    try {
        showSearchLoading();
        
        // Charger toutes les données si pas déjà fait
        await loadSearchData();
        
        // Rechercher dans les médecins
        const medecinResults = allSearchData.medecins.filter(m => 
            (m.nom_complet && m.nom_complet.toLowerCase().includes(query.toLowerCase())) ||
            (m.email && m.email.toLowerCase().includes(query.toLowerCase())) ||
            (m.specialite && m.specialite.toLowerCase().includes(query.toLowerCase()))
        );
        
        // Rechercher dans les patients
        const patientResults = allSearchData.patients.filter(p => 
            (p.nom_complet && p.nom_complet.toLowerCase().includes(query.toLowerCase())) ||
            (p.email && p.email.toLowerCase().includes(query.toLowerCase()))
        );
        
        // Rechercher dans les annonces
        const annonceResults = allSearchData.annonces.filter(a => 
            (a.titre && a.titre.toLowerCase().includes(query.toLowerCase())) ||
            (a.contenu && a.contenu.toLowerCase().includes(query.toLowerCase()))
        );
        
        // Rechercher dans les inscriptions en attente
        const inscriptionResults = allSearchData.inscriptions.filter(i => 
            (i.nom_complet && i.nom_complet.toLowerCase().includes(query.toLowerCase())) ||
            (i.email && i.email.toLowerCase().includes(query.toLowerCase()))
        );
        
        displaySearchResults({
            medecins: medecinResults.slice(0, 5),
            patients: patientResults.slice(0, 5),
            annonces: annonceResults.slice(0, 5),
            inscriptions: inscriptionResults.slice(0, 5)
        }, query);
        
    } catch (error) {
        console.error('Erreur recherche:', error);
    }
}

// Charger toutes les données pour la recherche
async function loadSearchData() {
    try {
        const [medecins, patients, annonces, inscriptions] = await Promise.all([
            apiFetch('/admin/api/tous-medecins').catch(() => []),
            apiFetch('/admin/api/patients').catch(() => []),
            apiFetch('/admin/api/annonces').catch(() => []),
            apiFetch('/admin/api/inscriptions-en-attente').catch(() => [])
        ]);
        
        allSearchData = {
            medecins: medecins || [],
            patients: patients || [],
            annonces: annonces || [],
            inscriptions: inscriptions || []
        };
    } catch (error) {
        console.error('Erreur chargement données recherche:', error);
    }
}

// Afficher les résultats de recherche
function displaySearchResults(results, query) {
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    
    const totalResults = results.medecins.length + results.patients.length + 
                        results.annonces.length + results.inscriptions.length;
    
    if (totalResults === 0) {
        resultsDiv.innerHTML = `
            <div class="search-result-section">
                <p class="no-results">Aucun résultat pour "${escapeHtml(query)}"</p>
            </div>
        `;
        resultsDiv.classList.add('show');
        return;
    }
    
    let html = '';
    
    // Résultats médecins
    if (results.medecins.length > 0) {
        html += `
            <div class="search-result-section">
                <div class="section-title">
                    <i class="fas fa-user-md"></i> Médecins (${results.medecins.length})
                </div>
                ${results.medecins.map(m => `
                    <div class="search-result-item" onclick="goToMedecin(${m.id})">
                        <div class="result-icon"><i class="fas fa-user-md"></i></div>
                        <div class="result-content">
                            <div class="result-title">${escapeHtml(m.nom_complet || 'Médecin')}</div>
                            <div class="result-subtitle">${escapeHtml(m.specialite || 'Spécialité non définie')} • ${escapeHtml(m.email || '')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Résultats patients
    if (results.patients.length > 0) {
        html += `
            <div class="search-result-section">
                <div class="section-title">
                    <i class="fas fa-user"></i> Patients (${results.patients.length})
                </div>
                ${results.patients.map(p => `
                    <div class="search-result-item" onclick="goToPatient(${p.id})">
                        <div class="result-icon"><i class="fas fa-user"></i></div>
                        <div class="result-content">
                            <div class="result-title">${escapeHtml(p.nom_complet || 'Patient')}</div>
                            <div class="result-subtitle">${escapeHtml(p.email || '')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Résultats annonces
    if (results.annonces.length > 0) {
        html += `
            <div class="search-result-section">
                <div class="section-title">
                    <i class="fas fa-bullhorn"></i> Annonces (${results.annonces.length})
                </div>
                ${results.annonces.map(a => `
                    <div class="search-result-item" onclick="goToAnnonce(${a.id})">
                        <div class="result-icon"><i class="fas fa-bullhorn"></i></div>
                        <div class="result-content">
                            <div class="result-title">${escapeHtml(a.titre)}</div>
                            <div class="result-subtitle">${escapeHtml(a.contenu.substring(0, 50))}...</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Résultats inscriptions
    if (results.inscriptions.length > 0) {
        html += `
            <div class="search-result-section">
                <div class="section-title">
                    <i class="fas fa-clock"></i> Inscriptions en attente (${results.inscriptions.length})
                </div>
                ${results.inscriptions.map(i => `
                    <div class="search-result-item" onclick="goToInscription('${i.profil_type}', ${i.id})">
                        <div class="result-icon"><i class="fas fa-clock"></i></div>
                        <div class="result-content">
                            <div class="result-title">${escapeHtml(i.nom_complet || 'Inscription')}</div>
                            <div class="result-subtitle">${escapeHtml(i.email || '')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    resultsDiv.innerHTML = html;
    resultsDiv.classList.add('show');
}

// Afficher le chargement
function showSearchLoading() {
    const resultsDiv = document.getElementById('searchResults');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = `
        <div class="search-loading">
            <i class="fas fa-spinner fa-spin"></i> Recherche en cours...
        </div>
    `;
    resultsDiv.classList.add('show');
}

// Cacher les résultats
function hideSearchResults() {
    const resultsDiv = document.getElementById('searchResults');
    if (resultsDiv) {
        resultsDiv.classList.remove('show');
    }
}

// Fonctions de navigation
window.goToMedecin = function(medecinId) {
    showSection('tous-medecins');
    setTimeout(() => viewMedecinProfessionnel(medecinId), 300);
    hideSearchResults();
};

window.goToPatient = function(patientId) {
    showSection('patients');
    setTimeout(() => viewPatientProfil(patientId), 300);
    hideSearchResults();
};

window.goToAnnonce = function(annonceId) {
    showSection('annonces');
    hideSearchResults();
};

window.goToInscription = function(profilType, id) {
    showSection('tableau-bord');
    setTimeout(() => viewInscriptionDetails(profilType, id), 300);
    hideSearchResults();
};