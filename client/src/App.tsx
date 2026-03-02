import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  }}>
    <div style={{
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #0047AB',
        borderTop: '4px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 1rem'
      }} />
      <p style={{ color: '#666', fontSize: '1.1rem' }}>Loading...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
)

// Public Pages - Eagerly loaded (always needed)
import Home from './pages/public/Home'

// Lazy-loaded Public Pages
const Services = lazy(() => import('./pages/public/Services'))
const Contact = lazy(() => import('./pages/public/Contact'))
const About = lazy(() => import('./pages/public/About'))
const Gallery = lazy(() => import('./pages/public/Gallery'))
const Testimonials = lazy(() => import('./pages/public/Testimonials'))

// Lazy-loaded Admin Pages (loaded only when accessing admin)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'))
const Settings = lazy(() => import('./pages/admin/Settings'))
const GalleryManagement = lazy(() => import('./pages/admin/GalleryManagement'))
const AdminCalendar = lazy(() => import('./pages/admin/AdminCalendar'))
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'))

// Lazy-loaded Customer Pages (loaded only when accessing customer area)
const Login = lazy(() => import('./pages/customer/Login'))
const Register = lazy(() => import('./pages/customer/Register'))
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'))
const CompleteSignup = lazy(() => import('./pages/customer/CompleteSignup'))
const ForgotPassword = lazy(() => import('./pages/customer/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/customer/ResetPassword'))

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
