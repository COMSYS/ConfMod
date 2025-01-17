from dotenv import load_dotenv
import psycopg
from pathlib import Path
import db as db_utils
import pandas as pd
from datetime import timedelta

def main():
    load_dotenv()
    conn = psycopg.connect(db_utils.create_connection_uri())
    ppm_base_points = create_ppm(conn)
    print("Num of base points:", len(ppm_base_points["ap"]))

    # ppm_dict = dict()
    # for base in ppm_base_points:
    #     ppm_dict.get("ap", []).append(base["ap"].mean())
    #     ppm_dict.get("ae", []).append(base["ae"].mean())
    #     ppm_dict.get("fz", []).append(base["fz"].mean())

    result_pd = pd.DataFrame(ppm_base_points)
    result_pd.to_csv('db/csv/ppm_measurement_3.csv')

    conn.close()

def create_ppm(conn: psycopg.Connection):
    process_params_query = Path('./notebooks/sql_scripts/wzl_machine_metadata.sql').read_text()

    keep_res=False
    base_points = {
        "ap": [],
        "ae": [],
        "fz": [],
    }
    curr_bp = pd.DataFrame()
    td_thresh = timedelta(milliseconds=200)
    with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(process_params_query)
        for row in yield_rows(cur):
            row = dict([(k, [v]) for k, v in row.items()])
            row_df = pd.DataFrame(row)
            row_df.set_index("time")
            curr_bp = pd.concat([curr_bp, row_df])
            td = curr_bp["time"].max() - curr_bp["time"].min()

            if not is_quasi_constant(curr_bp):
                if keep_res:
                    # was quasi constant before and surpassed the timedelta but the current row made it not constant
                    # so keep the previous rows and use the current as the next starting point
                    keep_res = False
                    new_base_point = curr_bp.head(-1)
                    ap = new_base_point["ap"].mean()
                    ae = new_base_point["ae"].mean()
                    fz = new_base_point["fz"].mean()
                    base_points.get("ap", []).append(ap)
                    base_points.get("ae", []).append(ae)
                    base_points.get("fz", []).append(fz)
                    print(f"found base point (ap, ae, fz): ({ap}, {ae}, {fz})\t[{td.total_seconds() * 1000} ms]")
                curr_bp = row_df
                continue

            if td >= td_thresh:
                keep_res = True
                continue

    return base_points

def yield_rows(cur: psycopg.Cursor, limit=None):
    i = 0
    while limit is None or i < limit:
        row = cur.fetchone()
        if row is None:
            break
        i = i +1
        yield row

def is_quasi_constant(df: pd.DataFrame):
    for col_name, deviation in [("ap", 0.05), ("ae", 0.05), ("fz", 0.01)]:
        quasi_const = col_deviates(df, col_name)
        if not quasi_const:
            #print(f"col {col_name} is not quasi constant")
            return False
    return True

def col_deviates(df: pd.DataFrame, col_name: str, deviation=0.05):
    avg = df[col_name].mean()
    tolerance = avg * deviation
    filtered = df[ (df[col_name] > avg + deviation) | (df[col_name] < avg - deviation)]
    return filtered.empty

if __name__ == "__main__":
    main()

if __name__ == "__main__" and False:
    import mdl

    my_model = mdl.Model(
        mdl.ModelHead(
            {
                "BASE_POINT": mdl.PayloadDefinition(
                    "BASE_POINT", mdl.PayloadType.MEASUREMENT, ["ae", "ap", "fz"]
                )
            },
            {"machine_hall": "MWH"},
        ),
        [mdl.PayloadItem("BASE_POINT", [0, 0, 0])],
    )

    # json_str = json.dumps(my_model, indent=2, cls=ModelJsonEncoder)
    json_str = mdl.formats.json.encode(my_model, indent=2)
    # json_str = my_model.to_json(indent=2)
    print(json_str)

    # decoded_model = Model.from_json(json_str)
    decoded_model = mdl.formats.json.decode(json_str)
    print(decoded_model)