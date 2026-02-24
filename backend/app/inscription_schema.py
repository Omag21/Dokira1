from sqlalchemy import text


def _get_columns(conn, table_name: str) -> set[str]:
    dialect = conn.engine.dialect.name
    if dialect == "sqlite":
        rows = conn.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
        return {row[1] for row in rows}

    rows = conn.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = :table_name
            """
        ),
        {"table_name": table_name},
    ).fetchall()
    return {row[0] for row in rows}


def _table_exists(conn, table_name: str) -> bool:
    dialect = conn.engine.dialect.name
    if dialect == "sqlite":
        row = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name=:name"),
            {"name": table_name},
        ).fetchone()
        return row is not None

    row = conn.execute(
        text(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_name = :table_name
            """
        ),
        {"table_name": table_name},
    ).fetchone()
    return row is not None


def ensure_inscription_schema(engine) -> None:
    """Ajoute les colonnes d'inscription manquantes pour medecins/admins."""
    with engine.begin() as conn:
        dialect = conn.engine.dialect.name
        if not _table_exists(conn, "medecins") or not _table_exists(conn, "admins"):
            return

        medecin_cols = _get_columns(conn, "medecins")
        if "statut_inscription" not in medecin_cols:
            conn.execute(
                text(
                    "ALTER TABLE medecins ADD COLUMN statut_inscription VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'"
                )
            )
        if "motif_refus_inscription" not in medecin_cols:
            conn.execute(text("ALTER TABLE medecins ADD COLUMN motif_refus_inscription TEXT"))
        if "date_decision_inscription" not in medecin_cols:
            conn.execute(text("ALTER TABLE medecins ADD COLUMN date_decision_inscription TIMESTAMP"))

        admin_cols = _get_columns(conn, "admins")
        admin_missing_columns = [
            ("specialite", "VARCHAR(100)"),
            ("numero_ordre", "VARCHAR(50)"),
            ("adresse", "VARCHAR(255)"),
            ("ville", "VARCHAR(100)"),
            ("code_postal", "VARCHAR(10)"),
            ("langues", "VARCHAR(255)"),
            ("biographie", "TEXT"),
            ("statut_inscription", "VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE'"),
            ("motif_refus_inscription", "TEXT"),
            ("date_decision_inscription", "TIMESTAMP"),
            ("approuve_par_admin_id", "INTEGER"),
        ]
        for column_name, column_type in admin_missing_columns:
            if column_name not in admin_cols:
                conn.execute(text(f"ALTER TABLE admins ADD COLUMN {column_name} {column_type}"))

        # Backfill pour comptes historiques deja actifs
        conn.execute(
            text(
                """
                UPDATE medecins
                SET statut_inscription = 'APPROUVEE'
                WHERE est_actif = TRUE
                  AND (statut_inscription IS NULL OR statut_inscription = 'EN_ATTENTE')
                """
            )
        )
        conn.execute(
            text(
                """
                UPDATE admins
                SET statut_inscription = 'APPROUVEE'
                WHERE est_actif = TRUE
                  AND (statut_inscription IS NULL OR statut_inscription = 'EN_ATTENTE')
                """
            )
        )

        id_col = "INTEGER PRIMARY KEY AUTOINCREMENT" if dialect == "sqlite" else "SERIAL PRIMARY KEY"
        bool_default = "0" if dialect == "sqlite" else "FALSE"

        conn.execute(
            text(
                f"""
                CREATE TABLE IF NOT EXISTS analyses_patients (
                    id {id_col},
                    patient_id INTEGER NOT NULL,
                    medecin_id INTEGER NOT NULL,
                    titre VARCHAR(255) NOT NULL,
                    resultat TEXT NOT NULL,
                    notes TEXT NULL,
                    document_url VARCHAR(500) NULL,
                    date_analyse TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )

        conn.execute(
            text(
                f"""
                CREATE TABLE IF NOT EXISTS injections_patients (
                    id {id_col},
                    patient_id INTEGER NOT NULL,
                    medecin_id INTEGER NOT NULL,
                    nom_injection VARCHAR(255) NOT NULL,
                    dosage VARCHAR(255) NULL,
                    frequence VARCHAR(255) NULL,
                    instructions TEXT NULL,
                    date_injection TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )

        conn.execute(
            text(
                f"""
                CREATE TABLE IF NOT EXISTS notifications_broadcast (
                    id {id_col},
                    admin_id INTEGER NOT NULL,
                    cible VARCHAR(20) NOT NULL DEFAULT 'all',
                    titre VARCHAR(255) NOT NULL,
                    contenu TEXT NOT NULL,
                    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )

        conn.execute(
            text(
                f"""
                CREATE TABLE IF NOT EXISTS notifications_reception (
                    id {id_col},
                    notification_id INTEGER NOT NULL,
                    user_role VARCHAR(20) NOT NULL,
                    user_id INTEGER NOT NULL,
                    lu BOOLEAN NOT NULL DEFAULT {bool_default},
                    date_reception TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    date_lu TIMESTAMP NULL
                )
                """
            )
        )
