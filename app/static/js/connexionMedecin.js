// ==================== INITIALISATION DU DOM ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Page de connexion médecin chargée');
    
    // Initialiser les composants
    initializePasswordToggle();
    initializeFormValidation();
    initializeErrorHandling();
    initializeFormSubmit();
});

// ==================== GESTION MOT DE PASSE ====================
function initializePasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (!togglePassword || !passwordInput) {
        console.warn('⚠️ Éléments mot de passe introuvables');
        return;
    }

    togglePassword.addEventListener('click', function(e) {
        e.preventDefault();
        
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        const icon = this.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        }
    });

    console.log('✅ Toggle mot de passe initialisé');
}

// ==================== GESTION DES ERREURS ====================
function initializeErrorHandling() {
    // Vérifier si une erreur est passée en paramètre URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error) {
        showError(decodeURIComponent(error));
    }

    console.log('✅ Gestion des erreurs initialisée');
}

function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!errorAlert || !errorMessage) {
        console.warn('⚠️ Éléments d\'alerte introuvables');
        return;
    }

    errorMessage.textContent = message;
    errorAlert.style.display = 'block';

    // Masquer l'erreur après 5 secondes
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

// ==================== VALIDATION DU FORMULAIRE ====================
function initializeFormValidation() {
    const inputs = document.querySelectorAll('.form-control');
    
    inputs.forEach(input => {
        // Animation au focus
        input.addEventListener('focus', function() {
            this.style.borderColor = 'var(--primary)';
        });

        // Validation au blur
        input.addEventListener('blur', function() {
            validateInput(this);
        });

        // Validation en temps réel
        input.addEventListener('input', function() {
            clearInputError(this);
        });
    });

    console.log('✅ Validation du formulaire initialisée');
}

function validateInput(input) {
    const value = input.value.trim();
    const type = input.getAttribute('type');

    if (!value) {
        showInputError(input, 'Ce champ est requis');
        return false;
    }

    if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showInputError(input, 'Email invalide');
            return false;
        }
    }

    if (type === 'password' && value.length < 6) {
        showInputError(input, 'Le mot de passe doit contenir au moins 6 caractères');
        return false;
    }

    clearInputError(input);
    return true;
}

function showInputError(input, message) {
    input.style.borderColor = '#ef4444';
    input.style.backgroundColor = '#ffe6e6';
}

function clearInputError(input) {
    input.style.borderColor = '#e0e0e0';
    input.style.backgroundColor = 'white';
}

// ==================== SOUMISSION FORMULAIRE ====================
function initializeFormSubmit() {
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        console.warn('⚠️ Formulaire introuvable');
        return;
    }

    loginForm.addEventListener('submit', function(e) {
        const email = document.getElementById('email');
        const password = document.getElementById('password');

        // Valider les champs
        const emailValid = validateInput(email);
        const passwordValid = validateInput(password);

        if (!emailValid || !passwordValid) {
            e.preventDefault();
            showError('Veuillez corriger les erreurs dans le formulaire');
            return false;
        }

        // Afficher le loader sur le bouton
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i><span>Connexion...</span>';
        }

        return true;
    });

    console.log('✅ Soumission formulaire initialisée');
}

// ==================== UTILITAIRES ====================
function trimInputs() {
    document.querySelectorAll('.form-control').forEach(input => {
        input.value = input.value.trim();
    });
}

// Trim les inputs au chargement
document.addEventListener('DOMContentLoaded', trimInputs);

// ==================== LOGS DEBUG ====================
console.log('📍 URL actuelle:', window.location.href);
console.log('🔐 Rôle utilisateur: Médecin');
console.log('📋 Formulaire action:', document.getElementById('loginForm')?.action || 'Introuvable');