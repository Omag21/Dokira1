// ============================================
// DONNÉES SIMULÉES (À remplacer par API)
// ============================================

let currentAdmin = {
    id: 1,
    nom: 'Dr. Ahmed Benali',
    email: 'admin@plateforme.com',
    telephone: '+212 6 12 34 56 78',
    photo: null
};

let medecinsEnAttente = [
    {
        id: 101,
        nom: 'Dr. Fatima El Alaoui',
        email: 'fatima@doctor.com',
        specialite: 'Cardiologie',
        telephone: '+212 6 11 22 33 44',
        prix: 150,
        bio: 'Cardiologue spécialisée',
        dateInscription: '2025-01-20',
        photo: 'https://via.placeholder.com/80'
    },
    {
        id: 102,
        nom: 'Dr. Hassan Belkaid',
        email: 'hassan@doctor.com',
        specialite: 'Pédiatrie',
        telephone: '+212 6 55 66 77 88',
        prix: 100,
        bio: 'Pédiatre expérimenté',
        dateInscription: '2025-01-19',
        photo: 'https://via.placeholder.com/80'
    }
];

let medecinsActifs = [
    {
        id: 201,
        nom: 'Dr. Amina Bennani',
        email: 'amina@doctor.com',
        specialite: 'Dermatologie',
        telephone: '+212 6 99 88 77 66',
        prix: 120,
        statut: 'actif',
        photo: 'https://via.placeholder.com/80'
    },
    {
        id: 202,
        nom: 'Dr. Mohamed Bachir',
        email: 'bachir@doctor.com',
        specialite: 'Neurologie',
        telephone: '+212 6 44 55 66 77',
        prix: 180,
        statut: 'actif',
        photo: 'https://via.placeholder.com/80'
    }
];

let patients = [
    {
        id: 301,
        nom: 'Jean Paul Dupont',
        email: 'jean@email.com',
        telephone: '+212 6 11 11 11 11',
        dateInscription: '2025-01-15',
        consultations: 5,
        photo: 'https://via.placeholder.com/80'
    },
    {
        id: 302,
        nom: 'Marie Moreau',
        email: 'marie@email.com',
        telephone: '+212 6 22 22 22 22',
        dateInscription: '2025-01-10',
        consultations: 3,
        photo: 'https://via.placeholder.com/80'
    }
];

let annonces = [];
let administrateurs = [
    {
        id: 1,
        nom: currentAdmin.nom,
        email: currentAdmin.email,
        dateNomination: '2024-06-15'
    }
];

let consultations = [];
let medecinSelectionne = null;

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadAdminProfile();
    setupNavigation();
    setupEventListeners();
    updateDashboard();
    loadMedecinsPendants();
    loadMedicinsActifs();
    loadPatients();
    loadAdministrateurs();
    generateDummyConsultations();
}

// ============================================
// NAVIGATION
// ============================================

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
            
            // Mettre à jour l'active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// ============================================
// TABLEAU DE BORD
// ============================================

function updateDashboard() {
    document.getElementById('cardActiveMedecins').textContent = medecinsActifs.length;
    document.getElementById('cardPatients').textContent = patients.length;
    document.getElementById('cardPending').textContent = medecinsEnAttente.length;
    document.getElementById('badge-attente').textContent = medecinsEnAttente.length;
    
    // Calculer les revenus du mois
    const monthRevenue = calculateMonthRevenue();
    document.getElementById('cardRevenue').textContent = monthRevenue.toFixed(2) + '€';
    
    // Charger l'activité récente
    loadRecentActivity();
    loadPendingList();
}

function calculateMonthRevenue() {
    return consultations
        .filter(c => isCurrentMonth(c.date))
        .reduce((total, c) => total + (c.montant || 0), 0);
}

function isCurrentMonth(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (consultations.length === 0) {
        activityList.innerHTML = '<p class="empty-state">Aucune activité pour le moment</p>';
        return;
    }
    
    const recentActivity = consultations.slice(-5).reverse();
    activityList.innerHTML = recentActivity.map(c => `
        <div style="padding: 10px; border-bottom: 1px solid #eee;">
            <p style="margin: 0; font-weight: 600;">${c.medecinNom} - ${c.patientNom}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #7f8c8d;">${c.date}</p>
        </div>
    `).join('');
}

function loadPendingList() {
    const pendingList = document.getElementById('pendingList');
    if (medecinsEnAttente.length === 0) {
        pendingList.innerHTML = '<p class="empty-state">Aucune inscription en attente</p>';
        return;
    }
    
    pendingList.innerHTML = medecinsEnAttente.map(m => `
        <div style="padding: 10px; border-bottom: 1px solid #eee;">
            <p style="margin: 0; font-weight: 600;">${m.nom}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #7f8c8d;">${m.specialite}</p>
        </div>
    `).join('');
}

// ============================================
// MÉDECINS EN ATTENTE
// ============================================

function loadMedecinsPendants() {
    const tbody = document.getElementById('pendingMedecinTable');
    
    if (medecinsEnAttente.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Aucun médecin en attente</td></tr>';
        return;
    }
    
    tbody.innerHTML = medecinsEnAttente.map(m => `
        <tr>
            <td><img src="${m.photo}" alt="${m.nom}" class="table-photo"></td>
            <td>${m.nom}</td>
            <td>${m.email}</td>
            <td>${m.specialite}</td>
            <td>${m.telephone}</td>
            <td>${m.dateInscription}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="viewMedecinDetails(${m.id})">
                    <i class="fas fa-eye"></i> Voir
                </button>
            </td>
        </tr>
    `).join('');
}

function viewMedecinDetails(id) {
    const medecin = medecinsEnAttente.find(m => m.id === id);
    if (!medecin) return;
    
    medecinSelectionne = medecin;
    
    const detailsHtml = `
        <div class="detail-item">
            <span class="detail-label">Nom:</span>
            <span class="detail-value">${medecin.nom}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${medecin.email}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Téléphone:</span>
            <span class="detail-value">${medecin.telephone}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Spécialité:</span>
            <span class="detail-value">${medecin.specialite}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Prix Consultation:</span>
            <span class="detail-value">${medecin.prix}€</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Bio:</span>
            <span class="detail-value">${medecin.bio}</span>
        </div>
        <div class="detail-item">
            <span class="detail-label">Date Inscription:</span>
            <span class="detail-value">${medecin.dateInscription}</span>
        </div>
    `;
    
    document.getElementById('medecinDetails').innerHTML = detailsHtml;
    document.getElementById('medecinModal').classList.add('show');
}

function approveMedecin() {
    if (!medecinSelectionne) return;
    
    // Ajouter aux médecins actifs
    medecinsActifs.push({
        id: medecinSelectionne.id,
        nom: medecinSelectionne.nom,
        email: medecinSelectionne.email,
        specialite: medecinSelectionne.specialite,
        telephone: medecinSelectionne.telephone,
        prix: medecinSelectionne.prix,
        statut: 'actif',
        photo: medecinSelectionne.photo
    });
    
    // Retirer des médecins en attente
    medecinsEnAttente = medecinsEnAttente.filter(m => m.id !== medecinSelectionne.id);
    
    // Rediriger le médecin vers son espace
    // window.location.href = 'EspaceMedecin.html?medecinId=' + medecinSelectionne.id;
    
    alert(`Le médecin ${medecinSelectionne.nom} a été approuvé. Redirection en cours...`);
    
    // Fermer modal et actualiser
    closeModal('medecinModal');
    loadMedecinsPendants();
    updateDashboard();
    loadMedicinsActifs();
}

function rejectMedecin() {
    if (!medecinSelectionne) return;
    
    if (confirm(`Êtes-vous sûr de vouloir rejeter ${medecinSelectionne.nom} ?`)) {
        medecinsEnAttente = medecinsEnAttente.filter(m => m.id !== medecinSelectionne.id);
        closeModal('medecinModal');
        loadMedecinsPendants();
        updateDashboard();
    }
}

// ============================================
// MÉDECINS ACTIFS
// ============================================

function loadMedicinsActifs() {
    const tbody = document.getElementById('activeMedecinTable');
    
    if (medecinsActifs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Aucun médecin actif</td></tr>';
        return;
    }
    
    tbody.innerHTML = medecinsActifs.map(m => `
        <tr>
            <td><img src="${m.photo}" alt="${m.nom}" class="table-photo"></td>
            <td>${m.nom}</td>
            <td>${m.email}</td>
            <td>${m.specialite}</td>
            <td>${m.prix}€</td>
            <td><span style="background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${m.statut}</span></td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteMedecin(${m.id})">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </td>
        </tr>
    `).join('');
    
    // Populate speciality filter
    const specialities = [...new Set(medecinsActifs.map(m => m.specialite))];
    const filterSelect = document.getElementById('filterSpeciality');
    filterSelect.innerHTML = '<option value="">Toutes les spécialités</option>' + 
        specialities.map(s => `<option value="${s}">${s}</option>`).join('');
}

function deleteMedecin(id) {
    const medecin = medecinsActifs.find(m => m.id === id);
    if (!medecin) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer le Dr. ${medecin.nom} ?`)) {
        medecinsActifs = medecinsActifs.filter(m => m.id !== id);
        loadMedicinsActifs();
        updateDashboard();
    }
}

// ============================================
// TOUS LES MÉDECINS PAR CATÉGORIE
// ============================================

function loadAllMedecinsByCategory() {
    const allMedecins = [...medecinsActifs, ...medecinsEnAttente];
    const categories = [...new Set(allMedecins.map(m => m.specialite))];
    
    const container = document.getElementById('medecinsByCategory');
    
    if (categories.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucun médecin trouvé</p>';
        return;
    }
    
    let html = '';
    categories.forEach(cat => {
        const medecinsCat = allMedecins.filter(m => m.specialite === cat);
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="color: #3498db; margin-bottom: 15px;">${cat} (${medecinsCat.length})</h3>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Prix</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${medecinsCat.map(m => `
                                <tr>
                                    <td><img src="${m.photo}" alt="${m.nom}" class="table-photo"></td>
                                    <td>${m.nom}</td>
                                    <td>${m.email}</td>
                                    <td>${m.telephone}</td>
                                    <td>${m.prix}€</td>
                                    <td>
                                        <span style="background-color: ${medecinsEnAttente.find(x => x.id === m.id) ? '#fff3cd' : '#d4edda'}; color: ${medecinsEnAttente.find(x => x.id === m.id) ? '#856404' : '#155724'}; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                                            ${medecinsEnAttente.find(x => x.id === m.id) ? 'En attente' : 'Actif'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ============================================
// PATIENTS
// ============================================

function loadPatients() {
    const tbody = document.getElementById('patientTable');
    
    if (patients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Aucun patient</td></tr>';
        return;
    }
    
    tbody.innerHTML = patients.map(p => `
        <tr>
            <td><img src="${p.photo}" alt="${p.nom}" class="table-photo"></td>
            <td>${p.nom}</td>
            <td>${p.email}</td>
            <td>${p.telephone}</td>
            <td>${p.dateInscription}</td>
            <td>${p.consultations}</td>
            <td>
                <button class="btn btn-small btn-primary">
                    <i class="fas fa-eye"></i> Voir
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// AJOUTER MÉDECIN
// ============================================

function setupAddMedecinForm() {
    const form = document.getElementById('addMedecinForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const newMedecin = {
            id: Math.max(...medecinsActifs.map(m => m.id), 0) + 1,
            nom: formData.get('nom'),
            email: formData.get('email'),
            telephone: formData.get('telephone'),
            specialite: formData.get('specialite'),
            prix: parseFloat(formData.get('prix')),
            bio: formData.get('bio'),
            statut: 'actif',
            featured: formData.get('featured') === 'on',
            photo: 'https://via.placeholder.com/80'
        };
        
        medecinsActifs.push(newMedecin);
        alert(`Le médecin ${newMedecin.nom} a été ajouté avec succès!`);
        form.reset();
        loadMedicinsActifs();
        updateDashboard();
    });
}

// ============================================
// ANNONCES
// ============================================

function setupAddAnnonceForm() {
    const form = document.getElementById('addAnnonceForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const newAnnonce = {
            id: Math.max(...annonces.map(a => a.id), 0) + 1,
            titre: formData.get('titre'),
            contenu: formData.get('contenu'),
            dateExpiration: formData.get('date_expiration'),
            dateCreation: new Date().toISOString().split('T')[0]
        };
        
        annonces.push(newAnnonce);
        alert('Annonce ajoutée avec succès!');
        form.reset();
        loadAnnonces();
    });
}

function loadAnnonces() {
    const container = document.getElementById('announcesList');
    
    if (annonces.length === 0) {
        container.innerHTML = '<p class="empty-state">Aucune annonce</p>';
        return;
    }
    
    container.innerHTML = annonces.map(a => `
        <div class="announcement-card">
            <div class="announcement-content">
                <h4>${a.titre}</h4>
                <p>${a.contenu}</p>
                <span class="announcement-date">Créée le: ${a.dateCreation}</span>
            </div>
            <div class="announcement-actions">
                <button class="btn btn-small btn-danger" onclick="deleteAnnonce(${a.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteAnnonce(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
        annonces = annonces.filter(a => a.id !== id);
        loadAnnonces();
    }
}

// ============================================
// STATISTIQUES
// ============================================

function generateDummyConsultations() {
    consultations = [
        { id: 1, medecinNom: 'Dr. Amina Bennani', patientNom: 'Jean Paul Dupont', date: '2025-01-21', montant: 120 },
        { id: 2, medecinNom: 'Dr. Mohamed Bachir', patientNom: 'Marie Moreau', date: '2025-01-21', montant: 180 },
        { id: 3, medecinNom: 'Dr. Amina Bennani', patientNom: 'Ahmed Hassan', date: '2025-01-20', montant: 120 },
        { id: 4, medecinNom: 'Dr. Mohamed Bachir', patientNom: 'Fatima El Alaoui', date: '2025-01-20', montant: 180 },
        { id: 5, medecinNom: 'Dr. Amina Bennani', patientNom: 'Jean Paul Dupont', date: '2025-01-19', montant: 120 }
    ];
}

function loadStatistics() {
    loadConsultationStats();
    loadRevenueStats();
}

function loadConsultationStats() {
    const tbody = document.getElementById('revenueByDoctorTable');
    
    // Grouper les consultations par médecin
    const byDoctor = {};
    consultations.forEach(c => {
        if (!byDoctor[c.medecinNom]) {
            byDoctor[c.medecinNom] = { count: 0, revenue: 0 };
        }
        byDoctor[c.medecinNom].count++;
        byDoctor[c.medecinNom].revenue += c.montant;
    });
    
    const rows = Object.entries(byDoctor).map(([nom, data]) => `
        <tr>
            <td>${nom}</td>
            <td>${data.count}</td>
            <td>${data.revenue.toFixed(2)}€</td>
        </tr>
    `).join('');
    
    tbody.innerHTML = rows || '<tr><td colspan="3" class="empty-state">Aucune donnée</td></tr>';
}

function loadRevenueStats() {
    const tbody = document.getElementById('revenueByCategoryTable');
    
    // Grouper par catégorie
    const byCategory = {};
    medecinsActifs.forEach(m => {
        if (!byCategory[m.specialite]) {
            byCategory[m.specialite] = { count: 0, revenue: 0 };
        }
        const doctorConsults = consultations.filter(c => c.medecinNom === m.nom);
        byCategory[m.specialite].count += doctorConsults.length;
        byCategory[m.specialite].revenue += doctorConsults.reduce((sum, c) => sum + c.montant, 0);
    });
    
    const rows = Object.entries(byCategory).map(([cat, data]) => `
        <tr>
            <td>${cat}</td>
            <td>${data.count}</td>
            <td>${data.revenue.toFixed(2)}€</td>
        </tr>
    `).join('');
    
    tbody.innerHTML = rows || '<tr><td colspan="3" class="empty-state">Aucune donnée</td></tr>';
}

// ============================================
// PROFIL ADMIN
// ============================================

function loadAdminProfile() {
    document.getElementById('adminName').textContent = currentAdmin.nom;
    document.getElementById('adminPhoto').src = currentAdmin.photo || 'https://via.placeholder.com/40';
    document.getElementById('settingsAdminPhoto').src = currentAdmin.photo || 'https://via.placeholder.com/150';
    
    document.getElementById('adminFullName').value = currentAdmin.nom;
    document.getElementById('adminEmail').value = currentAdmin.email;
    document.getElementById('adminPhone').value = currentAdmin.telephone;
}

function setupSettingsForm() {
    const form = document.getElementById('settingsForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        currentAdmin.nom = document.getElementById('adminFullName').value;
        currentAdmin.email = document.getElementById('adminEmail').value;
        currentAdmin.telephone = document.getElementById('adminPhone').value;
        
        // Mettre à jour l'administrateur dans la liste
        const adminIndex = administrateurs.findIndex(a => a.id === 1);
        if (adminIndex !== -1) {
            administrateurs[adminIndex].nom = currentAdmin.nom;
            administrateurs[adminIndex].email = currentAdmin.email;
        }
        
        loadAdminProfile();
        loadAdministrateurs();
        alert('Profil mis à jour avec succès!');
    });
    
    // Photo upload
    document.getElementById('photoUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                currentAdmin.photo = event.target.result;
                document.getElementById('adminPhoto').src = currentAdmin.photo;
                document.getElementById('settingsAdminPhoto').src = currentAdmin.photo;
            };
            reader.readAsDataURL(file);
        }
    });
}

// ============================================
// ADMINISTRATEURS
// ============================================

function loadAdministrateurs() {
    const tbody = document.getElementById('adminsTable');
    
    tbody.innerHTML = administrateurs.map(a => `
        <tr>
            <td>${a.nom}</td>
            <td>${a.email}</td>
            <td>${a.dateNomination}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="removeAdmin(${a.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Populate select avec les médecins actifs non-admin
    const adminEmails = administrateurs.map(a => a.email);
    const availableMedecins = medecinsActifs.filter(m => !adminEmails.includes(m.email));
    
    const select = document.getElementById('selectMedecinAdmin');
    select.innerHTML = '<option value="">Choisir un médecin</option>' +
        availableMedecins.map(m => `<option value="${m.id}">${m.nom}</option>`).join('');
}

function setupAppointAdminForm() {
    const form = document.getElementById('appointAdminForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const medecinId = parseInt(document.getElementById('selectMedecinAdmin').value);
        const medecin = medecinsActifs.find(m => m.id === medecinId);
        
        if (!medecin) {
            alert('Veuillez sélectionner un médecin');
            return;
        }
        
        const newAdmin = {
            id: Math.max(...administrateurs.map(a => a.id), 0) + 1,
            nom: medecin.nom,
            email: medecin.email,
            dateNomination: new Date().toISOString().split('T')[0]
        };
        
        administrateurs.push(newAdmin);
        alert(`${medecin.nom} a été nommé administrateur!`);
        form.reset();
        loadAdministrateurs();
    });
}

function removeAdmin(id) {
    if (id === 1) {
        alert('Vous ne pouvez pas supprimer l\'administrateur principal');
        return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir retirer cet administrateur ?')) {
        administrateurs = administrateurs.filter(a => a.id !== id);
        loadAdministrateurs();
    }
}

// ============================================
// MODALS
// ============================================

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('close-modal')) {
        e.target.closest('.modal').classList.remove('show');
    }
});

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Approbation/Rejet médecin
    document.getElementById('approveMedecinBtn').addEventListener('click', approveMedecin);
    document.getElementById('rejectMedecinBtn').addEventListener('click', rejectMedecin);
    
    // Formulaires
    setupAddMedecinForm();
    setupAddAnnonceForm();
    setupSettingsForm();
    setupAppointAdminForm();
    
    // Filtres
    document.getElementById('filterSpeciality').addEventListener('change', function(e) {
        const tbody = document.getElementById('activeMedecinTable');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            if (!e.target.value) {
                row.style.display = '';
            } else {
                const specialite = row.cells[3].textContent;
                row.style.display = specialite === e.target.value ? '' : 'none';
            }
        });
    });
    
    document.getElementById('filterCategory').addEventListener('change', function(e) {
        loadAllMedecinsByCategory();
    });
    
    // Recherche
    document.getElementById('searchInput').addEventListener('input', function(e) {
        console.log('Recherche:', e.target.value);
        // Implémenter la recherche globale
    });
    
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            alert('Déconnexion...');
            // window.location.href = 'login.html';
        }
    });
    
    // Messagerie
    setupMessaging();
    
    // Chat IA
    setupChatIA();
    
    // Toggle sidebar mobile
    document.getElementById('toggleSidebar').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('open');
    });
}

// ============================================
// MESSAGERIE
// ============================================

function setupMessaging() {
    const contactsList = document.getElementById('contactsList');
    const contacts = [
        { id: 1, nom: 'Dr. Amina Bennani', lastMessage: 'Bonjour...' },
        { id: 2, nom: 'Dr. Mohamed Bachir', lastMessage: 'À bientôt' }
    ];
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p class="empty-state">Aucun message</p>';
        return;
    }
    
    contactsList.innerHTML = contacts.map(c => `
        <div class="contact-item" onclick="selectContact(${c.id}, '${c.nom}')">
            <div style="font-weight: 600;">${c.nom}</div>
            <div style="font-size: 12px; color: #7f8c8d;">${c.lastMessage}</div>
        </div>
    `).join('');
}

function selectContact(id, nom) {
    document.getElementById('chatWith').textContent = nom;
    const messages = document.getElementById('chatMessages');
    
    // Charger les messages (simulé)
    messages.innerHTML = `
        <div class="message received">
            <div class="message-content">Bonjour Admin</div>
        </div>
        <div class="message sent">
            <div class="message-content">Bonjour, comment allez-vous?</div>
        </div>
    `;
}

document.getElementById('sendMessageBtn')?.addEventListener('click', function() {
    const input = document.getElementById('messageInput');
    if (input.value.trim()) {
        const messages = document.getElementById('chatMessages');
        messages.innerHTML += `
            <div class="message sent">
                <div class="message-content">${input.value}</div>
            </div>
        `;
        input.value = '';
        messages.scrollTop = messages.scrollHeight;
    }
});

// ============================================
// CHAT IA
// ============================================

function setupChatIA() {
    const sendBtn = document.getElementById('sendIaBtn');
    
    sendBtn?.addEventListener('click', sendIAMessage);
    
    document.getElementById('iaInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendIAMessage();
        }
    });
}

function sendIAMessage() {
    const input = document.getElementById('iaInput');
    const history = document.getElementById('chatHistory');
    
    if (!input.value.trim()) return;
    
    // Ajouter le message utilisateur
    history.innerHTML += `
        <div class="user-message">
            <div class="user-message-content">${input.value}</div>
        </div>
    `;
    
    // Simuler une réponse IA
    setTimeout(() => {
        history.innerHTML += `
            <div class="ia-message">
                <div class="ia-message-content">Je suis un assistant IA. Je peux vous aider avec les statistiques, les médecins, et la gestion de la plateforme.</div>
            </div>
        `;
        history.scrollTop = history.scrollHeight;
    }, 500);
    
    input.value = '';
    history.scrollTop = history.scrollHeight;
}