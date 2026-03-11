import { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Aluno {
    id: number;
    nomeCompleto: string;
    escolaridade: string;
}

export default function RegistrarEvasao() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [carregandoAlunos, setCarregandoAlunos] = useState(true);
    const [salvando, setSalvando] = useState(false);

    const escolaLogada = localStorage.getItem('escolaNome') || '';

    // Estados básicos
    const [alunoId, setAlunoId] = useState('');
    const [mesFaltas, setMesFaltas] = useState('');
    const [quantidadeFaltas, setQuantidadeFaltas] = useState('');

    // Estado do Motivo
    const [motivoAfastamento, setMotivoAfastamento] = useState('');
    const [motivoOutros, setMotivoOutros] = useState(''); // Campo condicional

    // Estados dos Laudos
    const [encaminhamentos, setEncaminhamentos] = useState('');
    const [conclusao, setConclusao] = useState('');

    // Lista dinâmica de Ações Tomadas
    const dataHoje = new Date().toISOString().split('T')[0];
    const [acoes, setAcoes] = useState([
        { dataAcao: dataHoje, tipoAcao: '', acaoOutros: '' }
    ]);

    // Nomes ordinais para a interface
    const ordinais = ['Primeira', 'Segunda', 'Terceira', 'Quarta', 'Quinta', 'Sexta', 'Sétima', 'Oitava'];

    useEffect(() => {
        const buscarAlunos = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !escolaLogada) return;

                const url = `/aluno/escola/${encodeURIComponent(escolaLogada)}`;
                const resposta = await api.get(url, { headers: { Authorization: `Bearer ${token}` } });
                setAlunos(resposta.data);
            } catch (error) {
                console.error("Erro ao carregar alunos", error);
            } finally {
                setCarregandoAlunos(false);
            }
        };
        buscarAlunos();
    }, [escolaLogada]);

    const adicionarAcao = () => {
        setAcoes([...acoes, { dataAcao: dataHoje, tipoAcao: '', acaoOutros: '' }]);
    };

    const handleAcaoChange = (index: number, campo: string, valor: string) => {
        const novasAcoes = [...acoes];
        novasAcoes[index] = { ...novasAcoes[index], [campo]: valor };
        setAcoes(novasAcoes);
    };

    const removerAcao = (indexParaRemover: number) => {
        if (acoes.length === 1) return;
        setAcoes(acoes.filter((_, index) => index !== indexParaRemover));
    };

    const handleSalvarEvasao = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!alunoId) {
            alert("Por favor, selecione um aluno!");
            return;
        }

        const acoesInvalidas = acoes.some(acao => !acao.tipoAcao);
        if (acoesInvalidas) {
            alert("Por favor, selecione o tipo de ação em todas as ações adicionadas.");
            return;
        }

        setSalvando(true);

        // Prepara o motivo: Se for "Outros, quais?", junta o texto digitado.
        const motivoFinal = motivoAfastamento === 'Outros, quais?'
            ? `Outros: ${motivoOutros}`
            : motivoAfastamento;

        // Formata as ações
        const acoesFormatadas = acoes.map(acao => {
            const [ano, mes, dia] = acao.dataAcao.split('-');
            const acaoTomadaFinal = acao.tipoAcao === 'Outros, quais?'
                ? `Outros: ${acao.acaoOutros}`
                : acao.tipoAcao;

            return {
                dataAcao: `${dia}/${mes}/${ano}`,
                acaoTomada: acaoTomadaFinal
            };
        });

        const payload = {
            mesFaltas: mesFaltas,
            quantidadeFaltas: Number(quantidadeFaltas),
            motivoAfastamento: motivoFinal,
            encaminhamentosLaudos: encaminhamentos,
            conclusao: conclusao,
            acoes: acoesFormatadas
        };

        try {
            const token = localStorage.getItem('token');
            await api.post(`/evasao/${alunoId}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Alerta de Evasão registrado com sucesso! O dossiê foi salvo.');

            // Reseta tudo para o estado inicial
            setAlunoId('');
            setMesFaltas('');
            setQuantidadeFaltas('');
            setEncaminhamentos('');
            setConclusao('');
            setMotivoAfastamento('');
            setMotivoOutros('');
            setAcoes([{ dataAcao: dataHoje, tipoAcao: '', acaoOutros: '' }]);

        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Erro ao registrar evasão. Verifique o console.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-4xl mx-auto animate-fadeIn mb-10">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
                <div className="bg-red-100 p-3 rounded-full"><span className="text-2xl">🚨</span></div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dossiê de Evasão Escolar</h2>
                    <p className="text-slate-500 text-sm">Preencha os dados completos para a auditoria do município.</p>
                </div>
            </div>

            <form onSubmit={handleSalvarEvasao} className="space-y-6">

                {/* 1. SELEÇÃO DO ALUNO */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Aluno(a) em Situação de Evasão *</label>
                    <select
                        required
                        value={alunoId}
                        onChange={e => setAlunoId(e.target.value)}
                        disabled={carregandoAlunos}
                        className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 outline-none bg-white"
                    >
                        <option value="" disabled>
                            {carregandoAlunos ? 'Carregando lista de alunos...' : '--- Selecione o aluno matriculado ---'}
                        </option>
                        {alunos.map(aluno => (
                            <option key={aluno.id} value={aluno.id}>{aluno.nomeCompleto} ({aluno.escolaridade})</option>
                        ))}
                    </select>
                </div>

                {/* 2. DADOS DA AUSÊNCIA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mês das Faltas *</label>
                        <select
                            required
                            value={mesFaltas}
                            onChange={e => setMesFaltas(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 outline-none bg-white"
                        >
                            <option value="" disabled>Selecione o mês...</option>
                            <option value="Janeiro">Janeiro</option>
                            <option value="Fevereiro">Fevereiro</option>
                            <option value="Março">Março</option>
                            <option value="Abril">Abril</option>
                            <option value="Maio">Maio</option>
                            <option value="Junho">Junho</option>
                            <option value="Julho">Julho</option>
                            <option value="Agosto">Agosto</option>
                            <option value="Setembro">Setembro</option>
                            <option value="Outubro">Outubro</option>
                            <option value="Novembro">Novembro</option>
                            <option value="Dezembro">Dezembro</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Número de dias letivos de faltas: *</label>
                        <input type="number" required min="1" placeholder="Ex: 16" value={quantidadeFaltas} onChange={e => setQuantidadeFaltas(e.target.value)} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Motivos identificados para a baixa frequência escolar:</label>
                        <select
                            required
                            value={motivoAfastamento}
                            onChange={e => setMotivoAfastamento(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 outline-none bg-white"
                        >
                            <option value="" disabled>Selecione o motivo...</option>
                            <option>Saúde do aluno e/ou familiar</option>
                            <option>Gravidez</option>
                            <option>Conflitos familiares</option>
                            <option>Trabalho infantil/adolescente</option>
                            <option>Negligência</option>
                            <option>Outros, quais?</option>
                        </select>
                    </div>
                </div>

                {/* CAMPO CONDICIONAL DO MOTIVO */}
                {motivoAfastamento === 'Outros, quais?' && (
                    <div className="bg-red-50 p-4 rounded border border-red-200 animate-fadeIn">
                        <label className="block text-sm font-medium text-red-800 mb-1">Especifique o motivo do afastamento *</label>
                        <input
                            type="text"
                            required
                            placeholder="Descreva o motivo real..."
                            value={motivoOutros}
                            onChange={e => setMotivoOutros(e.target.value)}
                            className="w-full p-3 border border-red-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                        />
                    </div>
                )}

                {/* 3. AÇÕES TOMADAS (LISTA DINÂMICA) */}
                <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
                    <div className="flex justify-between items-center mb-4 border-b border-amber-200 pb-2">
                        <h3 className="font-bold text-amber-800">Histórico de Ações da Escola</h3>
                        <button
                            type="button"
                            onClick={adicionarAcao}
                            className="bg-amber-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-amber-700 transition shadow-sm flex items-center gap-1"
                        >
                            + Adicionar Ação
                        </button>
                    </div>

                    <div className="space-y-4">
                        {acoes.map((acao, index) => (
                            <div key={index} className="bg-white p-4 rounded border border-amber-100 shadow-sm relative animate-fadeIn">

                                {acoes.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removerAcao(index)}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 font-bold px-2"
                                        title="Remover esta ação"
                                    >
                                        ✕
                                    </button>
                                )}

                                <h4 className="text-sm font-bold text-amber-700 mb-2 uppercase tracking-wide">
                                    {ordinais[index] || `${index + 1}ª`} Ação Tomada
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Data da Ação *</label>
                                        <input
                                            type="date"
                                            required
                                            value={acao.dataAcao}
                                            onChange={e => handleAcaoChange(index, 'dataAcao', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Tipo de Ação *</label>
                                        <select
                                            required
                                            value={acao.tipoAcao}
                                            onChange={e => handleAcaoChange(index, 'tipoAcao', e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-white"
                                        >
                                            <option value="" disabled>Selecione o tipo de contato...</option>
                                            <option>Contato telefônico</option>
                                            <option>Visita domiciliar</option>
                                            <option>Contato por mensagem</option>
                                            <option>Conversa presencial com responsável</option>
                                            <option>Outros, quais?</option>
                                        </select>
                                    </div>
                                </div>

                                {/* CAMPO CONDICIONAL DA AÇÃO */}
                                {acao.tipoAcao === 'Outros, quais?' && (
                                    <div className="mt-3 animate-fadeIn">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Especifique a ação realizada..."
                                            value={acao.acaoOutros}
                                            onChange={e => handleAcaoChange(index, 'acaoOutros', e.target.value)}
                                            className="w-full p-2 border border-amber-300 rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm bg-amber-50"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. LAUDOS E CONCLUSÃO */}
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Encaminhamentos / Pareceres do Conselho</label>
                        <textarea
                            rows={2}
                            value={encaminhamentos}
                            onChange={e => setEncaminhamentos(e.target.value)}
                            placeholder="Houve acionamento do Conselho Tutelar? Encaminhamento médico?"
                            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 outline-none resize-none"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ações pedagógicas utilizadas para regularização da frequência: *</label>
                        <textarea
                            required
                            rows={3}
                            value={conclusao}
                            onChange={e => setConclusao(e.target.value)}
                            placeholder="Qual o parecer final da escola sobre esta evasão no momento atual?"
                            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 outline-none resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                        type="submit"
                        disabled={salvando}
                        className="px-8 py-3 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition shadow-md disabled:bg-red-400"
                    >
                        {salvando ? 'Gravando no Banco...' : 'Gravar Dossiê de Evasão'}
                    </button>
                </div>
            </form>
        </div>
    );
}