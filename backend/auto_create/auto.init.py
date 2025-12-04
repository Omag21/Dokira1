import os

folders = [
    "replication",
    "auto_create",
]

files = {
    "replication/migrate_pg_to_pg.py": "",
    "replication/backup_to_sqlite.py": "",
    "replication/scheduler.py": "",
}

def init():
    for f in folders:
        os.makedirs(f, exist_ok=True)

    for f, content in files.items():
        if not os.path.exists(f):
            with open(f, "w") as fp:
                fp.write(content)
    print("✔ Auto-generate complete")

if __name__ == "__main__":
    init()
