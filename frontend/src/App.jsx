import {BrowserRouter,Routes, Route} from 'react-router-dom';
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
import { Toaster } from "@/components/ui/sonner"


function App() {
    return(
        <>
        <Toaster richColors theme="dark" />
        <UserProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout/>}>
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
    )
}

export default App;