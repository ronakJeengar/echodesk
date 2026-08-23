import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { StudioPage } from './pages/StudioPage';
import { CustomersPage } from './pages/CustomersPage';
import { JobsKanbanPage } from './pages/JobsKanbanPage';
import { AudioUploaderModal } from './components/AudioUploaderModal';
import { ensureAuthenticated } from './lib/api';

export const App: React.FC = () => {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    ensureAuthenticated();
  }, []);

  const handleProcessed = (recordingId: string) => {
    navigate(`/studio?id=${recordingId}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar onOpenUploader={() => setIsUploaderOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Operations Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#070B14]">
          <Routes>
            <Route
              path="/"
              element={<DashboardPage onOpenUploader={() => setIsUploaderOpen(true)} />}
            />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/jobs" element={<JobsKanbanPage />} />
          </Routes>
        </main>
      </div>

      {/* Global Voice Recorder & Audio Ingestion Modal */}
      <AudioUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onProcessed={handleProcessed}
      />
    </div>
  );
};
