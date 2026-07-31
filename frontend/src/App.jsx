import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AddProduct from './pages/AddProduct';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyPage from './pages/BuyPage';
import EditProduct from './pages/EditProduct';
import EditProfile from './pages/EditProfile';
import Search from './pages/Search';
import { UserProvider } from './context/UserContext';
import Layout from './Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "@/components/ui/sonner";

const BACKEND_URL = 'https://techbazaar-backend-webservice.onrender.com';

function ServerBanner() {
    const [isWarmingUp, setIsWarmingUp] = useState(false);
    const [isServerReady, setIsServerReady] = useState(false);

    useEffect(() => {
        let timer;

        // If the server doesn't respond within 1.5 seconds, assume it's waking up
        timer = setTimeout(() => {
            setIsWarmingUp(true);
        }, 1500);

        fetch(`${BACKEND_URL}/health`)
            .then((res) => {
                if (res.ok) {
                    clearTimeout(timer);
                    setIsWarmingUp(false);
                    setIsServerReady(true);
                }
            })
            .catch((err) => {
                console.error("Server health check error:", err);
            });

        return () => clearTimeout(timer);
    }, []);

    if (!isWarmingUp || isServerReady) return null;

    return (
        <div className="bg-amber-500/90 backdrop-blur-sm text-amber-95 px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2.5 border-b border-amber-600/30 transition-all duration-300">
            <svg className="animate-spin h-4 w-4 text-white shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>
                <strong className="font-semibold text-white">Server is waking up:</strong> Render's free tier sleeps after inactivity. This may take ~20 seconds...
            </span>
        </div>
    );
}

function App() {
    return (
        <>
            <Toaster richColors theme="dark" />
            <UserProvider>
                <ServerBanner />
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/product/:id" element={<ProductPage />} />
                            <Route path="/user/:id" element={<UserProfile />} />
                            <Route path="/search" element={<Search />} />

                            <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
                            <Route path="/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
                            <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                            <Route path="/buy/:id" element={<ProtectedRoute><BuyPage /></ProtectedRoute>} />
                        </Route>

                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </BrowserRouter>
            </UserProvider>
        </>
    );
}

export default App;