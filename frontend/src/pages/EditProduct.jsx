import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import api from "@/api"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner';

export default function EditProduct() {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function getProduct() {
            try {
                const response = await api.get(`/products/product/${id}`)
                const data = response.data.product
                setName(data.name);
                setDesc(data.description);
                setPrice(data.price);
                setImageUrl(data.image_url);
                setStatus(data.status);

                const tagsRes = await api.get('/products/tags');
                setTags(tagsRes.data.tags);
            } catch(e) {
                console.log("Could not get Product Information: " + e)
            }
        }
        getProduct();
    }, [])

    async function handleSubmit() {
        try {
            setLoading(true);
            await api.put(`/products/editproduct/${id}`, {
                name, description: desc, price, image_url: imageUrl, status
            });

            if(selectedTags.length > 0){
                await api.post(`/products/product/${id}/tags`, { tagIds: selectedTags });
            }

            toast.success("Product updated!", {
                description: "Your product has been successfully updated."
            });
            navigate(`/product/${id}`);
        } catch(e) {
            toast.error("Action Failed", {
                description: "Could not update the product. Please try again."
            });
            console.log("Could Not Update the Product: " + e)
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
                <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
                <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-300">Product Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-300">Description</Label>
                        <textarea
                            id="description"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full border border-zinc-700 rounded-md px-3 py-2 text-sm bg-zinc-800 text-white min-h-24"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-zinc-300">Price (₹)</Label>
                        <Input
                            id="price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-zinc-300">Image URL</Label>
                        <Input
                            id="image"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-zinc-300">Status</Label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full border border-zinc-700 rounded-md px-3 py-2 text-sm bg-zinc-800 text-white"
                        >
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Update Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <motion.button
                                    key={tag.id}
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tag.id)
                                            ? prev.filter(t => t !== tag.id)
                                            : [...prev, tag.id]
                                        )
                                    }}
                                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                        selectedTags.includes(tag.id)
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                                    }`}
                                >
                                    {tag.name}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white"
                    >
                        {loading ? 'Updating...' : 'Update Product'}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}