import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Modal,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Timeline,
  Tabs,
  Badge,
  Tooltip,
  Divider,
  Drawer,
  Input,
  Tree,
  List,
  Avatar,
  Alert,
  Segmented,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  BranchesOutlined,
  LineChartOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  BarChartOutlined,
  HistoryOutlined,
  SwapOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { mockApi } from '../services/mockApi';
import type { AgentDecision } from '../services/mockApi';
import { useStore } from '../store/useStore';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Search } = Input;

const AgentDecisions: React.FC = () => {
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [filteredDecisions, setFilteredDecisions] = useState<AgentDecision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<AgentDecision | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [compareDecisions, setCompareDecisions] = useState<AgentDecision[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'table' | 'tree'>('timeline');
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [refreshInterval, setRefreshInterval] = useState<number>(10000);
  const setLoading = useStore((state) => state.setLoading);
  const addNotification = useStore((state) => state.addNotification);

  useEffect(() => {
    fetchDecisions();
    fetchStats();
    const interval = setInterval(() => {
      fetchDecisions();
      fetchStats();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  useEffect(() => {
    let filtered = [...decisions];
    
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(d => d.agentId === selectedAgent);
    }
    
    if (searchText) {
      filtered = filtered.filter(d => 
        d.decision.toLowerCase().includes(searchText.toLowerCase()) ||
        d.reasoning.toLowerCase().includes(searchText.toLowerCase()) ||
        d.agentId.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(d => {
        const decisionDate = dayjs(d.timestamp);
        return decisionDate.isAfter(dateRange[0]) && decisionDate.isBefore(dateRange[1]);
      });
    }
    
    setFilteredDecisions(filtered);
  }, [decisions, selectedAgent, searchText, dateRange]);

  const fetchDecisions = async () => {
    setLoading('decisions', true);
    try {
      const filters: any = {};
      if (selectedAgent !== 'all') {
        filters.agentId = selectedAgent;
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0].toISOString();
        filters.endDate = dateRange[1].toISOString();
      }
      const data = await mockApi.getAgentDecisions(filters);
      setDecisions(data);
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to fetch decisions' });
    } finally {
      setLoading('decisions', false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await mockApi.getDecisionStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewDetails = (decision: AgentDecision) => {
    setSelectedDecision(decision);
    setDetailDrawerVisible(true);
  };

  const handleCompare = (decision: AgentDecision) => {
    if (compareDecisions.find(d => d.id === decision.id)) {
      setCompareDecisions(prev => prev.filter(d => d.id !== decision.id));
    } else if (compareDecisions.length < 2) {
      setCompareDecisions(prev => [...prev, decision]);
    } else {
      addNotification({ type: 'warning', message: 'You can only compare 2 decisions at a time' });
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'APPROVE':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'REJECT':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'ESCALATE':
        return <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />;
      case 'DEFER':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#52c41a';
    if (confidence >= 0.6) return '#faad14';
    return '#f5222d';
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => (
        <Tooltip title={new Date(timestamp).toLocaleString()}>
          {new Date(timestamp).toLocaleTimeString()}
        </Tooltip>
      ),
      sorter: (a: AgentDecision, b: AgentDecision) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: 'Agent',
      dataIndex: 'agentId',
      key: 'agentId',
      render: (agentId: string) => (
        <Space>
          <Avatar size="small" icon={<RobotOutlined />} />
          <span>{agentId}</span>
        </Space>
      ),
    },
    {
      title: 'Decision',
      dataIndex: 'decision',
      key: 'decision',
      render: (decision: string) => (
        <Space>
          {getDecisionIcon(decision)}
          <Tag color={
            decision === 'APPROVE' ? 'success' :
            decision === 'REJECT' ? 'error' :
            decision === 'ESCALATE' ? 'warning' : 'processing'
          }>
            {decision}
          </Tag>
        </Space>
      ),
      filters: [
        { text: 'Approve', value: 'APPROVE' },
        { text: 'Reject', value: 'REJECT' },
        { text: 'Escalate', value: 'ESCALATE' },
        { text: 'Defer', value: 'DEFER' },
      ],
      onFilter: (value: any, record: AgentDecision) => record.decision === value,
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence: number) => (
        <Progress
          percent={Math.round(confidence * 100)}
          size="small"
          strokeColor={getConfidenceColor(confidence)}
          format={(percent) => `${percent}%`}
        />
      ),
      sorter: (a: AgentDecision, b: AgentDecision) => a.confidence - b.confidence,
    },
    {
      title: 'Reasoning',
      dataIndex: 'reasoning',
      key: 'reasoning',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AgentDecision) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Compare">
            <Button
              type="text"
              icon={<SwapOutlined />}
              onClick={() => handleCompare(record)}
              style={{
                color: compareDecisions.find(d => d.id === record.id) ? '#1890ff' : undefined
              }}
            />
          </Tooltip>
          <Tooltip title="Replay">
            <Button type="text" icon={<PlayCircleOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderTimeline = () => (
    <Timeline mode="left">
      {filteredDecisions.map((decision) => (
        <Timeline.Item
          key={decision.id}
          dot={getDecisionIcon(decision.decision)}
          color={
            decision.decision === 'APPROVE' ? 'green' :
            decision.decision === 'REJECT' ? 'red' :
            decision.decision === 'ESCALATE' ? 'orange' : 'blue'
          }
        >
          <Card
            size="small"
            hoverable
            onClick={() => handleViewDetails(decision)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Space>
                <Avatar size="small" icon={<RobotOutlined />} />
                <strong>{decision.agentId}</strong>
              </Space>
              <span style={{ color: '#999', fontSize: 12 }}>
                {new Date(decision.timestamp).toLocaleString()}
              </span>
            </div>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div>
                <Tag color={
                  decision.decision === 'APPROVE' ? 'success' :
                  decision.decision === 'REJECT' ? 'error' :
                  decision.decision === 'ESCALATE' ? 'warning' : 'processing'
                }>
                  {decision.decision}
                </Tag>
                <Progress
                  percent={Math.round(decision.confidence * 100)}
                  size="small"
                  strokeColor={getConfidenceColor(decision.confidence)}
                  style={{ width: 100, display: 'inline-block', marginLeft: 8 }}
                />
              </div>
              <div style={{ color: '#666', fontSize: 13 }}>{decision.reasoning}</div>
            </Space>
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>
  );

  const renderTreeView = () => {
    const treeData = Object.entries(
      filteredDecisions.reduce((acc, decision) => {
        if (!acc[decision.agentId]) {
          acc[decision.agentId] = [];
        }
        acc[decision.agentId].push(decision);
        return acc;
      }, {} as Record<string, AgentDecision[]>)
    ).map(([agentId, agentDecisions]) => ({
      title: (
        <Space>
          <Avatar size="small" icon={<RobotOutlined />} />
          {agentId} ({agentDecisions.length} decisions)
        </Space>
      ),
      key: agentId,
      children: agentDecisions.map(decision => ({
        title: (
          <Space>
            {getDecisionIcon(decision.decision)}
            <span>{decision.decision}</span>
            <Progress
              percent={Math.round(decision.confidence * 100)}
              size="small"
              strokeColor={getConfidenceColor(decision.confidence)}
              style={{ width: 60 }}
            />
            <span style={{ fontSize: 12, color: '#999' }}>
              {new Date(decision.timestamp).toLocaleTimeString()}
            </span>
          </Space>
        ),
        key: decision.id,
        isLeaf: true,
      })),
    }));

    return (
      <Tree
        treeData={treeData}
        defaultExpandAll
        showLine
        onSelect={(keys) => {
          const decision = decisions.find(d => d.id === keys[0]);
          if (decision) {
            handleViewDetails(decision);
          }
        }}
      />
    );
  };

  return (
    <div>
      <h1>Agent Decisions</h1>
      
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Total Decisions"
                value={stats.total}
                prefix={<ThunderboltOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Approved"
                value={stats.approved}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Rejected"
                value={stats.rejected}
                valueStyle={{ color: '#f5222d' }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Escalated"
                value={stats.escalated}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Deferred"
                value={stats.deferred}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Card>
              <Statistic
                title="Avg Confidence"
                value={Math.round((stats.avgConfidence || 0) * 100)}
                suffix="%"
                valueStyle={{ color: getConfidenceColor(stats.avgConfidence || 0) }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Search
              placeholder="Search decisions..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250 }}
            />
            <Select
              value={selectedAgent}
              onChange={setSelectedAgent}
              style={{ width: 150 }}
              options={[
                { label: 'All Agents', value: 'all' },
                { label: 'Agent-001', value: 'agent-001' },
                { label: 'Agent-002', value: 'agent-002' },
                { label: 'Agent-003', value: 'agent-003' },
                { label: 'Agent-004', value: 'agent-004' },
              ]}
            />
            <RangePicker
              onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
            />
            <Select
              value={refreshInterval}
              onChange={setRefreshInterval}
              style={{ width: 120 }}
              options={[
                { label: '5 seconds', value: 5000 },
                { label: '10 seconds', value: 10000 },
                { label: '30 seconds', value: 30000 },
                { label: '1 minute', value: 60000 },
              ]}
            />
          </Space>
          <Space>
            {compareDecisions.length > 0 && (
              <Badge count={compareDecisions.length}>
                <Button
                  type="primary"
                  icon={<SwapOutlined />}
                  onClick={() => setCompareModalVisible(true)}
                >
                  Compare ({compareDecisions.length})
                </Button>
              </Badge>
            )}
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as any)}
              options={[
                { label: 'Timeline', value: 'timeline', icon: <HistoryOutlined /> },
                { label: 'Table', value: 'table', icon: <BarChartOutlined /> },
                { label: 'Tree', value: 'tree', icon: <BranchesOutlined /> },
              ]}
            />
          </Space>
        </div>

        <Tabs defaultActiveKey="decisions">
          <TabPane tab="Decisions" key="decisions">
            {viewMode === 'timeline' && renderTimeline()}
            {viewMode === 'table' && (
              <Table
                columns={columns}
                dataSource={filteredDecisions}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            )}
            {viewMode === 'tree' && renderTreeView()}
          </TabPane>
          
          <TabPane tab="Analytics" key="analytics">
            {stats && (
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card title="Decision Distribution" size="small">
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p>Chart visualization would be displayed here</p>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Confidence Distribution" size="small">
                    <List
                      dataSource={stats.confidenceDistribution || []}
                      renderItem={(item: any) => (
                        <List.Item>
                          <span>{item.range}</span>
                          <Progress
                            percent={(item.count / 55) * 100}
                            strokeColor="#1890ff"
                            format={() => `${item.count}`}
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col span={24}>
                  <Card title="Agent Performance" size="small">
                    <Table
                      dataSource={Object.entries(stats.agentStats || {}).map(([agentId, data]: [string, any]) => ({
                        agentId,
                        ...data,
                      }))}
                      rowKey="agentId"
                      pagination={false}
                      columns={[
                        {
                          title: 'Agent',
                          dataIndex: 'agentId',
                          key: 'agentId',
                        },
                        {
                          title: 'Total Decisions',
                          dataIndex: 'total',
                          key: 'total',
                        },
                        {
                          title: 'Avg Confidence',
                          dataIndex: 'avgConfidence',
                          key: 'avgConfidence',
                          render: (conf: number) => `${Math.round(conf * 100)}%`,
                        },
                        {
                          title: 'Approved',
                          key: 'approved',
                          render: (record: any) => record.decisions?.APPROVE || 0,
                        },
                        {
                          title: 'Rejected',
                          key: 'rejected',
                          render: (record: any) => record.decisions?.REJECT || 0,
                        },
                        {
                          title: 'Escalated',
                          key: 'escalated',
                          render: (record: any) => record.decisions?.ESCALATE || 0,
                        },
                      ]}
                    />
                  </Card>
                </Col>
              </Row>
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Drawer
        title="Decision Details"
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedDecision && (
          <div>
            <Alert
              message={selectedDecision.decision}
              description={selectedDecision.reasoning}
              type={
                selectedDecision.decision === 'APPROVE' ? 'success' :
                selectedDecision.decision === 'REJECT' ? 'error' :
                selectedDecision.decision === 'ESCALATE' ? 'warning' : 'info'
              }
              showIcon
              icon={getDecisionIcon(selectedDecision.decision)}
              style={{ marginBottom: 16 }}
            />
            
            <Divider>Metadata</Divider>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>Agent ID:</strong> {selectedDecision.agentId}
              </Col>
              <Col span={12}>
                <strong>Timestamp:</strong> {new Date(selectedDecision.timestamp).toLocaleString()}
              </Col>
              <Col span={12}>
                <strong>Confidence:</strong>
                <Progress
                  percent={Math.round(selectedDecision.confidence * 100)}
                  strokeColor={getConfidenceColor(selectedDecision.confidence)}
                />
              </Col>
              <Col span={12}>
                <strong>Decision ID:</strong> {selectedDecision.id}
              </Col>
            </Row>
            
            <Divider>Input Parameters</Divider>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
              {JSON.stringify(selectedDecision.input, null, 2)}
            </pre>
            
            <Divider>Output Results</Divider>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
              {JSON.stringify(selectedDecision.output, null, 2)}
            </pre>
            
            <Divider>Actions</Divider>
            <Space>
              <Button icon={<PlayCircleOutlined />}>Replay Decision</Button>
              <Button icon={<SwapOutlined />} onClick={() => handleCompare(selectedDecision)}>
                Add to Compare
              </Button>
              <Button icon={<LineChartOutlined />}>View Trace</Button>
            </Space>
          </div>
        )}
      </Drawer>

      <Modal
        title="Compare Decisions"
        open={compareModalVisible}
        onCancel={() => setCompareModalVisible(false)}
        width={1000}
        footer={[
          <Button key="clear" onClick={() => setCompareDecisions([])}>
            Clear Selection
          </Button>,
          <Button key="close" onClick={() => setCompareModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {compareDecisions.length === 2 ? (
          <Row gutter={16}>
            {compareDecisions.map((decision, index) => (
              <Col span={12} key={decision.id}>
                <Card title={`Decision ${index + 1}`} size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div><strong>Agent:</strong> {decision.agentId}</div>
                    <div><strong>Time:</strong> {new Date(decision.timestamp).toLocaleString()}</div>
                    <div>
                      <strong>Decision:</strong>
                      <Tag color={
                        decision.decision === 'APPROVE' ? 'success' :
                        decision.decision === 'REJECT' ? 'error' :
                        decision.decision === 'ESCALATE' ? 'warning' : 'processing'
                      } style={{ marginLeft: 8 }}>
                        {decision.decision}
                      </Tag>
                    </div>
                    <div>
                      <strong>Confidence:</strong>
                      <Progress
                        percent={Math.round(decision.confidence * 100)}
                        size="small"
                        strokeColor={getConfidenceColor(decision.confidence)}
                      />
                    </div>
                    <div><strong>Reasoning:</strong> {decision.reasoning}</div>
                    <Divider />
                    <div><strong>Input:</strong></div>
                    <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
                      {JSON.stringify(decision.input, null, 2)}
                    </pre>
                    <div><strong>Output:</strong></div>
                    <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
                      {JSON.stringify(decision.output, null, 2)}
                    </pre>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert
            message="Select 2 decisions to compare"
            description="Click the compare button on any two decisions to see them side by side."
            type="info"
            showIcon
          />
        )}
      </Modal>
    </div>
  );
};

export default AgentDecisions;