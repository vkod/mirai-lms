import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Card, 
  Input, 
  Modal, 
  Form, 
  Select,
  Row,
  Col,
  Divider,
  Alert,
  Progress,
  Checkbox,
  Avatar,
  Tooltip,
  Badge,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  ApiOutlined,
  BookOutlined,
  ToolOutlined,
  AimOutlined,
  ExperimentOutlined,
  RocketOutlined,
  LoadingOutlined,
  WarningOutlined,
  PauseCircleOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { useStore } from '../store/useStore';

const { TextArea } = Input;
const { Option } = Select;

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
  };
  created: string;
  modified: string;
}

const availableTools = [
  { id: 'crm_integration', name: 'CRM Integration', icon: <DatabaseOutlined />, description: 'Access and update CRM records' },
  { id: 'email_sender', name: 'Email Automation', icon: <ApiOutlined />, description: 'Send personalized emails' },
  { id: 'calendar_scheduler', name: 'Calendar Scheduler', icon: <BookOutlined />, description: 'Schedule meetings and follow-ups' },
  { id: 'lead_scorer', name: 'Lead Scoring', icon: <AimOutlined />, description: 'Evaluate and score leads' },
  { id: 'sentiment_analyzer', name: 'Sentiment Analysis', icon: <ExperimentOutlined />, description: 'Analyze customer sentiment' },
  { id: 'data_enrichment', name: 'Data Enrichment', icon: <DatabaseOutlined />, description: 'Enrich lead data from external sources' },
  { id: 'chat_interface', name: 'Chat Interface', icon: <RobotOutlined />, description: 'Engage in real-time conversations' },
  { id: 'report_generator', name: 'Report Generator', icon: <BookOutlined />, description: 'Generate analytical reports' },
];


const eventCategories = {
  prospect_action: {
    label: 'Prospect Actions',
    icon: <UserOutlined />,
    subtypes: [
      { value: 'form_submitted', label: 'Form Submission' },
      { value: 'email_opened', label: 'Email Opened' },
      { value: 'link_clicked', label: 'Link Clicked' },
      { value: 'page_visited', label: 'Page Visited' },
      { value: 'document_downloaded', label: 'Document Downloaded' },
      { value: 'meeting_scheduled', label: 'Meeting Scheduled' },
      { value: 'chat_initiated', label: 'Chat Initiated' },
    ],
  },
  life_event: {
    label: 'Life Events',
    icon: <HeartOutlined />,
    subtypes: [
      { value: 'marriage', label: 'Marriage' },
      { value: 'new_baby', label: 'New Baby' },
      { value: 'home_purchase', label: 'Home Purchase' },
      { value: 'retirement', label: 'Retirement' },
      { value: 'job_change', label: 'Job Change' },
      { value: 'relocation', label: 'Relocation' },
    ],
  },
  business_event: {
    label: 'Business Events',
    icon: <ShoppingCartOutlined />,
    subtypes: [
      { value: 'funding_raised', label: 'Funding Raised' },
      { value: 'expansion', label: 'Business Expansion' },
      { value: 'acquisition', label: 'Acquisition' },
      { value: 'new_product', label: 'New Product Launch' },
      { value: 'leadership_change', label: 'Leadership Change' },
      { value: 'ipo', label: 'IPO Filing' },
    ],
  },
  time_based: {
    label: 'Time-Based',
    icon: <CalendarOutlined />,
    subtypes: [
      { value: 'anniversary', label: 'Anniversary' },
      { value: 'renewal_due', label: 'Renewal Due' },
      { value: 'contract_expiry', label: 'Contract Expiry' },
      { value: 'follow_up_due', label: 'Follow-up Due' },
      { value: 'birthday', label: 'Birthday' },
    ],
  },
  data_change: {
    label: 'Data Changes',
    icon: <DatabaseOutlined />,
    subtypes: [
      { value: 'score_increase', label: 'Lead Score Increased' },
      { value: 'status_change', label: 'Status Changed' },
      { value: 'budget_updated', label: 'Budget Updated' },
      { value: 'contact_added', label: 'New Contact Added' },
      { value: 'engagement_spike', label: 'Engagement Spike' },
    ],
  },
};

const SwarmManagement: React.FC = () => {
  const [swarms, setSwarms] = useState<AgentSwarm[]>([]);
  const [filteredSwarms, setFilteredSwarms] = useState<AgentSwarm[]>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSwarm, setEditingSwarm] = useState<AgentSwarm | null>(null);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<EventTrigger[]>([]);
  const [form] = Form.useForm();
  const addNotification = useStore((state) => state.addNotification);

  // Mock data for initial swarms
  const mockSwarms: AgentSwarm[] = [
    {
      id: '1',
      name: 'Enterprise Lead Qualification',
      goal: 'Qualify and prioritize enterprise leads for sales team engagement',
      description: 'Multi-agent swarm that researches, scores, and qualifies enterprise leads',
      status: 'deployed',
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
        lastDeployed: '2024-01-20',
      },
      created: '2024-01-10',
      modified: '2024-01-20',
    },
    {
      id: '2',
      name: 'Insurance Lead Nurturing',
      goal: 'Nurture insurance leads through personalized engagement until ready for agent handoff',
      description: 'Automated nurturing system for insurance prospects',
      status: 'ready',
      tools: ['email_sender', 'calendar_scheduler', 'chat_interface'],
      trainingDataset: {
        id: 'ds_002',
        name: 'Insurance Sales Playbook',
        size: 28000,
        lastUpdated: '2024-01-18',
      },
      eventTriggers: [
        {
          id: 'tr_004',
          name: 'Insurance Quote Request',
          type: 'prospect_action',
          subType: 'form_submitted',
          conditions: { formType: 'insurance_quote' },
          enabled: true,
        },
        {
          id: 'tr_005',
          name: 'Life Event - New Home',
          type: 'life_event',
          subType: 'home_purchase',
          conditions: { insuranceType: 'home' },
          enabled: true,
        },
      ],
      agents: [
        {
          id: 'ag_003',
          name: 'Insurance Advisor',
          role: 'Nurture Specialist',
          model: 'GPT-3.5',
          instructions: 'Provide personalized insurance education content. Guide prospects through policy options and coverage details. Schedule appointments with licensed agents when ready.',
          tools: ['email_sender', 'calendar_scheduler'],
          capabilities: ['Drip campaigns', 'Content delivery', 'Educational content'],
        },
        {
          id: 'ag_004',
          name: 'Coverage Assistant',
          role: 'Conversation Agent',
          model: 'Claude-2',
          instructions: 'Answer insurance-related questions, help with quote comparisons, and collect necessary information for accurate quotes.',
          tools: ['chat_interface'],
          capabilities: ['Chat handling', 'Q&A responses', 'Quote assistance'],
        },
      ],
      performance: {
        totalProcessed: 1890,
        successRate: 92.1,
        avgResponseTime: 1.5,
        leadConversion: 28.7,
        customerSatisfaction: 4.8,
      },
      deployment: {
        environment: 'staging',
        resources: '2 vCPU, 4GB RAM',
        lastDeployed: undefined,
      },
      created: '2024-01-12',
      modified: '2024-01-18',
    },
    {
      id: '3',
      name: 'SMB Quick Response',
      goal: 'Provide immediate response and qualification for small business inquiries',
      description: 'Fast-response swarm for SMB market segment',
      status: 'training',
      tools: ['chat_interface', 'calendar_scheduler', 'crm_integration'],
      trainingDataset: {
        id: 'ds_003',
        name: 'SMB Sales Training Data',
        size: 15000,
        lastUpdated: '2024-01-22',
      },
      eventTriggers: [
        {
          id: 'tr_006',
          name: 'Website Chat Started',
          type: 'prospect_action',
          subType: 'chat_initiated',
          conditions: { channel: 'website', businessSize: 'smb' },
          enabled: true,
        },
      ],
      agents: [
        {
          id: 'ag_005',
          name: 'SMB Concierge',
          role: 'Conversation Agent',
          model: 'GPT-3.5-turbo',
          instructions: 'Provide immediate assistance to small business inquiries. Understand their needs quickly and route to appropriate resources or schedule demos.',
          tools: ['chat_interface', 'calendar_scheduler', 'crm_integration'],
          capabilities: ['Chat handling', 'Meeting scheduling', 'Needs assessment'],
        },
      ],
      performance: {
        totalProcessed: 0,
        successRate: 0,
        avgResponseTime: 0,
        leadConversion: 0,
        customerSatisfaction: 0,
      },
      deployment: {
        environment: 'development',
        resources: '1 vCPU, 2GB RAM',
        lastDeployed: undefined,
      },
      created: '2024-01-22',
      modified: '2024-01-22',
    },
  ];

  useEffect(() => {
    setSwarms(mockSwarms);
    setFilteredSwarms(mockSwarms);
  }, []);

  useEffect(() => {
    const filtered = swarms.filter(
      (swarm) =>
        swarm.name.toLowerCase().includes(searchText.toLowerCase()) ||
        swarm.goal.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredSwarms(filtered);
  }, [searchText, swarms]);

  const handleCreate = () => {
    setEditingSwarm(null);
    setSelectedTools([]);
    setSelectedEvents([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (swarm: AgentSwarm) => {
    setEditingSwarm(swarm);
    setSelectedTools(swarm.tools);
    setSelectedEvents(swarm.eventTriggers);
    form.setFieldsValue({
      name: swarm.name,
      goal: swarm.goal,
      description: swarm.description,
      trainingDataset: swarm.trainingDataset.name,
      environment: swarm.deployment.environment,
    });
    setModalVisible(true);
  };

  const addEventTrigger = () => {
    const newEvent: EventTrigger = {
      id: Date.now().toString(),
      name: 'New Event',
      type: 'prospect_action',
      subType: 'form_submitted',
      conditions: {},
      enabled: true,
    };
    setSelectedEvents([...selectedEvents, newEvent]);
  };

  const updateEventTrigger = (index: number, field: string, value: any) => {
    const updated = [...selectedEvents];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedEvents(updated);
  };

  const removeEventTrigger = (index: number) => {
    setSelectedEvents(selectedEvents.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Delete Agent Swarm',
      content: 'Are you sure you want to delete this agent swarm? This action cannot be undone.',
      onOk: async () => {
        setSwarms(prev => prev.filter(s => s.id !== id));
        addNotification({ type: 'success', message: 'Agent swarm deleted successfully' });
      },
    });
  };

  const handleDeploy = (swarm: AgentSwarm) => {
    Modal.confirm({
      title: 'Deploy Agent Swarm',
      content: `Deploy "${swarm.name}" to production? The swarm will start processing leads immediately.`,
      onOk: async () => {
        setSwarms(prev => prev.map(s => 
          s.id === swarm.id 
            ? { ...s, status: 'deployed', deployment: { ...s.deployment, lastDeployed: new Date().toISOString() } }
            : s
        ));
        addNotification({ type: 'success', message: 'Agent swarm deployed successfully' });
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const swarmData: Partial<AgentSwarm> = {
        name: values.name,
        goal: values.goal,
        description: values.description,
        tools: selectedTools,
        eventTriggers: selectedEvents,
        trainingDataset: {
          id: 'ds_new',
          name: values.trainingDataset,
          size: 10000,
          lastUpdated: new Date().toISOString(),
        },
        deployment: {
          environment: values.environment || 'development',
          resources: '2 vCPU, 4GB RAM',
        },
      };
      
      if (editingSwarm) {
        setSwarms(prev => prev.map(swarm => 
          swarm.id === editingSwarm.id ? { ...swarm, ...swarmData, modified: new Date().toISOString() } : swarm
        ));
        addNotification({ type: 'success', message: 'Agent swarm updated successfully' });
      } else {
        const newSwarm: AgentSwarm = {
          ...swarmData as AgentSwarm,
          id: Date.now().toString(),
          status: 'training',
          agents: [], // System will assign agents automatically
          performance: {
            totalProcessed: 0,
            successRate: 0,
            avgResponseTime: 0,
            leadConversion: 0,
            customerSatisfaction: 0,
          },
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        };
        setSwarms(prev => [...prev, newSwarm]);
        addNotification({ type: 'success', message: 'Agent swarm created successfully' });
      }
      
      setModalVisible(false);
    } catch (error) {
      addNotification({ type: 'error', message: 'Please fill in all required fields' });
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: any = {
      training: { color: 'orange', icon: <LoadingOutlined />, text: 'Training' },
      ready: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Ready to Deploy' },
      deployed: { color: 'green', icon: <RocketOutlined />, text: 'Deployed' },
      inactive: { color: 'default', icon: <PauseCircleOutlined />, text: 'Inactive' },
      error: { color: 'red', icon: <WarningOutlined />, text: 'Error' },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Swarm Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AgentSwarm) => (
        <div>
          <Space>
            <RobotOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <div>
              <strong>{text}</strong>
              <div style={{ fontSize: 12, color: '#666' }}>{record.goal}</div>
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Agents',
      key: 'agents',
      render: (_: any, record: AgentSwarm) => (
        <Avatar.Group maxCount={3}>
          {record.agents.map(agent => (
            <Tooltip key={agent.id} title={`${agent.name} (${agent.role})`}>
              <Avatar style={{ backgroundColor: '#87d068' }}>
                {agent.name.charAt(0)}
              </Avatar>
            </Tooltip>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: 'Event Triggers',
      key: 'events',
      render: (_: any, record: AgentSwarm) => (
        <Space wrap>
          {record.eventTriggers.slice(0, 2).map(event => {
            const category = eventCategories[event.type as keyof typeof eventCategories];
            return (
              <Tooltip key={event.id} title={event.name}>
                <Tag icon={category?.icon} color={event.enabled ? 'blue' : 'default'}>
                  {event.subType.replace('_', ' ')}
                </Tag>
              </Tooltip>
            );
          })}
          {record.eventTriggers.length > 2 && (
            <Tag>+{record.eventTriggers.length - 2} more</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Tools',
      key: 'tools',
      render: (_: any, record: AgentSwarm) => (
        <Space wrap>
          {record.tools.slice(0, 3).map(toolId => {
            const tool = availableTools.find(t => t.id === toolId);
            return tool ? (
              <Tooltip key={toolId} title={tool.name}>
                <Tag icon={<ToolOutlined />}>{tool.name.split(' ')[0]}</Tag>
              </Tooltip>
            ) : null;
          })}
          {record.tools.length > 3 && (
            <Tag>+{record.tools.length - 3} more</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: any, record: AgentSwarm) => (
        <Space direction="vertical" size="small">
          <div>
            <span style={{ fontSize: 12, color: '#666' }}>Success Rate</span>
            <Progress 
              percent={record.performance.successRate} 
              size="small" 
              strokeColor={record.performance.successRate > 80 ? '#52c41a' : '#faad14'}
            />
          </div>
          <div style={{ fontSize: 12 }}>
            <Badge status="processing" text={`${record.performance.totalProcessed} processed`} />
          </div>
        </Space>
      ),
    },
    {
      title: 'Training Data',
      key: 'dataset',
      render: (_: any, record: AgentSwarm) => (
        <div style={{ fontSize: 12 }}>
          <div>{record.trainingDataset.name}</div>
          <div style={{ color: '#666' }}>
            {(record.trainingDataset.size / 1000).toFixed(1)}k records
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AgentSwarm) => (
        <Space size="middle">
          {record.status === 'ready' && (
            <Tooltip title="Deploy">
              <Button
                type="primary"
                size="small"
                icon={<RocketOutlined />}
                onClick={() => handleDeploy(record)}
              >
                Deploy
              </Button>
            </Tooltip>
          )}
          {record.status === 'deployed' && (
            <Tooltip title="Pause">
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                onClick={() => {
                  setSwarms(prev => prev.map(s => 
                    s.id === record.id ? { ...s, status: 'inactive' } : s
                  ));
                }}
              >
                Pause
              </Button>
            </Tooltip>
          )}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Agent Dojo</h1>

      <Alert
        message="Agent Dojo"
        description="Configure autonomous AI agent teams that work together to qualify, nurture, and convert leads. Each swarm consists of specialized agents with access to tools and trained on your business data."
        type="info"
        showIcon
        icon={<RobotOutlined />}
        style={{ marginBottom: 16 }}
      />
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="Search agent swarms..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Agent Swarm
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredSwarms}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingSwarm ? 'Edit Agent Swarm' : 'Create Agent Swarm'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={900}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Swarm Name"
                rules={[{ required: true, message: 'Please enter swarm name' }]}
              >
                <Input 
                  placeholder="e.g., Enterprise Lead Qualification" 
                  prefix={<RobotOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="goal"
            label="Swarm Goal/Intent"
            rules={[{ required: true, message: 'Please describe the swarm goal' }]}
          >
            <TextArea 
              rows={2} 
              placeholder="What is the primary objective of this agent swarm? e.g., Qualify and prioritize enterprise leads for sales team engagement"
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              rows={2} 
              placeholder="Additional details about how this swarm operates"
            />
          </Form.Item>

          <Divider>Select Tools</Divider>
          
          <div style={{ marginBottom: 16 }}>
            <Row gutter={[8, 8]}>
              {availableTools.map(tool => (
                <Col key={tool.id} span={12}>
                  <Card
                    size="small"
                    hoverable
                    style={{ 
                      borderColor: selectedTools.includes(tool.id) ? '#1890ff' : undefined,
                      backgroundColor: selectedTools.includes(tool.id) ? '#f0f5ff' : undefined,
                    }}
                    onClick={() => {
                      setSelectedTools(prev =>
                        prev.includes(tool.id)
                          ? prev.filter(t => t !== tool.id)
                          : [...prev, tool.id]
                      );
                    }}
                  >
                    <Checkbox checked={selectedTools.includes(tool.id)}>
                      <Space>
                        {tool.icon}
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{tool.name}</div>
                          <div style={{ fontSize: 11, color: '#666' }}>{tool.description}</div>
                        </div>
                      </Space>
                    </Checkbox>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>

          <Divider>Event Triggers</Divider>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Configure events that will trigger this swarm</span>
              <Button 
                type="dashed" 
                size="small" 
                icon={<PlusCircleOutlined />} 
                onClick={addEventTrigger}
              >
                Add Event
              </Button>
            </div>
            
            {selectedEvents.length === 0 ? (
              <Empty 
                description="No events configured" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {selectedEvents.map((event, index) => (
                  <Card key={event.id} size="small" style={{ backgroundColor: '#fafafa' }}>
                    <Row gutter={[8, 8]}>
                      <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Input
                            placeholder="Event name"
                            value={event.name}
                            onChange={(e) => updateEventTrigger(index, 'name', e.target.value)}
                            style={{ width: 'calc(100% - 40px)' }}
                          />
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => removeEventTrigger(index)}
                          />
                        </div>
                      </Col>
                      
                      <Col span={12}>
                        <Select
                          value={event.type}
                          onChange={(value) => {
                            updateEventTrigger(index, 'type', value);
                            const firstSubtype = eventCategories[value as keyof typeof eventCategories]?.subtypes[0];
                            if (firstSubtype) {
                              updateEventTrigger(index, 'subType', firstSubtype.value);
                            }
                          }}
                          style={{ width: '100%' }}
                        >
                          {Object.entries(eventCategories).map(([key, category]) => (
                            <Option key={key} value={key}>
                              <Space>
                                {category.icon}
                                {category.label}
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      </Col>
                      
                      <Col span={12}>
                        <Select
                          value={event.subType}
                          onChange={(value) => updateEventTrigger(index, 'subType', value)}
                          style={{ width: '100%' }}
                        >
                          {eventCategories[event.type as keyof typeof eventCategories]?.subtypes.map(subtype => (
                            <Option key={subtype.value} value={subtype.value}>
                              {subtype.label}
                            </Option>
                          ))}
                        </Select>
                      </Col>
                      
                      <Col span={24}>
                        <Input.Group compact>
                          <Input
                            style={{ width: '50%' }}
                            placeholder="Condition field"
                            value={Object.keys(event.conditions)[0] || ''}
                            onChange={(e) => {
                              const oldKey = Object.keys(event.conditions)[0];
                              const newConditions = { [e.target.value]: event.conditions[oldKey] || '' };
                              updateEventTrigger(index, 'conditions', newConditions);
                            }}
                          />
                          <Input
                            style={{ width: '50%' }}
                            placeholder="Condition value"
                            value={Object.values(event.conditions)[0] || ''}
                            onChange={(e) => {
                              const key = Object.keys(event.conditions)[0] || 'value';
                              updateEventTrigger(index, 'conditions', { [key]: e.target.value });
                            }}
                          />
                        </Input.Group>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            )}
          </div>

          {editingSwarm && editingSwarm.agents.length > 0 && (
            <>
              <Divider>System-Assigned Agents</Divider>
              
              <div style={{ marginBottom: 16 }}>
                <Alert
                  message="The system has automatically assigned the following agents based on your swarm's goal and requirements"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  {editingSwarm.agents.map(agent => (
                    <Card
                      key={agent.id}
                      size="small"
                      style={{ backgroundColor: '#f9f9f9' }}
                    >
                      <Row gutter={[16, 8]}>
                        <Col span={24}>
                          <Space>
                            <Avatar style={{ backgroundColor: '#1890ff' }} icon={<RobotOutlined />} />
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: 16 }}>{agent.name}</div>
                              <Tag color="blue">{agent.role}</Tag>
                              <Tag color="green">{agent.model}</Tag>
                            </div>
                          </Space>
                        </Col>
                        
                        <Col span={24}>
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Instructions:</div>
                            <div style={{ 
                              backgroundColor: '#fff', 
                              padding: 8, 
                              borderRadius: 4, 
                              border: '1px solid #e8e8e8',
                              fontSize: 13,
                              lineHeight: 1.5,
                              color: '#595959'
                            }}>
                              {agent.instructions}
                            </div>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Assigned Tools:</div>
                            <Space wrap>
                              {agent.tools.map(toolId => {
                                const tool = availableTools.find(t => t.id === toolId);
                                return tool ? (
                                  <Tag key={toolId} icon={<ToolOutlined />} color="purple">
                                    {tool.name}
                                  </Tag>
                                ) : null;
                              })}
                            </Space>
                          </div>
                        </Col>
                        
                        <Col span={12}>
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Capabilities:</div>
                            <Space wrap>
                              {agent.capabilities.map(cap => (
                                <Tag key={cap} color="cyan">{cap}</Tag>
                              ))}
                            </Space>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>
              </div>
            </>
          )}

          <Divider>Training & Deployment</Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="trainingDataset"
                label="Training Dataset"
                rules={[{ required: true, message: 'Please select training dataset' }]}
              >
                <Select placeholder="Select or upload dataset">
                  <Option value="Enterprise Sales Dataset v2.3">Enterprise Sales Dataset v2.3</Option>
                  <Option value="Insurance Sales Playbook">Insurance Sales Playbook</Option>
                  <Option value="SMB Sales Training Data">SMB Sales Training Data</Option>
                  <Option value="Custom Dataset">Upload Custom Dataset...</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="environment"
                label="Initial Environment"
                initialValue="development"
              >
                <Select>
                  <Option value="development">Development</Option>
                  <Option value="staging">Staging</Option>
                  <Option value="production">Production</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SwarmManagement;