import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { ChevronDown, ChevronUp, User, Mail, Phone, MapPin } from 'lucide-react';

export default function Dashboard({ orders, stats }) {
    const [expandedOrder, setExpandedOrder] = useState(null);
    
    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };
    const getStatusBadge = (status) => {
        const styles = {
            success: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Head title="Admin Dashboard - Orders" />
            <div className="min-h-screen bg-gray-100 p-3 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders Dashboard</h1>
                        <a
                            href="/"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            View Store
                        </a>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-6">
                        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Orders</h3>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Successful</h3>
                            <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.successful_orders}</p>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Pending</h3>
                            <p className="text-lg sm:text-2xl font-bold text-yellow-600">{stats.pending_orders}</p>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Failed</h3>
                            <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.failed_orders}</p>
                        </div>
                        <div className="bg-white p-3 sm:p-4 rounded-lg shadow col-span-2 md:col-span-1">
                            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Revenue</h3>
                            <p className="text-lg sm:text-2xl font-bold text-green-600">RM{Number(stats.total_revenue).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-4 sm:px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        </div>
                        
                        {/* Mobile View */}
                        <div className="md:hidden">
                            {orders.data.map((order) => (
                                <div key={order.id} className="border-b border-gray-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => toggleOrderDetails(order.id)}
                                                className="mr-2 text-gray-400 hover:text-gray-600"
                                            >
                                                {expandedOrder === order.id ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </button>
                                            <div>
                                                <div className="font-semibold text-sm">{order.order_id}</div>
                                                <div className="text-xs text-gray-500">{formatDate(order.created_at)}</div>
                                            </div>
                                        </div>
                                        {getStatusBadge(order.payment_status)}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <div className="text-gray-500 text-xs uppercase tracking-wide">Customer</div>
                                            <div className="font-medium">{order.customer_data.name}</div>
                                            <div className="text-gray-500 text-xs">{order.customer_data.email}</div>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-xs uppercase tracking-wide">Amount</div>
                                            <div className="font-semibold text-green-600">RM{Number(order.total_retail_price).toFixed(2)}</div>
                                            <div className="text-gray-500 text-xs">{order.payment_method.toUpperCase()}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Mobile Expandable Details */}
                                    {expandedOrder === order.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="grid grid-cols-1 gap-4">
                                                {/* Customer Details */}
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <h4 className="font-semibold text-sm mb-2 flex items-center">
                                                        <User className="w-3 h-3 mr-1" />
                                                        Customer Information
                                                    </h4>
                                                    <div className="space-y-1 text-xs">
                                                        <div className="flex"><span className="text-gray-500 w-16 flex-shrink-0">Name:</span> <span>{order.customer_data.name}</span></div>
                                                        <div className="flex"><span className="text-gray-500 w-16 flex-shrink-0">Email:</span> <span>{order.customer_data.email}</span></div>
                                                        <div className="flex"><span className="text-gray-500 w-16 flex-shrink-0">Phone:</span> <span>{order.customer_data.phone}</span></div>
                                                        {order.customer_data.address && (
                                                            <div className="flex"><span className="text-gray-500 w-16 flex-shrink-0">Address:</span> <span>{order.customer_data.address}{order.customer_data.city && `, ${order.customer_data.city}`}{order.customer_data.postal_code && ` ${order.customer_data.postal_code}`}{(order.customer_data.state || order.state) && `, ${order.customer_data.state || order.state}`}</span></div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Products */}
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <h4 className="font-semibold text-sm mb-2">Products Ordered</h4>
                                                    {order.order_products && order.order_products.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {order.order_products.map((item, index) => (
                                                                <div key={index} className="text-xs border-b border-gray-200 pb-1 last:border-b-0">
                                                                    <div className="font-medium">{item.product.name}</div>
                                                                    <div className="text-gray-500">Qty: {item.quantity} • RM{Number(item.product.retail_price).toFixed(2)} each</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-xs">No product details available</p>
                                                    )}
                                                </div>

                                                {/* Order Summary */}
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <h4 className="font-semibold text-sm mb-2">Order Summary</h4>
                                                    <div className="space-y-1 text-xs">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Total Items:</span>
                                                            <span>{Object.values(order.quantities || {}).reduce((a, b) => a + b, 0)} items</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Amount:</span>
                                                            <span className="font-semibold">RM{Number(order.total_retail_price).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Payment:</span>
                                                            <span>{order.payment_method.toUpperCase()}</span>
                                                        </div>
                                                        {order.paid_at && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Paid At:</span>
                                                                <span>{formatDate(order.paid_at)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Payment Method</th>
                                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.data.map((order) => (
                                        <React.Fragment key={order.id}>
                                            <tr className="hover:bg-gray-50">
                                                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => toggleOrderDetails(order.id)}
                                                            className="mr-2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {expandedOrder === order.id ? (
                                                                <ChevronUp className="w-4 h-4" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <div>
                                                            <div>{order.order_id}</div>
                                                            <div className="text-xs text-gray-500 lg:hidden">{formatDate(order.created_at)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>
                                                        <div className="font-medium">{order.customer_data.name}</div>
                                                        <div className="text-gray-500 text-xs">{order.customer_data.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>
                                                        <div className="font-medium">RM{Number(order.total_retail_price).toFixed(2)}</div>
                                                        <div className="text-xs text-gray-500 lg:hidden">{order.payment_method.toUpperCase()}</div>
                                                    </div>
                                                </td>
                                                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                                                    {order.payment_method.toUpperCase()}
                                                </td>
                                                <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(order.payment_status)}
                                                </td>
                                                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                                                    {formatDate(order.created_at)}
                                                </td>
                                            </tr>
                                            
                                            {/* Expandable Details Row */}
                                            {expandedOrder === order.id && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan="6" className="px-3 lg:px-6 py-4">
                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                                                            {/* Customer Details */}
                                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                                                    <User className="w-4 h-4 mr-2" />
                                                                    Customer Information
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex items-center">
                                                                        <User className="w-3 h-3 mr-2 text-gray-400" />
                                                                        <span className="text-gray-600 w-16">Name:</span>
                                                                        <span className="font-medium">{order.customer_data.name}</span>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <Mail className="w-3 h-3 mr-2 text-gray-400" />
                                                                        <span className="text-gray-600 w-16">Email:</span>
                                                                        <span className="font-medium">{order.customer_data.email}</span>
                                                                    </div>
                                                                    <div className="flex items-center">
                                                                        <Phone className="w-3 h-3 mr-2 text-gray-400" />
                                                                        <span className="text-gray-600 w-16">Phone:</span>
                                                                        <span className="font-medium">{order.customer_data.phone}</span>
                                                                    </div>
                                                                    {order.customer_data.address && (
                                                                        <div className="flex items-start">
                                                                            <MapPin className="w-3 h-3 mr-2 text-gray-400 mt-0.5" />
                                                                            <span className="text-gray-600 w-16">Address:</span>
                                                                            <span className="font-medium">
                                                                                {order.customer_data.address}
                                                                                {order.customer_data.city && `, ${order.customer_data.city}`}
                                                                                {order.customer_data.postal_code && ` ${order.customer_data.postal_code}`}
                                                                                {(order.customer_data.state || order.state) && `, ${order.customer_data.state || order.state}`}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Product Details */}
                                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                                <h4 className="font-semibold text-gray-900 mb-3">Products Ordered</h4>
                                                                {order.order_products && order.order_products.length > 0 ? (
                                                                    <div className="space-y-3">
                                                                        {order.order_products.map((item, index) => (
                                                                            <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                                                                                <div className="flex justify-between items-start">
                                                                                    <div className="flex-1">
                                                                                        <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                                                                                        <p className="text-xs text-gray-500 mt-1">{item.product.description}</p>
                                                                                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                                                                            <span>SKU: {item.product.sku}</span>
                                                                                            <span>{item.product.product_count} products</span>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-right ml-4">
                                                                                        <div className="text-sm font-medium">Qty: {item.quantity}</div>
                                                                                        <div className="text-sm text-green-600">RM{Number(item.product.retail_price).toFixed(2)} each</div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-gray-500 text-sm">No product details available</p>
                                                                )}
                                                            </div>

                                                            {/* Order Details */}
                                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                                <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Total Items:</span>
                                                                        <span className="font-medium">{Object.values(order.quantities || {}).reduce((a, b) => a + b, 0)} items</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Customer Amount:</span>
                                                                        <span className="font-medium">RM{Number(order.total_retail_price).toFixed(2)}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Payment Method:</span>
                                                                        <span className="font-medium">{order.payment_method.toUpperCase()}</span>
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-600">Status:</span>
                                                                        {getStatusBadge(order.payment_status)}
                                                                    </div>
                                                                    {order.toyyibpay_reference_no && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-600">Payment Ref:</span>
                                                                            <span className="font-mono text-xs">{order.toyyibpay_reference_no}</span>
                                                                        </div>
                                                                    )}
                                                                    {order.paid_at && (
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-600">Paid At:</span>
                                                                            <span className="text-xs">{formatDate(order.paid_at)}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {orders.data.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No orders found.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="px-6 py-4 border-t flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    Showing {orders.from} to {orders.to} of {orders.total} results
                                </div>
                                <div className="flex space-x-2">
                                    {orders.prev_page_url && (
                                        <a
                                            href={orders.prev_page_url}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                        >
                                            Previous
                                        </a>
                                    )}
                                    {orders.next_page_url && (
                                        <a
                                            href={orders.next_page_url}
                                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                        >
                                            Next
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}