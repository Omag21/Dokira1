document.addEventListener('DOMContentLoaded', function() {
            // Éléments du DOM
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            const showSignupBtn = document.getElementById('showSignup');
            const showLoginBtn = document.getElementById('showLogin');
            const loginFormElement = document.getElementById('loginFormElement');
            const signupFormElement = document.getElementById('signupFormElement');
            const successAlert = document.getElementById('successAlert');
            const errorAlert = document.getElementById('errorAlert');
            
            // Toggle des mots de passe
            const toggleLoginPassword = document.getElementById('toggleLoginPassword');
            const toggleSignupPassword = document.getElementById('toggleSignupPassword');
            const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
            
            // Boutons de soumission
            const loginBtn = document.getElementById('loginBtn');
            const signupBtn = document.getElementById('signupBtn');
            
            // Loaders
            const loginLoader = document.getElementById('loginLoader');
            const signupLoader = document.getElementById('signupLoader');
            
            // Toggle entre login et signup
            showSignupBtn.addEventListener('click', function(e) {
                e.preventDefault();
                switchForm('signup');
            });
            
            showLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                switchForm('login');
            });
            
            // Fonction pour basculer entre les formulaires avec animation
            function switchForm(formToShow) {
                if (formToShow === 'signup') {
                    loginForm.classList.remove('form-active');
                    loginForm.classList.add('form-hidden');
                    
                    setTimeout(() => {
                        loginForm.style.display = 'none';
                        signupForm.style.display = 'block';
                        
                        setTimeout(() => {
                            signupForm.classList.remove('form-hidden');
                            signupForm.classList.add('form-active');
                        }, 50);
                    }, 300);
                    
                    // Afficher un message d'accueil
                    showAlert('success', 'Bienvenue ! Remplissez le formulaire pour créer votre compte professionnel.');
                } else {
                    signupForm.classList.remove('form-active');
                    signupForm.classList.add('form-hidden');
                    
                    setTimeout(() => {
                        signupForm.style.display = 'none';
                        loginForm.style.display = 'block';
                        
                        setTimeout(() => {
                            loginForm.classList.remove('form-hidden');
                            loginForm.classList.add('form-active');
                        }, 50);
                    }, 300);
                }
            }
            
            // Toggle visibilité mot de passe
            toggleLoginPassword.addEventListener('click', function() {
                togglePasswordVisibility('loginPassword', this);
            });
            
            toggleSignupPassword.addEventListener('click', function() {
                togglePasswordVisibility('signupPassword', this);
            });
            
            toggleConfirmPassword.addEventListener('click', function() {
                togglePasswordVisibility('confirmPassword', this);
            });
            
            function togglePasswordVisibility(inputId, button) {
                const input = document.getElementById(inputId);
                const icon = button.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
            
            // Validation des formulaires
            loginFormElement.addEventListener('submit', function(e) {
                e.preventDefault();
                if (validateLoginForm()) {
                    submitLoginForm();
                }
            });
            
            signupFormElement.addEventListener('submit', function(e) {
                e.preventDefault();
                if (validateSignupForm()) {
                    submitSignupForm();
                }
            });
            
            // Validation formulaire login
            function validateLoginForm() {
                let isValid = true;
                const email = document.getElementById('loginEmail');
                const password = document.getElementById('loginPassword');
                
                // Reset des erreurs
                resetValidation();
                
                // Validation email
                if (!email.value || !isValidEmail(email.value)) {
                    showFieldError('loginEmail', 'Veuillez entrer une adresse email valide');
                    isValid = false;
                }
                
                // Validation mot de passe
                if (!password.value) {
                    showFieldError('loginPassword', 'Le mot de passe est requis');
                    isValid = false;
                }
                
                return isValid;
            }
            
            // Validation formulaire signup
            function validateSignupForm() {
                let isValid = true;
                
                // Reset des erreurs
                resetValidation();
                
                // Validation prénom
                const firstName = document.getElementById('firstName');
                if (!firstName.value.trim()) {
                    showFieldError('firstName', 'Le prénom est requis');
                    isValid = false;
                }
                
                // Validation nom
                const lastName = document.getElementById('lastName');
                if (!lastName.value.trim()) {
                    showFieldError('lastName', 'Le nom est requis');
                    isValid = false;
                }
                
                // Validation email
                const email = document.getElementById('signupEmail');
                if (!email.value || !isValidEmail(email.value)) {
                    showFieldError('signupEmail', 'Veuillez entrer une adresse email valide');
                    isValid = false;
                }
                
                // Validation téléphone
                const phone = document.getElementById('phone');
                if (!phone.value.trim()) {
                    showFieldError('phone', 'Le numéro de téléphone est requis');
                    isValid = false;
                }
                
                // Validation ville
                const city = document.getElementById('city');
                if (!city.value.trim()) {
                    showFieldError('city', 'La ville est requise');
                    isValid = false;
                }
                
                // Validation pays
                const country = document.getElementById('country');
                if (!country.value) {
                    showFieldError('country', 'Veuillez sélectionner votre pays');
                    isValid = false;
                }
                
                // Validation mot de passe
                const password = document.getElementById('signupPassword');
                if (!password.value || password.value.length < 8) {
                    showFieldError('signupPassword', 'Le mot de passe doit contenir au moins 8 caractères');
                    isValid = false;
                }
                
                // Validation confirmation mot de passe
                const confirmPassword = document.getElementById('confirmPassword');
                if (password.value !== confirmPassword.value) {
                    showFieldError('confirmPassword', 'Les mots de passe ne correspondent pas');
                    isValid = false;
                }
                
                // Validation conditions
                const acceptTerms = document.getElementById('acceptTerms');
                if (!acceptTerms.checked) {
                    showFieldError('acceptTerms', 'Vous devez accepter les conditions');
                    isValid = false;
                }
                
                // Validation professionnel
                const professionalCheck = document.getElementById('professionalCheck');
                if (!professionalCheck.checked) {
                    showFieldError('professionalCheck', 'Cette plateforme est réservée aux professionnels de santé');
                    isValid = false;
                }
                
                return isValid;
            }
            
            // Afficher une erreur de champ
            function showFieldError(fieldId, message) {
                const field = document.getElementById(fieldId);
                const errorElement = document.getElementById(fieldId + 'Error');
                
                field.classList.add('is-invalid');
                if (errorElement) {
                    errorElement.textContent = message;
                    errorElement.style.display = 'block';
                }
            }
            
            // Réinitialiser la validation
            function resetValidation() {
                // Supprimer les classes d'erreur
                document.querySelectorAll('.is-invalid').forEach(el => {
                    el.classList.remove('is-invalid');
                });
                
                // Cacher les messages d'erreur
                document.querySelectorAll('.invalid-feedback').forEach(el => {
                    el.style.display = 'none';
                });
                
                // Cacher les alertes
                successAlert.style.display = 'none';
                errorAlert.style.display = 'none';
            }
            
            // Vérifier si email est valide
            function isValidEmail(email) {
                const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return re.test(email);
            }
            
            // Soumission formulaire login (simulation)
            function submitLoginForm() {
                showLoader('login');
                
                // Simulation d'une requête API
                setTimeout(() => {
                    hideLoader('login');
                    
                    // Dans un cas réel, vous vérifieriez les identifiants
                    const email = document.getElementById('loginEmail').value;
                    const password = document.getElementById('loginPassword').value;
                    
                    // Simulation de connexion réussie
                    if (email && password) {
                        showAlert('success', 'Connexion réussie ! Redirection en cours...');
                        
                        // Redirection vers le tableau de bord
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 2000);
                    } else {
                        showAlert('error', 'Email ou mot de passe incorrect');
                    }
                }, 1500);
            }
            
            // Soumission formulaire signup (simulation)
            function submitSignupForm() {
                showLoader('signup');
                
                // Simulation d'une requête API
                setTimeout(() => {
                    hideLoader('signup');
                    
                    // Récupération des données
                    const userData = {
                        firstName: document.getElementById('firstName').value,
                        lastName: document.getElementById('lastName').value,
                        email: document.getElementById('signupEmail').value,
                        phone: document.getElementById('phone').value,
                        city: document.getElementById('city').value,
                        country: document.getElementById('country').value
                    };
                    
                    // Simulation d'inscription réussie
                    showAlert('success', 
                        `Compte créé avec succès, Dr. ${userData.firstName} ${userData.lastName}! 
                        Un email de confirmation vous a été envoyé à ${userData.email}.`);
                    
                    // Réinitialiser le formulaire
                    signupFormElement.reset();
                    
                    // Revenir au formulaire de connexion après 3 secondes
                    setTimeout(() => {
                        switchForm('login');
                    }, 3000);
                }, 2000);
            }
            
            // Afficher/cacher le loader
            function showLoader(formType) {
                if (formType === 'login') {
                    document.getElementById('loginBtnText').style.display = 'none';
                    loginLoader.style.display = 'block';
                    loginBtn.disabled = true;
                } else {
                    document.getElementById('signupBtnText').style.display = 'none';
                    signupLoader.style.display = 'block';
                    signupBtn.disabled = true;
                }
            }
            
            function hideLoader(formType) {
                if (formType === 'login') {
                    document.getElementById('loginBtnText').style.display = 'inline';
                    loginLoader.style.display = 'none';
                    loginBtn.disabled = false;
                } else {
                    document.getElementById('signupBtnText').style.display = 'inline';
                    signupLoader.style.display = 'none';
                    signupBtn.disabled = false;
                }
            }
            
            // Afficher une alerte
            function showAlert(type, message) {
                if (type === 'success') {
                    document.getElementById('successMessage').textContent = message;
                    successAlert.style.display = 'block';
                    errorAlert.style.display = 'none';
                } else {
                    document.getElementById('errorMessage').textContent = message;
                    errorAlert.style.display = 'block';
                    successAlert.style.display = 'none';
                }
                
                // Cacher l'alerte après 5 secondes
                setTimeout(() => {
                    if (type === 'success') {
                        successAlert.style.display = 'none';
                    } else {
                        errorAlert.style.display = 'none';
                    }
                }, 5000);
            }
            
            // Animation d'entrée initiale
            setTimeout(() => {
                loginForm.classList.add('form-active');
            }, 100);
        });