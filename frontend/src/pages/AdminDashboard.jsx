import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/api';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminDashboard() {
    const [topSellers, setTopSellers] = useState([]);
    const [topBuyers, setTopBuyers] = useState([]);
    const [popularTags, setPopularTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const sellers = await api.get('/admin/topsellers');
                setTopSellers(sellers.data.topSellers);

                const buyers = await api.get('/admin/topbuyers');
                setTopBuyers(buyers.data.topBuyers);

                const tags = await api.get('/admin/populartags');
                setPopularTags(tags.data.popularTags);
            } catch(e) {
                console.log("Could not fetch admin data: " + e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    if(loading) return (
        <div className="max-w-screen-xl mx-auto px-6 py-10 animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-48 mb-8"/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        <div className="h-6 bg-zinc-800 rounded w-32 mb-2"/>
                        {[...Array(5)].map((_, j) => (
                            <div key={j} className="h-16 bg-zinc-800 rounded-xl"/>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <div className="max-w-screen-xl mx-auto px-6 py-10">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold mb-8"
            >
                Admin Dashboard
            </motion.h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Top Sellers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-lg font-semibold mb-4 text-green-400">Top Sellers</h2>
                    <div className="flex flex-col gap-3">
                        {topSellers.length === 0 ? (
                            <p className="text-zinc-500 text-sm">No data yet.</p>
                        ) : topSellers.map((seller, i) => (
                            <motion.div
                                key={seller.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="bg-zinc-900 border-zinc-800">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="text-green-400 font-bold text-lg">#{i+1}</span>
                                            <div>
                                                <p className="font-medium">{seller.name}</p>
                                                <p className="text-xs text-zinc-400">{seller.total_sales} sales</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Buyers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-lg font-semibold mb-4 text-green-400">Top Buyers</h2>
                    <div className="flex flex-col gap-3">
                        {topBuyers.length === 0 ? (
                            <p className="text-zinc-500 text-sm">No data yet.</p>
                        ) : topBuyers.map((buyer, i) => (
                            <motion.div
                                key={buyer.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="bg-zinc-900 border-zinc-800">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="text-green-400 font-bold text-lg">#{i+1}</span>
                                            <div>
                                                <p className="font-medium">{buyer.name}</p>
                                                <p className="text-xs text-zinc-400">{buyer.total_buys} purchases</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Popular Tags */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-lg font-semibold mb-4 text-green-400">Popular Tags</h2>
                    <div className="flex flex-col gap-3">
                        {popularTags.length === 0 ? (
                            <p className="text-zinc-500 text-sm">No data yet.</p>
                        ) : popularTags.map((tag, i) => (
                            <motion.div
                                key={tag.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Card className="bg-zinc-900 border-zinc-800">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span className="text-green-400 font-bold text-lg">#{i+1}</span>
                                            <div>
                                                <p className="font-medium">{tag.name}</p>
                                                <p className="text-xs text-zinc-400">{tag.total_sales} sales</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}