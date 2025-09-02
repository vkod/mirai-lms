import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Progress,
  Timeline,
  Table,
  Badge,
  Alert,
  Divider,
  Typography,
  Input,
  Select,
  Form,
  Tooltip,
  Avatar,
  Descriptions,
  Empty,
  Spin,
  App,
  List,
  Modal,
  Steps,
  Result,
  Dropdown,
  Menu,
} from 'antd';
import {
  ArrowLeftOutlined,
  RobotOutlined,
  RocketOutlined,
  PauseCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  ToolOutlined,
  LineChartOutlined,
  DeploymentUnitOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  BranchesOutlined,
  PlayCircleOutlined,
  StopOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  FlagOutlined,
  TeamOutlined,
  DollarOutlined,
  PercentageOutlined,
  RiseOutlined,
  DownOutlined,
  EyeOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useStore } from '../store/useStore';
import { agentDojoAPI } from '../services/agentDojoApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;

interface Version {
  id: string;
  version: string;
  createdAt: string;
  trainingDuration: string;
  accuracy: number;
  performance: {
    successRate: number;
    avgResponseTime: number;
    leadConversion: number;
  };
  status: 'active' | 'archived' | 'deployed';
  deployedEnvironments: string[];
  trainingDataset: {
    name: string;
    size: number;
  };
  notes?: string;
}

interface EventTrigger {
  id: string;
  name: string;
  type: 'prospect_action' | 'life_event' | 'business_event' | 'time_based' | 'data_change' | 'custom';
  subType: string;
  conditions: {
    [key: string]: any;
  };
  enabled: boolean;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  model: string;
  instructions: string;
  tools: string[];
  capabilities: string[];
}

interface TrainingSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  metrics?: {
    accuracy: number;
    loss: number;
    validation: number;
  };
}

interface Deployment {
  version: string;
  deployedAt: string;
  deployedBy: string;
  status: 'active' | 'paused' | 'stopped';
  metrics: {
    uptime: string;
    requestsProcessed: number;
    avgLatency: number;
    errorRate: number;
  };
}

interface AgentSwarm {
  id: string;
  name: string;
  goal: string;
  description: string;
  currentVersion: string;
  versions: Version[];
  activeDeployment?: Deployment;
  tools: string[];
  eventTriggers: EventTrigger[];
  agents: Agent[];
  currentTraining?: TrainingSession;
  businessMetrics: {
    totalLeadsProcessed: number;
    conversionRate: number;
    revenueGenerated: number;
    customerSatisfaction: number;
    timeToResponse: string;
    costPerLead: number;
  };
  created: string;
  modified: string;
}

const availableTools = [
  { id: 'crm_integration', name: 'CRM Integration', icon: <DatabaseOutlined />, description: 'Access and update CRM records' },
  { id: 'email_sender', name: 'Email Automation', icon: <ApiOutlined />, description: 'Send personalized emails' },
  { id: 'calendar_scheduler', name: 'Calendar Scheduler', icon: <CalendarOutlined />, description: 'Schedule meetings and follow-ups' },
  { id: 'lead_scorer', name: 'Lead Scoring', icon: <ThunderboltOutlined />, description: 'Evaluate and score leads' },
  { id: 'sentiment_analyzer', name: 'Sentiment Analysis', icon: <ExperimentOutlined />, description: 'Analyze customer sentiment' },
  { id: 'data_enrichment', name: 'Data Enrichment', icon: <DatabaseOutlined />, description: 'Enrich lead data from external sources' },
  { id: 'chat_interface', name: 'Chat Interface', icon: <RobotOutlined />, description: 'Engage in real-time conversations' },
  { id: 'report_generator', name: 'Report Generator', icon: <LineChartOutlined />, description: 'Generate analytical reports' },
];

const eventCategories = {
  prospect_action: {
    label: 'Prospect Actions',
    icon: <UserOutlined />,
    color: '#1890ff',
  },
  life_event: {
    label: 'Life Events',
    icon: <HeartOutlined />,
    color: '#eb2f96',
  },
  business_event: {
    label: 'Business Events',
    icon: <ShoppingCartOutlined />,
    color: '#52c41a',
  },
  time_based: {
    label: 'Time-Based',
    icon: <CalendarOutlined />,
    color: '#faad14',
  },
  data_change: {
    label: 'Data Changes',
    icon: <DatabaseOutlined />,
    color: '#722ed1',
  },
};

const SwarmDetailV2: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { modal, message } = App.useApp();
  const addNotification = useStore((state) => state.addNotification);

  const [swarm, setSwarm] = useState<AgentSwarm | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [key: string]: any }>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [deployModalVisible, setDeployModalVisible] = useState(false);
  const [versionToDeploy, setVersionToDeploy] = useState<Version | null>(null);

  // Mock enhanced swarm data with versions
  const mockSwarm: AgentSwarm = {
    id: id || '1',
    name: 'Enterprise Lead Qualification',
    goal: 'Qualify and prioritize enterprise leads for sales team engagement',
    description: 'Multi-agent swarm that researches, scores, and qualifies enterprise leads using advanced AI models and real-time data enrichment.',
    currentVersion: 'v2.1.0',
    versions: [
      {
        id: 'v_001',
        version: 'v2.1.0',
        createdAt: '2024-01-25T14:00:00Z',
        trainingDuration: '4h 32m',
        accuracy: 94.2,
        performance: {
          successRate: 92.5,
          avgResponseTime: 1.8,
          leadConversion: 38.5,
        },
        status: 'deployed',
        deployedEnvironments: ['production'],
        trainingDataset: {
          name: 'Enterprise Sales Q4 2023',
          size: 52000,
        },
        notes: 'Improved lead scoring algorithm with better industry classification',
      },
      {
        id: 'v_002',
        version: 'v2.0.0',
        createdAt: '2024-01-20T10:00:00Z',
        trainingDuration: '3h 45m',
        accuracy: 91.8,
        performance: {
          successRate: 89.3,
          avgResponseTime: 2.1,
          leadConversion: 35.2,
        },
        status: 'archived',
        deployedEnvironments: [],
        trainingDataset: {
          name: 'Enterprise Sales Q3 2023',
          size: 45000,
        },
      },
      {
        id: 'v_003',
        version: 'v1.9.0',
        createdAt: '2024-01-15T08:00:00Z',
        trainingDuration: '3h 20m',
        accuracy: 88.5,
        performance: {
          successRate: 85.2,
          avgResponseTime: 2.5,
          leadConversion: 32.1,
        },
        status: 'archived',
        deployedEnvironments: [],
        trainingDataset: {
          name: 'Enterprise Sales Q2 2023',
          size: 38000,
        },
      },
    ],
    activeDeployment: {
      version: 'v2.1.0',
      deployedAt: '2024-01-25T15:30:00Z',
      deployedBy: 'John Smith',
      status: 'active',
      metrics: {
        uptime: '99.95%',
        requestsProcessed: 15420,
        avgLatency: 185,
        errorRate: 0.02,
      },
    },
    tools: ['crm_integration', 'lead_scorer', 'data_enrichment', 'sentiment_analyzer'],
    eventTriggers: [
      {
        id: 'tr_001',
        name: 'Enterprise Form Submitted',
        type: 'prospect_action',
        subType: 'form_submitted',
        conditions: { formType: 'enterprise_quote', minValue: 50000 },
        enabled: true,
      },
      {
        id: 'tr_002',
        name: 'High Score Lead',
        type: 'data_change',
        subType: 'score_increase',
        conditions: { scoreThreshold: 70, previousScore: 50 },
        enabled: true,
      },
    ],
    agents: [
      {
        id: 'ag_001',
        name: 'Lead Researcher',
        role: 'Research Analyst',
        model: 'GPT-4',
        instructions: 'Research company background, industry position, and growth potential.',
        tools: ['data_enrichment', 'sentiment_analyzer'],
        capabilities: ['Company research', 'Industry analysis', 'Competitor assessment'],
      },
      {
        id: 'ag_002',
        name: 'Qualification Expert',
        role: 'Lead Qualifier',
        model: 'Claude-3',
        instructions: 'Evaluate lead quality based on BANT criteria.',
        tools: ['crm_integration', 'lead_scorer'],
        capabilities: ['Score calculation', 'Data validation', 'BANT qualification'],
      },
    ],
    currentTraining: undefined,
    businessMetrics: {
      totalLeadsProcessed: 45280,
      conversionRate: 38.5,
      revenueGenerated: 2840000,
      customerSatisfaction: 4.7,
      timeToResponse: '< 2 min',
      costPerLead: 12.50,
    },
    created: '2024-01-10',
    modified: '2024-01-25',
  };

  useEffect(() => {
    loadSwarmDetail();
  }, [id]);

  const loadSwarmDetail = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        setSwarm(mockSwarm);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to load swarm details:', error);
      setSwarm(mockSwarm);
      setLoading(false);
    }
  };

  const handleEdit = (field: string) => {
    setEditMode({ ...editMode, [field]: true });
    setEditValues({ ...editValues, [field]: swarm?.[field as keyof AgentSwarm] });
  };

  const handleSave = async (field: string) => {
    if (!swarm) return;
    
    try {
      const updatedSwarm = { ...swarm, [field]: editValues[field] };
      setSwarm(updatedSwarm);
      setEditMode({ ...editMode, [field]: false });
      
      addNotification({ type: 'success', message: `${field} updated successfully` });
    } catch (error) {
      addNotification({ type: 'error', message: `Failed to update ${field}` });
    }
  };

  const handleCancel = (field: string) => {
    setEditMode({ ...editMode, [field]: false });
    setEditValues({ ...editValues, [field]: swarm?.[field as keyof AgentSwarm] });
  };

  const handleDeployVersion = (version: Version) => {
    setVersionToDeploy(version);
    setDeployModalVisible(true);
  };

  const confirmDeploy = async () => {
    if (!versionToDeploy || !swarm) return;
    
    try {
      // Simulate deployment
      const updatedSwarm = {
        ...swarm,
        activeDeployment: {
          version: versionToDeploy.version,
          deployedAt: new Date().toISOString(),
          deployedBy: 'Current User',
          status: 'active' as const,
          metrics: {
            uptime: '100%',
            requestsProcessed: 0,
            avgLatency: 0,
            errorRate: 0,
          },
        },
        currentVersion: versionToDeploy.version,
      };
      
      // Update version status
      updatedSwarm.versions = updatedSwarm.versions.map(v => ({
        ...v,
        status: v.id === versionToDeploy.id ? 'deployed' as const : v.status === 'deployed' ? 'archived' as const : v.status,
        deployedEnvironments: v.id === versionToDeploy.id ? ['production'] : [],
      }));
      
      setSwarm(updatedSwarm);
      setDeployModalVisible(false);
      message.success(`Successfully deployed ${versionToDeploy.version} to production`);
    } catch (error) {
      message.error('Failed to deploy version');
    }
  };

  const handleStopDeployment = () => {
    modal.confirm({
      title: 'Stop Deployment',
      content: 'Are you sure you want to stop the current deployment? This will stop processing all leads.',
      onOk: async () => {
        if (!swarm) return;
        const updatedSwarm = {
          ...swarm,
          activeDeployment: swarm.activeDeployment ? {
            ...swarm.activeDeployment,
            status: 'stopped' as const,
          } : undefined,
        };
        setSwarm(updatedSwarm);
        message.success('Deployment stopped successfully');
      },
    });
  };

  const handleStartTraining = () => {
    modal.confirm({
      title: 'Start New Training',
      content: 'This will create a new version after training completes. Continue?',
      onOk: async () => {
        if (!swarm) return;
        const newTraining: TrainingSession = {
          id: 'tr_new',
          startedAt: new Date().toISOString(),
          status: 'running',
          progress: 0,
          currentStep: 'Initializing training environment...',
        };
        setSwarm({ ...swarm, currentTraining: newTraining });
        message.success('Training started. A new version will be created upon completion.');
        
        // Simulate training progress
        simulateTraining();
      },
    });
  };

  const simulateTraining = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        completeTraining();
      } else {
        setSwarm(prev => prev ? {
          ...prev,
          currentTraining: prev.currentTraining ? {
            ...prev.currentTraining,
            progress,
            currentStep: getTrainingStep(progress),
          } : undefined,
        } : null);
      }
    }, 2000);
  };

  const getTrainingStep = (progress: number) => {
    if (progress < 20) return 'Loading training data...';
    if (progress < 40) return 'Preprocessing data...';
    if (progress < 60) return 'Training model...';
    if (progress < 80) return 'Validating results...';
    return 'Finalizing model...';
  };

  const completeTraining = () => {
    if (!swarm) return;
    
    const newVersion: Version = {
      id: `v_${Date.now()}`,
      version: `v2.2.0`,
      createdAt: new Date().toISOString(),
      trainingDuration: '3h 15m',
      accuracy: 95.1,
      performance: {
        successRate: 93.8,
        avgResponseTime: 1.6,
        leadConversion: 40.2,
      },
      status: 'active',
      deployedEnvironments: [],
      trainingDataset: {
        name: 'Enterprise Sales Q1 2024',
        size: 58000,
      },
      notes: 'New training with latest data',
    };
    
    setSwarm({
      ...swarm,
      currentTraining: undefined,
      versions: [newVersion, ...swarm.versions],
      currentVersion: newVersion.version,
    });
    
    message.success('Training completed! New version v2.2.0 created.');
  };

  const renderEditableField = (field: string, type: 'text' | 'textarea' = 'text') => {
    const value = swarm?.[field as keyof AgentSwarm];
    const isEditing = editMode[field];

    if (isEditing) {
      return (
        <Space>
          {type === 'textarea' ? (
            <TextArea
              value={editValues[field]}
              onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
              autoSize={{ minRows: 2, maxRows: 6 }}
              style={{ width: 500 }}
            />
          ) : (
            <Input
              value={editValues[field]}
              onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
              style={{ width: 300 }}
            />
          )}
          <Button
            type="primary"
            size="small"
            icon={<SaveOutlined />}
            onClick={() => handleSave(field)}
          />
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={() => handleCancel(field)}
          />
        </Space>
      );
    }

    return (
      <Space>
        <Text>{value as string}</Text>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(field)}
        />
      </Space>
    );
  };

  const renderOverviewTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        {/* Business Metrics Dashboard */}
        <Col span={24}>
          <Card title="Business Impact" extra={<TrophyOutlined />}>
            <Row gutter={[16, 16]}>
              <Col span={4}>
                <Statistic
                  title="Leads Processed"
                  value={swarm?.businessMetrics.totalLeadsProcessed}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Conversion Rate"
                  value={swarm?.businessMetrics.conversionRate}
                  suffix="%"
                  prefix={<PercentageOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Revenue Generated"
                  value={swarm?.businessMetrics.revenueGenerated}
                  prefix="$"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Customer Satisfaction"
                  value={swarm?.businessMetrics.customerSatisfaction}
                  suffix="/5"
                  prefix={<HeartOutlined />}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Response Time"
                  value={swarm?.businessMetrics.timeToResponse}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={4}>
                <Statistic
                  title="Cost per Lead"
                  value={swarm?.businessMetrics.costPerLead}
                  prefix="$"
                  precision={2}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Swarm Information */}
        <Col span={12}>
          <Card title="Swarm Configuration">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Name">
                {renderEditableField('name')}
              </Descriptions.Item>
              <Descriptions.Item label="Goal">
                {renderEditableField('goal', 'textarea')}
              </Descriptions.Item>
              <Descriptions.Item label="Current Version">
                <Tag color="blue">{swarm?.currentVersion}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Active Deployment">
                {swarm?.activeDeployment ? (
                  <Badge status="success" text={`${swarm.activeDeployment.version} (Active)`} />
                ) : (
                  <Badge status="default" text="Not Deployed" />
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Deployment Status */}
        <Col span={12}>
          <Card 
            title="Deployment Status" 
            extra={
              swarm?.activeDeployment?.status === 'active' ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>LIVE</Tag>
              ) : (
                <Tag color="default">OFFLINE</Tag>
              )
            }
          >
            {swarm?.activeDeployment ? (
              <div>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Uptime"
                      value={swarm.activeDeployment.metrics.uptime}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Requests Processed"
                      value={swarm.activeDeployment.metrics.requestsProcessed}
                      prefix={<ThunderboltOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Avg Latency"
                      value={swarm.activeDeployment.metrics.avgLatency}
                      suffix="ms"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Error Rate"
                      value={swarm.activeDeployment.metrics.errorRate}
                      suffix="%"
                      valueStyle={{ color: swarm.activeDeployment.metrics.errorRate > 1 ? '#ff4d4f' : '#52c41a' }}
                    />
                  </Col>
                </Row>
                <Divider />
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text type="secondary">Deployed by: {swarm.activeDeployment.deployedBy}</Text>
                  <Text type="secondary">
                    Deployed at: {new Date(swarm.activeDeployment.deployedAt).toLocaleString()}
                  </Text>
                </Space>
              </div>
            ) : (
              <Empty
                description="No active deployment"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" icon={<RocketOutlined />} onClick={() => setActiveTab('versions')}>
                  Deploy a Version
                </Button>
              </Empty>
            )}
          </Card>
        </Col>

        {/* Agents */}
        <Col span={24}>
          <Card title="Active Agents" extra={<RobotOutlined />}>
            <Row gutter={[16, 16]}>
              {swarm?.agents.map((agent) => (
                <Col span={12} key={agent.id}>
                  <Card size="small" style={{ height: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Avatar style={{ backgroundColor: '#1890ff' }} icon={<RobotOutlined />} />
                        <div>
                          <Title level={5} style={{ margin: 0 }}>{agent.name}</Title>
                          <Space>
                            <Tag color="blue">{agent.role}</Tag>
                            <Tag color="green">{agent.model}</Tag>
                          </Space>
                        </div>
                      </Space>
                      <Paragraph style={{ fontSize: 13, marginBottom: 8 }}>
                        {agent.instructions}
                      </Paragraph>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderVersionsTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card 
            title="Version History" 
            extra={
              <Button 
                type="primary" 
                icon={<ExperimentOutlined />} 
                onClick={handleStartTraining}
                disabled={!!swarm?.currentTraining}
              >
                Start New Training
              </Button>
            }
          >
            <Timeline mode="left">
              {swarm?.versions.map((version) => (
                <Timeline.Item
                  key={version.id}
                  dot={
                    version.status === 'deployed' ? (
                      <CheckCircleOutlined style={{ fontSize: 16, color: '#52c41a' }} />
                    ) : (
                      <ClockCircleOutlined style={{ fontSize: 16 }} />
                    )
                  }
                  color={version.status === 'deployed' ? 'green' : 'gray'}
                >
                  <Card 
                    size="small" 
                    style={{ 
                      borderLeft: version.status === 'deployed' ? '3px solid #52c41a' : 'none',
                      backgroundColor: version.status === 'deployed' ? '#f6ffed' : undefined,
                    }}
                  >
                    <Row gutter={[16, 8]}>
                      <Col span={24}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space>
                            <Title level={4} style={{ margin: 0 }}>
                              {version.version}
                            </Title>
                            {version.status === 'deployed' && (
                              <Tag color="green" icon={<CheckCircleOutlined />}>DEPLOYED</Tag>
                            )}
                            {version === swarm.versions[0] && version.status !== 'deployed' && (
                              <Tag color="blue">LATEST</Tag>
                            )}
                          </Space>
                          <Space>
                            {version.status !== 'deployed' && (
                              <Button
                                type="primary"
                                size="small"
                                icon={<RocketOutlined />}
                                onClick={() => handleDeployVersion(version)}
                              >
                                Deploy
                              </Button>
                            )}
                            <Dropdown
                              overlay={
                                <Menu>
                                  <Menu.Item key="view" icon={<EyeOutlined />}>
                                    View Details
                                  </Menu.Item>
                                  <Menu.Item key="compare" icon={<BranchesOutlined />}>
                                    Compare with Current
                                  </Menu.Item>
                                  <Menu.Item key="download" icon={<DownloadOutlined />}>
                                    Download Model
                                  </Menu.Item>
                                </Menu>
                              }
                            >
                              <Button size="small">
                                Actions <DownOutlined />
                              </Button>
                            </Dropdown>
                          </Space>
                        </Space>
                      </Col>
                      
                      <Col span={24}>
                        <Text type="secondary">
                          Created: {new Date(version.createdAt).toLocaleString()} | 
                          Training Duration: {version.trainingDuration}
                        </Text>
                      </Col>
                      
                      <Col span={24}>
                        <Row gutter={[16, 8]}>
                          <Col span={6}>
                            <Statistic
                              title="Accuracy"
                              value={version.accuracy}
                              suffix="%"
                              valueStyle={{ fontSize: 14 }}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="Success Rate"
                              value={version.performance.successRate}
                              suffix="%"
                              valueStyle={{ fontSize: 14 }}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="Response Time"
                              value={version.performance.avgResponseTime}
                              suffix="s"
                              valueStyle={{ fontSize: 14 }}
                            />
                          </Col>
                          <Col span={6}>
                            <Statistic
                              title="Lead Conversion"
                              value={version.performance.leadConversion}
                              suffix="%"
                              valueStyle={{ fontSize: 14 }}
                            />
                          </Col>
                        </Row>
                      </Col>
                      
                      {version.notes && (
                        <Col span={24}>
                          <Alert
                            message="Release Notes"
                            description={version.notes}
                            type="info"
                            showIcon={false}
                          />
                        </Col>
                      )}
                    </Row>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderTrainingTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        {swarm?.currentTraining ? (
          <>
            <Col span={24}>
              <Alert
                message="Training in Progress"
                description="A new version will be created once training completes successfully."
                type="info"
                showIcon
                icon={<LoadingOutlined />}
              />
            </Col>

            <Col span={24}>
              <Card title="Training Progress">
                <Steps current={Math.floor(swarm.currentTraining.progress / 25)}>
                  <Step title="Initialize" description="Setup environment" />
                  <Step title="Preprocess" description="Prepare data" />
                  <Step title="Train" description="Train model" />
                  <Step title="Validate" description="Test accuracy" />
                  <Step title="Finalize" description="Create version" />
                </Steps>
                
                <div style={{ marginTop: 24 }}>
                  <Text>{swarm.currentTraining.currentStep}</Text>
                  <Progress 
                    percent={swarm.currentTraining.progress} 
                    status="active"
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
                
                {swarm.currentTraining.metrics && (
                  <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                    <Col span={8}>
                      <Statistic
                        title="Accuracy"
                        value={swarm.currentTraining.metrics.accuracy}
                        suffix="%"
                        prefix={<CheckCircleOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Validation Score"
                        value={swarm.currentTraining.metrics.validation}
                        suffix="%"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Loss"
                        value={swarm.currentTraining.metrics.loss}
                        precision={4}
                      />
                    </Col>
                  </Row>
                )}
              </Card>
            </Col>
          </>
        ) : (
          <Col span={24}>
            <Card>
              <Result
                icon={<ExperimentOutlined />}
                title="No Active Training"
                subTitle="Start a new training session to create an improved version of your swarm"
                extra={
                  <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStartTraining}>
                    Start Training
                  </Button>
                }
              />
              
              <Divider />
              
              <Title level={4}>Recent Training History</Title>
              <List
                dataSource={swarm?.versions.slice(0, 3)}
                renderItem={(version) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<BranchesOutlined />} />}
                      title={`${version.version} - Accuracy: ${version.accuracy}%`}
                      description={`Trained on ${new Date(version.createdAt).toLocaleDateString()} with ${version.trainingDataset.name} (${version.trainingDataset.size.toLocaleString()} records)`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );

  const renderDeploymentTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          {swarm?.activeDeployment?.status === 'active' ? (
            <Alert
              message="Swarm is Live"
              description={`Version ${swarm.activeDeployment.version} is actively processing leads in production.`}
              type="success"
              showIcon
              action={
                <Button size="small" danger onClick={handleStopDeployment}>
                  Stop Deployment
                </Button>
              }
            />
          ) : (
            <Alert
              message="No Active Deployment"
              description="Deploy a version to start processing leads automatically."
              type="warning"
              showIcon
            />
          )}
        </Col>

        {swarm?.activeDeployment && (
          <>
            <Col span={24}>
              <Card title="Live Metrics">
                <Row gutter={[16, 16]}>
                  <Col span={6}>
                    <Card style={{ textAlign: 'center', backgroundColor: '#f0f9ff' }}>
                      <Statistic
                        title="Status"
                        value={swarm.activeDeployment.status.toUpperCase()}
                        valueStyle={{ 
                          color: swarm.activeDeployment.status === 'active' ? '#52c41a' : '#ff4d4f',
                          fontSize: 20,
                        }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{ textAlign: 'center' }}>
                      <Statistic
                        title="Uptime"
                        value={swarm.activeDeployment.metrics.uptime}
                        prefix={<CheckCircleOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{ textAlign: 'center' }}>
                      <Statistic
                        title="Processed Today"
                        value={swarm.activeDeployment.metrics.requestsProcessed}
                        prefix={<ThunderboltOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{ textAlign: 'center' }}>
                      <Statistic
                        title="Avg Response"
                        value={swarm.activeDeployment.metrics.avgLatency}
                        suffix="ms"
                        prefix={<ClockCircleOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Deployment Information">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Version">
                    <Tag color="blue">{swarm.activeDeployment.version}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Deployed By">
                    {swarm.activeDeployment.deployedBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="Deployed At">
                    {new Date(swarm.activeDeployment.deployedAt).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Badge 
                      status={swarm.activeDeployment.status === 'active' ? 'success' : 'default'} 
                      text={swarm.activeDeployment.status} 
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Health Check">
                <List>
                  <List.Item>
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text>API Connection</Text>
                    </Space>
                    <Tag color="green">Healthy</Tag>
                  </List.Item>
                  <List.Item>
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text>CRM Integration</Text>
                    </Space>
                    <Tag color="green">Connected</Tag>
                  </List.Item>
                  <List.Item>
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text>Model Status</Text>
                    </Space>
                    <Tag color="green">Loaded</Tag>
                  </List.Item>
                  <List.Item>
                    <Space>
                      {swarm.activeDeployment.metrics.errorRate > 1 ? (
                        <WarningOutlined style={{ color: '#faad14' }} />
                      ) : (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      )}
                      <Text>Error Rate</Text>
                    </Space>
                    <Tag color={swarm.activeDeployment.metrics.errorRate > 1 ? 'orange' : 'green'}>
                      {swarm.activeDeployment.metrics.errorRate}%
                    </Tag>
                  </List.Item>
                </List>
              </Card>
            </Col>
          </>
        )}

        {!swarm?.activeDeployment && (
          <Col span={24}>
            <Card>
              <Result
                icon={<RocketOutlined />}
                title="Ready to Deploy"
                subTitle="Select a version from the Versions tab to deploy to production"
                extra={
                  <Button 
                    type="primary" 
                    icon={<BranchesOutlined />} 
                    onClick={() => setActiveTab('versions')}
                  >
                    Go to Versions
                  </Button>
                }
              />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!swarm) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description="Swarm not found" />
        <Button type="primary" onClick={() => navigate('/swarms')} style={{ marginTop: 16 }}>
          Back to Swarms
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/swarms')}
          style={{ marginBottom: 16 }}
        >
          Back to Swarms
        </Button>

        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space align="center">
              <Avatar size={48} style={{ backgroundColor: '#1890ff' }} icon={<RobotOutlined />} />
              <div>
                <Title level={2} style={{ margin: 0 }}>{swarm.name}</Title>
                <Space>
                  <Tag color="blue">{swarm.currentVersion}</Tag>
                  {swarm.activeDeployment?.status === 'active' ? (
                    <Badge status="success" text="Live in Production" />
                  ) : swarm.currentTraining ? (
                    <Badge status="processing" text="Training" />
                  ) : (
                    <Badge status="default" text="Not Deployed" />
                  )}
                  <Text type="secondary">ID: {swarm.id}</Text>
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              {!swarm.activeDeployment && (
                <Button 
                  type="primary" 
                  icon={<RocketOutlined />} 
                  onClick={() => setActiveTab('versions')}
                >
                  Deploy
                </Button>
              )}
              {swarm.activeDeployment?.status === 'active' && (
                <Button 
                  danger 
                  icon={<StopOutlined />} 
                  onClick={handleStopDeployment}
                >
                  Stop
                </Button>
              )}
              {!swarm.currentTraining && (
                <Button 
                  icon={<ExperimentOutlined />} 
                  onClick={handleStartTraining}
                >
                  Train New Version
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <DeploymentUnitOutlined />
                Overview
              </span>
            }
            key="overview"
          >
            {renderOverviewTab()}
          </TabPane>
          <TabPane
            tab={
              <span>
                <BranchesOutlined />
                Versions
                <Badge count={swarm.versions.length} style={{ marginLeft: 8 }} />
              </span>
            }
            key="versions"
          >
            {renderVersionsTab()}
          </TabPane>
          <TabPane
            tab={
              <span>
                <ExperimentOutlined />
                Training
                {swarm.currentTraining && (
                  <Badge status="processing" style={{ marginLeft: 8 }} />
                )}
              </span>
            }
            key="training"
          >
            {renderTrainingTab()}
          </TabPane>
          <TabPane
            tab={
              <span>
                <RocketOutlined />
                Deployment
                {swarm.activeDeployment?.status === 'active' && (
                  <Badge status="success" style={{ marginLeft: 8 }} />
                )}
              </span>
            }
            key="deployment"
          >
            {renderDeploymentTab()}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Deploy Version"
        open={deployModalVisible}
        onOk={confirmDeploy}
        onCancel={() => setDeployModalVisible(false)}
        okText="Deploy to Production"
        okButtonProps={{ icon: <RocketOutlined /> }}
      >
        <Alert
          message="Production Deployment"
          description="This will replace the current production deployment and start processing leads with the selected version."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {versionToDeploy && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Version">
              <Tag color="blue">{versionToDeploy.version}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Accuracy">
              {versionToDeploy.accuracy}%
            </Descriptions.Item>
            <Descriptions.Item label="Success Rate">
              {versionToDeploy.performance.successRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Training Date">
              {new Date(versionToDeploy.createdAt).toLocaleDateString()}
            </Descriptions.Item>
          </Descriptions>
        )}
        
        <Divider />
        
        <Text type="secondary">
          <InfoCircleOutlined /> The deployment will be immediate and the swarm will start processing leads automatically.
        </Text>
      </Modal>
    </div>
  );
};

export default SwarmDetailV2;