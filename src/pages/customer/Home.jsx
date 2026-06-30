import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FaPills, FaArrowRight, FaShoppingCart, FaStar, FaHeart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const PRIMARY_COLOR = '#1e3a8a';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);

    useEffect(() => {
        api.get('/store/products?limit=6').then(r => setFeaturedProducts(r.data.data)).catch(() => { });
        api.get('/store/products?limit=6&sort=popularity').then(r => setBestSellers(r.data.data)).catch(() => { });
    }, []);

    return (
        <div className="bg-[#F9FAFB]">
            {/* Hero Banner */}
            <div className="relative bg-white overflow-hidden">
                <div className="max-w-[1200px] mx-auto">
                    <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-10 sm:pt-16 lg:pt-20 px-4 sm:px-6 lg:px-8">
                        <main className="mx-auto max-w-7xl">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Your health is our</span>{' '}
                                    <span className="block" style={{ color: PRIMARY_COLOR }}>top priority</span>
                                </h1>
                                <p className="mt-4 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Order your medications, vitamins, and daily essentials online with ease. Fast delivery directly to your doorstep.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <Link to="/store" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white md:py-4 md:text-lg md:px-10 transition-transform hover:scale-105" style={{ backgroundColor: PRIMARY_COLOR }}>
                                            Shop Now
                                        </Link>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link to="/prescriptions" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full md:py-4 md:text-lg md:px-10 transition-colors" style={{ color: PRIMARY_COLOR, backgroundColor: '#eff6ff' }}>
                                            Upload Prescription
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-100 flex items-center justify-center">
                    <div className="w-full h-64 sm:h-72 md:h-96 lg:h-full bg-gradient-to-br from-blue-100 to-blue-50 flex flex-col justify-center items-center text-[#1e3a8a] opacity-80">
                        <FaPills size={120} className="mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold opacity-80">Premium Pharmacy Care</h2>
                    </div>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-16">

                {/* Popular Products Section */}
                <section>
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 m-0">Recommended For You</h2>
                            <p className="text-gray-500 text-sm mt-1">Discover our top-rated products</p>
                        </div>
                        <Link to="/store" className="hidden sm:flex items-center gap-2 font-semibold hover:underline" style={{ color: PRIMARY_COLOR }}>
                            View All <FaArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>

                {/* Promotional Banner */}
                <div className="rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row" style={{ backgroundColor: '#eff6ff' }}>
                    <div className="p-8 md:p-12 flex-1 flex flex-col justify-center">
                        <span className="text-sm font-bold tracking-wider uppercase mb-2" style={{ color: PRIMARY_COLOR }}>Special Offer</span>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Get 20% Off on Vitamins</h3>
                        <p className="text-gray-600 mb-6">Boost your immunity this season with our premium selection of vitamins and supplements.</p>
                        <Link to="/store" className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-medium w-max transition-opacity hover:opacity-90" style={{ backgroundColor: PRIMARY_COLOR }}>
                            Shop Vitamins
                        </Link>
                    </div>
                    <div className="w-full md:w-1/3 bg-blue-200 flex justify-center items-center p-8 min-h-[200px]">
                        <FaStar size={80} className="text-[#1e3a8a] opacity-40" />
                    </div>
                </div>

                {/* Best Sellers Section */}
                <section>
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 m-0">Best Sellers</h2>
                        <Link to="/store" className="hidden sm:flex items-center gap-2 font-semibold hover:underline" style={{ color: PRIMARY_COLOR }}>
                            View All <FaArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {bestSellers.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ ...product, quantity: 1 });
        toast.success('Added to cart');
    };

    // Simulate original price for UI demo if not present
    const hasDiscount = product.id % 3 === 0;
    const originalPrice = hasDiscount ? (product.sellingPrice * 1.2).toFixed(2) : product.sellingPrice;

    return (
        <div className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow relative">
            {/* Badges */}
            {hasDiscount && (
                <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded text-[10px] font-bold text-white" style={{ backgroundColor: PRIMARY_COLOR }}>
                    SAVE 20%
                </div>
            )}
            <button className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white shadow-sm text-gray-400 hover:text-red-500 transition-colors">
                <FaHeart size={14} />
            </button>

            {/* Image */}
            <Link to={`/store/${product.id}`} className="h-40 bg-gray-50 flex justify-center items-center relative overflow-hidden p-4">
                {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
                ) : null}
                <div className={`w-full h-full absolute inset-0 flex justify-center items-center bg-gray-50 ${product.image ? 'hidden' : ''}`}>
                    <FaPills size={32} className="text-gray-300" />
                </div>
            </Link>

            {/* Content */}
            <div className="p-3 flex-1 flex flex-col">
                <Link to={`/store/${product.id}`} className="text-[13px] font-medium text-gray-800 mb-2 leading-snug line-clamp-2 hover:text-[#1e3a8a] transition-colors">
                    {product.name}
                </Link>

                <div className="mt-auto mb-3">
                    {hasDiscount ? (
                        <div className="flex flex-col">
                            <span className="text-[11px] text-gray-400 line-through">{originalPrice} EGP</span>
                            <span className="text-base font-bold" style={{ color: PRIMARY_COLOR }}>{product.sellingPrice} EGP</span>
                        </div>
                    ) : (
                        <span className="text-base font-bold text-gray-900">{product.sellingPrice} EGP</span>
                    )}
                </div>

                <button
                    onClick={handleAddToCart}
                    className="w-full py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border transition-all"
                    style={{
                        borderColor: PRIMARY_COLOR,
                        color: product.stockQuantity > 0 ? PRIMARY_COLOR : 'gray'
                    }}
                    disabled={product.stockQuantity <= 0}
                >
                    <FaShoppingCart size={14} />
                    {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
};

export default Home;
