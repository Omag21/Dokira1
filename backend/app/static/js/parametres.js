
// ============= VARIABLES GLOBALES =============
let currentPatientData = null;
let currentMedicalData = null;

// ============= AFFICHAGE DE LA SECTION PARAMÈTRES =============

async function showParametresInterface() {
    try {
        // Charger les données en parallèle
        const [basicInfoResponse, medicalInfoResponse] = await Promise.all([
        fetch('/api/patient/info').then(r => r.ok ? r.json() : null),
        fetch('/api/patient/medical-info').then(r => r.ok ? r.json() : null)  
        ]);
        
        if (!basicInfoResponse) {
            throw new Error('Impossible de charger les informations de base');
        }
        
        currentPatientData = basicInfoResponse;
        currentMedicalData = medicalInfoResponse || {};
        
        let html = `
            <div class="parametres-interface">
                <div class="section-header">
                    <h2 class="section-title">Paramètres</h2>
                </div>
                
                <!-- Tabs navigation -->
                <div class="parametres-tabs">
                    <button class="param-tab-btn active" data-tab="dossier-medical">
                        <i class="fas fa-file-medical"></i>
                        <span>Compléter votre dossier médical</span>
                    </button>
                    <button class="param-tab-btn" data-tab="compte-parametres">
                        <i class="fas fa-user-cog"></i>
                        <span>Modifier les paramètres du compte</span>
                    </button>
                </div>
                
                <!-- Content container -->
                <div class="parametres-content">
                    <!-- Tab 1: Dossier médical -->
                    <div id="dossier-medical" class="param-tab-content active">
                        ${renderDossierMedicalForm(currentMedicalData)}
                    </div>
                    
                    <!-- Tab 2: Paramètres du compte -->
                    <div id="compte-parametres" class="param-tab-content">
                        ${renderCompteParametresForm(currentPatientData)}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = html;
        
        // Initialiser les tabs
        initParametresTabs();
        
        // Initialiser les formulaires
        initDossierMedicalForm();
        initCompteParametresForm();
        
    } catch (error) {
        console.error('Erreur chargement paramètres:', error);
        showError('Impossible de charger les paramètres', error.message);
    }
}

// ============= RENDER FUNCTIONS =============

function renderDossierMedicalForm(medicalData) {
    const groupeSanguinOptions = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    return `
        <form id="dossierMedicalForm" class="parametres-form">
            <div class="form-section">
                <h3><i class="fas fa-heartbeat"></i> Informations Médicales Essentielles</h3>
                
                <div class="form-group">
                    <label for="groupeSanguin">Groupe sanguin</label>
                    <select id="groupeSanguin" class="form-control">
                        ${groupeSanguinOptions.map(opt => 
                            `<option value="${opt}" ${medicalData.groupe_sanguin === opt ? 'selected' : ''}>${opt || 'Sélectionner'}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="numeroSecuriteSociale">Numéro de sécurité sociale</label>
                    <input type="text" id="numeroSecuriteSociale" class="form-control" 
                           value="${medicalData.numero_securite_sociale || ''}" 
                           placeholder="Ex: 1 85 08 75 115 056 33">
                </div>
            </div>
            
            <div class="form-section">
                <h3><i class="fas fa-allergies"></i> Allergies et Antécédents</h3>
                
                <div class="form-group">
                    <label for="allergies">Allergies connues</label>
                    <textarea id="allergies" class="form-control" rows="3" 
                              placeholder="Listez vos allergies séparées par des virgules">${medicalData.allergies || ''}</textarea>
                    <small class="form-text">Ex: Pénicilline, Pollen, Arachides, Latex</small>
                </div>
                
                <div class="form-group">
                    <label for="antecedentsMedicaux">Antécédents médicaux personnels</label>
                    <textarea id="antecedentsMedicaux" class="form-control" rows="3" 
                              placeholder="Maladies chroniques, interventions chirurgicales, etc.">${medicalData.antecedents_medicaux || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="antecedentsFamiliaux">Antécédents familiaux</label>
                    <textarea id="antecedentsFamiliaux" class="form-control" rows="3" 
                              placeholder="Maladies héréditaires dans la famille">${medicalData.antecedents_familiaux || ''}</textarea>
                </div>
            </div>
            
            <div class="form-section">
                <h3><i class="fas fa-pills"></i> Traitements et Suivi</h3>
                
                <div class="form-group">
                    <label for="traitementsEnCours">Traitements en cours</label>
                    <textarea id="traitementsEnCours" class="form-control" rows="3" 
                              placeholder="Médicaments, doses, fréquences">${medicalData.traitements_en_cours || ''}</textarea>
                </div>
            </div>
            
            <div class="form-section">
                <h3><i class="fas fa-user-md"></i> Médecin Traitant</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="medecinTraitantNom">Nom du médecin traitant</label>
                        <input type="text" id="medecinTraitantNom" class="form-control" 
                               value="${medicalData.medecin_traitant_nom || ''}" 
                               placeholder="Nom et prénom du médecin">
                    </div>
                    <div class="form-group">
                        <label for="medecinTraitantTelephone">Téléphone</label>
                        <input type="tel" id="medecinTraitantTelephone" class="form-control" 
                               value="${medicalData.medecin_traitant_telephone || ''}" 
                               placeholder="Téléphone du cabinet">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3><i class="fas fa-shield-alt"></i> Assurance et Mutuelle</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="mutuelleNom">Nom de la mutuelle</label>
                        <input type="text" id="mutuelleNom" class="form-control" 
                               value="${medicalData.mutuelle_nom || ''}" 
                               placeholder="Nom de votre complémentaire santé">
                    </div>
                    <div class="form-group">
                        <label for="mutuelleNumero">Numéro d'adhérent</label>
                        <input type="text" id="mutuelleNumero" class="form-control" 
                               value="${medicalData.mutuelle_numero || ''}" 
                               placeholder="Votre numéro d'adhérent">
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Enregistrer le dossier médical
                </button>
                <button type="button" class="btn btn-secondary" onclick="showParametresInterface()">
                    <i class="fas fa-redo"></i> Actualiser
                </button>
            </div>
            
            <div class="form-info">
                <i class="fas fa-info-circle"></i>
                <span>Ces informations sont cruciales pour vos soins. Mettez-les à jour régulièrement.</span>
            </div>
        </form>
    `;
}

function renderCompteParametresForm(patientData) {
    return `
        <form id="compteParametresForm" class="parametres-form">
            <div class="form-section">
                <h3><i class="fas fa-user-circle"></i> Informations Personnelles</h3>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="paramNom">Nom *</label>
                        <input type="text" id="paramNom" class="form-control" 
                               value="${escapeHtml(patientData.nom || '')}" required>
                    </div>
                    <div class="form-group">
                        <label for="paramPrenom">Prénom *</label>
                        <input type="text" id="paramPrenom" class="form-control" 
                               value="${escapeHtml(patientData.prenom || '')}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="paramDateNaissance">Date de naissance *</label>
                        <input type="date" id="paramDateNaissance" class="form-control" 
                               value="${patientData.date_naissance || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="paramTelephone">Téléphone *</label>
                        <input type="tel" id="paramTelephone" class="form-control" 
                               value="${escapeHtml(patientData.telephone || '')}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="paramEmail">Email *</label>
                    <input type="email" id="paramEmail" class="form-control" 
                           value="${escapeHtml(patientData.email || '')}" required>
                </div>
                
                <div class="form-group">
                    <label for="paramAdresse">Adresse complète</label>
                    <textarea id="paramAdresse" class="form-control" rows="2">${escapeHtml(patientData.adresse || '')}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="paramVille">Ville</label>
                        <input type="text" id="paramVille" class="form-control" 
                               value="${escapeHtml(patientData.ville || '')}">
                    </div>
                    <div class="form-group">
                        <label for="paramCodePostal">Code postal</label>
                        <input type="text" id="paramCodePostal" class="form-control" 
                               value="${escapeHtml(patientData.code_postal || '')}">
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h3><i class="fas fa-lock"></i> Sécurité du Compte</h3>
                
                <div class="form-group">
                    <label for="paramMotDePasse">Nouveau mot de passe</label>
                    <input type="password" id="paramMotDePasse" class="form-control" 
                           placeholder="Laisser vide pour ne pas changer">
                    <small class="form-text">Minimum 8 caractères avec majuscule, minuscule et chiffre</small>
                </div>
                
                <div class="form-group">
                    <label for="paramConfirmationMotDePasse">Confirmer le mot de passe</label>
                    <input type="password" id="paramConfirmationMotDePasse" class="form-control" 
                           placeholder="Confirmez le nouveau mot de passe">
                </div>
            </div>
            
            <div class="form-section">
                <h3><i class="fas fa-bell"></i> Notifications</h3>
                
                <div class="checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="notificationsEmail" checked>
                        <span class="checkbox-custom"></span>
                        <span>Recevoir les notifications par email</span>
                    </label>
                    
                    <label class="checkbox-label">
                        <input type="checkbox" id="notificationsSMS" checked>
                        <span class="checkbox-custom"></span>
                        <span>Recevoir les notifications par SMS</span>
                    </label>
                </div>
            </div>
            
            <div class="form-section">
                <h3><i class="fas fa-globe"></i> Langue et Préférences</h3>
                
                <div class="form-group">
                    <label for="paramLangue">Langue d'affichage</label>
                    <select id="paramLangue" class="form-control">
                        <option value="fr" selected>Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                    </select>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Enregistrer les paramètres
                </button>
                <button type="button" class="btn btn-outline-danger" onclick="confirmDeleteAccount()">
                    <i class="fas fa-user-slash"></i> Supprimer le compte
                </button>
            </div>
            
            <div class="form-info">
                <i class="fas fa-exclamation-triangle"></i>
                <span>La suppression du compte est irréversible. Toutes vos données seront définitivement effacées.</span>
            </div>
        </form>
    `;
}

// ============= FORM INITIALIZATION =============

function initParametresTabs() {
    document.querySelectorAll('.param-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Mettre à jour les tabs
            document.querySelectorAll('.param-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.param-tab-content').forEach(t => t.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

function initDossierMedicalForm() {
    const form = document.getElementById('dossierMedicalForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveDossierMedical();
        });
    }
}

function initCompteParametresForm() {
    const form = document.getElementById('compteParametresForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveCompteParametres();
        });
    }
}

// ============= SAVE FUNCTIONS =============

async function saveDossierMedical() {
    try {
        const formData = {
            allergies: document.getElementById('allergies').value,
            antecedents_medicaux: document.getElementById('antecedentsMedicaux').value,
            antecedents_familiaux: document.getElementById('antecedentsFamiliaux').value,
            traitements_en_cours: document.getElementById('traitementsEnCours').value,
            groupe_sanguin: document.getElementById('groupeSanguin').value,
            numero_securite_sociale: document.getElementById('numeroSecuriteSociale').value,
            mutuelle_nom: document.getElementById('mutuelleNom').value,
            mutuelle_numero: document.getElementById('mutuelleNumero').value,
            medecin_traitant_nom: document.getElementById('medecinTraitantNom').value,
            medecin_traitant_telephone: document.getElementById('medecinTraitantTelephone').value
        };
        
        const response = await fetch('/api/patient/update-medical', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erreur lors de la mise à jour');
        }
        
        const result = await response.json();
        showSuccess(result.message || 'Dossier médical mis à jour avec succès');
        
        // Actualiser les données
        const medicalInfoResponse = await fetch('/api/patient/medical-info');
        if (medicalInfoResponse.ok) {
            currentMedicalData = await medicalInfoResponse.json();
        }
        
    } catch (error) {
        console.error('Erreur sauvegarde dossier médical:', error);
        showError('Erreur lors de la sauvegarde', error.message);
    }
}

async function saveCompteParametres() {
    try {
        const formData = {
            nom: document.getElementById('paramNom').value.trim(),
            prenom: document.getElementById('paramPrenom').value.trim(),
            date_naissance: document.getElementById('paramDateNaissance').value,
            telephone: document.getElementById('paramTelephone').value.trim(),
            email: document.getElementById('paramEmail').value.trim().toLowerCase(),
            adresse: document.getElementById('paramAdresse').value.trim(),
            ville: document.getElementById('paramVille').value.trim(),
            code_postal: document.getElementById('paramCodePostal').value.trim()
        };
        
        const motDePasse = document.getElementById('paramMotDePasse').value;
        const confirmation = document.getElementById('paramConfirmationMotDePasse').value;
        
        if (motDePasse) {
            if (motDePasse !== confirmation) {
                throw new Error('Les mots de passe ne correspondent pas');
            }
            if (motDePasse.length < 8) {
                throw new Error('Le mot de passe doit contenir au moins 8 caractères');
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
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erreur lors de la mise à jour');
        }
        
        const result = await response.json();
        showSuccess(result.message || 'Paramètres mis à jour avec succès');
        
        // Actualiser les données et l'affichage
        const basicInfoResponse = await fetch('/api/patient/info');
        if (basicInfoResponse.ok) {
            currentPatientData = await basicInfoResponse.json();
            await loadPatientData(); // Mettre à jour la barre de navigation
        }
        
    } catch (error) {
        console.error('Erreur sauvegarde paramètres:', error);
        showError('Erreur lors de la sauvegarde', error.message);
    }
}

// ============= UTILITY FUNCTIONS =============

function confirmDeleteAccount() {
    if (confirm('⚠️ Êtes-vous sûr de vouloir supprimer votre compte ?\n\nCette action est irréversible. Toutes vos données seront définitivement effacées.')) {
        deleteAccount();
    }
}

async function deleteAccount() {
    try {
        const response = await fetch('/api/patient/delete-account', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Compte supprimé avec succès. Redirection vers la page d\'accueil...');
            window.location.href = '/deconnexion';
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur suppression compte:', error);
        showError('Erreur lors de la suppression', error.message);
    }
}

function showSuccess(message) {
    // Créer une notification de succès
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Ajouter au début du contenu
    const content = document.querySelector('.parametres-content');
    if (content) {
        content.insertBefore(alertDiv, content.firstChild);
        
        // Auto-dismiss après 5 secondes
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

function showError(title, message) {
    alert(`${title}: ${message}`);
}

// ============= INITIALIZATION =============

// S'assurer que la fonction est disponible globalement
if (typeof displaySection === 'function') {
    // Rediriger l'appel vers showParametresInterface
    const originalDisplaySection = displaySection;
    window.displaySection = function(sectionName) {
        if (sectionName === 'parametres') {
            showParametresInterface();
        } else {
            originalDisplaySection(sectionName);
        }
    };
}


// Fonction pour charger et afficher les informations médicales
async function loadMedicalInfo() {
    try {
        const response = await fetch('/api/patient/medical-info');
        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.data) {
                const medicalData = data.data;
                
                // 1. Afficher les Allergies
                if (medicalData.allergies && medicalData.allergies.trim() !== '') {
                    document.getElementById('allergies-section').innerHTML = `
                        <div class="medical-info-card">
                            <h4>Allergies Connues</h4>
                            <p>${medicalData.allergies.replace(/\n/g, '<br>')}</p>
                            <span class="status-badge important">Important</span>
                        </div>
                    `;
                }
                
                // 2. Afficher les Antécédents
                if ((medicalData.antecedents_medicaux && medicalData.antecedents_medicaux.trim() !== '') || 
                    (medicalData.antecedents_familiaux && medicalData.antecedents_familiaux.trim() !== '')) {
                    
                    let antecedentsHTML = '';
                    
                    if (medicalData.antecedents_medicaux && medicalData.antecedents_medicaux.trim() !== '') {
                        antecedentsHTML += `<p><strong>Antécédents personnels :</strong><br>${medicalData.antecedents_medicaux.replace(/\n/g, '<br>')}</p>`;
                    }
                    
                    if (medicalData.antecedents_familiaux && medicalData.antecedents_familiaux.trim() !== '') {
                        antecedentsHTML += `<p><strong>Antécédents familiaux :</strong><br>${medicalData.antecedents_familiaux.replace(/\n/g, '<br>')}</p>`;
                    }
                    
                    document.getElementById('antecedents-section').innerHTML = `
                        <div class="medical-info-card">
                            <h4>Antécédents</h4>
                            ${antecedentsHTML}
                            <span class="status-badge warning">À surveiller</span>
                        </div>
                    `;
                }
                
                // 3. Afficher les Traitements en cours
                if (medicalData.traitements_en_cours && medicalData.traitements_en_cours.trim() !== '') {
                    document.getElementById('traitements-section').innerHTML = `
                        <div class="medical-info-card">
                            <h4>Traitements en cours</h4>
                            <p>${medicalData.traitements_en_cours.replace(/\n/g, '<br>')}</p>
                        </div>
                    `;
                }
                
                // 4. Afficher le Groupe Sanguin
                if (medicalData.groupe_sanguin && medicalData.groupe_sanguin.trim() !== '') {
                    document.getElementById('groupe-sanguin-section').innerHTML = `
                        <div class="medical-info-card">
                            <h4>Groupe Sanguin</h4>
                            <p class="blood-group">${medicalData.groupe_sanguin}</p>
                            <span class="status-badge emergency">Urgence</span>
                        </div>
                    `;
                }
                
                // 5. Afficher la Mutuelle
                if (medicalData.mutuelle_nom && medicalData.mutuelle_nom.trim() !== '') {
                    let mutuelleHTML = `<p><strong>${medicalData.mutuelle_nom}</strong></p>`;
                    if (medicalData.mutuelle_numero && medicalData.mutuelle_numero.trim() !== '') {
                        mutuelleHTML += `<p>N° adhérent : ${medicalData.mutuelle_numero}</p>`;
                    }
                    
                    document.getElementById('mutuelle-section').innerHTML = `
                        <div class="medical-info-card">
                            <h4>Couverture Santé</h4>
                            ${mutuelleHTML}
                        </div>
                    `;
                }
                
                // 6. Afficher le Médecin Traitant
                if (medicalData.medecin_traitant_nom && medicalData.medecin_traitant_nom.trim() !== '') {
                    let medecinHTML = `<p><strong>Dr ${medicalData.medecin_traitant_nom}</strong></p>`;
                    if (medicalData.medecin_traitant_telephone && medicalData.medecin_traitant_telephone.trim() !== '') {
                        medecinHTML += `<p>Tél : ${medicalData.medecin_traitant_telephone}</p>`;
                    }
                    
                    document.getElementById('medecin-section').innerHTML = `
                        <div class="medical-info-card">
                            <h4>Médecin Traitant</h4>
                            ${medecinHTML}
                        </div>
                    `;
                }
                
                // 7. Afficher le Numéro de Sécurité Sociale (optionnel - masqué partiellement)
                if (medicalData.numero_securite_sociale && medicalData.numero_securite_sociale.trim() !== '') {
                    const nss = medicalData.numero_securite_sociale;
                    const maskedNSS = nss.substring(0, 5) + '********' + nss.substring(nss.length - 4);
                    
                    document.getElementById('nss-section').innerHTML = `
                        <div class="medical-info-card">
                            <h4>Numéro de Sécurité Sociale</h4>
                            <p class="nss-number">${maskedNSS}</p>
                            <small>Masqué pour des raisons de sécurité</small>
                        </div>
                    `;
                }
            }
        }
    } catch (error) {
        console.error('Erreur chargement informations médicales:', error);
    }
}

// Appeler la fonction au chargement de la page
document.addEventListener('DOMContentLoaded', loadMedicalInfo);