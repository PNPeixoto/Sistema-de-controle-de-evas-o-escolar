import { useNavigate, Outlet, Link } from 'react-router-dom';

export default function DashboardLayout() {
    const navigate = useNavigate();

    const fazerLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* MENU LATERAL (SIDEBAR) */}
            <aside className="w-64 bg-slate-800 text-white flex flex-col">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-bold">Controle Escolar</h2>
                    <p className="text-sm text-slate-400 mt-1">Painel da Unidade</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/dashboard" className="block p-3 rounded hover:bg-slate-700 transition">Início</Link>
                    <Link to="/dashboard/cadastrar-aluno" className="block p-3 rounded hover:bg-slate-700 transition bg-slate-700/50">Cadastrar Aluno</Link>
                    <Link to="/dashboard/consultar-aluno" className="block p-3 rounded hover:bg-slate-700 transition text-slate-400">Consultar Aluno</Link>
                    <Link to="/dashboard" className="block p-3 rounded hover:bg-slate-700 transition text-slate-400">Registrar Evasão</Link>
                    <Link to="/dashboard" className="block p-3 rounded hover:bg-slate-700 transition text-slate-400">Exportar Dados</Link>
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button onClick={fazerLogout} className="w-full text-left p-2 text-red-400 hover:text-red-300 font-medium">Sair do Sistema</button>
                </div>
            </aside>

            {/* ÁREA DE CONTEÚDO PRINCIPAL */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* O componente <Outlet /> é onde as sub-páginas vão renderizar! */}
                <Outlet />
            </main>
        </div>
    );
}