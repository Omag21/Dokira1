import threading 
import subprocess
import os

HOT = os.getenv("Activation de la réplication à chaud", "False").lower() == "true"

def start_migration():
    subprocess.popen(["python", "replication/migrate_pg_to_pg.py"])
    
def start_backup():
    if HOT:
        subprocess.popen(["python", "replication/backup_to_sqlite.py"])
        
if __name__ == "__main__":
    start_migration()
    start_backup()
    
    while True:
        pass