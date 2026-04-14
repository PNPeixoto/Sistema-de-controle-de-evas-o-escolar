import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';

export default function PainelSemed() {
    const [alunosBrutos, setAlunosBrutos] = useState<any[]>([]);
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
            const resp = await api.get('/semed/alunos/todos');
            setAlunosBrutos(resp.data);
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
        const gerarRanking = (extrator: (aluno: any) => string) => {
            const contagem: Record<string, number> = {};
            filtrados.forEach(a => {
                const chave = extrator(a);
                contagem[chave] = (contagem[chave] || 0) + 1;
            });
            return Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 6); // Top 6
        };

        // 3. Listas para os Selects (Filtros)
        const todosEvasivos = alunosBrutos.filter(a => a.historicoEvasao && a.historicoEvasao.length > 0);
        const bairros = Array.from(new Set(todosEvasivos.map(a => a.enderecos?.[0]?.bairro || 'Sem Bairro'))).sort();
        const escolaridades = Array.from(new Set(todosEvasivos.map(a => a.escolaridade))).sort();

        return {
            alunosComEvasaoFiltrados: filtrados,
            totalEvasoes: filtrados.length,
            rankingEscolas: gerarRanking(a => a.escola),
            rankingBairros: gerarRanking(a => a.enderecos?.[0]?.bairro || 'Não Informado'),
            rankingCor: gerarRanking(a => a.cor || 'Não Declarada'),
            bairrosDisponiveis: bairros as string[],
            escolaridadesDisponiveis: escolaridades as string[]
        };
    }, [alunosBrutos, filtroBairro, filtroEscolaridade]);


    // COMPONENTE: Gráfico de Barras Horizontal (Feito com Tailwind)
    const BarChart = ({ titulo, dados, totalMax, icone, corBg, corBarra }: any) => (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full`}>
            <div className="flex items-center gap-2 mb-6">
                <span className={`p-2 rounded-lg ${corBg}`}>{icone}</span>
                <h3 className="text-lg font-bold text-slate-800">{titulo}</h3>
            </div>

            {dados.length === 0 ? (
                <div className="text-center text-slate-400 my-auto text-sm">Sem dados para este filtro.</div>
            ) : (
                <div className="space-y-4 w-full">
                    {dados.map(([label, valor]: any) => {
                        const porcentagem = totalMax > 0 ? (valor / totalMax) * 100 : 0;
                        return (
                            <div key={label} className="w-full">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold text-slate-700 truncate pr-2 max-w-[75%]">{label}</span>
                                    <span className="font-bold text-slate-900">{valor}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div className={`${corBarra} h-2.5 rounded-full transition-all duration-1000 ease-out`} style={{ width: `${porcentagem}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    if (carregando) return <div className="p-10 text-center text-slate-500 font-bold animate-pulse">⚙️ Processando o Cubo de Dados da SEMED...</div>;

    return (
        <div className="space-y-6 animate-fadeIn p-2 md:p-4">

            {/* CABEÇALHO E FILTROS */}
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                            📊 Inteligência de Evasão
                        </h2>
                        <p className="text-slate-400 mt-1">Análise cruzada de vulnerabilidade na rede.</p>
                    </div>

                    <button onClick={baixarExcel} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 rounded-xl font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm uppercase tracking-wide">
                        ⬇ Exportar CSV
                    </button>
                </div>

                {/* BARRA DE FILTROS CRUZADOS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 mt-4 border-t border-slate-700/50 pt-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Filtrar por Bairro</label>
                        <select value={filtroBairro} onChange={e => setFiltroBairro(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                            <option value="">🗺️ Todos os Bairros</option>
                            {bairrosDisponiveis.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Filtrar por Etapa</label>
                        <select value={filtroEscolaridade} onChange={e => setFiltroEscolaridade(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                            <option value="">📚 Todas as Etapas</option>
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
                <BarChart
                    titulo="Top 6 - Escolas Críticas"
                    dados={rankingEscolas}
                    totalMax={rankingEscolas[0]?.[1] || 0} // Usa o maior valor como 100% da barra
                    icone="🏫" corBg="bg-blue-100" corBarra="bg-blue-500"
                />

                <BarChart
                    titulo="Top 6 - Bairros Críticos"
                    dados={rankingBairros}
                    totalMax={rankingBairros[0]?.[1] || 0}
                    icone="🗺️" corBg="bg-red-100" corBarra="bg-red-500"
                />

                <BarChart
                    titulo="Perfil por Cor/Raça"
                    dados={rankingCor}
                    totalMax={totalEvasoes} // Aqui usa o total de evasões como 100%
                    icone="👤" corBg="bg-amber-100" corBarra="bg-amber-500"
                />
            </div>
        </div>
    );
}