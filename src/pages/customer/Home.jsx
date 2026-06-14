import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { COLORS } from '../../utils/constants';
import { FaPills, FaPumpSoap, FaLeaf, FaArrowRight, FaShoppingBag, FaTruck, FaUserMd, FaShieldAlt } from 'react-icons/fa';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        api.get('/store/categories').then(r => setCategories(r.data.data)).catch(() => {});
        api.get('/store/products?limit=8').then(r => setFeaturedProducts(r.data.data)).catch(() => {});
    }, []);

    const C = COLORS.customerPrimary;

    return (
        <div>
            <div style={{
                background: `linear-gradient(135deg, ${C} 0%, ${COLORS.customerPrimaryDark} 100%)`,
                padding: '72px 20px', textAlign: 'center', color: 'white'
            }}>
                <div style={{ maxWidth: 700, margin: '0 auto' }}>
                    <h1 style={{ fontSize: 38, fontWeight: 900, marginBottom: 14 }}>Your Trusted Online Pharmacy</h1>
                    <p style={{ fontSize: 18, opacity: 0.95, marginBottom: 28, lineHeight: 1.6 }}>
                        Order medicines, vitamins, and personal care products with safe handling and fast delivery.
                    </p>
                    <Link to="/store" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '14px 32px', backgroundColor: 'white', color: C,
                        borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                    }}>
                        <FaShoppingBag /> Browse Products
                    </Link>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                    {[
                        { icon: FaTruck, label: 'Fast Delivery' },
                        { icon: FaUserMd, label: 'Pharmacist Support' },
                        { icon: FaShieldAlt, label: 'Secure Ordering' }
                    ].map((item) => (
                        <div key={item.label} style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                            borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.16)', fontSize: 13, fontWeight: 600
                        }}>
                            <item.icon />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="customer-page">
                {categories.length > 0 && (
                    <section style={{ marginBottom: 48 }}>
                        <h2 className="section-title" style={{ marginBottom: 20 }}>Categories</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                            {categories.map((cat, i) => {
                                const icons = [FaPills, FaPumpSoap, FaLeaf, FaPills, FaPumpSoap, FaLeaf];
                                const colors = ['#2563eb', '#db2777', '#16a34a', '#7c3aed', '#f59e0b', '#0891b2'];
                                const Icon = icons[i % icons.length];
                                const clr = colors[i % colors.length];
                                return (
                                    <Link key={cat._id} to={`/store?category=${cat._id}`} style={{
                                        padding: 20, backgroundColor: 'white', borderRadius: 14,
                                        textDecoration: 'none', textAlign: 'center',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s',
                                        border: '2px solid transparent'
                                    }}
                                        onMouseOver={e => { e.currentTarget.style.borderColor = clr; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                        onMouseOut={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; }}
                                    >
                                        <div style={{
                                            width: 56, height: 56, borderRadius: '50%',
                                            backgroundColor: `${clr}15`, display: 'flex',
                                            justifyContent: 'center', alignItems: 'center', margin: '0 auto 10px'
                                        }}>
                                            <Icon size={24} color={clr} />
                                        </div>
                                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{cat.name}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                        <h2 className="section-title" style={{ margin: 0 }}>Latest Products</h2>
                        <Link to="/store" style={{ color: C, textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            View All <FaArrowRight size={12} />
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                        {featuredProducts.map(product => (
                            <ProductCard key={product._id} product={product} color={C} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const ProductCard = ({ product, color }) => (
    <Link to={`/store/${product._id}`} style={{
        backgroundColor: 'white', borderRadius: 14, overflow: 'hidden',
        textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 0.2s', border: '1px solid #e2e8f0'
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
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'flex'); }}
                />
            ) : null}
            <div style={{
                display: product.image ? 'none' : 'flex',
                justifyContent: 'center', alignItems: 'center',
                width: '100%', height: '100%', position: product.image ? 'absolute' : 'relative'
            }}>
                <FaPills size={48} color="#cbd5e1" />
            </div>
        </div>
        <div style={{ padding: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 4, lineHeight: 1.4 }}>{product.name}</div>
            {product.categoryId?.name && (
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{product.categoryId.name}</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color }}>
                    {product.sellingPrice} <span style={{ fontSize: 12 }}>AED</span>
                </span>
                {product.stockQuantity > 0 ? (
                    <span style={{ fontSize: 11, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 8px', borderRadius: 10 }}>In Stock</span>
                ) : (
                    <span style={{ fontSize: 11, color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: 10 }}>Out of Stock</span>
                )}
            </div>
        </div>
    </Link>
);

export default Home;
