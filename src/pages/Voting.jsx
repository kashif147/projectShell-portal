import React from 'react';
import { Card, List, Progress, Tag } from 'antd';
import Button from '../components/common/Button';

const Voting = () => {
  const dummyVotes = [
    {
      id: 1,
      title: 'Annual Board Election 2024',
      endDate: '2024-03-15',
      status: 'Active',
      participation: 65,
    },
    {
      id: 2,
      title: 'Policy Amendment Proposal',
      endDate: '2024-02-28',
      status: 'Active',
      participation: 45,
    },
    {
      id: 3,
      title: 'Budget Approval 2024',
      endDate: '2024-01-15',
      status: 'Closed',
      participation: 78,
    }
  ];

  return (
    <Card title="Active Votes">
      <List
        dataSource={dummyVotes}
        renderItem={(item) => (
          <List.Item
            actions={[
              item.status === 'Active' ? (
                <Button type="primary" key="vote">Cast Vote</Button>
              ) : (
                <Button key="results">View Results</Button>
              )
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={
                <>
                  <p>End Date: {item.endDate}</p>
                  <Tag color={item.status === 'Active' ? 'green' : 'gray'}>
                    {item.status}
                  </Tag>
                  <div className="mt-2">
                    <Progress percent={item.participation} />
                    <span>Participation Rate</span>
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Voting; 