import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Login({ error }) {
    const [password, setPassword] = useState('admin123');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/dashboard/login';
        
        const passwordInput = document.createElement('input');
        passwordInput.type = 'hidden';
        passwordInput.name = 'password';
        passwordInput.value = password;
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (csrfToken) {
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = csrfToken;
            form.appendChild(tokenInput);
        }
        
        form.appendChild(passwordInput);
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <>
            <Head title="Dashboard Login" />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-center mb-6">Admin Dashboard</h1>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Enter admin password"
                                required
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-2">Default password: admin123</p>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                            ← Back to Store
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}