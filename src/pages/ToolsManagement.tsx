import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ToolOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import PageBreadcrumb from '../components/common/PageBreadcrumb';
import { toolsApi } from '../services/api';

interface Tool {
  id: number;
  name: string;
  description: string;
  category: string | null;
  parameters: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const ToolsManagement: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  const categories = [
    'Information Retrieval',
    'Communication',
    'Computation',
    'Analytics',
    'System',
    'Data Management',
    'Automation',
    'Integration',
  ];

  const breadcrumbItems = [
    { title: 'Home', path: '/' },
    { title: 'Tools Management' },
  ];

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await toolsApi.getTools();
      setTools(response);
    } catch (error) {
      message.error('Failed to fetch tools');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      if (editingTool) {
        await toolsApi.updateTool(editingTool.id, values);
        message.success('Tool updated successfully');
      } else {
        await toolsApi.createTool(values);
        message.success('Tool created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingTool(null);
      fetchTools();
    } catch (error: any) {
      message.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await toolsApi.deleteTool(id);
      message.success('Tool deleted successfully');
      fetchTools();
    } catch (error) {
      message.error('Failed to delete tool');
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
    form.setFieldsValue({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      parameters: JSON.stringify(tool.parameters, null, 2),
    });
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingTool(null);
    form.resetFields();
    setModalVisible(true);
  };

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      'Information Retrieval': 'blue',
      'Communication': 'green',
      'Computation': 'orange',
      'Analytics': 'purple',
      'System': 'red',
      'Data Management': 'cyan',
      'Automation': 'magenta',
      'Integration': 'gold',
    };
    return colors[category || ''] || 'default';
  };

  const columns: ColumnsType<Tool> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toString().toLowerCase()) ||
        record.description.toLowerCase().includes(value.toString().toLowerCase()),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          {description}
        </Tooltip>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map(cat => ({ text: cat, value: cat })),
      filteredValue: selectedCategory ? [selectedCategory] : null,
      onFilter: (value, record) => record.category === value,
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {category || 'Uncategorized'}
        </Tag>
      ),
    },
    {
      title: 'Parameters',
      dataIndex: 'parameters',
      key: 'parameters',
      width: 150,
      render: (params) => {
        const paramCount = Object.keys(params).length;
        return (
          <Tooltip title={JSON.stringify(params, null, 2)}>
            <Tag>{paramCount} parameter{paramCount !== 1 ? 's' : ''}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      sorter: (a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Tool"
            description="Are you sure you want to delete this tool?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categoryStats = categories.map(cat => ({
    category: cat,
    count: tools.filter(t => t.category === cat).length,
  }));

  return (
    <div>
      <PageBreadcrumb items={breadcrumbItems} />
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Tools"
              value={tools.length}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        {categoryStats.slice(0, 3).map((stat, index) => (
          <Col span={6} key={stat.category}>
            <Card>
              <Statistic
                title={stat.category}
                value={stat.count}
                valueStyle={{ color: stat.count > 0 ? '#3f8600' : '#999' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={
          <Space>
            <ToolOutlined />
            <span>Tools Management</span>
          </Space>
        }
        extra={
          <Space>
            <Input.Search
              placeholder="Search tools..."
              allowClear
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              onSearch={setSearchText}
              onChange={(e) => !e.target.value && setSearchText('')}
            />
            <Select
              placeholder="Filter by category"
              allowClear
              style={{ width: 200 }}
              onChange={setSelectedCategory}
              options={categories.map(cat => ({ label: cat, value: cat }))}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchTools}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Tool
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={tools}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tools`,
          }}
        />
      </Card>

      <Modal
        title={editingTool ? 'Edit Tool' : 'Create New Tool'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingTool(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
        >
          <Form.Item
            name="name"
            label="Tool Name"
            rules={[{ required: true, message: 'Please enter tool name' }]}
          >
            <Input placeholder="e.g., Web Search" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Describe what this tool does..."
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
          >
            <Select
              placeholder="Select a category"
              allowClear
              options={categories.map(cat => ({ label: cat, value: cat }))}
            />
          </Form.Item>

          <Form.Item
            name="parameters"
            label="Parameters (JSON)"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch {
                    return Promise.reject('Invalid JSON format');
                  }
                },
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder='{"param1": "string", "param2": "number"}'
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTool ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ToolsManagement;