// ==================== INITIALISATION DU DOM ====================
document.addEventListener('DOMContentLoaded', function () {
    initializePasswordToggle();
    initializeFormValidation();
    initializeErrorHandling();
    initializeFormSubmit();

    const roleOptions = document.querySelectorAll('.role-option');
    const roleInput = document.getElementById('roleInput');
    const loginForm = document.getElementById('loginForm');
    const createAccountLink = document.querySelector('.toggle-form a');
    const formTitle = document.querySelector('.form-title');

    function updateFormAction(role) {
        if (role === 'admin') {
            loginForm.action = '/admin/connexion';
            createAccountLink.style.display = 'block';
            createAccountLink.href = '/admin/inscriptionAdmin';
            if (formTitle) formTitle.textContent = 'Connexion Administrateur';
        } else {
            loginForm.action = '/medecin/connexion';
            createAccountLink.style.display = 'block';
            createAccountLink.href = '/medecin/inscriptionMedecin';
            if (formTitle) formTitle.textContent = 'Connexion Medecin';
        }
    }

    function selectRole(role) {
        roleOptions.forEach(opt => {
            const isActive = opt.getAttribute('data-role') === role;
            opt.classList.toggle('active', isActive);
        });

        if (roleInput) {
            roleInput.value = role;
        }

        updateFormAction(role);
    }

    roleOptions.forEach(option => {
        option.addEventListener('click', function () {
            const role = this.getAttribute('data-role');
            selectRole(role);
        });

        option.addEventListener('mouseenter', function () {
            const role = this.getAttribute('data-role');
            selectRole(role);
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const requestedRole = urlParams.get('role');
    if (requestedRole === 'admin') {
        selectRole('admin');
    } else {
        selectRole('medecin');
    }
});

// ==================== GESTION MOT DE PASSE ====================
function initializePasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (!togglePassword || !passwordInput) {
        return;
    }

    togglePassword.addEventListener('click', function (e) {
        e.preventDefault();

        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        const icon = this.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        }
    });
}

// ==================== GESTION DES ERREURS ====================
function initializeErrorHandling() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
        showError(decodeURIComponent(error));
    }
}

function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');

    if (!errorAlert || !errorMessage) {
        return;
    }

    errorMessage.textContent = message;
    errorAlert.style.display = 'block';

    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

// ==================== VALIDATION DU FORMULAIRE ====================
function initializeFormValidation() {
    const inputs = document.querySelectorAll('.form-control');

    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.style.borderColor = 'var(--primary)';
        });

        input.addEventListener('blur', function () {
            validateInput(this);
        });

        input.addEventListener('input', function () {
            clearInputError(this);
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    const type = input.getAttribute('type');

    if (!value) {
        showInputError(input);
        return false;
    }

    if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showInputError(input);
            return false;
        }
    }

    if (type === 'password' && value.length < 6) {
        showInputError(input);
        return false;
    }

    clearInputError(input);
    return true;
}

function showInputError(input) {
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
        return;
    }

    loginForm.addEventListener('submit', function (e) {
        const email = document.getElementById('email');
        const password = document.getElementById('password');

        const emailValid = validateInput(email);
        const passwordValid = validateInput(password);

        if (!emailValid || !passwordValid) {
            e.preventDefault();
            showError('Veuillez corriger les erreurs dans le formulaire');
            return false;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i><span>Connexion...</span>';
        }

        return true;
    });
}

// ==================== UTILITAIRES ====================
function trimInputs() {
    document.querySelectorAll('.form-control').forEach(input => {
        input.value = input.value.trim();
    });
}

document.addEventListener('DOMContentLoaded', trimInputs);
