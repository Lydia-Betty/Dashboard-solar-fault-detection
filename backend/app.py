
from flask import Flask, request, jsonify
from flask_cors import CORS
import os, io, json, requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import pvlib
from pvlib.location import Location


# 1) Import your Keras‐model loader (must return a compiled model)
from model_loader import load_model_for_type

app = Flask(__name__)
CORS(app, origins=["https://dashboard-solar-fault-detection-ecoumnbnr.vercel.app"], supports_credentials=True,)

UPLOAD_FOLDER = "temp_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

LOOKBACK = 15     # use the last 15 hours as input
HORIZON  = 24     # predict the next 24 hours
EPSILON  = 1e-5   # for cloudiness_ratio calculation

# -----------------------------------------------------------------------------------------
# 1) load_target_scaler + inverse_min_max_scale
# -----------------------------------------------------------------------------------------
def load_target_scaler(model_type: str) -> dict:

    path = f"models/{model_type}/scaler_target.json"
    with open(path, "r") as f:
        return json.load(f)

def inverse_min_max_scale(scaled_array: np.ndarray, scaler_params: dict) -> np.ndarray:

    a, b  = scaler_params["feature_range"]
    mn    = float(scaler_params["min"][0])
    mx    = float(scaler_params["max"][0])
    return ((scaled_array - a) / (b - a)) * (mx - mn + 1e-8) + mn


# -----------------------------------------------------------------------------------------
# 2) load + scale the 17 “meteorological” features
# -----------------------------------------------------------------------------------------
def load_feature_scaler(model_type: str) -> dict:

    path = f"models/{model_type}/scaler_features.json"
    with open(path, "r") as f:
        return json.load(f)

def scale_17_features(raw17: np.ndarray, scaler_params: dict) -> np.ndarray:

    feat_min = np.array(scaler_params["min"])      # (17,)
    feat_max = np.array(scaler_params["max"])      # (17,)
    a_feat, b_feat = scaler_params["feature_range"]
    denom = feat_max - feat_min + 1e-8             # (17,)

    scaled = ((raw17 - feat_min) / denom) * (b_feat - a_feat) + a_feat
    return scaled.astype(np.float32)               # (n_rows, 17)


# -----------------------------------------------------------------------------------------
# 3) Build NASA URL & fetch last 48 hours, then pick final 15 valid rows
# -----------------------------------------------------------------------------------------
def build_nasa_url(lat: float, lon: float,
                   start_date: str, end_date: str,
                   params_list: list[str]) -> str:

    base = "https://power.larc.nasa.gov/api/temporal/hourly/point"
    q = {
        "start":          start_date,
        "end":            end_date,
        "latitude":       str(lat),
        "longitude":      str(lon),
        "community":      "RE",              # agricultural community
        "parameters":     ",".join(params_list),
        "format":         "csv",
        "time-standard":  "utc",
        "user":           "Admin"
    }
    qs = "&".join(f"{k}={v}" for k, v in q.items())
    return f"{base}?{qs}"


def fetch_nasa_last(lat: float, lon: float) -> pd.DataFrame:
    tz      = "Etc/UTC"  # we’ll generate UTC timestamps; pvlib will handle conversion internally
    site    = Location(lat, lon, tz=tz, altitude=0, name="site")  # altitude can be ~0 if unknown


    now_utc = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    lookback_hrs = 96
    max_hrs = 336  # do not exceed two week

    params_list = [
        "wd2m", "t2m", "rh2m", "ps", "prectotcorr",
        "qv2m", "clrsky_sfc_sw_dwn", "tqv", "v10m", "u10m", "ws10m",
        "allsky_sfc_sw_dwn"
    ]

    while True:
        start_all = now_utc - timedelta(hours=lookback_hrs)
        start_str = start_all.strftime("%Y%m%d")
        end_str   = now_utc.strftime("%Y%m%d")

        # 1) Build & call the NASA‑POWER URL
        nasa_url = build_nasa_url(lat, lon, start_str, end_str, params_list)
        resp     = requests.get(nasa_url)
        resp.raise_for_status()

        raw_lines = resp.text.splitlines()
        header_idx = None
        for idx, line in enumerate(raw_lines):
            toks = [tok.strip().lower() for tok in line.split(",")]
            if "yyyymmdd" in toks and "hh" in toks:
                header_idx = idx
                break
            if {"year","mo","dy","hr"}.issubset(toks):
                header_idx = idx
                break

        if header_idx is None:
            raise ValueError("Could not locate NASA header row (yyyymmdd/HH or year,mo,dy,hr).")

        clean_csv = "\n".join(raw_lines[header_idx:])
        combined_df = pd.read_csv(io.StringIO(clean_csv), header=0, sep=",", engine="python")
        combined_df.columns = [c.strip().lower() for c in combined_df.columns]

        # 2) Build a real DateTimeIndex (either via yyyymmdd+hh or year,mo,dy,hr)
        if "yyyymmdd" in combined_df.columns and "hh" in combined_df.columns:
            date_str = (
                combined_df["yyyymmdd"].astype(str)
                + combined_df["hh"].astype(str).str.zfill(2)
            )
            combined_df["date"] = pd.to_datetime(date_str, format="%Y%m%d%H", errors="raise")
            combined_df = combined_df.set_index("date")
        else:
            combined_df = combined_df.rename(columns={"mo":"month","dy":"day","hr":"hour"})
            combined_df["date"] = pd.to_datetime(
                combined_df[["year","month","day","hour"]], errors="raise"
            )
            combined_df = combined_df.set_index("date")

        # 3) Filter exactly (start_all, now_utc]
        combined_df = combined_df.sort_index()
        window_df = combined_df.loc[(combined_df.index > start_all) & (combined_df.index <= now_utc)].copy()

        # If NASA returned fewer total rows than LOOKBACK, no need to drop NaNs yet
        if window_df.shape[0] < LOOKBACK:
            # Expand window and retry
            lookback_hrs += 24
            if lookback_hrs > max_hrs:
                raise ValueError(f"Even after expanding to {lookback_hrs} hours, only {window_df.shape[0]} rows total; need ≥{LOOKBACK}.")
            continue

        needed_cols = [
            "wd2m", "t2m", "rh2m", "ps", "prectotcorr",
            "qv2m", "clrsky_sfc_sw_dwn", "tqv", "v10m", "u10m", "ws10m",
            "allsky_sfc_sw_dwn"
        ]
        missing = set(needed_cols) - set(window_df.columns)
        if missing:
            raise ValueError(f"Missing NASA columns: {sorted(missing)}")

        # 4) Replace –999 → NaN, then drop rows where all needed_cols are NaN
        df_na = window_df[needed_cols].replace(-999, np.nan)
        # 5) Compute a pvlib‐based “clear sky” for any row where CLRsky is NaN:
        #    – We will need a DatetimeIndex of all timestamps in window_df
        idxs = df_na.index
        cs = site.get_clearsky(idxs, model="ineichen")["ghi"].rename("pvlib_ghi")
        df_na["clrsky_sfc_sw_dwn"] = df_na["clrsky_sfc_sw_dwn"].where(
            df_na["clrsky_sfc_sw_dwn"] > 0, cs
        )
        df_na["allsky_sfc_sw_dwn"] = df_na["allsky_sfc_sw_dwn"].where(
            df_na["allsky_sfc_sw_dwn"] > 0,
            df_na["clrsky_sfc_sw_dwn"]
        )

        raw12 = df_na.dropna(how="all")

        if raw12.shape[0] < LOOKBACK:
            # Too few valid rows—expand window and retry
            lookback_hrs += 24
            if lookback_hrs > max_hrs:
                raise ValueError(f"After dropping all–NaN rows, only {raw12.shape[0]} remain; need {LOOKBACK}. Tried {lookback_hrs} hours.")
            continue

        # At this point raw12 has ≥ LOOKBACK rows. We can break out of loop.
        break

    # 5) Build “df2” for forward/backfill + nighttime correction
    df2 = window_df[needed_cols].replace(-999, np.nan).ffill().bfill()
     # Re‐insert our pvlib fills (in case ffill/bfill overwrote anything)
    df2["clrsky_sfc_sw_dwn"] = df_na["clrsky_sfc_sw_dwn"]
    df2["allsky_sfc_sw_dwn"] = df_na["allsky_sfc_sw_dwn"]

    def force_night_to_zero(row):
        hour_utc = row.name.hour
        if (hour_utc < 4) or (hour_utc > 20):
            return 0.0
        else:
            return row["allsky_sfc_sw_dwn"]

    df2["allsky_sfc_sw_dwn"] = df2["allsky_sfc_sw_dwn"].fillna(
        df2.apply(lambda r: force_night_to_zero(r), axis=1)
    ).ffill()

    # 6) Return exactly the last LOOKBACK valid rows from raw12
    return df2.iloc[-LOOKBACK:].copy()


# -----------------------------------------------------------------------------------------
# 4) build_last_window_from_df → (1, 15, 17)
# -----------------------------------------------------------------------------------------
def build_last_window_from_df(df15: pd.DataFrame, model_type: str) -> np.ndarray:

    # 1) Replace –999 → NaN, then ffill/bfill
    df2 = df15.replace(-999, np.nan).ffill().bfill()
    mask_both_nan = df2["clrsky_sfc_sw_dwn"].isna()
    df2.loc[mask_both_nan, ["clrsky_sfc_sw_dwn", "allsky_sfc_sw_dwn"]] = 0.0

    # 2) Recompute ‘cloudiness_ratio’ & ‘cloud_diff’ if missing
    clr   = df2["clrsky_sfc_sw_dwn"].values
    allsky= df2["allsky_sfc_sw_dwn"].values

    ratio = np.zeros_like(clr, dtype=np.float64)
    diff  = np.zeros_like(clr, dtype=np.int32)

    # Wherever clr>0 (or allsky>0), do the usual:
    positive_mask = (clr > 0) | (allsky > 0)
    if positive_mask.any():
        # cloudiness_ratio = min(allsky / (clr + EPSILON), 1.0)
        raw_ratio = allsky[positive_mask] / (clr[positive_mask] + EPSILON)
        ratio[positive_mask] = np.minimum(raw_ratio, 1.0)
        # cloud_diff = int(allsky – clr)
        diff_vals = (allsky[positive_mask] - clr[positive_mask]).astype(int)
        diff[positive_mask] = diff_vals

    df2["cloudiness_ratio"] = ratio
    df2["cloud_diff"]       = diff

    
    from datetime import timedelta
    df2 = df2.copy()
    df2.index = df2.index + timedelta(hours=1)

    # 3) Extract time features
    df2["year"]  = df2.index.year
    df2["month"] = df2.index.month
    df2["day"]   = df2.index.day
    df2["hour"]  = df2.index.hour

    # 4) Build raw17 array (15×17) in EXACT the same order used during training:
    feat_cols = [
        "year", "month", "day", "hour",
        "wd2m", "t2m", "rh2m", "ps", "prectotcorr",
        "qv2m", "clrsky_sfc_sw_dwn", "tqv", "v10m", "u10m", "ws10m",
        "cloudiness_ratio", "cloud_diff"
    ]
    raw17 = df2[feat_cols].values.astype(np.float64)  # shape = (15, 17)

    # 5) MinMax‐scale those 17 columns
    with open(f"models/{model_type}/scaler_features.json", "r") as f:
        feat_scaler = json.load(f)
    scaled17 = scale_17_features(raw17, feat_scaler)  # shape = (15, 17)

    if scaled17.shape != (LOOKBACK, 17):
        raise ValueError(f"After scaling, got {scaled17.shape} but expected ({LOOKBACK}, 17).")

    # 6) Return a single lookback window of shape (1, 15, 17)
    return scaled17[np.newaxis, ...]  # shape = (1, 15, 17)

# -----------------------------------------------------------------------------------------
# 5) The /predict endpoint
# -----------------------------------------------------------------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    mode       = request.form.get("mode")    # "upload" or "nasa"
    model_type = request.form.get("model")   # e.g. "lstm", "tft", etc.

    if mode not in ("upload", "nasa") or not model_type:
        return jsonify({"error": "Missing or invalid mode/model"}), 400

    # 5.1) Load your pretrained Keras model
    try:
        model = load_model_for_type(model_type)
    except Exception as e:
        return jsonify({"error": f"Could not load model '{model_type}': {str(e)}"}), 500

    # -----------------------------------------------------------------------------------
    # 5.2A) If mode="upload": read the CSV, skip “-END HEADER-”, take last 15 rows
    # -----------------------------------------------------------------------------------
    if mode == "upload":
        if "file" not in request.files:
            return jsonify({"error": "No file provided in upload mode"}), 400

        upload_file = request.files["file"]
        fname       = upload_file.filename
        fpath       = os.path.join(UPLOAD_FOLDER, fname)
        upload_file.save(fpath)

        # 5.2A.a) Locate the header row that contains YEAR, MO, DY, HR
        with open(fpath, "r", encoding="utf8") as f:
            lines = f.readlines()

        header_idx = None
        for idx, line in enumerate(lines):
            toks = [t.strip().lower() for t in line.replace("\t", " ").split()]
            if {"year", "mo", "dy", "hr"}.issubset(toks):
                header_idx = idx
                break
        if header_idx is None:
            return jsonify({"error": "Could not find header row containing YEAR, MO, DY, HR"}), 400

        # 5.2A.b) Read the data starting from that header row
        df = pd.read_csv(
            fpath,
            sep=r"\s+|\t|,",      # split on whitespace, tabs, or commas
            skiprows=header_idx,
            header=0,
            engine="python",
            comment="#"
        )
        df.columns = [c.strip().lower() for c in df.columns]
        df = df.rename(columns={"mo":"month","dy":"day","hr":"hour"})

        missing_cols = {"year","month","day","hour"} - set(df.columns)
        if missing_cols:
            return jsonify({"error": f"Uploaded CSV missing columns: {sorted(missing_cols)}"}), 400

        df["date"] = pd.to_datetime(df[["year","month","day","hour"]], errors="raise")
        df = df.set_index("date").sort_index()
        if df.shape[0] < LOOKBACK:
            return jsonify({"error": f"Uploaded CSV has only {df.shape[0]} rows; need ≥{LOOKBACK}"}), 400

        # Keep the last 15 rows × all needed CSV columns
        history_df = df.iloc[-LOOKBACK:].copy()

    # -----------------------------------------------------------------------------------
    # 5.2B) If mode="nasa": fetch the last 15 valid hours from NASA
    # -----------------------------------------------------------------------------------
    else:
        lat = request.form.get("lat", type=float)
        lon = request.form.get("lon", type=float)
        if lat is None or lon is None:
            return jsonify({"error": "Missing latitude/longitude for NASA mode"}), 400
        try:
            history_df = fetch_nasa_last(lat, lon)
            # Debug prints (you can remove these in production):
            print("⏰ timestamps:", history_df.index)
            print("☀️ allsky:", history_df["allsky_sfc_sw_dwn"].values)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # -----------------------------------------------------------------------------------
    # 5.3) Build the (1, 15, 17) window from history_df
    # -----------------------------------------------------------------------------------
    try:
        print("=== Raw 15h slice ===")
        print(history_df)  # should show 15 timestamps × 12 raw columns

        last_window = build_last_window_from_df(history_df, model_type)  # → (1, 15, 17)

        print("=== Scaled 15×17 window ===")
        print(
            np.nanmin(last_window, axis=(0, 1)),
            np.nanmax(last_window, axis=(0, 1))
        )
    except Exception as e:
        return jsonify({"error": f"Error building last window: {str(e)}"}), 500

    print(">>> last_window.shape:", last_window.shape)
    print(">>> last_window min/max per feature:",
          np.nanmin(last_window, axis=(0, 1)),
          np.nanmax(last_window, axis=(0, 1)))

    # -----------------------------------------------------------------------------------
    # 5.4) Predict the next 24 hours of scaled ALLSKY
    # -----------------------------------------------------------------------------------
    try:
        y_pred_scaled = model.predict(last_window)  # shape = (1, 24)
        y_pred_scaled = y_pred_scaled.flatten()     # shape = (24,)
        print("DEBUG: y_pred_scaled =", y_pred_scaled)
    except Exception as e:
        return jsonify({"error": f"Error during model.predict: {str(e)}"}), 500

    # -----------------------------------------------------------------------------------
    # 5.5) Invert‐scale back to real ALLSKY (W/m²)
    # -----------------------------------------------------------------------------------
    try:
        t_scaler   = load_target_scaler(model_type)
        real_preds = inverse_min_max_scale(y_pred_scaled, t_scaler)  # shape = (24,)
    except Exception as e:
        return jsonify({"error": f"Error inverse‐scaling predictions: {str(e)}"}), 500

    now_utc = datetime.utcnow().replace(minute=0, second=0, microsecond=0)

    day_ahead_vals = []
    for i, pred in enumerate(real_preds, start=1):
        # each prediction corresponds to (now_utc + i hours) in UTC
        ts_utc = now_utc + timedelta(hours=i)
        # shift to LST = UTC+1
        ts_lst = ts_utc + timedelta(hours=1)
        hour_lst = ts_lst.hour

        # If LST is “night” (before 6 AM or after 6 PM), clamp pred → 0
        if hour_lst < 6 or hour_lst > 18:
            day_ahead_vals.append(0.0)
        else:
            day_ahead_vals.append(float(pred))

    return jsonify({"day_ahead": day_ahead_vals}), 200


if __name__ == "__main__":
    # pick up the container’s port or fall back to 5000 locally
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

 
