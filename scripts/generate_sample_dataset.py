"""
BloodEye Synthetic Dataset Generator
Generates synthetic retinal fundus sample images and metadata CSV
for testing dataset import, validation, splitting, and ML pipelines.
"""

import os
import csv
import random
import numpy as np
from PIL import Image, ImageDraw

BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

def generate_fundus_like_image(size=(256, 256), seed=None):
    if seed is not None:
        random.seed(seed)
        np.random.seed(seed)
        
    width, height = size
    # Dark reddish/orange background typical of fundus images
    base_color = (random.randint(140, 180), random.randint(50, 80), random.randint(20, 40))
    img = Image.new("RGB", size, color=base_color)
    draw = ImageDraw.Draw(img)
    
    # Circular mask to simulate fundus aperture
    mask = Image.new("L", size, 0)
    mask_draw = ImageDraw.Draw(mask)
    margin = 8
    mask_draw.ellipse([margin, margin, width - margin, height - margin], fill=255)
    
    # Optic disc (bright yellow-orange circle)
    disc_x = random.randint(width // 4, width // 3)
    disc_y = random.randint(height // 3, height // 2)
    disc_radius = random.randint(16, 24)
    draw.ellipse(
        [disc_x - disc_radius, disc_y - disc_radius, disc_x + disc_radius, disc_y + disc_radius],
        fill=(random.randint(230, 255), random.randint(180, 210), random.randint(90, 130))
    )
    
    # Blood vessels radiating from optic disc
    for _ in range(12):
        points = [(disc_x, disc_y)]
        curr_x, curr_y = disc_x, disc_y
        angle = random.uniform(0, 2 * np.pi)
        length = random.randint(40, width // 2)
        step = 8
        for _ in range(length // step):
            curr_x += int(step * np.cos(angle) + random.randint(-2, 2))
            curr_y += int(step * np.sin(angle) + random.randint(-2, 2))
            points.append((curr_x, curr_y))
        
        vessel_color = (random.randint(70, 100), random.randint(10, 25), random.randint(10, 20))
        draw.line(points, fill=vessel_color, width=random.randint(1, 3))
    
    # Apply circular aperture
    black_bg = Image.new("RGB", size, (5, 5, 5))
    final_img = Image.composite(img, black_bg, mask)
    return final_img

def create_sample_dataset(output_dir="./data/datasets/sample_retina_cohort", num_patients=16, images_per_patient=2):
    os.makedirs(output_dir, exist_ok=True)
    images_dir = os.path.join(output_dir, "images")
    os.makedirs(images_dir, exist_ok=True)
    
    csv_path = os.path.join(output_dir, "metadata.csv")
    rows = []
    
    print(f"Generating synthetic cohort: {num_patients} patients, {images_per_patient} images/patient...")
    
    image_count = 0
    for p_idx in range(1, num_patients + 1):
        patient_id = f"PID_{p_idx:03d}"
        patient_bg = random.choice(BLOOD_GROUPS)
        
        for img_idx in range(1, images_per_patient + 1):
            image_count += 1
            filename = f"fundus_{patient_id}_img{img_idx}.jpg"
            file_path = os.path.join(images_dir, filename)
            
            img = generate_fundus_like_image(size=(224, 224), seed=p_idx * 100 + img_idx)
            img.save(file_path, "JPEG", quality=90)
            
            rows.append({
                "filename": filename,
                "blood_group": patient_bg,
                "patient_id": patient_id,
                "eye": "OD" if img_idx == 1 else "OS",
                "verified_by": "Clinical-Lab-Certified"
            })
            
    # Write metadata.csv
    with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
        fieldnames = ["filename", "blood_group", "patient_id", "eye", "verified_by"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
        
    print(f"Done! Created {image_count} images in {images_dir}")
    print(f"Metadata file: {csv_path}")

if __name__ == "__main__":
    create_sample_dataset()
