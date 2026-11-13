from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models as db_models

router = APIRouter()

@router.get("")
def list_models(db: Session = Depends(get_db)):
    models = db.query(db_models.TrainedModel).order_by(
        db_models.TrainedModel.created_at.desc()
    ).all()
    return [
        {
            "id": m.id, "name": m.name, "architecture": m.architecture,
            "version": m.version, "is_active": m.is_active,
            "experiment_id": m.experiment_id,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in models
    ]

@router.get("/{model_id}")
def get_model(model_id: int, db: Session = Depends(get_db)):
    model = db.query(db_models.TrainedModel).filter(db_models.TrainedModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return {
        "id": model.id, "name": model.name, "architecture": model.architecture,
        "filepath": model.filepath, "version": model.version,
        "is_active": model.is_active, "metadata": model.metadata_json,
        "experiment_id": model.experiment_id,
        "created_at": model.created_at.isoformat() if model.created_at else None
    }

@router.post("/{model_id}/activate")
def activate_model(model_id: int, db: Session = Depends(get_db)):
    model = db.query(db_models.TrainedModel).filter(db_models.TrainedModel.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Deactivate all others
    db.query(db_models.TrainedModel).update({"is_active": False})
    model.is_active = True
    db.commit()
    
    return {"message": f"Model '{model.name}' activated", "model_id": model.id}
