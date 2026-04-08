import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../services/api';

/**
 * ProtectedRoute SEGURO
 *
 * Ao invés de checar localStorage.token (que é manipulável via DevTools),
 * faz uma requisição ao backend /usuario/me para validar a sessão.
 *
 * O cookie HttpOnly é enviado automaticamente pelo navegador.
 * Se o cookie não existir ou o token estiver expirado/invalidado,
 * o backend retorna 401 e o usuário é redirecionado ao login.
 */
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    useEffect(() => {
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
