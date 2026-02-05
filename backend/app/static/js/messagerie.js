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
                    <h3>
                        <i class="fas fa-comments"></i> Messagerie
                    </h3>
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
                    <!-- Header Conversation - Professionnel -->
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
                    
                    <!-- Messages Container - Affichage uniquement -->
                    <div class="messages-container" id="messagesContainer">
                        <p class="text-center text-muted">Aucun message</p>
                    </div>
                    
                    <!-- SUPPRIMÉ: Zone d'envoi de messages -->
                    <!-- Les médecins envoient des messages via la modale "Nouveau Message" -->
                </div>
            </div>
        </div>
        
        <!-- Modal Nouveau Message - Pour envoyer -->
        <div class="modal fade" id="newMessageModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-paper-plane"></i> Nouveau Message
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="newMessageForm">
                            <div class="form-group mb-3">
                                <label class="form-label">
                                    <strong>Destinataire</strong>
                                    <span class="text-danger">*</span>
                                </label>
                                <select id="newMessagePatient" class="form-control" required>
                                    <option value="">Sélectionnez un patient...</option>
                                </select>
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label">
                                    <strong>Message</strong>
                                    <span class="text-danger">*</span>
                                </label>
                                <textarea id="newMessageContent" class="form-control" rows="6" placeholder="Écrivez votre message ici..." required></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                        <button type="button" class="btn btn-primary" onclick="submitNewMessage()">
                            <i class="fas fa-paper-plane"></i> Envoyer
                        </button>
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
        const container = document.getElementById('conversationsList');
        if (container) {
            container.innerHTML = '<p class="text-center text-danger p-3">Erreur chargement conversations</p>';
        }
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
        
        // Avatar professionnel avec initiales
        const initials = getInitials(conv.nom_complet);
        
        return `
            <div class="conversation-item ${classe}" 
                 data-patient-id="${conv.patient_id}"
                 onclick="openConversation(${conv.patient_id}, '${conv.nom_complet}', '${conv.email}')">
                <div class="conversation-avatar">
                    ${initials}
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
        messagerie.messagesActuels = data.messages || [];
        
        // Afficher le chat
        const emptyState = document.getElementById('emptyState');
        const chatContent = document.getElementById('chatContent');
        
        if (emptyState) emptyState.style.display = 'none';
        if (chatContent) chatContent.style.display = 'flex';
        
        // Remplir les infos du patient
        const initials = getInitials(patientName);
        document.getElementById('chatPatientName').textContent = patientName;
        document.getElementById('chatPatientEmail').textContent = patientEmail;
        document.getElementById('chatPatientAvatar').textContent = initials;
        
        // Afficher les messages
        displayMessages(messagerie.messagesActuels);
        
        // Mise à jour visuelle - marquer comme actif
        document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.querySelector(`[data-patient-id="${patientId}"]`);
        if (activeItem) activeItem.classList.add('active');
        
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
        
        // Sécuriser le contenu HTML
        const safeSubject = escapeHtml(msg.sujet || '');
        const safeContent = escapeHtml(msg.contenu || '');
        
        return `
            <div class="message-group ${fromClass}">
                <div class="message-bubble">
                    <div class="message-subject"><strong>${safeSubject}</strong></div>
                    <div class="message-content">${safeContent}</div>
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
    // Réinitialiser le formulaire
    const form = document.getElementById('newMessageForm');
    if (form) form.reset();
    
    const modal = new bootstrap.Modal(document.getElementById('newMessageModal'));
    modal.show();
}

function populatePatientsSelect() {
    const select = document.getElementById('newMessagePatient');
    if (!select) return;
    
    select.innerHTML = '<option value="">Sélectionnez un patient...</option>';
    
    if (messagerie.patients && messagerie.patients.length > 0) {
        messagerie.patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.nom_complet} (${patient.email})`;
            select.appendChild(option);
        });
    }
}

async function submitNewMessage() {
    const patientId = document.getElementById('newMessagePatient').value;
    const sujet = document.getElementById('newMessageSubject').value.trim();
    const contenu = document.getElementById('newMessageContent').value.trim();
    
    if (!patientId) {
        alert('⚠️ Veuillez sélectionner un patient');
        return;
    }
    
    if (!sujet) {
        alert('⚠️ Veuillez renseigner le sujet');
        return;
    }
    
    if (!contenu) {
        alert('⚠️ Veuillez écrire un message');
        return;
    }
    
    // Afficher le loading
    const submitBtn = event.target;
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    
    try {
        const formData = new FormData();
        formData.append('patient_id', patientId);
        formData.append('sujet', sujet);
        formData.append('contenu', contenu);
        
        const response = await fetch('/medecin/api/messagerie/send', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de l\'envoi');
        }
        
        const result = await response.json();
        
        // Succès
        alert('✅ Message envoyé avec succès!');
        
        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(document.getElementById('newMessageModal'));
        modal.hide();
        
        // Recharger les conversations
        await loadConversations();
        
        // Si le patient était déjà sélectionné, recharger ses messages
        const patient = messagerie.patients.find(p => p.id == patientId);
        if (messagerie.patientActuel?.id == patientId) {
            await openConversation(patientId, patient.nom_complet, patient.email);
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('❌ Erreur: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============= FERMETURE CHAT =============

function closeChat() {
    messagerie.patientActuel = null;
    messagerie.messagesActuels = [];
    
    const emptyState = document.getElementById('emptyState');
    const chatContent = document.getElementById('chatContent');
    
    if (emptyState) emptyState.style.display = 'flex';
    if (chatContent) chatContent.style.display = 'none';
    
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

// ============= FONCTIONS UTILITAIRES =============

function getInitials(nom_complet) {
    if (!nom_complet) return '?';
    const parts = nom_complet.split(' ').filter(p => p.length > 0);
    return (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
