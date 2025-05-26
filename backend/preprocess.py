# preprocess.py
import pandas as pd
import numpy as np
import json
from sklearn.preprocessing import MinMaxScaler
from flask import jsonify

LOOKBACK = 15
EPSILON = 1e-5

def load_scaler(model_type):
    with open(f'models/{model_type}/scaler_features.json', 'r') as f:
        scaler_params = json.load(f)
    return scaler_params

def min_max_scale(data, scaler_params):
    min_vals = np.array(scaler_params['min'])
    max_vals = np.array(scaler_params['max'])
    range_min, range_max = scaler_params['feature_range']
    denom = max_vals - min_vals + 1e-8
    return ((data - min_vals) / denom) * (range_max - range_min) + range_min

def create_sequences(data, lookback):
    X = []
    for i in range(len(data) - lookback):
        X.append(data[i:i+lookback])
    return np.array(X)

def preprocess(file_path, model_type):
    try:
        df = pd.read_csv(file_path, skiprows=lambda x: x < 5 if "YEAR" not in open(file_path).readlines()[x] else False)
        
        df.columns = [c.lower() for c in df.columns]
        df.rename(columns={"mo": "month", "dy": "day", "hr": "hour"}, inplace=True)
        
        df["date"] = pd.to_datetime(df[['year', 'month', 'day', 'hour']])
        df.set_index("date", inplace=True)
        df.drop(columns=["year", "month", "day", "hour"], inplace=True)

        # Create timestamp feature (do NOT include in scaling)
        date_ts = df.index.astype(np.int64) // 10**9

        df.replace([-999], np.nan, inplace=True)
        df.ffill(inplace=True)
        df.bfill(inplace=True)

        df['cloudiness_ratio'] = np.minimum(df['allsky_sfc_sw_dwn'] / (df['clrsky_sfc_sw_dwn'] + EPSILON), 1.0)
        df['cloud_diff'] = (df['allsky_sfc_sw_dwn'].fillna(0) - df['clrsky_sfc_sw_dwn'].fillna(0)).astype(int)


        df['hour_'] = df.index.hour
        df['day_'] = df.index.day
        df['month_'] = df.index.month
        df['year_'] = df.index.year

        features = [
            "year_", "month_", "day_", "hour_", "wd2m", "t2m", "rh2m", "ps", "prectotcorr",
            "qv2m", "clrsky_sfc_sw_dwn", "tqv", "v10m", "u10m", "ws10m",
            "cloudiness_ratio", "cloud_diff"
        ]

        df = df[features]
        scaler_params = load_scaler(model_type)
        scaled_data = min_max_scale(df.values, scaler_params)

                # Scale date_ts to 0-1 range and combine with scaled meteorological features
        date_array = date_ts.values.astype(np.float64)
            # ensure no NaNs in date_array by filling if any
        if np.isnan(date_array).any():
            date_array = pd.Series(date_array).fillna(method='ffill').fillna(method='bfill').values
        date_scaled = (date_array - date_array.min()) / (date_array.max() - date_array.min() + 1e-8)
        date_col = date_scaled.reshape(-1,1)
        full_data = np.hstack([scaled_data, date_col]) 
            # verify no NaNs
        if np.isnan(full_data).any():
            full_data = np.nan_to_num(full_data, nan=0.0, posinf=0.0, neginf=0.0)

        X = create_sequences(full_data, LOOKBACK)

        return X
    except Exception as e:
        raise
