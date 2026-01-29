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


