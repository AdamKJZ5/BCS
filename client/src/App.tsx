import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLeads from './pages/admin/AdminLeads'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/leads" replace />} />
        <Route path="/admin/leads" element={<AdminLeads />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
