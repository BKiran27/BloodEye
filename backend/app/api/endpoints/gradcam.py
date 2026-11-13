from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models as db_models
from app.services.prediction_service import run_model_inference
from typing import Optional

router = APIRouter()

@router.post("/generate")
async def generate_gradcam(
    file: UploadFile = File(...),
    colormap: Optional[str] = Query("jet"),
    model_id: Optional[int] = Form(None),
    target_class: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty image uploaded.")

    # Get active or selected model
    if model_id:
        model = db.query(db_models.TrainedModel).filter(db_models.TrainedModel.id == model_id).first()
    else:
        model = db.query(db_models.TrainedModel).filter(db_models.TrainedModel.is_active == True).first()
    
    result = run_model_inference(file_bytes, model, colormap=colormap or "jet")

    return {
        "available": True,
        "model_id": model.id if model else 1,
        "model_name": model.name if model else "BloodEye-CNN-Biometric-v2.5",
        "predicted_class": target_class or result["predicted_class"],
        "confidence": result["confidence"],
        "gradcam_overlay": result["gradcam_overlay"],
        "vessel_mask_overlay": result["vessel_mask_overlay"],
        "regional_saliency": result.get("regional_saliency", {}),
        "colormap_used": colormap or "jet",
        "disclaimer": "Highlighted regions in Grad-CAM visualisations do not prove that the model has identified biologically meaningful blood-group features. They highlight microvascular and optic disc regions contributing highest activation to final convolutional logits."
    }

@router.get("/{prediction_id}")
def get_gradcam(prediction_id: int, db: Session = Depends(get_db)):
    pred = db.query(db_models.Prediction).filter(db_models.Prediction.id == prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    if not pred.gradcam_path:
        return {
            "prediction_id": prediction_id,
            "available": False,
            "message": "No Grad-CAM visualisation available for this prediction.",
            "disclaimer": "Highlighted regions do not prove biologically meaningful features."
        }
    
    return {
        "prediction_id": prediction_id,
        "available": True,
        "gradcam_path": pred.gradcam_path,
        "predicted_class": pred.predicted_class,
        "confidence": pred.confidence,
        "disclaimer": "Highlighted regions in Grad-CAM visualisations do not prove that the model has identified biologically meaningful blood-group features."
    }
