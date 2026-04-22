import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../services/api';

interface UsuarioAuth {
    nome: string;
    email: string;
    cargo: string;
    escolaNome: string;
}

interface AuthContextType {
    usuario: UsuarioAuth | null;
    carregando: boolean;
    login: () => Promise<void>;
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

    const aplicarUsuario = (data: UsuarioAuth) => {
        setUsuario({
            nome: data.nome,
            email: data.email,
            cargo: data.cargo,
            escolaNome: data.escolaNome,
        });
    };

    const carregarUsuario = async () => {
        try {
            const resp = await api.get('/usuario/me');
            aplicarUsuario(resp.data);
            return true;
        } catch {
            setUsuario(null);
        }
        return false;
    };

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
    }, []);

    // Sessão baseada no cookie HttpOnly emitido pelo backend.
    const login = async () => {
        await carregarUsuario();
    };

    const logout = async () => {
        try {
            await api.post('/usuario/logout');
        } catch {
            // Logout remoto falhou, mas a limpeza local ainda precisa acontecer.
        }
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
