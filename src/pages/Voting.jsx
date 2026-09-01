import React from 'react';
import { Card, Progress, Tag } from 'antd';
import {
  FileProtectOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Button from '../components/common/Button';

const Voting = () => {
  const dummyVotes = [
    {
      id: 1,
      title: 'Annual Board Election 2024',
      description: 'Vote for executive committee members and regional council delegates.',
      endDate: '2024-03-15',
      status: 'Active',
      participation: 65,
    },
    {
      id: 2,
      title: 'Policy Amendment Proposal',
      description: 'Review and cast your vote on proposed workplace standard amendments.',
      endDate: '2024-02-28',
      status: 'Active',
      participation: 45,
    },
    {
      id: 3,
      title: 'Budget Approval 2024',
      description: 'Annual member budget ratification and welfare fund allocation.',
      endDate: '2024-01-15',
      status: 'Closed',
      participation: 78,
    },
  ];

  const activeCount = dummyVotes.filter(v => v.status === 'Active').length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.05)] relative overflow-hidden">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-100/50 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 text-lg">
              <FileProtectOutlined />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-poppins">
              Member Voting & Ballots
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Exercise your democratic rights. Vote on policy proposals, leadership elections, and organizational motions.
          </p>
        </div>
      </div>

      {/* Voting Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {dummyVotes.map(item => {
          const isActive = item.status === 'Active';
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_20px_-4px_rgba(15,23,42,0.04)] flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-slate-300">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {isActive ? '● Live Ballot' : 'Closed'}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <CalendarOutlined className="text-slate-400" />
                    {item.endDate}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5 font-poppins">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-600">
                      Participation Rate
                    </span>
                    <span className="font-bold text-blue-600">
                      {item.participation}%
                    </span>
                  </div>
                  <Progress
                    percent={item.participation}
                    showInfo={false}
                    strokeColor={isActive ? '#2563eb' : '#94a3b8'}
                    trailColor="#f1f5f9"
                  />
                </div>

                {isActive ? (
                  <Button
                    type="primary"
                    block
                    size="middle"
                    className="mt-2">
                    <span>Cast Your Vote</span>
                    <ArrowRightOutlined className="text-xs" />
                  </Button>
                ) : (
                  <Button
                    type="default"
                    block
                    size="middle"
                    className="mt-2">
                    View Results
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Voting;