import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FaShoppingCart, FaPills, FaArrowLeft, FaFileMedical } from 'react-icons/fa';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        api.get(`/store/products/${id}`)
            .then(r => setProduct(r.data.data))
            .catch(() => toast.error('Product not found'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        for (let i = 0; i < quantity; i++) addToCart(product);
        toast.success(`${product.name} added to cart`);
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
    );
    if (!product) return <div className="text-center py-20 text-slate-500 font-bold text-lg">Product not found</div>;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-1.5 bg-transparent border-none text-slate-500 cursor-pointer mb-5 text-sm font-semibold hover:text-slate-800 transition-colors"
            >
                <FaArrowLeft /> Back
            </button>

            <div className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 mb-8">
                <div className="md:w-[400px] w-full bg-slate-50 flex justify-center items-center min-h-[350px] relative">
                    {product.image ? (
                        <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover min-h-[350px]" 
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                    ) : (
                        <FaPills size={80} className="text-slate-300" />
                    )}
                </div>

                <div className="flex-1 p-8">

                    <h1 className="text-3xl font-extrabold text-slate-800 m-0 mb-1 leading-tight">{product.name}</h1>
                    {product.scientificName && (
                        <p className="text-sm font-medium text-slate-500 m-0 mb-4">{product.scientificName}</p>
                    )}

                    {product.description && (
                        <p className="text-[15px] text-slate-600 leading-relaxed mb-6">{product.description}</p>
                    )}

                    <div className="text-4xl font-black text-teal-600 mb-6">
                        {product.sellingPrice} <span className="text-lg font-semibold text-teal-600/70">EGP</span>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-6">
                        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                            Fast Delivery
                        </span>
                        <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">
                            Genuine Product
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-sm font-bold text-slate-600">Quantity:</span>
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                            <button 
                                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border-none cursor-pointer text-slate-600 font-bold text-lg transition-colors"
                            >-</button>
                            <span className="px-4 font-bold text-base min-w-[3rem] text-center">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} 
                                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border-none cursor-pointer text-slate-600 font-bold text-lg transition-colors"
                            >+</button>
                        </div>
                        <span className="text-xs font-medium text-slate-400">Available: {product.stockQuantity}</span>
                    </div>

                    {product.requiresPrescription && (
                        <div className="p-4 bg-red-50 rounded-xl text-red-600 text-sm font-medium mb-6 flex items-center gap-2 border border-red-100">
                            <FaFileMedical className="shrink-0" />
                            <span>This product requires a prescription.</span>
                            {user && (
                                <Link to="/prescriptions" className="text-red-700 font-bold ml-1 hover:underline">
                                    Submit one here
                                </Link>
                            )}
                        </div>
                    )}

                    <button 
                        onClick={handleAddToCart} 
                        disabled={product.stockQuantity === 0} 
                        className={`w-full md:w-auto px-8 py-3.5 rounded-xl text-base font-bold flex justify-center items-center gap-2 border-none transition-all ${product.stockQuantity > 0 ? 'bg-teal-600 text-white cursor-pointer shadow-md hover:bg-teal-700 hover:shadow-lg hover:-translate-y-0.5' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                        <FaShoppingCart /> {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
