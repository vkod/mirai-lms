import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import SwarmManagement from './pages/SwarmManagement';
import SwarmDetailV2 from './pages/SwarmDetailV2';
import ToolsManagement from './pages/ToolsManagement';
import TrainingData from './pages/TrainingData';
import AgentDecisions from './pages/AgentDecisions';
import SystemLogs from './pages/SystemLogs';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useStore } from './store/useStore';
import './App.css';

function App() {
  const theme = useStore((state) => state.theme);

  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
          },
          algorithm: theme === 'dark' ? undefined : undefined,
        }}
      >
        <AntApp>
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="swarms" element={<SwarmManagement />} />
                <Route path="swarms/:id" element={<SwarmDetailV2 />} />
                <Route path="tools" element={<ToolsManagement />} />
                <Route path="training-data" element={<TrainingData />} />
                <Route path="agent-decisions" element={<AgentDecisions />} />
                <Route path="system-logs" element={<SystemLogs />} />
              </Route>
            </Routes>
          </Router>
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App
