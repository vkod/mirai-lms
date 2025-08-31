import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Space, Select, List, Avatar, Badge, Divider } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  RobotOutlined,
  FunnelPlotOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { mockApi } from '../services/mockApi';
import { useStore } from '../store/useStore';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [period, setPeriod] = useState<string>('today');
  const setLoading = useStore((state) => state.setLoading);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading('dashboard', true);
    try {
      const data = await mockApi.getBusinessMetrics(period);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    } finally {
      setLoading('dashboard', false);
    }
  };

  const leadColumns = [
    {
      title: 'Lead Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div>{name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.company}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => {
        let color = '#52c41a';
        if (score < 40) color = '#f5222d';
        else if (score < 70) color = '#faad14';
        
        return (
          <Progress
            type="circle"
            percent={score}
            width={40}
            strokeColor={color}
            format={(percent) => `${percent}`}
          />
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: any = {
          'New': { color: 'blue', icon: <ClockCircleOutlined /> },
          'Contacted': { color: 'cyan', icon: <PhoneOutlined /> },
          'Qualified': { color: 'green', icon: <CheckCircleOutlined /> },
          'Proposal': { color: 'orange', icon: <MailOutlined /> },
          'Won': { color: 'success', icon: <TrophyOutlined /> },
        };
        const config = statusConfig[status] || { color: 'default' };
        return <Tag color={config.color} icon={config.icon}>{status}</Tag>;
      },
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (agent: string) => (
        <Tag color="blue">{agent}</Tag>
      ),
    },
  ];

  const activityColumns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 80,
      render: (time: string) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
      render: (activity: string, record: any) => (
        <div>
          <div>{activity}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.details}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeConfig: any = {
          'lead_created': { color: 'green', text: 'New Lead' },
          'lead_assigned': { color: 'blue', text: 'Assigned' },
          'lead_contacted': { color: 'cyan', text: 'Contacted' },
          'lead_qualified': { color: 'gold', text: 'Qualified' },
          'deal_won': { color: 'success', text: 'Deal Won' },
        };
        const config = typeConfig[type] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
  ];

  if (!metrics) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard</h1>
        <Space>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: 120 }}
            options={[
              { label: 'Today', value: 'today' },
              { label: 'This Week', value: 'week' },
              { label: 'This Month', value: 'month' },
              { label: 'This Quarter', value: 'quarter' },
            ]}
          />
        </Space>
      </div>
      
      {/* Key Metrics Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Agent Swarms"
              value={metrics.activeSwarms || 3}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span style={{ fontSize: 12, color: '#666' }}>
                  / {metrics.totalSwarms || 5} total
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Prospect → Lead"
              value={metrics.prospectToLead || 42.5}
              suffix="%"
              prefix={<SwapOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Lead → Customer"
              value={metrics.leadToCustomer || 18.3}
              suffix="%"
              prefix={<FunnelPlotOutlined />}
              valueStyle={{ color: metrics.leadToCustomer > 15 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Insurance Agents"
              value={metrics.insuranceAgents || 24}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <span style={{ fontSize: 12, color: '#52c41a' }}>
                  {metrics.agentsOnline || 18} online
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Lead Funnel Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New Leads Today"
              value={metrics.newLeadsToday}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  <ArrowUpOutlined /> {metrics.leadGrowth}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Qualified Leads"
              value={metrics.qualifiedLeads}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${metrics.totalLeads}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={metrics.conversionRate}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: metrics.conversionRate > 20 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue Pipeline"
              value={metrics.pipelineValue}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Agent Swarm Performance */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <RobotOutlined />
                Agent Swarm Performance
                <Badge status="processing" text="Real-time" />
              </Space>
            }
            bordered={false}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="dashboard"
                    percent={metrics.swarmEfficiency || 87}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <div style={{ marginTop: 8 }}>Swarm Efficiency</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="dashboard"
                    percent={metrics.automationRate || 73}
                    strokeColor="#52c41a"
                  />
                  <div style={{ marginTop: 8 }}>Automation Rate</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="dashboard"
                    percent={metrics.swarmAccuracy || 92}
                    strokeColor="#1890ff"
                  />
                  <div style={{ marginTop: 8 }}>Decision Accuracy</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Second Row - Performance Metrics */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Response Time</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.avgResponseTime} min</span>
              </div>
              <Progress
                percent={Math.min(100, (30 - metrics.avgResponseTime) * 3.33)}
                showInfo={false}
                strokeColor={metrics.avgResponseTime < 15 ? '#52c41a' : '#faad14'}
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Lead Score Avg</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.avgLeadScore}/100</span>
              </div>
              <Progress
                percent={metrics.avgLeadScore}
                showInfo={false}
                strokeColor={metrics.avgLeadScore > 70 ? '#52c41a' : '#1890ff'}
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Follow-up Rate</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.followUpRate}%</span>
              </div>
              <Progress
                percent={metrics.followUpRate}
                showInfo={false}
                strokeColor={metrics.followUpRate > 80 ? '#52c41a' : '#f5222d'}
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Close Rate</span>
                <span style={{ fontWeight: 'bold' }}>{metrics.closeRate}%</span>
              </div>
              <Progress
                percent={metrics.closeRate}
                showInfo={false}
                strokeColor="#52c41a"
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Main Content Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Hot Leads */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <FireOutlined style={{ color: '#ff4d4f' }} />
                Hot Leads
                <Tag color="red">{metrics.hotLeads?.length || 0} Active</Tag>
              </Space>
            }
            bordered={false}
          >
            <Table
              columns={leadColumns}
              dataSource={metrics.hotLeads}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        {/* Insurance Agent Assignments */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <SafetyCertificateOutlined />
                Insurance Agent Performance
              </Space>
            }
            bordered={false}
          >
            <List
              dataSource={metrics.insuranceAgentStats || []}
              renderItem={(agent: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge 
                        status={agent.status === 'online' ? 'success' : 'default'} 
                        dot
                      >
                        <Avatar 
                          style={{ 
                            backgroundColor: agent.status === 'online' ? '#52c41a' : '#d9d9d9' 
                          }}
                        >
                          {agent.name.charAt(0)}
                        </Avatar>
                      </Badge>
                    }
                    title={
                      <Space>
                        {agent.name}
                        <Tag color={agent.specialty === 'life' ? 'blue' : agent.specialty === 'auto' ? 'green' : 'purple'}>
                          {agent.specialty}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Active: {agent.activeLeads}</span>
                          <span>Closed: {agent.closedDeals}</span>
                        </div>
                        <Progress
                          percent={agent.conversionRate}
                          size="small"
                          strokeColor="#722ed1"
                          format={(percent) => `${percent}% conv.`}
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ textAlign: 'center' }}>
              <Space>
                <Statistic 
                  value={metrics.avgInsuranceConversion || 31.2} 
                  suffix="%" 
                  precision={1}
                  valueStyle={{ fontSize: 16 }}
                />
                <span style={{ color: '#666' }}>Avg Conversion</span>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Activity Feed */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Recent Activity" bordered={false}>
            <Table
              columns={activityColumns}
              dataSource={metrics.recentActivity}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;