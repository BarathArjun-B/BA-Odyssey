import { createBrowserRouter } from 'react-router-dom';
import AppShell from './AppShell';

import Dashboard from '../pages/Dashboard/Dashboard';
import Journal from '../pages/Journal/Journal';
import Discover from '../pages/Discover/Discover';
import Ideas from '../pages/Ideas/Ideas';
import Matrix from '../pages/Matrix/Matrix';
import Review from '../pages/Review/Review';
import Growth from '../pages/Growth/Growth';
import System from '../pages/System/System';
import Settings from '../pages/Settings/Settings';
import About from '../pages/About/About';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'journal', element: <Journal /> },
      { path: 'discover', element: <Discover /> },
      { path: 'ideas', element: <Ideas /> },
      { path: 'matrix', element: <Matrix /> },
      { path: 'review', element: <Review /> },
      { path: 'growth', element: <Growth /> },
      { path: 'system', element: <System /> },
      { path: 'settings', element: <Settings /> },
      { path: 'about', element: <About /> },
    ]
  }
]);
