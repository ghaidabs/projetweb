import { Routes, Route } from 'react-router';
import { useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import NotificationsPanel from '@/components/NotificationsPanel';
import AuthModal from '@/components/AuthModal';
import ToastNotifications from '@/components/ToastNotifications';
import AlertSubscriptionManager from '@/components/AlertSubscriptionManager';
import DebugPanel from '@/components/DebugPanel';
import Home from '@/pages/Home';
import Reservations from '@/pages/Reservations';
import Trips from '@/pages/Trips';
import Alertes from '@/pages/Alertes';
import Profil from '@/pages/Profil';

function AppShell({ children }: { children: React.ReactNode }) {
  const { notifications, dismissNotification } = useApp();

  // Detect page reloads/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      const logs = JSON.parse(localStorage.getItem('authDebugLogs') || '[]');
      logs.push({ time: new Date().toLocaleTimeString(), msg: '⚠️ [APP] PAGE RELOAD/NAVIGATION DETECTED' });
      localStorage.setItem('authDebugLogs', JSON.stringify(logs.slice(-50)));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="min-h-screen bg-covoit-bg">
      <Navbar />
      <main className="pt-[72px]">{children}</main>
      <NotificationsPanel />
      <AuthModal />
      <AlertSubscriptionManager />
      <ToastNotifications
        notifications={notifications.filter(n => !n.read).slice(0, 4)}
        onDismiss={dismissNotification}
      />
      <DebugPanel />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/alertes" element={<Alertes />} />
          <Route path="/profil" element={<Profil />} />
        </Routes>
      </AppShell>
    </AppProvider>
  );
}
