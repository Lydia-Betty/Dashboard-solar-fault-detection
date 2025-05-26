from tensorflow.keras.utils import register_keras_serializable
from tensorflow.keras.layers import Layer
import tensorflow as tf

@register_keras_serializable()
class GRN(Layer):
    def __init__(self, hidden_units, dropout_rate=0.1, **kwargs):
        super().__init__(**kwargs)
        self.hidden_units = hidden_units
        self.dropout_rate = dropout_rate

    def build(self, input_shape):
        self.fc1 = tf.keras.layers.Dense(self.hidden_units, activation='elu')
        self.fc2 = tf.keras.layers.Dense(input_shape[-1])
        self.dropout = tf.keras.layers.Dropout(self.dropout_rate)
        self.gate = tf.keras.layers.Dense(input_shape[-1], activation='sigmoid')
        self.layer_norm = tf.keras.layers.LayerNormalization()
        super().build(input_shape)

    def call(self, inputs):
        x = self.fc1(inputs)
        x = self.dropout(x)
        x = self.fc2(x)
        gate = self.gate(x)
        out = gate * x + (1 - gate) * inputs
        return self.layer_norm(out)

    def get_config(self):
        config = super().get_config()
        config.update({
            "hidden_units": self.hidden_units,
            "dropout_rate": self.dropout_rate
        })
        return config

# Load the .keras model with custom GRN
model = tf.keras.models.load_model("model_tft_transformer.keras", custom_objects={"GRN": GRN})

# Save to .h5 format
model.save("model_tft_transformer.h5", save_format="h5")
