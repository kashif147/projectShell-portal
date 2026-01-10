import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Profile from '../pages/Profile';
import Subscriptions from '../pages/Subscriptions';
import Payments from '../pages/Payments';
import Events from '../pages/Events';
import Communications from '../pages/Communications';
import Queries from '../pages/Queries';
import Voting from '../pages/Voting';
import Resources from '../pages/Resources';
import LandingPage from '../pages/landingPage';
import Application from '../pages/Application';
import ApplicationDetail from '../pages/ApplicationDetail';
import Dashboard from '../pages/Dashboard';
import ApplicationForm from '../pages/ApplicatonForm';
import Membership from '../pages/Membership';
import WorkLocation from '../pages/WorkLocation';
import Notifications from '../pages/Notifications';
import CreditCardPaymentWrapper from '../pages/payments/CreditCardPaymentWrapper';
import StandingBankersOrder from '../pages/payments/StandingBankersOrder';
import DirectDebit from '../pages/payments/DirectDebit';
import SalaryDeduction from '../pages/payments/SalaryDeduction';
import PaymentMethod from '../pages/payments/PaymentMethod';

export const publicRoutes = [
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/landing',
    element: <LandingPage />,
  },
];

export const privateRoutes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'subscriptions',
        element: <Subscriptions />,
      },
      {
        path: 'applicationForm',
        element: <ApplicationForm />,
      },
      {
        path: 'application',
        element: <Application />,
      },
      {
        path: 'application/detail',
        element: <ApplicationDetail />,
      },
      {
        path: 'payments',
        element: <Payments />,
      },
      {
        path: 'payments/method',
        element: <PaymentMethod />,
      },
      {
        path: 'payments/credit-card',
        element: <CreditCardPaymentWrapper />,
      },
      {
        path: 'payments/standing-order',
        element: <StandingBankersOrder />,
      },
      {
        path: 'payments/direct-debit',
        element: <DirectDebit />,
      },
      {
        path: 'payments/salary-deduction',
        element: <SalaryDeduction />,
      },
      {
        path: 'events',
        element: <Events />,
      },
      {
        path: 'communications',
        element: <Communications />,
      },
      {
        path: 'queries',
        element: <Queries />,
      },
      {
        path: 'voting',
        element: <Voting />,
      },
      {
        path: 'resources',
        element: <Resources />,
      },
      {
        path: 'membership',
        element: <Membership />,
      },
      {
        path: 'work-location',
        element: <WorkLocation />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
    ],
  },
];