import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { usuario, carregando } = useAuth();

    if (carregando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-slate-500 text-lg font-medium animate-pulse">
                    Verificando sessão...
                </div>
            </div>
        );
    }

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
