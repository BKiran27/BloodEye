export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface DashboardSummary {
  totalImages: number;
  validatedImages: number;
  totalDatasets: number;
  activeModels: number;
  classDistribution: Record<BloodGroup, number>;
  recentExperiments: Experiment[];
  recentPredictions: Prediction[];
  modelStatus: 'active' | 'training' | 'none';
  isDemoData?: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  totalImages: number;
  classDistribution: Record<BloodGroup, number>;
  status: 'ready' | 'processing' | 'error';
  validationReport?: {
    missingLabels: number;
    duplicateImages: number;
    corruptImages: number;
  };
  isDemoData?: boolean;
}

export interface DatasetImage {
  id: string;
  datasetId: string;
  filename: string;
  url: string;
  bloodGroup: BloodGroup;
  width: number;
  height: number;
}

export interface Experiment {
  id: string;
  name: string;
  datasetId: string;
  modelArchitecture: string;
  status: 'created' | 'training' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  metrics?: ExperimentMetrics;
  config: TrainingConfig;
  isDemoData?: boolean;
}

export interface ExperimentMetrics {
  accuracy: number;
  balancedAccuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: number[][]; // 8x8 for the 8 blood groups
  history: {
    epoch: number[];
    loss: number[];
    val_loss: number[];
    accuracy: number[];
    val_accuracy: number[];
  };
  perClassMetrics: Record<BloodGroup, {
    precision: number;
    recall: number;
    f1Score: number;
  }>;
}

export interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  imageResolution: number;
  trainSplit: number;
  valSplit: number;
  testSplit: number;
  seed: number;
}

export interface TrainedModel {
  id: string;
  experimentId: string;
  name: string;
  architecture: string;
  isActive: boolean;
  metrics: {
    accuracy: number;
    f1Score: number;
  };
  createdAt: string;
  isDemoData?: boolean;
}

export interface Prediction {
  id: string;
  imageUrl: string;
  originalImageName: string;
  preprocessedImageUrl?: string;
  predictedClass: BloodGroup;
  confidence: number;
  classScores: Record<BloodGroup, number>;
  createdAt: string;
  gradCamAvailable: boolean;
  isDemoData?: boolean;
}

export interface ImageValidation {
  isValid: boolean;
  format: string;
  sizeBytes: number;
  width: number;
  height: number;
  qualityScore: number;
  errors: string[];
}

export interface GradCAMResult {
  id: string;
  predictionId: string;
  originalImageUrl: string;
  heatmapUrl: string;
  overlayUrl: string;
  targetClass: BloodGroup;
  isDemoData?: boolean;
}

export interface Report {
  id: string;
  title: string;
  type: 'evaluation' | 'dataset' | 'summary';
  format: 'pdf' | 'csv';
  createdAt: string;
  url: string;
  isDemoData?: boolean;
}
