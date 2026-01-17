import sqlite3, time, os, shutil
from sqlalchemy import create_engine


backup_interval = int(os.getenv("Intervale de sauvegarde (en secondes)", 3600))
keep_limit = int(os.getenv("Garder la dernière sauvegarde", 5))
primary =  os.getenv("URL de la base de données principale")
backup = os.getenv("URL DE LA BASE DE DONNÉES DE SAUVEGARDE SQLITE", "sqlite:///backup.sqlite3")

def backup_sqlite():
    print("Démarrage de la sauvegarde de la base de données vers SQLite")
    timestamp = int(time.time())
    
    shutil.copy("test.db", f"backup_{timestamp}.db")
    
    backups = sorted([f for f in os.listdir() if f.startswith("backup_") ])
    if len(backups) > keep_limit:
        os.remove(backups[0])
       
    print("Sauvegarde terminée avec succès.")
    
    if __name__ == "__main__":
        while True:
            backup_sqlite()
            time.sleep(backup_interval)