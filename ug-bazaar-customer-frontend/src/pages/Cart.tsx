import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart, useUpdateCartItem, useClearCart, usePlaceOrder } from '../api/orderQueries';
import { apiClient } from '../api/apiClient';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getProductThumbnail } from '@ugbazaar/shared';
import { 
  ShoppingBag, Trash2, Tag, Percent, Truck, 
  MapPin, Check, ChevronRight, CreditCard, User, Sparkles,
  Minus, Plus
} from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const { data: cartData, isLoading: cartLoading } = useCart();
  const { mutate: updateCartItem } = useUpdateCartItem();
  const { mutate: clearCart } = useClearCart();
  const { mutate: placeOrder, isPending: isBooking } = usePlaceOrder();

  const cart = cartData?.cart;
  const items = cart?.items || [];

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Checkout State
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('cod');
  
  // Address State
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile || '');
  const [addressLine, setAddressLine] = useState('');
  const [village, setVillage] = useState(user?.village || '');
  const [taluka, setTaluka] = useState('Talodhi');
  const [pincode, setPincode] = useState('441224');

  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0) || 0;
  
  // Calculate delivery charge (free above 500, otherwise 40)
  const deliveryCharge = deliveryType === 'pickup' ? 0 : (subtotal >= 500 ? 0 : 40);
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

  const handleQtyChange = (productId: string, currentQty: number, change: number) => {
    updateCartItem({ productId, qty: currentQty + change });
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);
    setCouponApplied(null);
    setDiscountAmount(0);

    try {
      const res = await apiClient('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: couponCode, orderTotal: subtotal })
      });
      if (res.success) {
        setCouponApplied(couponCode.toUpperCase());
        setDiscountAmount(res.discount || 0);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setDiscountAmount(0);
    setCouponCode('');
    setCouponError(null);
  };

  // Payment + Checkout logic
  const handleCheckoutSubmit = async () => {
    if (!fullName || !mobileNumber) {
      alert('Please fill in Name and Mobile Number');
      return;
    }

    if (deliveryType === 'delivery' && !addressLine) {
      alert('Please fill in your Delivery Address');
      return;
    }

    const orderData = {
      items: items.map((i: any) => ({ product: i.product?._id || i.product, name: i.name, price: i.price, qty: i.qty })),
      type: deliveryType,
      couponCode: couponApplied || undefined,
      paymentMethod,
      deliveryAddress: {
        name: fullName,
        mobile: mobileNumber,
        line: addressLine || 'Store Pickup',
        village,
        taluka,
        district: 'Chandrapur',
        pincode
      }
    };

    if (paymentMethod === 'cod') {
      placeOrder(orderData, {
        onSuccess: (res: any) => {
          navigate(`/order-detail?id=${res.order?._id}`);
        },
        onError: (err: any) => {
          alert(`Checkout failed: ${err.message}`);
        }
      });
    } else {
      // Trigger Razorpay Integration
      try {
        const createRes = await apiClient('/payment/create-order', {
          method: 'POST',
          body: JSON.stringify({ amount: grandTotal, orderId: `TEMP_${Date.now()}` })
        });
        
        if (!(window as any).Razorpay) {
          // Dynamic script injection fallback
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }

        const options = {
          key: createRes.key,
          amount: createRes.amount,
          currency: 'INR',
          name: 'UG Bazaar',
          description: 'E-commerce Checkout Payment',
          order_id: createRes.orderId,
          prefill: {
            name: fullName,
            contact: mobileNumber
          },
          theme: {
            color: '#0c831f'
          },
          handler: async (response: any) => {
            // Verify payment
            try {
              // Now book the actual order database entry with paid status
              const finalOrderData = {
                ...orderData,
                paymentStatus: 'paid',
                paymentDetails: response
              };
              
              placeOrder(finalOrderData, {
                onSuccess: (res: any) => {
                  apiClient('/payment/verify', {
                    method: 'POST',
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      orderId: res.order?._id
                    })
                  }).then(() => {
                    navigate(`/order-detail?id=${res.order?._id}`);
                  });
                }
              });
            } catch (err: any) {
              alert('Payment Verification failed.');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();

      } catch (err: any) {
        alert(`Razorpay error: ${err.message}`);
      }
    }
  };

  if (cartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white rounded-3xl skeleton-pulse"></div>
          <div className="h-64 bg-white rounded-3xl skeleton-pulse"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="bg-brand-light p-5 rounded-full inline-block text-brand-muted">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="font-extrabold text-xl text-brand-dark mt-6">Aapka Cart Khali Hai</h2>
        <p className="text-sm text-brand-muted font-semibold mt-1 max-w-xs mx-auto">
          Essentials add karein aur Swiggy Instamart jaisi delivery ka anubhav karein!
        </p>
        <Link to="/" className="btn-primary mt-8 inline-flex">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-24">
      <h1 className="font-extrabold text-2xl text-brand-dark mb-8 flex items-center gap-2">
        <span>Checkout Basket</span>
        <span className="text-xs font-bold bg-brand-green/10 text-brand-green border border-brand-green/20 px-3 py-1 rounded-full">
          {items.length} Items Selected
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Cart Items & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step Headers */}
          <div className="flex border-b border-brand-border/60">
            <button 
              onClick={() => setActiveStep(1)}
              className={`flex-1 text-center pb-4 font-extrabold text-sm border-b-2 transition-all ${
                activeStep === 1 ? 'border-brand-green text-brand-green' : 'border-transparent text-brand-muted'
              }`}
            >
              1. Review Items
            </button>
            <button 
              onClick={() => {
                if (!isAuthenticated) navigate('/auth');
                else setActiveStep(2);
              }}
              className={`flex-1 text-center pb-4 font-extrabold text-sm border-b-2 transition-all ${
                activeStep === 2 ? 'border-brand-green text-brand-green' : 'border-transparent text-brand-muted'
              }`}
            >
              2. Delivery & Payment
            </button>
          </div>

          {activeStep === 1 ? (
            <div className="bg-white border border-brand-border/60 rounded-3xl p-6 shadow-sm space-y-4">
              
              {/* Item lists */}
              <div className="divide-y divide-brand-light">
                {items.map((item: any) => (
                  <div key={item.product?._id || item.product} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl bg-brand-light p-2.5 rounded-xl border select-none w-14 h-14 flex items-center justify-center overflow-hidden">
                        {getProductThumbnail(item.product?.images) ? (
                          <img src={getProductThumbnail(item.product?.images)} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          '📦'
                        )}
                      </span>
                      <div>
                        <h4 className="font-extrabold text-sm text-brand-dark leading-snug">{item.name}</h4>
                        <span className="text-xs text-brand-muted font-bold">₹{item.price} / unit</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Qty controls */}
                      <div className="flex items-center bg-brand-green text-white rounded-xl overflow-hidden font-extrabold text-xs shadow-md">
                        <button 
                          onClick={() => handleQtyChange(item.product?._id || item.product, item.qty, -1)}
                          className="px-2.5 py-2 hover:bg-brand-green/90"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 min-w-[18px] text-center">{item.qty}</span>
                        <button 
                          onClick={() => handleQtyChange(item.product?._id || item.product, item.qty, 1)}
                          className="px-2.5 py-2 hover:bg-brand-green/90"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-extrabold text-sm text-brand-dark w-16 text-right">
                        ₹{item.price * item.qty}
                      </span>
                    </div>

                  </div>
                ))}
              </div>

              <div className="border-t border-brand-light pt-4 flex justify-between">
                <button 
                  onClick={() => clearCart()}
                  className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Items</span>
                </button>
                <button 
                  onClick={() => {
                    if (!isAuthenticated) navigate('/auth');
                    else setActiveStep(2);
                  }}
                  className="btn-primary py-2 px-5 text-xs font-bold"
                >
                  <span>Set Address & Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          ) : (
            // STEP 2: Address & Payment Panel
            <div className="space-y-6">
              
              {/* Delivery Type */}
              <div className="bg-white border border-brand-border/60 rounded-3xl p-6 shadow-sm space-y-4">
                <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Choose Delivery Type</span>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDeliveryType('delivery')}
                    className={`border p-4 rounded-2xl font-extrabold text-sm flex flex-col items-center justify-center gap-2 transition-all ${
                      deliveryType === 'delivery' ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-white border-brand-border text-brand-dark hover:bg-brand-light'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span>Home Delivery</span>
                  </button>
                  <button
                    onClick={() => setDeliveryType('pickup')}
                    className={`border p-4 rounded-2xl font-extrabold text-sm flex flex-col items-center justify-center gap-2 transition-all ${
                      deliveryType === 'pickup' ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-white border-brand-border text-brand-dark hover:bg-brand-light'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                    <span>Store Pickup</span>
                  </button>
                </div>
              </div>

              {/* Delivery Address Form */}
              <div className="bg-white border border-brand-border/60 rounded-3xl p-6 shadow-sm space-y-4">
                <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Recipient details</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Uday ji"
                      className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-sm outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-muted uppercase">Mobile Number</label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="10-digit number"
                      className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-sm outline-none font-medium"
                    />
                  </div>
                </div>

                {deliveryType === 'delivery' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-muted uppercase">Address Line (Gully/House Number)</label>
                      <input
                        type="text"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="Opp. CDCC Bank, Bhangaram Road"
                        className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-sm outline-none font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-brand-muted uppercase">Village</label>
                        <input
                          type="text"
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          placeholder="Talodhi"
                          className="w-full bg-brand-light border rounded-xl px-3 py-2.5 text-sm outline-none font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-brand-muted uppercase">Taluka</label>
                        <input
                          type="text"
                          value={taluka}
                          onChange={(e) => setTaluka(e.target.value)}
                          placeholder="Gondpipri"
                          className="w-full bg-brand-light border rounded-xl px-3 py-2.5 text-sm outline-none font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-brand-muted uppercase">Pincode</label>
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          placeholder="441224"
                          className="w-full bg-brand-light border rounded-xl px-3 py-2.5 text-sm outline-none font-medium"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Payment Methods */}
              <div className="bg-white border border-brand-border/60 rounded-3xl p-6 shadow-sm space-y-4">
                <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Choose Payment Option</span>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`border p-4 rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'cod' ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-white border-brand-border text-brand-dark hover:bg-brand-light'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Cash / UPI on Del</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`border p-4 rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'upi' ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-white border-brand-border text-brand-dark hover:bg-brand-light'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Razorpay UPI</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`border p-4 rounded-2xl font-extrabold text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'card' ? 'bg-brand-green/10 text-brand-green border-brand-green/30' : 'bg-white border-brand-border text-brand-dark hover:bg-brand-light'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Razorpay CARD</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Invoice Details */}
        <div className="space-y-6">
          
          {/* Coupon Code validator */}
          <div className="bg-white border border-brand-border/60 rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Coupons & Promo Codes</span>
            
            {couponApplied ? (
              <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-brand-green" />
                  <span className="font-extrabold text-brand-green text-sm">{couponApplied} Applied!</span>
                </div>
                <button 
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter Coupon (e.g. BAZAAR100)"
                  className="flex-1 bg-brand-light border rounded-xl px-3.5 py-2.5 text-xs outline-none uppercase font-bold"
                />
                <button 
                  type="submit" 
                  disabled={couponLoading}
                  className="bg-brand-green text-white font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-opacity-90 transition-all flex-shrink-0 cursor-pointer"
                >
                  {couponLoading ? '...' : 'APPLY'}
                </button>
              </form>
            )}

            {couponError && (
              <p className="text-xs text-red-500 font-bold text-center mt-1">{couponError}</p>
            )}
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-white border border-brand-border/60 rounded-3xl p-6 shadow-sm space-y-4">
            <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Billing Summary</span>
            
            <div className="space-y-3 font-semibold text-sm text-brand-muted">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-brand-dark font-extrabold">₹{subtotal}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-brand-green">
                  <span>Coupon Discounts</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-brand-dark font-extrabold">
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
            </div>

            <div className="border-t border-brand-light pt-4 flex justify-between items-baseline">
              <span className="font-extrabold text-sm text-brand-dark">Grand Total</span>
              <span className="font-black text-2xl text-brand-green">₹{grandTotal}</span>
            </div>

            {/* Main CTA button */}
            {activeStep === 1 ? (
              <button
                onClick={() => {
                  if (!isAuthenticated) navigate('/auth');
                  else setActiveStep(2);
                }}
                className="btn-primary w-full py-3.5 text-sm font-extrabold mt-4"
              >
                <span>Continue to Checkout</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleCheckoutSubmit}
                disabled={isBooking}
                className="btn-primary w-full py-3.5 text-sm font-extrabold mt-4"
              >
                <span>{isBooking ? 'Placing Order...' : 'Place Order'}</span>
              </button>
            )}

            {deliveryType === 'delivery' && subtotal < 500 && (
              <p className="text-[10px] text-brand-muted text-center font-semibold mt-2">
                Add ₹{500 - subtotal} more items to unlock <span className="text-brand-green font-bold">FREE Delivery</span>!
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
