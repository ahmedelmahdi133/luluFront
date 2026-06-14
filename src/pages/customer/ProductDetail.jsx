import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/constants';
import { FaShoppingCart, FaPills, FaArrowLeft, FaFileMedical } from 'react-icons/fa';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const C = COLORS.customerPrimary;

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

    if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading...</div>;
    if (!product) return <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Product not found</div>;

    return (
        <div className="customer-page" style={{ maxWidth: 980 }}>
            <button onClick={() => navigate(-1)} style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'none',
                border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: 20, fontSize: 14
            }}>
                <FaArrowLeft /> Back
            </button>

            <div style={{
                display: 'flex', gap: 30, backgroundColor: 'white', borderRadius: 16,
                overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
                flexWrap: 'wrap'
            }}>
                <div style={{
                    flex: '0 0 400px', backgroundColor: '#f1f5f9',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    minHeight: 350, overflow: 'hidden', position: 'relative'
                }}>
                    {product.image ? (
                        <img src={product.image} alt={product.name} style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            minHeight: 350
                        }}
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                        />
                    ) : (
                        <FaPills size={80} color="#cbd5e1" />
                    )}
                </div>

                <div style={{ flex: 1, padding: 30, minWidth: 280 }}>
                    {product.categoryId?.name && (
                        <span style={{ fontSize: 12, color: C, fontWeight: 600, backgroundColor: `${C}15`, padding: '4px 12px', borderRadius: 20 }}>
                            {product.categoryId.name}
                        </span>
                    )}
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', margin: '12px 0 6px' }}>{product.name}</h1>
                    {product.scientificName && (
                        <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 16px' }}>{product.scientificName}</p>
                    )}

                    {product.description && (
                        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>{product.description}</p>
                    )}

                    <div style={{ fontSize: 32, fontWeight: 800, color: C, marginBottom: 20 }}>
                        {product.sellingPrice} <span style={{ fontSize: 16, fontWeight: 400 }}>AED</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                        <span style={{ fontSize: 12, color: '#0f766e', backgroundColor: '#ccfbf1', padding: '4px 10px', borderRadius: 999 }}>
                            Fast Delivery
                        </span>
                        <span style={{ fontSize: 12, color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '4px 10px', borderRadius: 999 }}>
                            Genuine Product
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
                        <span style={{ fontSize: 14, color: '#475569' }}>Quantity:</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={qtyBtn}>-</button>
                            <span style={{ padding: '8px 16px', fontWeight: 600, minWidth: 30, textAlign: 'center' }}>{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} style={qtyBtn}>+</button>
                        </div>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Available: {product.stockQuantity}</span>
                    </div>

                    {product.requiresPrescription && (
                        <div style={{
                            padding: 12, backgroundColor: '#fef2f2', borderRadius: 8,
                            color: '#dc2626', fontSize: 13, marginBottom: 16,
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <FaFileMedical />
                            This product requires a prescription.
                            {user && (
                                <Link to="/prescriptions" style={{ color: '#dc2626', fontWeight: 600, marginLeft: 4 }}>
                                    Submit one here
                                </Link>
                            )}
                        </div>
                    )}

                    <button onClick={handleAddToCart} disabled={product.stockQuantity === 0} style={{
                        padding: '14px 32px', backgroundColor: product.stockQuantity > 0 ? C : '#94a3b8',
                        color: 'white', border: 'none', borderRadius: 12,
                        cursor: product.stockQuantity > 0 ? 'pointer' : 'not-allowed',
                        fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: product.stockQuantity > 0 ? `0 4px 15px ${C}30` : 'none'
                    }}>
                        <FaShoppingCart /> {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const qtyBtn = {
    padding: '8px 14px', backgroundColor: '#f8fafc', border: 'none',
    cursor: 'pointer', fontSize: 16, fontWeight: 700
};

export default ProductDetail;
