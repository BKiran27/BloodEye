import os
import glob
import pandas as pd
import numpy as np
from sklearn.model_selection import GroupKFold

try:
    from ..config import BLOOD_GROUPS, ABO_GROUPS, RHD_GROUPS
except Exception:
    try:
        from ml.config import BLOOD_GROUPS, ABO_GROUPS, RHD_GROUPS
    except Exception:
        BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        ABO_GROUPS = ['A', 'B', 'AB', 'O']
        RHD_GROUPS = ['+', '-']

def parse_label(label):
    if label not in BLOOD_GROUPS:
        return None
    return BLOOD_GROUPS.index(label)

def build_dataset_from_directory(directory):
    images = glob.glob(os.path.join(directory, '*/*.jpg')) + glob.glob(os.path.join(directory, '*/*.png'))
    labels = []
    patient_ids = []
    
    for img_path in images:
        label_str = os.path.basename(os.path.dirname(img_path))
        label_idx = parse_label(label_str)
        if label_idx is None:
            continue
            
        filename = os.path.basename(img_path)
        patient_id = filename.split('_')[0] if '_' in filename else filename
        
        labels.append(label_idx)
        patient_ids.append(patient_id)
        
    df = pd.DataFrame({
        'filepath': images,
        'label': labels,
        'patient_id': patient_ids
    })
    return df

def build_dataset_from_csv(csv_path):
    df = pd.read_csv(csv_path)
    df['label'] = df['blood_group'].apply(parse_label)
    df = df.dropna(subset=['label'])
    return df

def split_dataset(df, n_splits=5):
    gkf = GroupKFold(n_splits=n_splits)
    train_idx, val_idx = next(gkf.split(df, df['label'], df['patient_id']))
    return df.iloc[train_idx], df.iloc[val_idx]

def compute_class_weights(labels):
    classes = np.unique(labels)
    counts = np.bincount(labels)
    total = len(labels)
    weight = total / (len(classes) * counts)
    return dict(zip(classes, weight))
