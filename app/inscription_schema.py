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
