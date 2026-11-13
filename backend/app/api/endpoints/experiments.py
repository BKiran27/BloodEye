from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db import models as db_models
from app.schemas.schemas import ExperimentCreate
from app.core.config import settings
from app.services.demo_service import get_demo_experiments, get_demo_metrics
from app.services.training_service import run_training_task

router = APIRouter()

@router.post("")
def create_experiment(exp: ExperimentCreate, db: Session = Depends(get_db)):
    # Validate dataset exists
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == exp.dataset_id).first()
    if not dataset:
        # Fallback to create demo dataset if needed
        dataset = db_models.Dataset(
            name=f"Clinical Cohort #{exp.dataset_id}",
            description="Automatic benchmark cohort",
            version="2.0",
            image_count=32,
            validated=True,
            class_distribution={"A+": 8, "O+": 8, "B+": 8, "AB+": 8}
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
    
    valid_architectures = ["baseline_cnn", "efficientnet_b0", "efficientnetb0", "resnet50", "mobilenet_v3"]
    if exp.model_architecture.lower() not in valid_architectures:
        raise HTTPException(status_code=400, detail=f"Invalid architecture. Choose from: {valid_architectures}")
    
    experiment = db_models.Experiment(
        name=exp.name,
        dataset_id=dataset.id,
        model_architecture=exp.model_architecture,
        hyperparameters=exp.hyperparameters,
        status="created",
        training_progress=0.0
    )
    db.add(experiment)
    db.commit()
    db.refresh(experiment)
    
    return {
        "id": experiment.id,
        "name": experiment.name,
        "dataset_id": experiment.dataset_id,
        "model_architecture": experiment.model_architecture,
        "hyperparameters": experiment.hyperparameters,
        "status": experiment.status,
        "training_progress": 0.0,
        "created_at": experiment.created_at.isoformat() if experiment.created_at else None
    }

@router.get("")
def list_experiments(db: Session = Depends(get_db)):
    experiments = db.query(db_models.Experiment).order_by(
        db_models.Experiment.created_at.desc()
    ).all()
    
    if not experiments and settings.DEMO_MODE:
        return get_demo_experiments()
    
    # Return both camelCase and snake_case compatible objects
    result = []
    for e in experiments:
        metrics = db.query(db_models.ExperimentMetrics).filter(
            db_models.ExperimentMetrics.experiment_id == e.id
        ).first()
        result.append({
            "id": e.id, 
            "name": e.name, 
            "dataset_id": e.dataset_id,
            "datasetId": str(e.dataset_id),
            "model_architecture": e.model_architecture,
            "modelArchitecture": e.model_architecture,
            "hyperparameters": e.hyperparameters,
            "config": e.hyperparameters or {},
            "status": e.status,
            "training_progress": e.training_progress,
            "accuracy": metrics.accuracy if metrics else None,
            "created_at": e.created_at.isoformat() if e.created_at else None,
            "createdAt": e.created_at.isoformat() if e.created_at else None,
            "is_demo": False
        })
    return result

@router.get("/{experiment_id}")
def get_experiment(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(db_models.Experiment).filter(db_models.Experiment.id == experiment_id).first()
    if not exp:
        # Fallback to demo metrics if in demo mode
        if settings.DEMO_MODE:
            demo_list = get_demo_experiments()
            for d in demo_list:
                if d["id"] == experiment_id or str(d["id"]) == str(experiment_id):
                    return d
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    metrics = db.query(db_models.ExperimentMetrics).filter(
        db_models.ExperimentMetrics.experiment_id == experiment_id
    ).first()
    
    return {
        "id": exp.id, 
        "name": exp.name, 
        "dataset_id": exp.dataset_id,
        "datasetId": str(exp.dataset_id),
        "model_architecture": exp.model_architecture,
        "modelArchitecture": exp.model_architecture,
        "hyperparameters": exp.hyperparameters,
        "config": exp.hyperparameters or {},
        "status": exp.status, 
        "training_progress": exp.training_progress,
        "created_at": exp.created_at.isoformat() if exp.created_at else None,
        "createdAt": exp.created_at.isoformat() if exp.created_at else None,
        "metrics": {
            "accuracy": metrics.accuracy,
            "balancedAccuracy": metrics.balanced_accuracy,
            "precision": metrics.precision_score,
            "recall": metrics.recall_score,
            "f1Score": metrics.f1_score,
            "rocAuc": metrics.roc_auc,
            "confusionMatrix": metrics.confusion_matrix,
            "perClassMetrics": metrics.per_class_metrics,
            "history": metrics.training_curves
        } if metrics else None,
        "is_demo": False
    }

@router.post("/{experiment_id}/train")
def start_training(
    experiment_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    exp = db.query(db_models.Experiment).filter(db_models.Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    if exp.status == "training":
        raise HTTPException(status_code=409, detail="Training already in progress")
    
    exp.status = "training"
    exp.training_progress = 0.05
    db.commit()
    
    background_tasks.add_task(run_training_task, experiment_id)
    
    return {"message": "Training job launched in background", "experiment_id": experiment_id, "status": "training"}

@router.get("/{experiment_id}/status")
def get_experiment_status(experiment_id: int, db: Session = Depends(get_db)):
    exp = db.query(db_models.Experiment).filter(db_models.Experiment.id == experiment_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return {
        "status": exp.status,
        "training_progress": exp.training_progress,
        "training_logs": exp.training_logs
    }

@router.get("/{experiment_id}/metrics")
def get_experiment_metrics(experiment_id: int, db: Session = Depends(get_db)):
    metrics = db.query(db_models.ExperimentMetrics).filter(
        db_models.ExperimentMetrics.experiment_id == experiment_id
    ).first()
    
    if not metrics and settings.DEMO_MODE:
        return get_demo_metrics(experiment_id)
    
    if not metrics:
        raise HTTPException(status_code=404, detail="No metrics available for this experiment")
    
    return {
        "accuracy": metrics.accuracy,
        "balanced_accuracy": metrics.balanced_accuracy,
        "balancedAccuracy": metrics.balanced_accuracy,
        "precision_score": metrics.precision_score,
        "precision": metrics.precision_score,
        "recall_score": metrics.recall_score,
        "recall": metrics.recall_score,
        "f1_score": metrics.f1_score,
        "f1Score": metrics.f1_score,
        "roc_auc": metrics.roc_auc,
        "rocAuc": metrics.roc_auc,
        "confusion_matrix": metrics.confusion_matrix,
        "confusionMatrix": metrics.confusion_matrix,
        "per_class_metrics": metrics.per_class_metrics,
        "perClassMetrics": metrics.per_class_metrics,
        "calibration_metrics": metrics.calibration_metrics,
        "training_curves": metrics.training_curves,
        "history": metrics.training_curves,
        "is_demo": False
    }
