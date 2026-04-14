import  { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardLayout() {
    const location = useLocation();
    const { usuario, logout } = useAuth();

    const escolaLogada = usuario?.escolaNome || 'Unidade Escolar';
    const cargoLogado = usuario?.cargo || 'ESCOLA';

    const isActive = (path: string) => {
        if (path === '/dashboard' && location.pathname === '/dashboard') return true;
        if (path !== '/dashboard' && location.pathname.includes(path)) return true;
        return false;
    };

    const linkClass = (path: string) =>
        `flex items-center gap-3 p-3 rounded-lg transition-all font-medium ${
            isActive(path)
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`;

    return (
        <div className="flex h-screen bg-slate-100 font-sans relative overflow-hidden">

            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] mix-blend-multiply"
                style={{
                    backgroundImage: "url('/logoceduc.jpeg')",
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '50%'
                }}
            />

            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 relative">
                <div className="p-5 border-b border-slate-800 flex flex-col items-center gap-4">
                    <img src="/logo-padrao.png" alt="Prefeitura" className="h-20 w-auto object-contain drop-shadow-md" />

                    <div className="text-center w-full">
                        <h2 className="text-xl font-black uppercase tracking-widest text-white drop-shadow-sm">Sistema FICAI</h2>
                        <div className="mt-3 bg-slate-800/80 py-2 px-3 rounded-lg border border-slate-700 shadow-inner w-full overflow-hidden text-center">
                            <span className="text-xs text-slate-400 font-medium block mb-0.5">Unidade:</span>
                            <span className="text-sm text-blue-400 font-bold block truncate" title={escolaLogada}>{escolaLogada}</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">

                    <Link to="/dashboard" className={linkClass('/dashboard')}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        Visão Geral
                    </Link>

                    {cargoLogado !== 'SEMED' && (
                        <>
                            <Link to="/dashboard/cadastrar-aluno" className={linkClass('/cadastrar-aluno')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                                Cadastrar Aluno
                            </Link>

                            <Link to="/dashboard/registrar-evasao" className={linkClass('/registrar-evasao')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                Registrar Evasão
                            </Link>

                            <Link to="/dashboard/consultar-aluno" className={linkClass('/consultar-aluno')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                Consultar Alunos
                            </Link>
                        </>
                    )}

                    {cargoLogado === 'SEMED' && (
                        <>
                            <Link to="/dashboard/consultar-unidade" className={linkClass('/consultar-unidade')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                Consultar Unidades
                            </Link>

                            <Link to="/dashboard/painel-semed" className={linkClass('/painel-semed')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                Inteligência de Dados
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-2.5 text-red-400 hover:text-white hover:bg-red-600/90 rounded-lg transition-colors font-bold text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Sair do Sistema
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto relative z-10">
                <Outlet />
            </main>
        </div>
    );
}
