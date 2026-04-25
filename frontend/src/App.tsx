import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';

import Login from './pages/Login';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import DashboardHome from './pages/Dashboard/DashboardHome';
import CadastrarAluno from './pages/CadastrarAluno';
import ConsultarAluno from './pages/ConsultarAluno';
import RegistrarEvasao from './pages/RegistrarEvasao';
import PainelSemed from './pages/Semed/PainelSemed';
import ConsultarUnidade from "./pages/Dashboard/ConsultarUnidade";

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<DashboardHome />} />
                    <Route path="cadastrar-aluno" element={<CadastrarAluno />} />
                    <Route path="consultar-aluno" element={<ConsultarAluno />} />
                    <Route path="registrar-evasao" element={<RegistrarEvasao />} />
                    <Route path="painel-semed" element={<PainelSemed />} />
                    <Route path="consultar-unidade" element={<ConsultarUnidade />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}
