import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import { AuthContext } from '../hooks/authContext';
import type { UsuarioAuth } from '../hooks/authContext';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<UsuarioAuth | null>(null);
    const [carregando, setCarregando] = useState(true);

    const aplicarUsuario = useCallback((data: UsuarioAuth) => {
        setUsuario({
            nome: data.nome,
            email: data.email,
            cargo: data.cargo,
            escolaNome: data.escolaNome,
        });
    }, []);

    const carregarUsuario = useCallback(async () => {
        try {
            const resp = await api.get<UsuarioAuth>('/usuario/me');
            aplicarUsuario(resp.data);
            return true;
        } catch {
            setUsuario(null);
        }
        return false;
    }, [aplicarUsuario]);

    useEffect(() => {
        let ativo = true;

        const inicializarSessao = async () => {
            await carregarUsuario();
            if (ativo) {
                setCarregando(false);
            }
        };

        void inicializarSessao();

        return () => {
            ativo = false;
        };
    }, [carregarUsuario]);

    const login = useCallback(async () => {
        await carregarUsuario();
    }, [carregarUsuario]);

    const logout = useCallback(async () => {
        try {
            await api.post('/usuario/logout');
        } catch {
            // Logout remoto falhou, mas a limpeza local ainda precisa acontecer.
        }
        setUsuario(null);
        window.location.href = '/';
    }, []);

    const value = useMemo(() => ({
        usuario,
        carregando,
        login,
        logout,
        recarregar: carregarUsuario,
    }), [usuario, carregando, login, logout, carregarUsuario]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
