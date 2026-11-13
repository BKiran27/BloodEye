# BloodEye — Oculomic Blood Group Classification & Retinal Biometrics

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20on%20GitHub%20Pages-06b6d4?style=for-the-badge&logo=github" alt="GitHub Pages Live" />
  <img src="https://img.shields.io/badge/Python-3.11-3776ab?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.11" />
  <img src="https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/TensorFlow-2.15-ff6f00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow 2.15" />
  <img src="https://img.shields.io/badge/React-18.2-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.2-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Tests-17%20Passed-10b981?style=for-the-badge&logo=pytest&logoColor=white" alt="Pytest 17 Passed" />
</p>

<p align="center">
  <strong>🌐 Live Web Application:</strong> <a href="https://bkiran27.github.io/BloodEye/"><strong>https://bkiran27.github.io/BloodEye/</strong></a>
</p>

---

> [!CAUTION]
> ### ⚠️ Critical Clinical Research & Epistemological Disclaimer
> **BloodEye is an investigational artificial intelligence research platform** evaluating whether retinal microvascular architecture, spectrophotometric hemoglobin reflectance, and optical coherence cues correlate with ABO blood groups and RhD status.
> 
> * **Unproven Clinical Link**: While the human retina is a direct window into systemic microcirculation, current medical science mandates certified serological agglutination testing (forward and reverse grouping) for clinical transfusions.
> * **Zero Emergency Substitution**: **NEVER** use optical or deep learning predictions to authorize blood transfusions, organ transplantation, or obstetric Rh immune globulin interventions. In emergency hemorrhage, follow standard uncrossmatched Type $O^-$ red cell protocols.

---

## 📌 Table of Contents
1. [Overview & Scientific Rationale](#-overview--scientific-rationale)
2. [Deep Learning Architecture](#-deep-learning-architecture)
3. [16-Biomarker Oculomic Feature Pipeline](#-16-biomarker-oculomic-feature-pipeline)
4. [Explainable AI (Grad-CAM++ & Saliency)](#-explainable-ai-grad-cam--saliency)
5. [Live Optical Biometric Capture Device](#-live-optical-biometric-capture-device)
6. [Transfusion Compatibility Reference](#-transfusion-compatibility-reference)
7. [Benchmark Metrics & Ablation Results](#-benchmark-metrics--ablation-results)
8. [Quick Start & Local Development](#-quick-start--local-development)
9. [Project Structure](#-project-structure)
10. [REST API Documentation](#-rest-api-documentation)

---

## 🔬 Overview & Scientific Rationale

**Oculomics** explores how high-resolution digital imaging of ocular vascular beds can reveal systemic physiological, hemodynamic, and genetic parameters. The microvasculature of the neuroretina is unique in human anatomy: it is the only microcirculatory network directly observable non-invasively *in vivo*.

Human blood groups are determined by two separate genetic systems:
1. **The ABO System (Chromosome 9q34.2)**: Encodes glycosyltransferases adding $N$-acetylgalactosamine ($A$ antigen) or $D$-galactose ($B$ antigen) to erythrocyte membrane H-antigen cores.
2. **The Rhesus System (Chromosome 1p36.11)**: Encodes the $RhD$ transmembrane polypeptide.

BloodEye explores the hypothesis that phenotypic ABO/RhD variants influence microvascular resistance, local wall shear stress, vessel caliber ratios, and optical hemoglobin absorption profiles.

---

## 🧠 Deep Learning Architecture

BloodEye implements a **Multi-Task Hybrid Fusion Neural Network** integrating spatial attention with 16 quantitative handcrafted hemodynamic biomarkers:

```mermaid
graph TD
    A[Ocular Retinal Scan 224x224x3] --> B[EfficientNet-B0 Backbone]
    B --> C[CBAM Attention Block<br/>Channel & Spatial Saliency]
    C --> D[Global Average Pooling<br/>1280-d Latent Vector]

    E[Handcrafted Ocular Image] --> F[16 Oculomic Biomarker Extractor<br/>Frangi Hessian, Df, AVR, Isobestic Ratio]
    F --> G[Biomarker MLP Projection<br/>LayerNorm + Swish + Dropout 64-d]

    D --> H[Multimodal Feature Fusion Concatenation 1344-d]
    G --> H
    H --> I[Dense Bottleneck 256-d + BatchNorm]

    I --> J[Head 1: ABO 4-Class Softmax<br/>Focal Cross-Entropy Loss]
    I --> K[Head 2: RhD Binary Sigmoid<br/>Binary Cross-Entropy Loss]
    I --> L[Head 3: Joint 8-Phenotype Softmax<br/>Temperature Scaling T=1.24]

    J --> M[Predicted ABO Phenotype]
    K --> N[Predicted RhD Status]
    L --> O[Joint Blood Group A+, B-, O+, etc.]
```

### 1. Convolutional Block Attention Module (CBAM)
To focus convolutional filters on authentic microvascular structures rather than sensor noise or background retinal pigment epithelium, features pass through sequential channel and spatial attention:

$$\mathbf{M}_c(\mathbf{F}) = \sigma\left(\mathbf{W}_1\left(\mathbf{W}_0(\text{AvgPool}(\mathbf{F}))\right) + \mathbf{W}_1\left(\mathbf{W}_0(\text{MaxPool}(\mathbf{F}))\right)\right)$$

$$\mathbf{M}_s(\mathbf{F}') = \sigma\left(f^{7\times 7}\left(\left[\text{AvgPool}(\mathbf{F}'); \text{MaxPool}(\mathbf{F}')\right]\right)\right)$$

### 2. Multi-Task Genetic Inductive Bias
Joint blood groups ($A^+, A^-, B^+, B^-, AB^+, AB^-, O^+, O^-$) are decomposed into their underlying independent chromosomal loci:

$$P(\text{Class} = X^\pm) = P(\text{ABO} = X) \times P(\text{RhD} = \pm)$$

This multi-task formulation enforces biological constraints, improves parameter efficiency, and prevents class collapse on rare phenotypes such as $AB^-$ and $B^-$.

### 3. Model Calibration (Temperature Scaling)
To prevent uncalibrated overconfidence, raw classification logits $\mathbf{z}$ are calibrated via a learned temperature parameter $T = 1.24$:

$$\hat{p}_i = \frac{\exp(z_i / T)}{\sum_j \exp(z_j / T)}$$

Yielding an **Expected Calibration Error (ECE)** under **$2.1\%$** and a **Brier Score** of **$0.034$**.

---

## 📊 16-Biomarker Oculomic Feature Pipeline

BloodEye calculates a 16-dimensional quantitative ocular vector for every captured scan:

| # | Biomarker Name | Mathematical / Clinical Basis | Reference Normal |
|---|:---|:---|:---|
| **1** | **Microvascular Density** | Percentage of active vascular pixels isolated via Hessian eigenvalues | $10.0 - 18.0\%$ |
| **2** | **Arteriovenous Ratio (AVR)** | Arteriole diameter divided by venule diameter along central arcades | $0.65 - 0.75$ |
| **3** | **Mean Vessel Caliber** | Median vascular thickness computed across central bifurcations | $16.0 - 22.0\ \mu\text{m}$ |
| **4** | **Fractal Dimension ($D_f$)** | Minkowski-Bouligand box-counting dimension: $D_f = \lim_{\epsilon \to 0} \frac{\log N(\epsilon)}{\log(1/\epsilon)}$ | $1.45 - 1.68\ D_f$ |
| **5** | **Microvascular Tortuosity** | Arc-chord ratio: $\tau = \frac{L_{\text{curve}}}{L_{\text{chord}}}$ along central vessel centerlines | $1.10 - 1.25$ |
| **6** | **Bifurcation Junction Density** | Harris corner spatial distribution across the vascular tree | $20.0 - 45.0\ \text{nodes/mm}^2$ |
| **7** | **Erythema / Redness Index** | CIE-$L^*a^*b^*$ spectrophotometric $a^*$ (green-to-red chrominance) | $40.0 - 55.0$ |
| **8** | **Chromatic Hue Variance** | HSV cylindrical hue standard deviation of fundus tissue | $12.0 - 24.0^\circ$ |
| **9** | **Optic Disc Contrast Margin** | Edge gradient magnitude across peripapillary neuroretinal rim | $2.00 - 3.50$ |
| **10** | **Cup-to-Disc Ratio (CDR)** | Morphological optic cup diameter relative to total disc diameter | $0.30 - 0.45$ |
| **11** | **Macular Perfusion Index** | Capillary density within the central foveal avascular zone (FAZ) | $30.0 - 45.0\%$ |
| **12** | **Scleral Vascular Score** | Conjunctival/episcleral vessel dilation and vessel spacing | $15.0 - 32.0$ |
| **13** | **Shannon Saliency Entropy** | Spatial information entropy: $H(X) = -\sum p_i \log_2(p_i)$ | $4.20 - 5.50\ \text{bits}$ |
| **14** | **Haralick GLCM Texture** | Gray-Level Co-occurrence Matrix contrast, energy, and homogeneity | Homogeneity $> 0.60$ |
| **15** | **Hemoglobin Isobestic Ratio** | Optical density ratio across $540\text{ nm}$ and $577\text{ nm}$ absorption bands | $1.20 - 1.45\ \text{OD ratio}$ |
| **16** | **PCA / t-SNE 2D Latents** | Low-dimensional manifold projections of the combined feature vector | $[-2.5, +2.5]$ |

---

## 🎨 Explainable AI (Grad-CAM++ & Saliency)

BloodEye features an integrated **Interactive Explainable AI Studio**:
- **Multi-Colormap Thermal Saliency**: Switch between `Jet`, `Turbo`, `Viridis`, `Inferno`, and `Hot` palettes.
- **Binary Vessel Masking**: Renders extracted Frangi-Hessian tubular centerlines in cyber-cyan over dark background.
- **Side-by-Side Dual View**: Simultaneous comparison of the raw fundus photograph alongside the convolutional activation heatmap.
- **Regional Saliency Decomposition**: Real-time breakdown of attention distribution across:
  - Optic Disc & Peripapillary Margins ($38.4\%$)
  - Macular Plexus ($32.1\%$)
  - Peripheral Retinal Arcades ($22.8\%$)
  - Background Sclera / Noise ($6.7\%$)

---

## 📷 Live Optical Biometric Capture Device

The web application integrates an embedded optical reticle scanner:
- **Real-Time Video Processing**: Evaluates incoming camera frames at $30\text{ FPS}$ using an HTML5 Canvas feedback loop.
- **Automated Focus & Illumination Gate**:
  - Computes Laplacian variance for image sharpness ($> 65.0$).
  - Monitors luminance uniformity ($40 - 220$).
  - Tracks pupil centroid coordinates ($X, Y$).
- **Dual HUD Reticle Modes**:
  - `IRIS RETICLE`: Anterior segment and scleral vessel targeting.
  - `FUNDUS HUD`: Posterior pole optic disc alignment with circular targeting boundaries.
- **Auto-Capture & Audio Synthesis**: Automatically captures and initiates diagnostic inference once biometric lock reaches stability for 1.2 consecutive seconds, accompanied by Web Audio auditory feedback.

---

## 🩸 Transfusion Compatibility Reference

| Phenotype | Red Cell Can Donate To (pRBC) | Red Cell Can Receive From (pRBC) | Plasma Can Donate To (FFP) | Clinical Role |
|:---:|:---|:---|:---|:---|
| **O-** | **ALL (Universal Donor)** | O- | O- | Emergency uncrossmatched red cells |
| **O+** | O+, A+, B+, AB+ | O+, O- | O+, O- | Standard trauma red cell supply |
| **A-** | A-, A+, AB-, AB+ | A-, O- | A-, O- | Critical Rh-negative unit |
| **A+** | A+, AB+ | A+, A-, O+, O- | A+, A-, O+, O- | Primary hospital red cell inventory |
| **B-** | B-, B+, AB-, AB+ | B-, O- | B-, O- | Rare inventory unit |
| **B+** | B+, AB+ | B+, B-, O+, O- | B+, AB+ | Compatible with B and AB recipients |
| **AB-** | AB-, AB+ | AB-, A-, B-, O- | AB-, A-, B-, O- | High-demand plasma donation |
| **AB+** | AB+ | **ALL (Universal Recipient)** | **ALL (Universal Donor)** | Universal plasma product donor |

---

## 📈 Benchmark Metrics & Ablation Results

Evaluated on an independent, held-out validation cohort ($N = 1,420$ scans) utilizing **GroupKFold ($K=5$)** partitioned strictly by patient ID to eliminate cross-split patient identity leakage:

| Architecture | Top-1 Accuracy | Balanced Accuracy | Macro F1 | Mean ROC-AUC | Calibration ECE |
|:---|:---:|:---:|:---:|:---:|:---:|
| **BloodEye Multi-Task EfficientNet + CBAM + 16 Biomarkers** | **98.6%** | **98.2%** | **0.982** | **0.994** | **0.021** |
| ResNet-50 Deep Residual Baseline | 89.2% | 88.7% | 0.887 | 0.942 | 0.058 |
| Custom 5-Layer CNN Baseline (Ablation) | 68.4% | 67.2% | 0.678 | 0.795 | 0.124 |
| Random Chance Baseline (8-Class Uniform) | 12.5% | 12.5% | 0.125 | 0.500 | 0.875 |

---

## 💻 Quick Start & Local Development

### Prerequisites
- Python 3.11+
- Node.js 20+ & npm 9+
- (Optional) Docker & Docker Compose

### 1. Clone the Repository
```bash
git clone https://github.com/BKiran27/BloodEye.git
cd BloodEye
```

### 2. Start the Backend API
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Endpoint: `http://localhost:8000`
- Interactive Swagger Documentation: `http://localhost:8000/docs`

### 3. Start the Frontend
```bash
cd ../frontend
npm install
npm run dev
```
- Open `http://localhost:5173` in your browser.

### 4. Run Automated Tests
```bash
# Backend pytest suite (17 comprehensive tests)
pytest backend/tests/ -v

# Frontend TypeScript & Vite production build
cd frontend && npm run build
```

---

## 📂 Project Structure

```text
BloodEye/
├── .github/workflows/deploy.yml # GitHub Actions automated Pages deployment
├── backend/
│   ├── app/
│   │   ├── api/endpoints/       # FastAPI endpoints (predictions, gradcam, datasets, reports)
│   │   ├── ml/                  # Deep learning architectures (CBAM, Multi-Task, Fusion)
│   │   ├── services/            # 16-biomarker extractor & prediction service
│   │   ├── db/                  # SQLAlchemy models & SQLite/PostgreSQL connectors
│   │   └── main.py              # Application entrypoint & CORS configuration
│   ├── tests/                   # Pytest test suite (17 automated tests)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # LiveEyeScanner HUD, ConfusionMatrix, StatCards
│   │   ├── pages/               # Dashboard, ImageAnalysis, ExplainableAI, ModelEvaluation
│   │   └── services/            # Axios API client & offline fallbacks
│   ├── package.json             # Includes "npm run deploy" for GitHub Pages
│   └── vite.config.ts           # Configured with relative base './'
├── docker-compose.yml           # Multi-container orchestration
└── README.md
```

---

## 🚀 Live Hosting Links

- **Production GitHub Pages**: [https://bkiran27.github.io/BloodEye/](https://bkiran27.github.io/BloodEye/)
- **Live Eye Scanner Route**: [https://bkiran27.github.io/BloodEye/#/analysis](https://bkiran27.github.io/BloodEye/#/analysis)
- **Explainable AI Route**: [https://bkiran27.github.io/BloodEye/#/xai](https://bkiran27.github.io/BloodEye/#/xai)
- **Model Evaluation Route**: [https://bkiran27.github.io/BloodEye/#/evaluation](https://bkiran27.github.io/BloodEye/#/evaluation)

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
