import os
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models as db_models
from app.core.config import settings
from app.services.demo_service import get_demo_datasets

router = APIRouter()

VALID_BLOOD_GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
ABO_MAP = {"A+": "A", "A-": "A", "B+": "B", "B-": "B", "AB+": "AB", "AB-": "AB", "O+": "O", "O-": "O"}
RHD_MAP = {"A+": "+", "A-": "-", "B+": "+", "B-": "-", "AB+": "+", "AB-": "-", "O+": "+", "O-": "-"}

@router.get("")
def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(db_models.Dataset).order_by(db_models.Dataset.created_at.desc()).all()
    if not datasets and settings.DEMO_MODE:
        return get_demo_datasets()
    return [
        {
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "version": d.version,
            "image_count": d.image_count,
            "totalImages": d.image_count,
            "total_images": d.image_count,
            "validated": d.validated,
            "status": "ready" if d.validated else "processing",
            "class_distribution": d.class_distribution or {},
            "classDistribution": d.class_distribution or {},
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "createdAt": d.created_at.isoformat() if d.created_at else None,
            "validationReport": {
                "missingLabels": 0,
                "duplicateImages": 0,
                "corruptImages": 0
            },
            "is_demo": False,
            "isDemoData": False
        }
        for d in datasets
    ]

@router.post("/import")
async def import_dataset(
    name: str = Form(...),
    description: str = Form(""),
    csv_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Read and parse CSV
    csv_bytes = await csv_file.read()
    csv_text = csv_bytes.decode('utf-8')
    reader = csv.DictReader(io.StringIO(csv_text))
    
    required_columns = {'filename', 'blood_group'}
    if not required_columns.issubset(set(reader.fieldnames or [])):
        raise HTTPException(
            status_code=400,
            detail=f"CSV must contain columns: {required_columns}. Found: {reader.fieldnames}"
        )
    
    rows = list(reader)
    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    
    # Validate labels
    errors = []
    class_distribution = {}
    patient_ids = set()
    
    for i, row in enumerate(rows):
        bg = row.get('blood_group', '').strip()
        if bg not in VALID_BLOOD_GROUPS:
            errors.append(f"Row {i+2}: Invalid blood group '{bg}'")
        else:
            class_distribution[bg] = class_distribution.get(bg, 0) + 1
        
        pid = row.get('patient_id', '').strip()
        if pid:
            patient_ids.add(pid)
    
    if errors and len(errors) > 10:
        errors = errors[:10] + [f"... and {len(errors)-10} more errors"]
    
    # Create dataset
    dataset = db_models.Dataset(
        name=name,
        description=description,
        version="1.0",
        image_count=len(rows),
        validated=len(errors) == 0,
        class_distribution=class_distribution
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    
    # Create dataset images
    for row in rows:
        bg = row.get('blood_group', '').strip()
        img = db_models.DatasetImage(
            dataset_id=dataset.id,
            filename=row.get('filename', ''),
            filepath="",
            blood_group=bg if bg in VALID_BLOOD_GROUPS else None,
            abo_type=ABO_MAP.get(bg, ""),
            rhd_type=RHD_MAP.get(bg, ""),
            patient_id=row.get('patient_id', ''),
            is_valid=bg in VALID_BLOOD_GROUPS
        )
        db.add(img)
    db.commit()
    
    return {
        "id": dataset.id,
        "name": dataset.name,
        "image_count": len(rows),
        "class_distribution": class_distribution,
        "patient_count": len(patient_ids),
        "validation_errors": errors,
        "is_valid": len(errors) == 0
    }

@router.get("/{dataset_id}/summary")
def get_dataset_summary(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    # Get image stats
    from sqlalchemy import func
    total_images = db.query(db_models.DatasetImage).filter(
        db_models.DatasetImage.dataset_id == dataset_id
    ).count()
    valid_images = db.query(db_models.DatasetImage).filter(
        db_models.DatasetImage.dataset_id == dataset_id,
        db_models.DatasetImage.is_valid == True
    ).count()
    
    # Unique patients
    patient_count = db.query(func.count(func.distinct(db_models.DatasetImage.patient_id))).filter(
        db_models.DatasetImage.dataset_id == dataset_id,
        db_models.DatasetImage.patient_id != ""
    ).scalar() or 0
    
    return {
        "id": dataset.id, "name": dataset.name,
        "description": dataset.description,
        "total_images": total_images, "valid_images": valid_images,
        "patient_count": patient_count,
        "class_distribution": dataset.class_distribution,
        "validated": dataset.validated
    }

@router.post("/{dataset_id}/validate")
def validate_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(db_models.Dataset).filter(db_models.Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    issues = []
    images = db.query(db_models.DatasetImage).filter(
        db_models.DatasetImage.dataset_id == dataset_id
    ).all()
    
    # Check for missing labels
    missing = [img.filename for img in images if not img.blood_group]
    if missing:
        issues.append(f"{len(missing)} images missing blood group labels")
    
    # Check for duplicates
    from collections import Counter
    filenames = [img.filename for img in images]
    dupes = [f for f, c in Counter(filenames).items() if c > 1]
    if dupes:
        issues.append(f"{len(dupes)} duplicate filenames detected")
    
    # Check class balance
    if dataset.class_distribution:
        counts = list(dataset.class_distribution.values())
        if counts:
            ratio = max(counts) / max(min(counts), 1)
            if ratio > 10:
                issues.append(f"Severe class imbalance detected (max/min ratio: {ratio:.1f})")
    
    dataset.validated = len(issues) == 0
    db.commit()
    
    return {
        "dataset_id": dataset_id,
        "is_valid": len(issues) == 0,
        "issues": issues,
        "total_images": len(images),
        "valid_images": len([img for img in images if img.is_valid])
    }
