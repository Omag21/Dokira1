import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

PRIMARY = os.getenv("DATABASE_URL")
SECONDARY = os.getenv("SECONDARY_DB_URL")

def ensure_database_exists():
    info = PRIMARY.rsplit("/", 1)[0]
    conn = psycopg2.connect(info + "/postgres")
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    cur.execute("SELECT 1 FROM pg_database WHERE datname = 'dokira1'")
    exists = cur.fetchone()
    if not exists:
        cur.execute("CREATE DATABASE dokira1")
        print("La base de données 'dokira1' créée.")
    else:
        print("La base de données 'dokira1' existe déjà.")
        cur.close()
    conn.close()
    
    
    def migrate():
        print("Début de la migration de dokira vers dokira1")
        src= psycopg2.connect(PRIMARY)
        dst= psycopg2.connect(SECONDARY)
        
        s = src.cursor()
        d = dst.cursor()
        
        s.execute("""SELECT table_name 
                  FROM information_schema.tables 
                  WHERE table_schema = 'public'""")
        tables = [t[0] for t in s.fetchall()]
        for table in tables:
            print("Migration de la table:", table)
            d.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
            s.execute(f"""SELECT column_name, data_type, is_nullable 
                       FROM information_schema.columns 
                       WHERE table_name = '{table}'""")
            
            cols = s.fechtall()
            col_defs = ", ".join([f"{col[0]} {col[1]}" for col in cols])
            d.execute(f"Table créée {table} ({col_defs})")
            
            s.execute(f"SELECT * FROM {table}")
            rows = s.fetchall()
            
            if rows:
                placeholders = ", ".join(["%s"] * len(rows[0]))
                d.executemany(f"INSERT INTO {table} VALUES ({placeholders})", rows)
                
            dst.commit()
            src.close()
            dst.close()
            
            print("Migration terminée avec succès.")
            
            if __name__ == "__main__":
                ensure_database_exists()
                migrate()
    