from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.schemas import HealthResponse
from sqlalchemy import text

router = APIRouter()

@router.get("", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False
    return HealthResponse(status="ok", db_connected=db_connected, models_available=True)
