# models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Date, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

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
    ENVOYE = "Envoyé"
    LU = "Lu"
    REPONDU = "Répondu"
    ARCHIVE = "Archivé"

class StatutRendezVous(str, enum.Enum):
    PLANIFIE = "Planifié"
    CONFIRME = "Confirmé"
    ANNULE = "Annulé"
    TERMINE = "Terminé"

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
    __tablename__ = "rendez_vous"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=False)

    date_heure = Column(DateTime, nullable=False)
    motif = Column(Text, nullable=True)
    statut = Column(Enum(StatutRendezVous), default=StatutRendezVous.PLANIFIE)
    lieu = Column(String(255), nullable=True)
    type_consultation = Column(Enum(TypeConsultation), default=TypeConsultation.CABINET)
    date_creation = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="rendez_vous")
    medecin = relationship("Medecin", back_populates="rendez_vous")


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

    photo_profil_url = Column(String(500), nullable=True)
    langues = Column(String(255), nullable=True)
    biographie = Column(Text, nullable=True)

    est_actif = Column(Boolean, default=True)
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

    date_consultation = Column(DateTime, default=datetime.utcnow)
    motif_consultation = Column(String(255))
    diagnostic = Column(Text)
    traitement = Column(Text)
    observations = Column(Text)

    statut_traitement = Column(Enum(StatutDossier), default=StatutDossier.A_TRAITER)
    date_creation = Column(DateTime, default=datetime.utcnow)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Patient", backref="dossiers")
    medecin = relationship("Medecin", back_populates="dossiers")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    medecin_id = Column(Integer, ForeignKey("medecins.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    
    sujet = Column(String(255), nullable=False)
    contenu = Column(Text, nullable=False)
    de_medecin = Column(Boolean, default=True) # True si envoyé par médecin, False si par patient
    
    statut = Column(Enum(StatutMessage), default=StatutMessage.ENVOYE)
    date_envoi = Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", backref="messages")
    medecin = relationship("Medecin", back_populates="messages")