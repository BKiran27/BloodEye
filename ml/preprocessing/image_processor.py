import cv2
import numpy as np
from PIL import Image

def load_image(filepath):
    img = cv2.imread(filepath)
    if img is None:
        raise ValueError(f"Could not load image: {filepath}")
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

def detect_blur(image):
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()

def enhance_clahe(image):
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl,a,b))
    return cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)

def preprocess_image(image, target_size=(224, 224), apply_clahe=True):
    if apply_clahe:
        image = enhance_clahe(image)
    image = cv2.resize(image, target_size)
    image = image.astype(np.float32) / 255.0
    return image
