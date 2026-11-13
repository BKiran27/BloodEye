# BloodEye API Documentation

## Base URL

- Development: `http://localhost:8000`
- Production: configured via environment variable

## Authentication

Currently, API endpoints are unauthenticated for development purposes.
Production deployment should add JWT-based authentication.

## Common Response Format

All API responses follow this structure:

```json
{
  "status": "success" | "error",
  "data": { ... },
  "message": "Optional message",
  "is_demo": false
}
```

When `is_demo` is `true`, the response contains demonstration data, not actual experimental results.

## Endpoints

### Health

#### GET /api/health

Check system health and component status.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "model_available": false,
  "demo_mode": true,
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

### Dashboard

#### GET /api/dashboard/summary

Get dashboard statistics.

**Response:**
```json
{
  "total_images": 0,
  "validated_images": 0,
  "total_datasets": 0,
  "total_experiments": 0,
  "total_models": 0,
  "active_model": null,
  "class_distribution": {},
  "recent_experiments": [],
  "recent_predictions": [],
  "is_demo": true
}
```

---

### Images

#### POST /api/images/validate

Validate an uploaded image.

**Request:** `multipart/form-data`
- `file`: Image file (JPEG, PNG, TIFF)

**Response:**
```json
{
  "is_valid": true,
  "filename": "retina_001.jpg",
  "format": "JPEG",
  "dimensions": [2048, 1536],
  "file_size_bytes": 1234567,
  "quality_score": 0.85,
  "issues": [],
  "preprocessing_preview": "base64_encoded_image"
}
```

#### POST /api/images/preprocess

Preprocess an image and return the result.

**Request:** `multipart/form-data`
- `file`: Image file
- `target_size`: Optional target dimensions (default: 224)

**Response:** Preprocessed image as base64 with metadata.

---

### Predictions

#### POST /api/predictions

Run a blood group prediction on an uploaded image.

**Request:** `multipart/form-data`
- `file`: Retinal image file

**Response (model available):**
```json
{
  "id": 1,
  "predicted_class": "A+",
  "confidence": 0.34,
  "class_scores": {
    "A+": 0.34, "A-": 0.12, "B+": 0.08, "B-": 0.11,
    "AB+": 0.09, "AB-": 0.07, "O+": 0.13, "O-": 0.06
  },
  "disclaimer": "This is an experimental research prediction...",
  "gradcam_available": true,
  "is_demo": false
}
```

**Response (no model):**
```json
{
  "status": "error",
  "message": "No trained research model is available. Upload a suitable labelled dataset and train or register a model before running predictions."
}
```

#### GET /api/predictions/{id}

Get a specific prediction result.

#### GET /api/predictions

List all predictions. Supports pagination with `skip` and `limit` query parameters.

---

### Datasets

#### GET /api/datasets

List all datasets.

#### POST /api/datasets/import

Import a new dataset.

**Request:** `multipart/form-data`
- `name`: Dataset name
- `description`: Optional description
- `csv_file`: CSV metadata file
- `images`: Multiple image files

#### GET /api/datasets/{id}/summary

Get dataset statistics including class distribution, validation status, and image counts.

#### POST /api/datasets/{id}/validate

Validate dataset integrity and report issues.

---

### Experiments

#### POST /api/experiments

Create a new experiment.

**Request:**
```json
{
  "name": "Experiment 1",
  "dataset_id": 1,
  "model_architecture": "efficientnet_b0",
  "hyperparameters": {
    "epochs": 50,
    "batch_size": 32,
    "learning_rate": 0.001,
    "image_size": 224,
    "train_split": 0.7,
    "val_split": 0.15,
    "test_split": 0.15,
    "seed": 42
  }
}
```

#### GET /api/experiments

List all experiments.

#### GET /api/experiments/{id}

Get experiment details.

#### POST /api/experiments/{id}/train

Start model training as a background task.

#### GET /api/experiments/{id}/status

Get training status and progress.

**Response:**
```json
{
  "status": "training",
  "progress": 0.45,
  "current_epoch": 23,
  "total_epochs": 50,
  "current_loss": 1.82,
  "current_accuracy": 0.28
}
```

#### GET /api/experiments/{id}/metrics

Get evaluation metrics for a completed experiment.

---

### Models

#### GET /api/models

List all trained models.

#### GET /api/models/{id}

Get model details.

#### POST /api/models/{id}/activate

Set a model as the active prediction model.

---

### Grad-CAM

#### POST /api/gradcam/generate

Generate Grad-CAM visualisation.

**Request:** `multipart/form-data`
- `file`: Image file
- `model_id`: Model to use
- `target_class`: Optional target class

#### GET /api/gradcam/{prediction_id}

Get Grad-CAM visualisation for an existing prediction.

---

### Reports

#### POST /api/reports/generate

Generate a report.

**Request:**
```json
{
  "experiment_id": 1,
  "report_type": "evaluation",
  "format": "pdf"
}
```

#### GET /api/reports

List generated reports.

#### GET /api/reports/{id}/download

Download a report file.

---

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "detail": "Human-readable error message",
  "error_code": "SPECIFIC_ERROR_CODE"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 422 | Invalid request data |
| `NOT_FOUND` | 404 | Resource not found |
| `NO_MODEL` | 400 | No trained model available |
| `INVALID_IMAGE` | 400 | Image validation failed |
| `TRAINING_IN_PROGRESS` | 409 | Training already running |
| `INTERNAL_ERROR` | 500 | Server error |
