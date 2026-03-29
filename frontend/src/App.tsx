import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importando das nossas novas pastas
import Login from './pages/Login';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import CadastrarAluno from './pages/CadastrarAluno';
import ConsultarAluno from './pages/ConsultarAluno';
import RegistrarEvasao from './pages/RegistrarEvasao';
import PainelSemed from './pages/Semed/PainelSemed';
import ConsultarUnidade from "./pages/Dashboard/ConsultarUnidade";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" replace />;
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            {/* Rotas Agrupadas do Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

                {/* Rota Padrão: /dashboard
                    Aqui a mágica acontece! A tela inicial agora carrega os nossos Cards e Estatísticas
                */}
                <Route index element={<DashboardHome />} />

                {/* Rotas Filhas: /dashboard/qualquer-coisa */}
                <Route path="cadastrar-aluno" element={<CadastrarAluno />} />
                <Route path="consultar-aluno" element={<ConsultarAluno />} />
                <Route path="registrar-evasao" element={<RegistrarEvasao />} />
                <Route path="painel-semed" element={<PainelSemed />} />
                <Route path="consultar-unidade" element={<ConsultarUnidade />} />
            </Route>
        </Routes>
    );
}