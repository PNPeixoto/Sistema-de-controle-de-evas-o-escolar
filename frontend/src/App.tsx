import { Routes, Route, Navigate } from 'react-router-dom';

// Importando das nossas novas pastas
import Login from './pages/Login';
import DashboardLayout from './pages/Dashboard';
import CadastrarAluno from './pages/CadastrarAluno';
import ConsultarAluno from './pages/ConsultarAluno';
import RegistrarEvasao from './pages/RegistrarEvasao';

function ProtectedRoute({ children }: { children: JSX.Element }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" replace />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            {/* Rotas Agrupadas do Dashboard */}

            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

                {/* Rota Padrão: /dashboard */}
                <Route index element={
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Bem-vindo(a) ao Painel</h1>
                        <p className="text-slate-600 mt-2">Selecione uma opção no menu lateral para começar.</p>
                    </div>
                } />


                {/* Rota Filha: /dashboard */}

                <Route path="cadastrar-aluno" element={<CadastrarAluno />} />
                <Route path="consultar-aluno" element={<ConsultarAluno />} />
                <Route path="registrar-evasao" element={<RegistrarEvasao />} />
            </Route>
        </Routes>
    );
}