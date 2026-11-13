from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime

class HealthResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    status: str
    db_connected: bool
    models_available: bool

class DashboardSummary(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    total_datasets: int
    total_experiments: int
    total_models: int
    total_predictions: int
    is_demo_data: bool = False

class ImageValidationRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    filename: str
    size: int

class ImageValidationResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    is_valid: bool
    errors: List[str]

class PredictionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    image_id: int

class PredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    id: int
    predicted_class: str
    confidence: float
    class_scores: Dict[str, float]
    is_demo: bool
    disclaimer: str

class DatasetSummary(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    id: int
    name: str
    image_count: int
    class_distribution: Dict[str, int]

class DatasetCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    name: str
    description: str

class DatasetResponse(DatasetCreate):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    created_at: datetime

class ExperimentCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    name: str
    dataset_id: int
    model_architecture: str
    hyperparameters: Dict[str, Any]

class ExperimentResponse(ExperimentCreate):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    id: int
    status: str
    created_at: datetime

class ExperimentStatus(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    status: str
    training_progress: float

class ExperimentMetrics(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    accuracy: float
    f1_score: float

class ModelResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    id: int
    name: str
    is_active: bool

class ReportResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    id: int
    report_type: str
    filepath: str
