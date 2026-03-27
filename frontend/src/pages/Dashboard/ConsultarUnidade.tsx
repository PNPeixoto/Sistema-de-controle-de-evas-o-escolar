import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';

// ==========================================
// INTERFACES
// ==========================================
interface Bairro {
    id: number;
    nome: string;
}

interface Escola {
    id: number;
    nome: string;
    bairro?: Bairro;
}

interface Aluno {
    id: number;
    nomeCompleto: string;
    escolaridade: string;
    historicoEvasao: any[];
}

export default function ConsultarUnidade() {
    const [escolas, setEscolas] = useState<Escola[]>([]);
    const [carregandoEscolas, setCarregandoEscolas] = useState(true);

    // ESTADOS DE NAVEGAÇÃO E BUSCA
    const [termoBusca, setTermoBusca] = useState('');
    const [bairroAtivo, setBairroAtivo] = useState<string | null>(null);
    const [escolaAtiva, setEscolaAtiva] = useState<string | null>(null);

    // ESTADOS DE ALUNOS
    const [alunosSemed, setAlunosSemed] = useState<Aluno[]>([]);
    const [carregandoAlunos, setCarregandoAlunos] = useState(false);

    useEffect(() => {
        carregarTodasAsEscolas();
    }, []);

    const carregarTodasAsEscolas = async () => {
        try {
            setCarregandoEscolas(true);
            const token = localStorage.getItem('token');
            const resposta = await api.get('/escolas', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEscolas(Array.isArray(resposta.data) ? resposta.data : []);
        } catch (error) {
            console.error("Erro ao carregar escolas:", error);
        } finally {
            setCarregandoEscolas(false);
        }
    };

    const abrirBairro = (nomeBairro: string) => {
        setBairroAtivo(nomeBairro);
        setTermoBusca('');
    };

    const abrirEscola = async (nomeEscola: string) => {
        try {
            setCarregandoAlunos(true);
            const token = localStorage.getItem('token');
            const resposta = await api.get(`/aluno/escola/${encodeURIComponent(nomeEscola)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAlunosSemed(Array.isArray(resposta.data) ? resposta.data : []);
            setEscolaAtiva(nomeEscola);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
            alert("Erro ao acessar dados da escola.");
        } finally {
            setCarregandoAlunos(false);
        }
    };

    const voltar = () => {
        if (escolaAtiva) {
            setEscolaAtiva(null);
            setAlunosSemed([]);
        } else if (bairroAtivo) {
            setBairroAtivo(null);
        }
    };

    // ==========================================
    // LÓGICA DE AGRUPAMENTO (AGORA BLINDADA)
    // ==========================================

    // 1. Cria as pastas. Se a escola não tiver bairro, vai para "Outras Unidades"
    const bairrosUnicos = useMemo(() => {
        if (escolas.length === 0) return [];
        const nomesBairros = escolas.map(e => e.bairro?.nome ? e.bairro.nome : 'Outras Unidades');
        return Array.from(new Set(nomesBairros)).sort();
    }, [escolas]);

    // 2. Filtro de Busca
    const resultadosDaBusca = useMemo(() => {
        if (!termoBusca.trim()) return [];
        const termo = termoBusca.toLowerCase();

        return escolas.filter(e =>
            e.nome.toLowerCase().includes(termo) ||
            (e.bairro && e.bairro.nome.toLowerCase().includes(termo))
        );
    }, [escolas, termoBusca]);

    // 3. Mostra as escolas da pasta clicada
    const escolasDoBairroAtivo = useMemo(() => {
        if (!bairroAtivo) return [];
        return escolas.filter(e => {
            const nomeBairroDaEscola = e.bairro?.nome ? e.bairro.nome : 'Outras Unidades';
            return nomeBairroDaEscola === bairroAtivo;
        });
    }, [escolas, bairroAtivo]);


    // ==========================================
    // RENDERIZAÇÃO: NÍVEL 3 (Alunos)
    // ==========================================
    if (escolaAtiva) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn p-4">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-2">
                            <span>Macaé</span>
                            <span>/</span>
                            <span>{bairroAtivo || 'Busca'}</span>
                            <span>/</span>
                            <span className="text-blue-500">{escolaAtiva}</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{escolaAtiva}</h2>
                        <p className="text-slate-500 text-sm mt-1">Alunos matriculados e registros de frequência.</p>
                    </div>
                    <button onClick={voltar} className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition shadow-sm">
                        ← Voltar
                    </button>
                </div>

                {carregandoAlunos ? (
                    <div className="text-center p-10 font-bold text-slate-500">Carregando alunos...</div>
                ) : alunosSemed.length === 0 ? (
                    <div className="text-center p-16 bg-white rounded-2xl border border-slate-200">
                        <p className="text-slate-500 font-medium">Nenhum aluno registrado nesta unidade escolar até o momento.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="min-w-full leading-normal text-left">
                            <thead>
                            <tr className="bg-slate-50">
                                <th className="px-5 py-4 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">Nome</th>
                                <th className="px-5 py-4 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">Escolaridade</th>
                                <th className="px-5 py-4 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {alunosSemed.map(aluno => (
                                <tr key={aluno.id} className="hover:bg-slate-50 transition">
                                    <td className="px-5 py-4 border-b border-slate-200 text-sm font-medium">{aluno.nomeCompleto}</td>
                                    <td className="px-5 py-4 border-b border-slate-200 text-sm text-slate-600">{aluno.escolaridade}</td>
                                    <td className="px-5 py-4 border-b border-slate-200">
                                        {aluno.historicoEvasao && aluno.historicoEvasao.length > 0
                                            ? <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">🚨 Infrequente</span>
                                            : <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">✅ Regular</span>}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
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
                            <span>/</span>
                            <span className="text-slate-700">{bairroAtivo}</span>
                        </div>
                    )}

                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                        {termoBusca ? 'Resultados da Busca' : (bairroAtivo ? `Unidades em ${bairroAtivo}` : 'Consultar Unidades')}
                    </h1>

                    <p className="text-slate-500 mt-1">
                        {termoBusca
                            ? `Exibindo escolas correspondentes a "${termoBusca}"`
                            : (bairroAtivo ? 'Selecione uma escola para ver os alunos.' : 'Navegue pelos bairros ou digite para buscar.')}
                    </p>
                </div>

                <div className="flex gap-3">
                    {bairroAtivo && !termoBusca && (
                        <button onClick={voltar} className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition">
                            Voltar
                        </button>
                    )}

                    <div className="relative w-full md:w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">🔍</span>
                        <input
                            type="text"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            placeholder="Buscar escola ou bairro..."
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
                        />
                    </div>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            {carregandoEscolas ? (
                <div className="text-center p-10 font-bold text-slate-500">Sincronizando base de dados...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                    {/* ESTADO A: BUSCA ATIVA */}
                    {termoBusca.trim() !== '' ? (
                            resultadosDaBusca.length === 0 ? (
                                <div className="col-span-full text-center p-16 bg-white border border-dashed border-slate-300 rounded-2xl">
                                    <p className="text-slate-500 font-medium">Nenhuma escola ou bairro encontado para "{termoBusca}".</p>
                                </div>
                            ) : (
                                resultadosDaBusca.map((escola) => (
                                    <div key={escola.id} onClick={() => abrirEscola(escola.nome)} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all group relative">
                                    <span className="absolute top-3 right-3 text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded">
                                        {escola.bairro?.nome || 'Macaé'}
                                    </span>
                                        <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition">
                                            <span className="text-3xl">🏫</span>
                                        </div>
                                        <h3 className="text-center font-bold text-slate-700 leading-tight group-hover:text-blue-700">{escola.nome}</h3>
                                    </div>
                                ))
                            )
                        ) :

                        /* ESTADO B: NAVEGAÇÃO POR BAIRRO */
                        bairroAtivo ? (
                        escolasDoBairroAtivo.length === 0 ? (
                        <div className="col-span-full text-center p-16 bg-white border border-dashed border-slate-300 rounded-2xl">
                        <p className="text-slate-500 font-medium">Não há escolas cadastradas neste bairro ainda.</p>
                        </div>
                        ) : (
                        escolasDoBairroAtivo.map((escola) => (
                        <div key={escola.id} onClick={() => abrirEscola(escola.nome)} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer shadow-sm hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all group relative">
                    <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition">
                        <span className="text-3xl">🏫</span>
                    </div>
                    <h3 className="text-center font-bold text-slate-700 leading-tight group-hover:text-blue-700">{escola.nome}</h3>
                </div>
            ))
                )
                ) :

            /* ESTADO C: TELA INICIAL (PASTAS) */
                (
                bairrosUnicos.length === 0 ? (
                <div className="col-span-full text-center p-16 bg-white border border-dashed border-slate-300 rounded-2xl">
                <p className="text-slate-500 font-medium">Nenhuma escola encontrada no banco de dados.</p>
                </div>
                ) : (
                bairrosUnicos.map((bairro) => (
                <div key={bairro} onClick={() => abrirBairro(bairro)} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-start justify-center cursor-pointer shadow-sm hover:shadow-md hover:border-slate-400 hover:-translate-y-1 transition-all group">
            <div className="flex items-center gap-4">
                <div className="text-5xl group-hover:scale-110 transition-transform">
                    📁
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{bairro}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">
                        {escolas.filter(e => {
                            const b = e.bairro?.nome ? e.bairro.nome : 'Outras Unidades';
                            return b === bairro;
                        }).length} Unidade(s)
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