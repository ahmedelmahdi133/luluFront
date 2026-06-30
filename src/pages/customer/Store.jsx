import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { FaSearch, FaPills, FaShoppingCart } from 'react-icons/fa';

const Store = () => {
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();

    const { addToCart } = useCart();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);

            params.append('limit', '50');
            const res = await api.get(`/store/products?${params}`);
            setProducts(res.data.data);
        } catch { toast.error('Error loading products'); }
        finally { setLoading(false); }
    }, [keyword]);

    useEffect(() => {
        const t = setTimeout(() => fetchProducts(), 300);
        return () => clearTimeout(t);
    }, [fetchProducts]);



    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(`${product.name} added to cart`);
    };

    return (
        <div className="max-w-7xl mx-auto px-5 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight m-0 mb-1">Pharmacy Store</h2>
                    <p className="text-slate-500 font-medium text-sm m-0">Browse our wide selection of medicines and healthcare products.</p>
                </div>
                <div className="text-[13px] font-bold text-teal-700 bg-teal-50 px-4 py-1.5 rounded-full border border-teal-100/50 shadow-sm">
                    {products.length} products available
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 mb-10">
                <div className="relative flex-1 max-w-xl">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        placeholder="Search for a medicine or product..." 
                        value={keyword} 
                        onChange={e => setKeyword(e.target.value)}
                        className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all shadow-sm"
                    />
                </div>

            </div>

            {loading ? (
                <div className="flex justify-center items-center py-32">
                    <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex justify-center items-center mx-auto mb-5">
                        <FaPills size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                    <p className="text-slate-500 text-base">Try adjusting your search query or changing the category filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.map(product => (
                        <Link 
                            key={product.id} 
                            to={`/store/${product.id}`} 
                            className="group bg-white rounded-3xl overflow-hidden no-underline shadow-sm hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 border border-slate-100 flex flex-col hover:-translate-y-1.5"
                        >
                            <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex justify-center items-center relative overflow-hidden p-4">
                                {product.image ? (
                                    <img 
                                        src={product.image} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                                        onError={e => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <FaPills size={32} className="text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col border-t border-slate-50">

                                <div className="text-base font-bold text-slate-800 mb-4 leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">{product.name}</div>
                                
                                <div className="mt-auto flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-semibold text-slate-400 mb-0.5">Price</span>
                                        <span className="text-xl font-black text-slate-900">
                                            {product.sellingPrice} <span className="text-[13px] font-bold text-slate-500">EGP</span>
                                        </span>
                                    </div>
                                    
                                    {product.stockQuantity > 0 ? (
                                        <button 
                                            onClick={e => handleAddToCart(e, product)} 
                                            className="w-10 h-10 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white flex items-center justify-center cursor-pointer transition-all border-none shadow-sm group/btn relative overflow-hidden"
                                            title="Add to Cart"
                                        >
                                            <FaShoppingCart size={15} className="relative z-10 group-active/btn:scale-90 transition-transform" />
                                        </button>
                                    ) : (
                                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100">
                                            OUT OF STOCK
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Store;
