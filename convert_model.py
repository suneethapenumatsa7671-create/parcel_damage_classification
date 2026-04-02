"""
Convert resnet34_model.h5 to TFLite format (.tflite)
Run this script from the project root directory.
"""

import os
import tensorflow as tf

# ─── Paths ───────────────────────────────────────────────────────────────────
H5_PATH = os.path.join(os.path.dirname(__file__), "models", "resnet34_model.h5")
TFLITE_DIR = os.path.join(os.path.dirname(__file__), "models")
TFLITE_PATH = os.path.join(TFLITE_DIR, "resnet34_model.tflite")

# Also copy to mobile_app/models for Flet app usage
MOBILE_MODELS_DIR = os.path.join(os.path.dirname(__file__), "mobile_app", "models")
MOBILE_TFLITE_PATH = os.path.join(MOBILE_MODELS_DIR, "resnet34_model.tflite")

os.makedirs(MOBILE_MODELS_DIR, exist_ok=True)

# ─── Step 1: Load the .h5 model ──────────────────────────────────────────────
print(f"[1/4] Loading Keras model from: {H5_PATH}")
model = tf.keras.models.load_model(H5_PATH)
model.summary()

# ─── Step 2: Convert to TFLite ───────────────────────────────────────────────
print("\n[2/4] Converting to TFLite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)

# Optional: apply default optimizations (smaller size, faster inference)
converter.optimizations = [tf.lite.Optimize.DEFAULT]

tflite_model = converter.convert()

# ─── Step 3: Save .tflite files ──────────────────────────────────────────────
with open(TFLITE_PATH, "wb") as f:
    f.write(tflite_model)
print(f"[3/4] Saved TFLite model → {TFLITE_PATH}")

with open(MOBILE_TFLITE_PATH, "wb") as f:
    f.write(tflite_model)
print(f"       Also saved to    → {MOBILE_TFLITE_PATH}")

# ─── Step 4: Quick sanity check ──────────────────────────────────────────────
print("\n[4/4] Running sanity check...")
interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
interpreter.allocate_tensors()

input_details  = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print(f"  Input  shape : {input_details[0]['shape']}  dtype: {input_details[0]['dtype']}")
print(f"  Output shape : {output_details[0]['shape']}  dtype: {output_details[0]['dtype']}")

size_kb = os.path.getsize(TFLITE_PATH) / 1024
print(f"\n✅ Conversion complete!  Model size: {size_kb:.1f} KB")
print("   File saved at:", TFLITE_PATH)
