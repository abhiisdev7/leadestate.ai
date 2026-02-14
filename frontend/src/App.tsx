import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from "./components/ui/tooltip";

// layouts
import RootLayout from "./layouts/root-layout";

// pages
import DashboardPage from './views/dashboard-page';
import ContactsPage from './views/contacts-page';
import CampaignsPage from './views/campaigns-page';
import ConversationPage from './views/conversation-page';
import AppointmentsPage from './views/appointments-page';
import InsightsPage from './views/insights-page';

export function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
            <Route path="conversation" element={<ConversationPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
