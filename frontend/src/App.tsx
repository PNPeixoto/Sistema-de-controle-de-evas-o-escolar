import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { api } from './services/api';

// --- COMPONENTE DE ROTA PROTEGIDA (O que estava faltando!) ---
function ProtectedRoute({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem('token');

    // Se não houver token, redireciona para a tela de login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    return children;
}

// --- COMPONENTE DE LOGIN ---
function Login() {
    const [email, setEmail] = useState('');
    const [senhaEscola, setSenhaEscola] = useState('');
    const [pin, setPin] = useState('');
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        try {
            const resposta = await api.post('/usuario/login', {
                email,
                senhaEscola,
                senhaIndividual: pin
            });
            localStorage.setItem('token', resposta.data);
            navigate('/dashboard');
        } catch (error: any) {
            setErro(error.response?.data?.message || 'Erro ao conectar com o servidor.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">Acesso ao Sistema</h1>
                {erro && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{erro}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="E-mail" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
                    <input type="password" placeholder="Senha Escola" required value={senhaEscola} onChange={e => setSenhaEscola(e.target.value)} className="w-full p-2 border rounded" />
                    <input type="password" placeholder="PIN Individual" required maxLength={6} value={pin} onChange={e => setPin(e.target.value)} className="w-full p-2 border rounded text-center font-mono" />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Entrar</button>
                </form>
            </div>
        </div>
    );
}

// --- COMPONENTE DO DASHBOARD ---
function Dashboard() {
    const navigate = useNavigate();
    const buscarMeusDados = async () => {
        try {
            const resposta = await api.get('/usuario/email?email=joao@prefeitura.rj.gov.br');
            alert(`Sucesso! Usuário: ${resposta.data.nome}`);
        } catch (error) {
            alert("Erro 403: Acesso negado.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
                <div className="flex justify-between mb-6">
                    <h1 className="text-xl font-bold text-slate-800">Painel de Controle</h1>
                    <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className="text-red-600">Sair</button>
                </div>
                <button onClick={buscarMeusDados} className="bg-green-600 text-white px-4 py-2 rounded">Testar Conexão Segura</button>
            </div>
        </div>
    );
}

// --- CONTROLADOR DE ROTAS ---
export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
        </Routes>
    );
}