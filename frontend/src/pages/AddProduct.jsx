import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/api';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AddProduct() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchTags() {
            try {
                const response = await api.get('/products/tags');
                setTags(response.data.tags);
            } catch(e) {
                console.log("Could not fetch tags");
            }
        }
        fetchTags();
    }, [])

    async function handleSubmit() {
        try {
            setLoading(true);
            const response = await api.post('/products/addproduct', {
                name, description, price, image_url: imageUrl
            });
            const productId = response.data.product.id;

            if(selectedTags.length > 0){
                await api.post(`/products/product/${productId}/tags`, { tagIds: selectedTags });
            }

            navigate(`/product/${productId}`);
        } catch(err) {
            console.error("Error adding product:", err);
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
                <h1 className="text-2xl font-bold mb-6">List a Product</h1>
                <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-zinc-300">Product Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. MacBook Pro M2"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-300">Description</Label>
                        <textarea
                            id="description"
                            placeholder="Describe your product..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-zinc-700 rounded-md px-3 py-2 text-sm bg-zinc-800 text-white min-h-24"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price" className="text-zinc-300">Price (₹)</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="e.g. 50000"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-zinc-300">Image URL</Label>
                        <Input
                            id="image"
                            placeholder="https://..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Tags</Label>
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
                        {loading ? 'Listing...' : 'List Product'}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}