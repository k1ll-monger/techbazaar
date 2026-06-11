import api from "@/api"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { motion } from "framer-motion"
import { UserContext } from "@/context/UserContext"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner';

export default function EditProfile() {
    const { user } = useContext(UserContext);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [imageURL, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function getProfile() {
            try {
                const response = await api.get(`/users/user/${user?.id}`)
                const data = response.data.user
                setName(data.name);
                setBio(data.bio || '');
                setImageUrl(data.profile_image_url || '');
            } catch(e) {
                console.log("Could not get the user Information: " + e);
            }
        }
        getProfile()
    }, [])

    async function handleSubmit() {
        try {
            setLoading(true);
            await api.put('/users/edituser', { name, bio, image: imageURL })
            toast.success("Profile updated!", {
                description: "Your profile has been successfully updated."
            });
            navigate(`/user/${user?.id}`);
        } catch(e) {
            toast.error("Action Failed", {
                description: "Could not update the profile. Please try again."
            });
            console.log("Could not update the Profile: " + e)
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-6 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
                <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    {/* Avatar Preview */}
                    <div className="flex items-center gap-4 mb-2">
                        <img
                            src={imageURL || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover border-2 border-green-500/30"
                        />
                        <p className="text-sm text-zinc-400">Profile picture preview</p>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-300">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-zinc-300">Bio</Label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell people about yourself..."
                            className="w-full border border-zinc-700 rounded-md px-3 py-2 text-sm bg-zinc-800 text-white min-h-24"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-zinc-300">Profile Image URL</Label>
                        <Input
                            id="image"
                            value={imageURL}
                            placeholder="https://..."
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}