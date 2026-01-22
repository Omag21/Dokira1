
document.addEventListener('DOMContentLoaded', function () {

    // ========== NAVIGATION ==========
    const menuLinks = document.querySelectorAll('.menu-link');
    const mainContent = document.getElementById('mainContent');

    menuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Retirer la classe active
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            // Afficher le contenu
            const section = this.getAttribute('data-section');
            loadSection(section);
        });
    });

    // ========== GESTION DU CHAT IA ==========
    const chatIABtn = document.getElementById('chatIABtn');
    const chatIAPanel = document.getElementById('chatIAPanel');
    const chatIAClose = document.getElementById('chatIAClose');
    const chatIASend = document.getElementById('chatIASend');
    const chatIAInput = document.getElementById('chatIAInput');
    const chatIABody = document.getElementById('chatIABody');

    chatIABtn.addEventListener('click', function () {
        chatIAPanel.classList.add('active');
    });

    chatIAClose.addEventListener('click', function () {
        chatIAPanel.classList.remove('active');
    });

    chatIASend.addEventListener('click', function () {
        const question = chatIAInput.value.trim();
        if (question) {
            sendIAMessage(question);
            chatIAInput.value = '';
        }
    });

    chatIAInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatIASend.click();
        }
    });

    // ========== CHANGEMENT DE LANGUE ==========
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.addEventListener('change', function () {
        const langue = this.value;
        changeLanguage(langue);
    });

    // ========== FONCTIONS ==========

    function loadSection(section) {
        switch (section) {
            case 'dashboard':
                mainContent.innerHTML = getDashboardContent();
                break;
            case 'rdv':
                mainContent.innerHTML = getRDVContent();
                break;
            case 'patients':
                mainContent.innerHTML = getPatientsContent();
                break;
            case 'dossiers':
                mainContent.innerHTML = getDossiersContent();
                break;
            case 'messagerie':
                mainContent.innerHTML = getMessagerieContent();
                break;
            case 'visio':
                mainContent.innerHTML = getVisioContent();
                break;
            case 'historique':
                mainContent.innerHTML = getHistoriqueContent();
                break;
            case 'parametres':
                mainContent.innerHTML = getParametresContent();
                break;
        }
    }

    function getDashboardContent() {
        return `
            <div class="welcome-card">
                <div class="welcome-content">
                    <h1>Bonjour Dr. Marie Laurent 👋</h1>
                    <p>Vous avez 8 rendez-vous aujourd'hui et 5 nouveaux messages de patients</p>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon blue">
                            <i class="fas fa-calendar-check"></i>
                        </div>
                    </div>
                    <div class="stat-value">8</div>
                    <div class="stat-label">RDV Aujourd'hui</div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon green">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="stat-value">127</div>
                    <div class="stat-label">Patients Actifs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon orange">
                            <i class="fas fa-folder-open"></i>
                        </div>
                    </div>
                    <div class="stat-value">24</div>
                    <div class="stat-label">En Traitement</div>
                </div>
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon red">
                            <i class="fas fa-envelope"></i>
                        </div>
                    </div>
                    <div class="stat-value">5</div>
                    <div class="stat-label">Messages Non Lus</div>
                </div>
            </div>

            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Patients à Traiter Aujourd'hui</h2>
                </div>
                <div class="custom-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Motif</th>
                                <th>Heure</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getPatientRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function getRDVContent() {
        return `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Mes Rendez-vous</h2>
                    <div class="section-actions">
                        <button class="btn-filter active">Tous</button>
                        <button class="btn-filter">Aujourd'hui</button>
                        <button class="btn-filter">Cette semaine</button>
                        <button class="btn-filter">Ce mois</button>
                    </div>
                </div>
                <div class="custom-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Type</th>
                                <th>Date & Heure</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getRDVRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function getPatientsContent() {
        return `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Liste de mes Patients (127)</h2>
                    <div class="section-actions">
                        <button class="btn-filter active">Tous</button>
                        <button class="btn-filter">En traitement</button>
                        <button class="btn-filter">Traités</button>
                        <button class="btn-filter">En suivi</button>
                    </div>
                </div>
                <div class="custom-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Dernier RDV</th>
                                <th>Pathologie</th>
                                <th>Statut Traitement</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getPatientListRows()}
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
                    <div class="section-actions">
                        <button class="btn-filter active">Tous</button>
                        <button class="btn-filter">À traiter</button>
                        <button class="btn-filter">En cours</button>
                        <button class="btn-filter">Traités</button>
                    </div>
                </div>
                <div class="custom-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Diagnostic</th>
                                <th>Date Consultation</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getDossierRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function getMessagerieContent() {
        return `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Messagerie (5 non lus)</h2>
                    <div class="section-actions">
                        <button class="btn-filter active">Tous</button>
                        <button class="btn-filter">Non lus</button>
                        <button class="btn-filter">Envoyés</button>
                    </div>
                </div>
                <div class="custom-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Expéditeur</th>
                                <th>Sujet</th>
                                <th>Date</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getMessageRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function getVisioContent() {
        return `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Consultations en Visioconférence</h2>
                </div>
                <div class="welcome-card">
                    <div class="welcome-content">
                        <h2 style="margin-bottom: 20px;">
                            <i class="fas fa-video me-3"></i>
                            Prochaine visioconférence dans 30 minutes
                        </h2>
                        <p>Patient: Jean Dupont - Consultation de suivi</p>
                        <button style="margin-top: 20px; padding: 12px 30px; background: white; color: var(--primary-color); border: none; border-radius: 10px; font-weight: 600; cursor: pointer;">
                            <i class="fas fa-video me-2"></i>
                            Rejoindre la consultation
                        </button>
                    </div>
                </div>
                <div class="custom-table" style="margin-top: 30px;">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Date & Heure</th>
                                <th>Type</th>
                                <th>Lien</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getVisioRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function getHistoriqueContent() {
        return `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Historique des Consultations</h2>
                    <div class="section-actions">
                        <button class="btn-filter active">Cette semaine</button>
                        <button class="btn-filter">Ce mois</button>
                        <button class="btn-filter">Trimestre</button>
                        <button class="btn-filter">Année</button>
                    </div>
                </div>
                
                <div class="stats-grid" style="margin-bottom: 30px;">
                    <div class="stat-card">
                        <div class="stat-value">42</div>
                        <div class="stat-label">Cette semaine</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">178</div>
                        <div class="stat-label">Ce mois</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">892</div>
                        <div class="stat-label">Cette année</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">3,247</div>
                        <div class="stat-label">Total</div>
                    </div>
                </div>
                
                <div class="custom-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Type Consultation</th>
                                <th>Date</th>
                                <th>Diagnostic</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getHistoriqueRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function getParametresContent() {
        return `
            <div class="content-section">
                <h2 class="section-title">Paramètres du Compte</h2>
                <div style="background: white; padding: 30px; border-radius: 12px; margin-top: 20px;">
                    <h3 style="margin-bottom: 20px;">Informations Personnelles</h3>
                    <p>Section en développement...</p>
                </div>
            </div>
        `;
    }

    // Fonctions pour générer les lignes de tableaux

    function getPatientRows() {
        const patients = [
            { nom: 'Jean Dupont', initiales: 'JD', age: 45, groupe: 'A+', motif: 'Consultation cardiologie', heure: '14:00', statut: 'a-traiter' },
            { nom: 'Marie Lambert', initiales: 'ML', age: 32, groupe: 'O+', motif: 'Suivi post-opératoire', heure: '15:30', statut: 'en-cours' },
            { nom: 'Pierre Bernard', initiales: 'PB', age: 58, groupe: 'AB+', motif: 'Contrôle annuel', heure: '16:00', statut: 'suivi' }
        ];

        return patients.map(p => `
            <tr>
                <td>
                    <div class="patient-info">
                        <div class="patient-avatar">${p.initiales}</div>
                        <div class="patient-details">
                            <div class="patient-name">${p.nom}</div>
                            <div class="patient-meta">${p.age} ans - Groupe ${p.groupe}</div>
                        </div>
                    </div>
                </td>
                <td>${p.motif}</td>
                <td>${p.heure}</td>
                <td><span class="status-badge ${p.statut}">${getStatutLabel(p.statut)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action view" title="Voir dossier">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action message" title="Message">
                            <i class="fas fa-envelope"></i>
                        </button>
                        <button class="btn-action visio" title="Visioconférence">
                            <i class="fas fa-video"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function getRDVRows() {
        return `
            <tr>
                <td><div class="patient-info"><div class="patient-avatar">JD</div><div class="patient-details"><div class="patient-name">Jean Dupont</div></div></div></td>
                <td>Cabinet</td>
                <td>Aujourd'hui 14:00</td>
                <td><span class="status-badge en-cours">Confirmé</span></td>
                <td><div class="action-buttons"><button class="btn-action view"><i class="fas fa-eye"></i></button></div></td>
            </tr>
        `.repeat(5);
    }

    function getPatientListRows() {
        return `
            <tr>
                <td><div class="patient-info"><div class="patient-avatar">JD</div><div class="patient-details"><div class="patient-name">Jean Dupont</div><div class="patient-meta">45 ans</div></div></div></td>
                <td>12/12/2024</td>
                <td>Hypertension artérielle</td>
                <td><span class="status-badge en-cours">En traitement</span></td>
                <td><div class="action-buttons"><button class="btn-action view"><i class="fas fa-folder-open"></i></button></div></td>
            </tr>
        `.repeat(8);
    }

    function getDossierRows() {
        return getPatientListRows();
    }

    function getMessageRows() {
        return `
            <tr>
                <td><div class="patient-info"><div class="patient-avatar">JD</div><div class="patient-details"><div class="patient-name">Jean Dupont</div></div></div></td>
                <td>Question sur mon traitement</td>
                <td>Il y a 2h</td>
                <td><span class="status-badge a-traiter">Non lu</span></td>
                <td><div class="action-buttons"><button class="btn-action view"><i class="fas fa-envelope-open"></i></button></div></td>
            </tr>
        `.repeat(5);
    }

    function getVisioRows() {
        return `
            <tr>
                <td><div class="patient-info"><div class="patient-avatar">JD</div><div class="patient-details"><div class="patient-name">Jean Dupont</div></div></div></td>
                <td>Aujourd'hui 17:00</td>
                <td>Consultation</td>
                <td><a href="#" style="color: var(--primary-color);">Lien visio</a></td>
                <td><div class="action-buttons"><button class="btn-action visio"><i class="fas fa-video"></i></button></div></td>
            </tr>
        `.repeat(3);
    }

    function getHistoriqueRows() {
        return getPatientListRows();
    }

    function getStatutLabel(statut) {
        const labels = {
            'a-traiter': 'À traiter',
            'en-cours': 'En cours',
            'traite': 'Traité',
            'suivi': 'En suivi'
        };
        return labels[statut] || statut;
    }

    function sendIAMessage(question) {
        // Ajouter la question de l'utilisateur
        const userMsg = `
            <div style="margin-bottom: 15px; text-align: right;">
                <div style="display: inline-block; background: var(--primary-color); color: white; padding: 12px 16px; border-radius: 12px 12px 0 12px; max-width: 80%;">
                    ${question}
                </div>
            </div>
        `;
        chatIABody.innerHTML += userMsg;

        // Simuler une réponse de l'IA
        setTimeout(() => {
            const iaResponse = `
                <div style="margin-bottom: 15px;">
                    <div style="display: inline-block; background: var(--light-bg); color: var(--text-primary); padding: 12px 16px; border-radius: 12px 12px 12px 0; max-width: 80%;">
                        <strong>Assistant IA:</strong><br>
                        Voici une réponse basée sur les dernières recommandations médicales...
                    </div>
                </div>
            `;
            chatIABody.innerHTML += iaResponse;
            chatIABody.scrollTop = chatIABody.scrollHeight;
        }, 1000);

        chatIABody.scrollTop = chatIABody.scrollHeight;
    }

    function changeLanguage(langue) {
        console.log('Changement de langue vers:', langue);
        // Implémenter le changement de langue
    }



    // ================== INITIALISATION ==================

    // Activer le lien "Tableau de bord" par défaut
    menuLinks.forEach(l => l.classList.remove('active'));

    const dashboardLink = document.querySelector('.menu-link[data-section="dashboard"]');
    if (dashboardLink) {
        dashboardLink.classList.add('active');
    }

    // Charger le dashboard automatiquement au chargement
    loadSection('dashboard');

    
    // ============= GESTION DE LA DÉCONNEXION =============

    // Trouver le lien de déconnexion
    const logoutLink = document.querySelector('a[href="/medecin/deconnexionMedecin"]');

    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault(); // Empêcher la navigation immédiate
            
            // Demander confirmation
            const confirmed = confirm(
                'Êtes-vous sûr de vouloir vous déconnecter ?\n\n' +
                'Votre session sera fermée et vous serez redirigé vers la page de connexion.'
            );
            
            if (confirmed) {
                // Animation simple
                const originalHTML = logoutLink.innerHTML;
                logoutLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Déconnexion...';
                logoutLink.style.pointerEvents = 'none';
                
                // Rediriger après un court délai pour l'animation
                setTimeout(() => {
                    window.location.href = '/medecin/deconnexionMedecin';  
                }, 1000);
            }
        });
    }

    
    
});