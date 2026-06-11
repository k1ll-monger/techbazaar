import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';

export default function Footer() {
    const { user } = useContext(UserContext);

    return (
        <footer className="border-t px-6 py-8 mt-12">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6">
                <div>
                    <h3 className="font-semibold text-lg">TechBazaar</h3>
                    <p className="text-sm text-muted-foreground mt-1">Buy and sell tech products easily.</p>
                </div>
                <div className="flex gap-12">
                    <div className="flex flex-col gap-2">
                        <p className="font-medium text-sm">Navigation</p>
                        <a href="/" className="text-sm text-muted-foreground">Home</a>
                        <a href="/search" className="text-sm text-muted-foreground">Browse</a>
                        <a href="/add-product" className="text-sm text-muted-foreground">Sell</a>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="font-medium text-sm">Account</p>
                        {user ? (
                            <>
                                <a href={`/user/${user.id}`} className="text-sm text-muted-foreground">Profile</a>
                                <a href="/edit-profile" className="text-sm text-muted-foreground">Edit Profile</a>
                            </>
                        ) : (
                            <>
                                <a href="/login" className="text-sm text-muted-foreground">Login</a>
                                <a href="/register" className="text-sm text-muted-foreground">Register</a>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
                © 2026 TechBazaar. All rights reserved.
            </div>
        </footer>
    )
}