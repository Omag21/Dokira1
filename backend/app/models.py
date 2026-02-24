# models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Date, Text, Enum, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime, timedelta

import enum



class Genre(str, enum.Enum):
    HOMME = "Homme"
    FEMME = "Femme"
    AUTRE = "Autre"

class GroupeSanguin(str, enum.Enum):
    A_POSITIF = "A+"
    A_NEGATIF = "A-"
    B_POSITIF = "B+"
    B_NEGATIF = "B-"
    AB_POSITIF = "AB+"
    AB_NEGATIF = "AB-"
    O_POSITIF = "O+"
    O_NEGATIF = "O-"

class Specialite(str, enum.Enum):
    GENERALISTE = "Généraliste"
    CARDIOLOGUE = "Cardiologue"
    PEDIATRE = "Pédiatre"
    DERMATOLOGUE = "Dermatologue"
    OPHTALMOLOGUE = "Ophtalmologue"
    GYNECOLOGUE = "Gynécologue"
    NEUROLOGUE = "Neurologue"
    PSYCHIATRE = "Psychiatre"
    AUTRE = "Autre"

class TypeConsultation(str, enum.Enum):
    CABINET = "Cabinet"
    VIDEO = "Vidéo"
    DOMICILE = "Domicile"

class StatutDossier(str, enum.Enum):
    A_TRAITER = "À traiter"
    EN_COURS = "En cours de traitement"
    TRAITE = "Traité"
    ARCHIVE = "Archivé"

class StatutMessage(str, enum.Enum):
    ENVOYE = "ENVOYE"
    LU = "LU"
    REPONDU = "REPONDU"
    ARCHIVE = "ARCHIVE"
    NON_LU = "NON_LU"


class StatutRendezVous(str, enum.Enum):
    PLANIFIE = "Planifié"
    CONFIRME = "Confirmé"
    ANNULE = "Annulé"
    TERMINE = "Terminé"

class StatutInscription(str, enum.Enum):
    EN_ATTENTE = "EN_ATTENTE"
    APPROUVEE = "APPROUVEE"
    REJETEE = "REJETEE"

class Patient(Base):
    __tablename__ = "patients"
    
    # Identifiant unique
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Informations de connexion
    email = Column(String(255), unique=True, nullable=False, index=True)
    mot_de_passe_hash = Column(String(255), nullable=False)
    
    # Informations personnelles
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    date_naissance = Column(Date, nullable=False)
    genre = Column(Enum(Genre), nullable=False)
    telephone = Column(String(20), nullable=False)
    telephone_urgence = Column(String(20), nullable=True)
    
    # Adresse
    adresse = Column(String(255), nullable=False)
    adresse_ligne2 = Column(String(255), nullable=True)
    ville = Column(String(100), nullable=False)
    code_postal = Column(String(10), nullable=False)
    pays = Column(String(100), default="Gabon")
    
    # Informations médicales
    numero_securite_sociale = Column(String(15), unique=True, nullable=True, index=True)
    groupe_sanguin = Column(Enum(GroupeSanguin), nullable=True)
    allergies = Column(Text, nullable=True)  # Liste des allergies séparées par des virgules
    antecedents_medicaux = Column(Text, nullable=True)
    antecedents_familiaux = Column(Text, nullable=True)
    traitements_en_cours = Column(Text, nullable=True)
    
    # Assurance et mutuelle
    mutuelle_nom = Column(String(100), nullable=True)
    mutuelle_numero = Column(String(50), nullable=True)
    
    # Médecin traitant
    medecin_traitant_nom = Column(String(100), nullable=True)
    medecin_traitant_telephone = Column(String(20), nullable=True)
    
    # Photo de profil
    photo_profil_url = Column(String(500), nullable=True)
    
    # Statut et gestion du compte
    est_actif = Column(Boolean, default=True)
    est_email_verifie = Column(Boolean, default=False)
    date_creation = Column(DateTime, default=datetime.utcnow)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    derniere_connexion = Column(DateTime, nullable=True)
    
    # Token de réinitialisation de mot de passe
    token_reset_password = Column(String(255), nullable=True)
    token_reset_expiration = Column(DateTime, nullable=True)
    
    # Token de vérification email
    token_verification_email = Column(String(255), nullable=True)
    
    # Préférences utilisateur
    langue_preferee = Column(String(5), default="fr")
    notifications_email = Column(Boolean, default=True)
    notifications_sms = Column(Boolean, default=True)
    

    rendez_vous = relationship("RendezVous", back_populates="patient")
    # ordonnances = relationship("Ordonnance", back_populates="patient")
    # documents = relationship("Document", back_populates="patient")
    
    def __repr__(self):
        return f"<Patient(id={self.id}, nom={self.nom}, prenom={self.prenom}, email={self.email})>"
    
    @property
    def nom_complet(self):
        return f"{self.prenom} {self.nom}"
    
    @property
    def age(self):
        today = datetime.now().date()
        age = today.year - self.date_naissance.year
        if today.month < self.date_naissance.month or (today.month == self.date_naissance.month and today.day < self.date_naissance.day):
            age -= 1
        return age


# Modèles additionnels pour les relations (optionnel, à développer selon vos besoins)

class RendezVous(Base):
    """Modèle pour les rendez-vous médicaux"""
    __tablename__ = "rendez_vous"

    # Identifiants
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=False, index=True)

    # Informations du rendez-vous
    date_heure = Column(DateTime, nullable=False, index=True)
    motif = Column(Text, nullable=True)
    #statut = Column(Enum(StatutRendezVous), default=StatutRendezVous.PLANIFIE, index=True)
    statut = Column(String(50), nullable=True)
    specialite: str = Column(String(100), nullable=False)
    
    # Type et lieu de consultation - ✅ IMPORTANT: NE PAS SUPPRIMER
    #type_consultation = Column(Enum(TypeConsultation), default=TypeConsultation.CABINET, nullable=False)
    type_consultation = Column(String(20), nullable=False, default="Cabinet")
    lieu = Column(String(500), nullable=True)  # Adresse si domicile, URL vidéo si vidéo
    
    # Métadonnées
    date_creation = Column(DateTime, default=datetime.utcnow, index=True)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    patient = relationship("Patient", back_populates="rendez_vous")
    medecin = relationship("Medecin", back_populates="rendez_vous")

    def __repr__(self):
        return f"<RendezVous(id={self.id}, patient_id={self.patient_id}, medecin_id={self.medecin_id}, type={self.type_consultation})>"

    @property
    def est_passe(self):
        """Vérifie si le rendez-vous est passé"""
        return self.date_heure < datetime.utcnow()

    @property
    def est_proche(self, heures=24):
        """Vérifie si le rendez-vous est dans les prochaines 24h"""
        delta = self.date_heure - datetime.utcnow()
        return timedelta(0) < delta < timedelta(hours=heures)

    @property
    def affichage_type(self):
        """Retourne le type formaté pour l'affichage"""
        types_affichage = {
            "Cabinet": "🏥 En cabinet",
            "Vidéo": "📱 En ligne",
            "Domicile": "🏠 À domicile"
        }
        return types_affichage.get(self.type_consultation.value if self.type_consultation else "Cabinet", "Cabinet")


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=False, index=True)
    medecin_nom = Column(String(150), nullable=False)

    visiteur_nom = Column(String(100), nullable=False)
    visiteur_prenom = Column(String(100), nullable=False)
    visiteur_email = Column(String(255), nullable=False, index=True)
    visiteur_telephone = Column(String(20), nullable=False)

    motif_consultation = Column(Text, nullable=False)
    date_heure = Column(DateTime, nullable=False, index=True)
    statut = Column(String(50), nullable=False, default="Demandee")
    date_creation = Column(DateTime, default=datetime.utcnow, nullable=False)

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    titre = Column(String(255), nullable=False)
    type_document = Column(String(50), nullable=False)  # Ordonnance, Analyse, Imagerie, etc.
    fichier_url = Column(String(500), nullable=False)
    date_upload = Column(DateTime, default=datetime.utcnow)
    date_document = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    
    # patient = relationship("Patient", back_populates="documents")


class Ordonnance(Base):
    __tablename__ = "ordonnances"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medecin_nom = Column(String(100), nullable=False)
    date_emission = Column(Date, nullable=False)
    medicaments = Column(Text, nullable=False) 
    posologie = Column(Text, nullable=False)
    duree_traitement = Column(String(50), nullable=True)
    statut = Column(String(50), default="Active")  # Active, Expirée, Renouvelée
    date_expiration = Column(Date, nullable=True)
    fichier_url = Column(String(500), nullable=True)
    
    # patient = relationship("Patient", back_populates="ordonnances")


class Medecin(Base):
    __tablename__ = "medecins"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    mot_de_passe_hash = Column(String(255), nullable=False)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    specialite = Column(Enum(Specialite), nullable=False)
    numero_ordre = Column(String(50), unique=True, nullable=True)
    telephone = Column(String(20), nullable=True)

    adresse = Column(String(255), nullable=True)
    ville = Column(String(100), nullable=True)
    code_postal = Column(String(10), nullable=True)
    prix_consultation = Column(Float, nullable=True)  
    annees_experience = Column(Integer, default=0, nullable=False)
    featured = Column(Boolean, default=False)  # Afficher en vedette sur la page d'accueil
    date_approbation = Column(DateTime, nullable=True)
    approuve_par = Column(Integer, ForeignKey("admins.id"), nullable=True)
    
    photo_profil_url = Column(String(500), nullable=True)
    langues = Column(String(255), nullable=True)
    biographie = Column(Text, nullable=True)

    est_actif = Column(Boolean, default=True)
    statut_inscription = Column(String(20), default=StatutInscription.EN_ATTENTE.value, nullable=False)
    motif_refus_inscription = Column(Text, nullable=True)
    date_decision_inscription = Column(DateTime, nullable=True)
    date_creation = Column(DateTime, default=datetime.utcnow)
    derniere_connexion = Column(DateTime, nullable=True)

    rendez_vous = relationship("RendezVous", back_populates="medecin")
    dossiers = relationship("DossierMedical", back_populates="medecin")
    messages = relationship("Message", back_populates="medecin")

    @property
    def nom_complet(self):
        return f"Dr. {self.prenom} {self.nom}"

        
    @property
    def langues_liste(self):
        if self.langues:
            return [l.strip() for l in self.langues.split(",")]
        return []

class DossierMedical(Base):
    __tablename__ = "dossiers_medicaux"

    id = Column(Integer, primary_key=True, index=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    
    groupe_sanguin = Column(Enum(GroupeSanguin), nullable=True)
    allergies = Column(Text, nullable=True)
    antecedents_medicaux = Column(Text, nullable=True)
    antecedents_familiaux = Column(Text, nullable=True)
    numero_securite_sociale = Column(String(15), nullable=True)


    date_consultation = Column(DateTime, default=datetime.utcnow)
    motif_consultation = Column(String(255))
    diagnostic = Column(Text)
    traitement = Column(Text)
    observations = Column(Text)
    
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True, index=True)
    ordonnance_id = Column(Integer, ForeignKey("ordonnances.id"), nullable=True, index=True)


    statut_traitement = Column(Enum(StatutDossier), default=StatutDossier.A_TRAITER)
    date_creation = Column(DateTime, default=datetime.utcnow)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", backref="dossiers")
    medecin = relationship("Medecin", back_populates="dossiers")
    document = relationship("Document", backref="dossier_medical", foreign_keys=[document_id])
    ordonnance = relationship("Ordonnance", backref="dossier_medical", foreign_keys=[ordonnance_id])
    
    def __repr__(self):
        return f"<DossierMedical(id={self.id}, patient_id={self.patient_id}, medecin_id={self.medecin_id})>"



class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    
    sujet = Column(String(255), nullable=False)
    contenu = Column(Text, nullable=False)
    de_medecin = Column(Boolean, default=True) # True si envoyé par médecin, False si par patient
    
    #statut = Column(Enum(StatutMessage), default=StatutMessage.ENVOYE)
    statut = Column(Enum( StatutMessage, name="statutmessage", values_callable=lambda enum_cls: [e.value for e in enum_cls] ))

    date_envoi = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", backref="messages")
    medecin = relationship("Medecin", back_populates="messages")                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  # ============= ENUMS ADDITIONNELS =============


# ============= MESSAGERIE ADMIN =============

class MessageAdminMedecin(Base):
    """Messages entre admin et médecins"""
    __tablename__ = "messages_admin_medecin"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False, index=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=False, index=True)
    
    sujet = Column(String(255), nullable=False, default="Message de l'administrateur")
    contenu = Column(Text, nullable=False)
    de_admin = Column(Boolean, default=True)  # True = envoyé par admin, False = par médecin
    
    statut = Column(Enum(StatutMessage, name="statutmessage_admin_medecin", 
                         values_callable=lambda enum_cls: [e.value for e in enum_cls]), 
                    default=StatutMessage.ENVOYE)
    
    date_envoi = Column(DateTime, default=datetime.utcnow)
    date_lu = Column(DateTime, nullable=True)
    
    # Relations
    admin = relationship("Admin", backref="messages_avec_medecins")
    medecin = relationship("Medecin", backref="messages_avec_admin")
    
    def __repr__(self):
        return f"<MessageAdminMedecin(id={self.id}, admin={self.admin_id}, medecin={self.medecin_id})>"


class MessageAdminPatient(Base):
    """Messages entre admin et patients"""
    __tablename__ = "messages_admin_patient"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    
    sujet = Column(String(255), nullable=False, default="Message de l'administrateur")
    contenu = Column(Text, nullable=False)
    de_admin = Column(Boolean, default=True)  # True = envoyé par admin, False = par patient
    
    statut = Column(Enum(StatutMessage, name="statutmessage_admin_patient", 
                         values_callable=lambda enum_cls: [e.value for e in enum_cls]), 
                    default=StatutMessage.ENVOYE)
    
    date_envoi = Column(DateTime, default=datetime.utcnow)
    date_lu = Column(DateTime, nullable=True)
    
    # Relations
    admin = relationship("Admin", backref="messages_avec_patients")
    patient = relationship("Patient", backref="messages_avec_admin")
    
    def __repr__(self):
        return f"<MessageAdminPatient(id={self.id}, admin={self.admin_id}, patient={self.patient_id})>"


class AnalysePatient(Base):
    __tablename__ = "analyses_patients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=False, index=True)
    titre = Column(String(255), nullable=False)
    resultat = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    document_url = Column(String(500), nullable=True)
    date_analyse = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    date_creation = Column(DateTime, default=datetime.utcnow, nullable=False)


class InjectionPatient(Base):
    __tablename__ = "injections_patients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=False, index=True)
    nom_injection = Column(String(255), nullable=False)
    dosage = Column(String(255), nullable=True)
    frequence = Column(String(255), nullable=True)
    instructions = Column(Text, nullable=True)
    date_injection = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    date_creation = Column(DateTime, default=datetime.utcnow, nullable=False)


class NotificationBroadcast(Base):
    __tablename__ = "notifications_broadcast"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False, index=True)
    cible = Column(String(20), nullable=False, default="all")  # patients|medecins|all
    titre = Column(String(255), nullable=False)
    contenu = Column(Text, nullable=False)
    date_creation = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class NotificationReception(Base):
    __tablename__ = "notifications_reception"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    notification_id = Column(Integer, ForeignKey("notifications_broadcast.id"), nullable=False, index=True)
    user_role = Column(String(20), nullable=False, index=True)  # patient|medecin
    user_id = Column(Integer, nullable=False, index=True)
    lu = Column(Boolean, default=False, nullable=False, index=True)
    date_reception = Column(DateTime, default=datetime.utcnow, nullable=False)
    date_lu = Column(DateTime, nullable=True)

class StatutPhoto(str, enum.Enum):
    """Statut d'une photo"""
    ACTIVE = "Active"
    ARCHIVEE = "Archivée"
    SUPPRIMEE = "Supprimée"
  

# ============= MODÈLE PHOTO =============

class Photo(Base):
    """
    Modèle pour gérer les photos/images des utilisateurs et documents
    Stocke les références aux fichiers uploadés
    """
    __tablename__ = "photos"
    
    # Identifiant unique
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Informations du fichier
    nom_original = Column(String(255), nullable=False)
    nom_stocke = Column(String(255), nullable=False, unique=True, index=True)
    chemin_fichier = Column(String(500), nullable=False)
    url_fichier = Column(String(500), nullable=False)
    
    # Type et taille du fichier
    type_mime = Column(String(50), nullable=False)  # image/jpeg, image/png, etc.
    taille_bytes = Column(Integer, nullable=False)
    
    # Informations sur l'upload
    type_photo = Column(String(50), nullable=False)  # "profil", "document", "annonce"
    statut = Column(Enum(StatutPhoto), default=StatutPhoto.ACTIVE)
    
    # Dimensions (pour les images)
    largeur = Column(Integer, nullable=True)
    hauteur = Column(Integer, nullable=True)
    
    # Propriétaire de la photo
    # Pour savoir qui a uploadé la photo
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    
    # Dates
    date_upload = Column(DateTime, default=datetime.utcnow, nullable=False)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    date_suppression = Column(DateTime, nullable=True)
    
    # Description/commentaire
    description = Column(Text, nullable=True)
    
    # Relations
    admin = relationship(
    "Admin",
    back_populates="photo",
    foreign_keys=[admin_id],
    lazy="selectin")


    
    def __repr__(self):
        return f"<Photo(id={self.id}, nom={self.nom_original}, type={self.type_photo})>"
    
    @property
    def est_actif(self):
        """Vérifie si la photo est active"""
        return self.statut == StatutPhoto.ACTIVE
    
    @property
    def taille_mo(self):
        """Convertit la taille en Mo"""
        return round(self.taille_bytes / (1024 * 1024), 2)


          
# ============= MODÈLE ADMIN =============

class Admin(Base):
    """
    Modèle pour les administrateurs de la plateforme
    """
    __tablename__ = "admins"
    
    # Identifiant unique
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Informations de connexion
    email = Column(String(255), unique=True, nullable=False, index=True)
    mot_de_passe_hash = Column(String(255), nullable=False)
    
    # Informations personnelles
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    telephone = Column(String(20), nullable=True)
    specialite = Column(String(100), nullable=True)
    numero_ordre = Column(String(50), nullable=True)
    adresse = Column(String(255), nullable=True)
    ville = Column(String(100), nullable=True)
    code_postal = Column(String(10), nullable=True)
    langues = Column(String(255), nullable=True)
    biographie = Column(Text, nullable=True)
    
    # Photo de profil
    photo_profil_url = Column(String(500), nullable=True)
    photo_id = Column(Integer, ForeignKey("photos.id"), nullable=True)
    
    # Statut et gestion du compte
    est_actif = Column(Boolean, default=True)
    est_super_admin = Column(Boolean, default=False)  # Super admin peut tout faire
    statut_inscription = Column(String(20), default=StatutInscription.EN_ATTENTE.value, nullable=False)
    motif_refus_inscription = Column(Text, nullable=True)
    date_decision_inscription = Column(DateTime, nullable=True)
    approuve_par_admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    
    # Dates
    date_creation = Column(DateTime, default=datetime.utcnow, nullable=False)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    derniere_connexion = Column(DateTime, nullable=True)
    
    # Token de réinitialisation de mot de passe
    token_reset_password = Column(String(255), nullable=True)
    token_reset_expiration = Column(DateTime, nullable=True)
    
    # Relations
    photo = relationship(
    "Photo",
    back_populates="admin",
    foreign_keys=[Photo.admin_id],
    lazy="selectin",
    uselist=False)


    annonces = relationship("Annonce", back_populates="admin")
    
    def __repr__(self):
        return f"<Admin(id={self.id}, nom={self.nom}, prenom={self.prenom}, email={self.email})>"
    
    @property
    def nom_complet(self):
        """Retourne le nom complet de l'admin"""
        return f"{self.prenom} {self.nom}".strip()
    
    @property
    def initiales(self):
        """Retourne les initiales de l'admin"""
        return f"{self.prenom[0]}{self.nom[0]}".upper() if self.prenom and self.nom else "A"



# ============= MODÈLE ANNONCE =============

class Annonce(Base):
    
    __tablename__ = "annonces"
    
    # Identifiant unique
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Contenu de l'annonce
    titre = Column(String(255), nullable=False, index=True)
    contenu = Column(Text, nullable=False)
    description_courte = Column(String(500), nullable=True)
    
    # Image/visuel
    image_url = Column(String(500), nullable=True)
    image_id = Column(Integer, ForeignKey("photos.id"), nullable=True)
    
    # Lien de redirection (optionnel)
    lien_cible = Column(String(500), nullable=True)
    lien_texte = Column(String(100), nullable=True)
    
    # Catégorie et priorité
    categorie = Column(String(50), nullable=True)  # "promotion", "info", "urgence"
    priorite = Column(Integer, default=0)  # Pour l'ordre d'affichage (plus élevé = plus visible)
    
    # Statut d'affichage
    est_active = Column(Boolean, default=True)
    
    # Dates
    date_creation = Column(DateTime, default=datetime.utcnow, nullable=False)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    date_debut = Column(DateTime, nullable=True)  # Quand commencer à afficher
    date_expiration = Column(DateTime, nullable=True)  # Quand arrêter d'afficher
    
    # Administrateur responsable
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False)
    
    # Statistiques
    nb_vues = Column(Integer, default=0)
    nb_clics = Column(Integer, default=0)
    
    # Relations
    admin = relationship("Admin", back_populates="annonces")
    
    def __repr__(self):
        return f"<Annonce(id={self.id}, titre={self.titre}, est_active={self.est_active})>"
    
    @property
    def est_valide(self):
        """Vérifie si l'annonce est valide et doit être affichée"""
        now = datetime.utcnow()
        
        # Vérifier si l'annonce est active
        if not self.est_active:
            return False
        
        # Vérifier la date de début
        if self.date_debut and now < self.date_debut:
            return False
        
        # Vérifier la date d'expiration
        if self.date_expiration and now > self.date_expiration:
            return False
        
        return True
    
    @property
    def jours_restants(self):
        """Retourne le nombre de jours restants avant expiration"""
        if not self.date_expiration:
            return None
        
        delta = self.date_expiration - datetime.utcnow()
        return max(0, delta.days)
    
    @property
    def est_expiration_proche(self):
        """Vérifie si l'expiration est proche (moins de 7 jours)"""
        jours = self.jours_restants
        return jours is not None and jours <= 7

                                                                                                                                                                  

# ============= MODÈLE PARTENAIRE =============

class Partenaire(Base):
    """
    Modèle simplifié pour les partenaires
    """
    __tablename__ = "partenaires"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nom = Column(String(200), nullable=False, index=True)
    type_partenaire = Column(String(50), nullable=False)  # pharmacie, laboratoire, clinique, etc.
    logo_url = Column(String(500), nullable=True)
    
    # Métadonnées
    date_ajout = Column(DateTime, default=datetime.utcnow)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    
    # Relations
    admin = relationship("Admin", foreign_keys=[admin_id])
    
    def __repr__(self):
        return f"<Partenaire(id={self.id}, nom={self.nom}, type={self.type_partenaire})>"
