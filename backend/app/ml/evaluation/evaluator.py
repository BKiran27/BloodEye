import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, accuracy_score, balanced_accuracy_score, precision_recall_fscore_support

def evaluate_model(model, test_data, test_labels, num_classes=8):
    preds = model.predict(test_data)
    pred_labels = np.argmax(preds, axis=1)
    true_labels = test_labels # assuming sparse for true_labels
    
    acc = accuracy_score(true_labels, pred_labels)
    bacc = balanced_accuracy_score(true_labels, pred_labels)
    p, r, f1, _ = precision_recall_fscore_support(true_labels, pred_labels, average='macro')
    
    try:
        # For one-hot encoded true labels
        roc_auc = roc_auc_score(tf.keras.utils.to_categorical(true_labels, num_classes), preds, multi_class='ovr', average='macro')
    except:
        roc_auc = None
        
    cm = confusion_matrix(true_labels, pred_labels)
    
    results = {
        'accuracy': acc,
        'balanced_accuracy': bacc,
        'precision_macro': p,
        'recall_macro': r,
        'f1_macro': f1,
        'roc_auc_macro': roc_auc,
        'confusion_matrix': cm.tolist(),
        'random_baseline': 1.0 / num_classes
    }
    return results
