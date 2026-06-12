import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit() {
        try {
            setLoading(true);
            await api.post('/auth/register', { name, email, password });
            navigate('/login');
        } catch(e) {
            alert('Registration failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md px-4"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl font-bold text-white">Tech<span className="text-green-400">Bazaar</span></h1>
                    <p className="text-zinc-400 mt-2">Create your account</p>
                </motion.div>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">Create Account</CardTitle>
                        <CardDescription className="text-zinc-400">Sign up to get started</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-zinc-300">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-300">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        <Button
                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Register'}
                        </Button>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => window.location.href = 'https://techbazaar-backend-webservice.onrender.com/api/auth/google'}
                        >
                            Continue with Google
                        </Button>
                        <p className="text-center text-sm text-zinc-400">
                            Already have an account? <a href="/login" className="text-green-400 hover:underline">Sign In</a>
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}