from __future__ import annotations

import psycopg

class PPMMetadataDbFetcher:
    conn: psycopg.Connection

    def __init__(conn: psycopg.Connection):
        self.conn = conn