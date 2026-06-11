import api from "@/api";
import { useEffect, useState, useContext } from "react"
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { UserContext } from "@/context/UserContext";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function UserProfile() {

    const [userInfo, setUserInfo] = useState();
    const [stats, setStats] = useState();
    const [ratings, setRatings] = useState([]);
    const [comments, setComments] = useState([]);
    const [userProducts, setUserProducts] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [loading, setLoading] = useState(true);

    const { id } = useParams();
    const { user } = useContext(UserContext);

    useEffect(() => {
        async function getProfileInformation() {
            try {
                const response1 = await api.get(`/users/user/${id}`);
                setUserInfo(response1.data.user);

                const response2 = await api.get(`/users/user/${id}/stats`);
                setStats(response2.data);

                const response3 = await api.get(`/users/user/${id}/ratings`);
                setRatings(response3.data.ratings);

                const response4 = await api.get(`/users/user/${id}/comments`);
                setComments(response4.data.comments);

                const response5 = await api.get(`/users/user/${id}/products`);
                setUserProducts(response5.data.products);

            } catch(e) {
                console.log("Could Not Fetch Profile Information: " + e)
            } finally {
                setLoading(false);
            }
        }
        getProfileInformation();
    }, [])

    async function handleComment() {
        try {
            await api.post(`/users/user/${id}/comment`, { content: newComment });
            setNewComment('');
            const res = await api.get(`/users/user/${id}/comments`);
            setComments(res.data.comments);
        } catch(e) {
            toast.error("Action Failed", {
            description: "Could not post the comment. Please try again."
            });
        }
    }

    async function handleRating() {
        try {
            await api.post(`/users/user/${id}/rate`, { score: newRating });
            toast.success("Rating submitted!", {
                description: "Your rating has been recorded."
            });
            const res = await api.get(`/users/user/${id}/ratings`);
            setRatings(res.data.ratings);
        } catch(e) {
            toast.error("Action Failed", {
                description: "Could not submit the rating. Please try again."
            });
        }
    }

    if(loading) return (
        <div className="max-w-4xl mx-auto px-6 py-10 animate-pulse">
            <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-zinc-800"/>
                <div className="flex flex-col gap-3">
                    <div className="h-6 bg-zinc-800 rounded w-48"/>
                    <div className="h-4 bg-zinc-800 rounded w-32"/>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[...Array(3)].map((_,i) => <div key={i} className="h-24 bg-zinc-800 rounded-xl"/>)}
            </div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-6 mb-8"
            >
                <img
                    src={userInfo?.profile_image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${userInfo?.name}`}
                    alt={userInfo?.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-green-500/30"
                />
                <div>
                    <h1 className="text-2xl font-bold">{userInfo?.name}</h1>
                    <p className="text-zinc-400 mt-1">{userInfo?.bio || 'No bio yet'}</p>
                    {user && user.id === parseInt(id) && (
                        <a href="/edit-profile">
                            <Button variant="outline" className="mt-2 border-zinc-700">Edit Profile</Button>
                        </a>
                    )}
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-4 mb-8"
            >
                <Card className="p-4 text-center bg-zinc-900 border-zinc-800">
                    <p className="text-2xl font-bold text-green-400">{stats?.totalSold || 0}</p>
                    <p className="text-sm text-zinc-400">Items Sold</p>
                </Card>
                <Card className="p-4 text-center bg-zinc-900 border-zinc-800">
                    <p className="text-2xl font-bold text-green-400">{stats?.totalBought || 0}</p>
                    <p className="text-sm text-zinc-400">Items Bought</p>
                </Card>
                <Card className="p-4 text-center bg-zinc-900 border-zinc-800">
                    <p className="text-2xl font-bold text-green-400">{stats?.rating ? Number(stats.rating).toFixed(1) : 'N/A'}</p>
                    <p className="text-sm text-zinc-400">Average Rating</p>
                </Card>
            </motion.div>

            {/* User's Listings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h2 className="text-xl font-semibold mb-4">Listings</h2>
                {userProducts?.length === 0 ? (
                    <p className="text-zinc-500 mb-8">No listings yet.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {userProducts?.map((product, i) => (
                            <motion.a
                                href={`/product/${product.id}`}
                                key={product.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            >
                                <Card className="overflow-hidden p-0hover:shadow-lg transition-shadow bg-zinc-900 border-zinc-800">
                                    <img src={product.image_url} alt={product.name} className="w-full h-36 object-cover"/>
                                    <CardContent className="p-4">
                                        <h3 className="font-medium">{product.name}</h3>
                                        <p className="font-bold text-green-400 mt-2">₹{product.price}</p>
                                        <span className={`text-xs mt-1 px-2 py-1 rounded-full ${product.status === 'available' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {product.status}
                                        </span>
                                    </CardContent>
                                </Card>
                            </motion.a>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Comments */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                {comments?.length === 0 ? (
                    <p className="text-zinc-500">No reviews yet.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {comments?.map((comment, i) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="p-4 bg-zinc-900 border-zinc-800">
                                    <p className="text-sm text-zinc-200">{comment.content}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{new Date(comment.created_at).toLocaleDateString()}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                {user && user.id !== parseInt(id) && (
                    <>
                        <div className="mt-8">
                            <h3 className="text-lg font-medium mb-2">Rate this User</h3>
                            <div className="flex gap-3 items-center">
                                <select
                                    value={newRating}
                                    onChange={(e) => setNewRating(parseInt(e.target.value))}
                                    className="border border-zinc-700 rounded-md px-3 py-2 text-sm bg-zinc-900 text-white"
                                >
                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                </select>
                                <Button onClick={handleRating} className="bg-green-500 hover:bg-green-600 text-white">Submit Rating</Button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-medium mb-2">Leave a Review</h3>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write your review..."
                                className="w-full border border-zinc-700 rounded-md px-3 py-2 text-sm bg-zinc-900 text-white min-h-24 mb-3"
                            />
                            <Button onClick={handleComment} className="bg-green-500 hover:bg-green-600 text-white">Post Review</Button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    )
}