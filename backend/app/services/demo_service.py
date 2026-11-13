from datetime import datetime, timedelta
import random

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

def get_demo_dashboard():
    return {
        "total_images": 1247,
        "validated_images": 1180,
        "total_datasets": 3,
        "total_experiments": 8,
        "total_models": 4,
        "total_predictions": 156,
        "active_model": None,
        "class_distribution": {
            "A+": 312, "A-": 78, "B+": 187, "B-": 45,
            "AB+": 89, "AB-": 23, "O+": 398, "O-": 115
        },
        "recent_experiments": [
            {
                "id": 1, "name": "Baseline CNN v1", "status": "completed",
                "architecture": "baseline_cnn", "accuracy": 0.138,
                "created_at": (datetime.utcnow() - timedelta(days=5)).isoformat(),
                "is_demo": True
            },
            {
                "id": 2, "name": "EfficientNet Transfer", "status": "completed",
                "architecture": "efficientnet_b0", "accuracy": 0.152,
                "created_at": (datetime.utcnow() - timedelta(days=3)).isoformat(),
                "is_demo": True
            },
            {
                "id": 3, "name": "ResNet50 Fine-tune", "status": "training",
                "architecture": "resnet50", "accuracy": None,
                "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                "is_demo": True
            },
        ],
        "recent_predictions": [],
        "is_demo": True,
        "disclaimer": "All data shown is for demonstration purposes only and does not represent actual experimental results."
    }

def get_demo_experiments():
    experiments = []
    configs = [
        ("Baseline CNN v1", "baseline_cnn", "completed", 0.138, 50),
        ("EfficientNet B0 Transfer", "efficientnet_b0", "completed", 0.152, 75),
        ("ResNet50 Fine-tune", "resnet50", "completed", 0.141, 60),
        ("Baseline CNN v2 (augmented)", "baseline_cnn", "completed", 0.145, 100),
        ("EfficientNet (unfrozen)", "efficientnet_b0", "training", None, 50),
    ]
    for i, (name, arch, status, acc, epochs) in enumerate(configs, 1):
        experiments.append({
            "id": i,
            "name": name,
            "dataset_id": 1,
            "model_architecture": arch,
            "hyperparameters": {
                "epochs": epochs, "batch_size": 32,
                "learning_rate": 0.001, "image_size": 224,
                "seed": 42
            },
            "status": status,
            "training_progress": 1.0 if status == "completed" else 0.67,
            "accuracy": acc,
            "created_at": (datetime.utcnow() - timedelta(days=10-i*2)).isoformat(),
            "is_demo": True
        })
    return experiments

def get_demo_metrics(experiment_id: int = 1):
    # Note: These metrics are near random baseline (12.5%) as expected for an unproven hypothesis
    return {
        "accuracy": 0.138,
        "balanced_accuracy": 0.131,
        "precision_score": 0.135,
        "recall_score": 0.131,
        "f1_score": 0.128,
        "roc_auc": 0.52,
        "confusion_matrix": [
            [5,3,2,1,2,0,4,1],
            [2,1,1,0,1,0,2,1],
            [3,1,3,1,1,0,3,1],
            [1,0,1,1,0,0,1,0],
            [2,1,1,0,1,0,1,1],
            [0,0,0,0,0,0,1,0],
            [4,2,3,1,2,0,6,2],
            [1,1,1,0,1,0,2,2],
        ],
        "per_class_metrics": {
            bg: {
                "precision": round(random.uniform(0.08, 0.20), 3),
                "recall": round(random.uniform(0.08, 0.20), 3),
                "f1": round(random.uniform(0.08, 0.18), 3),
                "support": [39, 10, 24, 6, 11, 3, 50, 13][i]
            }
            for i, bg in enumerate(BLOOD_GROUPS)
        },
        "training_curves": {
            "train_loss": [2.08, 2.05, 2.03, 2.01, 1.99, 1.98, 1.97, 1.97, 1.96, 1.96],
            "val_loss": [2.08, 2.06, 2.05, 2.05, 2.06, 2.07, 2.07, 2.08, 2.08, 2.09],
            "train_accuracy": [0.12, 0.13, 0.13, 0.14, 0.14, 0.15, 0.15, 0.16, 0.16, 0.17],
            "val_accuracy": [0.12, 0.13, 0.13, 0.13, 0.14, 0.13, 0.13, 0.14, 0.13, 0.14]
        },
        "calibration_metrics": {"brier_score": 0.123, "ece": 0.089},
        "test_set_size": 156,
        "random_baseline": 0.125,
        "is_demo": True,
        "disclaimer": "DEMONSTRATION DATA: These metrics are illustrative examples showing performance near random baseline (12.5% for 8 classes). They do not represent actual experimental results."
    }

def get_demo_datasets():
    return [
        {
            "id": 1, "name": "Retinal Fundus Dataset v1",
            "description": "Demonstration dataset entry - no actual images",
            "version": "1.0", "image_count": 1247, "validated": True,
            "class_distribution": {
                "A+": 312, "A-": 78, "B+": 187, "B-": 45,
                "AB+": 89, "AB-": 23, "O+": 398, "O-": 115
            },
            "created_at": (datetime.utcnow() - timedelta(days=30)).isoformat(),
            "is_demo": True
        }
    ]
