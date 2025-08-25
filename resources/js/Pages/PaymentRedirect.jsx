import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { CreditCard, Loader } from 'lucide-react';

export default function PaymentRedirect({ billUrl, orderData }) {
    const [countdown, setCountdown] = useState(5);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // Start countdown
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    setIsRedirecting(true);
                    clearInterval(timer);
                    // Redirect after countdown
                    setTimeout(() => {
                        window.location.href = billUrl;
                    }, 500);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [billUrl]);

    const handleRedirectNow = () => {
        setIsRedirecting(true);
        window.location.href = billUrl;
    };

    return (
        <>
            <Head title="Redirecting to Payment Gateway" />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            {isRedirecting ? (
                                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                            ) : (
                                <CreditCard className="w-8 h-8 text-blue-600" />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {isRedirecting ? 'Redirecting...' : 'Redirecting to Payment'}
                        </h1>
                        <p className="text-gray-600">
                            {isRedirecting 
                                ? 'Please wait while we redirect you to the payment gateway...'
                                : `You will be redirected to ToyyibPay in ${countdown} seconds`
                            }
                        </p>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold mb-2">Order Summary</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                                <span>Order ID:</span>
                                <span className="font-medium">{orderData?.order_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Amount:</span>
                                <span className="font-medium">RM{orderData?.total_retail_price}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Payment Method:</span>
                                <span className="font-medium">Online Banking (FPX)</span>
                            </div>
                        </div>
                    </div>

                    {!isRedirecting && (
                        <div className="space-y-3">
                            <button
                                onClick={handleRedirectNow}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                Continue to Payment Now
                            </button>
                            <a
                                href="/"
                                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors inline-block"
                            >
                                Cancel & Return to Store
                            </a>
                        </div>
                    )}

                    {isRedirecting && (
                        <div className="text-sm text-gray-500">
                            <p>If you are not redirected automatically,</p>
                            <a
                                href={billUrl}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                click here to continue
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}