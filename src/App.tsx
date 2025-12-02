import { BrowserRouter, Routes, Route } from 'react-router';
import CreateSignupPage from './pages/CreateSignupPage';
import ViewSignupPage from './pages/ViewSignupPage';
import EditSignupPage from './pages/EditSignupPage';
import EditClaimPage from './pages/EditClaimPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateSignupPage />} />
        <Route path="/sheet/:sheetId" element={<ViewSignupPage />} />
        <Route
          path="/sheet/:sheetId/edit/:managementToken"
          element={<EditSignupPage />}
        />
        <Route path="/claim/:claimToken" element={<EditClaimPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
