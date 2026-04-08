import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../services/api';

/**
 * Hook de autenticação que obtém cargo e escola do BACKEND
 * ao invés de confiar no localStorage (que é manipulável).
 *
 * Uso:
 *   const { usuario, carregando, logout } = useAuth();
 *   if (usuario?.cargo === 'SEMED') { ... }
 */

interface UsuarioAuth {
    nome: string;
    email: string;
    cargo: string;
    escolaNome: string;
}

interface AuthContextType {
    usuario: UsuarioAuth | null;
    carregando: boolean;
    logout: () => Promise<void>;
    recarregar: () => void;
}

const AuthContext = createContext<AuthContextType>({
    usuario: null,
    carregando: true,
    logout: async () => {},
    recarregar: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [usuario, setUsuario] = useState<UsuarioAuth | null>(null);
    const [carregando, setCarregando] = useState(true);

    const carregarUsuario = () => {
        setCarregando(true);
        api.get('/usuario/me')
            .then(resp => {
                setUsuario({
                    nome: resp.data.nome,
                    email: resp.data.email,
                    cargo: resp.data.cargo,
                    escolaNome: resp.data.escolaNome,
                });
            })
            .catch(() => setUsuario(null))
            .finally(() => setCarregando(false));
    };

    useEffect(() => {
        carregarUsuario();
    }, []);

    const logout = async () => {
        try {
            await api.post('/usuario/logout');
        } catch (e) {
            // Ignora erro — cookie pode já ter expirado
        }
        setUsuario(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ usuario, carregando, logout, recarregar: carregarUsuario }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
