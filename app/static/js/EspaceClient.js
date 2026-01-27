// ============= DONNÉES STRUCTURÉES POUR CHAQUE SECTION =============
const sectionsData = {
    dashboard: {
        stats: [
            {
                icon: 'fa-calendar-check',
                color: 'blue',
                value: '0',
                label: 'RDV à venir',
                change: { type: 'positive', text: '+0 ce mois' }
            },
            {
                icon: 'fa-file-medical',
                color: 'green',
                value: '0',
                label: 'Documents',
                change: { type: 'positive', text: '+0 récents' }
            },
            {
                icon: 'fa-comments',
                color: 'orange',
                value: '0',
                label: 'Messages',
                change: { type: 'positive', text: '0 non lus' }
            },
            {
                icon: 'fa-heartbeat',
                color: 'red',
                value: '0%',
                label: 'Suivi santé',
                change: { type: 'positive', text: 'Non évalué' }
            }
        ],
        cards: [
            {
                icon: 'fa-calendar-alt',
                color: 'blue',
                title: 'Prochain Rendez-vous',
                subtitle: 'Aucun rendez-vous programmé',
                description: 'Prenez rendez-vous avec votre médecin',
                meta: [
                    { icon: 'fa-clock', text: 'Aucune date' },
                    { icon: 'fa-map-marker-alt', text: 'En attente' }
                ],
                badge: { type: 'warning', text: 'À planifier' }
            },
            {
                icon: 'fa-file-prescription',
                color: 'green',
                title: 'Ordonnance Active',
                subtitle: 'Aucune ordonnance active',
                description: 'Consultez vos ordonnances dans la section dédiée',
                meta: [
                    { icon: 'fa-pills', text: '0 traitement' },
                    { icon: 'fa-calendar', text: 'Aucune' }
                ],
                badge: { type: 'info', text: 'Vérifier' }
            },
            {
                icon: 'fa-vial',
                color: 'purple',
                title: 'Résultats Analyses',
                subtitle: 'Aucun résultat disponible',
                description: 'Consultez vos analyses dans la section dédiée',
                meta: [
                    { icon: 'fa-check-circle', text: 'Aucun résultat' },
                    { icon: 'fa-calendar', text: 'Aucune date' }
                ],
                badge: { type: 'info', text: 'Vérifier' }
            }
        ]
    },
    profil: {
        cards: [
            {
                icon: 'fa-id-card',
                color: 'blue',
                title: 'Informations Personnelles',
                subtitle: 'Identité et coordonnées',
                description: 'Nom, prénom, date de naissance, adresse, contacts',
                meta: [
                    { icon: 'fa-check-circle', text: 'Profil à compléter' }
                ],
                badge: { type: 'warning', text: 'À vérifier' }
            },
            {
                icon: 'fa-shield-alt',
                color: 'green',
                title: 'Sécurité du Compte',
                subtitle: 'Authentification et confidentialité',
                description: 'Mot de passe, authentification à deux facteurs, sessions actives',
                meta: [
                    { icon: 'fa-lock', text: 'Sécurisé' }
                ],
                badge: { type: 'success', text: 'Protégé' }
            },
            {
                icon: 'fa-heart',
                color: 'orange',
                title: 'Informations Médicales',
                subtitle: 'Groupe sanguin et allergies',
                description: 'À compléter dans vos paramètres',
                meta: [
                    { icon: 'fa-info-circle', text: '0 information' }
                ],
                badge: { type: 'primary', text: 'Important' }
            }
        ]
    },
    dossier: {
        cards: [
            {
                icon: 'fa-history',
                color: 'blue',
                title: 'Historique Médical',
                subtitle: '0 consultations enregistrées',
                description: 'Accédez à l\'ensemble de vos consultations et diagnostics passés',
                meta: [
                    { icon: 'fa-calendar', text: 'Aucune donnée' }
                ],
                badge: { type: 'primary', text: '0 entrée' }
            },
            {
                icon: 'fa-allergies',
                color: 'orange',
                title: 'Allergies Connues',
                subtitle: 'Liste des allergies déclarées',
                description: 'À compléter dans vos paramètres',
                meta: [
                    { icon: 'fa-exclamation-triangle', text: '0 allergie' }
                ],
                badge: { type: 'warning', text: 'Important' }
            },
            {
                icon: 'fa-dna',
                color: 'purple',
                title: 'Antécédents',
                subtitle: 'Antécédents personnels et familiaux',
                description: 'À compléter dans vos paramètres',
                meta: [
                    { icon: 'fa-users', text: 'À renseigner' }
                ],
                badge: { type: 'primary', text: 'À surveiller' }
            }
        ]
    },
    'rendez-vous': {
        cards: [
            {
                icon: 'fa-calendar-plus',
                color: 'blue',
                title: 'Prendre Rendez-vous',
                subtitle: 'Nouveau rendez-vous médical',
                description: 'Réservez une consultation avec un professionnel de santé',
                meta: [
                    { icon: 'fa-clock', text: 'Disponible maintenant' }
                ],
                badge: { type: 'primary', text: 'Réserver' }
            },
            {
                icon: 'fa-calendar-check',
                color: 'green',
                title: 'RDV à Venir',
                subtitle: '0 rendez-vous planifiés',
                description: 'Consultez vos rendez-vous programmés',
                meta: [
                    { icon: 'fa-calendar', text: 'Aucun RDV' }
                ],
                badge: { type: 'success', text: '0 RDV' }
            },
            {
                icon: 'fa-history',
                color: 'purple',
                title: 'Historique Rendez-vous',
                subtitle: '0 consultations passées',
                description: 'Consultez l\'historique complet de vos rendez-vous',
                meta: [
                    { icon: 'fa-list', text: 'Tout l\'historique' }
                ],
                badge: { type: 'primary', text: '0 RDV' }
            }
        ]
    },
    messagerie: {
        cards: [
            {
                icon: 'fa-inbox',
                color: 'blue',
                title: 'Boîte de Réception',
                subtitle: '0 messages non lus',
                description: 'Nouveaux messages de vos médecins et professionnels de santé',
                meta: [
                    { icon: 'fa-envelope', text: '0 message total' }
                ],
                badge: { type: 'primary', text: '0 non lu' },
                onclick: 'showMessagerieInterface()'
            },
            {
                icon: 'fa-paper-plane',
                color: 'green',
                title: 'Messages Envoyés',
                subtitle: 'Vos conversations',
                description: 'Historique des messages envoyés à vos médecins',
                meta: [
                    { icon: 'fa-comments', text: '0 conversation' }
                ],
                badge: { type: 'primary', text: 'Voir' },
                onclick: 'showMessagerieInterface()'
            },
            {
                icon: 'fa-edit',
                color: 'purple',
                title: 'Nouveau Message',
                subtitle: 'Contacter un médecin',
                description: 'Envoyez un message à un professionnel de santé',
                meta: [
                    { icon: 'fa-plus', text: 'Composer' }
                ],
                badge: { type: 'success', text: 'Écrire' },
                onclick: 'showNewMessageForm()'
            }
        ]
    },
    ordonnances: {
        cards: [
            {
                icon: 'fa-prescription',
                color: 'green',
                title: 'Ordonnances Actives',
                subtitle: '0 prescriptions en cours',
                description: 'Consultez vos ordonnances actives',
                meta: [
                    { icon: 'fa-pills', text: 'À renseigner' }
                ],
                badge: { type: 'success', text: 'Vérifier' }
            },
            {
                icon: 'fa-archive',
                color: 'blue',
                title: 'Archives Ordonnances',
                subtitle: '0 ordonnances archivées',
                description: 'Historique complet de toutes vos prescriptions',
                meta: [
                    { icon: 'fa-calendar', text: 'Aucune donnée' }
                ],
                badge: { type: 'primary', text: '0 fichier' }
            },
            {
                icon: 'fa-bell',
                color: 'orange',
                title: 'Rappels Médicaments',
                subtitle: 'Notifications à activer',
                description: 'Recevez des rappels pour la prise de vos médicaments',
                meta: [
                    { icon: 'fa-clock', text: '0 rappel/jour' }
                ],
                badge: { type: 'info', text: 'À activer' }
            }
        ]
    },
    documents: {
        cards: [
            {
                icon: 'fa-file-pdf',
                color: 'blue',
                title: 'Comptes Rendus',
                subtitle: '0 documents disponibles',
                description: 'Rapports de consultation, analyses et diagnostics',
                meta: [
                    { icon: 'fa-download', text: 'Télécharger tout' }
                ],
                badge: { type: 'primary', text: '0 PDF' },
                onclick: 'showDocumentsInterface()'
            },
            {
                icon: 'fa-x-ray',
                color: 'purple',
                title: 'Imagerie Médicale',
                subtitle: '0 examens radiologiques',
                description: 'Radiographies, IRM, scanners et échographies',
                meta: [
                    { icon: 'fa-images', text: '0 examen' }
                ],
                badge: { type: 'primary', text: 'Images' },
                onclick: 'showDocumentsInterface()'
            },
            {
                icon: 'fa-upload',
                color: 'green',
                title: 'Téléverser Document',
                subtitle: 'Ajouter un fichier',
                description: 'Importez vos propres documents médicaux',
                meta: [
                    { icon: 'fa-cloud-upload-alt', text: 'Format PDF, JPG' }
                ],
                badge: { type: 'success', text: 'Importer' },
                onclick: 'showUploadDocumentForm()'
            }
        ]
    },
    analyses: {
        cards: [
            {
                icon: 'fa-vial',
                color: 'purple',
                title: 'Dernières Analyses',
                subtitle: 'Aucun bilan disponible',
                description: 'Résultats complets disponibles',
                meta: [
                    { icon: 'fa-check-circle', text: 'Aucun résultat' },
                    { icon: 'fa-calendar', text: 'Aucune date' }
                ],
                badge: { type: 'info', text: 'Vérifier' }
            },
            {
                icon: 'fa-chart-line',
                color: 'blue',
                title: 'Suivi des Paramètres',
                subtitle: 'Évolution de votre santé',
                description: 'Graphiques et tendances de vos indicateurs de santé',
                meta: [
                    { icon: 'fa-heartbeat', text: 'Tous les indicateurs' }
                ],
                badge: { type: 'primary', text: 'Voir graphiques' }
            },
            {
                icon: 'fa-history',
                color: 'green',
                title: 'Historique Analyses',
                subtitle: '0 bilans enregistrés',
                description: 'Accédez à tous vos résultats d\'analyses passées',
                meta: [
                    { icon: 'fa-calendar', text: 'Aucune donnée' }
                ],
                badge: { type: 'primary', text: '0 bilan' }
            }
        ]
    },
    medecins: {
        cards: []
    },
    injections: {
        cards: [
            {
                icon: 'fa-syringe',
                color: 'green',
                title: 'Carnet de Vaccination',
                subtitle: 'Vaccins à jour',
                description: 'Consultez votre carnet de vaccination',
                meta: [
                    { icon: 'fa-check-circle', text: 'À compléter' }
                ],
                badge: { type: 'success', text: 'Vérifier' }
            },
            {
                icon: 'fa-calendar-alt',
                color: 'orange',
                title: 'Prochains Rappels',
                subtitle: '0 rappel à prévoir',
                description: 'Vérifiez vos prochains rappels de vaccination',
                meta: [
                    { icon: 'fa-clock', text: 'Aucun rappel' }
                ],
                badge: { type: 'warning', text: 'À planifier' }
            },
            {
                icon: 'fa-bell',
                color: 'blue',
                title: 'Notifications Vaccins',
                subtitle: 'Alertes à activer',
                description: 'Recevez des rappels automatiques pour vos vaccinations',
                meta: [
                    { icon: 'fa-envelope', text: 'Par email et SMS' }
                ],
                badge: { type: 'info', text: 'À activer' }
            }
        ]
    },
    parametres: {
        cards: [
            {
                icon: 'fa-globe',
                color: 'blue',
                title: 'Langue & Région',
                subtitle: 'Français (France)',
                description: 'Changer la langue d\'affichage et les préférences régionales',
                meta: [
                    { icon: 'fa-flag', text: 'FR' }
                ],
                badge: { type: 'primary', text: 'Français' },
                onclick: 'showParametresInterface()'
            },
            {
                icon: 'fa-bell',
                color: 'orange',
                title: 'Notifications',
                subtitle: 'Gérer les alertes',
                description: 'Email, SMS, push - Personnalisez vos préférences de notification',
                meta: [
                    { icon: 'fa-check', text: 'À configurer' }
                ],
                badge: { type: 'success', text: 'Configurer' },
                onclick: 'showParametresInterface()'
            },
            {
                icon: 'fa-lock',
                color: 'green',
                title: 'Confidentialité & RGPD',
                subtitle: 'Protection des données',
                description: 'Gérez vos données personnelles et droits RGPD',
                meta: [
                    { icon: 'fa-shield-alt', text: 'À vérifier' }
                ],
                badge: { type: 'success', text: 'Protéger' },
                onclick: 'showParametresInterface()'
            }
        ]
    }
};
//============ VARIABLES GLOBALES =============
let medecins = [];

// ============= FONCTIONS POUR CHARGER LES DONNÉES DYNAMIQUES =============

// Charger les données du patient
async function loadPatientData() {
    try {   
        const response = await timedFetch('/api/patient/info');
        if (response.ok) {
            const data = await response.json();
            
            // Mettre à jour le nom dans la barre de navigation
            const profileName = document.querySelector('.profile-name');
            if (profileName) {
                profileName.textContent = data.nom_complet || 'Patient';
            }
            
            // Mettre à jour l'avatar si disponible (AVEC CACHE BUSTER)
            if (data.photo_profil_url) {
                const avatar = document.getElementById('profileAvatar');
                if (avatar) {
                    avatar.src = data.photo_profil_url + "?t=" + new Date().getTime();
                }
            }
            
            return data;
        }
    } catch (error) {
        console.error('Erreur chargement patient:', error);
    }
    return null;
}

// Charger les statistiques du dashboard
async function loadDashboardStats() {
    try {
        const response = await timedFetch('/api/dashboard/stats');
        if (response.ok) {
            const data = await response.json();
            
            // Mettre à jour les statistiques
            if (data.stats && data.stats.length >= 4) {
                sectionsData.dashboard.stats = data.stats;
            }
            
            // Mettre à jour les badges de navigation
            updateNavBadges(data.stats);
            
            return data;
        }
    } catch (error) {
        console.error('Erreur stats dashboard:', error);
    }
    return null;
}

// Charger les statistiques de la messagerie
async function loadMessagerieStats() {
    try {
        const response = await timedFetch('/api/messagerie/stats');
        if (response.ok) {
            const data = await response.json();
            
            // Mettre à jour les cartes de la messagerie
            sectionsData.messagerie.cards[0].subtitle = `${data.unread_messages || 0} messages non lus`;
            sectionsData.messagerie.cards[0].badge.text = `${data.unread_messages || 0} non lus`;
            sectionsData.messagerie.cards[0].badge.type = data.unread_messages > 0 ? 'danger' : 'primary';
            
            sectionsData.messagerie.cards[1].meta[0].text = `${data.conversations_count || 0} conversations`;
            
            // Mettre à jour le badge de notification
            updateNotificationBadge(data.unread_messages || 0);
            
            return data;
        }
    } catch (error) {
        console.error('Erreur stats messagerie:', error);
    }
    return null;
}

// Charger la liste des médecins
async function loadMedecinsList() {
    try {
        const response = await fetch('/api/medecins');
        if (response.ok) {
            const medecins = await response.json();
            
            // Créer les cartes pour chaque médecin
            sectionsData.medecins.cards = medecins.map(medecin => ({
                icon: 'fa-user-md',
                color: 'blue',
                title: `Dr. ${medecin.prenom} ${medecin.nom}`,
                subtitle: medecin.specialite || "Non spécifié",
                description: `${medecin.annees_experience || 0} ans d'expérience • ${medecin.prix_consultation || 'N/A'}€`,
                meta: [
                    { icon: 'fa-envelope', text: medecin.email || 'Email non disponible' },
                    { icon: 'fa-phone', text: medecin.telephone || 'Téléphone non disponible' }
                ],
                badge: { 
                    type: 'primary', 
                    text: 'Contacter',
                    onclick: `showMessageToMedecin(${medecin.id})`
                }
            }));
            
            return medecins;
        }
    } catch (error) {
        console.error('Erreur chargement médecins:', error);
    }
    return [];
}

// Charger les documents
async function loadDocumentsList() {
    try {
        const response = await timedFetch('/api/documents');
        if (response.ok) {
            const documents = await response.json();
            
            // Mettre à jour le nombre de documents
            sectionsData.documents.cards[0].subtitle = `${documents.length} documents disponibles`;
            sectionsData.documents.cards[0].badge.text = `${documents.length} PDF`;
            sectionsData.dashboard.stats[1].value = documents.length;
            
            return documents;
        }
    } catch (error) {
        console.error('Erreur chargement documents:', error);
    }
    return [];
}

// Charger les ordonnances
async function loadOrdonnancesList() {
    try {
        const response = await timedFetch('/api/ordonnances');
        if (response.ok) {
            const ordonnances = await response.json();
            
            // Mettre à jour le nombre d'ordonnances
            sectionsData.ordonnances.cards[0].subtitle = `${ordonnances.length} prescriptions en cours`;
            sectionsData.ordonnances.cards[0].badge.text = ordonnances.length > 0 ? 'Active' : 'Vérifier';
            
            return ordonnances;
        }
    } catch (error) {
        console.error('Erreur chargement ordonnances:', error);
    }
    return [];
}

// Mettre à jour les badges de navigation
function updateNavBadges(stats) {
    if (!stats) return;
    
    // Badge des rendez-vous
    const rdvBadge = document.querySelector('.nav-link-custom[data-section="rendez-vous"] .nav-badge');
    if (rdvBadge && stats[0]) {
        const rdvCount = parseInt(stats[0].value) || 0;
        rdvBadge.textContent = rdvCount;
        rdvBadge.style.display = rdvCount > 0 ? 'flex' : 'none';
    }
    
    // Badge de la messagerie
    const msgBadge = document.querySelector('.nav-link-custom[data-section="messagerie"] .nav-badge');
    if (msgBadge && stats[2]) {
        const msgCount = parseInt(stats[2].value) || 0;
        msgBadge.textContent = msgCount;
        msgBadge.style.display = msgCount > 0 ? 'flex' : 'none';
    }
}

// Mettre à jour le badge de notification
function updateNotificationBadge(count) {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// ============= INTERFACE MESSAGERIE =============

// Afficher l'interface de messagerie
async function showMessagerieInterface() {
    try {
        // Charger les conversations
        const response = await fetch('/api/messagerie/conversations');
        const conversations = await response.json();
        
        let html = `
            <div class="messagerie-interface">
                <div class="section-header">
                    <h2 class="section-title">Messagerie</h2>
                    <button class="btn btn-primary" onclick="showNewMessageForm()">
                        <i class="fas fa-plus"></i> Nouveau message
                    </button>
                </div>
                
                <div class="conversations-container">
        `;
        
        if (conversations.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div class="empty-state-title">Aucune conversation</div>
                    <div class="empty-state-text">Commencez une nouvelle conversation avec votre médecin</div>
                </div>
            `;
        } else {
            conversations.forEach(conv => {
                html += `
                    <div class="conversation-item" onclick="loadConversation(${conv.medecin_id})">
                        <div class="conversation-avatar">
                            <img src="${conv.medecin_photo || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(conv.medecin_name) + '&background=0066cc&color=fff'}" alt="${conv.medecin_name}">
                        </div>
                        <div class="conversation-info">
                            <h4>${conv.medecin_name}</h4>
                            <p class="conversation-specialite">${conv.specialite}</p>
                            <p class="last-message">${conv.last_message || 'Aucun message'}</p>
                        </div>
                        <div class="conversation-meta">
                            <span class="time">${conv.last_message_time}</span>
                            ${conv.unread > 0 ? `<span class="badge badge-danger">${conv.unread}</span>` : ''}
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
                
                <div id="conversation-area" class="conversation-area"></div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;
    } catch (error) {
        console.error('Erreur interface messagerie:', error);
        document.getElementById('mainContent').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="empty-state-title">Erreur de chargement</div>
                <div class="empty-state-text">Impossible de charger les conversations</div>
            </div>
        `;
    }
}

// Charger une conversation spécifique
async function loadConversation(medecinId) {
    try {
        const response = await fetch(`/api/messagerie/conversation/${medecinId}`);
        const messages = await response.json();
        
        let html = `
            <div class="conversation-detail">
                <div class="conversation-header">
                    <button class="btn btn-back" onclick="showMessagerieInterface()">
                        <i class="fas fa-arrow-left"></i> Retour
                    </button>
                    <h3>Conversation</h3>
                </div>
                <div class="messages-list">
        `;
        
        if (messages.length === 0) {
            html += `
                <div class="empty-conversation">
                    <p>Aucun message dans cette conversation</p>
                </div>
            `;
        } else {
            messages.forEach(msg => {
                const isPatient = msg.expediteur_type === 'patient';
                html += `
                    <div class="message ${isPatient ? 'message-sent' : 'message-received'}">
                        <div class="message-content">${msg.contenu}</div>
                        <div class="message-time">${msg.date_envoi}</div>
                    </div>
                `;
            });
        }
        
        html += `
                </div>
                <div class="message-input">
                    <textarea id="newMessageText" placeholder="Écrivez votre message..." rows="3"></textarea>
                    <button class="btn btn-primary" onclick="sendMessage(${medecinId})">
                        <i class="fas fa-paper-plane"></i> Envoyer
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('conversation-area').innerHTML = html;
        scrollToBottom();
    } catch (error) {
        console.error('Erreur chargement conversation:', error);
        alert('Erreur lors du chargement de la conversation');
    }
}

// Afficher le formulaire de nouveau message
async function showNewMessageForm() {
    try {
        const response = await fetch('/api/medecins');
        const medecins = await response.json();
        
        let options = medecins.map(medecin => 
            `<option value="${medecin.id}">Dr. ${medecin.prenom} ${medecin.nom} - ${medecin.specialite}</option>`
        ).join('');
        
        let html = `
            <div class="new-message-form">
                <div class="section-header">
                    <h2 class="section-title">Nouveau message</h2>
                    <button class="btn btn-secondary" onclick="showMessagerieInterface()">
                        <i class="fas fa-arrow-left"></i> Retour
                    </button>
                </div>
                
                <form id="newMessageForm">
                    <div class="form-group">
                        <label for="recipientSelect">Destinataire</label>
                        <select id="recipientSelect" class="form-control" required>
                            <option value="">Sélectionnez un médecin</option>
                            ${options}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="messageContent">Message</label>
                        <textarea id="messageContent" class="form-control" rows="6" placeholder="Tapez votre message ici..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i> Envoyer le message
                    </button>
                </form>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;
        
        document.getElementById('newMessageForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const medecinId = document.getElementById('recipientSelect').value;
            const content = document.getElementById('messageContent').value;
            
            if (!medecinId || !content.trim()) {
                alert('Veuillez sélectionner un médecin et écrire un message');
                return;
            }
            
            await sendNewMessage(medecinId, content);
        });
    } catch (error) {
        console.error('Erreur formulaire message:', error);
        alert('Erreur lors du chargement des médecins');
    }
}

// Envoyer un nouveau message
async function sendNewMessage(medecinId, content) {
    try {
        const response = await fetch('/api/messagerie/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                medecin_id: parseInt(medecinId),
                contenu: content.trim()
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('Message envoyé avec succès !');
                showMessagerieInterface();
                await refreshNotifications();
            } else {
                alert('Erreur lors de l\'envoi du message');
            }
        } else {
            alert('Erreur lors de l\'envoi du message');
        }
    } catch (error) {
        console.error('Erreur envoi message:', error);
        alert('Erreur de connexion');
    }
}

// Envoyer un message dans une conversation
async function sendMessage(medecinId) {
    const content = document.getElementById('newMessageText').value;
    
    if (!content.trim()) {
        alert('Le message ne peut pas être vide');
        return;
    }
    
    try {
        const response = await fetch('/api/messagerie/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                medecin_id: parseInt(medecinId),
                contenu: content.trim()
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                document.getElementById('newMessageText').value = '';
                await loadConversation(medecinId);
                await refreshNotifications();
            }
        }
    } catch (error) {
        console.error('Erreur envoi message:', error);
        alert('Erreur lors de l\'envoi du message');
    }
}

// Afficher le formulaire de message à un médecin spécifique
async function showMessageToMedecin(medecinId) {
    try {
        const response = await fetch(`/api/medecins/${medecinId}`);
        const medecin = await response.json();
        
        let html = `
            <div class="message-to-medecin">
                <div class="section-header">
                    <h2 class="section-title">Contacter le médecin</h2>
                    <button class="btn btn-secondary" onclick="displaySection('medecins')">
                        <i class="fas fa-arrow-left"></i> Retour
                    </button>
                </div>
                
                <div class="medecin-info-card">
                    <div class="medecin-avatar">
                        <img src="${medecin.photo || 'https://ui-avatars.com/api/?name=Dr.' + encodeURIComponent(medecin.prenom + ' ' + medecin.nom) + '&background=0066cc&color=fff'}" alt="${medecin.prenom} ${medecin.nom}">
                    </div>
                    <div class="medecin-details">
                        <h3>Dr. ${medecin.prenom} ${medecin.nom}</h3>
                        <p><i class="fas fa-stethoscope"></i> ${medecin.specialite}</p>
                        <p><i class="fas fa-graduation-cap"></i> ${medecin.annees_experience} ans d'expérience</p>
                        <p><i class="fas fa-envelope"></i> ${medecin.email}</p>
                        <p><i class="fas fa-euro-sign"></i> ${medecin.prix_consultation}€</p>
                        <p><i class="fas fa-phone"></i> ${medecin.telephone || 'Non disponible'}</p>
                    </div>
                </div>
                
                <form id="medecinMessageForm">
                    <div class="form-group">
                        <label>Votre message</label>
                        <textarea id="medecinMessageContent" class="form-control" rows="6" placeholder="Tapez votre message ici..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i> Envoyer
                    </button>
                </form>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;
        
        document.getElementById('medecinMessageForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const content = document.getElementById('medecinMessageContent').value;
            
            if (!content.trim()) {
                alert('Le message ne peut pas être vide');
                return;
            }
            
            await sendNewMessage(medecinId, content);
        });
    } catch (error) {
        console.error('Erreur médecin détail:', error);
        alert('Erreur lors du chargement du médecin');
    }
}

// ============= INTERFACE DOCUMENTS - DESIGN PROFESSIONNEL =============

async function showDocumentsInterface() {
    try {
        const response = await fetch('/api/documents');
        const documents = await response.json();
        
        let html = `
            <div class="documents-interface">
                <div class="documents-header">
                    <div class="documents-title-section">
                        <h2 class="documents-title">Mes Documents</h2>
                        <p class="documents-subtitle">Accédez à tous vos documents médicaux</p>
                    </div>
                    <button class="btn btn-primary btn-icon" onclick="showUploadDocumentForm()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>Téléverser</span>
                    </button>
                </div>

                ${documents.length === 0 ? `
                    <div class="documents-empty">
                        <div class="empty-icon">
                            <i class="fas fa-file-medical"></i>
                        </div>
                        <h3>Aucun document</h3>
                        <p>Vos documents médicaux apparaîtront ici</p>
                        <button class="btn btn-primary" onclick="showUploadDocumentForm()" style="margin-top: 20px;">
                            <i class="fas fa-plus"></i> Téléverser votre premier document
                        </button>
                    </div>
                ` : `
                    <div class="documents-container">
                        <div class="documents-grid">
                            ${documents.map(doc => {
                                const date = new Date(doc.date_upload);
                                const dateFormatée = date.toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });

                                const typeIcons = {
                                    'application/pdf': { icon: 'fa-file-pdf', color: 'pdf', label: 'PDF' },
                                    'image/jpeg': { icon: 'fa-image', color: 'image', label: 'JPEG' },
                                    'image/png': { icon: 'fa-image', color: 'image', label: 'PNG' },
                                    'application/msword': { icon: 'fa-file-word', color: 'doc', label: 'Word' },
                                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: 'fa-file-word', color: 'doc', label: 'Word' }
                                };

                                const typeInfo = typeIcons[doc.type_document] || { icon: 'fa-file', color: 'default', label: 'Fichier' };

                                return `
                                    <div class="document-card">
                                        <div class="document-card-header ${typeInfo.color}">
                                            <div class="document-icon">
                                                <i class="fas ${typeInfo.icon}"></i>
                                            </div>
                                            <span class="document-type">${typeInfo.label}</span>
                                        </div>
                                        <div class="document-card-body">
                                            <h3 class="document-title">${doc.titre}</h3>
                                            <p class="document-description">${doc.description || 'Aucune description'}</p>
                                            <div class="document-meta">
                                                <span class="meta-item">
                                                    <i class="fas fa-calendar"></i>
                                                    ${dateFormatée}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="document-card-actions">
                                            <a href="${doc.fichier_url}" class="btn-action btn-view" title="Télécharger">
                                                <i class="fas fa-download"></i>
                                                <span>Télécharger</span>
                                            </a>
                                            <button class="btn-action btn-delete" onclick="supprimerDocument(${doc.id})" title="Supprimer">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `}
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;

    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('mainContent').innerHTML = `
            <div class="documents-empty">
                <div class="empty-icon error">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Erreur</h3>
                <p>Impossible de charger les documents</p>
            </div>
        `;
    }
}

 //============ FORMULAIRE DE TÉLÉVERSEMENT DE DOCUMENT =============
// Afficher le formulaire de téléversement
function showUploadDocumentForm() {
    let html = `
        <div class="upload-document-interface">
            <div class="upload-header">
                <button class="btn-back" onclick="showDocumentsInterface()">
                    <i class="fas fa-arrow-left"></i>
                    <span>Retour</span>
                </button>
                <h2>Téléverser un document</h2>
            </div>

            <form id="uploadForm" class="upload-form">
                <div class="upload-zone" id="uploadZone">
                    <div class="upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <h3>Glissez votre document ici</h3>
                    <p>ou cliquez pour parcourir</p>
                    <input type="file" id="documentFile" class="upload-input" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" required>
                </div>

                <div class="upload-form-fields">
                    <div class="form-group">
                        <label for="documentTitle">Titre du document *</label>
                        <input type="text" id="documentTitle" class="form-control" placeholder="Ex: Compte rendu consultation" required>
                    </div>

                    <div class="form-group">
                        <label for="documentDescription">Description (optionnel)</label>
                        <textarea id="documentDescription" class="form-control" placeholder="Décrivez brièvement ce document..." rows="3"></textarea>
                    </div>

                    <div class="upload-info">
                        <i class="fas fa-info-circle"></i>
                        <span>Formats acceptés: PDF, JPG, PNG, DOC, DOCX (max 10MB)</span>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="fas fa-upload"></i> Téléverser le document
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="showDocumentsInterface()">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                    </div>
                </div>
            </form>
        </div>
    `;

    document.getElementById('mainContent').innerHTML = html;

    // Drag and drop
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('documentFile');

    uploadZone.addEventListener('click', () => fileInput.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        fileInput.files = e.dataTransfer.files;
    });

    document.getElementById('uploadForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('titre', document.getElementById('documentTitle').value);
        formData.append('description', document.getElementById('documentDescription').value);
        formData.append('file', document.getElementById('documentFile').files[0]);

        try {
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    alert('✅ Document téléversé avec succès!');
                    showDocumentsInterface();
                } else {
                    alert('Erreur: ' + result.detail);
                }
            } else {
                alert('Erreur lors du téléversement');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion');
        }
    });
}

async function supprimerDocument(docId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document?')) {
        return;
    }

    try {
        const response = await fetch(`/api/documents/${docId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('✅ Document supprimé');
            showDocumentsInterface();
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// ============= INTERFACE PARAMÈTRES =============

// Afficher l'interface des paramètres
async function showParametresInterface() {
    try {
        const response = await fetch('/api/patient/full-info');
        const patient = await response.json();
        
        let html = `
            <div class="parametres-interface">
                <div class="section-header">
                    <h2 class="section-title">Paramètres</h2>
                </div>
                
                <form id="parametresForm" class="parametres-form">
                    <div class="form-section">
                        <h3><i class="fas fa-user-circle"></i> Informations Personnelles</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="paramNom">Nom</label>
                                <input type="text" id="paramNom" class="form-control" value="${patient.nom || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="paramPrenom">Prénom</label>
                                <input type="text" id="paramPrenom" class="form-control" value="${patient.prenom || ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="paramDateNaissance">Date de naissance</label>
                                <input type="date" id="paramDateNaissance" class="form-control" value="${patient.date_naissance || ''}">
                            </div>
                            <div class="form-group">
                                <label for="paramTelephone">Téléphone</label>
                                <input type="tel" id="paramTelephone" class="form-control" value="${patient.telephone || ''}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="paramEmail">Email</label>
                            <input type="email" id="paramEmail" class="form-control" value="${patient.email || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="paramAdresse">Adresse</label>
                            <textarea id="paramAdresse" class="form-control" rows="3">${patient.adresse || ''}</textarea>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3><i class="fas fa-heart"></i> Informations Médicales</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="paramGroupeSanguin">Groupe sanguin</label>
                                <select id="paramGroupeSanguin" class="form-control">
                                    <option value="">Sélectionnez</option>
                                    <option value="A+" ${patient.groupe_sanguin === 'A+' ? 'selected' : ''}>A+</option>
                                    <option value="A-" ${patient.groupe_sanguin === 'A-' ? 'selected' : ''}>A-</option>
                                    <option value="B+" ${patient.groupe_sanguin === 'B+' ? 'selected' : ''}>B+</option>
                                    <option value="B-" ${patient.groupe_sanguin === 'B-' ? 'selected' : ''}>B-</option>
                                    <option value="AB+" ${patient.groupe_sanguin === 'AB+' ? 'selected' : ''}>AB+</option>
                                    <option value="AB-" ${patient.groupe_sanguin === 'AB-' ? 'selected' : ''}>AB-</option>
                                    <option value="O+" ${patient.groupe_sanguin === 'O+' ? 'selected' : ''}>O+</option>
                                    <option value="O-" ${patient.groupe_sanguin === 'O-' ? 'selected' : ''}>O-</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="paramAllergies">Allergies</label>
                            <textarea id="paramAllergies" class="form-control" rows="3" placeholder="Pénicilline, Pollen...">${patient.allergies || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="paramAntecedents">Antécédents médicaux</label>
                            <textarea id="paramAntecedents" class="form-control" rows="3">${patient.antecedents_medicaux || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="paramTraitements">Traitements en cours</label>
                            <textarea id="paramTraitements" class="form-control" rows="3">${patient.traitements_en_cours || ''}</textarea>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3><i class="fas fa-lock"></i> Sécurité</h3>
                        <div class="form-group">
                            <label for="paramMotDePasse">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
                            <input type="password" id="paramMotDePasse" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="paramConfirmationMotDePasse">Confirmer le nouveau mot de passe</label>
                            <input type="password" id="paramConfirmationMotDePasse" class="form-control">
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Enregistrer les modifications
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="displaySection('dashboard')">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;
        
        document.getElementById('parametresForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            await savePatientInfos();
        });
    } catch (error) {
        console.error('Erreur paramètres:', error);
        alert('Erreur lors du chargement des paramètres');
    }
}

// Sauvegarder les informations du patient
async function savePatientInfos() {
    try {
        const formData = {
            nom: document.getElementById('paramNom').value,
            prenom: document.getElementById('paramPrenom').value,
            date_naissance: document.getElementById('paramDateNaissance').value,
            telephone: document.getElementById('paramTelephone').value,
            email: document.getElementById('paramEmail').value,
            adresse: document.getElementById('paramAdresse').value,
            groupe_sanguin: document.getElementById('paramGroupeSanguin').value,
            allergies: document.getElementById('paramAllergies').value,
            antecedents_medicaux: document.getElementById('paramAntecedents').value,
            traitements_en_cours: document.getElementById('paramTraitements').value
        };
        
        const motDePasse = document.getElementById('paramMotDePasse').value;
        const confirmation = document.getElementById('paramConfirmationMotDePasse').value;
        
        if (motDePasse) {
            if (motDePasse !== confirmation) {
                alert('Les mots de passe ne correspondent pas');
                return;
            }
            formData.mot_de_passe = motDePasse;
        }
        
        const response = await fetch('/api/patient/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                alert('Informations mises à jour avec succès !');
                // Mettre à jour le nom dans la barre de navigation
                await loadPatientData();
                displaySection('dashboard');
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } else {
            alert('Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error('Erreur sauvegarde:', error);
        alert('Erreur lors de la sauvegarde');
    }
}


// ============= CHAT IA =============

async function showChatIAInterface() {
    let html = `
        <div class="chat-ia-container">
            <!-- En-tête du chat -->
            <div class="chat-ia-header">
                <div class="chat-header-left">
                    <div class="chat-ia-avatar">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="chat-header-info">
                        <h2>Assistant IA Santé</h2>
                        <p class="chat-status">En ligne • Toujours disponible</p>
                    </div>
                </div>
                <button class="chat-close-btn" onclick="displaySection('dashboard')">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <!-- Bannière info -->
            <div class="chat-info-box">
                <div class="info-icon">
                    <i class="fas fa-shield-alt"></i>
                </div>
                <div class="info-content">
                    <p><strong>Informations générales</strong></p>
                    <p>Cet assistant fournit des conseils généraux uniquement. Pour un diagnostic médical, consultez un professionnel.</p>
                </div>
            </div>

            <!-- Zone des messages -->
            <div class="chat-ia-messages" id="chatMessages">
                <div class="message-group ia-message-group">
                    <div class="message-avatar-ia">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="chat-bubble ia-bubble">
                        <p>Bonjour 👋 Je suis votre assistant IA santé. Je suis disponible 24/7 pour répondre à vos questions générales sur la santé.</p>
                        <p style="margin-top: 10px; font-size: 0.85rem; opacity: 0.8;">Posez-moi vos questions et je vous aiderai du mieux possible.</p>
                    </div>
                </div>
            </div>

            <!-- Zone d'entrée -->
            <div class="chat-ia-input-area">
                <form id="chatForm" class="chat-input-form">
                    <div class="input-wrapper">
                        <textarea 
                            id="chatInput" 
                            class="chat-textarea" 
                            placeholder="Posez votre question..." 
                            rows="1"
                            required></textarea>
                        <button type="submit" class="chat-send-btn" title="Envoyer">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <p class="input-hint">Appuyez sur Maj+Entrée pour une nouvelle ligne</p>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = html;
    
    // Initialiser les événements
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });
    
    // Soumission du formulaire
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await sendChatMessage();
    });
    
    // Shift+Enter pour nouvelle ligne
    chatInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            this.value += '\n';
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });
}

// Envoyer un message au chat IA
async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesDiv = document.getElementById('chatMessages');
    
    // Ajouter le message de l'utilisateur
    const userMessageHTML = `
        <div class="message-group user-message-group">
            <div class="chat-bubble user-bubble">
                <p>${escapeHtml(message)}</p>
            </div>
        </div>
    `;
    messagesDiv.innerHTML += userMessageHTML;
    input.value = '';
    input.style.height = 'auto';
    scrollChatToBottom();
    
    try {
        // Afficher l'indicateur de frappe
        const typingHTML = `
            <div class="message-group ia-message-group" id="typing-indicator">
                <div class="message-avatar-ia">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="chat-bubble ia-bubble typing-bubble">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        messagesDiv.innerHTML += typingHTML;
        scrollChatToBottom();
        
        // Appeler l'API
        const response = await fetch('/api/chat-ia/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        if (!response.ok) {
            throw new Error('Erreur serveur');
        }
        
        const data = await response.json();
        
        // Supprimer l'indicateur de frappe
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
        
        // Ajouter la réponse de l'IA
        const iaMessageHTML = `
            <div class="message-group ia-message-group">
                <div class="message-avatar-ia">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="chat-bubble ia-bubble">
                    <p>${escapeHtml(data.ia_response)}</p>
                    <small class="message-time">${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
            </div>
        `;
        messagesDiv.innerHTML += iaMessageHTML;
        scrollChatToBottom();
        
    } catch (error) {
        console.error('Erreur chat IA:', error);
        
        const errorHTML = `
            <div class="message-group ia-message-group">
                <div class="message-avatar-ia">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="chat-bubble ia-bubble error-bubble">
                    <p>Désolé, une erreur est survenue. Veuillez réessayer.</p>
                </div>
            </div>
        `;
        messagesDiv.innerHTML += errorHTML;
        scrollChatToBottom();
    }
}

// Scroller le chat vers le bas
function scrollChatToBottom() {
    const messagesDiv = document.getElementById('chatMessages');
    if (messagesDiv) {
        setTimeout(() => {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }, 0);
    }
}

// Échapper le HTML pour la sécurité
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ============= FONCTIONS UTILITAIRES =============

// Rafraîchir les notifications
async function refreshNotifications() {
    try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
            const data = await response.json();
            updateNotificationBadge(data.unread_messages || 0);
        }
    } catch (error) {
        console.error('Erreur notifications:', error);
    }
}

// Scroller vers le bas
function scrollToBottom() {
    const container = document.querySelector('.messages-list');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

// ============= FONCTIONS ORIGINALES (NON MODIFIÉES) =============

// Fonction pour rendre les statistiques
function renderStats(stats) {
    return `
        <div class="stats-grid">
            ${stats.map(stat => `
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon ${stat.color}">
                            <i class="fas ${stat.icon}"></i>
                        </div>
                        ${stat.change ? `
                            <span class="stat-change ${stat.change.type}">
                                <i class="fas fa-arrow-${stat.change.type === 'positive' ? 'up' : 'down'}"></i>
                                ${stat.change.text}
                            </span>
                        ` : ''}
                    </div>
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Fonction pour rendre les cartes de contenu
function renderCards(cards) {
    if (!cards || cards.length === 0) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-inbox"></i>
                </div>
                <div class="empty-state-title">Aucun élément disponible</div>
                <div class="empty-state-text">Il n'y a pas encore de contenu dans cette section</div>
            </div>
        `;
    }

    return `
        <div class="cards-grid">
            ${cards.map((card, index) => `
                <div class="content-card animate-in" style="animation-delay: ${index * 0.1}s" ${card.onclick ? `onclick="${card.onclick}" style="cursor:pointer;"` : ''}>
                    <div class="card-header">
                        <div class="card-icon-wrapper ${card.color}">
                            <i class="fas ${card.icon}"></i>
                        </div>
                        <div class="card-content">
                            <h3 class="card-title">${card.title}</h3>
                            <p class="card-subtitle">${card.subtitle}</p>
                        </div>
                    </div>
                    <p class="card-description">${card.description}</p>
                    ${card.meta && card.meta.length > 0 ? `
                        <div class="card-meta">
                            ${card.meta.map(meta => `
                                <div class="meta-item">
                                    <i class="fas ${meta.icon}"></i>
                                    <span>${meta.text}</span>
                                </div>
                            `).join('')}
                            ${card.badge ? `
                                <span class="card-badge badge-${card.badge.type}">${card.badge.text}</span>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Fonction pour afficher le contenu d'une section
async function displaySection(sectionName) {
    const mainContent = document.getElementById('mainContent');
    
    // Gérer les sections spéciales qui nécessitent un rechargement API spécifique
    if (sectionName === 'messagerie') {
        await loadMessagerieStats();
        showMessagerieInterface();
        return;
    }
    
    if (sectionName === 'documents') {
        await loadDocumentsList();
        showDocumentsInterface();
        return;
    }
    
    if (sectionName === 'medecins') {
        await loadMedecinsList();
        // Continuer avec l'affichage normal
    }
    
    if (sectionName === 'parametres') {
        showParametresInterface();
        return;
    }
    
    if (sectionName === 'ordonnances') {
        await loadOrdonnancesList();
        // Continuer avec l'affichage normal
    }

    if (sectionName === 'rendez-vous') {
        showRendezVousInterface();
        return;
    }

    if (sectionName === 'chat-ia') {
        showChatIAInterface();
        return;
    }

    // CORRECTION ICI : On ne recharge PAS les données si elles sont déjà en mémoire (pour le dashboard par ex)
    // On utilise simplement ce qui a été chargé au démarrage.
    
    const data = sectionsData[sectionName];
    let html = '';

    // Bannière de bienvenue pour le dashboard
    if (sectionName === 'dashboard') {
        const patientName = document.querySelector('.profile-name')?.textContent || 'Patient';
        html += `
            <div class="dashboard-header">
                <div class="welcome-banner">
                    <div class="welcome-content">
                        <h1>Bonjour, ${patientName} 👋</h1>
                        <p>Bienvenue sur votre espace santé personnel. Gérez vos rendez-vous, consultez vos documents médicaux et suivez votre santé en toute simplicité.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Statistiques (uniquement pour le dashboard)
    if (data && data.stats) {
        html += renderStats(data.stats);
    }

    // Section des cartes
    if (sectionName === 'dashboard') {
        html += `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Activité Récente</h2>
                    <a href="#" class="view-all-btn">
                        Tout voir
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
                ${renderCards(data?.cards)}
            </div>
        `;
    } else {
        html += `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">${getSectionTitle(sectionName)}</h2>
                </div>
                ${renderCards(data?.cards)}
            </div>
        `;
    }

    mainContent.innerHTML = html;
}

// Fonction pour obtenir le titre de la section
function getSectionTitle(sectionName) {
    const titles = {
        'dashboard': 'Tableau de Bord',
        'profil': 'Mon Profil',
        'dossier': 'Dossier Médical',
        'rendez-vous': 'Mes Rendez-vous',
        'messagerie': 'Messagerie',
        'ordonnances': 'Mes Ordonnances', 
        'documents': 'Mes Documents',
        'analyses': 'Analyses & Résultats',
        'medecins': 'Médecins',
        'injections': 'Injections',
        'parametres': 'Paramètres'
    };
    return titles[sectionName] || sectionName;
}

// Gestion de la navigation
document.querySelectorAll('.nav-link-custom').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const section = this.getAttribute('data-section');
        
        // Mettre à jour l'état actif
        document.querySelectorAll('.nav-link-custom').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        // Afficher le contenu
        if (section) {
            displaySection(section);
        }
    });
});

// Gestion de l'upload de photo de profil (CORRIGÉ AVEC CACHE BUSTER)
const photoInput = document.getElementById('profilePhotoInput');
if (photoInput) {
    photoInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/patient/upload-photo", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (data.photo_url) {
                // Cache buster pour forcer le rechargement de l'image
                document.getElementById('profileAvatar').src = data.photo_url + "?t=" + new Date().getTime();
                alert('Photo de profil mise à jour avec succès !');
            }
        } catch (error) {
            console.error('Erreur upload photo:', error);
            alert('Erreur lors de l\'upload de la photo');
        }
    });
}

// Fonction pour changer la langue
function changelanguage(lang) {
    console.log('Changement de langue vers:', lang);
    // Ici vous pouvez ajouter la logique pour changer la langue
}

// ============= GESTION DE LA DÉCONNEXION =============
const logoutLink = document.querySelector('a[href="/deconnexion"]');
if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        const confirmed = confirm(
            'Êtes-vous sûr de vouloir vous déconnecter ?\n\n' +
            'Votre session sera fermée et vous serez redirigé vers la page de connexion.'
        );
        
        if (confirmed) {
            const originalHTML = logoutLink.innerHTML;
            logoutLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Déconnexion...';
            logoutLink.style.pointerEvents = 'none';
            
            setTimeout(() => {
                window.location.href = '/deconnexion';
            }, 1000);
        }
    });
}

// ============= INITIALISATION =============

// Charger les données au démarrage
document.addEventListener('DOMContentLoaded', async function() {
    // 1. CHARGEMENT PARALLÈLE OPTIMISÉ (Promise.all)
    await Promise.all([
        loadPatientData(),
        loadDashboardStats(),
        loadMessagerieStats(),
        loadDocumentsList(),
        loadOrdonnancesList()
    ]);
    
    // 2. Rafraîchir périodiquement (uniquement les notifications légères)
    setInterval(async () => {
        await refreshNotifications();
        // On évite de recharger lourdement (messagerie stats) toutes les 30s si l'utilisateur ne bouge pas
        // await loadMessagerieStats(); 
    }, 30000);
    
    // 3. Afficher le dashboard
    // Les données sont déjà prêtes grâce au Promise.all ci-dessus.
    displaySection('dashboard');
});

// Fonction chargement médecins (laissée globale si appelée ailleurs)
function loadMedecinsSection() {
    const container = document.getElementById("mainContent");

    container.innerHTML = `
        <h2 class="section-title">Médecins</h2>
        <div id="medecinsList" class="medecins-list"></div>
    `;

    fetch("/api/medecins")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("medecinsList");

            if (!data.length) {
                list.innerHTML = "<p>Aucun médecin disponible</p>";
                return;
            }

            list.innerHTML = data.map(m => `
                <div class="medecin-card">
                    <img src="${m.photo_url || 'https://ui-avatars.com/api/?name=' + m.nom + '&background=0066cc&color=fff'}" />
                    <div class="medecin-info">
                        <h5>${m.prenom} ${m.nom}</h5>
                        <p>Spécialité : ${m.specialite || '—'}</p>
                        <p>Expérience : ${m.annees_experience || 0} ans</p>
                    </div>
                </div>
            `).join("");
        })
        .catch(err => console.error("Erreur chargement médecins:", err));
}



// ============= GESTION DES RENDEZ-VOUS =============

async function showRendezVousInterface() {
    try {
        //document.head.innerHTML += '<link rel="stylesheet" href="/static/css/EspaceClient.css?v=' + Date.now() + '">';
        const response = await fetch('/api/medecins');
        const medecins = await response.json();
        
        let html = `
            
            <div class="rendez-vous-interface">
                <div class="section-header">
                    <h2 class="section-title">Prendre un Rendez-vous</h2>
                </div>

                <div class="rdv-tabs">
                    <button class="tab-btn active" data-tab="prise-rdv">
                        <i class="fas fa-calendar-plus"></i> Nouveau RDV
                    </button>
                    <button class="tab-btn" data-tab="mes-rdv">
                        <i class="fas fa-list"></i> Mes Rendez-vous
                    </button>
                </div>

                <!-- TAB 1: Prise de RDV -->
                <div id="prise-rdv" class="tab-content active">
                    <form id="rdvForm" class="rdv-form">
                        <!-- Sélection du médecin -->
                        <div class="form-section">
                            <h3>Étape 1: Choisir un médecin</h3>
                            <div class="medecins-grid">
                                ${medecins.map(m => `
                                    <div class="medecin-card-selectable">
                                        <input type="radio" name="medecin_id" value="${m.id}" id="med_${m.id}" required>
                                        <label for="med_${m.id}" class="medecin-label">
                                            <div class="medecin-avatar">
                                                <i class="fas fa-user-md"></i>
                                            </div>
                                            <div class="medecin-details">
                                                <strong>Dr. ${m.prenom} ${m.nom}</strong>
                                                <p>${m.specialite}</p>
                                                <span class="exp-badge">${m.annees_experience}ans exp.</span>
                                            </div>
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Type de consultation -->
                        <div class="form-section">
                            <h3>Étape 2: Type de consultation</h3>
                            <div class="consultation-types">
                                <div class="type-option">
                                    <input type="radio" id="cabinet" name="type_consultation" value="Cabinet" checked>
                                    <label for="cabinet">
                                        <i class="fas fa-hospital"></i>
                                        <span>En Cabinet</span>
                                        <p>Consultation au cabinet du médecin</p>
                                    </label>
                                </div>

                                <div class="type-option">
                                    <input type="radio" id="video" name="type_consultation" value="Vidéo">
                                    <label for="video">
                                        <i class="fas fa-video"></i>
                                        <span>En Ligne (Vidéo)</span>
                                        <p>Consultation par appel vidéo</p>
                                    </label>
                                </div>

                                <div class="type-option">
                                    <input type="radio" id="domicile" name="type_consultation" value="Domicile">
                                    <label for="domicile">
                                        <i class="fas fa-home"></i>
                                        <span>À Domicile</span>
                                        <p>Visite à votre domicile</p>
                                    </label>
                                </div>
                            </div>

                            <!-- Lieu (si domicile) -->
                            <div id="lieu-container" style="display: none;">
                                <label for="lieu">Adresse du rendez-vous</label>
                                <input type="text" id="lieu" name="lieu" placeholder="Votre adresse complète" class="form-control">
                            </div>
                        </div>

                        <!-- Date et heure -->
                        <div class="form-section">
                            <h3>Étape 3: Date et heure</h3>
                            <div class="form-group">
                                <label for="date_heure">Date et heure du rendez-vous</label>
                                <input type="datetime-local" id="date_heure" name="date_heure" class="form-control" required>
                            </div>
                        </div>

                        <!-- Motif -->
                        <div class="form-section">
                            <h3>Étape 4: Motif de la visite</h3>
                            <div class="form-group">
                                <label for="motif">Décrivez brièvement le motif</label>
                                <textarea id="motif" name="motif" class="form-control" rows="4" placeholder="Exemple: Consultation générale, suivi tension, etc." required></textarea>
                            </div>
                        </div>

                        <!-- Bouton soumettre -->
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary btn-lg">
                                <i class="fas fa-check"></i> Confirmer le rendez-vous
                            </button>
                        </div>
                    </form>
                </div>

                <!-- TAB 2: Mes rendez-vous -->
                <div id="mes-rdv" class="tab-content">
                    <div id="rdv-list-container"></div>
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;

        // Gestion des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                
                this.classList.add('active');
                document.getElementById(tabName).classList.add('active');
                
                if (tabName === 'mes-rdv') {
                    loadMesRendezVous();
                }
            });
        });

        // Afficher/Masquer le champ lieu
        document.querySelectorAll('input[name="type_consultation"]').forEach(input => {
            input.addEventListener('change', function() {
                const lieuContainer = document.getElementById('lieu-container');
                const lieuInput = document.getElementById('lieu');
                
                if (this.value === 'Domicile') {
                    lieuContainer.style.display = 'block';
                    lieuInput.required = true;
                } else {
                    lieuContainer.style.display = 'none';
                    lieuInput.required = false;
                    lieuInput.value = '';
                }
            });
        });

        // Soumission du formulaire
        document.getElementById('rdvForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            await creerRendezVous();
        });

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement');
    }
}


async function creerRendezVous() {
    const form = document.getElementById('rdvForm');
    const formData = new FormData(form);
    
    const medecin_id = formData.get('medecin_id');
    const type_consultation = formData.get('type_consultation');
    const date_heure = document.getElementById('date_heure').value;
    const motif = formData.get('motif');
    const lieu = formData.get('lieu') || null;

    // Vérifier que tous les champs obligatoires sont remplis
    if (!medecin_id || !date_heure || !motif) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    // Récupérer la spécialité du médecin sélectionné
    const medecin = medecins.find(m => m.id == medecin_id);
    const specialite = medecin ? medecin.specialite : null;

    try {
        const response = await fetch('/api/rendez-vous/creer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                medecin_id: parseInt(medecin_id),
                date_heure: date_heure,
                motif: motif,
                type_consultation: type_consultation,
                lieu: lieu,
                specialite: specialite  // ✅ syntaxe correcte
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert('Erreur: ' + error.detail);
            return;
        }

        const result = await response.json();
        if (result.success) {
            alert('✅ Rendez-vous créé avec succès!');
            form.reset();
            loadMesRendezVous();

            // Afficher l'onglet mes rdv
            document.querySelector('[data-tab="mes-rdv"]').click();
        }

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création du rendez-vous');
    }
}

async function loadMesRendezVous() {
    try {
        const response = await fetch('/api/rendez-vous');
        const rdvs = await response.json();

        let html = '';

        if (rdvs.length === 0) {
            html = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>Aucun rendez-vous programmé</p>
                </div>
            `;
        } else {
            html = `<div class="rdv-cards">`;
            
            rdvs.forEach(rdv => {
                const date = new Date(rdv.date_heure);
                const dateFormatée = date.toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const typeIcon = {
                    'Cabinet': '🏥',
                    'Vidéo': '📱',
                    'Domicile': '🏠'
                }[rdv.type_consultation] || '📅';

                html += `
                    <div class="rdv-card">
                        <div class="rdv-header">
                            <h3>${dateFormatée}</h3>
                            <span class="rdv-status ${rdv.statut.toLowerCase()}">${rdv.statut}</span>
                        </div>
                        <div class="rdv-body">
                            <p><strong>Motif:</strong> ${rdv.motif}</p>
                            <p><strong>Type:</strong> ${typeIcon} ${rdv.type_consultation}</p>
                            ${rdv.lieu ? `<p><strong>Lieu:</strong> ${rdv.lieu}</p>` : ''}
                        </div>
                        <div class="rdv-actions">
                            <button class="btn btn-sm btn-secondary" onclick="modifierRendezVous(${rdv.id})">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="supprimerRendezVous(${rdv.id})">
                                <i class="fas fa-trash"></i> Annuler
                            </button>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        }

        document.getElementById('rdv-list-container').innerHTML = html;

    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function supprimerRendezVous(rdvId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous?')) {
        return;
    }

    try {
        const response = await fetch(`/api/rendez-vous/${rdvId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('✅ Rendez-vous annulé');
            loadMesRendezVous();
        }

    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Mesure le temps de chaque appel API au chargement
async function timedFetch(url, opts) {
    const start = performance.now();
    const response = await fetch(url, opts);
    const end = performance.now();
    console.log(`[API] ${url} : ${(end - start).toFixed(1)} ms`);
    return response;
}
