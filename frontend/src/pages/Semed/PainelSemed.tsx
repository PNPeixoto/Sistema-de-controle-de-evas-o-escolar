import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function PainelSemed() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const carregarStats = async () => {
            const token = localStorage.getItem('token');
            const resp = await api.get('/semed/estatisticas', { headers: { Authorization: `Bearer ${token}` } });
            setStats(resp.data);
        };
        carregarStats();
    }, []);

    const baixarExcel = async () => {
        const token = localStorage.getItem('token');
        const resp = await api.get('/semed/exportar', {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([resp.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Relatorio_Evasao_Macaé.csv');
        document.body.appendChild(link);
        link.click();
    };

    // Componente reutilizável para renderizar as caixinhas de Ranking
    const RankingCard = ({ titulo, dados, cor, sufixo = '' }: any) => (
        <div className={`bg-white p-5 rounded-xl shadow-sm border-t-4 border-${cor}-500`}>
            <h3 className={`text-lg font-bold text-${cor}-700 mb-4`}>{titulo}</h3>
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {Object.entries(dados).sort((a: any, b: any) => b[1] - a[1]).map(([chave, qtd]: any) => (
                    <li key={chave} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="font-semibold text-slate-600 text-sm">{chave} {sufixo}</span>
                        <span className={`font-bold text-white bg-${cor}-500 px-2 py-0.5 rounded-full text-xs shadow-sm`}>{qtd} FICAIs</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    if (!stats) return <div className="p-8 text-center text-slate-500 font-bold">Carregando processamento de dados...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">

            {/* CABEÇALHO DO PAINEL */}
            <div className="bg-slate-900 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center shadow-lg relative overflow-hidden">
                <div className="relative z-10 text-center md:text-left mb-4 md:mb-0">
                    <h2 className="text-3xl font-black text-white">Centro de Inteligência</h2>
                    <p className="text-blue-300 mt-1">Visão global da evasão escolar na rede municipal</p>
                </div>
                <button onClick={baixarExcel} className="relative z-10 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Exportar Planilha Excel
                </button>
            </div>

            {/* GRADES DOS FILTROS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <RankingCard titulo="🚨 Bairros em Alerta" dados={stats.rankingBairros} cor="red" />
                <RankingCard titulo="📍 Evasão por Escola" dados={stats.rankingEscolas} cor="blue" />
                <RankingCard titulo="🎂 Faixa Etária (Idade)" dados={stats.rankingIdades} cor="orange" sufixo="anos" />
                <RankingCard titulo="📚 Por Escolaridade" dados={stats.rankingEscolaridade} cor="purple" />
                <RankingCard titulo="👤 Perfil (Cor/Raça)" dados={stats.rankingCor} cor="amber" />
            </div>

        </div>
    );
}