import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { normalizeCollection, type CollectionResponse } from '../../utils/http';

// (MANTENHA SUAS INTERFACES AQUI)
interface AcaoTomada { id: number; dataAcao: string; descricao: string; }
interface OcorrenciaEvasao { id: number; mesFaltas: string; quantidadeFaltas: number; motivoAfastamento: string; encaminhamentosLaudos: string; conclusao: string; acoes: AcaoTomada[]; status?: string; criadoEm?: string; }
interface Aluno { id: number; nomeCompleto: string; escolaridade: string; turno: string; aee: boolean; dataNascimento: string; cor: string; beneficios: string; enderecos: { rua: string; numero: number; bairro: string; cidade: string }[]; filiacao: { mae: string; pai: string; responsavel: string; telefoneResponsável: string }[]; telefones: { ddd: string; numero: string }[]; historicoEvasao: OcorrenciaEvasao[]; }

export default function ConsultarAluno() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
    const [evasaoExpandida, setEvasaoExpandida] = useState<number | null>(0);
    const [baixandoPdf, setBaixandoPdf] = useState(false);

    // NOVO: Estado para a barra de pesquisa
    const [termoPesquisa, setTermoPesquisa] = useState('');

    const { usuario } = useAuth();
    const escolaLogada = usuario?.escolaNome || '';

    const buscarAlunos = useCallback(async () => {
        if (!usuario) {
            setCarregando(false);
            return;
        }

        try {
            setCarregando(true);

            const urlEndpoint = usuario?.cargo === 'SEMED'
                ? '/semed/alunos/todos'
                : `/aluno/escola/${encodeURIComponent(escolaLogada)}`;

            const resposta = await api.get<CollectionResponse<Aluno>>(urlEndpoint);
            setAlunos(normalizeCollection(resposta.data));
            setErro('');
        } catch {
            setErro('Erro ao buscar a lista de alunos.');
        } finally {
            setCarregando(false);
        }
    }, [escolaLogada, usuario]);

    useEffect(() => {
        void buscarAlunos();
    }, [buscarAlunos]);

    useEffect(() => {
        if (alunoSelecionado === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setAlunoSelecionado(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [alunoSelecionado]);

    // exclusão do aluno
    const handleExcluirAluno = async (id: number, nome: string) => {
        if (window.confirm(`⚠️ ATENÇÃO!\n\nVocê tem certeza que deseja excluir o(a) aluno(a) ${nome}?\n\nIsso apagará permanentemente o cadastro e todas as FICAIs associadas a ele. Essa ação não pode ser desfeita.`)) {
            try {
                await api.delete(`/aluno/${id}`);
                alert('Aluno excluído com sucesso!');
                buscarAlunos(); // Atualiza a lista na tela
            } catch {
                alert('Erro ao excluir. O servidor pode não estar permitindo exclusão em cascata no momento.');
            }
        }
    };

    const handleBaixarFicai = async (aluno: Aluno, evasaoId: number) => {
        try {
            setBaixandoPdf(true);
            const resposta = await api.get(`/relatorios/ficai/${aluno.id}/${evasaoId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([resposta.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `FICAI_${aluno.nomeCompleto.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            alert("Ocorreu um erro ao gerar o PDF da FICAI.");
        } finally {
            setBaixandoPdf(false);
        }
    };

    const abrirModal = (aluno: Aluno) => { setAlunoSelecionado(aluno); setEvasaoExpandida(0); };

    // Filtra a lista
    const alunosFiltrados = alunos.filter(a => a.nomeCompleto.toLowerCase().includes(termoPesquisa.toLowerCase()));

    return (
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-6xl mx-auto animate-fadeIn relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Alunos Matriculados</h2>
                    <p className="text-slate-500 text-sm mt-1">Unidade: <span className="font-semibold text-blue-600">{escolaLogada}</span></p>
                </div>

                {/* BARRA DE PESQUISA E BOTÃO ATUALIZAR */}

                <div className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="🔍 Buscar aluno por nome..."
                        value={termoPesquisa}
                        onChange={e => setTermoPesquisa(e.target.value)}
                        className="w-full md:w-64 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    <button onClick={buscarAlunos} className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition font-medium whitespace-nowrap">
                        ↻ Atualizar
                    </button>
                </div>
            </div>

            {carregando ? (
                <div className="flex justify-center items-center h-40"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
            ) : erro ? (
                <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 text-center font-medium">{erro}</div>
            ) : alunosFiltrados.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">Nenhum aluno encontrado.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                            <th className="p-4 border-b font-semibold rounded-tl-lg">Nome do Aluno</th>
                            <th className="p-4 border-b font-semibold">Série</th>
                            <th className="p-4 border-b font-semibold text-center">Status</th>
                            <th className="p-4 border-b font-semibold text-center rounded-tr-lg">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {alunosFiltrados.map((aluno) => (
                            <tr key={aluno.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 text-slate-800 font-medium">{aluno.nomeCompleto}</td>
                                <td className="p-4 text-slate-600">{aluno.escolaridade}</td>
                                <td className="p-4 text-center">
                                    {aluno.historicoEvasao && aluno.historicoEvasao.length > 0 ? (
                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold"><span aria-hidden="true">🚨</span> ALERTA</span>
                                    ) : (
                                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-semibold">Regular</span>
                                    )}
                                </td>
                                <td className="p-4 text-center flex justify-center gap-2">
                                    <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-semibold hover:bg-blue-700 transition shadow-sm" onClick={() => abrirModal(aluno)}>
                                        Detalhes
                                    </button>

                                    <button
                                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded text-sm font-semibold hover:bg-red-600 hover:text-white transition shadow-sm"
                                        onClick={() => handleExcluirAluno(aluno.id, aluno.nomeCompleto)}
                                        title="Excluir Aluno"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ========================================== */}
            {/* MODAL DE DETALHES DO ALUNO */}
            {/* ========================================== */}
            {alunoSelecionado && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Header do Modal */}
                        <div className="bg-slate-800 p-5 flex justify-between items-center text-white shrink-0">
                            <div>
                                <h3 className="text-xl font-bold">{alunoSelecionado.nomeCompleto}</h3>
                                <p className="text-slate-300 text-sm mt-1">{alunoSelecionado.escolaridade} • Turno: {alunoSelecionado.turno}</p>
                            </div>
                            <button
                                onClick={() => setAlunoSelecionado(null)}
                                className="text-slate-300 hover:text-white text-3xl leading-none"
                            >&times;</button>
                        </div>

                        {/* Corpo do Modal (com scroll) */}
                        <div className="p-6 overflow-y-auto bg-slate-50 space-y-6">

                            {/* NOVO: BLOCO DE EVASÃO (ESTILO ACORDEÃO) */}
                            {alunoSelecionado.historicoEvasao && alunoSelecionado.historicoEvasao.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm">
                                    <h4 className="text-red-800 font-bold text-lg mb-4 flex items-center gap-2">
                                        🚨 Histórico de FICAIs ({alunoSelecionado.historicoEvasao.length})
                                    </h4>

                                    <div className="space-y-3">
                                        {alunoSelecionado.historicoEvasao.map((evasao, index) => {
                                            const isExpanded = evasaoExpandida === index;

                                            return (
                                                <div key={index} className="bg-white rounded-lg border border-red-100 shadow-sm overflow-hidden transition-all">

                                                    {/* GAVETA: CABEÇALHO CLICÁVEL */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setEvasaoExpandida(isExpanded ? null : index)}
                                                        className={`w-full p-4 flex items-center justify-between transition-colors ${isExpanded ? 'bg-red-50/50 border-b border-red-100' : 'hover:bg-slate-50'}`}
                                                    >
                                                        <div className="flex items-center gap-4 md:gap-8 text-sm md:text-base text-left">
                                                            <span className="font-bold text-slate-800 min-w-[120px]">Faltas em {evasao.mesFaltas}</span>
                                                            <span className="font-bold text-red-600 px-3 py-1 bg-red-100 rounded-md">{evasao.quantidadeFaltas} dias</span>
                                                            <span className={`text-xs font-bold px-2 py-1 rounded ${evasao.status === 'RESOLVIDA' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                {evasao.status === 'RESOLVIDA' ? 'RESOLVIDA' : 'ABERTA'}
                                                            </span>
                                                            <span className="text-slate-500 hidden md:block truncate max-w-[250px]">{evasao.motivoAfastamento}</span>
                                                        </div>
                                                        <div className="text-slate-400 font-bold text-2xl leading-none">
                                                            {isExpanded ? '−' : '+'}
                                                        </div>
                                                    </button>

                                                    {/* GAVETA: CONTEÚDO EXPANDIDO */}
                                                    {isExpanded && (
                                                        <div className="p-5 relative animate-fadeIn">

                                                            {/* Botão de baixar fica focado na gaveta aberta */}
                                                            <button
                                                                onClick={() => handleBaixarFicai(alunoSelecionado, evasao.id)}
                                                                disabled={baixandoPdf}
                                                                className="w-full md:w-auto md:absolute md:top-5 md:right-5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 transition-colors z-10 mb-4 md:mb-0"
                                                            >
                                                                {baixandoPdf ? 'Gerando PDF...' : '📄 Baixar FICAI'}
                                                            </button>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm md:pr-40">
                                                                <div><span className="block text-slate-500 font-medium">Motivo Principal:</span> <span className="font-bold break-all">{evasao.motivoAfastamento}</span></div>
                                                            </div>

                                                            {evasao.acoes && evasao.acoes.length > 0 && (
                                                                <div className="mt-6 border-t border-slate-100 pt-4">
                                                                    <p className="text-sm font-bold text-slate-700 mb-3">Histórico de Ações da Escola:</p>
                                                                    <ul className="space-y-2">
                                                                        {evasao.acoes.map((acao, i) => (
                                                                            <li key={i} className="text-sm bg-slate-50 p-3 rounded border border-slate-200 flex flex-col md:flex-row gap-3 w-full">
                                                                                <span className="font-semibold text-slate-600 shrink-0 whitespace-nowrap">
                                                                                    {acao.dataAcao && !Array.isArray(acao.dataAcao) ? acao.dataAcao : 'Data Registrada'}
                                                                                </span>
                                                                                <span className="text-slate-800 break-all whitespace-pre-wrap w-full">
                                                                                    {acao.descricao}
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            <div className="mt-4 bg-red-50/50 p-4 rounded-lg text-sm border border-red-100 w-full">
                                                                <p className="font-bold text-red-800">Conclusão Final / Parecer:</p>
                                                                <p className="text-red-900 mt-2 break-all whitespace-pre-wrap leading-relaxed">
                                                                    {evasao.conclusao}
                                                                </p>
                                                            </div>

                                                            {evasao.status !== 'RESOLVIDA' && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (window.confirm('Confirma normalização da frequência?')) {
                                                                            try {
                                                                                await api.put(`/evasao/${evasao.id}/resolver`);
                                                                                buscarAlunos();
                                                                                setAlunoSelecionado(null);
                                                                                alert('Frequência normalizada!');
                                                                            } catch {
                                                                                alert('Erro ao normalizar.');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="mt-4 px-4 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 transition text-sm"
                                                                >
                                                                    ✓ Normalizar Frequência
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Informações Básicas e Pessoais */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-700 border-b pb-2 mb-3">Dados Pessoais</h4>
                                    <ul className="space-y-2 text-sm">
                                        <li><span className="font-medium text-slate-500">Nascimento:</span> {alunoSelecionado.dataNascimento}</li>
                                        <li><span className="font-medium text-slate-500">Cor/Raça:</span> {alunoSelecionado.cor}</li>
                                        <li><span className="font-medium text-slate-500">Necessita AEE:</span> {alunoSelecionado.aee ? 'Sim' : 'Não'}</li>
                                        <li className="break-words"><span className="font-medium text-slate-500">Benefícios:</span> {alunoSelecionado.beneficios || 'Nenhum'}</li>
                                    </ul>
                                </div>

                                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                                    <h4 className="font-bold text-slate-700 border-b pb-2 mb-3">Filiação e Contato</h4>
                                    {alunoSelecionado.filiacao && alunoSelecionado.filiacao[0] && (
                                        <ul className="space-y-2 text-sm">
                                            <li className="break-words"><span className="font-medium text-slate-500">Mãe:</span> {alunoSelecionado.filiacao[0].mae || 'Não informado'}</li>
                                            <li className="break-words"><span className="font-medium text-slate-500">Pai:</span> {alunoSelecionado.filiacao[0].pai || 'Não informado'}</li>
                                            <li className="break-words"><span className="font-medium text-slate-500">Responsável:</span> {alunoSelecionado.filiacao[0].responsavel || 'Não informado'}</li>
                                            <li><span className="font-medium text-slate-500">Tel Responsável:</span> {alunoSelecionado.filiacao[0].telefoneResponsável}</li>
                                        </ul>
                                    )}
                                </div>

                                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm md:col-span-2">
                                    <h4 className="font-bold text-slate-700 border-b pb-2 mb-3">Endereço Residencial</h4>
                                    {alunoSelecionado.enderecos && alunoSelecionado.enderecos[0] && (
                                        <p className="text-sm text-slate-700 break-words">
                                            {alunoSelecionado.enderecos[0].rua}, Nº {alunoSelecionado.enderecos[0].numero} - {alunoSelecionado.enderecos[0].bairro}, {alunoSelecionado.enderecos[0].cidade}
                                        </p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
