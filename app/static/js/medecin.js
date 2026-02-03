// ============= VARIABLES GLOBALES =============

let currentMedecin = {
    id: null,
    nom: 'Dr. Médecin',
    prenom: '',
    specialite: '',
    email: ''
};

let patientSelectionne = null;

let medecinPatients = [];

let dossiersMedecin = {
    list: [],
    filtered: [],
    selectionne: null
};

let ordonnancesData = {
    list: [],
    patientSelectionne: null,
    patients: []
};


let messagerie = {
    conversations: [],
    patientActuel: null,
    messagesActuels: [],
    patients: [],
    autoRefresh: null
};
// ============= INITIALISATION =============

document.addEventListener('DOMContentLoaded', async function () {
    // Charger les infos du médecin
    await loadMedecinInfo();
    
    // Configuration de la navigation
    setupNavigation();
    
    // Configuration des événements
    setupEventListeners();
    
    // Charger le dashboard
    loadSection('dashboard');
    
    // Configuration logout
    setupLogout();
});

// ============= CHARGEMENT INFOS MÉDECIN =============

async function loadMedecinInfo() {
    try {
        const response = await fetch('/medecin/api/info');
        const data = await response.json();
        
        if (data) {
            currentMedecin = {
                id: data.id,
                nom: data.nom,
                prenom: data.prenom,
                specialite: data.specialite || 'Médecin',
                email: data.email,
                photo: data.photo_profil_url
            };
            
            // Mettre à jour l'affichage
            document.getElementById('medecinName').textContent = `Dr. ${data.prenom} ${data.nom}`;
            document.getElementById('medecinSpecialite').textContent = data.specialite || 'Médecin';
            
            if (data.photo_profil_url) {
                document.getElementById('profileAvatar').src = data.photo_profil_url;
            }
        }
    } catch (error) {
        console.error('Erreur chargement infos médecin:', error);
    }
}

// ============= NAVIGATION =============

function setupNavigation() {
    const menuLinks = document.querySelectorAll('.menu-link');

    menuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const section = this.getAttribute('data-section');
            loadSection(section);
        });
    });
}

function loadSection(section) {
    const mainContent = document.getElementById('mainContent');

    switch (section) {
        case 'dashboard':
            mainContent.innerHTML = getDashboardContent();
            setupDashboardListeners();
            break;
        case 'patients':
            loadPatientsList();
            break;
        case 'rdv':
            mainContent.innerHTML = getRDVContent();
            loadRDV();
            break;
        case 'dossiers':
            mainContent.innerHTML = getDossiersContent();
            loadDossiers();
            break;
        case 'ordonnances':
            mainContent.innerHTML = getOrdonnancesContent();
            loadOrdonnances();
            initOrdonnanceModal();
            break;
        case 'messagerie':
            mainContent.innerHTML = getMessagerieContent();
            loadMessagerie();
            break;
        case 'visio':
            mainContent.innerHTML = getVisioContent();
            break;
        case 'historique':
            mainContent.innerHTML = getHistoriqueContent();
            break;
        case 'profil':
            mainContent.innerHTML = getProfilContent();
            break;
        case 'parametres':
            mainContent.innerHTML = getParametresContent();
            setupParametresListeners();
            break;
    }
}

// ============= CONTENU DASHBOARD =============

function getDashboardContent() {
    return `
        <div class="welcome-card">
            <div class="welcome-content">
                <h1>Bonjour Dr. ${currentMedecin.prenom} ${currentMedecin.nom} 👋</h1>
                <p>Bienvenue dans votre espace médecin Dokira</p>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon blue">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
                <div class="stat-value" id="statsPatients">0</div>
                <div class="stat-label">Patients</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon green">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                </div>
                <div class="stat-value" id="statsRDV">0</div>
                <div class="stat-label">RDV Aujourd'hui</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon orange">
                        <i class="fas fa-folder-open"></i>
                    </div>
                </div>
                <div class="stat-value" id="statsTraitement">0</div>
                <div class="stat-label">En Traitement</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon red">
                        <i class="fas fa-envelope"></i>
                    </div>
                </div>
                <div class="stat-value" id="statsMessages">0</div>
                <div class="stat-label">Messages Non Lus</div>
            </div>
        </div>
    `;
}

function setupDashboardListeners() {
    loadStats();
}

async function loadStats() {
    try {
        const response = await fetch('/medecin/api/stats');
        const stats = await response.json();
        
        document.getElementById('statsPatients').textContent = stats.patients_actifs || 0;
        document.getElementById('statsRDV').textContent = stats.rdv_today || 0;
        document.getElementById('statsTraitement').textContent = stats.en_traitement || 0;
        document.getElementById('statsMessages').textContent = stats.messages_non_lus || 0;
    } catch (error) {
        console.error('Erreur chargement stats:', error);
    }
}

// ============= GESTION PATIENTS =============

async function loadPatientsList() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">Mes Patients</h2>
                <div class="section-actions">
                    <input type="text" class="form-control" id="searchPatient" style="max-width: 300px;" placeholder="Rechercher un patient...">
                </div>
            </div>
            <div class="custom-table" id="patientsTable">
                <p class="text-center text-muted">Chargement...</p>
            </div>
        </div>
    `;

    try {
        const response = await fetch('/medecin/api/patients');
        medecinPatients = await response.json();
        displayPatientsList(medecinPatients);
        setupPatientSearch();
    } catch (error) {
        console.error('Erreur chargement patients:', error);
    }
}

function displayPatientsList(patients) {
    const container = document.getElementById('patientsTable');
    
    if (patients.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">Aucun patient trouvé</p>';
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Patient</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Age</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${patients.map(p => `
                    <tr>
                        <td>
                            <div class="patient-info">
                                <div class="patient-avatar">${p.nom_complet.charAt(0)}${p.nom_complet.split(' ')[1]?.charAt(0) || ''}</div>
                                <div class="patient-details">
                                    <div class="patient-name">${p.nom_complet}</div>
                                    <div class="patient-meta">${p.age} ans</div>
                                </div>
                            </div>
                        </td>
                        <td>${p.email}</td>
                        <td>${p.telephone || 'N/A'}</td>
                        <td>${p.age}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action view" onclick="viewPatientDossier(${p.id})" title="Voir dossier">
                                    <i class="fas fa-folder-open"></i>
                                </button>
                                <button class="btn-action message" onclick="sendMessageToPatient(${p.id})" title="Message">
                                    <i class="fas fa-envelope"></i>
                                </button>
                                <button class="btn-action visio" onclick="newOrdonnance(${p.id}, '${p.nom_complet}')" title="Nouvelle ordonnance">
                                    <i class="fas fa-prescription-bottle"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

function setupPatientSearch() {
    const searchInput = document.getElementById('searchPatient');
    searchInput.addEventListener('input', function(e) {
        const term = e.target.value.toLowerCase();
        const filtered = medecinPatients.filter(p => 
            p.nom_complet.toLowerCase().includes(term) || 
            p.email.toLowerCase().includes(term)
        );
        displayPatientsList(filtered);
    });
}

// ============= DOSSIER PATIENT =============

async function viewPatientDossier(patientId) {
    try {
        const response = await fetch(`/medecin/api/dossiers/${patientId}`);
        const dossier = await response.json();
        
        const patientResponse = await fetch(`/medecin/api/patients`);
        const patients = await patientResponse.json();
        const patient = patients.find(p => p.id === patientId);
        
        const modalBody = document.getElementById('patientModalBody');
        modalBody.innerHTML = `
            <div class="patient-dossier">
                <h5>${patient.nom_complet}</h5>
                <div class="dossier-grid">
                    <div>
                        <strong>Email:</strong> ${patient.email}
                    </div>
                    <div>
                        <strong>Téléphone:</strong> ${patient.telephone}
                    </div>
                    <div>
                        <strong>Age:</strong> ${patient.age} ans
                    </div>
                    <div>
                        <strong>Genre:</strong> ${patient.genre || 'N/A'}
                    </div>
                </div>
                
                <h6 style="margin-top: 20px; margin-bottom: 10px;">Antécédents Médicaux</h6>
                <div class="dossier-info">
                    ${dossier.antecedents_medicaux || 'Aucun antécédent renseigné'}
                </div>
                
                <h6 style="margin-top: 15px; margin-bottom: 10px;">Allergies</h6>
                <div class="dossier-info">
                    ${dossier.allergies || 'Aucune allergie renseignée'}
                </div>
                
                <h6 style="margin-top: 15px; margin-bottom: 10px;">Dossiers de Consultation</h6>
                ${dossier.consultations && dossier.consultations.length > 0 ? `
                    <div class="consultations-list">
                        ${dossier.consultations.map(c => `
                            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                                <strong>${c.date_consultation}</strong><br>
                                <small>Diagnostic: ${c.diagnostic}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-muted">Aucune consultation</p>'}
                
                <div style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="newOrdonnance(${patientId}, '${patient.nom_complet}')">
                        <i class="fas fa-prescription-bottle"></i> Nouvelle Ordonnance
                    </button>
                </div>
            </div>
        `;
        
        const modal = new bootstrap.Modal(document.getElementById('patientModal'));
        modal.show();
        
        patientSelectionne = patient;
    } catch (error) {
        console.error('Erreur chargement dossier:', error);
    }
}

// ============= ORDONNANCES =============

function getOrdonnancesContent() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">Ordonnances</h2>
                <button class="btn btn-primary" onclick="loadPatientsList()">
                    <i class="fas fa-plus"></i> Nouvelle Ordonnance
                </button>
            </div>
            <div class="custom-table" id="ordonnancesTable">
                <p class="text-center text-muted">Chargement...</p>
            </div>
        </div>
    `;
}

function newOrdonnance(patientId, patientName) {
    document.getElementById('ordonnancePatientId').value = patientId;
    document.getElementById('ordonnancePatientName').value = patientName;
    document.getElementById('ordonnanceForm').reset();
    
    const modal = new bootstrap.Modal(document.getElementById('ordonnanceModal'));
    modal.show();
}

// ============= AUTRES SECTIONS =============

function getRDVContent() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">Mes Rendez-vous</h2>
            </div>
            <div class="custom-table">
                <table>
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Date & Heure</th>
                            <th>Type</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="rdvBody">
                        <tr><td colspan="5" class="text-center text-muted">Chargement...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function getDossiersContent() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">Dossiers Médicaux</h2>
            </div>
            <div class="custom-table" id="dossiersTable">
                <p class="text-center text-muted">Chargement...</p>
            </div>
        </div>
    `;
}

function getMessagerieContent() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">Messagerie</h2>
            </div>
            <div class="custom-table" id="messageryTable">
                <p class="text-center text-muted">Chargement...</p>
            </div>
        </div>
    `;
}

function getVisioContent() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">Visioconférences</h2>
            </div>
            <p class="text-muted">Fonctionnalité en développement</p>
        </div>
    `;
}

function getHistoriqueContent() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">Historique</h2>
            </div>
            <p class="text-muted">Historique de vos consultations</p>
        </div>
    `;
}

function getProfilContent() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">Mon Profil</h2>
            </div>
            <div style="background: white; padding: 30px; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img id="profilAvatar" 
                        src="https://ui-avatars.com/api/?name=Dr+${currentMedecin.nom}&background=0D8ABC&color=fff&size=120" 
                        alt="Avatar"
                        style="width: 120px; height: 120px; border-radius: 50%; border: 3px solid #0D8ABC;">
                </div>
                
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label"><strong>Prénom</strong></label>
                        <input type="text" class="form-control" id="profilPrenom" value="${currentMedecin.prenom}" readonly>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label"><strong>Nom</strong></label>
                        <input type="text" class="form-control" id="profilNom" value="${currentMedecin.nom}" readonly>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label"><strong>Email</strong></label>
                    <input type="email" class="form-control" id="profilEmail" value="${currentMedecin.email}" readonly>
                </div>
                
                <div class="mb-3">
                    <label class="form-label"><strong>Spécialité</strong></label>
                    <input type="text" class="form-control" id="profilSpecialite" value="${currentMedecin.specialite}" readonly>
                </div>
                
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Utilisez la section "Paramètres" pour modifier vos informations
                </div>
            </div>
        </div>
    `;
}

function getParametresContent() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">Paramètres</h2>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 12px;">
                <h4 class="mb-4">Informations Personnelles</h4>
                
                <form id="parametresForm">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Prénom</label>
                            <input type="text" class="form-control" id="paramPrenom" value="${currentMedecin.prenom}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nom</label>
                            <input type="text" class="form-control" id="paramNom" value="${currentMedecin.nom}" required>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="paramEmail" value="${currentMedecin.email}" required>
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Téléphone</label>
                        <input type="tel" class="form-control" id="paramTelephone">
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Photo de profil</label>
                        <input type="file" class="form-control" id="paramPhoto" accept="image/*">
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Sauvegarder
                    </button>
                </form>
            </div>
        </div>
    `;
}

function setupParametresListeners() {
    const form = document.getElementById('parametresForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('prenom', document.getElementById('paramPrenom').value);
            formData.append('nom', document.getElementById('paramNom').value);
            formData.append('email', document.getElementById('paramEmail').value);
            formData.append('telephone', document.getElementById('paramTelephone').value || '');
            
            const photoInput = document.getElementById('paramPhoto');
            if (photoInput.files.length > 0) {
                formData.append('photo', photoInput.files[0]);
            }
            
            try {
                const response = await fetch('/medecin/api/profil/update', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    alert('Profil mis à jour avec succès!');
                    await loadMedecinInfo();
                } else {
                    alert('Erreur lors de la mise à jour');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la mise à jour');
            }
        });
    }
}

// ============= HELPER FUNCTIONS =============

function sendMessageToPatient(patientId) {
    alert('Fonctionnalité messagerie en développement pour patient ' + patientId);
}

// ============= EVENT LISTENERS =============

function setupEventListeners() {
    // Soumettre ordonnance
    const submitBtn = document.getElementById('submitOrdonnance');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitOrdonnance);
    }
}

async function submitOrdonnance() {
    const patientId = document.getElementById('ordonnancePatientId').value;
    const medicament = document.getElementById('ordonnanceMedicament').value;
    const posologie = document.getElementById('ordonnancePosologie').value;
    const duree = document.getElementById('ordonnanceDuree').value;
    const instructions = document.getElementById('ordonnanceInstructions').value;
    
    if (!medicament || !posologie) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    try {
        const response = await fetch('/medecin/api/ordonnances/creer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                patient_id: patientId,
                medicament: medicament,
                posologie: posologie,
                duree_traitement: duree,
                instructions: instructions
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            alert('Ordonnance créée et envoyée au patient!');
            
            // Fermer modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('ordonnanceModal'));
            modal.hide();
        } else {
            alert('Erreur lors de la création de l\'ordonnance');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création de l\'ordonnance');
    }
}


// ============= CHARGEMENT RDV =============
async function loadRDV() {
    const tbody = document.getElementById("rdvBody");

    try {
        const response = await fetch("/medecin/api/rendez-vous", {
            credentials: "include"
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Erreur chargement RDV");
        }

        const rdvs = await response.json();

        if (rdvs.length === 0) {
            tbody.innerHTML = `<tr>
                <td colspan="5" class="text-center text-muted">Aucun rendez-vous</td>
            </tr>`;
            return;
        }

        tbody.innerHTML = rdvs.map(rdv => `
            <tr>
                <td>${rdv.patient.nom_complet}</td>
                <td>${new Date(rdv.date_heure).toLocaleString()}</td>
                <td>${rdv.type}</td>
                <td>${rdv.statut}</td>
                <td>
                    <button class="btn-action view" title="Voir">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Erreur RDV:", error);
        tbody.innerHTML = `<tr>
            <td colspan="5" class="text-center text-danger">
                Erreur de chargement des rendez-vous
            </td>
        </tr>`;
    }
}


// ============= LOGOUT =============

function setupLogout() {
    const logoutLink = document.querySelector('a[href="/medecin/deconnexionMedecin"]');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            const confirmed = confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
            
            if (confirmed) {
                window.location.href = '/medecin/deconnexionMedecin';
            }
        });
    }
}





// ============= FONCTION PRINCIPALE - MESSAGERIE =============

function getMessagerieContent() {
    return `
        <div class="messagerie-container">
            <!-- Panneau Conversations -->
            <div class="messagerie-sidebar">
                <div class="sidebar-header">
                    <h3>Messagerie</h3>
                    <button class="btn-new-message" onclick="openNewMessageModal()" title="Nouveau message">
                        <i class="fas fa-pen"></i> Nouveau
                    </button>
                </div>
                
                <div class="search-box">
                    <input type="text" id="searchConversation" placeholder="Rechercher un patient..." class="form-control">
                </div>
                
                <div class="conversations-list" id="conversationsList">
                    <div class="loading-state">
                        <p class="text-muted text-center">Chargement des conversations...</p>
                    </div>
                </div>
            </div>
            
            <!-- Panneau Principal -->
            <div class="messagerie-main">
                <div id="emptyState" class="empty-state">
                    <div class="empty-content">
                        <i class="fas fa-envelope-open-text"></i>
                        <h4>Sélectionnez une conversation</h4>
                        <p>Choisissez un patient dans la liste pour commencer à discuter</p>
                    </div>
                </div>
                
                <div id="chatContent" class="chat-content" style="display: none;">
                    <!-- Header Conversation -->
                    <div class="conversation-header">
                        <div class="patient-header">
                            <div class="patient-avatar" id="chatPatientAvatar"></div>
                            <div class="patient-info">
                                <h5 id="chatPatientName">Patient</h5>
                                <p id="chatPatientEmail" class="text-muted"></p>
                            </div>
                        </div>
                        <button class="btn-close-chat" onclick="closeChat()" title="Fermer">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <!-- Messages -->
                    <div class="messages-container" id="messagesContainer">
                        <p class="text-center text-muted">Aucun message</p>
                    </div>
                    
                    <!-- Formulaire Envoi -->
                    <div class="message-input-area">
                        <form id="messageForm" onsubmit="sendMessage(event)">
                            <div class="form-group">
                                <input type="text" id="messageSubject" placeholder="Sujet du message..." 
                                    class="form-control" required>
                            </div>
                            <div class="form-group">
                                <textarea id="messageContent" placeholder="Écrivez votre message ici..." 
                                    class="form-control" rows="3" required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary btn-send">
                                <i class="fas fa-paper-plane"></i> Envoyer
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Modal Nouveau Message -->
        <div class="modal fade" id="newMessageModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Nouveau Message</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="newMessageForm">
                            <div class="form-group mb-3">
                                <label class="form-label"><strong>Destinataire</strong></label>
                                <select id="newMessagePatient" class="form-control" required>
                                    <option value="">Sélectionnez un patient...</option>
                                </select>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label"><strong>Sujet</strong></label>
                                <input type="text" id="newMessageSubject" class="form-control" required>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label"><strong>Message</strong></label>
                                <textarea id="newMessageContent" class="form-control" rows="5" required></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" onclick="submitNewMessage()">Envoyer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============= CHARGEMENT MESSAGERIE =============

async function loadMessagerie() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = getMessagerieContent();
    
    // Charger les données
    await Promise.all([
        loadConversations(),
        loadPatientsForMessaging()
    ]);
    
    setupMessagerieListeners();
    
    // Rafraîchissement auto toutes les 30 secondes
    if (messagerie.autoRefresh) clearInterval(messagerie.autoRefresh);
    messagerie.autoRefresh = setInterval(loadConversations, 30000);
}

async function loadConversations() {
    try {
        const response = await fetch('/medecin/api/messagerie/conversations');
        if (!response.ok) throw new Error('Erreur chargement conversations');
        
        messagerie.conversations = await response.json();
        displayConversations(messagerie.conversations);
        updateUnreadBadge();
    } catch (error) {
        console.error('Erreur chargement conversations:', error);
        document.getElementById('conversationsList').innerHTML = 
            '<p class="text-center text-danger">Erreur chargement conversations</p>';
    }
}

async function loadPatientsForMessaging() {
    try {
        const response = await fetch('/medecin/api/messagerie/patients-list');
        if (!response.ok) throw new Error('Erreur chargement patients');
        
        messagerie.patients = await response.json();
        populatePatientsSelect();
    } catch (error) {
        console.error('Erreur chargement patients:', error);
    }
}

// ============= AFFICHAGE CONVERSATIONS =============

function displayConversations(conversations) {
    const container = document.getElementById('conversationsList');
    
    if (!conversations || conversations.length === 0) {
        container.innerHTML = '<p class="text-center text-muted p-3">Aucune conversation</p>';
        return;
    }
    
    const html = conversations.map(conv => {
        const nonLus = conv.non_lus > 0 ? `<span class="badge">${conv.non_lus}</span>` : '';
        const classe = messagerie.patientActuel?.id === conv.patient_id ? 'active' : '';
        const dernierMsg = conv.derniere_date ? new Date(conv.derniere_date).toLocaleDateString('fr-FR') : '';
        
        return `
            <div class="conversation-item ${classe}" onclick="openConversation(${conv.patient_id}, '${conv.nom_complet}', '${conv.email}')">
                <div class="conversation-avatar">
                    ${conv.nom_complet.charAt(0).toUpperCase()}${conv.nom_complet.split(' ')[1]?.charAt(0).toUpperCase() || ''}
                </div>
                <div class="conversation-info">
                    <div class="conversation-header-row">
                        <h6>${conv.nom_complet}</h6>
                        <span class="date-small">${dernierMsg}</span>
                    </div>
                    <p class="text-muted text-truncate">${conv.email}</p>
                </div>
                ${nonLus}
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

function updateUnreadBadge() {
    const totalNonLus = messagerie.conversations.reduce((sum, conv) => sum + (conv.non_lus || 0), 0);
    const messagerieBadge = document.querySelector('[data-section="messagerie"] .badge');
    
    if (messagerieBadge) {
        if (totalNonLus > 0) {
            messagerieBadge.textContent = totalNonLus;
            messagerieBadge.style.display = 'block';
        } else {
            messagerieBadge.style.display = 'none';
        }
    }
}

// ============= OUVERTURE CONVERSATION =============

async function openConversation(patientId, patientName, patientEmail) {
    try {
        messagerie.patientActuel = {
            id: patientId,
            nom_complet: patientName,
            email: patientEmail
        };
        
        // Fetch messages
        const response = await fetch(`/medecin/api/messagerie/conversation/${patientId}`);
        if (!response.ok) throw new Error('Erreur chargement conversation');
        
        const data = await response.json();
        messagerie.messagesActuels = data.messages;
        
        // Afficher le chat
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('chatContent').style.display = 'flex';
        
        // Remplir les infos du patient
        document.getElementById('chatPatientName').textContent = data.patient.nom_complet;
        document.getElementById('chatPatientEmail').textContent = data.patient.email;
        document.getElementById('chatPatientAvatar').textContent = 
            data.patient.nom_complet.charAt(0).toUpperCase() + 
            (data.patient.nom_complet.split(' ')[1]?.charAt(0).toUpperCase() || '');
        
        // Afficher les messages
        displayMessages(data.messages);
        
        // Mise à jour visuelle
        document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
        event.target.closest('.conversation-item')?.classList.add('active');
        
        // Reset form
        document.getElementById('messageForm').reset();
    } catch (error) {
        console.error('Erreur ouverture conversation:', error);
        alert('Erreur lors de l\'ouverture de la conversation');
    }
}

// ============= AFFICHAGE MESSAGES =============

function displayMessages(messages) {
    const container = document.getElementById('messagesContainer');
    
    if (!messages || messages.length === 0) {
        container.innerHTML = '<p class="text-center text-muted p-3">Aucun message dans cette conversation</p>';
        return;
    }
    
    const html = messages.map(msg => {
        const fromClass = msg.de_medecin ? 'from-medecin' : 'from-patient';
        const dateObj = new Date(msg.date_envoi);
        const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = dateObj.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
        
        return `
            <div class="message-group ${fromClass}">
                <div class="message-bubble">
                    <div class="message-subject"><strong>${msg.sujet}</strong></div>
                    <div class="message-content">${msg.contenu}</div>
                    <div class="message-time">${dateStr} à ${timeStr}</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
    
    // Scroll au dernier message
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// ============= ENVOI MESSAGE =============

async function sendMessage(event) {
    event.preventDefault();
    
    const sujet = document.getElementById('messageSubject').value;
    const contenu = document.getElementById('messageContent').value;
    
    if (!sujet.trim() || !contenu.trim()) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    const formData = new FormData();
    formData.append('patient_id', messagerie.patientActuel.id);
    formData.append('sujet', sujet);
    formData.append('contenu', contenu);
    
    try {
        const response = await fetch('/medecin/api/messagerie/send', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur envoi message');
        }
        
        const result = await response.json();
        
        // Ajouter le message à la liste
        messagerie.messagesActuels.push({
            id: result.message_id,
            sujet: sujet,
            contenu: contenu,
            de_medecin: true,
            date_envoi: result.date_envoi,
            statut: 'Envoyé'
        });
        
        displayMessages(messagerie.messagesActuels);
        document.getElementById('messageForm').reset();
        
        // Recharger les conversations
        await loadConversations();
    } catch (error) {
        console.error('Erreur envoi message:', error);
        alert('Erreur lors de l\'envoi: ' + error.message);
    }
}

// ============= NOUVEAU MESSAGE MODAL =============

function openNewMessageModal() {
    const modal = new bootstrap.Modal(document.getElementById('newMessageModal'));
    modal.show();
}

function populatePatientsSelect() {
    const select = document.getElementById('newMessagePatient');
    select.innerHTML = '<option value="">Sélectionnez un patient...</option>';
    
    messagerie.patients.forEach(patient => {
        const option = document.createElement('option');
        option.value = patient.id;
        option.textContent = `${patient.nom_complet} (${patient.email})`;
        select.appendChild(option);
    });
}

async function submitNewMessage() {
    const patientId = document.getElementById('newMessagePatient').value;
    const sujet = document.getElementById('newMessageSubject').value;
    const contenu = document.getElementById('newMessageContent').value;
    
    if (!patientId || !sujet.trim() || !contenu.trim()) {
        alert('Veuillez remplir tous les champs');
        return;
    }
    
    const formData = new FormData();
    formData.append('patient_id', patientId);
    formData.append('sujet', sujet);
    formData.append('contenu', contenu);
    
    try {
        const response = await fetch('/medecin/api/messagerie/send', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur envoi message');
        }
        
        // Fermer modal et recharger
        bootstrap.Modal.getInstance(document.getElementById('newMessageModal')).hide();
        document.getElementById('newMessageForm').reset();
        
        // Ouvrir la conversation du patient
        const patient = messagerie.patients.find(p => p.id == patientId);
        await loadConversations();
        
        // Afficher la conversation
        setTimeout(() => {
            const conv = messagerie.conversations.find(c => c.patient_id == patientId);
            if (conv) {
                openConversation(patientId, patient.nom_complet, patient.email);
            }
        }, 500);
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur: ' + error.message);
    }
}

// ============= FERMETURE CHAT =============

function closeChat() {
    messagerie.patientActuel = null;
    messagerie.messagesActuels = [];
    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('chatContent').style.display = 'none';
    document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
}

// ============= EVENT LISTENERS =============

function setupMessagerieListeners() {
    // Recherche conversation
    const searchInput = document.getElementById('searchConversation');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            const filtered = messagerie.conversations.filter(c =>
                c.nom_complet.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term)
            );
            displayConversations(filtered);
        });
    }
}   




// ============= FONCTION PRINCIPALE DOSSIERS =============

function getDossiersContent() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="fas fa-folder-medical"></i> Dossiers Médicaux
                </h2>
                <div class="section-actions">
                    <input type="text" 
                        class="form-control search-input" 
                        placeholder="Rechercher un dossier..." 
                        onkeyup="searchDossiers(this.value)"
                        style="max-width: 300px;">
                </div>
            </div>
            
            <div class="filters-bar" style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn btn-sm btn-outline-primary active" onclick="filterDossiersByStatut('tous')">
                    Tous
                </button>
                <button class="btn btn-sm btn-outline-warning" onclick="filterDossiersByStatut('À traiter')">
                    À traiter
                </button>
                <button class="btn btn-sm btn-outline-info" onclick="filterDossiersByStatut('En cours de traitement')">
                    En cours
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="filterDossiersByStatut('Traité')">
                    Traité
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="filterDossiersByStatut('Archivé')">
                    Archivé
                </button>
            </div>
            
            <div class="custom-table" id="dossiersTable">
                <p class="text-center text-muted">Chargement des dossiers...</p>
            </div>
        </div>
    `;
}

// ============= CHARGER DOSSIERS =============

async function loadDossiers() {
    try {
        const response = await fetch('/medecin/api/dossiers-medicaux', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error("Erreur serveur: " + response.status);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error("Réponse invalide de l'API");
        }
        
        dossiersMedecin.list = data.dossiers || [];
        dossiersMedecin.filtered = dossiersMedecin.list;
        
        displayDossiers(dossiersMedecin.list);
        
    } catch (error) {
        console.error('Erreur chargement dossiers:', error);
        document.getElementById('dossiersTable').innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> 
                Erreur lors du chargement des dossiers: ${error.message}
            </div>
        `;
    }
}

// ============= AFFICHER DOSSIERS EN TABLEAU =============

function displayDossiers(dossiers) {
    const container = document.getElementById('dossiersTable');
    
    if (!dossiers || dossiers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>Aucun dossier médical</p>
            </div>
        `;
        return;
    }
    
    const html = `
        <table class="table-dossiers">
            <thead>
                <tr>
                    <th>Patient</th>
                    <th>Age</th>
                    <th>Date Consultation</th>
                    <th>Motif</th>
                    <th>Diagnostic</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${dossiers.map(d => `
                    <tr class="dossier-row" data-dossier-id="${d.id}">
                        <td>
                            <div class="patient-cell">
                                <div class="patient-avatar">${getInitials(d.patient.nom_complet)}</div>
                                <div class="patient-info-cell">
                                    <div class="patient-name">${d.patient.nom_complet}</div>
                                    <div class="patient-email">${d.patient.email}</div>
                                </div>
                            </div>
                        </td>
                        <td>${d.patient.age ? d.patient.age + ' ans' : 'N/A'}</td>
                        <td>${d.date_consultation}</td>
                        <td class="motif-cell" title="${d.motif_consultation}">
                            ${truncateText(d.motif_consultation, 30)}
                        </td>
                        <td class="diagnostic-cell" title="${d.diagnostic}">
                            ${truncateText(d.diagnostic, 30)}
                        </td>
                        <td>
                            <span class="status-badge status-${d.statut_traitement.toLowerCase().replace(/ /g, '-')}">
                                ${d.statut_traitement}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action view" onclick="viewDossierDetail(${d.id})" title="Voir détails">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-action edit" onclick="editDossier(${d.id})" title="Modifier">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-action" onclick="downloadDossier(${d.id})" title="Télécharger">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
    setupDossierListeners();
}

// ============= VOIR DÉTAILS DOSSIER =============

async function viewDossierDetail(dossierId) {
    try {
        const response = await fetch(`/medecin/api/dossiers-medicaux/${dossierId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error("Dossier non trouvé");
        }
        
        const data = await response.json();
        const d = data.dossier;
        
        dossiersMedecin.selectionne = d;
        
        // Créer la modale détail
        const modalHTML = createDossierModal(d);
        
        // Ajouter au DOM
        let existingModal = document.getElementById('dossierDetailModal');
        if (existingModal) existingModal.remove();
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // Afficher la modale
        const modal = new bootstrap.Modal(document.getElementById('dossierDetailModal'));
        modal.show();
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur: ' + error.message);
    }
}

// ============= CRÉER MODALE DÉTAIL DOSSIER =============

function createDossierModal(d) {
    return `
        <div class="modal fade" id="dossierDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-file-medical"></i> Dossier Medical - ${d.patient.nom_complet}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="dossier-detail-container">
                            <!-- Infos Patient -->
                            <div class="detail-section">
                                <h6 class="section-title">
                                    <i class="fas fa-user"></i> Informations Patient
                                </h6>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="label">Nom Complet:</span>
                                        <span class="value">${d.patient.nom_complet}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Age:</span>
                                        <span class="value">${d.patient.age || 'N/A'} ans</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Genre:</span>
                                        <span class="value">${d.patient.genre || 'N/A'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Email:</span>
                                        <span class="value">${d.patient.email}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Téléphone:</span>
                                        <span class="value">${d.patient.telephone}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Adresse:</span>
                                        <span class="value">${d.patient.adresse || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Infos Médicales -->
                            <div class="detail-section">
                                <h6 class="section-title">
                                    <i class="fas fa-heartbeat"></i> Informations Médicales
                                </h6>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="label">Groupe Sanguin:</span>
                                        <span class="value">${d.groupe_sanguin || 'Non renseigné'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Numéro Sécu:</span>
                                        <span class="value">${d.numero_securite_sociale || 'Non renseigné'}</span>
                                    </div>
                                </div>
                                
                                ${d.allergies ? `
                                    <div class="info-item full-width alert alert-warning mt-2">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <strong>⚠️ Allergies:</strong> ${d.allergies}
                                    </div>
                                ` : ''}
                                
                                ${d.antecedents_medicaux ? `
                                    <div class="info-item full-width mt-2">
                                        <strong>📋 Antécédents Médicaux:</strong>
                                        <p>${d.antecedents_medicaux}</p>
                                    </div>
                                ` : ''}
                                
                                ${d.antecedents_familiaux ? `
                                    <div class="info-item full-width mt-2">
                                        <strong>👨‍👩‍👧 Antécédents Familiaux:</strong>
                                        <p>${d.antecedents_familiaux}</p>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <!-- Consultation -->
                            <div class="detail-section">
                                <h6 class="section-title">
                                    <i class="fas fa-stethoscope"></i> Consultation du ${d.date_consultation}
                                </h6>
                                <div class="consultation-info">
                                    <div class="info-item full-width">
                                        <strong>Motif:</strong>
                                        <p>${d.motif_consultation || 'Non renseigné'}</p>
                                    </div>
                                    <div class="info-item full-width">
                                        <strong>Diagnostic:</strong>
                                        <p>${d.diagnostic || 'Non renseigné'}</p>
                                    </div>
                                    <div class="info-item full-width">
                                        <strong>Traitement:</strong>
                                        <p>${d.traitement || 'Non renseigné'}</p>
                                    </div>
                                    <div class="info-item full-width">
                                        <strong>Observations:</strong>
                                        <p>${d.observations || 'Aucune'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Statut -->
                            <div class="detail-section">
                                <h6 class="section-title">
                                    <i class="fas fa-clipboard-list"></i> Statut
                                </h6>
                                <span class="status-badge status-${d.statut_traitement.toLowerCase().replace(/ /g, '-')}">
                                    ${d.statut_traitement}
                                </span>
                            </div>
                            
                            <!-- Document -->
                            ${d.document ? `
                                <div class="detail-section">
                                    <h6 class="section-title">
                                        <i class="fas fa-file"></i> Document Associé
                                    </h6>
                                    <div class="document-info">
                                        <div class="doc-icon">
                                            <i class="fas fa-file-pdf"></i>
                                        </div>
                                        <div class="doc-details">
                                            <p class="doc-title">${d.document.titre}</p>
                                            <p class="doc-type">${d.document.type_document}</p>
                                            <p class="doc-date">📅 ${d.document.date_upload}</p>
                                        </div>
                                        <a href="${d.document.fichier_url}" target="_blank" class="btn btn-sm btn-primary">
                                            <i class="fas fa-download"></i> Voir
                                        </a>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- Ordonnance -->
                            ${d.ordonnance ? `
                                <div class="detail-section">
                                    <h6 class="section-title">
                                        <i class="fas fa-prescription-bottle"></i> Ordonnance
                                    </h6>
                                    <div class="ordonnance-info">
                                        <div class="info-grid">
                                            <div class="info-item">
                                                <span class="label">Médecin:</span>
                                                <span class="value">${d.ordonnance.medecin_nom}</span>
                                            </div>
                                            <div class="info-item">
                                                <span class="label">Date Émission:</span>
                                                <span class="value">${d.ordonnance.date_emission}</span>
                                            </div>
                                            <div class="info-item">
                                                <span class="label">Statut:</span>
                                                <span class="value">${d.ordonnance.statut}</span>
                                            </div>
                                        </div>
                                        <div class="info-item full-width">
                                            <strong>💊 Médicaments:</strong>
                                            <p>${d.ordonnance.medicaments}</p>
                                        </div>
                                        <div class="info-item full-width">
                                            <strong>📋 Posologie:</strong>
                                            <p>${d.ordonnance.posologie}</p>
                                        </div>
                                        ${d.ordonnance.fichier_url ? `
                                            <a href="${d.ordonnance.fichier_url}" target="_blank" class="btn btn-sm btn-primary mt-2">
                                                <i class="fas fa-download"></i> Télécharger
                                            </a>
                                        ` : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-primary" onclick="editDossier(${d.id})">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============= FILTRER ET RECHERCHER =============

function filterDossiersByStatut(statut) {
    if (statut === 'tous') {
        dossiersMedecin.filtered = dossiersMedecin.list;
    } else {
        dossiersMedecin.filtered = dossiersMedecin.list.filter(d => 
            d.statut_traitement === statut
        );
    }
    displayDossiers(dossiersMedecin.filtered);
}

function searchDossiers(searchTerm) {
    const term = searchTerm.toLowerCase();
    dossiersMedecin.filtered = dossiersMedecin.list.filter(d =>
        d.patient.nom_complet.toLowerCase().includes(term) ||
        d.patient.email.toLowerCase().includes(term) ||
        d.motif_consultation.toLowerCase().includes(term) ||
        d.diagnostic.toLowerCase().includes(term)
    );
    displayDossiers(dossiersMedecin.filtered);
}

// ============= ACTIONS =============

function editDossier(dossierId) {
    alert('Fonction modification en développement pour dossier ' + dossierId);
}

function downloadDossier(dossierId) {
    const dossier = dossiersMedecin.list.find(d => d.id === dossierId);
    if (!dossier) return;
    alert('Téléchargement du dossier ' + dossier.patient.nom_complet);
}

// ============= HELPERS =============

function getInitials(nom_complet) {
    const parts = nom_complet.split(' ');
    return (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '');
}

function truncateText(text, length) {
    if (!text) return 'N/A';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

function setupDossierListeners() {
    // Double-clic pour ouvrir
    document.querySelectorAll('.dossier-row').forEach(row => {
        row.addEventListener('dblclick', function() {
            const dossierId = this.getAttribute('data-dossier-id');
            viewDossierDetail(parseInt(dossierId));
        });
    });
}



// ============= INITIALISATION ORDONNANCE =============

async function initOrdonnanceModal() {
    // Charger la liste des patients
    await chargerPatientsOrdonnance();
    
    // Setup event listeners
    setupOrdonnanceListeners();
}

async function chargerPatientsOrdonnance() {
    try {
        const response = await fetch('/medecin/api/patients');
        if (!response.ok) throw new Error('Erreur chargement patients');
        
        ordonnancesData.patients = await response.json();
        
        // Remplir le select
        const select = document.getElementById('ordonnancePatientSelect');
        select.innerHTML = '<option value="">-- Sélectionner un patient --</option>';
        
        ordonnancesData.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.nom_complet} (${patient.age} ans)`;
            option.dataset.patient = JSON.stringify(patient);
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur chargement patients:', error);
    }
}

function setupOrdonnanceListeners() {
    // Sélection du patient
    const patientSelect = document.getElementById('ordonnancePatientSelect');
    if (patientSelect) {
        patientSelect.addEventListener('change', function() {
            if (this.value) {
                const option = this.options[this.selectedIndex];
                const patient = JSON.parse(option.dataset.patient);
                
                ordonnancesData.patientSelectionne = patient;
                
                // Afficher les infos du patient
                document.getElementById('patientInfoDisplay').style.display = 'block';
                document.getElementById('displayPatientNom').textContent = patient.nom_complet;
                document.getElementById('displayPatientAge').textContent = patient.age + ' ans';
                document.getElementById('displayPatientEmail').textContent = patient.email;
                document.getElementById('displayPatientTel').textContent = patient.telephone || 'N/A';
                
                // Mettre à jour les champs cachés
                document.getElementById('ordonnancePatientId').value = patient.id;
                document.getElementById('ordonnancePatientName').value = patient.nom_complet;
            } else {
                document.getElementById('patientInfoDisplay').style.display = 'none';
            }
        });
    }
    
    // Soumettre ordonnance
    const submitBtn = document.getElementById('submitOrdonnanceBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitOrdonnance);
    }
}

// ============= OUVRIR MODAL CRÉATION ORDONNANCE =============

function openNouvelleOrdonnance() {
    const modal = new bootstrap.Modal(document.getElementById('ordonnanceModal'));
    
    // Réinitialiser le formulaire
    document.getElementById('ordonnanceForm').reset();
    document.getElementById('patientInfoDisplay').style.display = 'none';
    document.getElementById('ordonnancePatientSelect').value = '';
    
    // Charger les patients frais
    chargerPatientsOrdonnance();
    
    modal.show();
}

// ============= SOUMETTRE ORDONNANCE =============

async function submitOrdonnance() {
    // Validation
    const patientId = document.getElementById('ordonnancePatientId').value;
    const medicaments = document.getElementById('ordonnanceMedicaments').value.trim();
    const posologie = document.getElementById('ordonnancePosologie').value.trim();
    const duree = document.getElementById('ordonnanceDuree').value.trim();
    
    if (!patientId) {
        alert('⚠️ Veuillez sélectionner un patient');
        return;
    }
    
    if (!medicaments) {
        alert('⚠️ Veuillez renseigner les médicaments');
        return;
    }
    
    if (!posologie) {
        alert('⚠️ Veuillez renseigner la posologie');
        return;
    }
    
    if (!duree) {
        alert('⚠️ Veuillez renseigner la durée du traitement');
        return;
    }
    
    // Afficher un loading
    const submitBtn = document.getElementById('submitOrdonnanceBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création en cours...';
    
    try {
        const formData = new FormData();
        formData.append('patient_id', patientId);
        formData.append('medicaments', medicaments);
        formData.append('posologie', posologie);
        formData.append('duree_traitement', duree);
        
        const response = await fetch('/medecin/api/ordonnances/creer', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erreur création ordonnance');
        }
        
        const result = await response.json();
        
        // Succès
        alert('✅ Ordonnance créée et PDF généré avec succès!');
        
        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(document.getElementById('ordonnanceModal'));
        modal.hide();
        
        // Recharger la liste des ordonnances
        if (typeof loadOrdonnances === 'function') {
            loadOrdonnances();
        }
        
        // Télécharger le PDF automatiquement (optionnel)
        downloadOrdonnancePDF(result.ordonnance_id);
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============= CHARGER ORDONNANCES =============

async function loadOrdonnances() {
    const mainContent = document.getElementById('mainContent');
    
    try {
        const response = await fetch('/medecin/api/ordonnances');
        if (!response.ok) throw new Error("Erreur serveur");
        
        const data = await response.json();
        ordonnancesData.list = data.ordonnances || [];
        
        displayOrdonnances(ordonnancesData.list);
        
    } catch (error) {
        console.error('Erreur chargement ordonnances:', error);
        mainContent.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                Erreur lors du chargement des ordonnances
            </div>
        `;
    }
}

// ============= AFFICHER ORDONNANCES =============

function displayOrdonnances(ordonnances) {
    const container = document.getElementById('ordonnancesTable');
    
    if (!ordonnances || ordonnances.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-prescription-bottle"></i>
                <p>Aucune ordonnance créée</p>
                <button class="btn btn-primary mt-3" onclick="openNouvelleOrdonnance()">
                    <i class="fas fa-plus"></i> Créer une ordonnance
                </button>
            </div>
        `;
        return;
    }
    
    const html = `
        <table class="table-ordonnances">
            <thead>
                <tr>
                    <th>Patient</th>
                    <th>Date d'émission</th>
                    <th>Médicaments</th>
                    <th>Durée</th>
                    <th>Statut</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${ordonnances.map(ord => `
                    <tr class="ordonnance-row">
                        <td>
                            <div class="patient-info">
                                <span class="patient-avatar">
                                    ${ord.patient.nom_complet.charAt(0).toUpperCase()}${ord.patient.nom_complet.split(' ')[1]?.charAt(0).toUpperCase() || ''}
                                </span>
                                <span class="patient-name">${ord.patient.nom_complet}</span>
                            </div>
                        </td>
                        <td>${ord.date_emission}</td>
                        <td>
                            <span title="${ord.medicaments}" class="truncate">
                                ${ord.medicaments.substring(0, 40)}${ord.medicaments.length > 40 ? '...' : ''}
                            </span>
                        </td>
                        <td>${ord.duree_traitement}</td>
                        <td>
                            <span class="status-badge status-${ord.statut.toLowerCase()}">
                                ${ord.statut}
                            </span>
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-action view" onclick="viewOrdonnanceDetail(${ord.id})" title="Voir">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <a href="/medecin/api/ordonnances/telecharger/${ord.id}" class="btn-action download" title="Télécharger">
                                    <i class="fas fa-download"></i>
                                </a>
                                <button class="btn-action delete" onclick="deleteOrdonnance(${ord.id})" title="Supprimer">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// ============= VOIR DÉTAILS ORDONNANCE =============

function viewOrdonnanceDetail(ordonnanceId) {
    const ordonnance = ordonnancesData.list.find(o => o.id === ordonnanceId);
    if (!ordonnance) return;
    
    const modalHTML = `
        <div class="modal fade" id="detailOrdonnanceModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header" style="background: linear-gradient(135deg, #0d8abc 0%, #00bcd4 100%); color: white;">
                        <h5 class="modal-title">
                            <i class="fas fa-file-prescription"></i> Ordonnance Détails
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="detail-section">
                            <h6 class="section-title">
                                <i class="fas fa-user"></i> Patient
                            </h6>
                            <p><strong>${ordonnance.patient.nom_complet}</strong></p>
                        </div>
                        
                        <div class="detail-section">
                            <h6 class="section-title">
                                <i class="fas fa-pills"></i> Prescription
                            </h6>
                            <p><strong>Médicaments:</strong></p>
                            <p>${ordonnance.medicaments.replace(/\n/g, '<br>')}</p>
                            <p style="margin-top: 12px;"><strong>Posologie:</strong></p>
                            <p>${ordonnance.posologie.replace(/\n/g, '<br>')}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h6 class="section-title">
                                <i class="fas fa-calendar"></i> Infos
                            </h6>
                            <p><strong>Date d'émission:</strong> ${ordonnance.date_emission}</p>
                            <p><strong>Durée:</strong> ${ordonnance.duree_traitement}</p>
                            <p><strong>Médecin:</strong> ${ordonnance.medecin_nom}</p>
                            <p><strong>Statut:</strong> <span class="status-badge status-${ordonnance.statut.toLowerCase()}">${ordonnance.statut}</span></p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <a href="/medecin/api/ordonnances/telecharger/${ordonnanceId}" class="btn btn-primary">
                            <i class="fas fa-download"></i> Télécharger PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter et afficher la modale
    let existingModal = document.getElementById('detailOrdonnanceModal');
    if (existingModal) existingModal.remove();
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    document.body.appendChild(tempDiv.firstElementChild);
    
    const modal = new bootstrap.Modal(document.getElementById('detailOrdonnanceModal'));
    modal.show();
}

// ============= TÉLÉCHARGER PDF =============

function downloadOrdonnancePDF(ordonnanceId) {
    const link = document.createElement('a');
    link.href = `/medecin/api/ordonnances/telecharger/${ordonnanceId}`;
    link.download = `ordonnance_${ordonnanceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============= SUPPRIMER ORDONNANCE =============

function deleteOrdonnance(ordonnanceId) {
    const confirmed = confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance?');
    if (!confirmed) return;
    
    alert('Fonction suppression en développement');
    // À implémenter: route DELETE /api/ordonnances/{id}
}

// ============= GET ORDONNANCES CONTENT =============

function getOrdonnancesContent() {
    return `
        <div class="content-section">
            <div class="section-header">
                <h2 class="section-title">
                    <i class="fas fa-prescription-bottle"></i> Ordonnances
                </h2>
                <div class="section-actions">
                    <button class="btn btn-primary" onclick="openNouvelleOrdonnance()">
                        <i class="fas fa-plus-circle"></i> Nouvelle Ordonnance
                    </button>
                </div>
            </div>
            
            <div class="custom-table" id="ordonnancesTable">
                <p class="text-center text-muted">Chargement des ordonnances...</p>
            </div>
        </div>
    `;
}

// ============= CSS STYLES ORDONNANCES =============

const ordonnanceStyles = `
    <style>
        .table-ordonnances {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .table-ordonnances thead {
            background: linear-gradient(135deg, #0d8abc 0%, #0a6d9e 100%);
            color: white;
        }
        
        .table-ordonnances thead th {
            padding: 16px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .table-ordonnances tbody tr {
            border-bottom: 1px solid #f0f0f0;
            transition: all 0.3s ease;
        }
        
        .table-ordonnances tbody tr:hover {
            background-color: #f8f9fa;
        }
        
        .table-ordonnances tbody td {
            padding: 14px 16px;
            vertical-align: middle;
            font-size: 14px;
        }
        
        .patient-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .patient-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #0d8abc, #00bcd4);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
        }
        
        .patient-name {
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-active {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .status-inactive {
            background-color: #e5e7eb;
            color: #374151;
        }
        
        .action-buttons {
            display: flex;
            gap: 8px;
        }
        
        .btn-action {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            color: white;
            text-decoration: none;
            background-color: #0d8abc;
        }
        
        .btn-action:hover {
            background-color: #0a6d9e;
            transform: scale(1.1);
        }
        
        .btn-action.download {
            background-color: #10b981;
        }
        
        .btn-action.download:hover {
            background-color: #059669;
        }
        
        .btn-action.delete {
            background-color: #ef4444;
        }
        
        .btn-action.delete:hover {
            background-color: #dc2626;
        }
        
        .truncate {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }
        
        .empty-state i {
            font-size: 48px;
            margin-bottom: 16px;
            color: #ccc;
        }
        
        .empty-state p {
            font-size: 16px;
            margin: 0;
            color: #666;
        }
        
        .detail-section {
            background: #f9f9f9;
            border-left: 4px solid #0d8abc;
            padding: 16px;
            border-radius: 6px;
            margin-bottom: 16px;
        }
        
        .section-title {
            font-size: 15px;
            font-weight: 700;
            color: #0d8abc;
            margin: 0 0 16px 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .detail-section p {
            margin: 8px 0;
            color: #333;
            line-height: 1.6;
        }
        
        @media (max-width: 768px) {
            .table-ordonnances {
                font-size: 12px;
            }
            
            .table-ordonnances thead th,
            .table-ordonnances tbody td {
                padding: 10px 8px;
            }
            
            .action-buttons {
                flex-direction: column;
            }
            
            .btn-action {
                width: 28px;
                height: 28px;
            }
        }
    </style>
`;

// Injecter les styles
if (document.head) {
    document.head.insertAdjacentHTML('beforeend', ordonnanceStyles);
}

// ============= UPLOAD PHOTO PROFIL =============
document.getElementById("profileAvatar").addEventListener("click", () => {
    document.getElementById("photoInput").click();
});

document.getElementById("photoInput").addEventListener("change", async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch("/medecin/api/upload-photo", {
        method: "POST",
        body: formData
    });

    const data = await res.json();

    if (data.success) {
        document.getElementById("profileAvatar").src = data.photo_url;
    } else {
        alert("Erreur upload");
    }
});
