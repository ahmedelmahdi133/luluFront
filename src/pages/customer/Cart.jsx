import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaPills, FaArrowRight, FaShieldAlt } from 'react-icons/fa';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4" dir="rtl">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-10 text-center">
                    <div className="w-24 h-24 bg-teal-50 rounded-full flex justify-center items-center mx-auto mb-6">
                        <FaShoppingBag size={40} className="text-teal-500" />
                    </div>
                    <h2 className="text-slate-800 text-2xl font-black mb-2">سلة المشتريات فارغة</h2>
                    <p className="text-slate-500 mb-8 font-medium">يبدو أنك لم تقم بإضافة أي منتجات إلى السلة بعد.</p>
                    <Link to="/store" className="flex items-center justify-center gap-2 w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl no-underline font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        العودة للتسوق <FaArrowRight size={14} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-8 pb-20" dir="rtl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 m-0 mb-1">سلة المشتريات</h2>
                        <p className="text-slate-500 font-medium m-0">لديك {cartItems.length} منتجات في السلة</p>
                    </div>
                    <button 
                        onClick={clearCart} 
                        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-red-50 text-red-500 border border-slate-200 hover:border-red-100 rounded-xl cursor-pointer text-sm font-bold transition-all shadow-sm"
                    >
                        <FaTrash size={12} /> تفريغ السلة
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Cart Items */}
                    <div className="flex-1 w-full flex flex-col gap-4">
                        {cartItems.map(item => (
                            <div key={item.id} className="group flex flex-col sm:flex-row gap-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 items-center transition-all hover:shadow-md hover:border-teal-100">
                                {/* Image */}
                                <div className="w-24 h-24 rounded-xl bg-slate-50 flex justify-center items-center shrink-0 overflow-hidden relative border border-slate-100">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <FaPills size={28} className="text-slate-300" />
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0 text-center sm:text-right w-full sm:w-auto">
                                    <div className="font-bold text-slate-800 text-[17px] mb-1.5 line-clamp-2">{item.name}</div>
                                    <div className="text-teal-600 font-black text-lg">{item.sellingPrice} <span className="text-sm font-semibold text-teal-600/70">ج.م</span></div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 mt-4 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                                    
                                    {/* Quantity */}
                                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0" dir="ltr">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                                            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-red-50 hover:text-red-500 border-none cursor-pointer text-slate-600 transition-colors"
                                        >
                                            {item.quantity === 1 ? <FaTrash size={12} /> : <FaMinus size={12} />}
                                        </button>
                                        <span className="w-12 text-center font-bold text-[15px] bg-slate-50">
                                            {item.quantity}
                                        </span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                                            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-teal-50 hover:text-teal-600 border-none cursor-pointer text-slate-600 transition-colors"
                                        >
                                            <FaPlus size={12} />
                                        </button>
                                    </div>

                                    {/* Total Price & Delete */}
                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="font-black text-slate-800 text-xl min-w-[5rem] text-left hidden sm:block">
                                            {(item.sellingPrice * item.quantity).toFixed(2)}
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.id)} 
                                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl cursor-pointer transition-all shadow-sm"
                                            title="حذف المنتج"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-[360px] shrink-0">
                        <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 lg:sticky lg:top-24">
                            <h3 className="m-0 mb-6 text-xl font-black text-slate-800 border-b border-slate-100 pb-4">ملخص الطلب</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-[15px] font-medium text-slate-500">
                                    <span>عدد المنتجات المختلفة</span>
                                    <span className="text-slate-800 font-bold bg-slate-50 px-3 py-1 rounded-lg">{cartItems.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-[15px] font-medium text-slate-500">
                                    <span>إجمالي الكمية</span>
                                    <span className="text-slate-800 font-bold bg-slate-50 px-3 py-1 rounded-lg">{cartItems.reduce((s, i) => s + i.quantity, 0)}</span>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                                <div className="flex justify-between items-end text-xl font-black text-slate-800">
                                    <span className="text-base text-slate-500 font-bold">الإجمالي الكلي</span>
                                    <span className="text-2xl text-teal-600">{cartTotal.toFixed(2)} <span className="text-sm">ج.م</span></span>
                                </div>
                            </div>

                            {user ? (
                                <button 
                                    onClick={() => navigate('/checkout')} 
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-teal-600 hover:bg-teal-700 text-white border-none rounded-2xl cursor-pointer text-[17px] font-bold shadow-md hover:shadow-xl hover:shadow-teal-600/20 transition-all hover:-translate-y-0.5"
                                >
                                    متابعة الدفع
                                </button>
                            ) : (
                                <div className="text-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-400">
                                        <FaShieldAlt size={20} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 mb-4">يرجى تسجيل الدخول لإتمام طلبك بأمان</p>
                                    <Link 
                                        to="/login" 
                                        className="block py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl no-underline text-base font-bold transition-all shadow-md"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
