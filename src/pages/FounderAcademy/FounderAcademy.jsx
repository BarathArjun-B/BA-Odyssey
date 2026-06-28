import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AcademyNav from './AcademyNav';
import { initializeAcademyData } from '../../lib/academyStorage';

export default function FounderAcademy() {
  useEffect(() => {
    initializeAcademyData();
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-[var(--bg-base)]">
      {/* Sidebar Navigation for Academy */}
      <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[var(--border-glass)] bg-[rgba(10,10,10,0.5)] backdrop-blur-md shrink-0 h-auto md:h-full overflow-y-auto">
        <AcademyNav />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative h-full">
        <Outlet />
      </div>
    </div>
  );
}
