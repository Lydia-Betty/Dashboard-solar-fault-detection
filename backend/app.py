from flask import Flask, request, jsonify
import os
from preprocess import preprocess
from model_loader import load_model_for_type
import numpy as np
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'temp_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
LOOKBACK = 15
EPSILON = 1e-5

FEATURES = [
  "year_", "month_", "day_", "hour_", "wd2m", "t2m", "rh2m", "ps", "prectotcorr",
  "qv2m", "clrsky_sfc_sw_dwn", "tqv", "v10m", "u10m", "ws10m",
  "cloudiness_ratio", "cloud_diff", "date_ts"
]

def multi_step_predict(model, last_window, last_dates, ts_min, ts_max, steps=24):
    history = last_window.copy()  # shape (LOOKBACK, features)
    dates   = list(last_dates)
    preds = []
    idx = {feat:i for i, feat in enumerate(FEATURES)}

    for _ in range(steps):
        x = history[np.newaxis, ...]  # shape (1, LOOKBACK, features)
        p = model.predict(x)[0, 0]    # single-step output
        preds.append(float(p))
        # advance timestamp by one hour
        next_dt = dates[-1] + pd.Timedelta(hours=1)
        dates.append(next_dt)
        # build next row: zeros except target index
        next_row = np.zeros(history.shape[1], dtype=np.float32)

        # 1) time features
        next_row[idx['year_']]   = next_dt.year
        next_row[idx['month_']]  = next_dt.month
        next_row[idx['day_']]    = next_dt.day
        next_row[idx['hour_']]   = next_dt.hour
        # 2) clear-sky irradiance: carry last known
        clr = history[-1, idx['clrsky_sfc_sw_dwn']]
        next_row[idx['clrsky_sfc_sw_dwn']] = clr
        # 3) recompute cloud ratios
        next_row[idx['cloudiness_ratio']] = min(p / (clr + EPSILON), 1.0)
        next_row[idx['cloud_diff']]       = int(p - clr)
        # 4) meteorology: carry last known values
        for m in ['wd2m','t2m','rh2m','ps','prectotcorr',
                  'qv2m','tqv','v10m','u10m','ws10m']:
            next_row[idx[m]] = history[-1, idx[m]]
        # 5) timestamp feature
        ts = next_dt.value // 10**9
        # (rescale to 0–1 exactly as in preprocess)
        # you could precompute min/max over your entire date index
        next_row[idx['date_ts']] = (ts - ts_min) / (ts_max - ts_min + 1e-8)
        history = np.vstack([history[1:], next_row])
    return preds

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files.get('file')
    model_type = request.form.get('model')

    if not file or not model_type:
        return jsonify({"error": "Missing file or model type"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        model = load_model_for_type(model_type)
        X = preprocess(file_path, model_type)
        print("Model input shape:", model.input_shape)

        df = pd.read_csv(file_path,
            skiprows=lambda x: x < 5 if "YEAR" not in open(file_path).readlines()[x] else False)
        
        df.columns = [c.lower() for c in df.columns]
        df.rename(columns={"mo":"month","dy":"day","hr":"hour"}, inplace=True)
        df["date"] = pd.to_datetime(df[['year','month','day','hour']])
        df.set_index('date', inplace=True)

        dates = df.index[LOOKBACK:]   # length = len(X)
        last_window = X[-1]           # shape (15,18)
        last_dates  = dates[-LOOKBACK:]
                # compute ts_min/ts_max exactly as in preprocess
        all_ts = df.index.astype(np.int64) // 10**9
        ts_min, ts_max = all_ts.min(), all_ts.max()


        one_step = model.predict(X).flatten().tolist()

            # 2) Build a 24h (or 48h) recursive forecast from the last window:
                # 4) 24‑hour recursive forecast
        day_ahead = multi_step_predict(
            model, last_window, last_dates, ts_min, ts_max, steps=24
        )

        return jsonify({"one_step": one_step, "day_ahead": day_ahead}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("ERROR MESSAGE:", str(e)) 
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
