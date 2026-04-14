import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';

// ==========================================
// INTERFACES
// ==========================================
interface Bairro { id: number; nome: string; }
interface Escola { id: number; nome: string; bairro?: Bairro; }
interface Aluno {
    id: number; nomeCompleto: string; escolaridade: string; dataNascimento: string; cor: string;
    aee: boolean; turno: string; beneficios: string; filiacao: any[]; historicoEvasao: any[];
}

export default function ConsultarUnidade() {
    const [escolas, setEscolas] = useState<Escola[]>([]);
    const [carregandoEscolas, setCarregandoEscolas] = useState(true);

    const [termoBusca, setTermoBusca] = useState('');
    const [bairroAtivo, setBairroAtivo] = useState<string | null>(null);
    const [escolaAtiva, setEscolaAtiva] = useState<string | null>(null);

    const [alunosSemed, setAlunosSemed] = useState<Aluno[]>([]);
    const [carregandoAlunos, setCarregandoAlunos] = useState(false);
    const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);

    const [ficiaisBaixadas, setFiciaisBaixadas] = useState<number[]>([]);

    useEffect(() => {
        carregarTodasAsEscolas();
    }, []);

    const carregarTodasAsEscolas = async () => {
        try {
            setCarregandoEscolas(true);
            const resposta = await api.get('/escolas');
            setEscolas(Array.isArray(resposta.data) ? resposta.data : []);
        } catch (error) {
            console.error("Erro:", error);
        } finally {
            setCarregandoEscolas(false);
        }
    };

    const abrirBairro = (nomeBairro: string) => { setBairroAtivo(nomeBairro); setTermoBusca(''); };

    const abrirEscola = async (nomeEscola: string) => {
        try {
            setCarregandoAlunos(true);
            const resposta = await api.get(`/aluno/escola/${encodeURIComponent(nomeEscola)}`);
            setAlunosSemed(Array.isArray(resposta.data) ? resposta.data : []);
            setEscolaAtiva(nomeEscola);
        } catch (error) {
            alert("Erro ao acessar dados.");
        } finally {
            setCarregandoAlunos(false);
        }
    };

    const voltar = () => {
        if (escolaAtiva) { setEscolaAtiva(null); setAlunosSemed([]); }
        else if (bairroAtivo) { setBairroAtivo(null); }
    };

    // ==========================================
    // FUNÇÃO: BAIXAR PDF COM SALVAMENTO DE STATUS
    // ==========================================
    const baixarFicaiPdf = async (aluno: Aluno) => {
        try {
            const evasaoId = aluno.historicoEvasao[0]?.id;
            if (!evasaoId) return alert("FICAI não encontrada.");
            const resposta = await api.get(`/relatorios/ficai/${aluno.id}/${evasaoId}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([resposta.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `FICAI_${aluno.nomeCompleto.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            if (!ficiaisBaixadas.includes(evasaoId)) {
                setFiciaisBaixadas([...ficiaisBaixadas, evasaoId]);
            }

        } catch (error) {
            alert("Erro ao baixar. O servidor não encontrou o arquivo.");
        }
    };

    const resolverFicaiPeloModal = async (evasaoId: number) => {
        if (window.confirm('Tem certeza que a frequência foi normalizada?')) {
            try {
                await api.put(`/evasao/${evasaoId}/resolver`);
                if (escolaAtiva) {
                    const resposta = await api.get(`/aluno/escola/${encodeURIComponent(escolaAtiva)}`);
                    const lista = Array.isArray(resposta.data) ? resposta.data : [];
                    setAlunosSemed(lista);
                    const atual = lista.find((a: Aluno) => a.id === alunoSelecionado?.id);
                    setAlunoSelecionado(atual || null);
                }
            } catch (err) {
                alert('Erro ao normalizar.');
            }
        }
    };

    const bairrosUnicos = useMemo(() => {
        const nomesBairros = escolas.map(e => e.bairro?.nome ? e.bairro.nome : 'Outras Unidades');
        return Array.from(new Set(nomesBairros)).sort();
    }, [escolas]);

    const resultadosDaBusca = useMemo(() => {
        if (!termoBusca.trim()) return [];
        const termo = termoBusca.toLowerCase();
        return escolas.filter(e => e.nome.toLowerCase().includes(termo) || (e.bairro && e.bairro.nome.toLowerCase().includes(termo)));
    }, [escolas, termoBusca]);

    const escolasDoBairroAtivo = useMemo(() => {
        if (!bairroAtivo) return [];
        return escolas.filter(e => { const b = e.bairro?.nome ? e.bairro.nome : 'Outras Unidades'; return b === bairroAtivo; });
    }, [escolas, bairroAtivo]);


    // ==========================================
    // RENDERIZAÇÃO: NÍVEL 3 (Escola > Tabela e Modal)
    // ==========================================
    if (escolaAtiva) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn p-4 relative">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2">
                            <span>Macaé</span><span>/</span><span>{bairroAtivo || 'Busca'}</span><span>/</span><span className="text-blue-500">{escolaAtiva}</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{escolaAtiva}</h2>
                        <p className="text-slate-500 text-sm mt-1">Alunos matriculados e registros de frequência.</p>
                    </div>
                    <button onClick={voltar} className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition shadow-sm">← Voltar</button>
                </div>

                {carregandoAlunos ? (
                    <div className="text-center p-10 font-bold text-slate-500">Carregando alunos...</div>
                ) : alunosSemed.length === 0 ? (
                    <div className="text-center p-16 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-500 font-medium">Nenhum aluno registrado nesta unidade escolar.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="min-w-full leading-normal text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase">Nome</th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase">Escolaridade</th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase">Status Global</th>
                                <th className="px-5 py-4 text-xs font-bold text-slate-600 uppercase text-center">Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {alunosSemed.map(aluno => {
                                const temEvasao = aluno.historicoEvasao && aluno.historicoEvasao.length > 0;
                                const isResolvida = temEvasao && aluno.historicoEvasao[0].status === 'RESOLVIDA';

                                return (
                                    <tr key={aluno.id} className="hover:bg-slate-50 transition border-b border-slate-100">
                                        <td className="px-5 py-4 text-sm font-medium text-slate-800">{aluno.nomeCompleto}</td>
                                        <td className="px-5 py-4 text-sm text-slate-600">{aluno.escolaridade}</td>
                                        <td className="px-5 py-4">
                                            {isResolvida
                                                ? <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">RESOLVIDA</span>
                                                : temEvasao
                                                    ? <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">ABERTA</span>
                                                    : <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">Regular (Sem Histórico)</span>
                                            }
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button onClick={() => setAlunoSelecionado(aluno)} className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                                Ver Dossiê
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* MODAL DE DETALHES DO ALUNO */}
                {alunoSelecionado && (
                    <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => setAlunoSelecionado(null)}>
                        <div className="bg-slate-50 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>

                            <div className="bg-slate-800 p-6 flex justify-between items-center text-white shrink-0">
                                <div>
                                    <h2 className="text-2xl font-black">{alunoSelecionado.nomeCompleto}</h2>
                                    <p className="text-slate-300 text-sm mt-1">{alunoSelecionado.escolaridade} • Turno {alunoSelecionado.turno || 'N/I'}</p>
                                </div>
                                <button onClick={() => setAlunoSelecionado(null)} className="text-slate-400 hover:text-white text-4xl leading-none">&times;</button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-6">

                                {/* LÓGICA DE EXIBIÇÃO DA FICAI (VERIFICA SE ESTÁ RESOLVIDA OU BAIXADA) */}
                                {alunoSelecionado.historicoEvasao && alunoSelecionado.historicoEvasao.length > 0 && (
                                    alunoSelecionado.historicoEvasao[0].status === 'RESOLVIDA' ? (
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div>
                                                <h3 className="text-green-800 font-bold text-lg flex items-center gap-2">✅ FICAI Resolvida</h3>
                                                <p className="text-green-600 text-sm mt-1">A frequência deste aluno foi declarada como normalizada no sistema.</p>
                                            </div>
                                            <button onClick={() => baixarFicaiPdf(alunoSelecionado)} className="bg-green-100 hover:bg-green-200 text-green-800 font-bold py-3 px-6 rounded-xl border border-green-300 transition-colors w-full md:w-auto">
                                                Reimprimir Arquivo Morto
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                            <div>
                                                <h3 className="text-red-800 font-bold text-lg flex items-center gap-2">
                                                    🚨 Dossiê FICAI Pendente
                                                    {ficiaisBaixadas.includes(alunoSelecionado.historicoEvasao[0].id) && (
                                                        <span className="bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1 rounded-full ml-2">📥 PDF Já Baixado</span>
                                                    )}
                                                </h3>
                                                <p className="text-red-600 text-sm mt-1">É necessária a intervenção ou visitação para este caso.</p>
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button onClick={() => resolverFicaiPeloModal(alunoSelecionado.historicoEvasao[0].id)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors w-full text-sm">
                                                    ✔ Normalizar
                                                </button>
                                                <button onClick={() => baixarFicaiPdf(alunoSelecionado)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors w-full text-sm flex items-center gap-2">
                                                    {ficiaisBaixadas.includes(alunoSelecionado.historicoEvasao[0].id) ? 'Reimprimir' : 'Baixar PDF'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}

                                {/* Dados do Aluno (Restante da View) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 border-b pb-2 mb-4 text-lg">Dados Pessoais</h4>
                                        <ul className="space-y-3 text-sm text-slate-700">
                                            <li><strong className="text-slate-500">Data Nasc:</strong> {alunoSelecionado.dataNascimento ? new Date(alunoSelecionado.dataNascimento).toLocaleDateString() : 'N/I'}</li>
                                            <li><strong className="text-slate-500">Cor/Raça:</strong> {alunoSelecionado.cor}</li>
                                            <li><strong className="text-slate-500">Necessita AEE:</strong> {alunoSelecionado.aee ? 'Sim' : 'Não'}</li>
                                            <li><strong className="text-slate-500">Benefícios:</strong> {alunoSelecionado.beneficios || 'Nenhum'}</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-800 border-b pb-2 mb-4 text-lg">Responsáveis e Contato</h4>
                                        {alunoSelecionado.filiacao?.[0] ? (
                                            <ul className="space-y-3 text-sm text-slate-700">
                                                <li><strong className="text-slate-500">Mãe:</strong> {alunoSelecionado.filiacao[0].mae || 'N/I'}</li>
                                                <li><strong className="text-slate-500">Pai:</strong> {alunoSelecionado.filiacao[0].pai || 'N/I'}</li>
                                                <li><strong className="text-slate-500">Outro Resp:</strong> {alunoSelecionado.filiacao[0].responsavel || 'N/I'}</li>
                                                <li className="pt-2"><strong className="bg-slate-100 p-2 rounded text-slate-800 block">📞 {alunoSelecionado.filiacao[0].telefoneResponsavel || 'Não cadastrado'}</strong></li>
                                            </ul>
                                        ) : <p className="text-slate-400 text-sm">Sem filiação registrada.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // RENDERIZAÇÃO: NÍVEIS 1 E 2 (Pastas e Busca)
    // ==========================================
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn p-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                <div>
                    {bairroAtivo && (
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1">
                            <span className="cursor-pointer hover:text-blue-500 transition" onClick={() => setBairroAtivo(null)}>Macaé</span>
                            <span>/</span><span className="text-slate-700">{bairroAtivo}</span>
                        </div>
                    )}
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                        {termoBusca ? 'Resultados da Busca' : (bairroAtivo ? `Unidades em ${bairroAtivo}` : 'Consultar Unidades')}
                    </h1>
                </div>
                <div className="flex gap-3">
                    {bairroAtivo && !termoBusca && <button onClick={voltar} className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">Voltar</button>}
                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔍</span>
                        <input type="text" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} placeholder="Buscar escola ou bairro..." className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL (PASTAS) */}
            {carregandoEscolas ? (
                <div className="text-center p-10 font-bold text-slate-500">Sincronizando base de dados...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {termoBusca.trim() !== '' ? (
                        resultadosDaBusca.length === 0 ? (
                            <div className="col-span-full text-center p-16 bg-white border border-dashed border-slate-300 rounded-2xl">
                                <p className="text-slate-500 font-medium">Nenhuma escola ou bairro encontado para "{termoBusca}".</p>
                            </div>
                        ) : (
                            resultadosDaBusca.map((escola) => (
                                <div key={escola.id} onClick={() => abrirEscola(escola.nome)} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all group relative">
                                    <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">{escola.bairro?.nome || 'Macaé'}</span>
                                    <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition"><span className="text-3xl">🏫</span></div>
                                    <h3 className="text-center font-bold text-slate-700 leading-tight group-hover:text-blue-700">{escola.nome}</h3>
                                </div>
                            ))
                        )
                    ) : bairroAtivo ? (
                        escolasDoBairroAtivo.length === 0 ? (
                            <div className="col-span-full text-center p-16 bg-white border border-dashed border-slate-300 rounded-2xl">
                                <p className="text-slate-500 font-medium">Não há escolas cadastradas neste bairro ainda.</p>
                            </div>
                        ) : (
                            escolasDoBairroAtivo.map((escola) => (
                                <div key={escola.id} onClick={() => abrirEscola(escola.nome)} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all group relative">
                                    <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition"><span className="text-3xl">🏫</span></div>
                                    <h3 className="text-center font-bold text-slate-700 leading-tight group-hover:text-blue-700">{escola.nome}</h3>
                                </div>
                            ))
                        )
                    ) : (
                        bairrosUnicos.length === 0 ? (
                            <div className="col-span-full text-center p-16 bg-white border border-dashed border-slate-300 rounded-2xl">
                                <p className="text-slate-500 font-medium">Nenhuma escola encontrada no banco de dados.</p>
                            </div>
                        ) : (
                            bairrosUnicos.map((bairro) => (
                                <div key={bairro} onClick={() => abrirBairro(bairro)} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-start justify-center cursor-pointer shadow-sm hover:shadow-md hover:border-slate-400 hover:-translate-y-1 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-5xl group-hover:scale-110 transition-transform">📁</div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{bairro}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">
                                                {escolas.filter(e => { const b = e.bairro?.nome ? e.bairro.nome : 'Outras Unidades'; return b === bairro; }).length} Unidade(s)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            )}
        </div>
    );
}