
// import path from 'path';
// import * as dfd from 'danfojs';
// import fs from 'fs';
// import Papa from "papaparse";

// const tf = require('@tensorflow/tfjs-node');
// // Constants
// const LOOKBACK = 15;
// const EPSILON = 1e-5;
// const THRESH_RAIN = 0.2;
// const THRESH_CLOUD = 100;

// function cleanCSV(rawCSVText) {
//   const lines = rawCSVText.split(/\r?\n/);
//   const startIndex = lines.findIndex((line) =>
//     line.trim().startsWith("YEAR")
//   );
//   return lines.slice(startIndex).join("\n");
// }

// function createSequences(data, lookback, targetIndex) {
//     const X = [];
//     for (let i = 0; i < data.length - lookback; i++) {
//     X.push(data.slice(i, i + lookback));
//     }
//     return tf.tensor3d(X);
// }

// export async function preprocessCSVData(rawText, modelType) {
//     // Clean NASA-style headers or metadata
//     const cleanedText = cleanCSV(rawText);

//         // Parse CSV
//     const parsed = Papa.parse(cleanedText, {
//         header: true,
//         skipEmptyLines: true,
//     });

//     const data = parsed.data;

//     // Convert to DataFrame
//     const df = new dfd.DataFrame(data);
//     const lowerCols = df.columns.map(col => col.toLowerCase());
//     const renameDict = {};
//     df.columns.forEach((col, idx) => {
//     renameDict[col] = lowerCols[idx];
//     });
//     df.rename(renameDict, { inplace: true });

//     // Rename columns
//     df.rename({ mo: "month", dy: "day", hr: "hour" }, { inplace: true });
//     console.log("Available columns:", df.columns);


//     // Create date
//     const dateStrings = df.values.map(row =>
//     `${row[df.columns.indexOf("year")]}-${row[df.columns.indexOf("month")]}-${row[df.columns.indexOf("day")]} ${row[df.columns.indexOf("hour")]}:00:00`
//     );


//     df.addColumn("date", dateStrings, { inplace: true });
//     df.setIndex({ column: "date", drop: false, inplace: true });

//     // Drop original time columns
//     df.drop({ columns: ["year", "month", "day", "hour"], inplace: true });

//     // Replace -999 and fill NaN
//     df.replace({ "-999": NaN}, { inplace: true });

//     df.fillNa({ inplace: true });

//     // Add features
//     const clr = df["clrsky_sfc_sw_dwn"].values;
//     const all = df["allsky_sfc_sw_dwn"].values;

//     const cloudiness_ratio = all.map((val, i) => Math.min(val / (clr[i] + EPSILON), 1.0));
//     const cloud_diff = all.map((val, i) => Math.floor(val - clr[i]));

//     df.addColumn("cloudiness_ratio", cloudiness_ratio, { inplace: true });
//     df.addColumn("cloud_diff", cloud_diff, { inplace: true });

//     // Add back datetime parts
//     const dateObjs = df.index.map((str) => new Date(str));
//     ["hour_", "day_", "month_", "year_"].forEach((col) => {
//     if (df.columns.includes(col)) {
//         df.drop({ columns: [col], inplace: true });
//     }
//     });

//     // Confirm columns were actually removed
//     console.log("Columns after drop:", df.columns);

//     // Now add them
//     df.addColumn("hour_", dateObjs.map((d) => d.getHours()), { inplace: true });
//     df.addColumn("day_", dateObjs.map((d) => d.getDate()), { inplace: true });
//     df.addColumn("month_", dateObjs.map((d) => d.getMonth() + 1), { inplace: true });
//     df.addColumn("year_", dateObjs.map((d) => d.getFullYear()), { inplace: true });

//     // Feature columns
//     const features = [
//     "year_", "month_", "day_", "hour_",
//     "wd2m", "t2m", "rh2m", "ps", "prectotcorr",
//     "qv2m", "clrsky_sfc_sw_dwn", "tqv", "v10m", "u10m", "ws10m",
//     "cloudiness_ratio", "cloud_diff"
//     ];

//     // Ensure target column is not in DataFrame
//     if (df.columns.includes('allsky_sfc_sw_dwn')) {
//     df.drop({ columns: ['allsky_sfc_sw_dwn'], inplace: true });
//     }

//     const featureDf = df.loc({ columns: features });

//     console.log("Final selected features shape:", featureDf.shape);
//     console.log("Selected feature columns:", featureDf.columns);
//     // Load and apply scaler
//     const featureScalerPath = path.resolve(`public/models/${modelType}/scaler_features.json`);
//     const scalerParams = JSON.parse(fs.readFileSync(featureScalerPath, 'utf8'));

//     const min = scalerParams.min;
//     const max = scalerParams.max;
//     const [rangeMin, rangeMax] = scalerParams.feature_range;

//     function minMaxScale(data, min, max, rangeMin, rangeMax) {
//         return data.map(row =>
//             row.map((val, i) => {
//                 const denom = max[i] - min[i];
//                 if (denom === 0) return rangeMin;
//                     return ((val - min[i]) / denom) * (rangeMax - rangeMin) + rangeMin;
//             })
//         );
//     }

//     const scaled = minMaxScale(featureDf.values, min, max, rangeMin, rangeMax);

//     // Sequence
//     const inputTensor = createSequences(scaled, LOOKBACK);
//     // Add a dummy column to your tensor
//     const dummyColumn = tf.zeros([inputTensor.shape[0], inputTensor.shape[1], 1]);
//     const fixedInput = tf.concat([inputTensor, dummyColumn], -1);

//     console.log("Input tensor shape:", fixedInput.shape);

//     return fixedInput;
// }