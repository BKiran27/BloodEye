# BloodEye — Experimental Blood Group Classification Using Eye Images

<p align="center">
  <strong>⚠️ RESEARCH DISCLAIMER ⚠️</strong><br>
  BloodEye is an <em>experimental research application</em> investigating whether retinal fundus images
  contain information predictive of ABO blood groups and RhD status. This is an <strong>unproven hypothesis</strong>.
  Predictions from this system are <strong>not clinically validated</strong> and must <strong>never</strong> be used
  for transfusion compatibility, medical diagnosis, or any clinical decision-making.
</p>

---

## Key Innovations & Advanced Oculomic Capabilities

### 1. Live Optical Biometric Capture Device
- **Real-Time Camera Feedback Loop**: Embedded canvas loop computing video frame sharpness (Laplacian variance), illumination uniformity, and pupil center tracking ($X, Y$).
- **Dual HUD Reticle Modes**: Switch between `IRIS RETICLE` (anterior segment/scleral targeting) and `FUNDUS HUD` (posterior pole optic disc alignment).
- **Auto-Capture on Biometric Lock**: Automatically triggers capture and analysis once stability and focus metrics exceed 85% for 1.2 continuous seconds.
- **Web Audio Sound Effects**: Synthesizes auditory feedback for camera lock, laser acquisition, and classification completion.

### 2. 15-Biomarker Oculomic Feature Extraction Pipeline
- **Multi-Scale Hessian Vesselness (Frangi Filter)**: Identifies tubular vascular structures while attenuating background choroidal pigment.
- **Fractal Dimension ($D_f$)**: Minkowski-Bouligand box-counting quantification of retinal microvascular branching complexity.
- **Arteriovenous Ratio (AVR)**: Quantitative measurement of arterial narrowing relative to venous caliber.
- **Vessel Tortuosity & Caliber**: Calculates curvature indices along central vascular pathways.
- **CIE-$L^*a^*b^*$ Hemoglobin Saturation Index**: Spectral erythema and redness chromaticity metric.
- **Optic Disc Contrast & Macular Perfusion**: Measures localized luminance and capillary arcade density.
- **Haralick GLCM Texture**: Energy, contrast, and homogeneity of the neuroretinal tissue.

### 3. Interactive Explainable AI (XAI) Studio
- **Multi-Colormap Grad-CAM++**: Jet (Thermal), Turbo (Google AI), Viridis (Perceptually Uniform), Inferno (High Contrast), and Hot.
- **Dual-View Modes**: Attention heatmap overlay, binary Frangi vessel mask, side-by-side comparison, and raw ocular scan.
- **Regional Saliency Decomposition**: Computes percentage gradient attribution concentrated on the Optic Disc, Macula, Peripheral Arcades, and Sclera.

### 4. Transfusion Compatibility & Safety Matrices
- **Whole Blood & Packed Red Blood Cells (pRBC)**: Universal donor ($O^-$) and universal recipient ($AB^+$) indicators.
- **Fresh Frozen Plasma (FFP) & Platelets**: Full plasma compatibility inversions ($AB^+$ plasma as universal donor).
- **Prominent Clinical Research Warnings**: Clear distinction between exploratory algorithmic predictions and certified serological crossmatching.

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Recharts, Vite |
| Backend | Python 3.11, FastAPI, SQLAlchemy, Pydantic |
| ML Pipeline | TensorFlow/Keras, OpenCV, Pillow, scikit-learn |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Explainable AI | Grad-CAM |
| Reports | ReportLab (PDF), CSV |
| Deployment | Docker, Docker Compose, Nginx |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm 9+
- (Optional) Docker & Docker Compose

### Local Development

#### 1. Clone and configure

```bash
git clone <repository-url>
cd bloodeye
cp .env.example .env
```

#### 2. Start the Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
API documentation: `http://localhost:8000/docs`

#### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`.

### Docker Deployment

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

## Project Structure

```
bloodeye/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/endpoints/    # API route handlers
│   │   ├── core/             # Configuration, logging
│   │   ├── db/               # Database models, session
│   │   ├── ml/               # ML integration (architectures, training, Grad-CAM)
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── services/         # Business logic services
│   │   └── utils/            # Constants, validators
│   ├── tests/                # Backend tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Utilities, demo data
│   ├── Dockerfile
│   └── nginx.conf
├── ml/                       # Standalone ML pipeline
│   ├── models/               # Model architectures
│   ├── training/             # Training pipeline
│   ├── evaluation/           # Evaluation and visualisation
│   └── preprocessing/        # Image preprocessing
├── data/                     # Data directory (gitignored)
│   ├── uploads/              # Uploaded images
│   ├── datasets/             # Imported datasets
│   └── models/               # Trained model artifacts
├── tests/                    # Integration tests
├── docs/                     # Documentation
├── scripts/                  # Utility scripts
├── docker-compose.yml
├── .env.example
└── README.md
```

## Blood Group Labels

The system supports eight blood group classifications:

| Label | ABO Type | RhD Status |
|-------|----------|------------|
| A+    | A        | Positive   |
| A-    | A        | Negative   |
| B+    | B        | Positive   |
| B-    | B        | Negative   |
| AB+   | AB       | Positive   |
| AB-   | AB       | Negative   |
| O+    | O        | Positive   |
| O-    | O        | Negative   |

Labels must come from independently verified medical records. The system never infers training labels from images.

## Dataset Requirements

To train a model, you need:

1. **Retinal fundus images** in JPEG, PNG, or TIFF format
2. **A CSV metadata file** with columns:
   - `filename` — image filename
   - `blood_group` — one of: A+, A-, B+, B-, AB+, AB-, O+, O-
   - `patient_id` — unique patient identifier (required for proper data splitting)

Example CSV:
```csv
filename,blood_group,patient_id
img_001.jpg,A+,P001
img_002.jpg,A+,P001
img_003.jpg,B-,P002
img_004.jpg,O+,P003
```

**Patient-level splitting**: Images from the same patient are always kept in the same partition (train, validation, or test) to prevent data leakage.

## ML Pipeline

### Model Architectures

1. **Baseline CNN**: Custom 4-block convolutional network
2. **EfficientNetB0**: Transfer learning from ImageNet
3. **ResNet50**: Transfer learning from ImageNet (alternative)

### Training

Via the web interface or CLI:

```bash
cd ml
python run_training.py \
    --data-dir ../data/datasets/my_dataset \
    --architecture efficientnet \
    --epochs 50 \
    --batch-size 32 \
    --learning-rate 0.001 \
    --image-size 224
```

### Evaluation Metrics

- Accuracy and Balanced Accuracy
- Precision, Recall, F1-Score (macro-averaged)
- ROC-AUC (one-vs-rest)
- Confusion Matrix
- Per-class metrics
- Calibration metrics (Brier score, ECE)
- Comparison against random baseline (12.5% for 8 classes)

## Demonstration Mode

When `DEMO_MODE=true` (default), the application displays clearly-labelled sample data to demonstrate the interface. All demonstration data is marked with banners and flags. No fabricated predictions are shown.

## API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health check |
| GET | `/api/dashboard/summary` | Dashboard statistics |
| POST | `/api/images/validate` | Validate uploaded image |
| POST | `/api/predictions` | Run blood group prediction |
| GET | `/api/datasets` | List datasets |
| POST | `/api/datasets/import` | Import dataset |
| POST | `/api/experiments` | Create experiment |
| POST | `/api/experiments/{id}/train` | Start model training |
| GET | `/api/experiments/{id}/metrics` | Get evaluation metrics |
| GET | `/api/models` | List trained models |
| POST | `/api/gradcam/generate` | Generate Grad-CAM visualisation |
| POST | `/api/reports/generate` | Generate report |

## Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Environment Variables

See [`.env.example`](.env.example) for all configuration options.

## Security Considerations

- Uploaded biomedical images are stored securely and not publicly accessible
- No unnecessary personal information is collected
- API endpoints validate all inputs
- File uploads are type-checked and size-limited
- CORS is configured for specific origins only

## Known Limitations

1. **Scientific validity**: There is no established evidence that retinal fundus images contain sufficient information to predict ABO blood groups. This is an exploratory research tool.
2. **Dataset availability**: No public retinal-fundus-to-blood-group dataset is currently known. Users must supply their own ethically-sourced, properly-labelled dataset.
3. **Performance expectations**: Model performance near the random baseline (12.5%) would suggest the hypothesis is not supported by the data.
4. **Clinical use**: This system is NOT approved for clinical use and must NEVER be used for transfusion compatibility decisions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Submit a pull request

## License

This project is for research and educational purposes.

---

<p align="center">
  <em>BloodEye is a research tool. It does not replace standard blood typing procedures.</em>
</p>
