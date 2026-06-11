import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserContext } from '@/context/UserContext';
import { loadScript } from '@/utils/loadScript';

export default function BuyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const { user } = useContext(UserContext);

    useEffect(() => {
        async function getProduct() {
            try {
                const response = await api.get(`/products/product/${id}`);
                setProduct(response.data.product);
            } catch(e) {
                console.log("Could not fetch product: " + e);
                toast.error("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        }
        getProduct();
    }, [id]);

    async function handleBuy() {
        // 1. Guardrail check BEFORE running backend or payment overlay processes
        if (user && product.user_id === user.id) {
            toast.error("Transaction Failed", {
                description: "You cannot buy your own product."
            });
            return;
        }

        try {
            setBuying(true);

            // 2. Load the external Razorpay script layout overlay module
            const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!scriptLoaded) {
                toast.error("Payment Gateway Error", {
                    description: "Razorpay SDK failed to load. Please check your network connection."
                });
                return;
            }

            // 3. Request structural order info securely calculated from the Express API
            const orderResponse = await api.post(`/transactions/buy/${id}/create-order`);
            const { order } = orderResponse.data;

            // 4. Configure Razorpay modal configuration criteria options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: order.amount,
                currency: order.currency,
                name: "TechBazaar Marketplace",
                description: `Purchasing ${product.name}`,
                order_id: order.id,
                handler: async function (response) {
                    // Fires instantly when test payment credentials parse successfully
                    try {
                        const verifyRes = await api.post('/transactions/buy/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            productId: id // explicitly parsed to map to the correct row database updates
                        });

                        if (verifyRes.data.success) {
                            toast.success("Purchase successful!", {
                                description: `You have successfully bought ${product.name}.`
                            });
                            navigate(`/product/${id}`);
                        }
                    } catch (err) {
                        console.error(err);
                        toast.error("Verification Failed", {
                            description: "Payment captured but security validation handshake dropped."
                        });
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                },
                theme: {
                    color: "#22c55e", // Matching your Tailwind green-500 accent branding colors
                },
                modal: {
                    ondismiss: function () {
                        toast.info("Payment cancelled", {
                            description: "You closed the payment checkout portal window."
                        });
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch(e) {
            console.error(e);
            const errorMessage = e.response?.data?.error || "Could not complete your purchase. Please try again.";
            toast.error("Transaction Failed", {
                description: errorMessage
            });
        } finally {
            setBuying(false);
        }
    }

    if(loading) return (
        <div className="max-w-lg mx-auto px-6 py-10 animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-48 mb-6"/>
            <div className="rounded-xl border border-zinc-800 overflow-hidden">
                <div className="h-48 bg-zinc-800"/>
                <div className="p-6 flex flex-col gap-3">
                    <div className="h-6 bg-zinc-800 rounded w-3/4"/>
                    <div className="h-4 bg-zinc-800 rounded w-full"/>
                    <div className="h-8 bg-zinc-800 rounded w-1/3"/>
                </div>
            </div>
        </div>
    )

    return (
        <div className="max-w-lg mx-auto px-6 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl font-bold mb-6">Confirm Purchase</h1>
                <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                    <motion.img
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-6 flex flex-col gap-4">
                        <h2 className="text-xl font-semibold">{product.name}</h2>
                        <p className="text-zinc-400 text-sm">{product.description}</p>
                        <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
                            <span className="text-zinc-400 text-sm">Total Amount</span>
                            <span className="text-2xl font-bold text-green-400">₹{product.price}</span>
                        </div>
                        <Button
                            onClick={handleBuy}
                            disabled={buying}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
                        >
                            {buying ? 'Processing Payment...' : 'Confirm & Pay'}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            onClick={() => navigate(`/product/${id}`)}
                            disabled={buying}
                        >
                            Cancel
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}   