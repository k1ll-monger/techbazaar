import {useContext} from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';


export default function Header() {
    const navigate = useNavigate();
    const {user, setUser} = useContext(UserContext);
    
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
        /* Updated header classes for the blurred glass effect */
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
                {user ? (
                    <>
                        <a href={`/user/${user.id}`} className="flex items-center gap-2">
                            <img
                                src={user.profile_image_url || `https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3fc8ce6d-763c-4fd7-82e1-d7ad0121a3f8/dj3zqus-61f1a004-39a7-4ce4-b72c-7ad03715e16c.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiIvZi8zZmM4Y2U2ZC03NjNjLTRmZDctODJlMS1kN2FkMDEyMWEzZjgvZGozenF1cy02MWYxYTAwNC0zOWE3LTRjZTQtYjcyYy03YWQwMzcxNWUxNmMuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.TctEYihfNc12pDXgXOc2OlQ3t3RAKeFXxZ9I3VSdr7c`}
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
                )
                }
            </div>
        </header>
    )
}