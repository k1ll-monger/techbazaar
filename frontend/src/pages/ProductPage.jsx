import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserContext } from '@/context/UserContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { toast } from 'sonner';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({});
    const [ratings, setRatings] = useState([]);
    const [comments, setComments] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(UserContext);

    useEffect(() => {
        async function fetchData() {
            try {
                const productRes = await api.get(`/products/product/${id}`);
                setProduct(productRes.data.product);

                const ratingsRes = await api.get(`/products/product/${id}/ratings`);
                setRatings(ratingsRes.data.ratings);

                const commentRes = await api.get(`/products/product/${id}/comments`);
                setComments(commentRes.data.comments);

                const relatedRes = await api.get(`/products/product/${id}/related`);
                setRelatedProducts(relatedRes.data.products);
            } catch(e) {
                console.log("Could not get product information");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    async function handleComment() {
        try {
            await api.post(`/products/product/${id}/comment`, { content: newComment });
            toast.success("Comment posted!", {
                description: "Your comment has been added to the product page."
            });
            setNewComment('');
            const res = await api.get(`/products/product/${id}/comments`);
            setComments(res.data.comments);
        } catch(e) {
            toast.error("Action Failed", {
                description: "Could not post the comment. Please try again."
            });
        }
    }

    async function handleRating() {
        try {
            await api.post(`/products/product/${id}/rate`, { score: newRating });
            toast.success("Rating submitted!", {
                description: "Your rating has been recorded."
            });
            const res = await api.get(`/products/product/${id}/ratings`);
            setRatings(res.data.ratings);
        } catch(e) {
            toast.error("Action Failed", {
                description: "Could not submit the rating. Please try again."
            });
        }
    }

    async function handleDelete() {
        try {
            // Adjust base prefix matching your router context if necessary (e.g., /products/deleteproduct/:id)
            await api.delete(`/products/deleteproduct/${id}`);
            alert("Product successfully deleted!");
            navigate('/'); // Redirects to home page or marketplace catalog
        } catch(e) {
            console.error(e);
            alert("Could not delete product. Please try again.");
        }
    }

    if(loading) return (
        <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="h-80 bg-zinc-800 rounded-xl"/>
                <div className="flex flex-col gap-4">
                    <div className="h-8 bg-zinc-800 rounded w-3/4"/>
                    <div className="h-4 bg-zinc-800 rounded w-full"/>
                    <div className="h-4 bg-zinc-800 rounded w-1/2"/>
                </div>
            </div>
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-10"
            >
                {/* Product Image */}
                <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src={product.image_url}
                    alt={product.name}
                    className="w-full rounded-xl object-cover h-80"
                />

                {/* Product Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col gap-4"
                >
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <a href={`/user/${product.user_id}`} className="text-sm text-green-400 hover:underline">View Seller Profile</a>
                    <p className="text-zinc-400">{product.description}</p>
                    <p className="text-3xl font-bold text-green-400">₹{product.price}</p>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.status === 'available' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {product.status}
                        </span>
                        <span className="text-sm text-zinc-400">
                            ⭐ {ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1) : 'No ratings yet'}
                        </span>
                    </div>

                    {product.status === 'available' && (
                        <a href={`/buy/${product.id}`}>
                            <Button className="w-full bg-green-500 hover:bg-green-600 text-white">Buy Now</Button>
                        </a>
                    )}

                    {user && user.id === product.user_id && (
                        <div className="flex flex-col gap-2 w-full">
                            <a href={`/edit-product/${product.id}`} className="w-full">
                                <Button variant="outline" className="w-full">Edit Product</Button>
                            </a>
                            
                            {/* ShadCN Dialog safeguarding deletions */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full">Delete Product</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-400">
                                            This action cannot be undone. This will permanently delete your product listing
                                            "{product.name}" from the database marketplace.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                                            Delete Permanently
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                             </AlertDialog>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Comments */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12"
            >
                <h2 className="text-xl font-semibold mb-4">Comments</h2>
                {comments.length === 0 ? (
                    <p className="text-zinc-500">No comments yet.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {comments.map((comment, i) => (
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

                {user && (
                    <>
                        <div className="mt-8">
                            <h3 className="text-lg font-medium mb-2">Rate this Product</h3>
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
                            <h3 className="text-lg font-medium mb-2">Leave a Comment</h3>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write your comment..."
                                className="w-full border border-zinc-700 rounded-md px-3 py-2 text-sm bg-zinc-900 text-white min-h-24 mb-3"
                            />
                            <Button onClick={handleComment} className="bg-green-500 hover:bg-green-600 text-white">Post Comment</Button>
                        </div>
                    </>
                )}
            </motion.div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12"
                >
                    <h2 className="text-xl font-semibold mb-4">Related Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((product, i) => (
                            <motion.a
                                href={`/product/${product.id}`}
                                key={product.id}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-zinc-900 border-zinc-800">
                                    <img src={product.image_url} alt={product.name} className="w-full h-36 object-cover"/>
                                    <div className="p-3">
                                        <h3 className="font-medium text-sm">{product.name}</h3>
                                        <p className="font-bold text-green-400 text-sm mt-1">₹{product.price}</p>
                                    </div>
                                </Card>
                            </motion.a>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    )
}