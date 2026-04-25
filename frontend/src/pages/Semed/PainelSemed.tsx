import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import BarChartSimples, { type RankingEntry } from './BarChartSimples';
import { normalizeCollection, type CollectionResponse } from '../../utils/http';

const CORES = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'];

interface AlunoBI {
    escola?: string;
    escolaridade?: string;
    cor?: string;
    enderecos?: { bairro?: string }[];
    historicoEvasao?: unknown[];
}

export default function PainelSemed() {
    const [alunosBrutos, setAlunosBrutos] = useState<AlunoBI[]>([]);
    const [carregando, setCarregando] = useState(true);

    // Filtros de cruzamento (PowerBI style)
    const [filtroBairro, setFiltroBairro] = useState('');
    const [filtroEscolaridade, setFiltroEscolaridade] = useState('');

    useEffect(() => {
        carregarBaseCompleta();
    }, []);

    const carregarBaseCompleta = async () => {
        try {
            setCarregando(true);
            const resp = await api.get<CollectionResponse<AlunoBI>>('/semed/alunos/todos');
            setAlunosBrutos(normalizeCollection(resp.data));
        } catch (error) {
            console.error("Erro ao puxar dados para o BI:", error);
        } finally {
            setCarregando(false);
        }
    };

    const baixarExcel = async () => {
        const resp = await api.get('/semed/exportar', { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([resp.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Inteligencia_Evasao_Macaé.csv');
        document.body.appendChild(link);
        link.click();
    };

    // ========================================================
    // MOTOR DE INTELIGÊNCIA (Cruza os dados em tempo real)
    // ========================================================
    const {
        totalEvasoes,
        rankingEscolas,
        rankingBairros,
        rankingCor,
        chartEscolas,
        chartBairros,
        chartCor,
        bairrosDisponiveis,
        escolaridadesDisponiveis
    } = useMemo(() => {

        // 1. Isola só quem tem evasão e aplica os filtros da tela
        const filtrados = alunosBrutos.filter(a => {
            const temEvasao = a.historicoEvasao && a.historicoEvasao.length > 0;
            if (!temEvasao) return false;

            const bairroDoAluno = a.enderecos?.[0]?.bairro || 'Sem Bairro';
            if (filtroBairro && bairroDoAluno !== filtroBairro) return false;
            if (filtroEscolaridade && a.escolaridade !== filtroEscolaridade) return false;

            return true;
        });

        // 2. Extrator genérico para os Rankings (Gráficos de Barra)
        const gerarRanking = (extrator: (aluno: AlunoBI) => string): RankingEntry[] => {
            const contagem: Record<string, number> = {};
            filtrados.forEach(a => {
                const chave = extrator(a);
                contagem[chave] = (contagem[chave] || 0) + 1;
            });
            return Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 6); // Top 6
        };

        const gerarRankingCompleto = (extrator: (aluno: AlunoBI) => string): RankingEntry[] => {
            const contagem: Record<string, number> = {};
            filtrados.forEach(a => {
                const chave = extrator(a);
                contagem[chave] = (contagem[chave] || 0) + 1;
            });
            return Object.entries(contagem).sort((a, b) => b[1] - a[1]);
        };

        // 3. Listas para os Selects (Filtros)
        const todosEvasivos = alunosBrutos.filter(a => a.historicoEvasao && a.historicoEvasao.length > 0);
        const bairros = Array.from(new Set(todosEvasivos.map(a => a.enderecos?.[0]?.bairro || 'Sem Bairro'))).sort();
        const escolaridades = Array.from(new Set(todosEvasivos.map(a => a.escolaridade || 'Nao Informada'))).sort();

        return {
            alunosComEvasaoFiltrados: filtrados,
            totalEvasoes: filtrados.length,
            rankingEscolas: gerarRanking(a => a.escola || 'Nao Informada'),
            rankingBairros: gerarRanking(a => a.enderecos?.[0]?.bairro || 'Não Informado'),
            rankingCor: gerarRanking(a => a.cor || 'Não Declarada'),
            chartEscolas: gerarRankingCompleto(a => a.escola || 'Nao Informada').slice(0, 10).map(([nome, qtd]) => ({ nome: nome.length > 25 ? nome.substring(0, 25) + '…' : nome, qtd })),
            chartBairros: gerarRankingCompleto(a => a.enderecos?.[0]?.bairro || 'Não Informado').slice(0, 10).map(([nome, qtd]) => ({ nome, qtd })),
            chartCor: gerarRankingCompleto(a => a.cor || 'Não Declarada').map(([name, value]) => ({ name, value })),
            bairrosDisponiveis: bairros as string[],
            escolaridadesDisponiveis: escolaridades as string[]
        };
    }, [alunosBrutos, filtroBairro, filtroEscolaridade]);


    if (carregando) return <div className="p-10 text-center text-slate-500 font-bold animate-pulse">⚙️ Processando o Cubo de Dados da SEMED...</div>;

    return (
        <div className="space-y-6 animate-fadeIn p-2 md:p-4">

            {/* CABEÇALHO E FILTROS */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            <span aria-hidden="true">📊</span> Inteligência de Evasão
                        </h2>
                        <p className="text-slate-400 mt-1">Análise cruzada de vulnerabilidade na rede.</p>
                    </div>

                    <button onClick={baixarExcel} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 rounded-xl font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm uppercase tracking-wide">
                        <span aria-hidden="true">⬇</span> Exportar CSV
                    </button>
                </div>

                {/* BARRA DE FILTROS CRUZADOS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 mt-4 border-t border-slate-700/50 pt-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Filtrar por Bairro</label>
                        <select value={filtroBairro} onChange={e => setFiltroBairro(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                            <option value="">Todos os Bairros</option>
                            {bairrosDisponiveis.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Filtrar por Etapa</label>
                        <select value={filtroEscolaridade} onChange={e => setFiltroEscolaridade(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                            <option value="">Todas as Etapas</option>
                            {escolaridadesDisponiveis.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-3 flex justify-between items-center h-[50px]">
                            <span className="text-blue-200 font-semibold text-sm">FICAIs no Filtro Atual:</span>
                            <span className="text-2xl font-black text-white">{totalEvasoes}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* DASHBOARD GRID (GRÁFICOS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <BarChartSimples
                    titulo="Top 6 - Escolas Críticas"
                    dados={rankingEscolas}
                    totalMax={rankingEscolas[0]?.[1] || 0} // Usa o maior valor como 100% da barra
                    icone="🏫" corBg="bg-blue-100" corBarra="bg-blue-500"
                />

                <BarChartSimples
                    titulo="Top 6 - Bairros Críticos"
                    dados={rankingBairros}
                    totalMax={rankingBairros[0]?.[1] || 0}
                    icone="🗺️" corBg="bg-red-100" corBarra="bg-red-500"
                />

                <BarChartSimples
                    titulo="Perfil por Cor/Raça"
                    dados={rankingCor}
                    totalMax={totalEvasoes} // Aqui usa o total de evasões como 100%
                    icone="👤" corBg="bg-amber-100" corBarra="bg-amber-500"
                />
            </div>

            {/* GRÁFICOS DETALHADOS (RECHARTS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Top 10 Escolas — Evasões Registradas</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartEscolas} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis type="category" dataKey="nome" width={160} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="qtd" fill="#2563EB" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Distribuição por Cor/Raça</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={chartCor}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={110}
                                    label={(props: unknown) => {
                                        const { name, percent } = props as { name?: string; percent?: number };
                                        return `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`;
                                    }}
                                >
                                    {chartCor.map((_, idx) => (
                                        <Cell key={idx} fill={CORES[idx % CORES.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Top 10 Bairros — Concentração de Evasões</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartBairros} margin={{ bottom: 60 }}>
                                <XAxis dataKey="nome" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11 }} height={80} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="qtd" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
