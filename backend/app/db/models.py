from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, JSON, DateTime, Enum
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    version = Column(String)
    image_count = Column(Integer)
    validated = Column(Boolean, default=False)
    class_distribution = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class DatasetImage(Base):
    __tablename__ = "dataset_images"
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    filename = Column(String)
    filepath = Column(String)
    blood_group = Column(String)
    abo_type = Column(String)
    rhd_type = Column(String)
    patient_id = Column(String)
    is_valid = Column(Boolean, default=True)
    validation_errors = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Experiment(Base):
    __tablename__ = "experiments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    model_architecture = Column(String)
    hyperparameters = Column(JSON)
    status = Column(String, default="created")
    training_progress = Column(Float, default=0.0)
    training_logs = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

class ExperimentMetrics(Base):
    __tablename__ = "experiment_metrics"
    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"))
    accuracy = Column(Float)
    balanced_accuracy = Column(Float)
    precision_score = Column(Float)
    recall_score = Column(Float)
    f1_score = Column(Float)
    roc_auc = Column(Float)
    confusion_matrix = Column(JSON)
    per_class_metrics = Column(JSON)
    calibration_metrics = Column(JSON)
    training_curves = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TrainedModel(Base):
    __tablename__ = "trained_models"
    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"))
    name = Column(String)
    architecture = Column(String)
    filepath = Column(String)
    version = Column(String)
    is_active = Column(Boolean, default=False)
    metadata_json = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("trained_models.id"))
    image_filename = Column(String)
    image_filepath = Column(String)
    predicted_class = Column(String)
    confidence = Column(Float)
    class_scores = Column(JSON)
    gradcam_path = Column(String)
    preprocessing_info = Column(JSON)
    is_demo = Column(Boolean, default=False)
    disclaimer = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    experiment_id = Column(Integer, ForeignKey("experiments.id"))
    report_type = Column(String)
    filepath = Column(String)
    format = Column(String)
    metadata_json = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    entity_type = Column(String)
    entity_id = Column(Integer)
    details = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
