import React from 'react';
import { Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const PageBreadcrumb: React.FC = () => {
  const location = useLocation();
  
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  
  const breadcrumbNameMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/swarms': 'Swarm Management',
    '/training-data': 'Training Data',
    '/event-triggers': 'Event Triggers',
    '/agent-decisions': 'Agent Decisions',
    '/system-logs': 'System Logs',
  };

  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined />
        </Link>
      ),
    },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return {
        title: <Link to={url}>{breadcrumbNameMap[url]}</Link>,
      };
    }),
  ];

  return (
    <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 16 }} />
  );
};

export default PageBreadcrumb;