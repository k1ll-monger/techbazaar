import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getProducts() {
            try {
                const response = await api.get('/products/allproducts');
                setProducts(response.data.products);
            } catch(e) {
                console.log("Could not fetch the products from api");
            } finally {
                setLoading(false);
            }
        }
        getProducts();
    }, [])

    return (
        <div className="max-w-screen-xl mx-auto px-6 py-8">
            {/* Banner */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl px-10 py-14 mb-12 text-center relative overflow-hidden border border-zinc-800 bg-mist-950"
            >
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <span className="text-green-400 text-sm font-medium tracking-widest uppercase mb-4 block">The Tech Marketplace</span>
                        <h1 className="text-4xl font-bold mb-4 text-white">
                            Buy & Sell <span className="text-green-400">Tech</span>
                        </h1>
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-zinc-400 mb-8 text-lg max-w-lg mx-auto"
                    >
                        Find the best deals on tech products from trusted sellers.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="flex gap-3 justify-center"
                    >
                        <a href="/search">
                            <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-5 text-base">Browse Products</Button>
                        </a>
                        <a href="/add-product">
                            <Button variant="outline" className="border-zinc-600 text-white hover:bg-zinc-800 px-8 py-5 text-base">Start Selling</Button>
                        </a>
                    </motion.div>
                </div>
            </motion.div>

            {/* Products Grid */}
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-semibold mb-6"
            >
                Latest Listings
            </motion.h2>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-zinc-800 overflow-hidden animate-pulse">
                            <div className="h-36 bg-zinc-800"/>
                            <div className="p-4 flex flex-col gap-3">
                                <div className="h-4 bg-zinc-800 rounded w-3/4"/>
                                <div className="h-3 bg-zinc-800 rounded w-full"/>
                                <div className="h-3 bg-zinc-800 rounded w-1/2"/>
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <p className="text-zinc-500">No products listed yet.</p>
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
                            <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-zinc-900 border-zinc-800 h-full p-0">
                                <div className="overflow-hidden h-36">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-36 object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold text-base">{product.name}</h3>
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