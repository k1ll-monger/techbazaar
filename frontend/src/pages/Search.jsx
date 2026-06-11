import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Search() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const q = searchParams.get('q');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true);
                const response = await api.get('/products/productsByFilter', {
                    params: {
                        q: q,
                        minPrice: minPriceParam,
                        maxPrice: maxPriceParam
                    }
                });
                setProducts(response.data.products);
            } catch(e) {
                console.log("Could not fetch products: " + e);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [q, minPriceParam, maxPriceParam])

    function handleFilter() {
        if(minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice)) {
            alert("Min price cannot be greater than max price!");
            return;
        }
        navigate(`/search?q=${q || ''}&minPrice=${minPrice}&maxPrice=${maxPrice}`);
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mb-6"
            >
                {q ? `Results for "${q}"` : 'Browse Products'}
            </motion.h1>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-4 mb-8 p-4 bg-zinc-900 border border-zinc-800 rounded-xl"
            >
                <Input
                    placeholder="Min Price"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-36 bg-zinc-800 border-zinc-700"
                />
                <Input
                    placeholder="Max Price"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-36 bg-zinc-800 border-zinc-700"
                />
                <Button onClick={handleFilter} className="bg-green-500 hover:bg-green-600 text-white">Apply Filters</Button>
                {(minPriceParam || maxPriceParam) && (
                    <Button variant="outline" className="border-zinc-700" onClick={() => navigate(`/search?q=${q || ''}`)}>
                        Clear Filters
                    </Button>
                )}
            </motion.div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-zinc-800 overflow-hidden animate-pulse">
                            <div className="h-48 bg-zinc-800"/>
                            <div className="p-4 flex flex-col gap-3">
                                <div className="h-4 bg-zinc-800 rounded w-3/4"/>
                                <div className="h-3 bg-zinc-800 rounded w-full"/>
                                <div className="h-3 bg-zinc-800 rounded w-1/2"/>
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-zinc-500 text-center py-20"
                >
                    No products found.
                </motion.p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.map((product, i) => (
                        <motion.a
                            href={`/product/${product.id}`}
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        >
                            <Card className="overflow-hidden p-0 hover:shadow-lg transition-shadow bg-zinc-900 border-zinc-800 h-full">
                                <div className="overflow-hidden h-36">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{product.description}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <p className="font-bold text-green-400 text-lg">₹{product.price}</p>
                                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full">Available</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.a>
                    ))}
                </div>
            )}
        </div>
    )
}