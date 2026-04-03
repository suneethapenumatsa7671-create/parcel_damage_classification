"""
Router: /api/predict — Animal / Parcel image upload & damage prediction.
"""
import os
import uuid
import logging
import numpy as np
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse

from backend.schemas import PredictionResponse

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

# --------------------------------------------------------------------------- #
#  Model loading (loaded once at startup)                                      #
# --------------------------------------------------------------------------- #
BASE_DIR = Path(__file__).resolve().parent.parent.parent   # project root
MODEL_PATH = BASE_DIR / "models" / "resnet34_model.tflite"
MEDIA_DIR = BASE_DIR / "media" / "uploads"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

CLASS_NAMES = ["Not_Damaged", "Damaged"]
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

# Lazy-load the model to avoid import errors if TF is not installed
_model = None

def get_model():
    """Load TFLite model on first use."""
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            logger.error(f"Model file NOT found at: {MODEL_PATH}")
            raise RuntimeError(f"Model file not found at {MODEL_PATH}")
            
        try:
            logger.info(f"Loading TFLite model from {MODEL_PATH}...")
            from ai_edge_litert.interpreter import Interpreter
            # Load TFLite model and allocate tensors.
            _model = Interpreter(model_path=str(MODEL_PATH))
            _model.allocate_tensors()
            logger.info("TFLite Model loaded successfully.")
        except Exception as exc:
            logger.error(f"Failed to load TFLite model: {exc}")
            raise RuntimeError(f"Failed to load model: {exc}") from exc
    return _model


# --------------------------------------------------------------------------- #
#  POST /api/predict/upload                                                    #
# --------------------------------------------------------------------------- #
@router.post(
    "/upload",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload an animal / parcel image for damage prediction",
)
async def predict_damage(
    file: UploadFile = File(..., description="Image file to analyse (JPEG / PNG / BMP / WEBP)")
):
    """
    **Parcel / Animal damage prediction.**
    """
    # --- Validate extension ---
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        logger.warning(f"Rejected unsupported file type: {suffix}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type '{suffix}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # --- Save file ---
    unique_name = f"{uuid.uuid4().hex}{suffix}"
    save_path = MEDIA_DIR / unique_name
    try:
        contents = await file.read()
        with open(save_path, "wb") as f:
            f.write(contents)
        logger.info(f"Image saved to: {save_path}")
    except Exception as exc:
        logger.error(f"Save failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save file: {exc}",
        )

    # --- Pre-process image ---
    try:
        from PIL import Image
        img = Image.open(str(save_path)).resize((256, 256)).convert('RGB')
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
    except Exception as exc:
        logger.error(f"Pre-processing failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not process image: {exc}",
        )

    # --- Run model inference ---
    try:
        interpreter = get_model()
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        # Set input tensor. Convert float64 to float32
        interpreter.set_tensor(input_details[0]['index'], img_array.astype(np.float32))
        
        interpreter.invoke()
        
        prediction = interpreter.get_tensor(output_details[0]['index'])[0]
        logger.info(f"Inference output: {prediction}")
    except Exception as exc:
        logger.error(f"Inference failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed: {exc}",
        )

    # --- Decode prediction (mirrors Django predict_view logic) ---
    if len(prediction) == 1:                      # sigmoid output (binary)
        prob = float(prediction[0])
        if prob >= 0.6:
            predicted_class = "Damaged"
            confidence = prob
        elif prob <= 0.4:
            predicted_class = "Not_Damaged"
            confidence = 1 - prob
        else:
            predicted_class = "Non-Parcel Image"
            confidence = prob
    else:                                          # softmax output (multiclass)
        confidence = float(np.max(prediction))
        predicted_class = CLASS_NAMES[int(np.argmax(prediction))]
        if confidence < 0.60:
            predicted_class = "Non-Parcel Image"

    image_url = f"/media/uploads/{unique_name}"
    logger.info(f"Result: {predicted_class} (conf: {confidence:.2f})")

    return PredictionResponse(
        prediction=predicted_class,
        confidence=f"{confidence:.2f}",
        image_url=image_url,
        message=f"Prediction complete: {predicted_class} (confidence: {confidence:.2%})",
    )


# --------------------------------------------------------------------------- #
#  GET /api/predict/health                                                     #
# --------------------------------------------------------------------------- #
@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Health check – verify model is loaded",
    tags=["Prediction"],
)
def health_check():
    """
    Returns a simple health status.
    Attempts to load the model if not already loaded.
    """
    try:
        get_model()
        model_status = "loaded"
    except Exception:
        model_status = "failed_to_load"

    return {
        "status": "ok",
        "model_path": str(MODEL_PATH),
        "model_file_exists": MODEL_PATH.exists(),
        "model_status": model_status,
    }
