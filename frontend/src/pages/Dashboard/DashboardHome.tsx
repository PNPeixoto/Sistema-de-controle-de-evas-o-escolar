import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import FicaiMensalButton from '../../components/FicaiMensalButton';
import { calcularIdade, formatarData } from '../../utils/helpers';
import { normalizeCollection, type CollectionResponse } from '../../utils/http';

interface EnderecoResumo {
    bairro?: string;
}

interface OcorrenciaResumo {
    id: number;
    mesFaltas?: string;
    quantidadeFaltas?: number;
    criadoEm?: string;
    status?: string;
    [key: string]: unknown;
}

interface AlunoDashboard {
    id: number;
    nomeCompleto: string;
    escola?: string;
    dataNascimento?: string;
    enderecos?: EnderecoResumo[];
    historicoEvasao?: OcorrenciaResumo[];
}

interface AtividadeDashboard extends OcorrenciaResumo {
    alunoNome: string;
}

export default function DashboardHome() {
    const { usuario } = useAuth();
    const escolaLogada = usuario?.escolaNome || 'sua unidade';
    const cargoLogado = usuario?.cargo || 'ESCOLA';

    const [carregando, setCarregando] = useState(true);
    const [alunosBrutos, setAlunosBrutos] = useState<AlunoDashboard[]>([]);

    const [alunosInfracoes, setAlunosInfracoes] = useState<AlunoDashboard[]>([]);
    const [alunosVisitas, setAlunosVisitas] = useState<AlunoDashboard[]>([]);

    const [mostrarModalFicais, setMostrarModalFicais] = useState(false);
    const [mostrarModalVisitas, setMostrarModalVisitas] = useState(false);

    const [estatisticas, setEstatisticas] = useState({
        alunosMatriculados: 0,
        ficiaisAbertas: 0,
        visitasPendentes: 0,
        casosResolvidos: 0
    });

    const processarEstatisticas = useCallback((alunos: AlunoDashboard[]) => {
        const infrequentes: AlunoDashboard[] = [];
        const visitas: AlunoDashboard[] = [];
        let countResolvidas = 0;

        alunos.forEach((aluno) => {
            if (aluno.historicoEvasao && aluno.historicoEvasao.length > 0) {
                const evasaoAtiva = aluno.historicoEvasao[0];

                if (evasaoAtiva.status === 'RESOLVIDA') {
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

        const ordenar = (a: AlunoDashboard, b: AlunoDashboard) => {
            const escolaA = a.escola || '';
            const escolaB = b.escola || '';
            if (escolaA < escolaB) return -1;
            if (escolaA > escolaB) return 1;
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
    }, []);

    useEffect(() => {
        const aberto = mostrarModalFicais || mostrarModalVisitas;
        if (!aberto) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMostrarModalFicais(false);
                setMostrarModalVisitas(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [mostrarModalFicais, mostrarModalVisitas]);

    const carregarDadosDaApi = useCallback(async () => {
        try {
            setCarregando(true);
            let alunos: AlunoDashboard[];
            if (cargoLogado === 'SEMED') {
                const respostaAlunos = await api.get<CollectionResponse<AlunoDashboard>>('/semed/alunos/todos');
                alunos = normalizeCollection(respostaAlunos.data);
            } else {
                const respostaAlunos = await api.get<CollectionResponse<AlunoDashboard>>(`/aluno/escola/${encodeURIComponent(escolaLogada)}`);
                alunos = normalizeCollection(respostaAlunos.data);
            }

            setAlunosBrutos(alunos);
            processarEstatisticas(alunos);

        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        } finally {
            setCarregando(false);
        }
    }, [cargoLogado, escolaLogada, processarEstatisticas]);

    useEffect(() => {
        if (usuario) void carregarDadosDaApi();
    }, [usuario, carregarDadosDaApi]);

    const marcarComoResolvido = async (evasaoId: number) => {
        if (window.confirm('Tem certeza que a frequência deste aluno foi normalizada?')) {
            try {
                await api.put(`/evasao/${evasaoId}/resolver`);
                await carregarDadosDaApi();
                if (alunosInfracoes.length <= 1) setMostrarModalFicais(false);
                if (alunosVisitas.length <= 1) setMostrarModalVisitas(false);
            } catch (error) {
                console.error('Erro ao resolver evasão:', error);
                alert('Erro ao marcar como resolvido. Tente novamente.');
            }
        }
    };

    const ultimasAtividades = alunosBrutos
        .filter(a => (a.historicoEvasao?.length || 0) > 0)
        .flatMap((a): AtividadeDashboard[] => (a.historicoEvasao || []).map((e) => ({ ...e, alunoNome: a.nomeCompleto })))
        .sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''))
        .slice(0, 5);

    const resolverPrimeiraEvasao = (aluno: AlunoDashboard) => {
        const evasaoId = aluno.historicoEvasao?.[0]?.id;
        if (evasaoId) {
            void marcarComoResolvido(evasaoId);
        }
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
                        <span aria-hidden="true" className="text-2xl opacity-70 group-hover:opacity-100 transition">&#x1F465;</span>
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
                        <span aria-hidden="true" className="text-2xl opacity-70 group-hover:opacity-100 transition">&#x1F6A8;</span>
                    </div>
                    <p className="text-5xl font-black text-red-600 mt-4 tracking-tighter">
                        {carregando ? '...' : estatisticas.ficiaisAbertas.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-red-500 font-medium mt-1">
                        {estatisticas.ficiaisAbertas > 0 ? 'Clique para ver a lista' : 'Nenhuma evasão pendente'}
                    </p>
                </div>

                <div
                    onClick={() => { if(estatisticas.visitasPendentes > 0) setMostrarModalVisitas(true); }}
                    className={`bg-white p-7 rounded-2xl shadow-sm border border-slate-200 group transition-all duration-300 ${estatisticas.visitasPendentes > 0 ? 'cursor-pointer hover:border-yellow-400 hover:shadow-yellow-100 hover:shadow-lg hover:-translate-y-1' : ''}`}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Visitas Pendentes</p>
                        <span aria-hidden="true" className="text-2xl opacity-70 group-hover:opacity-100 transition">&#x1F3E0;</span>
                    </div>
                    <p className="text-5xl font-black text-yellow-600 mt-4 tracking-tighter">
                        {carregando ? '...' : estatisticas.visitasPendentes.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-yellow-600 font-medium mt-1">
                        {estatisticas.visitasPendentes > 0 ? 'Clique para ver os locais' : 'Nenhuma visita agendada'}
                    </p>
                </div>

                <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 group hover:border-green-300 transition-colors">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Casos Resolvidos</p>
                        <span aria-hidden="true" className="text-2xl opacity-70 group-hover:opacity-100 transition">&#x2705;</span>
                    </div>
                    <p className="text-5xl font-black text-green-600 mt-4 tracking-tighter">
                        {carregando ? '...' : estatisticas.casosResolvidos.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-green-600 font-medium mt-1">Frequências normalizadas!</p>
                </div>
            </div>

            {cargoLogado !== 'SEMED' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">Últimas Atividades Registradas</h2>
                        {ultimasAtividades.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-10 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                                <p className="font-medium">Nenhuma evasão registrada ainda.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {ultimasAtividades.map((atv) => {
                                    const status = atv.status || 'ABERTA';
                                    const resolvida = status === 'RESOLVIDA';
                                    return (
                                        <li key={atv.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 truncate">{atv.alunoNome}</p>
                                                <p className="text-xs text-slate-500">
                                                    Faltas em <span className="font-medium">{atv.mesFaltas}</span> • {atv.quantidadeFaltas} dias • {formatarData(atv.criadoEm)}
                                                </p>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded self-start md:self-auto ${resolvida ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                {resolvida ? 'RESOLVIDA' : 'ABERTA'}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
                        <h2 className="text-lg font-bold text-slate-800 mb-2">Ações Rápidas</h2>
                        <Link to="/dashboard/cadastrar-aluno" className="w-full flex items-center justify-center gap-2 p-4 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition border border-blue-200">Novo Cadastro</Link>
                        <Link to="/dashboard/registrar-evasao" className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition border border-red-200 shadow-sm">Registrar Evasão</Link>
                        <Link to="/dashboard/consultar-aluno" className="w-full flex items-center justify-center gap-2 p-4 bg-slate-50 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition border border-slate-300">Consultar Fichas</Link>
                        <FicaiMensalButton />
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 flex flex-col items-center justify-center text-center mt-6">
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Gestão Central da Rede</h2>
                    <p className="text-slate-500 max-w-2xl text-lg">
                        Você está no painel macro da secretaria. Utilize o menu lateral para consultar os dossiês por escola ou extrair os gráficos.
                    </p>
                </div>
            )}

            {(mostrarModalFicais || mostrarModalVisitas) && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => {setMostrarModalFicais(false); setMostrarModalVisitas(false);}}>
                    <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className={`p-5 flex justify-between items-center text-white ${mostrarModalFicais ? 'bg-red-600' : 'bg-yellow-500'}`}>
                            <h2 className="text-xl font-bold">
                                {mostrarModalFicais ? 'Alunos com FICAIs Abertas' : 'Visitas Domiciliares Pendentes'}
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
                                        <td className="px-5 py-4 text-slate-600 max-w-[200px] truncate">{aluno.enderecos?.[0]?.bairro || 'N/I'}</td>
                                        <td className="px-5 py-4 text-center">
                                            <button onClick={() => resolverPrimeiraEvasao(aluno)}
                                                className="bg-green-100 hover:bg-green-600 text-green-700 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm">
                                                Normalizar
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
