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
            break;
        case 'ordonnances':
            mainContent.innerHTML = getOrdonnancesContent();
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



// ============= VARIABLES GLOBALES - MESSAGERIE =============

let messagerie = {
    conversations: [],
    patientActuel: null,
    messagesActuels: [],
    patients: [],
    autoRefresh: null
};

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