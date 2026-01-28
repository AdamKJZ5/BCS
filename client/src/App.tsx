import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Public Pages
import Home from './pages/public/Home'
import Services from './pages/public/Services'
import Contact from './pages/public/Contact'
import About from './pages/public/About'
import Gallery from './pages/public/Gallery'
import Testimonials from './pages/public/Testimonials'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AdminLeads from './pages/admin/AdminLeads'
import Settings from './pages/admin/Settings'
import GalleryManagement from './pages/admin/GalleryManagement'
import AdminCalendar from './pages/admin/AdminCalendar'
import AdminReviews from './pages/admin/AdminReviews'

// Customer Pages
import Login from './pages/customer/Login'
import Register from './pages/customer/Register'
import CustomerDashboard from './pages/customer/Dashboard'
import CompleteSignup from './pages/customer/CompleteSignup'
import ForgotPassword from './pages/customer/ForgotPassword'
import ResetPassword from './pages/customer/ResetPassword'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/testimonials" element={<Testimonials />} />

        {/* Customer Routes */}
        <Route path="/customer/login" element={<Login />} />
        <Route path="/customer/register" element={<Register />} />
        <Route path="/customer/complete-signup" element={<CompleteSignup />} />
        <Route path="/customer/forgot-password" element={<ForgotPassword />} />
        <Route path="/customer/reset-password" element={<ResetPassword />} />
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/leads" element={<AdminLeads />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/gallery" element={<GalleryManagement />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
