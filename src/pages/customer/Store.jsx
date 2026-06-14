import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { COLORS } from '../../utils/constants';
import { FaSearch, FaPills, FaShoppingCart } from 'react-icons/fa';

const Store = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const activeCategory = searchParams.get('category') || '';
    const { addToCart } = useCart();
    const C = COLORS.customerPrimary;

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);
            if (activeCategory) params.append('category', activeCategory);
            params.append('limit', '50');
            const res = await api.get(`/store/products?${params}`);
            setProducts(res.data.data);
        } catch { toast.error('Error loading products'); }
        finally { setLoading(false); }
    }, [keyword, activeCategory]);

    useEffect(() => {
        const t = setTimeout(() => fetchProducts(), 300);
        return () => clearTimeout(t);
    }, [fetchProducts]);

    useEffect(() => {
        api.get('/store/categories').then(r => setCategories(r.data.data)).catch(() => {});
    }, []);

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(`${product.name} added to cart`);
    };

    return (
        <div className="customer-page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Store</h2>
                <div style={{ fontSize: 13, color: '#64748b' }}>{products.length} product(s)</div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                    <FaSearch style={{ position: 'absolute', left: 14, top: 13, color: '#94a3b8' }} />
                    <input placeholder="Search for a medicine or product..." value={keyword} onChange={e => setKeyword(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12,
                            border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box'
                        }} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button onClick={() => setSearchParams({})} style={catBtnStyle(!activeCategory, C)}>All</button>
                    {categories.map(cat => (
                        <button key={cat._id} onClick={() => setSearchParams({ category: cat._id })}
                            style={catBtnStyle(activeCategory === cat._id, C)}>{cat.name}</button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
                    <FaPills size={48} />
                    <p style={{ marginTop: 12 }}>No products found</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                    {products.map(product => (
                        <Link key={product._id} to={`/store/${product._id}`} style={{
                            backgroundColor: 'white', borderRadius: 14, overflow: 'hidden',
                            textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s', display: 'flex', flexDirection: 'column'
                        }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                        >
                            <div style={{
                                height: 180, backgroundColor: '#f1f5f9',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                overflow: 'hidden', position: 'relative'
                            }}>
                                {product.image ? (
                                    <img src={product.image} alt={product.name} style={{
                                        width: '100%', height: '100%', objectFit: 'cover',
                                        transition: 'transform 0.3s'
                                    }}
                                        onError={e => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <FaPills size={48} color="#cbd5e1" />
                                )}
                            </div>
                            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 4, lineHeight: 1.4 }}>{product.name}</div>
                                {product.categoryId?.name && (
                                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{product.categoryId.name}</div>
                                )}
                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 18, fontWeight: 700, color: C }}>
                                        {product.sellingPrice} <span style={{ fontSize: 12 }}>AED</span>
                                    </span>
                                    {product.stockQuantity > 0 ? (
                                        <button onClick={e => handleAddToCart(e, product)} style={{
                                            padding: '8px 14px', backgroundColor: C, color: 'white',
                                            border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                                            fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                                        }}>
                                            <FaShoppingCart size={12} /> Add
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: 11, color: '#dc2626', backgroundColor: '#fef2f2', padding: '4px 10px', borderRadius: 10 }}>
                                            Out of Stock
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

const catBtnStyle = (active, color) => ({
    padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
    backgroundColor: active ? color : 'white', color: active ? 'white' : '#64748b',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
});

export default Store;
