import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import { ToastContainer } from "react-toastify";
import Profile from "./pages/Profile";
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import MyTickets from './pages/MyTickets';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import EventAnalytics from './pages/EventAnalytics';
import CheckIn from './pages/CheckIn';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/login" element={<Login />} />
          <Route  path="/reset-password/:token" element={<ResetPassword />}/>
          <Route path="/register" element={<Register />} />
<Route path="/verify-email" element={<VerifyEmail />} />

          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/create"
            element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/analytics/:eventId"
            element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <EventAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/check-in"
            element={
              <ProtectedRoute roles={['organizer', 'admin']}>
                <CheckIn />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-muted">Page not found</div>} />
        </Routes>
           </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </div>
  );
}
export default App;
