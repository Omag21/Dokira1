/**
 * Dokira i18n - Système de traduction professionnel
 * Supporte : Français (fr), Anglais (en), Espagnol (es)
 * Persistance : localStorage sous la clé "dokira_lang"
 */

const DOKIRA_TRANSLATIONS = {
    fr: {
        /* ===== NAVIGATION COMMUNE ===== */
        nav_home: "Accueil",
        nav_features: "Fonctionnalités",
        nav_stats: "Statistiques",
        nav_testimonials: "Témoignages",
        nav_contact: "Contact",
        nav_login: "Connexion",
        nav_register: "Inscription",
        nav_download: "Télécharger l'application",
        nav_logout: "Déconnexion",

        /* ===== PAGE D'ACCUEIL - HERO ===== */
        hero_title: "Bienvenue sur Dokira",
        hero_subtitle: "Consultez un spécialiste de santé sans se déplacer.",
        hero_search_placeholder: "Taper ici pour rechercher...",
        hero_search_btn: "Rechercher",
        hero_rdv_btn: "Prendre un rendez-vous",
        hero_lab: "Réservez un test laboratoire",

        /* ===== PAGE D'ACCUEIL - SECTIONS ===== */
        features_title: "Fonctionnalités",
        features_subtitle: "Découvrez comment Dokira peut transformer votre pratique médicale.",
        feat_patients: "Gestion des Patients",
        feat_patients_desc: "Dossiers médicaux centralisés.",
        feat_teleconsult: "Téléconsultations",
        feat_teleconsult_desc: "Consultations en ligne sécurisées.",
        feat_prescriptions: "Prescriptions Électroniques",
        feat_prescriptions_desc: "Générez et envoyez des prescriptions numériques.",
        feat_planning: "Planification des Rendez-vous",
        feat_planning_desc: "Organisez facilement vos consultations.",
        feat_stats: "Suivi des Statistiques",
        feat_stats_desc: "Analysez les performances de votre pratique.",
        feat_security: "Sécurité des Données",
        feat_security_desc: "Protection avancée des informations patients.",
        learn_more: "En savoir plus",

        specialists_title: "Nos Spécialistes",
        specialists_subtitle: "Une équipe médicale qualifiée à votre service.",

        stats_title: "Statistiques Clés",
        stats_patients: "Patients Gérés",
        stats_professionals: "Professionnels de Santé",
        stats_consultations: "Consultations Réalisées",
        stats_satisfaction: "% de satisfaction",

        testimonials_title: "Témoignages",
        testimonials_subtitle: "Ce que nos utilisateurs disent de Dokira",
        testimonial_name_label: "Votre nom",
        testimonial_role_label: "Votre rôle",
        testimonial_note_label: "Votre note",
        testimonial_content_label: "Votre commentaire",
        testimonial_submit: "Envoyer",
        testimonial_opinion: "Votre avis nous intéresse",

        partners_title: "Nos Partenaires",

        newsletter_title: "Abonnez-vous à notre Newsletter",
        newsletter_subtitle: "Restez informé des dernières nouveautés et offres de Dokira.",
        newsletter_name_placeholder: "Votre nom",
        newsletter_email_placeholder: "Entrez votre email",
        newsletter_btn: "S'abonner",

        /* ===== CONNEXION ===== */
        login_welcome_title: "Bienvenue sur Dokira",
        login_welcome_text: "La plateforme eSanté dédiée aux patients et aux professionnels de santé.",
        login_feature1: "Conforme RGPD et certifications santé",
        login_feature2: "Téléconsultation HD sécurisée",
        login_feature3: "Dossiers patients complets",
        login_feature4: "Gain de temps administratif",
        login_encrypted: "Toutes les données sont chiffrées et hébergées au Gabon",
        login_title: "Connexion",
        login_subtitle: "Accédez à votre espace personnel",
        login_role_patient: "Patient",
        login_role_doctor: "Médecin",
        login_email_label: "Email",
        login_email_placeholder: "votre.email@exemple.com",
        login_password_label: "Mot de passe",
        login_password_placeholder: "Votre mot de passe",
        login_remember: "Se souvenir de moi",
        login_forgot: "Mot de passe oublié ?",
        login_btn: "Se connecter",
        login_no_account: "Pas encore de compte ?",
        login_register_link: "Créer un compte",

        /* ===== INSCRIPTION PATIENT ===== */
        register_title: "Créer un compte",
        register_subtitle: "Rejoignez la communauté Dokira",
        register_firstname: "Prénom",
        register_lastname: "Nom",
        register_email: "Email",
        register_birthdate: "Date de naissance",
        register_gender: "Genre",
        register_gender_male: "Homme",
        register_gender_female: "Femme",
        register_gender_other: "Autre",
        register_phone: "Téléphone",
        register_address: "Adresse",
        register_address_placeholder: "Numéro et nom de rue",
        register_city: "Ville",
        register_postal: "Code postal",
        register_password: "Mot de passe",
        register_confirm_password: "Confirmer le mot de passe",
        register_terms: "J'accepte les conditions d'utilisation",
        register_btn: "Créer mon compte",
        register_have_account: "Déjà un compte ?",
        register_login_link: "Se connecter",

        /* ===== INSCRIPTION MÉDECIN ===== */
        register_doctor_title: "Inscription Médecin",
        register_specialite: "Spécialité",
        register_numero_ordre: "Numéro d'ordre",
        register_annees_exp: "Années d'expérience",
        register_langues: "Langues parlées",
        register_biographie: "Biographie",
        register_adresse_cabinet: "Adresse du cabinet",

        /* ===== INTERFACE MÉDECIN ===== */
        medecin_dashboard: "Tableau de Bord",
        medecin_patients: "Mes Patients",
        medecin_rdv: "Mes Rendez-vous",
        medecin_dossiers: "Dossiers Médicaux",
        medecin_ordonnances: "Ordonnances",
        medecin_analyses: "Analyses",
        medecin_messagerie: "Messagerie",
        medecin_visio: "Visioconférences",
        medecin_chat_ia: "Chat IA",
        medecin_historique: "Historique",
        medecin_profil: "Mon Profil",
        medecin_calendrier: "Calendrier",
        medecin_aide: "Aide & Support",
        medecin_parametres: "Paramètres",
        medecin_bonjour: "Bonjour",
        medecin_welcome: "Bienvenue dans votre espace médecin Dokira",
        medecin_search: "Rechercher un patient, un dossier...",

        /* ===== INTERFACE PATIENT ===== */
        patient_dashboard: "Tableau de Bord",
        patient_rdv: "Mes Rendez-vous",
        patient_dossier: "Mon Dossier",
        patient_messagerie: "Messagerie",
        patient_profil: "Mon Profil",
        patient_parametres: "Paramètres",

        /* ===== INTERFACE ADMIN ===== */
        admin_dashboard: "Tableau de Bord",
        admin_medecins: "Médecins",
        admin_patients: "Patients",
        admin_rdv: "Rendez-vous",
        admin_rapports: "Rapports",
        admin_parametres: "Paramètres",

        /* ===== BOUTONS COMMUNS ===== */
        btn_save: "Sauvegarder",
        btn_cancel: "Annuler",
        btn_confirm: "Confirmer",
        btn_delete: "Supprimer",
        btn_edit: "Modifier",
        btn_add: "Ajouter",
        btn_close: "Fermer",
        btn_send: "Envoyer",
        btn_search: "Rechercher",
        btn_back: "Retour",

        /* ===== MESSAGES ===== */
        msg_loading: "Chargement...",
        msg_error: "Une erreur est survenue",
        msg_success: "Opération réussie",
        msg_no_data: "Aucune donnée disponible",
    },

    en: {
        /* ===== NAVIGATION ===== */
        nav_home: "Home",
        nav_features: "Features",
        nav_stats: "Statistics",
        nav_testimonials: "Testimonials",
        nav_contact: "Contact",
        nav_login: "Login",
        nav_register: "Register",
        nav_download: "Download the app",
        nav_logout: "Logout",

        /* ===== HOMEPAGE - HERO ===== */
        hero_title: "Welcome to Dokira",
        hero_subtitle: "Consult a health specialist without traveling.",
        hero_search_placeholder: "Type here to search...",
        hero_search_btn: "Search",
        hero_rdv_btn: "Book an appointment",
        hero_lab: "Book a laboratory test",

        /* ===== HOMEPAGE - SECTIONS ===== */
        features_title: "Features",
        features_subtitle: "Discover how Dokira can transform your medical practice.",
        feat_patients: "Patient Management",
        feat_patients_desc: "Centralized medical records.",
        feat_teleconsult: "Teleconsultations",
        feat_teleconsult_desc: "Secure online consultations.",
        feat_prescriptions: "Electronic Prescriptions",
        feat_prescriptions_desc: "Generate and send digital prescriptions.",
        feat_planning: "Appointment Scheduling",
        feat_planning_desc: "Easily organize your consultations.",
        feat_stats: "Statistics Tracking",
        feat_stats_desc: "Analyze your practice performance.",
        feat_security: "Data Security",
        feat_security_desc: "Advanced patient information protection.",
        learn_more: "Learn more",

        specialists_title: "Our Specialists",
        specialists_subtitle: "A qualified medical team at your service.",

        stats_title: "Key Statistics",
        stats_patients: "Patients Managed",
        stats_professionals: "Healthcare Professionals",
        stats_consultations: "Consultations Performed",
        stats_satisfaction: "% Satisfaction",

        testimonials_title: "Testimonials",
        testimonials_subtitle: "What our users say about Dokira",
        testimonial_name_label: "Your name",
        testimonial_role_label: "Your role",
        testimonial_note_label: "Your rating",
        testimonial_content_label: "Your comment",
        testimonial_submit: "Submit",
        testimonial_opinion: "We value your opinion",

        partners_title: "Our Partners",

        newsletter_title: "Subscribe to our Newsletter",
        newsletter_subtitle: "Stay informed about the latest news and offers from Dokira.",
        newsletter_name_placeholder: "Your name",
        newsletter_email_placeholder: "Enter your email",
        newsletter_btn: "Subscribe",

        /* ===== LOGIN ===== */
        login_welcome_title: "Welcome to Dokira",
        login_welcome_text: "The eHealth platform dedicated to patients and healthcare professionals.",
        login_feature1: "GDPR compliant and health certifications",
        login_feature2: "Secure HD teleconsultation",
        login_feature3: "Complete patient records",
        login_feature4: "Administrative time savings",
        login_encrypted: "All data is encrypted and hosted in Gabon",
        login_title: "Login",
        login_subtitle: "Access your personal space",
        login_role_patient: "Patient",
        login_role_doctor: "Doctor",
        login_email_label: "Email",
        login_email_placeholder: "your.email@example.com",
        login_password_label: "Password",
        login_password_placeholder: "Your password",
        login_remember: "Remember me",
        login_forgot: "Forgot your password?",
        login_btn: "Sign in",
        login_no_account: "No account yet?",
        login_register_link: "Create an account",

        /* ===== PATIENT REGISTRATION ===== */
        register_title: "Create an account",
        register_subtitle: "Join the Dokira community",
        register_firstname: "First Name",
        register_lastname: "Last Name",
        register_email: "Email",
        register_birthdate: "Date of birth",
        register_gender: "Gender",
        register_gender_male: "Male",
        register_gender_female: "Female",
        register_gender_other: "Other",
        register_phone: "Phone",
        register_address: "Address",
        register_address_placeholder: "Street number and name",
        register_city: "City",
        register_postal: "Postal code",
        register_password: "Password",
        register_confirm_password: "Confirm password",
        register_terms: "I accept the terms of use",
        register_btn: "Create my account",
        register_have_account: "Already have an account?",
        register_login_link: "Sign in",

        /* ===== DOCTOR REGISTRATION ===== */
        register_doctor_title: "Doctor Registration",
        register_specialite: "Specialty",
        register_numero_ordre: "Order number",
        register_annees_exp: "Years of experience",
        register_langues: "Languages spoken",
        register_biographie: "Biography",
        register_adresse_cabinet: "Office address",

        /* ===== DOCTOR INTERFACE ===== */
        medecin_dashboard: "Dashboard",
        medecin_patients: "My Patients",
        medecin_rdv: "My Appointments",
        medecin_dossiers: "Medical Records",
        medecin_ordonnances: "Prescriptions",
        medecin_analyses: "Analyses",
        medecin_messagerie: "Messaging",
        medecin_visio: "Video Consultations",
        medecin_chat_ia: "AI Chat",
        medecin_historique: "History",
        medecin_profil: "My Profile",
        medecin_calendrier: "Calendar",
        medecin_aide: "Help & Support",
        medecin_parametres: "Settings",
        medecin_bonjour: "Hello",
        medecin_welcome: "Welcome to your Dokira medical space",
        medecin_search: "Search for a patient, file...",

        /* ===== PATIENT INTERFACE ===== */
        patient_dashboard: "Dashboard",
        patient_rdv: "My Appointments",
        patient_dossier: "My File",
        patient_messagerie: "Messaging",
        patient_profil: "My Profile",
        patient_parametres: "Settings",

        /* ===== ADMIN INTERFACE ===== */
        admin_dashboard: "Dashboard",
        admin_medecins: "Doctors",
        admin_patients: "Patients",
        admin_rdv: "Appointments",
        admin_rapports: "Reports",
        admin_parametres: "Settings",

        /* ===== COMMON BUTTONS ===== */
        btn_save: "Save",
        btn_cancel: "Cancel",
        btn_confirm: "Confirm",
        btn_delete: "Delete",
        btn_edit: "Edit",
        btn_add: "Add",
        btn_close: "Close",
        btn_send: "Send",
        btn_search: "Search",
        btn_back: "Back",

        /* ===== MESSAGES ===== */
        msg_loading: "Loading...",
        msg_error: "An error occurred",
        msg_success: "Operation successful",
        msg_no_data: "No data available",
    },

    es: {
        /* ===== NAVEGACIÓN ===== */
        nav_home: "Inicio",
        nav_features: "Funcionalidades",
        nav_stats: "Estadísticas",
        nav_testimonials: "Testimonios",
        nav_contact: "Contacto",
        nav_login: "Iniciar sesión",
        nav_register: "Registrarse",
        nav_download: "Descargar la aplicación",
        nav_logout: "Cerrar sesión",

        /* ===== PÁGINA DE INICIO - HERO ===== */
        hero_title: "Bienvenido a Dokira",
        hero_subtitle: "Consulte a un especialista de salud sin desplazarse.",
        hero_search_placeholder: "Escriba aquí para buscar...",
        hero_search_btn: "Buscar",
        hero_rdv_btn: "Reservar una cita",
        hero_lab: "Reserve una prueba de laboratorio",

        /* ===== SECCIONES ===== */
        features_title: "Funcionalidades",
        features_subtitle: "Descubra cómo Dokira puede transformar su práctica médica.",
        feat_patients: "Gestión de Pacientes",
        feat_patients_desc: "Expedientes médicos centralizados.",
        feat_teleconsult: "Teleconsultas",
        feat_teleconsult_desc: "Consultas en línea seguras.",
        feat_prescriptions: "Prescripciones Electrónicas",
        feat_prescriptions_desc: "Genere y envíe prescripciones digitales.",
        feat_planning: "Planificación de Citas",
        feat_planning_desc: "Organice fácilmente sus consultas.",
        feat_stats: "Seguimiento de Estadísticas",
        feat_stats_desc: "Analice el rendimiento de su práctica.",
        feat_security: "Seguridad de Datos",
        feat_security_desc: "Protección avanzada de información de pacientes.",
        learn_more: "Saber más",

        specialists_title: "Nuestros Especialistas",
        specialists_subtitle: "Un equipo médico calificado a su servicio.",

        stats_title: "Estadísticas Clave",
        stats_patients: "Pacientes Gestionados",
        stats_professionals: "Profesionales de Salud",
        stats_consultations: "Consultas Realizadas",
        stats_satisfaction: "% de satisfacción",

        testimonials_title: "Testimonios",
        testimonials_subtitle: "Lo que nuestros usuarios dicen de Dokira",
        testimonial_name_label: "Su nombre",
        testimonial_role_label: "Su rol",
        testimonial_note_label: "Su calificación",
        testimonial_content_label: "Su comentario",
        testimonial_submit: "Enviar",
        testimonial_opinion: "Su opinión nos importa",

        partners_title: "Nuestros Socios",

        newsletter_title: "Suscríbase a nuestro boletín",
        newsletter_subtitle: "Manténgase informado de las últimas novedades y ofertas de Dokira.",
        newsletter_name_placeholder: "Su nombre",
        newsletter_email_placeholder: "Ingrese su correo",
        newsletter_btn: "Suscribirse",

        /* ===== INICIO DE SESIÓN ===== */
        login_welcome_title: "Bienvenido a Dokira",
        login_welcome_text: "La plataforma eSalud dedicada a pacientes y profesionales de salud.",
        login_feature1: "Conforme con GDPR y certificaciones de salud",
        login_feature2: "Teleconsulta HD segura",
        login_feature3: "Expedientes de pacientes completos",
        login_feature4: "Ahorro de tiempo administrativo",
        login_encrypted: "Todos los datos están encriptados y alojados en Gabón",
        login_title: "Iniciar sesión",
        login_subtitle: "Acceda a su espacio personal",
        login_role_patient: "Paciente",
        login_role_doctor: "Médico",
        login_email_label: "Correo electrónico",
        login_email_placeholder: "su.correo@ejemplo.com",
        login_password_label: "Contraseña",
        login_password_placeholder: "Su contraseña",
        login_remember: "Recordarme",
        login_forgot: "¿Olvidó su contraseña?",
        login_btn: "Iniciar sesión",
        login_no_account: "¿No tiene cuenta aún?",
        login_register_link: "Crear una cuenta",

        /* ===== REGISTRO PACIENTE ===== */
        register_title: "Crear una cuenta",
        register_subtitle: "Únase a la comunidad Dokira",
        register_firstname: "Nombre",
        register_lastname: "Apellido",
        register_email: "Correo electrónico",
        register_birthdate: "Fecha de nacimiento",
        register_gender: "Género",
        register_gender_male: "Hombre",
        register_gender_female: "Mujer",
        register_gender_other: "Otro",
        register_phone: "Teléfono",
        register_address: "Dirección",
        register_address_placeholder: "Número y nombre de calle",
        register_city: "Ciudad",
        register_postal: "Código postal",
        register_password: "Contraseña",
        register_confirm_password: "Confirmar contraseña",
        register_terms: "Acepto los términos de uso",
        register_btn: "Crear mi cuenta",
        register_have_account: "¿Ya tiene una cuenta?",
        register_login_link: "Iniciar sesión",

        /* ===== REGISTRO MÉDICO ===== */
        register_doctor_title: "Registro Médico",
        register_specialite: "Especialidad",
        register_numero_ordre: "Número de colegio",
        register_annees_exp: "Años de experiencia",
        register_langues: "Idiomas hablados",
        register_biographie: "Biografía",
        register_adresse_cabinet: "Dirección del consultorio",

        /* ===== INTERFAZ MÉDICO ===== */
        medecin_dashboard: "Panel de Control",
        medecin_patients: "Mis Pacientes",
        medecin_rdv: "Mis Citas",
        medecin_dossiers: "Expedientes Médicos",
        medecin_ordonnances: "Recetas",
        medecin_analyses: "Análisis",
        medecin_messagerie: "Mensajería",
        medecin_visio: "Videoconsultas",
        medecin_chat_ia: "Chat IA",
        medecin_historique: "Historial",
        medecin_profil: "Mi Perfil",
        medecin_calendrier: "Calendario",
        medecin_aide: "Ayuda & Soporte",
        medecin_parametres: "Configuración",
        medecin_bonjour: "Hola",
        medecin_welcome: "Bienvenido a su espacio médico Dokira",
        medecin_search: "Buscar un paciente, expediente...",

        /* ===== INTERFAZ PACIENTE ===== */
        patient_dashboard: "Panel de Control",
        patient_rdv: "Mis Citas",
        patient_dossier: "Mi Expediente",
        patient_messagerie: "Mensajería",
        patient_profil: "Mi Perfil",
        patient_parametres: "Configuración",

        /* ===== INTERFAZ ADMIN ===== */
        admin_dashboard: "Panel de Control",
        admin_medecins: "Médicos",
        admin_patients: "Pacientes",
        admin_rdv: "Citas",
        admin_rapports: "Informes",
        admin_parametres: "Configuración",

        /* ===== BOTONES COMUNES ===== */
        btn_save: "Guardar",
        btn_cancel: "Cancelar",
        btn_confirm: "Confirmar",
        btn_delete: "Eliminar",
        btn_edit: "Editar",
        btn_add: "Añadir",
        btn_close: "Cerrar",
        btn_send: "Enviar",
        btn_search: "Buscar",
        btn_back: "Volver",

        /* ===== MENSAJES ===== */
        msg_loading: "Cargando...",
        msg_error: "Ha ocurrido un error",
        msg_success: "Operación exitosa",
        msg_no_data: "No hay datos disponibles",
    }
};

/* ============================================================
   MOTEUR DE TRADUCTION
============================================================ */

const DokiraI18n = {
    currentLang: 'fr',

    /** Initialise la langue depuis localStorage */
    init() {
        const saved = localStorage.getItem('dokira_lang') || 'fr';
        this.currentLang = saved;
        document.documentElement.lang = saved;
        this.apply();
        this.syncSelectors();
    },

    /** Retourne la traduction d'une clé */
    t(key) {
        const dict = DOKIRA_TRANSLATIONS[this.currentLang] || DOKIRA_TRANSLATIONS['fr'];
        return dict[key] || DOKIRA_TRANSLATIONS['fr'][key] || key;
    },

    /** Applique les traductions à tous les éléments [data-i18n] */
    apply() {
        const lang = this.currentLang;
        const dict = DOKIRA_TRANSLATIONS[lang] || DOKIRA_TRANSLATIONS['fr'];

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!dict[key] && !DOKIRA_TRANSLATIONS['fr'][key]) return;
            const val = dict[key] || DOKIRA_TRANSLATIONS['fr'][key];
            el.textContent = val;
        });

        // data-i18n-placeholder => placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = dict[key] || DOKIRA_TRANSLATIONS['fr'][key];
            if (val) el.placeholder = val;
        });

        // data-i18n-value => value (pour boutons/inputs)
        document.querySelectorAll('[data-i18n-value]').forEach(el => {
            const key = el.getAttribute('data-i18n-value');
            const val = dict[key] || DOKIRA_TRANSLATIONS['fr'][key];
            if (val) el.value = val;
        });

        // data-i18n-title => title (tooltip)
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const val = dict[key] || DOKIRA_TRANSLATIONS['fr'][key];
            if (val) el.title = val;
        });
    },

    /** Change la langue et la sauvegarde */
    setLang(lang) {
        if (!DOKIRA_TRANSLATIONS[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('dokira_lang', lang);
        document.documentElement.lang = lang;
        this.apply();
        this.syncSelectors();
        // Émettre un événement personnalisé
        document.dispatchEvent(new CustomEvent('dokira:langchange', { detail: { lang } }));
    },

    /** Synchronise tous les sélecteurs de langue de la page */
    syncSelectors() {
        document.querySelectorAll('.language-selector, #languageSelect, [data-lang-selector]').forEach(sel => {
            if (sel.value !== this.currentLang) sel.value = this.currentLang;
        });
    }
};

/* ============================================================
   AUTO-INITIALISATION au chargement du DOM
============================================================ */
(function () {
    function bindSelectors() {
        document.querySelectorAll('.language-selector, #languageSelect, [data-lang-selector]').forEach(sel => {
            // Éviter double binding
            if (sel.dataset.i18nBound) return;
            sel.dataset.i18nBound = '1';

            // Ajouter les options si le select est vide ou n'a pas toutes les langues
            const opts = { fr: '🇫🇷 Français', en: '🇬🇧 English', es: '🇪🇸 Español' };
            const existingVals = Array.from(sel.options).map(o => o.value);
            if (!existingVals.includes('fr') || !existingVals.includes('en') || !existingVals.includes('es')) {
                sel.innerHTML = Object.entries(opts).map(([v, t]) =>
                    `<option value="${v}">${t}</option>`
                ).join('');
            }

            sel.addEventListener('change', (e) => DokiraI18n.setLang(e.target.value));
        });
        DokiraI18n.syncSelectors();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            DokiraI18n.init();
            bindSelectors();
        });
    } else {
        DokiraI18n.init();
        bindSelectors();
    }
})();

// Exposer globalement
window.DokiraI18n = DokiraI18n;
window.__ = (key) => DokiraI18n.t(key);
