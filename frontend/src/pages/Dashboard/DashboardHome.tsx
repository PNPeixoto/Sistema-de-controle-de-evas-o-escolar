import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function DashboardHome() {
    const escolaLogada = localStorage.getItem('escolaNome') || 'sua unidade';
    const cargoLogado = localStorage.getItem('cargo') || 'ESCOLA';

    const [carregando, setCarregando] = useState(true);
    const [alunosBrutos, setAlunosBrutos] = useState<any[]>([]);

    const [alunosInfracoes, setAlunosInfracoes] = useState<any[]>([]);
    const [alunosVisitas, setAlunosVisitas] = useState<any[]>([]);

    const [mostrarModalFicais, setMostrarModalFicais] = useState(false);
    const [mostrarModalVisitas, setMostrarModalVisitas] = useState(false);

    const [estatisticas, setEstatisticas] = useState({
        alunosMatriculados: 0,
        ficiaisAbertas: 0,
        visitasPendentes: 0,
        casosResolvidos: 0
    });

    useEffect(() => {
        carregarDadosDaApi();
    }, [cargoLogado]);

    const carregarDadosDaApi = async () => {
        try {
            setCarregando(true);
            const token = localStorage.getItem('token');
            let respostaAlunos;

            if (cargoLogado === 'SEMED') {
                respostaAlunos = await api.get('/semed/alunos/todos', { headers: { Authorization: `Bearer ${token}` } });
            } else {
                respostaAlunos = await api.get(`/aluno/escola/${encodeURIComponent(escolaLogada)}`, { headers: { Authorization: `Bearer ${token}` } });
            }

            const alunos = Array.isArray(respostaAlunos.data) ? respostaAlunos.data : [];
            setAlunosBrutos(alunos);
            processarEstatisticas(alunos);

        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        } finally {
            setCarregando(false);
        }
    };

    const processarEstatisticas = (alunos: any[]) => {
        const ficiaisResolvidas = JSON.parse(localStorage.getItem('ficiaisResolvidas') || '[]');

        const infrequentes: any[] = [];
        const visitas: any[] = [];
        let countResolvidas = 0;

        alunos.forEach((aluno: any) => {
            if (aluno.historicoEvasao && aluno.historicoEvasao.length > 0) {
                const evasaoAtiva = aluno.historicoEvasao[0];

                if (ficiaisResolvidas.includes(evasaoAtiva.id)) {
                    countResolvidas++;
                } else {
                    infrequentes.push(aluno);
                    const dadosDaEvasao = JSON.stringify(evasaoAtiva).toLowerCase();
                    if (dadosDaEvasao.includes('visita domiciliar') || dadosDaEvasao.includes('visita')) {
                        visitas.push(aluno);
                    }
                }
            }
        });

        const ordenar = (a: any, b: any) => {
            if (a.escola < b.escola) return -1;
            if (a.escola > b.escola) return 1;
            return a.nomeCompleto.localeCompare(b.nomeCompleto);
        };

        setAlunosInfracoes(infrequentes.sort(ordenar));
        setAlunosVisitas(visitas.sort(ordenar));

        setEstatisticas({
            alunosMatriculados: alunos.length,
            ficiaisAbertas: infrequentes.length,
            visitasPendentes: visitas.length,
            casosResolvidos: countResolvidas
        });
    };

    const marcarComoResolvido = (evasaoId: number) => {
        if(window.confirm('Tem certeza que a frequência deste aluno foi normalizada?')) {
            const resolvidas = JSON.parse(localStorage.getItem('ficiaisResolvidas') || '[]');
            resolvidas.push(evasaoId);
            localStorage.setItem('ficiaisResolvidas', JSON.stringify(resolvidas));

            processarEstatisticas(alunosBrutos);

            if (alunosInfracoes.length <= 1) setMostrarModalFicais(false);
            if (alunosVisitas.length <= 1) setMostrarModalVisitas(false);
        }
    };

    const calcularIdade = (data: string) => {
        if (!data) return 'N/I';
        return new Date().getFullYear() - new Date(data).getFullYear();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn p-4">
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Visão Geral</h1>
                <p className="text-slate-500 mt-1 text-lg">
                    {cargoLogado === 'SEMED' ? 'Painel Gerencial da Rede Municipal de Ensino.' : `Bem-vindo(a) ao painel de controle da ${escolaLogada}.`}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 group hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Alunos Registrados</p>
                        <span className="text-2xl opacity-70 group-hover:opacity-100 transition">👥</span>
                    </div>
                    <p className="text-5xl font-black text-slate-900 mt-4 tracking-tighter">
                        {carregando ? '...' : estatisticas.alunosMatriculados.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-green-600 font-medium mt-1">Ativos no sistema</p>
                </div>

                <div
                    onClick={() => { if(estatisticas.ficiaisAbertas > 0) setMostrarModalFicais(true); }}
                    className={`bg-white p-7 rounded-2xl shadow-sm border border-slate-200 group transition-all duration-300 ${estatisticas.ficiaisAbertas > 0 ? 'cursor-pointer hover:border-red-400 hover:shadow-red-100 hover:shadow-lg hover:-translate-y-1' : ''}`}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">FICAIs Abertas</p>
                        <span className="text-2xl opacity-70 group-hover:opacity-100 transition">🚨</span>
                    </div>
                    <p className="text-5xl font-black text-red-600 mt-4 tracking-tighter">
                        {carregando ? '...' : estatisticas.ficiaisAbertas.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-red-500 font-medium mt-1">
                        {estatisticas.ficiaisAbertas > 0 ? 'Clique para ver a lista ➔' : 'Nenhuma evasão pendente'}
                    </p>
                </div>

                <div
                    onClick={() => { if(estatisticas.visitasPendentes > 0) setMostrarModalVisitas(true); }}
                    className={`bg-white p-7 rounded-2xl shadow-sm border border-slate-200 group transition-all duration-300 ${estatisticas.visitasPendentes > 0 ? 'cursor-pointer hover:border-yellow-400 hover:shadow-yellow-100 hover:shadow-lg hover:-translate-y-1' : ''}`}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Visitas Pendentes</p>
                        <span className="text-2xl opacity-70 group-hover:opacity-100 transition">🏠</span>
                    </div>
                    <p className="text-5xl font-black text-yellow-600 mt-4 tracking-tighter">
                        {carregando ? '...' : estatisticas.visitasPendentes.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-yellow-600 font-medium mt-1">
                        {estatisticas.visitasPendentes > 0 ? 'Clique para ver os locais ➔' : 'Nenhuma visita agendada'}
                    </p>
                </div>

                <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 group hover:border-green-300 transition-colors">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Casos Resolvidos</p>
                        <span className="text-2xl opacity-70 group-hover:opacity-100 transition">✅</span>
                    </div>
                    <p className="text-5xl font-black text-green-600 mt-4 tracking-tighter">
                        {carregando ? '...' : estatisticas.casosResolvidos.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-green-600 font-medium mt-1">Frequências normalizadas!</p>
                </div>
            </div>

            {/* ========================================== */}
            {/* LÓGICA BLINDADA: SEMED VS ESCOLA           */}
            {/* ========================================== */}
            {cargoLogado !== 'SEMED' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">📋 Últimas Atividades Registradas</h2>
                        <div className="flex flex-col items-center justify-center p-10 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                            <svg className="w-12 h-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            <p className="font-medium">Lista de atividades em desenvolvimento...</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-slate-800 mb-2">Ações Rápidas</h2>
                        <Link to="/dashboard/cadastrar-aluno" className="w-full flex items-center justify-center gap-2 p-4 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition border border-blue-200"><span>➕</span> Novo Cadastro</Link>
                        <Link to="/dashboard/registrar-evasao" className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition border border-red-200 shadow-sm"><span>🚨</span> Registrar Evasão</Link>
                        <Link to="/dashboard/consultar-aluno" className="w-full flex items-center justify-center gap-2 p-4 bg-slate-50 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition border border-slate-300"><span>🔍</span> Consultar Fichas</Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 flex flex-col items-center justify-center text-center mt-6">
                    <div className="bg-blue-50 text-blue-600 p-5 rounded-full mb-5">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Gestão Central da Rede</h2>
                    <p className="text-slate-500 max-w-2xl text-lg">
                        Você está no painel macro da secretaria. Utilize o menu lateral para consultar os dossiês detalhados por escola na aba <strong>Consultar Unidades</strong> ou extrair os gráficos na aba <strong>Inteligência de Dados</strong>.
                    </p>
                </div>
            )}

            {/* MODAIS COMPARTILHADOS */}
            {(mostrarModalFicais || mostrarModalVisitas) && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => {setMostrarModalFicais(false); setMostrarModalVisitas(false);}}>
                    <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>

                        <div className={`p-5 flex justify-between items-center text-white ${mostrarModalFicais ? 'bg-red-600' : 'bg-yellow-500'}`}>
                            <h2 className="text-xl font-bold">
                                {mostrarModalFicais ? '🚨 Alunos com FICAIs Abertas' : '🏠 Visitas Domiciliares Pendentes'}
                            </h2>
                            <button onClick={() => {setMostrarModalFicais(false); setMostrarModalVisitas(false);}} className="text-white/70 hover:text-white text-3xl font-bold leading-none">&times;</button>
                        </div>

                        <div className="p-0 overflow-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-slate-100 sticky top-0 shadow-sm">
                                <tr>
                                    {cargoLogado === 'SEMED' && <th className="px-5 py-4 font-bold text-slate-600">Escola</th>}
                                    <th className="px-5 py-4 font-bold text-slate-600">Nome do Aluno</th>
                                    <th className="px-5 py-4 font-bold text-slate-600 text-center">Idade</th>
                                    <th className="px-5 py-4 font-bold text-slate-600">Endereço Principal</th>
                                    <th className="px-5 py-4 font-bold text-slate-600 text-center">Resolução</th>
                                </tr>
                                </thead>
                                <tbody>
                                {(mostrarModalFicais ? alunosInfracoes : alunosVisitas).map((aluno, idx) => (
                                    <tr key={aluno.id} className={`border-b border-slate-100 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        {cargoLogado === 'SEMED' && <td className="px-5 py-4 font-semibold text-slate-700">{aluno.escola}</td>}
                                        <td className="px-5 py-4 font-medium text-slate-900">{aluno.nomeCompleto}</td>
                                        <td className="px-5 py-4 text-center text-slate-600">{calcularIdade(aluno.dataNascimento)} anos</td>
                                        <td className="px-5 py-4 text-slate-600 max-w-[200px] truncate" title={aluno.enderecos?.[0] ? `${aluno.enderecos[0].rua}, ${aluno.enderecos[0].bairro}` : 'Não informado'}>
                                            {aluno.enderecos?.[0]?.bairro || 'N/I'}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => marcarComoResolvido(aluno.historicoEvasao[0].id)}
                                                className="bg-green-100 hover:bg-green-600 text-green-700 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                            >
                                                ✅ Normalizar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}