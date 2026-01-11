// medecin.js - Logique de l'espace médecin

const sectionsData = {
    dashboard: {
        stats: [
            {
                icon: 'fa-user-injured',
                color: 'blue',
                value: '42',
                label: 'Patients suivis',
                change: { type: 'positive', text: '+5 cette semaine' }
            },
            {
                icon: 'fa-calendar-check',
                color: 'green',
                value: '8',
                label: 'RDV aujourd\'hui',
                change: { type: 'positive', text: 'Agenda complet' }
            },
            {
                icon: 'fa-file-medical-alt',
                color: 'orange',
                value: '15',
                label: 'Dossiers en attente',
                change: { type: 'negative', text: '3 urgents' }
            },
            {
                icon: 'fa-star',
                color: 'red',
                value: '4.9',
                label: 'Note moyenne',
                change: { type: 'positive', text: 'Top 5%' }
            }
        ],
        recentConsultations: [
            // Données simulées
        ]
    },
    // ... autres sections
};

// Fonction pour rendre les statistiques dans le style "User CSS"
function renderStats(stats) {
    if (!stats) return '';
    return `
        <div class="stats-grid">
            ${stats.map(stat => `
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon ${stat.color}">
                            <i class="fas ${stat.icon}"></i>
                        </div>
                    </div>
                    <div class="stat-value">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                    ${stat.change ? `
                        <div style="font-size: 11px; margin-top: 5px; color: ${stat.change.type === 'positive' ? 'var(--success-color)' : 'var(--danger-color)'}">
                             ${stat.change.text}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Fonction pour afficher le contenu
function displaySection(sectionName) {
    const mainContent = document.getElementById('mainContent');
    const data = sectionsData[sectionName];

    const titles = {
        'dashboard': 'Tableau de Bord',
        'patients': 'Mes Patients',
        'dossiers': 'Dossiers Médicaux',
        'messagerie': 'Messagerie',
        'rdv': 'Mes Rendez-vous',
        'visio': 'Visioconférences',
        'historique': 'Historique',
        'parametres': 'Paramètres'
    };

    let html = '';

    if (sectionName === 'dashboard') {
        // Utilisation de la classe .welcome-card du CSS utilisateur
        html += `
            <div class="welcome-card">
                <div class="welcome-content">
                    <h1>Bonjour, Dr. Médecin 👋</h1>
                    <p>Voici un aperçu de votre activité aujourd'hui. Vous avez 8 rendez-vous prévus.</p>
                </div>
            </div>
        `;

        if (data && data.stats) {
            html += renderStats(data.stats);
        }

        html += `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">Consultations du jour</h2>
                    <div class="section-actions">
                         <button class="btn-filter active">Tout</button>
                         <button class="btn-filter">En attente</button>
                         <button class="btn-filter">Terminés</button>
                    </div>
                </div>
                <!-- Tableau à implémenter -->
                <div class="empty-state">
                     <div class="empty-state-icon"><i class="fas fa-clipboard-list"></i></div>
                     <p>Chargement des données...</p>
                </div>
            </div>
        `;

    } else {
        html += `
            <div class="content-section">
                <div class="section-header">
                    <h2 class="section-title">${titles[sectionName] || sectionName}</h2>
                </div>
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-code"></i>
                    </div>
                    <div class="empty-state-title">Section en construction</div>
                    <div class="empty-state-text">Le contenu pour ${titles[sectionName]} sera disponible bientôt.</div>
                </div>
            </div>
        `;
    }

    mainContent.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    displaySection('dashboard');

    // Toggle sidebar mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Navigation (classe .menu-link)
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (!section && this.getAttribute('href') !== '#') return; // Pour le logout

            document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            if (section) {
                displaySection(section);
                // Fermer sidebar en mobile après clic
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('open');
                }
            }
        });
    });
});