from __future__ import annotations

import psycopg
from psycopg import sql
import db as db_utils


class PPM_DB_Fetcher:

    def __init__(
        self,
        table_name: str,
        time_col: str,
        ap_col: str,
        ae_col: str,
        fz_col: str,
        **kwargs,
    ):
        if "conn" in kwargs:
            self.conn = kwargs["conn"]
        else:
            conn_uri = db_utils.create_connection_uri()
            self.conn = psycopg.connect(conn_uri)
            self.owned_conn = True

        self.query = _build_query_string(table_name, time_col, ap_col, ae_col, fz_col)

    def __del__(self):
        if self.cur and not self.cur.closed:
            self.cur.close()

        if self.owned_conn:
            self.conn.close()

    def fetch(self):
        if self.cur is None or self.cur.closed:
            self.__create_cursor()

        cur = self.cur
        cur.execute(self.query)
        return db_utils.yield_rows(cur, autoclose=True)

    def row_count(self):
        return self.cur.rowcount

    def __create_cursor(self):
        self.cur = self.conn.cursor(row_factory=psycopg.rows.dict_row)


def _build_query_string(
    table: str, col_time: str, col_ap: str, col_ae: str, col_fz: str
):
    return sql.SQL(
        """SELECT t.{time}, t.{ap} as ap, t.{ae} as ae, t.{fz} as fz
        FROM {table} t
        WHERE {ap} > 0 AND {ae} > 0 AND {fz} > 0;"""
    ).format(
        table=sql.Identifier(table),
        time=sql.Identifier(col_time),
        ap=sql.Identifier(col_ap),
        ae=sql.Identifier(col_ae),
        fz=sql.Identifier(col_fz),
    )
