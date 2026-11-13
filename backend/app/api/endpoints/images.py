import io
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from app.services.image_service import validate_image_file, preprocess_image

router = APIRouter()

@router.post("/validate")
async def validate_image(file: UploadFile = File(...)):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    
    result = validate_image_file(file_bytes, file.filename or "unknown")
    
    return {
        "is_valid": result.is_valid,
        "filename": file.filename,
        "format": result.format,
        "dimensions": list(result.dimensions),
        "file_size_bytes": result.file_size,
        "quality_score": result.quality_score,
        "errors": result.errors,
        "warnings": result.warnings,
    }

@router.post("/preprocess")
async def preprocess_uploaded_image(
    file: UploadFile = File(...),
    target_size: int = Query(224, ge=32, le=512)
):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    
    validation = validate_image_file(file_bytes, file.filename or "unknown")
    if not validation.is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid image: {'; '.join(validation.errors)}")
    
    result = preprocess_image(file_bytes, target_size)
    return result
