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
    adresse_ligne1 = Column(String(255), nullable=False)
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
    
    # Relations (à développer selon vos besoins)
    # rendez_vous = relationship("RendezVous", back_populates="patient")
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
    medecin_nom = Column(String(100), nullable=False)
    specialite = Column(String(100), nullable=False)
    date_heure = Column(DateTime, nullable=False)
    motif = Column(Text, nullable=True)
    statut = Column(String(50), default="Planifié")  # Planifié, Confirmé, Annulé, Terminé
    lieu = Column(String(255), nullable=True)
    date_creation = Column(DateTime, default=datetime.utcnow)
    
    # patient = relationship("Patient", back_populates="rendez_vous")


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