import os
import psycopg

def create_connection_uri(**kwargs):
    """Creates the connection URI to access the database
    Configuration is read from environment variables which can be overridden by keyword arguments.

    user -- the database user. env var: POSTGRES_USER
    password -- the password for the database user. env var: POSTGRES_PASSWORD
    db -- the database where the machine data is located. env var: POSTGRES_DB
    host -- the host of the database server. env var: DATABASE_HOST
    port -- the port the database server is listening. env var: DATABASE_PORT
    """

    user = kwargs["user"] if "user" in kwargs else os.getenv("POSTGRES_USER")
    password = kwargs.get("password", os.getenv("POSTGRES_PASSWORD"))
    db = kwargs.get("db", os.getenv("POSTGRES_DB"))
    host = kwargs.get("host", os.getenv("DATABASE_HOST"))
    port = kwargs.get("port", os.getenv("DATABASE_PORT"))

    return f"postgresql://{user}:{password}@{host}:{port}/{db}"

def yield_rows(cur: psycopg.Cursor, limit=None, autoclose=False):
    i = 0
    while limit is None or i < limit:
        row = cur.fetchone()
        if row is None:
            break
        i = i +1
        yield row
    
    if autoclose:
        cur.close()