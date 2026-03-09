import { useState, useEffect } from 'react';
import { api } from '../../services/api';



interface Aluno {
    id: number;
    nomeCompleto: string;
    escolaridade: string;
    turno: string;
    aee: boolean;
    dataNascimento: string;
}

export default function ConsultarAluno() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const escolaLogada = localStorage.getItem('escolaNome') || '';

    useEffect(() => {
        buscarAlunos();
    }, []);

    const buscarAlunos = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token || !escolaLogada) {
                setErro('Sessão expirada ou escola não identificada. Faça login novamente.');
                setCarregando(false);
                return;
            }

            // Usamos encodeURIComponent porque o nome da escola tem espaços (ex: "C.M. Machado")
            const url = `/aluno/escola/${encodeURIComponent(escolaLogada)}`;

            const resposta = await api.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAlunos(resposta.data);
            setErro('');
        } catch (error: any) {
            console.error(error);
            setErro('Erro ao buscar a lista de alunos. Verifique a conexão com o servidor.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-6xl mx-auto animate-fadeIn">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Alunos Matriculados</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Exibindo alunos da unidade: <span className="font-semibold text-blue-600">{escolaLogada}</span>
                    </p>
                </div>
                <button
                    onClick={buscarAlunos}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition font-medium flex items-center gap-2"
                >
                    ↻ Atualizar Lista
                </button>
            </div>

            {carregando ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : erro ? (
                <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 text-center font-medium">
                    {erro}
                </div>
            ) : alunos.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">Nenhum aluno matriculado nesta unidade ainda.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                            <th className="p-4 border-b font-semibold rounded-tl-lg">Nome do Aluno</th>
                            <th className="p-4 border-b font-semibold">Série / Escolaridade</th>
                            <th className="p-4 border-b font-semibold">Turno</th>
                            <th className="p-4 border-b font-semibold text-center">AEE</th>
                            <th className="p-4 border-b font-semibold text-center rounded-tr-lg">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {alunos.map((aluno) => (
                            <tr key={aluno.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 text-slate-800 font-medium">{aluno.nomeCompleto}</td>
                                <td className="p-4 text-slate-600">{aluno.escolaridade}</td>
                                <td className="p-4 text-slate-600">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm font-medium">
                                            {aluno.turno}
                                        </span>
                                </td>
                                <td className="p-4 text-center">
                                    {aluno.aee ? (
                                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">SIM</span>
                                    ) : (
                                        <span className="text-slate-400 text-sm">-</span>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                                        onClick={() => alert(`Futuramente abrirá os detalhes do ID: ${aluno.id}`)}
                                    >
                                        Ver Detalhes
                                    </button>
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