import io
import pytest
from PIL import Image

def create_test_image_bytes(format="JPEG", size=(256, 256), color=(200, 100, 50)):
    buf = io.BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    return buf.getvalue()

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "db_connected" in data
    assert data["db_connected"] is True

def test_dashboard_summary_demo(client):
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_datasets" in data
    assert "total_experiments" in data
    assert "total_models" in data
    assert "class_distribution" in data
    assert "is_demo" in data
    assert "disclaimer" in data

def test_validate_valid_image(client):
    img_bytes = create_test_image_bytes()
    files = {"file": ("test_retina.jpg", img_bytes, "image/jpeg")}
    response = client.post("/api/images/validate", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["filename"] == "test_retina.jpg"
    assert data["format"] == "JPEG"
    assert data["dimensions"] == [256, 256]

def test_validate_invalid_image_type(client):
    files = {"file": ("test.txt", b"not an image", "text/plain")}
    response = client.post("/api/images/validate", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert len(data["errors"]) > 0

def test_preprocess_image(client):
    img_bytes = create_test_image_bytes(size=(300, 300))
    files = {"file": ("test_retina.png", img_bytes, "image/png")}
    response = client.post("/api/images/preprocess?target_size=224", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["processed_size"] == [224, 224]
    assert "preview" in data
    assert data["preview"].startswith("data:image/png;base64,")

def test_dataset_import_and_list(client):
    csv_content = """filename,blood_group,patient_id
eye_001.jpg,A+,P100
eye_002.jpg,O-,P101
eye_003.jpg,B+,P100
"""
    files = {
        "csv_file": ("metadata.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }
    data = {
        "name": "Test Cohort Alpha",
        "description": "Validation test dataset"
    }
    response = client.post("/api/datasets/import", data=data, files=files)
    assert response.status_code == 200
    resp_data = response.json()
    assert resp_data["name"] == "Test Cohort Alpha"
    assert resp_data["image_count"] == 3
    assert resp_data["patient_count"] == 2
    assert resp_data["is_valid"] is True
    dataset_id = resp_data["id"]

    # List datasets
    list_resp = client.get("/api/datasets")
    assert list_resp.status_code == 200
    datasets = list_resp.json()
    assert any(d["id"] == dataset_id for d in datasets)

    # Dataset summary
    sum_resp = client.get(f"/api/datasets/{dataset_id}/summary")
    assert sum_resp.status_code == 200
    assert sum_resp.json()["total_images"] == 3

def test_experiment_creation_and_listing(client):
    # First create a dataset
    csv_content = "filename,blood_group,patient_id\neye_1.jpg,A+,P1\n"
    files = {"csv_file": ("test.csv", io.BytesIO(csv_content.encode()), "text/csv")}
    d_resp = client.post("/api/datasets/import", data={"name": "Exp Dataset"}, files=files)
    dataset_id = d_resp.json()["id"]

    # Create experiment
    exp_payload = {
        "name": "Test Baseline Run",
        "dataset_id": dataset_id,
        "model_architecture": "baseline_cnn",
        "hyperparameters": {
            "epochs": 20,
            "batch_size": 16,
            "learning_rate": 0.001
        }
    }
    exp_resp = client.post("/api/experiments", json=exp_payload)
    assert exp_resp.status_code == 200
    exp_data = exp_resp.json()
    assert exp_data["name"] == "Test Baseline Run"
    assert exp_data["model_architecture"] == "baseline_cnn"
    exp_id = exp_data["id"]

    # List experiments
    list_resp = client.get("/api/experiments")
    assert list_resp.status_code == 200
    exps = list_resp.json()
    assert any(e["id"] == exp_id for e in exps)

def test_predictions_endpoint(client):
    img_bytes = create_test_image_bytes()
    files = {"file": ("query_eye.jpg", img_bytes, "image/jpeg")}
    response = client.post("/api/predictions", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_class" in data
    assert data["predicted_class"] in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    assert "confidence" in data
    assert "class_scores" in data
    assert "abo_type" in data
    assert "rhd_type" in data
    assert "disclaimer" in data

def test_report_generation(client):
    response = client.post("/api/reports/generate", json={"format": "csv"})
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    content = response.text
    assert "BloodEye - Experimental Research Report" in content
    assert "DISCLAIMER" in content
