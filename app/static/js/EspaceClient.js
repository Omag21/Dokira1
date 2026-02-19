

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
         title: 'Dossier Médical',
        icon: 'fa-file-medical',
        stats: [
            { label: 'Allergies', value: '0' },
            { label: 'Antécédents', value: '0' },
            { label: 'Traitements', value: '0' }
        ],
        cards: [
             {
                id: 'medical-allergies',
                icon: 'fa-allergies',
                color: 'red',
                title: 'Allergies',
                subtitle: 'À compléter',
                description: 'Liste de vos allergies connues',
                meta: [],
                badge: { type: 'danger', text: 'Important' },
                onclick: 'showMedicalInfo(\'allergies\')'
            },
            {
                id: 'medical-history',
                icon: 'fa-history',
                color: 'orange',
                title: 'Antécédents',
                subtitle: 'À compléter',
                description: 'Antécédents médicaux et familiaux',
                meta: [],
                badge: { type: 'warning', text: 'À surveiller' },
                onclick: 'showMedicalInfo(\'antecedents\')'
            },
            {
                id: 'medical-treatments',
                icon: 'fa-prescription-bottle',
                color: 'blue',
                title: 'Traitements',
                subtitle: 'À compléter',
                description: 'Traitements en cours et suivis',
                meta: [],
                badge: { type: 'info', text: 'En cours' },
                onclick: 'showMedicalInfo(\'treatments\')'
            },
            {
                id: 'medical-blood',
                icon: 'fa-tint',
                color: 'dark-red',
                title: 'Groupe Sanguin',
                subtitle: 'À renseigner',
                description: 'Groupe sanguin et rhésus',
                meta: [],
                badge: { type: 'danger', text: 'Urgence' },
                onclick: 'showMedicalInfo(\'blood\')'
            },
            {
                id: 'medical-insurance',
                icon: 'fa-shield-alt',
                color: 'green',
                title: 'Couverture Santé',
                subtitle: 'Non renseigné',
                description: 'Mutuelle et assurance',
                meta: [],
                badge: { type: 'success', text: 'Assuré' },
                onclick: 'showMedicalInfo(\'insurance\')'
            },
            {
                id: 'medical-doctor',
                icon: 'fa-user-md',
                color: 'purple',
                title: 'Médecin Traitant',
                subtitle: 'Non renseigné',
                description: 'Votre médecin référent',
                meta: [],
                badge: { type: 'primary', text: 'Contact' },
                onclick: 'showMedicalInfo(\'doctor\')'
            },
            {
            id: 'medical-doctor',
            icon: 'fa-user-md',
            color: 'purple',
            title: 'Médecin Traitant',
            subtitle: 'Non renseigné',
            description: 'Votre médecin référent',
            meta: [],
            badge: { type: 'primary', text: 'Contact' },
            onclick: 'showMedicalInfo(\'doctor\')'
            },
            {
            id: 'medical-ordonnances',
            icon: 'fa-prescription-bottle',
            color: 'blue',
            title: 'Ordonnances',
            subtitle: 'Aucune',
            description: 'Prescriptions médicales en cours',
            meta: [],
            badge: { type: 'info', text: 'À vérifier' },
            onclick: 'showMedicalInfo(\'ordonnances\')'
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
let dossierMedicalCache = null;
let ordonnancesCache = [];
let patientSession = {
    id: null,
    nomComplet: 'Patient'
};
let activeConversationMedecin = null;
let activeConversationMedecinId = null;
let patientPresencePoller = null;


// ============= FONCTIONS POUR CHARGER LES DONNÉES DYNAMIQUES =============

// Charger les données du patient
async function loadPatientData() {
    try {   
        const response = await timedFetch('/api/patient/info');
        if (response.ok) {
            const data = await response.json();
            patientSession.id = data.id || null;
            patientSession.nomComplet = data.nom_complet || `${data.prenom || ''} ${data.nom || ''}`.trim() || 'Patient';
            
            // Mettre à jour le nom dans la barre de navigation
            const profileName = document.querySelector('.profile-name');
            if (profileName) {
                profileName.textContent = data.nom_complet || 'Patient';
            }
            
            // Mettre à jour l'avatar si disponible (AVEC CACHE BUSTER)
            if (data.photo_profil_url) {
                const avatar = document.getElementById('profileAvatar');
                if (avatar) {
                    const timestamp = new Date().getTime();
                    avatar.src = data.photo_profil_url + "?v=" + timestamp;
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
            ordonnancesCache = Array.isArray(ordonnances) ? ordonnances : [];
            updateOrdonnancesCards(ordonnancesCache);
            return ordonnances;
        }
    } catch (error) {
        console.error('Erreur chargement ordonnances:', error);
    }
    ordonnancesCache = [];
    updateOrdonnancesCards(ordonnancesCache);
    return [];
}


function formatOrdonnanceDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR');
}

function normalizeOrdonnanceStatus(statut) {
    return String(statut || '').toLowerCase();
}

function isOrdonnanceActive(ordonnance) {
    const status = normalizeOrdonnanceStatus(ordonnance?.statut);
    return status === 'active' || status === 'actif';
}

function truncateOrdonnanceText(text, max = 70) {
    const value = String(text || '').replace(/\s+/g, ' ').trim();
    if (!value) return 'N/A';
    return value.length > max ? `${value.slice(0, max)}...` : value;
}

function updateOrdonnancesCards(ordonnances) {
    const cards = sectionsData.ordonnances.cards;
    if (!cards || cards.length < 3) return;

    const latest = ordonnances.length > 0 ? ordonnances[0] : null;
    const activeOrdonnances = ordonnances.filter(isOrdonnanceActive);
    const archivedOrdonnances = ordonnances.filter(ord => !isOrdonnanceActive(ord));

    const firstCard = cards[0];
    if (latest) {
        firstCard.subtitle = `Prescription du ${formatOrdonnanceDate(latest.date_emission)}`;
        firstCard.description = `Medicaments: ${truncateOrdonnanceText(latest.medicaments, 90)}`;
        firstCard.meta = [
            { icon: 'fa-user-md', text: latest.medecin_nom || 'Medecin non renseigne' },
            { icon: 'fa-notes-medical', text: `Posologie: ${truncateOrdonnanceText(latest.posologie, 70)}` },
            { icon: 'fa-clock', text: `Duree: ${latest.duree_traitement || 'N/A'}` }
        ];
        firstCard.badge = {
            type: isOrdonnanceActive(latest) ? 'success' : 'warning',
            text: latest.pdf_disponible ? 'Telecharger PDF' : (latest.statut || 'Prescription')
        };
        firstCard.onclick = latest.pdf_disponible
            ? `downloadPatientOrdonnancePdf(${latest.id})`
            : '';
    } else {
        firstCard.subtitle = 'Aucune ordonnance active';
        firstCard.description = 'Consultez vos ordonnances actives';
        firstCard.meta = [{ icon: 'fa-pills', text: 'Aucune prescription disponible' }];
        firstCard.badge = { type: 'info', text: 'Verifier' };
        firstCard.onclick = '';
    }

    const secondCard = cards[1];
    secondCard.subtitle = `${ordonnances.length} ordonnance(s) au total`;
    secondCard.description = 'Historique complet de toutes vos prescriptions';
    secondCard.meta = [
        { icon: 'fa-folder-open', text: `${archivedOrdonnances.length} archivees` },
        { icon: 'fa-check-circle', text: `${activeOrdonnances.length} active(s)` }
    ];
    secondCard.badge = { type: 'primary', text: `${ordonnances.length} fichier(s)` };
    secondCard.onclick = ordonnances.length > 0 ? 'showOrdonnancesHistoriqueModal()' : '';

    const thirdCard = cards[2];
    const rappelsParJour = activeOrdonnances.length;
    thirdCard.subtitle = activeOrdonnances.length > 0
        ? `${activeOrdonnances.length} traitement(s) quotidien(s)`
        : 'Aucun traitement actif';
    thirdCard.description = 'Recevez des rappels pour la prise de vos medicaments';
    thirdCard.meta = [
        { icon: 'fa-clock', text: `${rappelsParJour} rappel(s)/jour` },
        { icon: 'fa-calendar-day', text: activeOrdonnances.length > 0 ? 'Rappel quotidien actif' : 'A activer' }
    ];
    thirdCard.badge = {
        type: activeOrdonnances.length > 0 ? 'success' : 'info',
        text: activeOrdonnances.length > 0 ? 'Actif' : 'A activer'
    };
    thirdCard.onclick = '';
}

function downloadPatientOrdonnancePdf(ordonnanceId) {
    const link = document.createElement('a');
    link.href = `/api/ordonnances/telecharger/${ordonnanceId}`;
    link.download = `ordonnance_${ordonnanceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showOrdonnancesHistoriqueModal() {
    if (!ordonnancesCache || ordonnancesCache.length === 0) {
        alert('Aucune ordonnance disponible');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'medical-modal';

    let content = '<div style="max-height: 420px; overflow-y: auto;">';
    ordonnancesCache.forEach((ord, index) => {
        content += `
            <div style="margin-bottom: 14px; padding: 12px; background: #f9f9f9; border-left: 4px solid #0d8abc; border-radius: 6px;">
                <p style="margin: 0 0 8px 0;"><strong>Ordonnance ${index + 1}</strong></p>
                <p style="margin: 4px 0; font-size: 13px;">Date: ${formatOrdonnanceDate(ord.date_emission)}</p>
                <p style="margin: 4px 0; font-size: 13px;">Medecin: ${escapeHtml(ord.medecin_nom || 'Medecin')}</p>
                <p style="margin: 4px 0; font-size: 13px;">Medicaments: ${escapeHtml(ord.medicaments || 'N/A')}</p>
                <p style="margin: 4px 0; font-size: 13px;">Posologie: ${escapeHtml(ord.posologie || 'N/A')}</p>
                <p style="margin: 4px 0; font-size: 13px;">Duree: ${escapeHtml(ord.duree_traitement || 'N/A')}</p>
                <p style="margin: 6px 0 0 0;">
                    <span style="background: #e3f2fd; padding: 3px 8px; border-radius: 12px; color: #0d8abc; font-size: 12px;">
                        ${escapeHtml(ord.statut || 'Active')}
                    </span>
                </p>
                ${ord.pdf_disponible ? `
                    <button style="margin-top: 10px; border: none; background: #0d8abc; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer;"
                        onclick="downloadPatientOrdonnancePdf(${ord.id})">
                        <i class="fas fa-file-pdf"></i> Telecharger PDF
                    </button>
                ` : ''}
            </div>
        `;
    });
    content += '</div>';

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <h3>Historique des Ordonnances</h3>
            <div class="modal-body">${content}</div>
            <button id="closeOrdonnanceHistoriqueModal">Fermer</button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.modal-overlay')?.addEventListener('click', () => modal.remove());
    document.getElementById('closeOrdonnanceHistoriqueModal')?.addEventListener('click', () => modal.remove());
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

function getPatientCallRoomId() {
    const patientId = patientSession.id || 0;
    const today = new Date().toISOString().slice(0, 10);
    return `dokira-${patientId}-${today}`;
}

function openPatientInAppCall(medecin, mode = 'video', targetId = 'patientChatCallPanel') {
    const panel = document.getElementById(targetId);
    if (!panel) return;

    const room = getPatientCallRoomId();
    const audioOnly = mode === 'audio';
    const displayName = encodeURIComponent(patientSession.nomComplet || 'Patient');
    const title = audioOnly ? 'Appel vocal en cours' : 'Appel video en cours';
    const medecinNom = `Dr. ${(medecin?.prenom || '').trim()} ${(medecin?.nom || '').trim()}`.trim() || 'Medecin';
    const jitsiUrl = `https://meet.jit.si/${room}#userInfo.displayName=\"${displayName}\"&config.startWithVideoMuted=${audioOnly}`;

    panel.innerHTML = `
        <div class="patient-call-header">
            <div class="patient-call-header-info">
                <strong>${title}</strong>
                <span>${medecinNom}</span>
            </div>
            <button class="patient-end-call-btn" onclick="closePatientInAppCall('${targetId}')">
                <i class="fas fa-phone-slash"></i> Terminer
            </button>
        </div>
        <iframe class="patient-call-frame" src="${jitsiUrl}" allow="camera; microphone; fullscreen; display-capture" title="Appel Dokira"></iframe>
    `;

    panel.style.display = 'block';
}

function closePatientInAppCall(targetId = 'patientChatCallPanel') {
    const panel = document.getElementById(targetId);
    if (!panel) return;
    panel.innerHTML = '';
    panel.style.display = 'none';
}

function startPatientVideoCall(medecinId) {
    if (!activeConversationMedecin || Number(activeConversationMedecin.id) !== Number(medecinId)) {
        return;
    }
    openPatientInAppCall(activeConversationMedecin, 'video', 'patientChatCallPanel');
}

function startPatientVoiceCall(medecinId) {
    if (!activeConversationMedecin || Number(activeConversationMedecin.id) !== Number(medecinId)) {
        return;
    }
    openPatientInAppCall(activeConversationMedecin, 'audio', 'patientChatCallPanel');
}

function togglePatientChatActionsMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('patientChatActionsMenu');
    if (!menu) return;
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function closePatientChatActionsMenu() {
    const menu = document.getElementById('patientChatActionsMenu');
    if (menu) menu.style.display = 'none';
}

function sendMedecinEmailFromChat() {
    if (!activeConversationMedecin) return;
    const medecinEmail = (activeConversationMedecin.email || '').trim();
    if (!medecinEmail) {
        alert('Email du medecin indisponible');
        return;
    }
    const subject = encodeURIComponent('Suivi medical Dokira');
    window.location.href = `mailto:${medecinEmail}?subject=${subject}`;
}

function applyMedecinPresenceInConversation(isOnline) {
    const status = document.querySelector('.header-status');
    if (status) {
        status.innerHTML = isOnline
            ? '<span class="status-online">En ligne</span>'
            : '<span class="status-offline">Hors ligne</span>';
    }

    const avatar = document.querySelector('.conversation-header-professional .header-avatar');
    if (avatar) {
        const existingBadge = avatar.querySelector('.online-badge');
        if (isOnline && !existingBadge) {
            avatar.insertAdjacentHTML('beforeend', '<span class="online-badge"></span>');
        }
        if (!isOnline && existingBadge) {
            existingBadge.remove();
        }
    }
}

function applyMedecinPresenceInList(medecinId, isOnline) {
    const item = document.querySelector(`.conversation-item[data-medecin-id="${medecinId}"]`);
    if (!item) return;

    const avatar = item.querySelector('.conversation-avatar');
    if (!avatar) return;

    const existingBadge = avatar.querySelector('.online-badge');
    if (isOnline && !existingBadge) {
        avatar.insertAdjacentHTML('beforeend', '<span class="online-badge"></span>');
    }
    if (!isOnline && existingBadge) {
        existingBadge.remove();
    }
}

function stopPatientPresencePolling() {
    if (patientPresencePoller) {
        clearInterval(patientPresencePoller);
        patientPresencePoller = null;
    }
}

async function refreshActiveMedecinPresence() {
    if (!activeConversationMedecinId) return;
    try {
        const response = await fetch(`/api/messagerie/medecin-presence/${activeConversationMedecinId}`);
        if (!response.ok) return;
        const data = await response.json();
        const isOnline = !!data.is_online;

        if (activeConversationMedecin) {
            activeConversationMedecin.is_online = isOnline;
        }
        applyMedecinPresenceInConversation(isOnline);
        applyMedecinPresenceInList(activeConversationMedecinId, isOnline);
    } catch (error) {
        console.error('Erreur rafraichissement statut medecin:', error);
    }
}

function startPatientPresencePolling(medecinId) {
    activeConversationMedecinId = medecinId;
    stopPatientPresencePolling();
    refreshActiveMedecinPresence();
    patientPresencePoller = setInterval(refreshActiveMedecinPresence, 5000);
}

// ============= INTERFACE MESSAGERIE =============

async function showMessagerieInterface() {
    try {
        stopPatientPresencePolling();
        activeConversationMedecinId = null;
        // Charger les conversations
        const response = await fetch('/api/messagerie/conversations');

        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        const conversations = await response.json();

        if (!Array.isArray(conversations)) {
            throw new Error('Format de réponse invalide');
        }
        
        // HTML STRUCTURE 2 COLONNES
        let html = `
            <div class="messagerie-wrapper">
                <!-- COLONNE 1: LISTE DES CONVERSATIONS -->
                <div class="conversations-sidebar">
                    <div class="sidebar-header">
                        <h2>Messagerie</h2>
                        <button class="btn-new-message-sidebar" onclick="showNewMessageForm()">
                            <i class="fas fa-pen-to-square"></i>
                        </button>
                    </div>
                    
                    <div class="sidebar-search">
                        <input type="text" 
                               class="search-input" 
                               placeholder="Rechercher un médecin..."
                               id="conversationSearch">
                        <i class="fas fa-search"></i>
                    </div>
                    
                    <div class="conversations-list" id="conversationsList">
        `;
        
        if (conversations.length === 0) {
            html += `
                <div class="empty-conversations">
                    <i class="fas fa-comments"></i>
                    <p>Aucune conversation</p>
                    <button class="btn btn-primary" onclick="showNewMessageForm()">
                        <i class="fas fa-plus"></i> Commencer une conversation
                    </button>
                </div>
            `;
        } else {
            conversations.forEach((conv, index) => {
                const isActive = index === 0;
                const unreadClass = conv.unread > 0 ? 'unread' : '';
                const lastMessagePreview = (conv.last_message || 'Aucun message').substring(0, 30);
                
                // Avatar professionnel - utiliser le nom du médecin
                const medecinName = conv.medecin_name || 'Médecin';
                const initials = getInitials(medecinName);
                const bgColor = getColorFromName(medecinName);
                
                html += `
                    <div class="conversation-item ${isActive ? 'active' : ''} ${unreadClass}" 
                         data-medecin-id="${conv.medecin_id}"
                         onclick="selectConversation(${conv.medecin_id}, this)">
                        
                        <!-- AVATAR PROFESSIONNEL -->
                        <div class="conversation-avatar" style="background-color: ${bgColor};">
                            <span class="avatar-initials">${initials}</span>
                            ${conv.is_online ? '<span class="online-badge"></span>' : ''}
                        </div>
                        
                        <!-- INFO CONVERSATION -->
                        <div class="conversation-content">
                            <div class="conversation-header-row">
                                <h4 class="conversation-name">${medecinName}</h4>
                                <span class="conversation-time">${formatTimeAgo(conv.last_message_time)}</span>
                            </div>
                            <p class="conversation-specialty">${conv.specialite || 'Spécialiste'}</p>
                            <p class="conversation-preview">${lastMessagePreview}${lastMessagePreview.length >= 30 ? '...' : ''}</p>
                        </div>
                        
                        <!-- BADGE NON LUS -->
                        ${conv.unread > 0 ? `
                            <div class="unread-badge">${conv.unread}</div>
                        ` : ''}
                    </div>
                `;
            });
        }
        
        html += `
                    </div>
                </div>
                
                <!-- COLONNE 2: ZONE DE CONVERSATION -->
                <div class="conversation-main" id="conversationMain">
                    <div class="conversation-empty">
                        <div class="empty-icon">
                            <i class="fas fa-comment-medical"></i>
                        </div>
                        <h3>Sélectionnez une conversation</h3>
                        <p>Choisissez un médecin pour commencer à discuter</p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;
        
        // Ajouter la recherche en temps réel
        const searchInput = document.getElementById('conversationSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const conversationItems = document.querySelectorAll('.conversation-item');
                
                conversationItems.forEach(item => {
                    const name = item.querySelector('.conversation-name').textContent.toLowerCase();
                    const specialty = item.querySelector('.conversation-specialty').textContent.toLowerCase();
                    
                    if (name.includes(searchTerm) || specialty.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }
        
        // Charger la première conversation si elle existe
        if (conversations.length > 0) {
            setTimeout(() => {
                selectConversation(conversations[0].medecin_id, 
                    document.querySelector('.conversation-item.active'));
            }, 100);
        }
        
    } catch (error) {
        console.error('Erreur interface messagerie:', error);
        document.getElementById('mainContent').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon error">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="empty-state-title">Erreur de chargement</div>
                <div class="empty-state-text">Impossible de charger les conversations</div>
                <button class="btn-new-message" onclick="showMessagerieInterface()" style="margin-top: 16px;">
                    <i class="fas fa-redo"></i> Réessayer
                </button>
            </div>
        `;
    }
}


// ============= SÉLECTION D'UNE CONVERSATION =============

async function selectConversation(medecinId, element) {
    try {
        closePatientInAppCall('patientChatCallPanel');
        closePatientChatActionsMenu();
        // Mettre à jour la sélection visuelle
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        if (element) {
            element.classList.add('active');
        }
        
        // Charger la conversation
        const response = await fetch(`/api/messagerie/conversation/${medecinId}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Conversation non trouvée');
            }
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const conversationData = await response.json();
        
        if (!conversationData || typeof conversationData !== 'object') {
            throw new Error('Format de données invalide');
        }
        
        const messages = conversationData.messages || [];
        const medecin = conversationData.medecin || {};
        activeConversationMedecin = medecin;
        activeConversationMedecinId = medecinId;
        
        // Données du médecin sécurisées
        const medecinName = `Dr. ${medecin.prenom || ''} ${medecin.nom || ''}`.trim() || 'Médecin';
        const medecinSpecialite = medecin.specialite || 'Spécialité non spécifiée';
        const isOnline = medecin.is_online || false;
        const initials = getInitials(medecinName);
        const bgColor = getColorFromName(medecinName);
        
        // Construire le contenu de la conversation
        let html = `
            <div class="conversation-header-professional">
                <div class="header-left">
                    <div class="header-avatar" style="background-color: ${bgColor};">
                        <span class="avatar-initials">${initials}</span>
                        ${isOnline ? '<span class="online-badge"></span>' : ''}
                    </div>
                    <div class="header-info">
                        <h2 class="header-name">${medecinName}</h2>
                        <p class="header-specialty">${medecinSpecialite}</p>
                        <p class="header-status">${isOnline ? '<span class="status-online">En ligne</span>' : '<span class="status-offline">Hors ligne</span>'}</p>
                    </div>
                </div>
                <div class="header-actions">
                    <button class="header-action-btn" title="Appel vidéo">
                        <i class="fas fa-video"></i>
                    </button>
                    <button class="header-action-btn" title="Appel audio">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="header-action-btn" title="Plus d'options">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            
            <div class="messages-container" id="messagesContainer">
        `;
        
        if (messages.length === 0) {
            html += `
                <div class="empty-messages">
                    <div class="empty-messages-icon">
                        <i class="fas fa-comment-slash"></i>
                    </div>
                    <p>Aucun message dans cette conversation</p>
                    <p class="empty-messages-subtitle">Envoyez votre premier message</p>
                </div>
            `;
        } else {
            let currentDate = null;
            
            messages.forEach(msg => {
                if (!msg) return;
                
                const messageDate = formatMessageDate(msg.date_envoi);
                
                // Afficher le séparateur de date si elle change
                if (messageDate !== currentDate) {
                    currentDate = messageDate;
                    html += `
                        <div class="message-date-separator">
                            <span>${messageDate}</span>
                        </div>
                    `;
                }
                
                const isPatient = msg.expediteur_type === 'patient';
                const time = formatMessageTime(msg.date_envoi);
                
                const safeContent = escapeHtml(msg.contenu || '');
                
                html += `
                    <div class="message-wrapper ${isPatient ? 'message-sent-wrapper' : 'message-received-wrapper'}">
                        <div class="message-bubble ${isPatient ? 'message-sent' : 'message-received'}">
                            <p class="message-text">${safeContent}</p>
                            <div class="message-meta">
                                <span class="message-time">${time}</span>
                                ${isPatient ? '<span class="message-check"><i class="fas fa-check"></i></span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        html += `
            </div>
            
            <div class="message-input-area">
                <form id="messageForm" class="message-form">
                    <textarea id="messageInput" 
                              class="message-textarea" 
                              placeholder="Écrivez votre message..."
                              rows="1"></textarea>
                    <button type="button" class="message-send-btn" title="Envoyer">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        `;
        
 // Dans selectConversation(), vers la fin de la fonction
const conversationMain = document.getElementById('conversationMain');
if (conversationMain) {
    conversationMain.innerHTML = html;
    applyMedecinPresenceInConversation(isOnline);
    applyMedecinPresenceInList(medecinId, isOnline);
    startPatientPresencePolling(medecinId);

    const headerActions = conversationMain.querySelector('.header-actions');
    if (headerActions) {
        headerActions.innerHTML = `
            <button class="header-action-btn" title="Appel video" onclick="startPatientVideoCall(${medecinId})">
                <i class="fas fa-video"></i>
            </button>
            <button class="header-action-btn" title="Appel audio" onclick="startPatientVoiceCall(${medecinId})">
                <i class="fas fa-phone"></i>
            </button>
            <button class="header-action-btn" title="Plus d'options" onclick="togglePatientChatActionsMenu(event)">
                <i class="fas fa-ellipsis-v"></i>
            </button>
            <div id="patientChatActionsMenu" class="patient-chat-actions-menu">
                <button type="button" class="patient-chat-menu-item" onclick="sendMedecinEmailFromChat()">
                    <i class="fas fa-envelope"></i> Envoyer un mail
                </button>
            </div>
        `;
    }

    const header = conversationMain.querySelector('.conversation-header-professional');
    if (header && !document.getElementById('patientChatCallPanel')) {
        const callPanel = document.createElement('div');
        callPanel.id = 'patientChatCallPanel';
        callPanel.className = 'patient-call-panel';
        callPanel.style.display = 'none';
        header.insertAdjacentElement('afterend', callPanel);
    }
    
    // Auto-resize textarea
    const textarea = document.getElementById('messageInput');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 150) + 'px';
        });
        
        // Shift+Enter pour envoyer
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e, medecinId);
            }
        });
        
        textarea.focus();
    }
    
    // SOLUTION : Attacher l'événement au clic du bouton
    const sendButton = document.querySelector('.message-send-btn');
    if (sendButton) {
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sendMessage(e, medecinId);
            return false;
        });
    }
    
    // Scroller vers le bas
    scrollMessagesToBottom();
}
        
    } catch (error) {
        console.error('Erreur chargement conversation:', error);
        stopPatientPresencePolling();
        document.getElementById('conversationMain').innerHTML = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="error-title">Erreur de chargement</div>
                <div class="error-text">Impossible de charger la conversation</div>
            </div>
        `;
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
                <form id="newMessageForm" style="margin:0;">
                    <div class="form-group" style="margin-bottom:18px;">
                        <label for="recipientSelect">Destinataire</label>
                        <select id="recipientSelect" class="form-control" required>
                            <option value="">Sélectionnez un médecin</option>
                            ${options}
                        </select>
                    </div>
                    <div class="message-input" style="margin-top:10px;">
                        <textarea id="messageContent" class="form-control" rows="3" placeholder="Écrivez votre message ici..." required style="resize:none;"></textarea>
                        <button type="submit" class="btn-send" title="Envoyer">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
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


// ============= ENVOYER UN MESSAGE =============

async function sendMessage(event, medecinId) {
    // Empêcher la soumission du formulaire
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const textarea = document.getElementById('messageInput');
    if (!textarea) return;
    
    const content = textarea.value.trim();
    
    if (!content) return;
    
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Désactiver temporairement le textarea
    textarea.disabled = true;
    const sendButton = document.querySelector('.message-send-btn');
    if (sendButton) sendButton.disabled = true;
    
    // Ajouter le message temporaire
    const tempMessageHTML = `
        <div class="message-wrapper message-sent-wrapper">
            <div class="message-bubble message-sent">
                <p class="message-text">${escapeHtml(content)}</p>
                <div class="message-meta">
                    <span class="message-time">${time}</span>
                    <span class="message-check pending"><i class="fas fa-clock"></i></span>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.innerHTML += tempMessageHTML;
    textarea.value = '';
    textarea.style.height = 'auto';
    scrollMessagesToBottom();
    
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
                // Mettre à jour le statut du message
                const lastMessage = messagesContainer.lastElementChild;
                const checkSpan = lastMessage.querySelector('.message-check');
                if (checkSpan) {
                    checkSpan.innerHTML = '<i class="fas fa-check"></i>';
                    checkSpan.classList.remove('pending');
                }
            } else {
                // Afficher une erreur
                const lastMessage = messagesContainer.lastElementChild;
                const checkSpan = lastMessage.querySelector('.message-check');
                if (checkSpan) {
                    checkSpan.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                    checkSpan.classList.add('error');
                }
            }
        } else {
            throw new Error('Erreur serveur');
        }
    } catch (error) {
        console.error('Erreur envoi message:', error);
        
        // Afficher l'erreur sur le message
        const lastMessage = messagesContainer.lastElementChild;
        const checkSpan = lastMessage.querySelector('.message-check');
        if (checkSpan) {
            checkSpan.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
            checkSpan.classList.add('error');
        }
        
        // Ajouter un message d'erreur
        const errorHTML = `
            <div class="message-wrapper message-error-wrapper">
                <div class="message-error-bubble">
                    <i class="fas fa-exclamation-triangle"></i>
                    Échec de l'envoi. Veuillez réessayer.
                </div>
            </div>
        `;
        messagesContainer.innerHTML += errorHTML;
    } finally {
        // Réactiver le textarea
        textarea.disabled = false;
        if (sendButton) sendButton.disabled = false;
        textarea.focus();
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


// Ajoutez cette fonction quelque part dans votre code
async function sendDirectMessage(medecinId, content) {
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
                displaySection('medecins');
                await refreshNotifications();
                return true;
            }
        }
        alert('Erreur lors de l\'envoi du message');
        return false;
    } catch (error) {
        console.error('Erreur envoi message:', error);
        alert('Erreur de connexion');
        return false;
    }
}

// Générer des initiales à partir d'un nom
function getInitials(name) {
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Générer une couleur stable basée sur le nom
function getColorFromName(name) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#95E1D3',
        '#FF7675', '#52C41A', '#1890FF', '#FAAD14', '#EB2F96'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

function parseApiDate(value) {
    if (!value) return null;
    const isoDate = new Date(value);
    if (!Number.isNaN(isoDate.getTime())) return isoDate;

    const frMatch = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (frMatch) {
        const [, dd, mm, yyyy, hh = '00', min = '00', ss = '00'] = frMatch;
        const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min), Number(ss));
        if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
}

function formatMessageDate(value) {
    const d = parseApiDate(value);
    return d ? d.toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
}

function formatMessageTime(value) {
    const d = parseApiDate(value);
    return d
        ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Formater le temps écoulé
function formatTimeAgo(dateString) {
    const date = parseApiDate(dateString);
    if (!date) return '';

    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}j`;

    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
}

// Échapper le HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Scroller vers le bas
function scrollMessagesToBottom() {
    const container = document.getElementById('messagesContainer');
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 0);
    }
}



// ============= INTERFACE DOCUMENTS =============

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
                                            <button class="btn-action btn-view" onclick="viewDocument(${doc.id}, '${doc.titre}', '${doc.fichier_url}', '${doc.type_document}')" title="Voir">
                                                <i class="fas fa-eye"></i>
                                                <span>Voir</span>
                                            </button>
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

// ============= VISUALISATION DE DOCUMENT =============
async function viewDocument(docId, docTitle, docUrl, docType) {
    try {
        // CORRECTION: Obtenir l'URL complète via l'API
        const response = await fetch(`/api/documents/${docId}/view`);
        if (!response.ok) throw new Error('Document non trouvé');
        
        const docData = await response.json();
        const fullDocUrl = docData.fichier_url;
        
        // Fermer toute modale existante
        const existingWrapper = document.getElementById('documentViewerWrapper');
        if (existingWrapper) {
            existingWrapper.remove();
        }
        
        let viewerHtml = '';
        
        // Créer le HTML de visualisation selon le type de document
        if (docType.startsWith('image/')) {
            // Pour les images (JPEG, PNG, etc.)
            viewerHtml = `
                <div class="document-viewer-modal">
                    <div class="document-viewer-overlay" onclick="closeDocumentViewer()"></div>
                    <div class="document-viewer-container">
                        <div class="document-viewer-header">
                            <h2>${docTitle}</h2>
                            <div class="document-viewer-actions">
                                <a href="${fullDocUrl}" download="${docTitle}" class="btn-viewer-action btn-download" title="Télécharger">
                                    <i class="fas fa-download"></i>
                                    <span>Télécharger</span>
                                </a>
                                <button class="btn-viewer-action btn-close" onclick="closeDocumentViewer()" title="Fermer">
                                    <i class="fas fa-times"></i>
                                    <span>Fermer</span>
                                </button>
                            </div>
                        </div>
                        <div class="document-viewer-content">
                            <img src="${fullDocUrl}" alt="${docTitle}" class="document-image-viewer" 
                                 onerror="this.onerror=null; this.src='https://via.placeholder.com/600x800?text=Image+non+chargée'; this.alt='Image non disponible';">
                        </div>
                    </div>
                </div>
            `;
        } else if (docType === 'application/pdf') {
            // Pour les PDF
            viewerHtml = `
                <div class="document-viewer-modal">
                    <div class="document-viewer-overlay" onclick="closeDocumentViewer()"></div>
                    <div class="document-viewer-container pdf-viewer">
                        <div class="document-viewer-header">
                            <h2>${docTitle}</h2>
                            <div class="document-viewer-actions">
                                <a href="${fullDocUrl}" download="${docTitle}" class="btn-viewer-action btn-download" title="Télécharger">
                                    <i class="fas fa-download"></i>
                                    <span>Télécharger</span>
                                </a>
                                <button class="btn-viewer-action btn-close" onclick="closeDocumentViewer()" title="Fermer">
                                    <i class="fas fa-times"></i>
                                    <span>Fermer</span>
                                </button>
                            </div>
                        </div>
                        <div class="document-viewer-content pdf-content">
                            <iframe src="${fullDocUrl}#view=FitH" width="100%" height="600px" style="border: none;"></iframe>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Pour les autres fichiers (Word, etc.)
            viewerHtml = `
                <div class="document-viewer-modal">
                    <div class="document-viewer-overlay" onclick="closeDocumentViewer()"></div>
                    <div class="document-viewer-container">
                        <div class="document-viewer-header">
                            <h2>${docTitle}</h2>
                            <div class="document-viewer-actions">
                                <a href="${fullDocUrl}" download="${docTitle}" class="btn-viewer-action btn-download" title="Télécharger">
                                    <i class="fas fa-download"></i>
                                    <span>Télécharger</span>
                                </a>
                                <button class="btn-viewer-action btn-close" onclick="closeDocumentViewer()" title="Fermer">
                                    <i class="fas fa-times"></i>
                                    <span>Fermer</span>
                                </button>
                            </div>
                        </div>
                        <div class="document-viewer-content">
                            <div class="document-preview-message">
                                <i class="fas fa-file" style="font-size: 64px; color: #999; margin-bottom: 20px;"></i>
                                <p><strong>${docTitle}</strong></p>
                                <p style="color: #666; margin: 10px 0;">Ce format de fichier ne peut pas être prévisualisé dans le navigateur.</p>
                                <p style="color: #888;">Cliquez sur "Télécharger" pour ouvrir le fichier.</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Ajouter la modale au body
        const viewerDiv = document.createElement('div');
        viewerDiv.id = 'documentViewerWrapper';
        viewerDiv.innerHTML = viewerHtml;
        document.body.appendChild(viewerDiv);
        
        // Animation d'apparition
        setTimeout(() => {
            viewerDiv.classList.add('active');
        }, 10);
        
        // Ajouter un écouteur pour fermer avec Echap
        const escHandler = function(e) {
            if (e.key === 'Escape') {
                closeDocumentViewer();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
    } catch (error) {
        console.error('Erreur visualisation:', error);
        alert('Erreur lors de l\'ouverture du document : ' + error.message);
    }
}

// Fermer la modale de visualisation (UNE SEULE FOIS)
function closeDocumentViewer() {
    const viewerWrapper = document.getElementById('documentViewerWrapper');
    if (viewerWrapper) {
        viewerWrapper.classList.remove('active');
        setTimeout(() => {
            viewerWrapper.remove();
        }, 300);
    }
}


//============ FORMULAIRE DE TÉLÉVERSEMENT DE DOCUMENT =============

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

async function showPatientVisioInterface() {
    const mainContent = document.getElementById('mainContent');
    try {
        const response = await fetch('/api/medecins');
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        const medecinsList = await response.json();
        medecins = medecinsList;
        const options = medecinsList.map((m) => (
            `<option value="${m.id}">Dr. ${m.prenom} ${m.nom} - ${m.specialite || 'Medecin'}</option>`
        )).join('');

        mainContent.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Visioconférences</h2>
                </div>
                <div class="patient-visio-card">
                    <div class="patient-visio-controls">
                        <div class="form-group">
                            <label for="patientVisioMedecinSelect">Choisir un medecin</label>
                            <select id="patientVisioMedecinSelect" class="form-control">
                                <option value="">Selectionnez un medecin</option>
                                ${options}
                            </select>
                        </div>
                        <div class="patient-visio-actions">
                            <button class="btn btn-primary" onclick="launchPatientVisioCall('video')">
                                <i class="fas fa-video"></i> Appel video
                            </button>
                            <button class="btn btn-secondary" onclick="launchPatientVisioCall('audio')">
                                <i class="fas fa-phone"></i> Appel vocal
                            </button>
                        </div>
                    </div>
                    <div id="patientVisioCallPanel" class="patient-call-panel" style="display:none;"></div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Erreur affichage visio patient:', error);
        mainContent.innerHTML = `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Visioconférences</h2>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon error"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="empty-state-title">Impossible de charger les medecins</div>
                </div>
            </div>
        `;
    }
}

function launchPatientVisioCall(mode = 'video') {
    const select = document.getElementById('patientVisioMedecinSelect');
    if (!select || !select.value) {
        alert('Veuillez choisir un medecin');
        return;
    }

    const medecinId = Number(select.value);
    const medecin = medecins.find((m) => Number(m.id) === medecinId);
    if (!medecin) {
        alert('Medecin introuvable');
        return;
    }

    openPatientInAppCall(medecin, mode, 'patientVisioCallPanel');
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
    closePatientInAppCall('patientChatCallPanel');
    closePatientInAppCall('patientVisioCallPanel');
    closePatientChatActionsMenu();
    if (sectionName !== 'messagerie') {
        stopPatientPresencePolling();
        activeConversationMedecinId = null;
    }
    
    // Gérer les sections spéciales qui nécessitent un rechargement API spécifique
    if (sectionName === 'messagerie') {
        await loadMessagerieStats();
        showMessagerieInterface();
        return;
    }
     if (sectionName === 'profil') {
    showProfilResume();  
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

    if (sectionName === 'dossier') {
        await loadDossierMedicalData();
        showDossierMedicalInterface();
        return;
    }

    if (sectionName === 'chat-ia') {
        showChatIAInterface();
        return;
    }

    if (sectionName === 'visio') {
        await showPatientVisioInterface();
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
                <a href="#" class="view-all-btn" onclick="displaySection('rendez-vous'); return false;">
                    Tout voir
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            ${renderCards(sectionsData.dashboard.cards)}
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

    setTimeout(() => {
        initializePatientSearch();
        
        // Vider le champ de recherche
        const searchInput = document.getElementById('patientSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Cacher les résultats
        const searchResults = document.getElementById('patientSearchResults');
        if (searchResults) {
            searchResults.classList.remove('show');
        }
    }, 100);
}

// Fonction pour obtenir le titre de la section
function getSectionTitle(sectionName) {
    const titles = {
        'dashboard': 'Tableau de Bord',
        'profil': 'Mon Profil',
        'dossier': 'Dossier Médical',
        'rendez-vous': 'Mes Rendez-vous',
        'messagerie': 'Messagerie',
        'visio': 'Visioconférences',
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
               
                const timestamp = new Date().getTime();
                document.getElementById('profileAvatar').src = data.photo_url + "?v=" + timestamp;
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
     //1.  Initialiser la recherche
    initializePatientSearch();
    
    //2. CHARGEMENT PARALLÈLE OPTIMISÉ (Promise.all)
    await Promise.all([
        loadPatientData(),
        loadDashboardStats(),
        loadMessagerieStats(),
        loadDocumentsList(),
        loadOrdonnancesList()
    ]);

    // 3. Mettre à jour les cartes du dashboard avec données réelles
    await updateDashboardCards();
    updateHealthStat();
    
    // 4. Rafraîchir périodiquement (uniquement les notifications légères)
    setInterval(async () => {
        await refreshNotifications();
        // Rafraîchir les cartes toutes les 5 minutes
        if (document.querySelector('.nav-link-custom.active')?.getAttribute('data-section') === 'dashboard') {
            await updateDashboardCards();
            displaySection('dashboard');
        }
    }, 300000);
    
    // 3. Afficher le dashboard
    // Les données sont déjà prêtes grâce au Promise.all ci-dessus.
    document.addEventListener('click', closePatientChatActionsMenu);
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

// ============= CHARGEMENT DES RENDEZ-VOUS - FIX =============

async function loadMesRendezVous() {
    try {
        console.log("📅 Chargement des rendez-vous du patient...");
        
        const response = await fetch('/api/rendez-vous', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.error(`❌ Erreur HTTP ${response.status}: ${response.statusText}`);
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📊 Données reçues:", data);
        
        // ✅ CORRECTION: Vérifier que data est bien un tableau
       
        const rdvs = Array.isArray(data) ? data : [];
        
        console.log(`📈 ${rdvs.length} rendez-vous trouvés`);
        
        let html = '';

        if (rdvs.length === 0) {
            html = `
                <div class="empty-state" style="text-align: center; padding: 40px;">
                    <div style="margin-bottom: 20px;">
                        <i class="fas fa-calendar-times" style="font-size: 64px; color: #ccc;"></i>
                    </div>
                    <h3 style="color: #666; margin-bottom: 10px;">Aucun rendez-vous programmé</h3>
                    <p style="color: #999; margin-bottom: 20px;">Prenez votre premier rendez-vous en cliquant sur l'onglet "Nouveau RDV"</p>
                    <button class="btn btn-primary" onclick="document.querySelector('[data-tab=\"prise-rdv\"]').click()">
                        <i class="fas fa-calendar-plus"></i> Prendre un rendez-vous
                    </button>
                </div>
            `;
        } else {
            html = `<div class="rdv-cards" style="display: grid; gap: 16px;">`;
            
            rdvs.forEach(rdv => {
                // ✅ Vérification de la date
                let dateFormatée = 'Date non disponible';
                if (rdv.date_heure) {
                    try {
                        const date = new Date(rdv.date_heure);
                        dateFormatée = date.toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    } catch (e) {
                        console.warn('Erreur parsing date:', rdv.date_heure);
                    }
                }

                // ✅ Icônes du type de consultation
                const typeIcon = {
                    'Cabinet': '🏥',
                    'Vidéo': '📱',
                    'Domicile': '🏠'
                }[rdv.type_consultation] || '📅';

                // ✅ Classe CSS pour le statut
                let statusClass = 'en_attente';
                const statut = (rdv.statut || 'Planifié').toLowerCase();
                
                if (statut.includes('planifié') || statut.includes('confirmé')) {
                    statusClass = 'confirme';
                } else if (statut.includes('annulé')) {
                    statusClass = 'annule';
                } else if (statut.includes('terminé')) {
                    statusClass = 'termine';
                }

                // ✅ Construction de la carte
                html += `
                    <div class="rdv-card" style="
                        background: white;
                        border: 1px solid #e5e7eb;
                        border-radius: 12px;
                        padding: 16px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                        transition: all 0.3s ease;
                    " onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" 
                       onmouseout="this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'">
                        
                        <div class="rdv-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="margin: 0; font-size: 16px; color: #1a2b3c;">
                                <i class="fas fa-calendar"></i> ${dateFormatée}
                            </h3>
                            <span class="rdv-status ${statusClass}" style="
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: 500;
                                text-transform: uppercase;
                                ${statusClass === 'confirme' ? 'background: #d1fae5; color: #065f46;' : ''}
                                ${statusClass === 'annule' ? 'background: #fee2e2; color: #991b1b;' : ''}
                                ${statusClass === 'termine' ? 'background: #dbeafe; color: #1e40af;' : ''}
                                ${statusClass === 'en_attente' ? 'background: #fef3c7; color: #92400e;' : ''}
                            ">
                                ${rdv.statut || 'Planifié'}
                            </span>
                        </div>
                        
                        <div class="rdv-body" style="margin-bottom: 12px;">
                            <p style="margin: 8px 0; color: #374151;">
                                <strong>👨‍⚕️ Médecin:</strong> 
                                <span style="color: #0D8ABC;">${rdv.medecin_nom || 'Médecin'}</span>
                            </p>
                            <p style="margin: 8px 0; color: #374151;">
                                <strong>🩺 Spécialité:</strong> 
                                ${rdv.medecin_specialite || 'Non spécifié'}
                            </p>
                            <p style="margin: 8px 0; color: #374151;">
                                <strong>📝 Motif:</strong> 
                                ${rdv.motif || 'Non spécifié'}
                            </p>
                            <p style="margin: 8px 0; color: #374151;">
                                <strong>🔷 Type:</strong> 
                                ${typeIcon} ${rdv.type_consultation || 'Cabinet'}
                            </p>
                            ${rdv.lieu ? `
                                <p style="margin: 8px 0; color: #374151;">
                                    <strong>📍 Lieu:</strong> 
                                    ${rdv.lieu}
                                </p>
                            ` : ''}
                        </div>
                        
                        <div class="rdv-actions" style="display: flex; gap: 8px;">
                            <button class="btn btn-sm btn-secondary" 
                                    onclick="modifierRendezVous(${rdv.id})"
                                    style="flex: 1; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #0D8ABC; cursor: pointer;">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                            <button class="btn btn-sm btn-danger" 
                                    onclick="supprimerRendezVous(${rdv.id})"
                                    style="flex: 1; padding: 8px; border: 1px solid #fecaca; border-radius: 6px; background: #fee2e2; color: #991b1b; cursor: pointer;">
                                <i class="fas fa-trash"></i> Annuler
                            </button>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        }

        const container = document.getElementById('rdv-list-container');
        if (container) {
            container.innerHTML = html;
        } else {
            console.error('❌ Container rdv-list-container non trouvé');
        }

    } catch (error) {
        console.error('❌ Erreur chargement rendez-vous:', error);
        
        const container = document.getElementById('rdv-list-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state error" style="text-align: center; padding: 40px;">
                    <div style="margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #dc3545;"></i>
                    </div>
                    <h3 style="color: #666; margin-bottom: 10px;">Erreur de chargement</h3>
                    <p style="color: #999; margin-bottom: 20px;">Impossible de charger vos rendez-vous. Veuillez réessayer.</p>
                    <button class="btn btn-primary" onclick="loadMesRendezVous()" style="padding: 8px 16px; background: #0D8ABC; color: white; border: none; border-radius: 6px; cursor: pointer;">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            `;
        }
    }
}


// ============= MODIFIER UN RENDEZ-VOUS - FIX =============

async function modifierRendezVous(rdvId) {
    try {
        console.log(`📝 Modification du RDV ${rdvId}`);
        
        // Récupérer les données actuelles du RDV
        const response = await fetch('/api/rendez-vous');
        const rdvs = await response.json();
        
        const rdv = rdvs.find(r => r.id === rdvId);
        if (!rdv) {
            alert('Rendez-vous non trouvé');
            return;
        }
        
        // Formater la date pour l'input datetime-local
        let dateValue = '';
        if (rdv.date_heure) {
            const date = new Date(rdv.date_heure);
            // Formatter: YYYY-MM-DDTHH:mm
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            dateValue = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
        
        // Créer le formulaire de modification
        let html = `
            <div class="modification-form" style="background: white; border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; margin-bottom: 24px;">
                    <button class="btn-back" onclick="loadMesRendezVous()" style="
                        background: none;
                        border: none;
                        color: #0D8ABC;
                        cursor: pointer;
                        font-size: 18px;
                        margin-right: 12px;
                    ">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2 style="margin: 0; flex: 1;">Modifier le rendez-vous</h2>
                </div>
                
                <form id="modifyRdvForm">
                    <div class="form-section" style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 12px 0; color: #1a2b3c;">Informations du rendez-vous</h3>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Date et heure
                            </label>
                            <input type="datetime-local" 
                                   id="modifyDateHeure" 
                                   value="${dateValue}"
                                   style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Motif de la visite
                            </label>
                            <textarea id="modifyMotif" 
                                      style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: vertical; min-height: 80px;"
                            >${rdv.motif || ''}</textarea>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Type de consultation
                            </label>
                            <select id="modifyTypeConsultation" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                <option value="Cabinet" ${rdv.type_consultation === 'Cabinet' ? 'selected' : ''}>🏥 En Cabinet</option>
                                <option value="Vidéo" ${rdv.type_consultation === 'Vidéo' ? 'selected' : ''}>📱 En Ligne (Vidéo)</option>
                                <option value="Domicile" ${rdv.type_consultation === 'Domicile' ? 'selected' : ''}>🏠 À Domicile</option>
                            </select>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Lieu (si domicile)
                            </label>
                            <input type="text" 
                                   id="modifyLieu" 
                                   placeholder="Votre adresse complète"
                                   value="${rdv.lieu || ''}"
                                   style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Statut
                            </label>
                            <select id="modifyStatut" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                <option value="Planifié" ${rdv.statut === 'Planifié' ? 'selected' : ''}>Planifié</option>
                                <option value="Confirmé" ${rdv.statut === 'Confirmé' ? 'selected' : ''}>Confirmé</option>
                                <option value="Annulé" ${rdv.statut === 'Annulé' ? 'selected' : ''}>Annulé</option>
                                <option value="Terminé" ${rdv.statut === 'Terminé' ? 'selected' : ''}>Terminé</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button type="submit" class="btn btn-primary" style="
                            flex: 1;
                            padding: 10px 16px;
                            background: #0D8ABC;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 500;
                        ">
                            <i class="fas fa-save"></i> Enregistrer les modifications
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="loadMesRendezVous()" style="
                            flex: 1;
                            padding: 10px 16px;
                            background: white;
                            color: #374151;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 500;
                        ">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        const container = document.getElementById('rdv-list-container');
        if (container) {
            container.innerHTML = html;
            
            // Gestion du changement du type de consultation
            document.getElementById('modifyTypeConsultation').addEventListener('change', function() {
                const lieuInput = document.getElementById('modifyLieu');
                if (this.value === 'Domicile') {
                    lieuInput.style.display = 'block';
                } else {
                    lieuInput.style.display = 'none';
                }
            });
            
            // Soumission du formulaire
            document.getElementById('modifyRdvForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const dateHeure = document.getElementById('modifyDateHeure').value;
                const motif = document.getElementById('modifyMotif').value;
                const typeConsultation = document.getElementById('modifyTypeConsultation').value;
                const lieu = document.getElementById('modifyLieu').value;
                const statut = document.getElementById('modifyStatut').value;
                
                try {
                    const response = await fetch(`/api/rendez-vous/${rdvId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            date_heure: dateHeure,
                            motif: motif,
                            type_consultation: typeConsultation,
                            lieu: lieu || null,
                            statut: statut
                        })
                    });
                    
                    if (response.ok) {
                        alert('✅ Rendez-vous modifié avec succès');
                        loadMesRendezVous();
                    } else {
                        const error = await response.json();
                        alert('❌ Erreur: ' + error.detail);
                    }
                } catch (error) {
                    console.error('Erreur modification:', error);
                    alert('Erreur lors de la modification');
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert('Erreur lors du chargement du rendez-vous');
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

// ============= MODIFIER UN RENDEZ-VOUS =============

async function modifierRendezVous(rdvId) {
    try {
        // Charger tous les rendez-vous pour trouver celui à modifier
        const response = await fetch('/api/rendez-vous');
        const rdvs = await response.json();
        
        const rdv = rdvs.find(r => r.id === rdvId);
        if (!rdv) {
            alert('Rendez-vous non trouvé');
            return;
        }
        
        // Formater la date pour l'input datetime-local
        let dateValue = '';
        if (rdv.date_heure) {
            const date = new Date(rdv.date_heure);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            dateValue = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
        
        // Créer le formulaire de modification
        let html = `
            <div class="modification-form" style="background: white; border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; margin-bottom: 24px;">
                    <button class="btn-back" onclick="loadMesRendezVous()" style="
                        background: none;
                        border: none;
                        color: #0D8ABC;
                        cursor: pointer;
                        font-size: 18px;
                        margin-right: 12px;
                    ">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2 style="margin: 0; flex: 1;">Modifier le rendez-vous</h2>
                </div>
                
                <form id="modifyRdvForm">
                    <div class="form-section" style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 12px 0; color: #1a2b3c;">Informations du rendez-vous</h3>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Date et heure
                            </label>
                            <input type="datetime-local" 
                                   id="modifyDateHeure" 
                                   value="${dateValue}"
                                   style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Motif de la visite
                            </label>
                            <textarea id="modifyMotif" 
                                      style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: vertical; min-height: 80px;"
                            >${rdv.motif || ''}</textarea>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Type de consultation
                            </label>
                            <select id="modifyTypeConsultation" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                <option value="Cabinet" ${rdv.type_consultation === 'Cabinet' ? 'selected' : ''}>🏥 En Cabinet</option>
                                <option value="Vidéo" ${rdv.type_consultation === 'Vidéo' ? 'selected' : ''}>📱 En Ligne (Vidéo)</option>
                                <option value="Domicile" ${rdv.type_consultation === 'Domicile' ? 'selected' : ''}>🏠 À Domicile</option>
                            </select>
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Lieu (si domicile)
                            </label>
                            <input type="text" 
                                   id="modifyLieu" 
                                   placeholder="Votre adresse complète"
                                   value="${rdv.lieu || ''}"
                                   style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                        </div>
                        
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label style="display: block; margin-bottom: 8px; color: #374151; font-weight: 500;">
                                Statut
                            </label>
                            <select id="modifyStatut" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                <option value="Planifié" ${rdv.statut === 'Planifié' ? 'selected' : ''}>Planifié</option>
                                <option value="Confirmé" ${rdv.statut === 'Confirmé' ? 'selected' : ''}>Confirmé</option>
                                <option value="Annulé" ${rdv.statut === 'Annulé' ? 'selected' : ''}>Annulé</option>
                                <option value="Terminé" ${rdv.statut === 'Terminé' ? 'selected' : ''}>Terminé</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button type="submit" class="btn btn-primary" style="
                            flex: 1;
                            padding: 10px 16px;
                            background: #0D8ABC;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 500;
                        ">
                            <i class="fas fa-save"></i> Enregistrer les modifications
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="loadMesRendezVous()" style="
                            flex: 1;
                            padding: 10px 16px;
                            background: white;
                            color: #374151;
                            border: 1px solid #d1d5db;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 500;
                        ">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        const container = document.getElementById('rdv-list-container');
        if (container) {
            container.innerHTML = html;
            
            // Gestion du changement du type de consultation
            document.getElementById('modifyTypeConsultation').addEventListener('change', function() {
                const lieuInput = document.getElementById('modifyLieu');
                if (this.value === 'Domicile') {
                    lieuInput.style.display = 'block';
                } else {
                    lieuInput.style.display = 'none';
                }
            });
            
            // Initialiser l'affichage du champ lieu
            const typeSelect = document.getElementById('modifyTypeConsultation');
            const lieuInput = document.getElementById('modifyLieu');
            if (typeSelect.value !== 'Domicile') {
                lieuInput.style.display = 'none';
            }
            
            // Soumission du formulaire
            document.getElementById('modifyRdvForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const dateHeure = document.getElementById('modifyDateHeure').value;
                const motif = document.getElementById('modifyMotif').value;
                const typeConsultation = document.getElementById('modifyTypeConsultation').value;
                const lieu = document.getElementById('modifyLieu').value;
                const statut = document.getElementById('modifyStatut').value;
                
                try {
                    const response = await fetch(`/api/rendez-vous/${rdvId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            date_heure: dateHeure,
                            motif: motif,
                            type_consultation: typeConsultation,
                            lieu: lieu || null,
                            statut: statut
                        })
                    });
                    
                    if (response.ok) {
                        alert('✅ Rendez-vous modifié avec succès');
                        loadMesRendezVous();
                    } else {
                        const error = await response.json();
                        alert('❌ Erreur: ' + error.detail);
                    }
                } catch (error) {
                    console.error('Erreur modification:', error);
                    alert('Erreur lors de la modification');
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert('Erreur lors du chargement du rendez-vous');
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


 // ============= GESTION DU DOSSIER MÉDICAL =============
async function loadDossierMedicalData() {

    try {
        const res = await fetch('/api/dossier-medical', {
            credentials: 'include'
        });

        if (!res.ok) throw new Error("Erreur serveur");

        const result = await res.json();

        if (!result.success) {
            throw new Error("Réponse invalide");
        }

        dossierMedicalCache = result.data;

        updateDossierSection(result.data);

    } catch (err) {
        console.error("Dossier médical :", err);
        showError("Impossible de charger le dossier médical");
    }
}

function updateDossierSection(data) {

    const dossier = sectionsData.dossier;

    /* ================= STATS ================= */

    dossier.stats = [
        {
            label: 'Allergies',
            value: data.allergies_count
        },
        {
            label: 'Antécédents',
            value: data.antecedents_medicaux
                ? data.antecedents_medicaux.split(',').length
                : 0
        },
        {
            label: 'Traitements',
            value: data.traitements_en_cours
                ? data.traitements_en_cours.split(',').length
                : 0
        }
    ];

    /* ================= CARTES ================= */

    dossier.cards.forEach(card => {

        switch (card.id) {

            case 'medical-allergies':
                card.subtitle = data.allergies || 'Aucune';
                break;

            case 'medical-history':
                const hasAntecedents = data.antecedents_medicaux || data.antecedents_familiaux;
                card.subtitle = hasAntecedents ? 'Renseignés' : 'Aucun';
                break;

            case 'medical-treatments':
                card.subtitle =
                    data.traitements_en_cours || 'Aucun';
                break;

            case 'medical-blood':
                card.subtitle =
                    data.groupe_sanguin || 'Non renseigné';
                break;

            case 'medical-insurance':
                const hasInsurance = data.numero_securite_sociale;
                card.subtitle = hasInsurance ? 'Renseignée' : 'Non renseignée';
                break;

            case 'medical-doctor':
                card.subtitle =
                     card.subtitle = data.medecin_traitant || 'Non défini';
                break;

            case 'medical-ordonnances':
                card.subtitle = 
                    data.ordonnances_count > 0 ? `${data.ordonnances_count} ordonnance(s)` : 'Aucune';
                break;
        }
    });
}

function showMedicalInfo(type) {

    if (!dossierMedicalCache) {
        alert("Données non chargées");
        return;
    }

    let title = '';
    let content = '';

    switch (type) {

        case 'allergies':
            title = 'Allergies';
            content = dossierMedicalCache.allergies || 'Aucune allergie';
            break;

        case 'antecedents':
            title = 'Antécédents médicaux';
            content = `
                 <div style="margin-bottom: 20px;">
                    <strong style="font-size: 16px;">📋 Antécédents Médicaux :</strong>
                    <p style="margin: 10px 0; color: #333; padding: 10px; background: #f5f5f5; border-radius: 6px;">
                        ${dossierMedicalCache.antecedents_medicaux || 'Aucun antécédent médical'}
                    </p>
                </div>

                <div>
                    <strong style="font-size: 16px;">👨‍👩‍👧 Antécédents Familiaux :</strong>
                    <p style="margin: 10px 0; color: #333; padding: 10px; background: #f5f5f5; border-radius: 6px;">
                        ${dossierMedicalCache.antecedents_familiaux || 'Aucun antécédent familial'}
                    </p>
                </div>
            `;
            break;

        case 'treatments':
            title = 'Traitements en cours';
            content =
                dossierMedicalCache.traitements_en_cours || 'Aucun traitement';
            break;

        case 'blood':
            title = 'Groupe sanguin';
            content =
                dossierMedicalCache.groupe_sanguin || 'Non renseigné';
            break;

        case 'insurance':
            title = 'Sécurité sociale';
             content = dossierMedicalCache.numero_securite_sociale 
                ? `Numéro de sécurité sociale : ${dossierMedicalCache.numero_securite_sociale}`
                : 'Aucune information d\'assurance renseignée';
            break;

        case 'doctor':
            title = 'Médecin traitant';
            content =
               dossierMedicalCache.medecin_traitant || 'Non défini';
            break;

        case 'ordonnances':
            title = 'Ordonnances';
            if (dossierMedicalCache.ordonnances && dossierMedicalCache.ordonnances.length > 0) {
                content = '<div style="max-height: 400px; overflow-y: auto;">';
                dossierMedicalCache.ordonnances.forEach((ord, index) => {
                    content += `
                        <div style="margin-bottom: 15px; padding: 12px; background: #f9f9f9; border-left: 4px solid #0d8abc; border-radius: 4px;">
                            <p style="margin: 5px 0;"><strong>Ordonnance ${index + 1}</strong></p>
                            <p style="margin: 5px 0; font-size: 13px; color: #666;">📅 ${ord.date_emission}</p>
                            <p style="margin: 5px 0; font-size: 13px; color: #666;">👨‍⚕️ ${ord.medecin_nom}</p>
                            <p style="margin: 5px 0; font-size: 13px; color: #666;">💊 ${ord.medicaments}</p>
                            <p style="margin: 5px 0; font-size: 13px; color: #666;">📋 ${ord.posologie}</p>
                            <p style="margin: 5px 0; font-size: 12px;"><span style="background: #e3f2fd; padding: 2px 6px; border-radius: 3px; color: #0d8abc;">${ord.statut}</span></p>
                        </div>
                    `;
                });
                content += '</div>';
            } else {
                content = 'Aucune ordonnance';
            }
            break;
    }

    showMedicalModal(title, content);
}

function showMedicalModal(title, content) {

    const modal = document.createElement('div');
    modal.className = 'medical-modal';

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <h3>${title}</h3>
            <div class="modal-body">${content}</div>
            <button id="closeModal">Fermer</button>
        </div>
    `;

    document.body.appendChild(modal);

    document
        .getElementById('closeModal')
        .addEventListener('click', () => {
            modal.remove();
        });
}

async function openFullHistorique() {

    const res = await fetch('/api/dossier-medical/historique-detaille', {
        credentials: 'include'
    });

    const result = await res.json();

    if (!result.success) return;

    renderHistoriqueModal(result.consultations);
}

// ============= AFFICHER L'INTERFACE DOSSIER MÉDICAL =============

async function showDossierMedicalInterface() {
    try {
        // Charger les données du dossier
        await loadDossierMedicalData();
        
        // Récupérer les données du cache
        const data = dossierMedicalCache;
        
        // Construire le HTML
        let html = `
            <div class="dossier-medical-wrapper">
                <div class="section-header">
                    <h2 class="section-title">
                        <i class="fas fa-file-medical"></i> Dossier Médical
                    </h2>
                </div>
        `;
        
        // Afficher les statistiques
        if (sectionsData.dossier.stats) {
            html += renderStats(sectionsData.dossier.stats);
        }
        
        // Afficher les cartes principales
        html += `<div class="cards-grid">`;
        
        sectionsData.dossier.cards.forEach((card, index) => {
            html += `
                <div class="content-card animate-in" style="animation-delay: ${index * 0.1}s" 
                     onclick="${card.onclick}" style="cursor: pointer;">
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
                    <div class="card-meta">
                        <span class="card-badge badge-${card.badge.type}">${card.badge.text}</span>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        
        //  Afficher les documents médicaux
        if (data.documents && data.documents.length > 0) {
            html += `
                <div style="margin-top: 40px;">
                    <div class="section-header">
                        <h2 class="section-title">
                            <i class="fas fa-file-alt"></i> Documents Médicaux (${data.documents_count})
                        </h2>
                    </div>
                    <div class="documents-grid">
            `;
            
            data.documents.forEach(doc => {
                const typeIcon = {
                    'application/pdf': 'fa-file-pdf',
                    'image/jpeg': 'fa-image',
                    'image/png': 'fa-image',
                    'application/msword': 'fa-file-word'
                };
                
                const icon = typeIcon[doc.type_document] || 'fa-file';
                
                html += `
                    <div class="document-card-dossier">
                        <div class="doc-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="doc-info">
                            <h4>${doc.titre}</h4>
                            <p class="doc-type">${doc.type_document}</p>
                            <p class="doc-date">📅 ${doc.date_upload}</p>
                            ${doc.description ? `<p class="doc-desc">${doc.description}</p>` : ''}
                        </div>
                        <div class="doc-actions">
                            <a href="${doc.fichier_url}" target="_blank" class="btn-doc-view">
                                <i class="fas fa-eye"></i> Voir
                            </a>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        } else {
            html += `
                <div style="margin-top: 40px; text-align: center; padding: 40px; background: #f5f5f5; border-radius: 8px;">
                    <i class="fas fa-file-alt" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                    <p style="color: #666; margin: 0;">Aucun document médical</p>
                </div>
            `;
        }
        // Afficher les ordonnances
        if (data.ordonnances && data.ordonnances.length > 0) {
            html += `
                <div style="margin-top: 40px;">
                    <div class="section-header">
                        <h2 class="section-title">
                            <i class="fas fa-prescription-bottle"></i> Ordonnances (${data.ordonnances_count})
                        </h2>
                    </div>
                    <div class="ordonnances-grid">
            `;
            
            data.ordonnances.forEach(ord => {
                const statusColor = ord.statut === 'Active' ? '#10b981' : '#ef4444';
                
                html += `
                    <div class="ordonnance-card-dossier">
                        <div class="ord-header">
                            <h4>Ordonnance du ${ord.date_emission}</h4>
                            <span class="ord-status" style="background-color: ${statusColor};">${ord.statut}</span>
                        </div>
                        <div class="ord-info">
                            <p><strong>👨‍⚕️ Médecin :</strong> ${ord.medecin_nom}</p>
                            <p><strong>💊 Médicaments :</strong> ${ord.medicaments}</p>
                            <p><strong>📋 Posologie :</strong> ${ord.posologie}</p>
                        </div>
                        <div class="ord-actions">
                            ${ord.fichier_url ? `
                                <a href="${ord.fichier_url}" target="_blank" class="btn-ord-view">
                                    <i class="fas fa-download"></i> Télécharger
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
       
        html += `</div>`;
        
        document.getElementById('mainContent').innerHTML = html;
        
    } catch (error) {
        console.error('Erreur affichage dossier:', error);
        document.getElementById('mainContent').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erreur lors du chargement du dossier médical</p>
            </div>
        `;
    }
}



// ============= AFFICHER LE RÉSUMÉ DU PROFIL =============
async function showProfilResume() {
    try {
        const response = await fetch('/api/patient/full-info');
        if (!response.ok) throw new Error('Erreur chargement profil');
        
        const patient = await response.json();
        
        // Formater la date de naissance
        let dateNaissance = 'Non renseignée';
        if (patient.date_naissance) {
            const date = new Date(patient.date_naissance);
            dateNaissance = date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }

        // Calculer l'âge
        let age = '';
        if (patient.date_naissance) {
            const today = new Date();
            const birthDate = new Date(patient.date_naissance);
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                calculatedAge--;
            }
            age = `(${calculatedAge} ans)`;
        }

        // Déterminer le niveau de complétion du profil
        let completedFields = 0;
        let totalFields = 7; // Nom, Prénom, Email, Téléphone, Adresse, Date naissance, Genre
        
        if (patient.nom) completedFields++;
        if (patient.prenom) completedFields++;
        if (patient.email) completedFields++;
        if (patient.telephone) completedFields++;
        if (patient.adresse) completedFields++;
        if (patient.date_naissance) completedFields++;
        if (patient.genre) completedFields++;
        
        const completionPercent = Math.round((completedFields / totalFields) * 100);
        
        // Déterminer le statut de sécurité
        let securityStatus = 'Standard';
        let securityIcon = 'fa-shield';
        let securityColor = 'orange';
        
        // Vérifier si l'email est vérifié (simulé)
        const isEmailVerified = patient.est_email_verifie || false;
        
        if (isEmailVerified) {
            securityStatus = 'Protégé';
            securityIcon = 'fa-shield-alt';
            securityColor = 'green';
        }

        // Informations médicales - compter les champs remplis
        let medicalCount = 0;
        if (patient.groupe_sanguin) medicalCount++;
        if (patient.allergies && patient.allergies.trim() !== '') medicalCount++;
        if (patient.antecedents_medicaux && patient.antecedents_medicaux.trim() !== '') medicalCount++;
        if (patient.traitements_en_cours && patient.traitements_en_cours.trim() !== '') medicalCount++;

        // ✅ CONSTRUCTION DU HTML DE RÉSUMÉ
        let html = `
            <div class="profil-resume-container">
                <!-- EN-TÊTE DU PROFIL -->
                <div class="profil-header-card">
                    <div class="profil-avatar-large">
                        <img src="${patient.photo_profil_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(patient.prenom + ' ' + patient.nom) + '&background=0D8ABC&color=fff&size=128'}" 
                             alt="Photo de profil"
                             id="profilAvatarLarge"
                             onerror="this.src='https://ui-avatars.com/api/?name=' + encodeURIComponent('${patient.prenom || ''} ${patient.nom || ''}') + '&background=0D8ABC&color=fff&size=128'">
                    </div>
                    <div class="profil-header-info">
                        <h1>${patient.prenom || ''} ${patient.nom || ''}</h1>
                        <p class="profil-email">${patient.email || 'Email non renseigné'}</p>
                        <div class="profil-completion">
                            <div class="completion-bar-container">
                                <div class="completion-bar" style="width: ${completionPercent}%;"></div>
                            </div>
                            <span class="completion-text">Profil complété à ${completionPercent}%</span>
                        </div>
                    </div>
                    <div class="profil-header-actions">
                        <button class="btn btn-primary" onclick="showParametresInterface()">
                            <i class="fas fa-edit"></i> Modifier le profil
                        </button>
                    </div>
                </div>

                <!-- GRILLE DES INFORMATIONS -->
                <div class="profil-grid">
                    <!-- CARTE INFORMATIONS PERSONNELLES -->
                    <div class="profil-card">
                        <div class="profil-card-header">
                            <div class="card-icon blue">
                                <i class="fas fa-id-card"></i>
                            </div>
                            <h2>Informations Personnelles</h2>
                            <a href="#" onclick="showParametresInterface(); return false;" class="card-edit-btn">
                                <i class="fas fa-pencil-alt"></i> Modifier
                            </a>
                        </div>
                        <div class="profil-card-body">
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-user"></i> Nom complet:</span>
                                <span class="info-value">${patient.prenom || ''} ${patient.nom || ''} <span class="info-age">${age}</span></span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-calendar"></i> Date de naissance:</span>
                                <span class="info-value">${dateNaissance}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-venus-mars"></i> Genre:</span>
                                <span class="info-value">${patient.genre || 'Non renseigné'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-phone"></i> Téléphone:</span>
                                <span class="info-value">${patient.telephone || 'Non renseigné'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-map-marker-alt"></i> Adresse:</span>
                                <span class="info-value">${patient.adresse || 'Non renseignée'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-city"></i> Ville / CP:</span>
                                <span class="info-value">${patient.ville || ''} ${patient.code_postal || ''}</span>
                            </div>
                        </div>
                        <div class="profil-card-footer">
                            <span class="status-badge ${completedFields === totalFields ? 'success' : 'warning'}">
                                ${completedFields === totalFields ? '✓ Complet' : '⚠️ À compléter'}
                            </span>
                        </div>
                    </div>

                    <!-- CARTE SÉCURITÉ DU COMPTE -->
                    <div class="profil-card">
                        <div class="profil-card-header">
                            <div class="card-icon ${securityColor}">
                                <i class="fas ${securityIcon}"></i>
                            </div>
                            <h2>Sécurité du Compte</h2>
                            <a href="#" onclick="showParametresInterface(); return false;" class="card-edit-btn">
                                <i class="fas fa-pencil-alt"></i> Modifier
                            </a>
                        </div>
                        <div class="profil-card-body">
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-envelope"></i> Email:</span>
                                <span class="info-value">${patient.email || 'Non renseigné'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-check-circle"></i> Email vérifié:</span>
                                <span class="info-value">
                                    ${isEmailVerified ? 
                                        '<span class="badge-success"><i class="fas fa-check"></i> Vérifié</span>' : 
                                        '<span class="badge-warning"><i class="fas fa-clock"></i> Non vérifié</span>'}
                                </span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-lock"></i> Mot de passe:</span>
                                <span class="info-value">••••••••</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-shield-alt"></i> Authentification:</span>
                                <span class="info-value">Standard</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-history"></i> Dernière connexion:</span>
                                <span class="info-value">${patient.derniere_connexion ? new Date(patient.derniere_connexion).toLocaleDateString('fr-FR') : 'Première connexion'}</span>
                            </div>
                        </div>
                        <div class="profil-card-footer">
                            <span class="status-badge success">
                                <i class="fas fa-shield-alt"></i> ${securityStatus}
                            </span>
                        </div>
                    </div>

                    <!-- CARTE INFORMATIONS MÉDICALES -->
                    <div class="profil-card">
                        <div class="profil-card-header">
                            <div class="card-icon orange">
                                <i class="fas fa-heartbeat"></i>
                            </div>
                            <h2>Informations Médicales</h2>
                            <a href="#" onclick="displaySection('dossier'); return false;" class="card-edit-btn">
                                <i class="fas fa-folder-medical"></i> Voir dossier
                            </a>
                        </div>
                        <div class="profil-card-body">
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-tint"></i> Groupe sanguin:</span>
                                <span class="info-value"><strong>${patient.groupe_sanguin || 'Non renseigné'}</strong></span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-allergies"></i> Allergies:</span>
                                <span class="info-value">${patient.allergies ? patient.allergies.split(',').map(a => a.trim()).join(', ') : 'Aucune'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-history"></i> Antécédents:</span>
                                <span class="info-value">${patient.antecedents_medicaux ? 'Renseignés' : 'Aucun'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-prescription-bottle"></i> Traitements:</span>
                                <span class="info-value">${patient.traitements_en_cours ? 'En cours' : 'Aucun'}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label"><i class="fas fa-id-card"></i> N° Sécurité sociale:</span>
                                <span class="info-value">${patient.numero_securite_sociale ? '••••' + patient.numero_securite_sociale.slice(-4) : 'Non renseigné'}</span>
                            </div>
                        </div>
                        <div class="profil-card-footer">
                            <span class="status-badge ${medicalCount > 0 ? 'info' : 'warning'}">
                                ${medicalCount} information${medicalCount > 1 ? 's' : ''} médicale${medicalCount > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Ajouter le CSS directement dans le head s'il n'existe pas déjà
        if (!document.getElementById('profil-resume-css')) {
            const style = document.createElement('style');
            style.id = 'profil-resume-css';
            style.textContent = `
                .profil-resume-container {
                    padding: 20px;
                }
                .profil-header-card {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .profil-avatar-large {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    overflow: hidden;
                    border: 3px solid #0D8ABC;
                }
                .profil-avatar-large img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .profil-header-info {
                    flex: 1;
                }
                .profil-header-info h1 {
                    margin: 0 0 8px 0;
                    font-size: 28px;
                    color: #1a2b3c;
                }
                .profil-email {
                    color: #6b7280;
                    margin: 0 0 12px 0;
                }
                .profil-completion {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .completion-bar-container {
                    width: 200px;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .completion-bar {
                    height: 100%;
                    background: #0D8ABC;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                .completion-text {
                    font-size: 14px;
                    color: #6b7280;
                }
                .profil-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 24px;
                }
                .profil-card {
                    background: white;
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                }
                .profil-card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .card-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                .card-icon.blue { background: #0D8ABC; }
                .card-icon.green { background: #10b981; }
                .card-icon.orange { background: #f59e0b; }
                .card-icon.red { background: #ef4444; }
                .profil-card-header h2 {
                    flex: 1;
                    margin: 0;
                    font-size: 18px;
                    color: #1a2b3c;
                }
                .card-edit-btn {
                    color: #0D8ABC;
                    text-decoration: none;
                    font-size: 14px;
                }
                .card-edit-btn:hover {
                    text-decoration: underline;
                }
                .profil-card-body {
                    flex: 1;
                }
                .info-row {
                    display: flex;
                    margin-bottom: 12px;
                    font-size: 15px;
                }
                .info-label {
                    width: 140px;
                    color: #6b7280;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .info-label i {
                    width: 16px;
                    color: #9ca3af;
                }
                .info-value {
                    flex: 1;
                    color: #1a2b3c;
                    font-weight: 500;
                }
                .info-age {
                    color: #6b7280;
                    font-size: 14px;
                    font-weight: normal;
                }
                .profil-card-footer {
                    margin-top: 20px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: flex-end;
                }
                .status-badge {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                }
                .status-badge.success {
                    background: #d1fae5;
                    color: #065f46;
                }
                .status-badge.warning {
                    background: #fef3c7;
                    color: #92400e;
                }
                .status-badge.info {
                    background: #dbeafe;
                    color: #1e40af;
                }
                .badge-success {
                    color: #10b981;
                }
                .badge-warning {
                    color: #f59e0b;
                }
                @media (max-width: 768px) {
                    .profil-header-card {
                        flex-direction: column;
                        text-align: center;
                    }
                    .profil-completion {
                        flex-direction: column;
                    }
                    .info-row {
                        flex-direction: column;
                        gap: 4px;
                    }
                    .info-label {
                        width: 100%;
                    }
                }
            `;  
            document.head.appendChild(style);
        }

        document.getElementById('mainContent').innerHTML = html;

    } catch (error) {
        console.error('Erreur chargement résumé profil:', error);
        document.getElementById('mainContent').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erreur lors du chargement du profil</p>
            </div>
        `;
    }
}





// ============================================
// FONCTION DE RECHERCHE 
// ============================================

let patientSearchTimeout = null;

function initializePatientSearch() {
    console.log("🔍 Initialisation de la recherche...");
    
    const searchInput = document.getElementById('patientSearchInput');
    const searchResults = document.getElementById('patientSearchResults');
    const searchClear = document.querySelector('.patient-search-clear');
    
    if (!searchInput || !searchResults) {
        console.warn("⚠️ Éléments de recherche non trouvés");
        return;
    }
    
    // Fonction principale de recherche
    function performPatientSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        console.log("🔍 Recherche:", searchTerm);
        
        if (searchTerm === '') {
            searchResults.innerHTML = '';
            searchResults.classList.remove('show');
            if (searchClear) searchClear.style.display = 'none';
            return;
        }
        
        // Afficher le bouton clear
        if (searchClear) searchClear.style.display = 'block';
        
        // Récupérer tout le contenu visible de l'interface patient
        const mainContent = document.getElementById('mainContent');
        const sidebarLinks = document.querySelectorAll('.nav-link-custom');
        
        const searchResults_list = [];
        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        
        // 1. Rechercher dans le contenu principal
        if (mainContent && mainContent.textContent) {
            // Chercher dans le texte visible
            const textContent = mainContent.textContent || '';
            const lines = textContent.split('\n').filter(line => line.trim());
            
            lines.forEach(line => {
                if (line.toLowerCase().includes(searchTerm)) {
                    const matchIndex = line.toLowerCase().indexOf(searchTerm);
                    const start = Math.max(0, matchIndex - 30);
                    const end = Math.min(line.length, matchIndex + searchTerm.length + 30);
                    
                    let context = line.substring(start, end);
                    if (start > 0) context = '...' + context;
                    if (end < line.length) context = context + '...';
                    
                    const highlightedContext = context.replace(regex, match => `<mark>${match}</mark>`);
                    
                    searchResults_list.push({
                        type: 'content',
                        text: line,
                        context: highlightedContext
                    });
                }
            });
            
            // Chercher dans les éléments spécifiques
            const cards = mainContent.querySelectorAll('.content-card, .stat-card, .rdv-card, .document-card, .profil-card, .card-title, h3, h4, p');
            cards.forEach(card => {
                const cardText = card.textContent.toLowerCase();
                if (cardText.includes(searchTerm)) {
                    const title = card.querySelector('.card-title, h3, h4')?.textContent || 'Élément';
                    const preview = card.textContent.substring(0, 100).replace(/\s+/g, ' ').trim();
                    const highlightedPreview = preview.replace(regex, match => `<mark>${match}</mark>`);
                    
                    searchResults_list.push({
                        type: 'card',
                        title: title,
                        context: highlightedPreview,
                        element: card
                    });
                }
            });
        }
        
        // 2. Rechercher dans les liens de navigation
        sidebarLinks.forEach(link => {
            const linkText = link.textContent.toLowerCase();
            if (linkText.includes(searchTerm)) {
                searchResults_list.push({
                    type: 'navigation',
                    text: link.textContent,
                    context: `Navigation: ${link.textContent}`,
                    section: link.getAttribute('data-section'),
                    element: link
                });
            }
        });
        
        // Supprimer les doublons (garder uniquement les résultats uniques par contexte)
        const uniqueResults = [];
        const seen = new Set();
        
        searchResults_list.forEach(result => {
            const key = result.context.substring(0, 50);
            if (!seen.has(key)) {
                seen.add(key);
                uniqueResults.push(result);
            }
        });
        
        console.log(`✅ ${uniqueResults.length} résultats trouvés`);
        displayPatientSearchResults(uniqueResults, searchTerm);
    }
    
    function displayPatientSearchResults(results, searchTerm) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="patient-search-no-results">
                    <i class="fas fa-search"></i>
                    <p>Aucun résultat trouvé pour "<strong>${escapeHtml(searchTerm)}</strong>"</p>
                </div>
            `;
        } else {
            // Limiter à 15 résultats maximum
            const limitedResults = results.slice(0, 15);
            
            let html = '<div class="patient-search-results-container">';
            
            // En-tête des résultats
            html += `
                <div class="patient-search-header">
                    <span class="patient-search-count">${results.length} résultat(s) trouvé(s)</span>
                    <button class="patient-search-close" onclick="closePatientSearch()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Afficher tous les résultats sans catégorisation pour simplifier
            limitedResults.forEach((result, index) => {
                let icon = 'fa-file-alt';
                let action = '';
                
                if (result.type === 'navigation') {
                    icon = 'fa-compass';
                    action = `navigateToSection('${result.section}')`;
                } else if (result.type === 'card') {
                    icon = 'fa-credit-card';
                    action = `scrollToElement(this, '${escapeHtml(result.title || '')}')`;
                } else {
                    icon = 'fa-paragraph';
                    action = `scrollToText('${escapeHtml(result.text || '')}')`;
                }
                
                html += `
                    <div class="patient-search-item" onclick="${action}">
                        <div class="patient-search-item-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="patient-search-item-content">
                            ${result.title ? `<div class="patient-search-item-title">${escapeHtml(result.title)}</div>` : ''}
                            <div class="patient-search-item-text">${result.context}</div>
                        </div>
                    </div>
                `;
            });
            
            // Indiquer s'il y a plus de résultats
            if (results.length > 15) {
                html += `
                    <div class="patient-search-more">
                        <i class="fas fa-ellipsis-h"></i>
                        ${results.length - 15} résultat(s) supplémentaire(s)
                    </div>
                `;
            }
            
            html += '</div>';
            searchResults.innerHTML = html;
        }
        
        searchResults.classList.add('show');
    }
    
    // Supprimer les anciens écouteurs pour éviter les doublons
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    // Réattacher les écouteurs
    newSearchInput.addEventListener('input', () => {
        clearTimeout(patientSearchTimeout);
        patientSearchTimeout = setTimeout(performPatientSearch, 300);
    });
    
    newSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performPatientSearch();
        }
    });
    
    // Gestionnaire pour le bouton clear
    if (searchClear) {
        const newSearchClear = searchClear.cloneNode(true);
        searchClear.parentNode.replaceChild(newSearchClear, searchClear);
        
        newSearchClear.addEventListener('click', () => {
            newSearchInput.value = '';
            newSearchInput.focus();
            searchResults.innerHTML = '';
            searchResults.classList.remove('show');
            newSearchClear.style.display = 'none';
        });
    }
    
    // Afficher/masquer le bouton clear
    newSearchInput.addEventListener('input', () => {
        if (searchClear) {
            searchClear.style.display = newSearchInput.value ? 'block' : 'none';
        }
    });
    
    // Fermer en cliquant ailleurs
    document.removeEventListener('click', closeSearchOnClick);
    document.addEventListener('click', closeSearchOnClick);
    
    function closeSearchOnClick(e) {
        if (!newSearchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('show');
        }
    }
    
    console.log("✅ Recherche initialisée");
}

// Fonction pour scroller vers un texte
window.scrollToText = function(text) {
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    console.log("📍 Scrolling vers:", cleanText);
    
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                if (node.parentElement.tagName === 'SCRIPT' || 
                    node.parentElement.tagName === 'STYLE') {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.nodeValue && node.nodeValue.includes(cleanText)) {
            node.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Effet de surbrillance
            const originalBg = node.parentElement.style.backgroundColor;
            const originalTransition = node.parentElement.style.transition;
            
            node.parentElement.style.backgroundColor = '#fff3cd';
            node.parentElement.style.transition = 'background-color 0.5s';
            
            setTimeout(() => {
                node.parentElement.style.backgroundColor = originalBg;
                node.parentElement.style.transition = originalTransition;
            }, 2000);
            
            break;
        }
    }
    
    closePatientSearch();
};

// Fermer la recherche
window.closePatientSearch = function() {
    const searchResults = document.getElementById('patientSearchResults');
    if (searchResults) {
        searchResults.classList.remove('show');
    }
};

// Échapper le HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// ============================================
// MISE À JOUR DES CARTES DU DASHBOARD 
// ============================================

async function updateDashboardCards() {
    try {
        // 1. Récupérer les rendez-vous
        const rdvResponse = await fetch('/api/rendez-vous');
        const rendezVous = await rdvResponse.json();
        
        // Trouver le prochain rendez-vous (date la plus proche dans le futur)
        const now = new Date();
        const prochainsRdv = rendezVous
            .filter(rdv => new Date(rdv.date_heure) > now && rdv.statut !== 'Annulé')
            .sort((a, b) => new Date(a.date_heure) - new Date(b.date_heure));
        
        const prochainRdv = prochainsRdv.length > 0 ? prochainsRdv[0] : null;
        
        // 2. Récupérer les ordonnances
        const ordResponse = await fetch('/api/ordonnances');
        const ordonnances = await ordResponse.json();
        
        // Compter les ordonnances actives
        const ordonnancesActives = ordonnances.filter(ord => 
            ord.statut?.toLowerCase() === 'active' || ord.statut?.toLowerCase() === 'actif'
        ).length;
        
        // 3. Récupérer les analyses/résultats (via les documents)
        const docsResponse = await fetch('/api/documents');
        const documents = await docsResponse.json();
        
        // Compter les documents de type analyse
        const analyses = documents.filter(doc => 
            doc.type_document?.toLowerCase().includes('analyse') ||
            doc.titre?.toLowerCase().includes('analyse') ||
            doc.titre?.toLowerCase().includes('résultat')
        ).length;
        
        // 4. Mettre à jour la carte "Prochain Rendez-vous"
        const rdvCard = sectionsData.dashboard.cards[0];
        if (prochainRdv) {
            const date = new Date(prochainRdv.date_heure);
            const dateFormatee = date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            rdvCard.subtitle = `Dr. ${prochainRdv.medecin_nom || 'Médecin'}`;
            rdvCard.description = prochainRdv.motif || 'Consultation médicale';
            rdvCard.meta = [
                { icon: 'fa-clock', text: dateFormatee },
                { icon: 'fa-map-marker-alt', text: prochainRdv.lieu || prochainRdv.type_consultation || 'Cabinet' }
            ];
            rdvCard.badge = { type: 'success', text: 'Confirmé' };
        } else {
            rdvCard.subtitle = 'Aucun rendez-vous programmé';
            rdvCard.description = 'Prenez rendez-vous avec votre médecin';
            rdvCard.meta = [
                { icon: 'fa-clock', text: 'Aucune date' },
                { icon: 'fa-map-marker-alt', text: 'En attente' }
            ];
            rdvCard.badge = { type: 'warning', text: 'À planifier' };
        }
        
        // 5. Mettre à jour la carte "Ordonnance Active"
        const ordCard = sectionsData.dashboard.cards[1];
        if (ordonnancesActives > 0) {
            const derniereOrdonnance = ordonnances.find(ord => 
                ord.statut?.toLowerCase() === 'active' || ord.statut?.toLowerCase() === 'actif'
            );
            
            ordCard.subtitle = `${ordonnancesActives} ordonnance(s) active(s)`;
            ordCard.description = derniereOrdonnance ? 
                `Prescription du ${new Date(derniereOrdonnance.date_emission).toLocaleDateString('fr-FR')}` : 
                'Consultez vos ordonnances';
            ordCard.meta = [
                { icon: 'fa-pills', text: `${ordonnancesActives} traitement${ordonnancesActives > 1 ? 's' : ''}` },
                { icon: 'fa-calendar', text: derniereOrdonnance ? new Date(derniereOrdonnance.date_emission).toLocaleDateString('fr-FR') : 'Aucune' }
            ];
            ordCard.badge = { type: 'success', text: 'Active' };
        } else {
            ordCard.subtitle = 'Aucune ordonnance active';
            ordCard.description = 'Consultez vos ordonnances dans la section dédiée';
            ordCard.meta = [
                { icon: 'fa-pills', text: '0 traitement' },
                { icon: 'fa-calendar', text: 'Aucune' }
            ];
            ordCard.badge = { type: 'info', text: 'Vérifier' };
        }
        
        // 6. Mettre à jour la carte "Résultats Analyses"
        const anaCard = sectionsData.dashboard.cards[2];
        if (analyses > 0) {
            const derniereAnalyse = documents.find(doc => 
                doc.type_document?.toLowerCase().includes('analyse') ||
                doc.titre?.toLowerCase().includes('analyse')
            );
            
            anaCard.subtitle = `${analyses} résultat(s) disponible(s)`;
            anaCard.description = derniereAnalyse ? 
                derniereAnalyse.titre : 
                'Consultez vos analyses dans la section dédiée';
            anaCard.meta = [
                { icon: 'fa-check-circle', text: `${analyses} résultat${analyses > 1 ? 's' : ''}` },
                { icon: 'fa-calendar', text: derniereAnalyse ? 
                    new Date(derniereAnalyse.date_upload).toLocaleDateString('fr-FR') : 
                    'Aucune date' }
            ];
            anaCard.badge = { type: 'success', text: 'Nouveau' };
        } else {
            anaCard.subtitle = 'Aucun résultat disponible';
            anaCard.description = 'Consultez vos analyses dans la section dédiée';
            anaCard.meta = [
                { icon: 'fa-check-circle', text: 'Aucun résultat' },
                { icon: 'fa-calendar', text: 'Aucune date' }
            ];
            anaCard.badge = { type: 'info', text: 'Vérifier' };
        }
        
        console.log('✅ Cartes du dashboard mises à jour avec données réelles');
        
    } catch (error) {
        console.error('❌ Erreur mise à jour cartes dashboard:', error);
    }
}

// Fonction pour obtenir les statistiques de suivi santé
function updateHealthStat() {
    let score = 98; // Score par défaut
    
    // Calculer un score basé sur plusieurs facteurs
    const hasRdv = sectionsData.dashboard.cards[0].badge?.type === 'success' ? 5 : 0;
    const hasOrdo = sectionsData.dashboard.cards[1].badge?.type === 'success' ? 5 : 0;
    const hasAnalyse = sectionsData.dashboard.cards[2].badge?.type === 'success' ? 5 : 0;
    
    score = 88 + hasRdv + hasOrdo + hasAnalyse; // Base 88% + bonus
    
    sectionsData.dashboard.stats[3].value = `${score}%`;
    sectionsData.dashboard.stats[3].change.text = score >= 95 ? 'Excellent' : 
                                                   score >= 85 ? 'Bon' : 
                                                   score >= 75 ? 'Moyen' : 'À améliorer';
}

// Fonction pour rafraîchir tout le dashboard
async function refreshDashboard() {
    await Promise.all([
        updateDashboardCards(),
        loadDashboardStats(),
        loadMessagerieStats(),
        loadDocumentsList(),
        loadOrdonnancesList()
    ]);
    
    updateHealthStat();
    
    // Re-rendre le dashboard si c'est la section active
    const activeSection = document.querySelector('.nav-link-custom.active')?.getAttribute('data-section');
    if (activeSection === 'dashboard') {
        displaySection('dashboard');
    }
}


// Fonction de test pour vérifier que la recherche fonctionne
window.testSearch = function() {
    console.log("🧪 Test de la recherche...");
    
    const searchInput = document.getElementById('patientSearchInput');
    const searchResults = document.getElementById('patientSearchResults');
    
    if (!searchInput) {
        console.error("❌ Champ de recherche non trouvé");
        return;
    }
    
    if (!searchResults) {
        console.error("❌ Conteneur de résultats non trouvé");
        return;
    }
    
    console.log("✅ Éléments trouvés");
    
    // Simuler une recherche
    searchInput.value = "rendez";
    searchInput.dispatchEvent(new Event('input'));
    
    setTimeout(() => {
        console.log("📊 Résultats:", searchResults.innerHTML ? "OK" : "Vide");
    }, 500);
};

