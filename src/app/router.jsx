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

// Founder Academy
import FounderAcademy from '../pages/FounderAcademy/FounderAcademy';
import StartupFundamentals from '../pages/FounderAcademy/modules/StartupFundamentals';
import FounderThinking from '../pages/FounderAcademy/modules/FounderThinking';
import ProductThinking from '../pages/FounderAcademy/modules/ProductThinking';
import Leadership from '../pages/FounderAcademy/modules/Leadership';
import DecisionSimulator from '../pages/FounderAcademy/modules/DecisionSimulator';
import StartupDatabase from '../pages/FounderAcademy/modules/StartupDatabase';
import FounderProfiles from '../pages/FounderAcademy/modules/FounderProfiles';
import BookLibrary from '../pages/FounderAcademy/modules/BookLibrary';
import AIMentor from '../pages/FounderAcademy/modules/AIMentor';
import DailyMissions from '../pages/FounderAcademy/modules/DailyMissions';
import FounderIQDashboard from '../pages/FounderAcademy/modules/FounderIQDashboard';
import KnowledgeGraph from '../pages/FounderAcademy/modules/KnowledgeGraph';
import MissionDebrief from '../pages/FounderAcademy/modules/MissionDebrief';

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
      {
        path: 'academy',
        element: <FounderAcademy />,
        children: [
          { index: true, element: <StartupFundamentals /> },
          { path: 'fundamentals', element: <StartupFundamentals /> },
          { path: 'thinking', element: <FounderThinking /> },
          { path: 'product', element: <ProductThinking /> },
          { path: 'leadership', element: <Leadership /> },
          { path: 'simulator', element: <DecisionSimulator /> },
          { path: 'startups', element: <StartupDatabase /> },
          { path: 'founders', element: <FounderProfiles /> },
          { path: 'books', element: <BookLibrary /> },
          { path: 'mentor', element: <AIMentor /> },
          { path: 'missions', element: <DailyMissions /> },
          { path: 'iq', element: <FounderIQDashboard /> },
          { path: 'graph', element: <KnowledgeGraph /> },
          { path: 'debrief', element: <MissionDebrief /> },
        ]
      }
    ]
  }
]);
