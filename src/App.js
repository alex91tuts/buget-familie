import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Incomes from './components/Incomes';
import MonthlyExpenses from './components/MonthlyExpenses';
import Settings from './components/Settings';
import Categories from './components/Categories';
import AccountsManager from './components/AccountsManager';
import BottomNav from './components/BottomNav';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App relative min-h-screen bg-white dark:bg-gray-900">
        <Routes>
          <Route 
            path="/" 
            element={!session ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={session ? <Dashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/incomes" 
            element={session ? <Incomes /> : <Navigate to="/" />} 
          />
          <Route 
            path="/expenses" 
            element={session ? <MonthlyExpenses /> : <Navigate to="/" />} 
          />
          <Route 
            path="/settings" 
            element={session ? <Settings /> : <Navigate to="/" />} 
          />
          <Route 
            path="/categories" 
            element={session ? <Categories /> : <Navigate to="/" />} 
          />
          <Route 
            path="/accounts" 
            element={session ? (
              <div className="container mx-auto px-4 py-8 mb-20">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Accounts</h1>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <AccountsManager />
                </div>
              </div>
            ) : <Navigate to="/" />} 
          />
        </Routes>
        {session && <BottomNav />}
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
