import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { 
    ShoppingCart, 
    Eye, 
    Plus, 
    Minus, 
    Trash2, 
    X, 
    CheckCircle, 
    Target,
    ArrowLeft,
    CreditCard,
    Home
} from 'lucide-react';

export default function ProductLanding({ products, success }) {
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showProductDetails, setShowProductDetails] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [customerData, setCustomerData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // Ensure Meta Pixel is loaded and track PageView
        if (window.fbq) {
            window.fbq('track', 'PageView');
            
            // Add debug logging
            console.log('Meta Pixel PageView tracked');
        } else {
            console.warn('Meta Pixel (fbq) not loaded');
        }
        
        // Show success modal if there's a success flash message
        if (success) {
            setShowSuccess(true);
        }
    }, [success]);

    const trackViewContent = (product) => {
        setSelectedProduct(product);
        setShowProductDetails(true);
        
        if (window.fbq) {
            window.fbq('track', 'ViewContent', {
                content_ids: [product.sku],
                content_type: 'product',
                currency: 'MYR',
                value: parseFloat(product.cost_price),
            });
            console.log('Meta Pixel ViewContent tracked:', product.sku, 'Cost:', product.cost_price);
        }
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item => 
                item.id === product.id 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }

        if (window.fbq) {
            window.fbq('track', 'AddToCart', {
                content_ids: [product.sku],
                content_type: 'product',
                currency: 'MYR',
                value: parseFloat(product.cost_price),
            });
            console.log('Meta Pixel AddToCart tracked:', product.sku, 'Cost:', product.cost_price);
        }
        
        setShowCart(true);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity === 0) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item => 
                item.id === productId ? { ...item, quantity } : item
            ));
        }
    };

    const getTotalCost = () => {
        return cart.reduce((total, item) => total + (parseFloat(item.cost_price) * item.quantity), 0);
    };

    const getTotalRetail = () => {
        return cart.reduce((total, item) => total + (parseFloat(item.retail_price) * item.quantity), 0);
    };

    const proceedToCheckout = () => {
        if (cart.length === 0) return;
        
        if (window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
                content_ids: cart.map(item => item.sku),
                content_type: 'product',
                currency: 'MYR',
                value: getTotalCost(),
                num_items: cart.reduce((total, item) => total + item.quantity, 0)
            });
            console.log('Meta Pixel InitiateCheckout tracked. Total cost:', getTotalCost());
        }
        
        setShowCheckout(true);
        setShowCart(false);
    };

    const handlePurchase = (e) => {
        e.preventDefault();
        
        if (window.fbq) {
            const purchaseData = {
                content_ids: cart.map(item => item.sku),
                content_type: 'product',
                currency: 'MYR',
                value: getTotalCost(),
                num_items: cart.reduce((total, item) => total + item.quantity, 0)
            };
            
            window.fbq('track', 'Purchase', purchaseData);
            console.log('Meta Pixel Purchase tracked:', purchaseData);
        }
        
        e.target.submit();
    };

    return (
        <>
            <Head title="Premium Product Packages - Meta Pixel Test" />
            
            {/* Hero Section */}
            <div className="bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-6">Premium Product Packages</h1>
                        <p className="text-xl mb-8">Get the best deals with our exclusive package offers</p>
                    </div>
                </div>
            </div>

            {/* Product Listing */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Choose Your Package</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border">
                            <div className="bg-gray-50 p-6 border-b">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {product.name}
                                </h3>
                                <p className="text-gray-600">{product.description}</p>
                            </div>
                            
                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="text-4xl font-bold text-green-600 mb-2">
                                        RM{product.retail_price}
                                    </div>
                                    <div className="text-sm text-gray-400 mt-1">
                                        SKU: {product.sku} • {product.product_count} products
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <button
                                        onClick={() => trackViewContent(product)}
                                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details (Track ViewContent)
                                    </button>
                                    <button
                                        onClick={() => addToCart(product)}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Add to Cart - RM{product.retail_price}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cart Button */}
                {cart.length > 0 && (
                    <div className="fixed bottom-6 right-6">
                        <button
                            onClick={() => setShowCart(true)}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-red-700 transition-colors font-semibold flex items-center"
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Cart ({cart.reduce((total, item) => total + item.quantity, 0)}) - RM{getTotalRetail().toFixed(2)}
                        </button>
                    </div>
                )}
            </div>

            {/* Cart Modal */}
            {showCart && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {cart.length === 0 ? (
                                <p className="text-center text-gray-500">Your cart is empty</p>
                            ) : (
                                <>
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center py-4 border-b">
                                            <div>
                                                <h4 className="font-semibold">{item.name}</h4>
                                                <p className="text-sm text-gray-500">RM{item.retail_price} each</p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="mt-6 pt-4 border-t">
                                        <div className="flex justify-between text-lg font-semibold mb-6">
                                            <span>Total (Customer Pays):</span>
                                            <span>RM{getTotalRetail().toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <button
                                                onClick={proceedToCheckout}
                                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
                                            >
                                                <CreditCard className="w-4 h-4 mr-2" />
                                                Proceed to Checkout
                                            </button>
                                            <button
                                                onClick={() => setShowCart(false)}
                                                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                                Continue Shopping
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Form Modal */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Checkout</h2>
                                <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        
                        <form onSubmit={handlePurchase} action="/purchase" method="POST" className="p-6">
                            <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                            {cart.map((item) => (
                                <div key={item.id}>
                                    <input type="hidden" name="product_ids[]" value={item.id} />
                                    <input type="hidden" name={`quantities[${item.id}]`} value={item.quantity} />
                                </div>
                            ))}
                            <input type="hidden" name="customer_data[name]" value={customerData.name} />
                            <input type="hidden" name="customer_data[email]" value={customerData.email} />
                            <input type="hidden" name="customer_data[phone]" value={customerData.phone} />
                            <input type="hidden" name="customer_data[address]" value={customerData.address} />
                            <input type="hidden" name="customer_data[city]" value={customerData.city} />
                            <input type="hidden" name="payment_method" value={paymentMethod} />
                            {/* Order Summary */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-semibold mb-3">Order Summary</h3>
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm mb-2">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span>RM{(parseFloat(item.retail_price) * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 mt-2">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total:</span>
                                        <span>RM{getTotalRetail().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-4">Customer Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={customerData.name}
                                        onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                                        className="border rounded-lg px-3 py-2"
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={customerData.email}
                                        onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                                        className="border rounded-lg px-3 py-2"
                                        required
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone"
                                        value={customerData.phone}
                                        onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                                        className="border rounded-lg px-3 py-2"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={customerData.city}
                                        onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                                        className="border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>
                                <div className="mt-4">
                                    <input
                                        type="text"
                                        placeholder="Address"
                                        value={customerData.address}
                                        onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>
                                <div className="mt-4">
                                    <input
                                        type="text"
                                        placeholder="Postal Code"
                                        value={customerData.postal_code}
                                        onChange={(e) => setCustomerData({...customerData, postal_code: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="mb-6">
                                <h3 className="font-semibold mb-4">Payment Method</h3>
                                <div className="space-y-3">
                                    {['Credit Card', 'Bank Transfer', 'E-Wallet (GrabPay/TouchnGo)', 'Cash on Delivery'].map((method) => (
                                        <label key={method} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value={method}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="text-blue-600"
                                                required
                                            />
                                            <span>{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center"
                                >
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    {isProcessing ? 'Processing...' : `Complete Purchase - RM${getTotalRetail().toFixed(2)}`}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCheckout(false)}
                                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Cart
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showProductDetails && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
                            <button
                                onClick={() => setShowProductDetails(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{selectedProduct.name}</h3>
                                <p className="text-gray-600 mt-2">{selectedProduct.description}</p>
                            </div>
                            
                            <div className="border-t pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">SKU</p>
                                        <p className="font-medium">{selectedProduct.sku}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Product Count</p>
                                        <p className="font-medium">{selectedProduct.product_count} products</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Customer Price</p>
                                        <p className="text-2xl font-bold text-green-600">RM{selectedProduct.retail_price}</p>
                                    </div>
                                    <div>
                                    </div>
                                </div>
                            </div>
                            
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => {
                                        addToCart(selectedProduct);
                                        setShowProductDetails(false);
                                    }}
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart - RM{selectedProduct.retail_price}
                                </button>
                                <button
                                    onClick={() => setShowProductDetails(false)}
                                    className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-4">Order Successful!</h2>
                        <p className="text-gray-600 mb-4">
                            Thank you for your purchase! Your order has been confirmed.
                        </p>
                        <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
                            <p className="text-sm text-green-800">
                                <strong>Order Details:</strong><br />
                                Order ID: {success?.order_id || 'N/A'}<br />
                                Total Amount: RM{success?.total_retail_price?.toFixed(2) || '0.00'}<br />
                                Payment Method: {success?.payment_method || 'N/A'}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setShowSuccess(false);
                                setCustomerData({
                                    name: '', email: '', phone: '', address: '', city: '', postal_code: ''
                                });
                                setPaymentMethod('');
                            }}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}