from __future__ import annotations

import datetime
from psycopg import sql
from domain.ppm.db_fetcher import PPM_DB_Fetcher
import pandas as pd
from confmod.model.protocols import Aggregator, DbFetcher


class ProcessParameterAggregator(Aggregator[pd.DataFrame]):
    fetcher: DbFetcher

    def __init__(self, fetcher: DbFetcher):
        self.fetcher = fetcher

    def aggregate(self) -> pd.DataFrame:
        result = pd.DataFrame()
        for row in self.fetcher.fetch():
            row = dict([(k, [v]) for k, v in row.items()])
            row_df = pd.DataFrame(row)
            row_df.set_index("time")


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
