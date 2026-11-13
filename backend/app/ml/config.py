import os

# ML Configuration
DEFAULT_IMAGE_SIZE = (224, 224)
AVAILABLE_ARCHITECTURES = ['baseline_cnn', 'efficientnetb0', 'resnet50']
BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
ABO_GROUPS = ['A', 'B', 'AB', 'O']
RHD_GROUPS = ['+', '-']
DEFAULT_SEED = 42

AUGMENTATION_PARAMS = {
    'rotation_range': 20,
    'width_shift_range': 0.1,
    'height_shift_range': 0.1,
    'horizontal_flip': True,
    'brightness_range': [0.8, 1.2],
    'zoom_range': 0.1
}

# IMPORTANT DISCLAIMER
DISCLAIMER = """
DISCLAIMER: This is an experimental research project.
The hypothesis that retinal images can predict blood groups is UNPROVEN and highly speculative.
All performance metrics should be evaluated against random baselines (e.g., 12.5% for 8-class classification).
Never fabricate results. This code is for experimental and exploratory purposes only.
"""
