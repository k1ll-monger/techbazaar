import {useContext} from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';


export default function Header() {
    const navigate = useNavigate();
    const {user, setUser, loading} = useContext(UserContext);
    
    async function handleLogout() {
        try{
            await api.post('/auth/logout');
            setUser(null);
            navigate('/login');
        }catch(err){
            alert("Could Not Log Out!")
            console.error("Logout error:", err);
        }
    }

    return (
        <header className="border-b px-6 py-3 flex items-center justify-between sticky top-0 bg-background/2 backdrop-blur-sm z-50">
            <a href="/" className="font-semibold text-lg">TechBazaar</a>
            
            <input
                type="text"
                placeholder="Search products..."
                className="border rounded-md px-3 py-1.5 text-sm w-64 bg-background/50 backdrop-blur-sm"
                onKeyDown={(e) => {
                    if(e.key === 'Enter') navigate(`/search?q=${e.target.value}`)
                }}
            />

            <div className="flex items-center gap-3">
                {loading ? (
                    <div className="flex items-center gap-2 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-zinc-700"/>
                        <div className="w-20 h-4 rounded bg-zinc-700"/>
                    </div>
                ) : user ? (
                    <>
                        <a href={`/user/${user.id}`} className="flex items-center gap-2">
                            <img
                                src={user.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-sm">{user.name}</span>
                        </a>
                        <button onClick={handleLogout} className="text-sm">Logout</button>
                    </>
                ) : (
                    <>
                        <a href="/login" className="text-sm">Login</a>
                        <a href="/register" className="text-sm">Register</a>
                    </>
                )}
            </div>
        </header>
    )
}