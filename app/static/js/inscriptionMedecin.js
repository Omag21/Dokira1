// ==================== INITIALISATION ==================== 
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Page d\'inscription médecin chargée');
    
    initializePasswordToggle();
    initializeFormValidation();
    initializeFormSubmit();
});

// ==================== GESTION MOT DE PASSE ====================
function initializePasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const togglePasswordConfirm = document.getElementById('togglePasswordConfirm');
    const passwordConfirmInput = document.getElementById('password_confirm');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function(e) {
            e.preventDefault();
            togglePasswordVisibility(passwordInput, this);
        });
    }

    if (togglePasswordConfirm && passwordConfirmInput) {
        togglePasswordConfirm.addEventListener('click', function(e) {
            e.preventDefault();
            togglePasswordVisibility(passwordConfirmInput, this);
        });
    }

    console.log('✅ Toggle mot de passe initialisé');
}

function togglePasswordVisibility(inputElement, toggleButton) {
    const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
    inputElement.setAttribute('type', type);

    const icon = toggleButton.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }
}

// ==================== VALIDATION DU FORMULAIRE ====================
function initializeFormValidation() {
    const form = document.getElementById('registrationForm');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password_confirm');
    const acceptConditions = document.getElementById('acceptConditions');

    // Validation en temps réel
    if (password) {
        password.addEventListener('input', function() {
            validatePassword(this.value);
        });
    }

    if (passwordConfirm) {
        passwordConfirm.addEventListener('input', function() {
            validatePasswordMatch();
        });
    }

    if (acceptConditions) {
        acceptConditions.addEventListener('change', function() {
            clearConditionsError();
        });
    }

    console.log('✅ Validation du formulaire initialisée');
}

function validatePassword(password) {
    const passwordInput = document.getElementById('password');
    
    if (password.length < 8) {
        showInputError(passwordInput, 'Min. 8 caractères');
        return false;
    }

    // Vérifier la force du mot de passe
    if (!/[A-Z]/.test(password)) {
        showInputError(passwordInput, 'Au moins 1 majuscule');
        return false;
    }

    if (!/[0-9]/.test(password)) {
        showInputError(passwordInput, 'Au moins 1 chiffre');
        return false;
    }

    clearInputError(passwordInput);
    return true;
}

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password_confirm').value;

    if (password !== passwordConfirm) {
        showInputError(document.getElementById('password_confirm'), 'Les mots de passe ne correspondent pas');
        return false;
    }

    clearInputError(document.getElementById('password_confirm'));
    return true;
}

function showInputError(input, message) {
    input.style.borderColor = '#ef4444';
    input.style.backgroundColor = '#ffe6e6';
    
    // Afficher le message d'erreur sous l'input
    let errorMsg = input.parentElement.querySelector('.error-message');
    if (!errorMsg) {
        errorMsg = document.createElement('small');
        errorMsg.className = 'error-message text-danger';
        input.parentElement.appendChild(errorMsg);
    }
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

function clearInputError(input) {
    input.style.borderColor = '#e0e0e0';
    input.style.backgroundColor = 'white';
    
    const errorMsg = input.parentElement.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.style.display = 'none';
    }
}

function clearConditionsError() {
    const conditionsError = document.getElementById('conditionsError');
    if (conditionsError) {
        conditionsError.style.display = 'none';
    }
}

// ==================== SOUMISSION FORMULAIRE ====================
function initializeFormSubmit() {
    const form = document.getElementById('registrationForm');

    if (!form) {
        console.warn('⚠️ Formulaire introuvable');
        return;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validation globale
        if (!validateForm()) {
            return;
        }

        // Soumettre le formulaire
        submitForm();
    });

    console.log('✅ Soumission formulaire initialisée');
}

function validateForm() {
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password_confirm').value;
    const telephone = document.getElementById('telephone').value.trim();
    const specialite = document.getElementById('specialite').value;
    const acceptConditions = document.getElementById('acceptConditions').checked;

    // Validation des champs requis
    if (!prenom || !nom || !email || !password || !passwordConfirm || !telephone || !specialite) {
        showError('Veuillez remplir tous les champs requis');
        return false;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Adresse email invalide');
        return false;
    }

    // Validation mot de passe
    if (password.length < 8) {
        showError('Le mot de passe doit contenir au moins 8 caractères');
        return false;
    }

    if (!/[A-Z]/.test(password)) {
        showError('Le mot de passe doit contenir au moins 1 majuscule');
        return false;
    }

    if (!/[0-9]/.test(password)) {
        showError('Le mot de passe doit contenir au moins 1 chiffre');
        return false;
    }

    // Validation correspondance mots de passe ✅
    if (password !== passwordConfirm) {
        showError('Les mots de passe ne correspondent pas');
        return false;
    }

    // Validation conditions d'utilisation ✅
    if (!acceptConditions) {
        showError('Vous devez accepter les conditions d\'utilisation');
        document.getElementById('conditionsError').style.display = 'block';
        return false;
    }

    return true;
}

function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');

    if (errorAlert && errorMessage) {
        errorMessage.textContent = message;
        errorAlert.style.display = 'block';

        // Scroller vers l'alerte
        errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Masquer après 5 secondes
        setTimeout(() => {
            errorAlert.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successAlert = document.getElementById('successAlert');
    const successMessage = document.getElementById('successMessage');

    if (successAlert && successMessage) {
        successMessage.textContent = message;
        successAlert.style.display = 'block';

        // Scroller vers l'alerte
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ==================== SOUMISSION AU SERVEUR ====================
function submitForm() {
    const form = document.getElementById('registrationForm');
    const submitBtn = document.getElementById('submitBtn');

    // Désactiver le bouton
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i><span>Création en cours...</span>';
    }

    // ✅ Récupérer les données du formulaire en FormData
    const formData = new FormData(form);
    
    // ✅ Vérifier que accept_conditions est présent
    console.log('📋 Données envoyées:', Object.fromEntries(formData));

    // ✅ Envoyer au serveur avec FormData
    fetch(form.action, {
        method: 'POST',
        body: formData  // ✅ FormData, pas JSON !
    })
    .then(response => {
         if (response.redirected) {
            window.location.href = response.url;
          return;
        }
     
          else {
            // Gestion des erreurs
            return response.text().then(html => {
                console.error('❌ Erreur:', response.status);
                
                // Essayer d'extraire le message d'erreur du HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const errorElement = doc.querySelector('[data-error]');
                const errorMsg = errorElement ? errorElement.getAttribute('data-error') : 'Erreur lors de la création du compte';
                
                showError(errorMsg);
                
                // Réactiver le bouton
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>Créer mon compte</span>';
                }
            });
        }
    })
    .catch(error => {
        console.error('❌ Erreur réseau:', error);
        showError('Erreur de connexion au serveur');
        
        // Réactiver le bouton
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Créer mon compte</span>';
        }
    });
}

// ==================== LOGS DEBUG ====================
console.log('📍 URL actuelle:', window.location.href);
console.log('🔐 Rôle utilisateur: Médecin');
console.log('📋 Formulaire action:', document.getElementById('registrationForm')?.action || 'Introuvable');