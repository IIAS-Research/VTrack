// Main application component
// Handles routing between Dashboard and Instructions pages
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './page/dashboard';
import Instructions from './component/Instructions';
import './App.css';

// App - Main router component managing all application routes
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
