import numpy as np
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    roc_auc_score,
    brier_score_loss
)
from sklearn.preprocessing import label_binarize

BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

def evaluate_predictions(y_true, y_prob, blood_groups=BLOOD_GROUPS):
    """
    Evaluates predictions against true labels with complete biomedical metrics.
    y_true: 1D array of integer class indices
    y_prob: 2D array of predicted probabilities shape (N, num_classes)
    """
    y_true = np.asarray(y_true)
    y_prob = np.asarray(y_prob)
    num_classes = len(blood_groups)
    
    y_pred = np.argmax(y_prob, axis=1)
    
    acc = float(accuracy_score(y_true, y_pred))
    bacc = float(balanced_accuracy_score(y_true, y_pred))
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(
        y_true, y_pred, average='macro', zero_division=0
    )
    
    # Per-class metrics
    p_cls, r_cls, f1_cls, support = precision_recall_fscore_support(
        y_true, y_pred, average=None, labels=range(num_classes), zero_division=0
    )
    per_class = {}
    for i, bg in enumerate(blood_groups):
        per_class[bg] = {
            'precision': round(float(p_cls[i]), 4),
            'recall': round(float(r_cls[i]), 4),
            'f1': round(float(f1_cls[i]), 4),
            'support': int(support[i])
        }
    
    # ROC-AUC calculation (One-vs-Rest)
    roc_auc = None
    try:
        if len(np.unique(y_true)) > 1:
            y_true_bin = label_binarize(y_true, classes=range(num_classes))
            roc_auc = float(roc_auc_score(y_true_bin, y_prob, multi_class='ovr', average='macro'))
    except Exception:
        roc_auc = None

    # Calibration: multi-class Brier score
    try:
        y_true_bin = label_binarize(y_true, classes=range(num_classes))
        brier = float(np.mean(np.sum((y_prob - y_true_bin) ** 2, axis=1)))
    except Exception:
        brier = None

    cm = confusion_matrix(y_true, y_pred, labels=range(num_classes)).tolist()
    
    return {
        'accuracy': round(acc, 4),
        'balanced_accuracy': round(bacc, 4),
        'precision_score': round(float(p_macro), 4),
        'recall_score': round(float(r_macro), 4),
        'f1_score': round(float(f1_macro), 4),
        'roc_auc': round(roc_auc, 4) if roc_auc is not None else None,
        'brier_score': round(brier, 4) if brier is not None else None,
        'confusion_matrix': cm,
        'per_class_metrics': per_class,
        'random_baseline': round(1.0 / num_classes, 4),
        'test_set_size': int(len(y_true))
    }

def evaluate_model(model, test_data, test_labels, blood_groups=BLOOD_GROUPS):
    preds = model.predict(test_data, verbose=0)
    return evaluate_predictions(test_labels, preds, blood_groups=blood_groups)
