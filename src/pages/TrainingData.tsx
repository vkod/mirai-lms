import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Upload,
  Space,
  Tag,
  Progress,
  Modal,
  Input,
  Select,
  message,
  Dropdown,
  Tabs,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  CloudUploadOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps, MenuProps } from 'antd';
import { mockApi } from '../services/mockApi';
import type { TrainingData as TrainingDataType } from '../services/mockApi';
import { useStore } from '../store/useStore';
import EmptyState from '../components/common/EmptyState';

const { Dragger } = Upload;
const { TabPane } = Tabs;

const TrainingData: React.FC = () => {
  const [data, setData] = useState<TrainingDataType[]>([]);
  const [filteredData, setFilteredData] = useState<TrainingDataType[]>([]);
  const [selectedData, setSelectedData] = useState<TrainingDataType[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<TrainingDataType | null>(null);
  const setLoading = useStore((state) => state.setLoading);
  const addNotification = useStore((state) => state.addNotification);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...data];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }
    
    if (searchText) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  }, [data, filterType, searchText]);

  const fetchData = async () => {
    setLoading('trainingData', true);
    try {
      const result = await mockApi.getTrainingData();
      setData(result);
      setFilteredData(result);
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to fetch training data' });
    } finally {
      setLoading('trainingData', false);
    }
  };

  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const uploadedData = await mockApi.uploadTrainingData(file as File);
      message.success(`${(file as File).name} uploaded successfully`);
      onSuccess?.(uploadedData);
      fetchData();
    } catch (error) {
      message.error(`${(file as File).name} upload failed`);
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    customRequest: handleUpload,
    showUploadList: false,
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Training Data',
      content: 'Are you sure you want to delete this training data?',
      onOk: async () => {
        setLoading('trainingData', true);
        try {
          // Simulate delete
          setData(prev => prev.filter(item => item.id !== id));
          addNotification({ type: 'success', message: 'Training data deleted successfully' });
        } catch (error) {
          addNotification({ type: 'error', message: 'Failed to delete training data' });
        } finally {
          setLoading('trainingData', false);
        }
      },
    });
  };

  const handlePreview = (record: TrainingDataType) => {
    setPreviewData(record);
    setPreviewVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TrainingDataType) => (
        <Space>
          {record.type === 'dataset' ? <DatabaseOutlined /> : <FileTextOutlined />}
          <a onClick={() => handlePreview(record)}>{text}</a>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const color = type === 'dataset' ? 'blue' : type === 'model' ? 'green' : 'orange';
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => {
        const sizeInMB = (size / 1048576).toFixed(2);
        return `${sizeInMB} MB`;
      },
      sorter: (a: TrainingDataType, b: TrainingDataType) => a.size - b.size,
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => <Tag>{version}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let icon;
        let color;
        switch (status) {
          case 'ready':
            icon = <CheckCircleOutlined />;
            color = 'success';
            break;
          case 'processing':
            icon = <ClockCircleOutlined />;
            color = 'processing';
            break;
          case 'error':
            icon = <ExclamationCircleOutlined />;
            color = 'error';
            break;
          default:
            icon = null;
            color = 'default';
        }
        return <Tag icon={icon} color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Uploaded',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: TrainingDataType, b: TrainingDataType) =>
        new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TrainingDataType) => (
        <Space size="middle">
          <Button type="text" icon={<EyeOutlined />} onClick={() => handlePreview(record)} />
          <Button type="text" icon={<DownloadOutlined />} />
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

  const actionMenu: MenuProps['items'] = [
    { key: 'export', label: 'Export Selected', icon: <DownloadOutlined /> },
    { key: 'delete', label: 'Delete Selected', icon: <DeleteOutlined />, danger: true },
  ];

  const rowSelection = {
    onChange: (_selectedRowKeys: React.Key[], selectedRows: TrainingDataType[]) => {
      setSelectedData(selectedRows);
    },
  };

  const stats = {
    total: data.length,
    datasets: data.filter(d => d.type === 'dataset').length,
    models: data.filter(d => d.type === 'model').length,
    configs: data.filter(d => d.type === 'config').length,
    totalSize: data.reduce((acc, d) => acc + d.size, 0),
  };

  return (
    <div>
      <h1>Training Data Management</h1>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Files"
              value={stats.total}
              prefix={<FolderOpenOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Datasets"
              value={stats.datasets}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Models"
              value={stats.models}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Size"
              value={(stats.totalSize / 1048576).toFixed(2)}
              suffix="MB"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="browse">
          <TabPane tab="Browse" key="browse">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Input
                  placeholder="Search files..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                />
                <Select
                  value={filterType}
                  onChange={setFilterType}
                  style={{ width: 120 }}
                  options={[
                    { label: 'All Types', value: 'all' },
                    { label: 'Datasets', value: 'dataset' },
                    { label: 'Models', value: 'model' },
                    { label: 'Configs', value: 'config' },
                  ]}
                />
              </Space>
              {selectedData.length > 0 && (
                <Dropdown menu={{ items: actionMenu }} placement="bottomRight">
                  <Button icon={<FilterOutlined />}>
                    Actions ({selectedData.length} selected)
                  </Button>
                </Dropdown>
              )}
            </div>
            
            {filteredData.length > 0 ? (
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <EmptyState
                title="No Training Data"
                description="Upload your first training dataset to get started"
                showAction={false}
              />
            )}
          </TabPane>
          
          <TabPane tab="Upload" key="upload">
            <Dragger {...uploadProps} style={{ marginBottom: 24 }}>
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">Click or drag files to upload</p>
              <p className="ant-upload-hint">
                Support for datasets (.csv, .json), models (.pkl, .h5), and config files
              </p>
            </Dragger>
            
            {uploading && (
              <Card title="Upload Progress">
                <Progress percent={30} status="active" />
              </Card>
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Data Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="download" icon={<DownloadOutlined />}>
            Download
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {previewData && (
          <div>
            <p><strong>Name:</strong> {previewData.name}</p>
            <p><strong>Type:</strong> {previewData.type}</p>
            <p><strong>Size:</strong> {(previewData.size / 1048576).toFixed(2)} MB</p>
            <p><strong>Version:</strong> {previewData.version}</p>
            <p><strong>Status:</strong> {previewData.status}</p>
            <p><strong>Uploaded:</strong> {new Date(previewData.uploadedAt).toLocaleString()}</p>
            <Card title="Preview" style={{ marginTop: 16 }}>
              <p>File preview would be displayed here...</p>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TrainingData;