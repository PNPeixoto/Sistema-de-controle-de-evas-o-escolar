import { createContext } from 'react';

export interface UsuarioAuth {
    nome: string;
    email: string;
    cargo: string;
    escolaNome: string;
}

export interface AuthContextType {
    usuario: UsuarioAuth | null;
    carregando: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    recarregar: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
    usuario: null,
    carregando: true,
    login: async () => {},
    logout: async () => {},
    recarregar: async () => false,
});
