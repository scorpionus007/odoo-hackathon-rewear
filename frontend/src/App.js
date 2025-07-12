import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
// import { ThemeProvider } from './contexts/ThemeContext';

// Components
// import Layout from './components/Layout/Layout';
// import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
// import ForgotPassword from './pages/Auth/ForgotPassword';
// import ResetPassword from './pages/Auth/ResetPassword';
// import Profile from './pages/Profile/Profile';
// import Items from './pages/Items/Items';
// import ItemDetail from './pages/Items/ItemDetail';
// import CreateItem from './pages/Items/CreateItem';
// import Swaps from './pages/Swaps/Swaps';
// import SwapDetail from './pages/Swaps/SwapDetail';
// import Admin from './pages/Admin/Admin';
// import NotFound from './pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          {/* <ThemeProvider> */}
            <AuthProvider>
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  {/* <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="items" element={<Items />} />
                  <Route path="items/:id" element={<ItemDetail />} /> */}

                  {/* Protected Routes */}
                  {/* <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="profile" element={<Profile />} />
                    <Route path="items/create" element={<CreateItem />} />
                    <Route path="swaps" element={<Swaps />} />
                    <Route path="swaps/:id" element={<SwapDetail />} />
                    <Route path="admin" element={<Admin />} />
                  </Route> */}

                  {/* 404 Route */}
                  {/* <Route path="*" element={<NotFound />} /> */}
                </Routes>

                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </AuthProvider>
          {/* </ThemeProvider> */}
        </Router>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App; 