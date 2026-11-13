import os
import io
import base64
import hashlib
from typing import Tuple, Dict, List, Optional
import numpy as np
from PIL import Image
import cv2

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.tiff', '.tif'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
MIN_IMAGE_DIM = 64
MAX_IMAGE_DIM = 10000

class ImageValidationResult:
    def __init__(self):
        self.is_valid = True
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.format: str = ""
        self.dimensions: Tuple[int, int] = (0, 0)
        self.file_size: int = 0
        self.quality_score: float = 0.0
        self.preprocessing_preview: Optional[str] = None

def validate_image_file(file_bytes: bytes, filename: str) -> ImageValidationResult:
    result = ImageValidationResult()
    result.file_size = len(file_bytes)
    
    # Check file extension
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        result.is_valid = False
        result.errors.append(f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
        return result
    
    # Check file size
    if result.file_size > MAX_FILE_SIZE:
        result.is_valid = False
        result.errors.append(f"File too large ({result.file_size / 1024 / 1024:.1f}MB). Max: {MAX_FILE_SIZE / 1024 / 1024:.0f}MB")
        return result
    
    if result.file_size < 1024:
        result.is_valid = False
        result.errors.append("File too small. Likely not a valid image.")
        return result
    
    # Try to open image
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
        img = Image.open(io.BytesIO(file_bytes))  # Re-open after verify
        result.format = img.format or ext.upper().replace('.', '')
        result.dimensions = img.size
    except Exception as e:
        result.is_valid = False
        result.errors.append(f"Cannot read image: {str(e)}")
        return result
    
    # Check dimensions
    w, h = result.dimensions
    if w < MIN_IMAGE_DIM or h < MIN_IMAGE_DIM:
        result.is_valid = False
        result.errors.append(f"Image too small ({w}x{h}). Minimum: {MIN_IMAGE_DIM}x{MIN_IMAGE_DIM}")
    if w > MAX_IMAGE_DIM or h > MAX_IMAGE_DIM:
        result.is_valid = False
        result.errors.append(f"Image too large ({w}x{h}). Maximum: {MAX_IMAGE_DIM}x{MAX_IMAGE_DIM}")
    
    # Quality assessment
    try:
        img_array = np.array(img.convert('RGB'))
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Blur detection (Laplacian variance)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian_var < 50:
            result.warnings.append(f"Image appears blurry (sharpness: {laplacian_var:.1f})")
        
        # Brightness check
        mean_brightness = np.mean(gray)
        if mean_brightness < 30:
            result.warnings.append(f"Image appears very dark (brightness: {mean_brightness:.0f}/255)")
        elif mean_brightness > 230:
            result.warnings.append(f"Image appears overexposed (brightness: {mean_brightness:.0f}/255)")
        
        # Quality score (0-1)
        sharpness_score = min(laplacian_var / 500, 1.0)
        brightness_score = 1.0 - abs(mean_brightness - 128) / 128
        result.quality_score = round(0.6 * sharpness_score + 0.4 * brightness_score, 3)
    except Exception:
        result.quality_score = 0.5
        result.warnings.append("Could not assess image quality")
    
    return result

def preprocess_image(file_bytes: bytes, target_size: int = 224) -> Dict:
    img = Image.open(io.BytesIO(file_bytes)).convert('RGB')
    img_array = np.array(img)
    
    # Apply CLAHE
    lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    lab[:, :, 0] = clahe.apply(lab[:, :, 0])
    enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
    
    # Resize
    resized = cv2.resize(enhanced, (target_size, target_size), interpolation=cv2.INTER_AREA)
    
    # Normalize to 0-1
    normalized = resized.astype(np.float32) / 255.0
    
    # Create preview image (base64)
    preview_img = Image.fromarray(resized)
    buffer = io.BytesIO()
    preview_img.save(buffer, format='PNG')
    preview_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return {
        "original_size": list(img.size),
        "processed_size": [target_size, target_size],
        "preview": f"data:image/png;base64,{preview_b64}",
        "preprocessing_steps": ["RGB conversion", "CLAHE enhancement", f"Resize to {target_size}x{target_size}", "Normalize to [0,1]"]
    }

def compute_file_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()
