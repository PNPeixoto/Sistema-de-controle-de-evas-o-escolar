import type { ReactNode } from 'react';

export type RankingEntry = [string, number];

interface BarChartSimplesProps {
    titulo: string;
    dados: RankingEntry[];
    totalMax: number;
    icone: ReactNode;
    corBg: string;
    corBarra: string;
}

export default function BarChartSimples({
    titulo, dados, totalMax, icone, corBg, corBarra
}: BarChartSimplesProps) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
                <span className={`p-2 rounded-lg ${corBg}`}>{icone}</span>
                <h3 className="text-lg font-bold text-slate-800">{titulo}</h3>
            </div>
            {dados.length === 0 ? (
                <div className="text-center text-slate-400 my-auto text-sm">Sem dados para este filtro.</div>
            ) : (
                <div className="space-y-4 w-full">
                    {dados.map(([label, valor]) => {
                        const porcentagem = totalMax > 0 ? (valor / totalMax) * 100 : 0;
                        return (
                            <div key={label} className="w-full">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold text-slate-700 truncate pr-2 max-w-[75%]">{label}</span>
                                    <span className="font-bold text-slate-900">{valor}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                    <div
                                        className={`${corBarra} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${porcentagem}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
