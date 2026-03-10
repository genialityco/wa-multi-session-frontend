import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layout/DashboardLayout';
import SessionsPage from './pages/SessionsPage';
import MessagesPage from './pages/MessagesPage';
import AccountsPage from './pages/AccountsPage';
import { Notifications } from '@mantine/notifications';

function App() {
  return (
    <>
      <Notifications position="top-right" />
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<SessionsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
        </Routes>
      </DashboardLayout>
    </>
  );
}

export default App;
