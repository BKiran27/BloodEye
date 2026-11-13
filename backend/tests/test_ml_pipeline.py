import numpy as np
import pandas as pd
import pytest

from app.ml.preprocessing.image_processor import detect_blur, enhance_clahe, preprocess_image
from app.ml.preprocessing.dataset_builder import split_dataset, compute_class_weights, parse_label
from app.ml.evaluator import evaluate_predictions, BLOOD_GROUPS
from app.ml.config import BLOOD_GROUPS as CONFIG_GROUPS

def test_parse_label():
    for i, bg in enumerate(CONFIG_GROUPS):
        assert parse_label(bg) == i
    assert parse_label("Unknown") is None

def test_image_processor_blur():
    # Sharp image: high frequency pattern
    sharp = np.zeros((100, 100, 3), dtype=np.uint8)
    sharp[::2, ::2] = 255
    sharp_blur_score = detect_blur(sharp)

    # Completely flat image: zero variance
    flat = np.ones((100, 100, 3), dtype=np.uint8) * 128
    flat_blur_score = detect_blur(flat)

    assert sharp_blur_score > flat_blur_score

def test_image_processor_clahe_and_resize():
    sample = np.random.randint(0, 255, (200, 300, 3), dtype=np.uint8)
    processed = preprocess_image(sample, target_size=(224, 224), apply_clahe=True)
    assert processed.shape == (224, 224, 3)
    assert processed.dtype == np.float32
    assert processed.max() <= 1.0
    assert processed.min() >= 0.0

def test_patient_level_split_no_leakage():
    # Create dataset with 10 patients, multiple images per patient
    records = []
    patients = [f"P_{i}" for i in range(10)]
    for p in patients:
        for img_idx in range(4): # 4 images per patient
            records.append({
                'filepath': f"img_{p}_{img_idx}.jpg",
                'label': img_idx % 8,
                'patient_id': p
            })
    df = pd.DataFrame(records)

    train_df, val_df = split_dataset(df, n_splits=5)

    train_patients = set(train_df['patient_id'].unique())
    val_patients = set(val_df['patient_id'].unique())

    # CRITICAL SCIENTIFIC INTEGRITY REQUIREMENT: zero patient overlap
    overlap = train_patients.intersection(val_patients)
    assert len(overlap) == 0, f"Patient leakage detected: {overlap}"
    assert len(train_df) > 0
    assert len(val_df) > 0
    assert len(train_df) + len(val_df) == len(df)

def test_compute_class_weights():
    # Heavily imbalanced: 90 of class 0, 10 of class 1
    labels = np.array([0] * 90 + [1] * 10)
    weights = compute_class_weights(labels)
    assert weights[1] > weights[0]
    assert pytest.approx(weights[1] / weights[0], 0.1) == 9.0

def test_evaluator_metrics():
    # 8 classes, synthetic ground truth and predictions
    np.random.seed(42)
    n_samples = 160
    y_true = np.random.randint(0, 8, size=n_samples)
    
    # Near random predictions (uniform distribution with noise)
    y_prob = np.random.dirichlet(np.ones(8), size=n_samples)
    
    results = evaluate_predictions(y_true, y_prob)

    assert "accuracy" in results
    assert "balanced_accuracy" in results
    assert "precision_score" in results
    assert "recall_score" in results
    assert "f1_score" in results
    assert "confusion_matrix" in results
    assert "per_class_metrics" in results
    assert results["random_baseline"] == 0.125
    assert results["test_set_size"] == n_samples
    assert len(results["confusion_matrix"]) == 8
    assert len(results["confusion_matrix"][0]) == 8
    assert len(results["per_class_metrics"]) == 8
