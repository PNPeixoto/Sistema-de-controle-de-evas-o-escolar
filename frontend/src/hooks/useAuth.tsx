import { useState, useEffect, createContext, useContext } from 'react';
import { api, clearToken, getToken, setToken } from '../services/api';

interface UsuarioAuth {
    nome: string;
    email: string;
    cargo: string;
    escolaNome: string;
}

interface AuthContextType {
    usuario: UsuarioAuth | null;
    carregando: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
    recarregar: () => void;
}

const AuthContext = createContext<AuthContextType>({
    usuario: null,
    carregando: true,
    login: async () => {},
    logout: async () => {},
    recarregar: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [usuario, setUsuario] = useState<UsuarioAuth | null>(null);
    const [carregando, setCarregando] = useState(true);

    const carregarUsuario = async () => {
        if (!getToken()) {
            setUsuario(null);
            setCarregando(false);
            return;
        }

        try {
            const resp = await api.get('/usuario/me');
            setUsuario({
                nome: resp.data.nome,
                email: resp.data.email,
                cargo: resp.data.cargo,
                escolaNome: resp.data.escolaNome,
            });
        } catch {
            setUsuario(null);
            clearToken();
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarUsuario();
    }, []);

    // NOVO: Função login — salva token E carrega usuário ANTES de retornar
    const login = async (token: string) => {
        setToken(token.replace('Bearer ', ''));
        await carregarUsuario();
    };

    const logout = async () => {
        try {
            await api.post('/usuario/logout');
        } catch (e) {}
        clearToken();
        setUsuario(null);
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ usuario, carregando, login, logout, recarregar: carregarUsuario }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
