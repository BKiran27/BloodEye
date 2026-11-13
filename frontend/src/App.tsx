import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { ImageAnalysis } from './pages/ImageAnalysis';
import { DatasetManagement } from './pages/DatasetManagement';
import { ModelTraining } from './pages/ModelTraining';
import { ModelEvaluation } from './pages/ModelEvaluation';
import { ExplainableAI } from './pages/ExplainableAI';
import { ExperimentHistory } from './pages/ExperimentHistory';
import { Reports } from './pages/Reports';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="analysis" element={<ImageAnalysis />} />
        <Route path="datasets" element={<DatasetManagement />} />
        <Route path="training" element={<ModelTraining />} />
        <Route path="evaluation" element={<ModelEvaluation />} />
        <Route path="xai" element={<ExplainableAI />} />
        <Route path="history" element={<ExperimentHistory />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
