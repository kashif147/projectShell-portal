import React from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import Subscriptions from '../pages/Subscriptions';
import Payments from '../pages/Payments';
import Events from '../pages/Events';
import Communications from '../pages/Communications';
import Queries from '../pages/Queries';
import Voting from '../pages/Voting';
import Resources from '../pages/Resources';
import LandingPage from '../pages/landingPage';

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
        element: <Home />,
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
        path: 'payments',
        element: <Payments />,
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
    ],
  },
];