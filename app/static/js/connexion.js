// connexion.js - Script pour la gestion de l'authentification

document.addEventListener('DOMContentLoaded', function() {
    
    // ========== GESTION DES MOTS DE PASSE (VISIBILITÉ) ==========
    
    // Toggle pour le mot de passe de connexion
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }
    
    // Toggle pour le mot de passe d'inscription
    const togglePasswordConfirm = document.getElementById('togglePasswordConfirm');
    const passwordConfirmInput = document.getElementById('password_confirm');
    
    if (togglePasswordConfirm && passwordConfirmInput) {
        togglePasswordConfirm.addEventListener('click', function() {
            const type = passwordConfirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordConfirmInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (type === 'password') {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }
    
    
    // ========== VALIDATION DU FORMULAIRE D'INSCRIPTION ==========
    
    const inscriptionForm = document.getElementById('inscriptionForm');
    
    if (inscriptionForm) {
        inscriptionForm.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Vérifier que les mots de passe correspondent
            const password = document.getElementById('password');
            const passwordConfirm = document.getElementById('password_confirm');
            
            if (password && passwordConfirm) {
                if (password.value !== passwordConfirm.value) {
                    e.preventDefault();
                    isValid = false;
                    
                    // Afficher une erreur
                    passwordConfirm.classList.add('is-invalid');
                    
                    // Créer ou mettre à jour le message d'erreur
                    let errorDiv = passwordConfirm.nextElementSibling;
                    if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
                        errorDiv = document.createElement('div');
                        errorDiv.className = 'invalid-feedback';
                        passwordConfirm.parentNode.appendChild(errorDiv);
                    }
                    errorDiv.textContent = 'Les mots de passe ne correspondent pas';
                    errorDiv.style.display = 'block';
                    
                    // Supprimer l'erreur quand l'utilisateur tape
                    passwordConfirm.addEventListener('input', function() {
                        this.classList.remove('is-invalid');
                        if (errorDiv) {
                            errorDiv.style.display = 'none';
                        }
                    });
                }
            }
            
            // Vérifier la longueur du mot de passe
            if (password && password.value.length < 8) {
                e.preventDefault();
                isValid = false;
                
                password.classList.add('is-invalid');
                
                let errorDiv = password.nextElementSibling;
                if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'invalid-feedback';
                    password.parentNode.appendChild(errorDiv);
                }
                errorDiv.textContent = 'Le mot de passe doit contenir au moins 8 caractères';
                errorDiv.style.display = 'block';
                
                password.addEventListener('input', function() {
                    if (this.value.length >= 8) {
                        this.classList.remove('is-invalid');
                        if (errorDiv) {
                            errorDiv.style.display = 'none';
                        }
                    }
                });
            }
            
            // Vérifier l'email
            const email = document.getElementById('email');
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.value)) {
                    e.preventDefault();
                    isValid = false;
                    
                    email.classList.add('is-invalid');
                    
                    let errorDiv = email.nextElementSibling;
                    if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
                        errorDiv = document.createElement('div');
                        errorDiv.className = 'invalid-feedback';
                        email.parentNode.appendChild(errorDiv);
                    }
                    errorDiv.textContent = 'Veuillez entrer une adresse email valide';
                    errorDiv.style.display = 'block';
                    
                    email.addEventListener('input', function() {
                        if (emailRegex.test(this.value)) {
                            this.classList.remove('is-invalid');
                            if (errorDiv) {
                                errorDiv.style.display = 'none';
                            }
                        }
                    });
                }
            }
            
            // Vérifier le téléphone
            const telephone = document.getElementById('telephone');
            if (telephone) {
                const phoneRegex = /^[\d\s\+\-\(\)]+$/;
                if (!phoneRegex.test(telephone.value) || telephone.value.length < 10) {
                    e.preventDefault();
                    isValid = false;
                    
                    telephone.classList.add('is-invalid');
                    
                    let errorDiv = telephone.nextElementSibling;
                    if (!errorDiv || !errorDiv.classList.contains('invalid-feedback')) {
                        errorDiv = document.createElement('div');
                        errorDiv.className = 'invalid-feedback';
                        telephone.parentNode.appendChild(errorDiv);
                    }
                    errorDiv.textContent = 'Veuillez entrer un numéro de téléphone valide';
                    errorDiv.style.display = 'block';
                    
                    telephone.addEventListener('input', function() {
                        if (phoneRegex.test(this.value) && this.value.length >= 10) {
                            this.classList.remove('is-invalid');
                            if (errorDiv) {
                                errorDiv.style.display = 'none';
                            }
                        }
                    });
                }
            }
            
            // Si tout est valide, on peut soumettre
            if (isValid) {
                // Ajouter un indicateur de chargement
                const submitBtn = inscriptionForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Création du compte...';
                }
            }
        });
    }
    
    
    // ========== VALIDATION DU FORMULAIRE DE CONNEXION ==========
    
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            
            let isValid = true;
            
            // Vérifier l'email
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email.value)) {
                    e.preventDefault();
                    isValid = false;
                    email.classList.add('is-invalid');
                }
            }
            
            // Vérifier le mot de passe
            if (password && password.value.length < 1) {
                e.preventDefault();
                isValid = false;
                password.classList.add('is-invalid');
            }
            
            // Si tout est valide
            if (isValid) {
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Connexion...';
                }
            }
        });
    }
    
    
    // ========== ANIMATION DES CHAMPS ==========
    
    // Animation pour tous les inputs
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        // Enlever la classe invalid quand l'utilisateur commence à taper
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
        });
        
        // Animation focus
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    
    // ========== EFFETS VISUELS ==========
    
    // Animation d'entrée
    const formSection = document.querySelector('.form-section');
    const welcomeSection = document.querySelector('.welcome-section');
    
    if (formSection && welcomeSection) {
        setTimeout(() => {
            formSection.style.opacity = '1';
            formSection.style.transform = 'translateX(0)';
            welcomeSection.style.opacity = '1';
            welcomeSection.style.transform = 'translateX(0)';
        }, 100);
    }
    
    
    // ========== AUTO-FERMETURE DES ALERTES ==========
    
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        // Auto-fermer après 5 secondes
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });
    
    
    // ========== VALIDATION EN TEMPS RÉEL ==========
    
    // Validation email en temps réel
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    });
    
    // Validation mot de passe en temps réel
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        if (input.id === 'password') {
            input.addEventListener('input', function() {
                if (this.value.length > 0 && this.value.length < 8) {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }
            });
        }
    });
    
});