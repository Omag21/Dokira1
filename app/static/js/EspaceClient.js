 
        // Données structurées pour chaque section
        const sectionsData = {
            dashboard: {
                stats: [
                    {
                        icon: 'fa-calendar-check',
                        color: 'blue',
                        value: '2',
                        label: 'RDV à venir',
                        change: { type: 'positive', text: '+1 ce mois' }
                    },
                    {
                        icon: 'fa-file-medical',
                        color: 'green',
                        value: '12',
                        label: 'Documents',
                        change: { type: 'positive', text: '+3 récents' }
                    },
                    {
                        icon: 'fa-comments',
                        color: 'orange',
                        value: '5',
                        label: 'Messages',
                        change: { type: 'positive', text: '2 non lus' }
                    },
                    {
                        icon: 'fa-heartbeat',
                        color: 'red',
                        value: '98%',
                        label: 'Suivi santé',
                        change: { type: 'positive', text: 'Excellent' }
                    }
                ],
                cards: [
                    {
                        icon: 'fa-calendar-alt',
                        color: 'blue',
                        title: 'Prochain Rendez-vous',
                        subtitle: 'Dr. Marie Laurent - Cardiologie',
                        description: 'Consultation de suivi et contrôle annuel',
                        meta: [
                            { icon: 'fa-clock', text: 'Demain à 14:30' },
                            { icon: 'fa-map-marker-alt', text: 'Cabinet Médical Centre' }
                        ],
                        badge: { type: 'warning', text: 'Dans 1 jour' }
                    },
                    {
                        icon: 'fa-file-prescription',
                        color: 'green',
                        title: 'Ordonnance Active',
                        subtitle: 'Traitement cardiovasculaire',
                        description: 'Médicament quotidien - Renouvellement automatique',
                        meta: [
                            { icon: 'fa-pills', text: '30 jours restants' },
                            { icon: 'fa-calendar', text: 'Depuis le 15 Nov' }
                        ],
                        badge: { type: 'success', text: 'Active' }
                    },
                    {
                        icon: 'fa-vial',
                        color: 'purple',
                        title: 'Résultats Analyses',
                        subtitle: 'Bilan sanguin complet',
                        description: 'Tous les paramètres sont dans les normes',
                        meta: [
                            { icon: 'fa-check-circle', text: 'Résultats normaux' },
                            { icon: 'fa-calendar', text: 'Il y a 3 jours' }
                        ],
                        badge: { type: 'success', text: 'Disponible' }
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
                            { icon: 'fa-check-circle', text: 'Profil complet' }
                        ],
                        badge: { type: 'success', text: 'Vérifié' }
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
                        description: 'Groupe O+, Allergie pénicilline, Antécédents familiaux',
                        meta: [
                            { icon: 'fa-info-circle', text: '3 informations' }
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
                        subtitle: '45 consultations enregistrées',
                        description: 'Accédez à l\'ensemble de vos consultations et diagnostics passés',
                        meta: [
                            { icon: 'fa-calendar', text: 'Depuis 2019' }
                        ],
                        badge: { type: 'primary', text: '45 entrées' }
                    },
                    {
                        icon: 'fa-allergies',
                        color: 'orange',
                        title: 'Allergies Connues',
                        subtitle: 'Liste des allergies déclarées',
                        description: 'Pénicilline, Pollen de graminées',
                        meta: [
                            { icon: 'fa-exclamation-triangle', text: '2 allergies' }
                        ],
                        badge: { type: 'warning', text: 'Important' }
                    },
                    {
                        icon: 'fa-dna',
                        color: 'purple',
                        title: 'Antécédents',
                        subtitle: 'Antécédents personnels et familiaux',
                        description: 'Historique familial de maladies cardiovasculaires',
                        meta: [
                            { icon: 'fa-users', text: 'Familial' }
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
                        subtitle: '2 rendez-vous planifiés',
                        description: 'Consultation cardiologie demain et contrôle dentaire la semaine prochaine',
                        meta: [
                            { icon: 'fa-calendar', text: 'Prochains jours' }
                        ],
                        badge: { type: 'success', text: '2 RDV' }
                    },
                    {
                        icon: 'fa-history',
                        color: 'purple',
                        title: 'Historique Rendez-vous',
                        subtitle: '28 consultations passées',
                        description: 'Consultez l\'historique complet de vos rendez-vous',
                        meta: [
                            { icon: 'fa-list', text: 'Tout l\'historique' }
                        ],
                        badge: { type: 'primary', text: '28 RDV' }
                    }
                ]
            },
            messagerie: {
                cards: [
                    {
                        icon: 'fa-inbox',
                        color: 'blue',
                        title: 'Boîte de Réception',
                        subtitle: '5 messages non lus',
                        description: 'Nouveaux messages de vos médecins et professionnels de santé',
                        meta: [
                            { icon: 'fa-envelope', text: '12 messages total' }
                        ],
                        badge: { type: 'danger', text: '5 non lus' }
                    },
                    {
                        icon: 'fa-paper-plane',
                        color: 'green',
                        title: 'Messages Envoyés',
                        subtitle: 'Vos conversations',
                        description: 'Historique des messages envoyés à vos médecins',
                        meta: [
                            { icon: 'fa-comments', text: '8 conversations' }
                        ],
                        badge: { type: 'primary', text: '8 messages' }
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
                        badge: { type: 'success', text: 'Écrire' }
                    }
                ]
            },
            ordonnances: {
                cards: [
                    {
                        icon: 'fa-prescription',
                        color: 'green',
                        title: 'Ordonnances Actives',
                        subtitle: '2 prescriptions en cours',
                        description: 'Traitements cardiovasculaire et suppléments vitaminiques',
                        meta: [
                            { icon: 'fa-pills', text: 'Renouvellement auto' }
                        ],
                        badge: { type: 'success', text: 'Active' }
                    },
                    {
                        icon: 'fa-archive',
                        color: 'blue',
                        title: 'Archives Ordonnances',
                        subtitle: '15 ordonnances archivées',
                        description: 'Historique complet de toutes vos prescriptions',
                        meta: [
                            { icon: 'fa-calendar', text: 'Depuis 2019' }
                        ],
                        badge: { type: 'primary', text: '15 fichiers' }
                    },
                    {
                        icon: 'fa-bell',
                        color: 'orange',
                        title: 'Rappels Médicaments',
                        subtitle: 'Notifications activées',
                        description: 'Recevez des rappels pour la prise de vos médicaments',
                        meta: [
                            { icon: 'fa-clock', text: '3 rappels/jour' }
                        ],
                        badge: { type: 'success', text: 'Actif' }
                    }
                ]
            },
            documents: {
                cards: [
                    {
                        icon: 'fa-file-pdf',
                        color: 'blue',
                        title: 'Comptes Rendus',
                        subtitle: '12 documents disponibles',
                        description: 'Rapports de consultation, analyses et diagnostics',
                        meta: [
                            { icon: 'fa-download', text: 'Télécharger tout' }
                        ],
                        badge: { type: 'primary', text: '12 PDF' }
                    },
                    {
                        icon: 'fa-x-ray',
                        color: 'purple',
                        title: 'Imagerie Médicale',
                        subtitle: '8 examens radiologiques',
                        description: 'Radiographies, IRM, scanners et échographies',
                        meta: [
                            { icon: 'fa-images', text: '8 examens' }
                        ],
                        badge: { type: 'primary', text: 'Images' }
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
                        badge: { type: 'success', text: 'Importer' }
                    }
                ]
            },
            analyses: {
                cards: [
                    {
                        icon: 'fa-vial',
                        color: 'purple',
                        title: 'Dernières Analyses',
                        subtitle: 'Bilan sanguin du 20 Décembre',
                        description: 'Résultats complets disponibles - Tous les paramètres normaux',
                        meta: [
                            { icon: 'fa-check-circle', text: 'Normaux' },
                            { icon: 'fa-calendar', text: 'Il y a 5 jours' }
                        ],
                        badge: { type: 'success', text: 'Disponible' }
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
                        subtitle: '24 bilans enregistrés',
                        description: 'Accédez à tous vos résultats d\'analyses passées',
                        meta: [
                            { icon: 'fa-calendar', text: 'Depuis 2019' }
                        ],
                        badge: { type: 'primary', text: '24 bilans' }
                    }
                ]
            },
            injections: {
                cards: [
                    {
                        icon: 'fa-syringe',
                        color: 'green',
                        title: 'Carnet de Vaccination',
                        subtitle: 'Vaccins à jour',
                        description: 'COVID-19, Tétanos, Grippe saisonnière - Tous les vaccins à jour',
                        meta: [
                            { icon: 'fa-check-circle', text: '8 vaccins' }
                        ],
                        badge: { type: 'success', text: 'À jour' }
                    },
                    {
                        icon: 'fa-calendar-alt',
                        color: 'orange',
                        title: 'Prochains Rappels',
                        subtitle: '1 rappel à prévoir',
                        description: 'Rappel Tétanos prévu dans 3 mois',
                        meta: [
                            { icon: 'fa-clock', text: 'Dans 90 jours' }
                        ],
                        badge: { type: 'warning', text: 'À planifier' }
                    },
                    {
                        icon: 'fa-bell',
                        color: 'blue',
                        title: 'Notifications Vaccins',
                        subtitle: 'Alertes activées',
                        description: 'Recevez des rappels automatiques pour vos vaccinations',
                        meta: [
                            { icon: 'fa-envelope', text: 'Par email et SMS' }
                        ],
                        badge: { type: 'success', text: 'Actif' }
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
                        badge: { type: 'primary', text: 'Français' }
                    },
                    {
                        icon: 'fa-bell',
                        color: 'orange',
                        title: 'Notifications',
                        subtitle: 'Gérer les alertes',
                        description: 'Email, SMS, push - Personnalisez vos préférences de notification',
                        meta: [
                            { icon: 'fa-check', text: 'Toutes actives' }
                        ],
                        badge: { type: 'success', text: 'Configuré' }
                    },
                    {
                        icon: 'fa-lock',
                        color: 'green',
                        title: 'Confidentialité & RGPD',
                        subtitle: 'Protection des données',
                        description: 'Gérez vos données personnelles et droits RGPD',
                        meta: [
                            { icon: 'fa-shield-alt', text: 'Conforme' }
                        ],
                        badge: { type: 'success', text: 'Protégé' }
                    }
                ]
            }
        };

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
                        <div class="content-card animate-in" style="animation-delay: ${index * 0.1}s">
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
        function displaySection(sectionName) {
            const mainContent = document.getElementById('mainContent');
            const data = sectionsData[sectionName];

            let html = '';

            // Bannière de bienvenue pour le dashboard
            if (sectionName === 'dashboard') {
                html += `
                    <div class="dashboard-header">
                        <div class="welcome-banner">
                            <div class="welcome-content">
                                <h1>Bonjour, Jean 👋</h1>
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

        // Gestion de l'upload de photo de profil
        document.getElementById('profilePhotoInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    document.getElementById('profileAvatar').src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Fonction pour changer la langue
        function changelanguage(lang) {
            console.log('Changement de langue vers:', lang);
            // Ici vous pouvez ajouter la logique pour changer la langue
        }

        // Afficher le dashboard au chargement
        displaySection('dashboard');


// ============= GESTION DE LA DÉCONNEXION =============
    
    // Trouver le lien de déconnexion
    const logoutLink = document.querySelector('a[href="/deconnexion"]');
    
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
                    window.location.href = '/deconnexion';
                }, 1000);
            }
        });
    }

    