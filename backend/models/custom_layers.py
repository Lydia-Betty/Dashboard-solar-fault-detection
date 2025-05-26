import tensorflow as tf
from tensorflow.keras.layers import Layer

class LearnablePositionalEncoding(tf.keras.layers.Layer):
    def __init__(self, seq_len, d_model, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.seq_len = seq_len
        self.d_model = d_model

    def build(self, input_shape):
        self.pos_embedding = self.add_weight(
            name="pos_embedding",
            shape=(1, self.seq_len, self.d_model),
            initializer='random_normal',
            trainable=True
        )
        super().build(input_shape)

    def call(self, x, **kwargs):
        return x + self.pos_embedding

    def get_config(self):
        config = super().get_config()
        config.update({
            'seq_len': self.seq_len,
            'd_model': self.d_model
        })
        return config

class GRN(tf.keras.layers.Layer):
    def __init__(self, hidden_units, dropout_rate=0.1, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.hidden_units = hidden_units
        self.dropout_rate = dropout_rate

    def build(self, input_shape):
        self.fc1 = tf.keras.layers.Dense(self.hidden_units, activation='elu')
        self.fc2 = tf.keras.layers.Dense(input_shape[-1])
        self.dropout = tf.keras.layers.Dropout(self.dropout_rate)
        self.gate = tf.keras.layers.Dense(input_shape[-1], activation='sigmoid')
        self.layer_norm = tf.keras.layers.LayerNormalization()
        super().build(input_shape)

    def call(self, inputs, training=None, **kwargs):
        x = self.fc1(inputs)
        x = self.dropout(x)
        x = self.dropout(x, training=training)
        x = self.fc2(x)
        gate = self.gate(x)
        out = gate * x + (1 - gate) * inputs
        return self.layer_norm(out)

    def get_config(self):
        config = super().get_config()
        config.update({
            'hidden_units': self.hidden_units,
            'dropout_rate': self.dropout_rate
        })
        return config
