import os
import random
import hashlib
import numpy as np
import tensorflow as tf
from .config import BLOOD_GROUPS, ABO_GROUPS, RHD_GROUPS

def set_all_seeds(seed=42):
    os.environ['PYTHONHASHSEED'] = str(seed)
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)

def encode_label(blood_group):
    if blood_group in BLOOD_GROUPS:
        return BLOOD_GROUPS.index(blood_group)
    return -1

def decode_label(index):
    if 0 <= index < len(BLOOD_GROUPS):
        return BLOOD_GROUPS[index]
    return "Unknown"

def separate_abo_rhd(blood_group):
    if not blood_group:
        return None, None
    if blood_group.endswith('+') or blood_group.endswith('-'):
        return blood_group[:-1], blood_group[-1]
    return blood_group, None

def combine_abo_rhd(abo, rhd):
    return f"{abo}{rhd}"

def calculate_file_hash(filepath):
    hasher = hashlib.md5()
    try:
        with open(filepath, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()
    except Exception:
        return None

def package_model_artifact(model_path, config, metrics):
    pass
