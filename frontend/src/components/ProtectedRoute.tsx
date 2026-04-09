import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, getToken } from '../services/api';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    useEffect(() => {
        // Sem token em memória = não logado
        if (!getToken()) {
            setStatus('unauthenticated');
            return;
        }

        // Com token, valida no backend
        api.get('/usuario/me')
            .then(() => setStatus('authenticated'))
            .catch(() => setStatus('unauthenticated'));
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-500 text-lg font-medium animate-pulse">
                    Verificando sessão...
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
