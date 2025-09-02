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
  CodeOutlined,
  CloudServerOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  UserOutlined,
  CalendarOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useStore } from '../store/useStore';
import { agentDojoAPI } from '../services/agentDojoApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

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

interface TrainingLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AgentSwarm {
  id: string;
  name: string;
  goal: string;
  description: string;
  status: 'training' | 'ready' | 'deployed' | 'inactive' | 'error';
  tools: string[];
  trainingDataset: {
    id: string;
    name: string;
    size: number;
    lastUpdated: string;
  };
  eventTriggers: EventTrigger[];
  agents: Agent[];
  performance: {
    totalProcessed: number;
    successRate: number;
    avgResponseTime: number;
    leadConversion: number;
    customerSatisfaction: number;
  };
  deployment: {
    environment: 'development' | 'staging' | 'production';
    resources: string;
    lastDeployed?: string;
    endpoint?: string;
    version?: string;
  };
  training?: {
    progress: number;
    eta: string;
    currentStep: string;
    logs: TrainingLog[];
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

const SwarmDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { modal } = App.useApp();
  const addNotification = useStore((state) => state.addNotification);

  const [swarm, setSwarm] = useState<AgentSwarm | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editValues, setEditValues] = useState<{ [key: string]: any }>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [configModalVisible, setConfigModalVisible] = useState(false);

  // Mock enhanced swarm data with training and deployment details
  const mockSwarm: AgentSwarm = {
    id: id || '1',
    name: 'Enterprise Lead Qualification',
    goal: 'Qualify and prioritize enterprise leads for sales team engagement',
    description: 'Multi-agent swarm that researches, scores, and qualifies enterprise leads using advanced AI models and real-time data enrichment.',
    status: 'training',
    tools: ['crm_integration', 'lead_scorer', 'data_enrichment', 'sentiment_analyzer'],
    trainingDataset: {
      id: 'ds_001',
      name: 'Enterprise Sales Dataset v2.3',
      size: 45000,
      lastUpdated: '2024-01-15',
    },
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
      {
        id: 'tr_003',
        name: 'Contract Renewal',
        type: 'time_based',
        subType: 'renewal_due',
        conditions: { daysBefore: 30 },
        enabled: true,
      },
    ],
    agents: [
      {
        id: 'ag_001',
        name: 'Lead Researcher',
        role: 'Research Analyst',
        model: 'GPT-4',
        instructions: 'Research company background, industry position, and growth potential. Identify key decision makers and recent company news that could indicate buying intent.',
        tools: ['data_enrichment', 'sentiment_analyzer'],
        capabilities: ['Company research', 'Industry analysis', 'Competitor assessment'],
      },
      {
        id: 'ag_002',
        name: 'Qualification Expert',
        role: 'Lead Qualifier',
        model: 'Claude-3',
        instructions: 'Evaluate lead quality based on BANT criteria (Budget, Authority, Need, Timeline). Score leads and prioritize for sales team follow-up.',
        tools: ['crm_integration', 'lead_scorer'],
        capabilities: ['Score calculation', 'Data validation', 'BANT qualification'],
      },
    ],
    performance: {
      totalProcessed: 3420,
      successRate: 87.5,
      avgResponseTime: 2.3,
      leadConversion: 34.2,
      customerSatisfaction: 4.6,
    },
    deployment: {
      environment: 'production',
      resources: '4 vCPU, 8GB RAM',
      lastDeployed: '2024-01-20T14:30:00Z',
      endpoint: 'https://api.mirai-lms.com/swarms/enterprise-lead',
      version: 'v1.2.3',
    },
    training: {
      progress: 72,
      eta: '2 hours 15 minutes',
      currentStep: 'Fine-tuning model parameters',
      logs: [
        { timestamp: '2024-01-25T10:00:00Z', message: 'Training started', type: 'info' },
        { timestamp: '2024-01-25T10:15:00Z', message: 'Dataset loaded: 45,000 records', type: 'success' },
        { timestamp: '2024-01-25T10:30:00Z', message: 'Preprocessing completed', type: 'success' },
        { timestamp: '2024-01-25T11:00:00Z', message: 'Model training in progress', type: 'info' },
        { timestamp: '2024-01-25T11:45:00Z', message: 'Validation accuracy: 92.3%', type: 'success' },
        { timestamp: '2024-01-25T12:00:00Z', message: 'Fine-tuning model parameters', type: 'info' },
      ],
    },
    created: '2024-01-10',
    modified: '2024-01-20',
  };

  useEffect(() => {
    loadSwarmDetail();
  }, [id]);

  const loadSwarmDetail = async () => {
    setLoading(true);
    try {
      if (id) {
        const numericId = parseInt(id);
        if (!isNaN(numericId)) {
          const apiSwarm = await agentDojoAPI.getSwarm(numericId);
          const uiSwarm = agentDojoAPI.convertToUIFormat(apiSwarm);
          // Enhance with mock training data for demo
          setSwarm({ ...mockSwarm, ...uiSwarm });
        } else {
          setSwarm(mockSwarm);
        }
      }
    } catch (error) {
      console.error('Failed to load swarm details:', error);
      setSwarm(mockSwarm);
    } finally {
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
      
      // Update via API
      const numericId = parseInt(swarm.id);
      if (!isNaN(numericId)) {
        await agentDojoAPI.updateSwarm(numericId, agentDojoAPI.convertToAPIFormat(updatedSwarm));
      }
      
      addNotification({ type: 'success', message: `${field} updated successfully` });
    } catch (error) {
      addNotification({ type: 'error', message: `Failed to update ${field}` });
    }
  };

  const handleCancel = (field: string) => {
    setEditMode({ ...editMode, [field]: false });
    setEditValues({ ...editValues, [field]: swarm?.[field as keyof AgentSwarm] });
  };

  const handleEditConfiguration = () => {
    setConfigModalVisible(true);
  };

  const handleDeploy = () => {
    modal.confirm({
      title: 'Deploy Agent Swarm',
      content: `Deploy "${swarm?.name}" to production? The swarm will start processing leads immediately.`,
      onOk: async () => {
        if (!swarm) return;
        try {
          const numericId = parseInt(swarm.id);
          if (!isNaN(numericId)) {
            await agentDojoAPI.deploySwarm(numericId);
          }
          setSwarm({ ...swarm, status: 'deployed' });
          addNotification({ type: 'success', message: 'Agent swarm deployed successfully' });
        } catch (error: any) {
          addNotification({ type: 'error', message: error.message || 'Failed to deploy swarm' });
        }
      },
    });
  };

  const handlePause = async () => {
    if (!swarm) return;
    try {
      const numericId = parseInt(swarm.id);
      if (!isNaN(numericId)) {
        await agentDojoAPI.pauseSwarm(numericId);
      }
      setSwarm({ ...swarm, status: 'inactive' });
      addNotification({ type: 'success', message: 'Agent swarm paused' });
    } catch (error: any) {
      addNotification({ type: 'error', message: error.message || 'Failed to pause swarm' });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      training: { color: 'orange', icon: <LoadingOutlined />, text: 'Training' },
      ready: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Ready to Deploy' },
      deployed: { color: 'green', icon: <RocketOutlined />, text: 'Deployed' },
      inactive: { color: 'default', icon: <PauseCircleOutlined />, text: 'Inactive' },
      error: { color: 'red', icon: <WarningOutlined />, text: 'Error' },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <Badge
        status={config.color === 'green' ? 'success' : config.color === 'orange' ? 'processing' : 'default'}
        text={
          <Space>
            {config.icon}
            <span>{config.text}</span>
          </Space>
        }
      />
    );
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
        <Col span={24}>
          <Card>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Swarm Name">
                {renderEditableField('name')}
              </Descriptions.Item>
              <Descriptions.Item label="Goal">
                {renderEditableField('goal', 'textarea')}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {renderEditableField('description', 'textarea')}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusBadge(swarm?.status || 'inactive')}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(swarm?.created || '').toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Modified">
                {new Date(swarm?.modified || '').toLocaleDateString()}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Performance Metrics" extra={<LineChartOutlined />}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total Processed"
                  value={swarm?.performance.totalProcessed}
                  prefix={<ThunderboltOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Success Rate"
                  value={swarm?.performance.successRate}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Lead Conversion"
                  value={swarm?.performance.leadConversion}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Avg Response Time"
                  value={swarm?.performance.avgResponseTime}
                  suffix="s"
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
            </Row>
            <Divider />
            <div>
              <Text type="secondary">Customer Satisfaction</Text>
              <Progress
                percent={(swarm?.performance.customerSatisfaction || 0) * 20}
                strokeColor="#52c41a"
                format={() => `${swarm?.performance.customerSatisfaction}/5`}
              />
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Event Triggers" extra={<ThunderboltOutlined />}>
            <List
              dataSource={swarm?.eventTriggers || []}
              renderItem={(trigger) => {
                const category = eventCategories[trigger.type];
                return (
                  <List.Item>
                    <Space>
                      {category?.icon}
                      <div>
                        <Text strong>{trigger.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {trigger.subType.replace('_', ' ')}
                        </Text>
                      </div>
                    </Space>
                    <Tag color={trigger.enabled ? 'green' : 'default'}>
                      {trigger.enabled ? 'Active' : 'Inactive'}
                    </Tag>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Assigned Agents" extra={<RobotOutlined />}>
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
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Tools:</Text>
                        <div style={{ marginTop: 4 }}>
                          {agent.tools.map((toolId) => {
                            const tool = availableTools.find(t => t.id === toolId);
                            return tool ? (
                              <Tag key={toolId} style={{ marginBottom: 4 }}>
                                {tool.name}
                              </Tag>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Tools & Integrations" extra={<ToolOutlined />}>
            <Row gutter={[16, 16]}>
              {swarm?.tools.map((toolId) => {
                const tool = availableTools.find(t => t.id === toolId);
                return tool ? (
                  <Col span={6} key={toolId}>
                    <Card size="small" hoverable>
                      <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <div style={{ fontSize: 24 }}>{tool.icon}</div>
                        <Text strong>{tool.name}</Text>
                        <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
                          {tool.description}
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                ) : null;
              })}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderTrainingTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        {swarm?.status === 'training' && swarm.training && (
          <>
            <Col span={24}>
              <Alert
                message="Training in Progress"
                description={`Your swarm is currently being trained. ${swarm.training.currentStep}`}
                type="info"
                showIcon
                icon={<LoadingOutlined />}
              />
            </Col>

            <Col span={8}>
              <Card>
                <Statistic
                  title="Training Progress"
                  value={swarm.training.progress}
                  suffix="%"
                  prefix={<LoadingOutlined />}
                />
                <Progress percent={swarm.training.progress} status="active" />
              </Card>
            </Col>

            <Col span={8}>
              <Card>
                <Statistic
                  title="Estimated Time Remaining"
                  value={swarm.training.eta}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>

            <Col span={8}>
              <Card>
                <Statistic
                  title="Current Step"
                  value={swarm.training.currentStep}
                  valueStyle={{ fontSize: 16 }}
                />
              </Card>
            </Col>

            <Col span={24}>
              <Card title="Training Logs" extra={<HistoryOutlined />}>
                <Timeline>
                  {swarm.training.logs.map((log, index) => (
                    <Timeline.Item
                      key={index}
                      color={
                        log.type === 'success' ? 'green' :
                        log.type === 'error' ? 'red' :
                        log.type === 'warning' ? 'orange' : 'blue'
                      }
                      dot={
                        log.type === 'success' ? <CheckCircleOutlined /> :
                        log.type === 'error' ? <CloseOutlined /> :
                        log.type === 'warning' ? <WarningOutlined /> : <ClockCircleOutlined />
                      }
                    >
                      <Space direction="vertical">
                        <Text>{log.message}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </Text>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
          </>
        )}

        {swarm?.status !== 'training' && (
          <Col span={24}>
            <Card title="Training Results">
              <Row gutter={[16, 16]}>
                <Col span={6}>
                  <Statistic
                    title="Model Accuracy"
                    value={92.3}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Validation Score"
                    value={89.7}
                    suffix="%"
                    prefix={<ExperimentOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Training Duration"
                    value="4h 32m"
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Dataset Size"
                    value={swarm?.trainingDataset.size}
                    prefix={<DatabaseOutlined />}
                  />
                </Col>
              </Row>

              <Divider />

              <Descriptions column={2}>
                <Descriptions.Item label="Training Dataset">
                  {swarm?.trainingDataset.name}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {swarm?.trainingDataset.lastUpdated}
                </Descriptions.Item>
                <Descriptions.Item label="Model Version">v1.2.3</Descriptions.Item>
                <Descriptions.Item label="Training Completed">
                  {new Date().toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        )}

        <Col span={24}>
          <Card title="Training Configuration">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Training Dataset">
                    <Select value={swarm?.trainingDataset.id} disabled={swarm?.status === 'training'}>
                      <Option value="ds_001">Enterprise Sales Dataset v2.3</Option>
                      <Option value="ds_002">Insurance Sales Playbook</Option>
                      <Option value="ds_003">SMB Sales Training Data</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Training Mode">
                    <Select defaultValue="supervised" disabled={swarm?.status === 'training'}>
                      <Option value="supervised">Supervised Learning</Option>
                      <Option value="reinforcement">Reinforcement Learning</Option>
                      <Option value="transfer">Transfer Learning</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Batch Size">
                    <Input defaultValue="32" disabled={swarm?.status === 'training'} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Learning Rate">
                    <Input defaultValue="0.001" disabled={swarm?.status === 'training'} />
                  </Form.Item>
                </Col>
              </Row>
              {swarm?.status !== 'training' && (
                <Button type="primary" icon={<ExperimentOutlined />}>
                  Start New Training Session
                </Button>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderDeploymentTab = () => (
    <div>
      <Row gutter={[24, 24]}>
        {swarm?.status === 'deployed' && (
          <>
            <Col span={24}>
              <Alert
                message="Swarm Deployed"
                description="Your agent swarm is actively processing leads in production."
                type="success"
                showIcon
              />
            </Col>

            <Col span={24}>
              <Card title="Deployment Details">
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Environment">
                    <Tag color="green">{swarm.deployment.environment.toUpperCase()}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Version">
                    {swarm.deployment.version || 'v1.0.0'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Endpoint">
                    <Space>
                      <GlobalOutlined />
                      <Text copyable>{swarm.deployment.endpoint}</Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Resources">
                    <Space>
                      <CloudServerOutlined />
                      {swarm.deployment.resources}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Deployed">
                    {swarm.deployment.lastDeployed ? new Date(swarm.deployment.lastDeployed).toLocaleString() : 'Never'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Health Status">
                    <Badge status="success" text="Healthy" />
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Resource Utilization">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text>CPU Usage</Text>
                    <Progress percent={45} strokeColor="#1890ff" />
                  </div>
                  <div>
                    <Text>Memory Usage</Text>
                    <Progress percent={62} strokeColor="#52c41a" />
                  </div>
                  <div>
                    <Text>Network I/O</Text>
                    <Progress percent={28} strokeColor="#722ed1" />
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Security & Compliance">
                <List>
                  <List.Item>
                    <Space>
                      <SecurityScanOutlined style={{ color: '#52c41a' }} />
                      <Text>SSL/TLS Encryption</Text>
                    </Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  </List.Item>
                  <List.Item>
                    <Space>
                      <SecurityScanOutlined style={{ color: '#52c41a' }} />
                      <Text>API Authentication</Text>
                    </Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  </List.Item>
                  <List.Item>
                    <Space>
                      <SecurityScanOutlined style={{ color: '#52c41a' }} />
                      <Text>GDPR Compliant</Text>
                    </Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  </List.Item>
                  <List.Item>
                    <Space>
                      <SecurityScanOutlined style={{ color: '#52c41a' }} />
                      <Text>Data Encryption at Rest</Text>
                    </Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  </List.Item>
                </List>
              </Card>
            </Col>
          </>
        )}

        {swarm?.status !== 'deployed' && (
          <Col span={24}>
            <Empty
              description="Swarm not deployed"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Space direction="vertical">
                <Text type="secondary">
                  Deploy your swarm to start processing leads
                </Text>
                {swarm?.status === 'ready' && (
                  <Button type="primary" icon={<RocketOutlined />} onClick={handleDeploy}>
                    Deploy to Production
                  </Button>
                )}
              </Space>
            </Empty>
          </Col>
        )}

        <Col span={24}>
          <Card title="Deployment Configuration">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Target Environment">
                    <Select value={swarm?.deployment.environment} disabled={swarm?.status === 'deployed'}>
                      <Option value="development">Development</Option>
                      <Option value="staging">Staging</Option>
                      <Option value="production">Production</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Resource Allocation">
                    <Select defaultValue="standard" disabled={swarm?.status === 'deployed'}>
                      <Option value="minimal">Minimal (1 vCPU, 2GB RAM)</Option>
                      <Option value="standard">Standard (2 vCPU, 4GB RAM)</Option>
                      <Option value="performance">Performance (4 vCPU, 8GB RAM)</Option>
                      <Option value="premium">Premium (8 vCPU, 16GB RAM)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Auto-scaling">
                    <Select defaultValue="enabled" disabled={swarm?.status === 'deployed'}>
                      <Option value="enabled">Enabled</Option>
                      <Option value="disabled">Disabled</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Deployment Region">
                    <Select defaultValue="us-east-1" disabled={swarm?.status === 'deployed'}>
                      <Option value="us-east-1">US East (Virginia)</Option>
                      <Option value="us-west-2">US West (Oregon)</Option>
                      <Option value="eu-west-1">EU (Ireland)</Option>
                      <Option value="ap-southeast-1">Asia Pacific (Singapore)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {swarm?.status === 'deployed' && (
          <Col span={24}>
            <Card title="Recent Deployments">
              <Timeline>
                <Timeline.Item color="green">
                  <Space direction="vertical">
                    <Text strong>Production Deployment</Text>
                    <Text type="secondary">Version v1.2.3 deployed successfully</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date().toLocaleString()}
                    </Text>
                  </Space>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <Space direction="vertical">
                    <Text strong>Configuration Update</Text>
                    <Text type="secondary">Auto-scaling enabled</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(Date.now() - 86400000).toLocaleString()}
                    </Text>
                  </Space>
                </Timeline.Item>
                <Timeline.Item>
                  <Space direction="vertical">
                    <Text strong>Initial Deployment</Text>
                    <Text type="secondary">Version v1.0.0 deployed to staging</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(Date.now() - 604800000).toLocaleString()}
                    </Text>
                  </Space>
                </Timeline.Item>
              </Timeline>
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
                  {getStatusBadge(swarm.status)}
                  <Text type="secondary">ID: {swarm.id}</Text>
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              {swarm.status === 'ready' && (
                <Button type="primary" icon={<RocketOutlined />} onClick={handleDeploy}>
                  Deploy
                </Button>
              )}
              {swarm.status === 'deployed' && (
                <Button icon={<PauseCircleOutlined />} onClick={handlePause}>
                  Pause
                </Button>
              )}
              {swarm.status === 'training' && (
                <Button icon={<PauseCircleOutlined />} disabled>
                  Training...
                </Button>
              )}
              <Button icon={<EditOutlined />} onClick={handleEditConfiguration}>
                Edit Configuration
              </Button>
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
                <ExperimentOutlined />
                Training
                {swarm.status === 'training' && (
                  <Badge count={`${swarm.training?.progress}%`} style={{ marginLeft: 8 }} />
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
                <CloudServerOutlined />
                Deployment
                {swarm.status === 'deployed' && (
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
        title="Edit Swarm Configuration"
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfigModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            addNotification({ type: 'info', message: 'Configuration saved. Use the inline editing for immediate changes.' });
            setConfigModalVisible(false);
          }}>
            Save Changes
          </Button>,
        ]}
        width={800}
      >
        <Alert
          message="Configuration Options"
          description="You can edit most configuration directly on this page. Use the tabs and inline editing features for immediate updates."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Divider orientation="left">Quick Actions</Divider>
        
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small" hoverable onClick={() => { setConfigModalVisible(false); setActiveTab('overview'); }}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <DeploymentUnitOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <Text strong>Edit Basic Info</Text>
                <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
                  Name, Goal, Description
                </Text>
              </Space>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card size="small" hoverable onClick={() => { setConfigModalVisible(false); setActiveTab('training'); }}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <ExperimentOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <Text strong>Training Settings</Text>
                <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
                  Dataset, Parameters, Mode
                </Text>
              </Space>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card size="small" hoverable onClick={() => { setConfigModalVisible(false); setActiveTab('deployment'); }}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <CloudServerOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                <Text strong>Deployment Config</Text>
                <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
                  Environment, Resources, Region
                </Text>
              </Space>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card size="small" hoverable onClick={() => { setConfigModalVisible(false); navigate('/swarms'); }}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <ToolOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                <Text strong>Advanced Settings</Text>
                <Text type="secondary" style={{ fontSize: 12, textAlign: 'center' }}>
                  Tools, Agents, Triggers
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary">
            <InfoCircleOutlined /> Click on any card above to navigate to the relevant section
          </Text>
          <Text type="secondary">
            <EditOutlined /> Use the edit icons next to fields for inline editing
          </Text>
          <Text type="secondary">
            <SaveOutlined /> Changes are saved automatically when you click the save button
          </Text>
        </Space>
      </Modal>
    </div>
  );
};

export default SwarmDetail;