import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FaPills, FaPumpSoap, FaLeaf, FaArrowRight, FaShoppingBag, FaTruck, FaUserMd, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        api.get('/store/categories').then(r => setCategories(r.data.data)).catch(() => {});
        api.get('/store/products?limit=8').then(r => setFeaturedProducts(r.data.data)).catch(() => {});
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 py-20 px-5 text-center text-white">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Your Trusted Online Pharmacy</h1>
                    <p className="text-lg md:text-xl text-teal-100 mb-8 leading-relaxed max-w-2xl mx-auto">
                        Order medicines, vitamins, and personal care products with safe handling and fast delivery.
                    </p>
                    <Link to="/store" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-teal-600 rounded-xl font-bold text-lg no-underline shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300">
                        <FaShoppingBag /> Browse Products
                    </Link>
                </div>
                <div className="flex justify-center gap-4 mt-10 flex-wrap">
                    {[
                        { icon: FaTruck, label: 'Fast Delivery' },
                        { icon: FaUserMd, label: 'Pharmacist Support' },
                        { icon: FaShieldAlt, label: 'Secure Ordering' }
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-semibold border border-white/20">
                            <item.icon />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {categories.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">Categories</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {categories.map((cat, i) => {
                                const icons = [FaPills, FaPumpSoap, FaLeaf, FaPills, FaPumpSoap, FaLeaf];
                                const colorClasses = [
                                    { bg: 'bg-teal-50', text: 'text-teal-600', border: 'hover:border-teal-500' },
                                    { bg: 'bg-pink-50', text: 'text-pink-600', border: 'hover:border-pink-500' },
                                    { bg: 'bg-green-50', text: 'text-green-600', border: 'hover:border-green-500' },
                                    { bg: 'bg-purple-50', text: 'text-purple-600', border: 'hover:border-purple-500' },
                                    { bg: 'bg-amber-50', text: 'text-amber-600', border: 'hover:border-amber-500' },
                                    { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'hover:border-cyan-500' },
                                ];
                                const Icon = icons[i % icons.length];
                                const theme = colorClasses[i % colorClasses.length];
                                
                                return (
                                    <Link key={cat.id} to={`/store?category=${cat.id}`} className={`p-5 bg-white rounded-2xl no-underline text-center shadow-sm hover:shadow-md transition-all duration-300 border-2 border-transparent hover:-translate-y-1 ${theme.border}`}>
                                        <div className={`w-14 h-14 mx-auto rounded-full ${theme.bg} flex justify-center items-center mb-3`}>
                                            <Icon size={24} className={theme.text} />
                                        </div>
                                        <div className="font-semibold text-slate-800 text-sm">{cat.name}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                <section>
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                        <h2 className="text-2xl font-bold text-slate-800 m-0">Latest Products</h2>
                        <Link to="/store" className="text-teal-600 no-underline text-sm font-semibold flex items-center gap-1.5 hover:text-teal-800 transition-colors">
                            View All <FaArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const ProductCard = ({ product }) => (
    <Link to={`/store/${product.id}`} className="group bg-white rounded-2xl overflow-hidden no-underline shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col hover:-translate-y-1">
        <div className="h-44 bg-slate-50 flex justify-center items-center relative overflow-hidden">
            {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <div className={`w-full h-full absolute inset-0 flex justify-center items-center bg-slate-50 ${product.image ? 'hidden' : ''}`}>
                <FaPills size={48} className="text-slate-300" />
            </div>
        </div>
        <div className="p-4 flex-1 flex flex-col">
            <div className="text-[15px] font-bold text-slate-800 mb-1 leading-snug line-clamp-2">{product.name}</div>
            {product.categoryId?.name && (
                <div className="text-xs text-slate-500 mb-3">{product.categoryId.name}</div>
            )}
            <div className="mt-auto flex justify-between items-center">
                <span className="text-lg font-extrabold text-teal-600">
                    {product.sellingPrice} <span className="text-xs font-semibold text-teal-600/70">EGP</span>
                </span>
                {product.stockQuantity > 0 ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">IN STOCK</span>
                ) : (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">OUT OF STOCK</span>
                )}
            </div>
        </div>
    </Link>
);

export default Home;
