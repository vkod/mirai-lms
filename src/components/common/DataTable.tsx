import React, { useState } from 'react';
import { Table, Input, Button } from 'antd';
import type { TableProps } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table/interface';

interface DataTableProps<T> extends TableProps<T> {
  columns: ColumnsType<T>;
  dataSource: T[];
  searchable?: boolean;
  searchKeys?: string[];
  onRefresh?: () => void;
  showRefresh?: boolean;
}

function DataTable<T extends Record<string, any>>({
  columns,
  dataSource,
  searchable = true,
  searchKeys = [],
  onRefresh,
  showRefresh = true,
  ...tableProps
}: DataTableProps<T>) {
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState<T[]>(dataSource);

  React.useEffect(() => {
    if (searchable && searchText) {
      const filtered = dataSource.filter((item) => {
        const searchLower = searchText.toLowerCase();
        if (searchKeys.length > 0) {
          return searchKeys.some((key) => 
            String(item[key]).toLowerCase().includes(searchLower)
          );
        }
        return Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchLower)
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(dataSource);
    }
  }, [searchText, dataSource, searchKeys, searchable]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  return (
    <div>
      {(searchable || showRefresh) && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          {searchable && (
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          )}
          {showRefresh && onRefresh && (
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Refresh
            </Button>
          )}
        </div>
      )}
      <Table<T>
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        {...tableProps}
      />
    </div>
  );
}

export default DataTable;