from tensorflow.keras.models import load_model
from models.custom_layers import LearnablePositionalEncoding, GRN
import tensorflow as tf

def load_model_for_type(model_type):
    custom_objects = {
        'GRN': GRN,
        'LearnablePositionalEncoding': LearnablePositionalEncoding
    }

    with tf.keras.utils.custom_object_scope(custom_objects):
        return load_model(f'models/{model_type}/model_{model_type}.keras')


