import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout';
import SessionsPage from './pages/SessionsPage';
import MessagesPage from './pages/MessagesPage';
import { Notifications } from '@mantine/notifications';

function App() {
  return (
    <>
      <Notifications position="top-right" />
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<SessionsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
        </Routes>
      </DashboardLayout>
    </>
  );
}

export default App;
