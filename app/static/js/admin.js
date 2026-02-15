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
