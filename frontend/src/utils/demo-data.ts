import { DashboardSummary, Dataset, Experiment, Prediction, TrainedModel, GradCAMResult, Report } from '../types';

export const demoDashboardSummary: DashboardSummary = {
  totalImages: 12450,
  validatedImages: 11980,
  totalDatasets: 4,
  activeModels: 2,
  classDistribution: {
    'A+': 3200,
    'A-': 850,
    'B+': 2800,
    'B-': 650,
    'AB+': 1100,
    'AB-': 250,
    'O+': 4100,
    'O-': 1030,
  },
  recentExperiments: [
    {
      id: 'exp-001',
      name: 'ResNet50 Baseline',
      datasetId: 'ds-001',
      modelArchitecture: 'ResNet50',
      status: 'completed',
      createdAt: '2023-10-01T10:00:00Z',
      completedAt: '2023-10-01T14:30:00Z',
      config: { epochs: 50, batchSize: 32, learningRate: 0.001, imageResolution: 224, trainSplit: 0.7, valSplit: 0.15, testSplit: 0.15, seed: 42 },
      isDemoData: true
    },
    {
      id: 'exp-002',
      name: 'EfficientNetB0 Fast',
      datasetId: 'ds-002',
      modelArchitecture: 'EfficientNetB0',
      status: 'completed',
      createdAt: '2023-10-05T09:15:00Z',
      completedAt: '2023-10-05T11:45:00Z',
      config: { epochs: 30, batchSize: 64, learningRate: 0.005, imageResolution: 224, trainSplit: 0.8, valSplit: 0.1, testSplit: 0.1, seed: 123 },
      isDemoData: true
    }
  ],
  recentPredictions: [
    {
      id: 'pred-001',
      imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=300&q=80',
      originalImageName: 'sample_1042.jpg',
      predictedClass: 'O+',
      confidence: 0.985,
      classScores: { 'A+': 0.001, 'A-': 0.001, 'B+': 0.005, 'B-': 0.001, 'AB+': 0.002, 'AB-': 0.001, 'O+': 0.985, 'O-': 0.004 },
      createdAt: new Date().toISOString(),
      gradCamAvailable: true,
      isDemoData: true
    },
    {
      id: 'pred-002',
      imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=300&q=80',
      originalImageName: 'sample_0891.jpg',
      predictedClass: 'A+',
      confidence: 0.921,
      classScores: { 'A+': 0.921, 'A-': 0.041, 'B+': 0.015, 'B-': 0.001, 'AB+': 0.012, 'AB-': 0.001, 'O+': 0.005, 'O-': 0.004 },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      gradCamAvailable: true,
      isDemoData: true
    }
  ],
  modelStatus: 'active',
  isDemoData: true
};

export const demoDatasets: Dataset[] = [
  {
    id: 'ds-001',
    name: 'Global Blood DB 2023',
    description: 'Aggregated dataset from multiple research hospitals',
    createdAt: '2023-08-15T00:00:00Z',
    totalImages: 10500,
    classDistribution: { 'A+': 2800, 'A-': 700, 'B+': 2100, 'B-': 500, 'AB+': 800, 'AB-': 150, 'O+': 3200, 'O-': 250 },
    status: 'ready',
    validationReport: { missingLabels: 12, duplicateImages: 45, corruptImages: 3 },
    isDemoData: true
  },
  {
    id: 'ds-002',
    name: 'High-Res Microscopic V2',
    description: '1080p microscopic images with precise lighting',
    createdAt: '2023-09-22T00:00:00Z',
    totalImages: 1950,
    classDistribution: { 'A+': 400, 'A-': 150, 'B+': 700, 'B-': 150, 'AB+': 300, 'AB-': 100, 'O+': 900, 'O-': 780 },
    status: 'ready',
    validationReport: { missingLabels: 0, duplicateImages: 0, corruptImages: 0 },
    isDemoData: true
  }
];

export const demoExperimentDetails: Experiment = {
  id: 'exp-002',
  name: 'EfficientNetB0 Fast',
  datasetId: 'ds-002',
  modelArchitecture: 'EfficientNetB0',
  status: 'completed',
  createdAt: '2023-10-05T09:15:00Z',
  completedAt: '2023-10-05T11:45:00Z',
  config: { epochs: 30, batchSize: 64, learningRate: 0.005, imageResolution: 224, trainSplit: 0.8, valSplit: 0.1, testSplit: 0.1, seed: 123 },
  metrics: {
    accuracy: 0.945,
    balancedAccuracy: 0.932,
    precision: 0.948,
    recall: 0.945,
    f1Score: 0.946,
    rocAuc: 0.989,
    confusionMatrix: [
      [380, 5, 2, 0, 1, 0, 10, 2],
      [10, 135, 0, 1, 0, 2, 2, 0],
      [4, 0, 650, 15, 20, 1, 10, 0],
      [0, 2, 10, 135, 1, 2, 0, 0],
      [2, 0, 15, 2, 275, 4, 2, 0],
      [0, 1, 2, 5, 5, 85, 0, 2],
      [15, 2, 12, 0, 5, 0, 850, 16],
      [2, 0, 0, 2, 0, 1, 15, 760]
    ],
    history: {
      epoch: Array.from({length: 30}, (_, i) => i + 1),
      loss: Array.from({length: 30}, (_, i) => Math.max(0.1, 1.5 * Math.exp(-i/5) + Math.random()*0.1)),
      val_loss: Array.from({length: 30}, (_, i) => Math.max(0.15, 1.6 * Math.exp(-i/5) + Math.random()*0.15)),
      accuracy: Array.from({length: 30}, (_, i) => Math.min(0.98, 0.5 + 0.48 * (1 - Math.exp(-i/4)) + Math.random()*0.02)),
      val_accuracy: Array.from({length: 30}, (_, i) => Math.min(0.96, 0.45 + 0.49 * (1 - Math.exp(-i/4)) + Math.random()*0.03)),
    },
    perClassMetrics: {
      'A+': { precision: 0.92, recall: 0.95, f1Score: 0.93 },
      'A-': { precision: 0.93, recall: 0.90, f1Score: 0.91 },
      'B+': { precision: 0.94, recall: 0.93, f1Score: 0.93 },
      'B-': { precision: 0.85, recall: 0.90, f1Score: 0.87 },
      'AB+': { precision: 0.89, recall: 0.92, f1Score: 0.90 },
      'AB-': { precision: 0.90, recall: 0.85, f1Score: 0.87 },
      'O+': { precision: 0.96, recall: 0.94, f1Score: 0.95 },
      'O-': { precision: 0.97, recall: 0.97, f1Score: 0.97 },
    }
  },
  isDemoData: true
};

export const demoModels: TrainedModel[] = [
  {
    id: 'mod-001',
    experimentId: 'exp-002',
    name: 'EfficientNetB0_Prod',
    architecture: 'EfficientNetB0',
    isActive: true,
    metrics: { accuracy: 0.945, f1Score: 0.946 },
    createdAt: '2023-10-05T12:00:00Z',
    isDemoData: true
  }
];

export const demoReports: Report[] = [
  { id: 'rep-001', title: 'Q3 Evaluation Report', type: 'evaluation', format: 'pdf', createdAt: '2023-10-10T00:00:00Z', url: '#', isDemoData: true },
  { id: 'rep-002', title: 'Dataset DB 2023 Summary', type: 'dataset', format: 'csv', createdAt: '2023-09-01T00:00:00Z', url: '#', isDemoData: true }
];
