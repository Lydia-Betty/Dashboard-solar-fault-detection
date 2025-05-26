/* global Map */

// import * as tf from "@tensorflow/tfjs"
// import "@/app/lib/layers-browser"

// Cache loaded models to avoid re-fetching
const modelCache = new Map()

/**
 * Load a TensorFlow.js LayersModel by model type
 * @param {"lstm" | "bilstm" | "tr" | "tft"} modelType - one of 'lstm', 'bilstm', 'transformer', 'tft'
 * @returns {Promise<tf.LayersModel>} loaded and warmed-up model
 */
// export async function loadModel(modelType) {
//   // Return cached model if available
//   if (modelCache.has(modelType)) {
//     console.log(`Using cached ${modelType} model`)
//     return modelCache.get(modelType)
//   }

//   // Construct the public URL to the model JSON
//   const modelUrl = `/models/${modelType}/model.json`
//   console.log(`Loading model from: ${modelUrl}`)

//   try {
//     const model = await tf.loadLayersModel(modelUrl)
//     // Optional: warm up with a zero tensor (adjust shape as needed)
//     const inputShape = model.inputs[0].shape
//     if (inputShape) {
//       // Create a zero tensor with the correct shape
//       const zeros = tf.zeros(inputShape)
//       model.predict(zeros)
//       zeros.dispose()
//     }

//     modelCache.set(modelType, model)
//     console.log(`${modelType} model loaded successfully`)
//     return model
//   } catch (err) {
//     console.error(`Error loading ${modelType} model:`, err)
//     throw err
//   }
// }

// /**
//  * Make a prediction using the specified model
//  * @param {number[][] | tf.Tensor} rawInput - 2D array [timesteps][features] or a tf.Tensor of matching shape
//  * @param {"lstm" | "bilstm" | "transformer" | "tft"} modelType
//  * @returns {Promise<number[]>} flattened prediction array
//  */
// export async function predict(rawInput, modelType) {
//   // Ensure model is loaded
//   const model = await loadModel(modelType)

//   // Prepare tensor: if not already a tensor, wrap and add batch dimension
//   let inputTensor =
//     rawInput instanceof tf.Tensor
//       ? rawInput
//       : tf.tensor3d([rawInput]) // shape [1, timesteps, features]

//   try {
//     // Run prediction
//     const output = model.predict(inputTensor)
//     let data

//     if (output instanceof tf.Tensor) {
//       // Get raw values
//       data = Array.from(await output.data())
//       output.dispose()
//     } else {
//       throw new Error("Model output is not a Tensor")
//     }

//     return data
//   } catch (err) {
//     console.error(`Prediction error with ${modelType}:`, err)
//     throw err
//   } finally {
//     // Clean up
//     if (!(rawInput instanceof tf.Tensor)) {
//       inputTensor.dispose()
//     }
//   }
// }

/**
 * List available model types and metadata
 */
export function getAvailableModels() {
  return [
    { id: "lstm", name: "LSTM" },
    { id: "bilstm", name: "BiLSTM" },
    { id: "transformer", name: "Transformer" },
    { id: "tft", name: "Temporal Fusion Transformer" },
  ]
}
