import { useState, useEffect } from 'react';
import { api } from '../../services/api';

// ==========================================
// INTERFACES (TYPESCRIPT)
// ==========================================
interface Estatisticas {
    matriculados: number;
    infrequentes: number;
    ficaisAbertas: number;
    visitasPendentes: number;
}

export default function DashboardHome() {
    const escolaLogada = localStorage.getItem('escolaNome') || 'Rede Municipal';
    const cargoLogado = localStorage.getItem('cargo') || 'ESCOLA';

    // ==========================================
    // ESTADO ÚNICO: Estatísticas
    // ==========================================
    const [loading, setLoading] = useState(true);
    const [estatisticas, setEstatisticas] = useState<Estatisticas>({
        matriculados: 0,
        infrequentes: 0,
        ficaisAbertas: 0,
        visitasPendentes: 0
    });

    useEffect(() => {
        carregarDadosEstatisticos();
    }, [cargoLogado]);

    // ==========================================
    // LÓGICA DE CALCULO (Frontend temporário)
    // ==========================================
    const carregarDadosEstatisticos = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            let respostaAlunos;

            // Define a rota baseada no cargo
            if (cargoLogado === 'SEMED') {
                // Rota correta que mapeia para o SemedController.java no Back-end
                respostaAlunos = await api.get('/semed/alunos/todos', { headers: { Authorization: `Bearer ${token}` } });
            } else {
                respostaAlunos = await api.get(`/aluno/escola/${encodeURIComponent(escolaLogada)}`, { headers: { Authorization: `Bearer ${token}` } });
            }

            // BLINDAGEM: Garante que os dados são um array
            const alunos = Array.isArray(respostaAlunos.data) ? respostaAlunos.data : [];

            // Cálculos
            const totalMatriculados = alunos.length;
            let totalInfrequentes = 0;
            // NOTE: FICAIs e Visitas dependem da implementação do banco,
            // por enquanto usaremos placeholders baseados na infrequência.

            alunos.forEach((aluno: any) => {
                if (aluno.historicoEvasao && aluno.historicoEvasao.length > 0) {
                    totalInfrequentes++;
                }
            });

            // Atualiza o estado com as estatísticas reais calculadas
            setEstatisticas({
                matriculados: totalMatriculados,
                infrequentes: totalInfrequentes,
                ficaisAbertas: totalInfrequentes, // Exemplo temporário
                visitasPendentes: 0 // Placeholder
            });

        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // RENDERIZAÇÃO (Layout adaptado do Print)
    // ==========================================
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn p-4">
            {/* CABEÇALHO */}
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Visão Geral</h1>
                <p className="text-slate-500 mt-1 text-lg">
                    {cargoLogado === 'SEMED'
                        ? 'Painel Gerencial da Rede Municipal de Ensino de Macaé.'
                        : `Bem-vindo(a) ao painel de controle da ${escolaLogada}.`}
                </p>
            </div>

            {/* GRID DE CARDS ESTATÍSTICOS (Estilo Print) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* CARD 1: Alunos Registrados */}
                <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 group hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Alunos Registrados</p>
                        <span className="text-2xl opacity-70 group-hover:opacity-100 transition">👥</span>
                    </div>
                    <p className="text-5xl font-black text-slate-900 mt-4 tracking-tighter">
                        {loading ? '...' : estatisticas.matriculados.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-green-600 font-medium mt-1">Ativos no sistema</p>
                </div>

                {/* CARD 2: Alunos Infrequentes */}
                <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 group hover:border-red-300 transition-colors">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Alunos Infrequentes</p>
                        <span className="text-2xl opacity-70 group-hover:opacity-100 transition">🚨</span>
                    </div>
                    <p className="text-5xl font-black text-red-600 mt-4 tracking-tighter">
                        {loading ? '...' : estatisticas.infrequentes.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-red-500 font-medium mt-1">Necessitam atenção</p>
                </div>

                {/* CARD 3: FICAIs Abertas */}
                <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 group hover:border-yellow-300 transition-colors">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">FICAIs Abertas</p>
                        <span className="text-2xl opacity-70 group-hover:opacity-100 transition">📋</span>
                    </div>
                    <p className="text-5xl font-black text-slate-900 mt-4 tracking-tighter">
                        {loading ? '...' : estatisticas.ficaisAbertas.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-yellow-600 font-medium mt-1">Fichas em andamento</p>
                </div>

                {/* CARD 4: Visitas Pendentes */}
                <div className="bg-white p-7 rounded-2xl shadow-sm border border-slate-200 group hover:border-green-300 transition-colors">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Visitas Domiciliares</p>
                        <span className="text-2xl opacity-70 group-hover:opacity-100 transition">🏠</span>
                    </div>
                    <p className="text-5xl font-black text-slate-900 mt-4 tracking-tighter">
                        {loading ? '...' : estatisticas.visitasPendentes.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-sm text-slate-500 font-medium mt-1">Aguardando registro</p>
                </div>

            </div>

            {/* SEÇÃO DE ÚLTIMAS ATIVIDADES (Placeholder - Mantida para estrutura) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
                    📋 Últimas FICAIs Movimentadas
                </h2>

                <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                    <svg className="w-16 h-16 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <p className="font-bold text-lg">Histórico de Atividades</p>
                    <p className="text-sm mt-1">O feed de registros recentes aparecerá aqui em breve.</p>
                </div>
            </div>

        </div>
    );
}