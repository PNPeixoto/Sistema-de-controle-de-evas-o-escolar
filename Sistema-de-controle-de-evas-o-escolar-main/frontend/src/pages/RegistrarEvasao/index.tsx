import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface Acao {
    dataAcao: string;
    tipo: string;
    observacao: string;
}

export default function RegistrarEvasao({ onClose }: { onClose?: () => void }) {
    const navigate = useNavigate();
    const [carregando, setCarregando] = useState(false);

    // ==========================================
    // ESTADOS PARA O SELETOR DE ALUNOS
    // ==========================================
    const [listaAlunos, setListaAlunos] = useState<{id: number, nomeCompleto: string}[]>([]);
    const [alunoSelecionadoId, setAlunoSelecionadoId] = useState<number | ''>('');
    const { usuario } = useAuth();
    const escolaLogada = usuario?.escolaNome || '';

    const mesesAno = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const [evasao, setEvasao] = useState({
        mesFaltas: 'Março',
        quantidadeFaltas: '',
        reincidente: false,
        providenciasAdotadas: [] as string[],
        outrasProvidencias: '',
        motivoAfastamento: 'Saúde do Aluno e/ou Familiar',
        outroMotivo: '',
        encaminhamentosLaudos: '',
        conclusao: '',
    });

    const [acoes, setAcoes] = useState<Acao[]>([
        { dataAcao: '', tipo: 'Contato Telefônico', observacao: '' }
    ]);

    useEffect(() => {
        buscarAlunos();
    }, []);

    const buscarAlunos = async () => {
        try {
            const resposta = await api.get(`/aluno/escola/${encodeURIComponent(escolaLogada)}`);
            setListaAlunos(resposta.data);
        } catch (error) {
            console.error("Erro ao buscar alunos", error);
        }
    };

    const toggleProvidencia = (providencia: string) => {
        setEvasao(prev => {
            const lista = prev.providenciasAdotadas.includes(providencia)
                ? prev.providenciasAdotadas.filter(p => p !== providencia)
                : [...prev.providenciasAdotadas, providencia];
            return { ...prev, providenciasAdotadas: lista };
        });
    };

    const adicionarAcao = () => {
        if (acoes.length < 3) {
            setAcoes([...acoes, { dataAcao: '', tipo: 'Contato Telefônico', observacao: '' }]);
        } else {
            alert('A FICAI suporta no máximo 3 registros de acompanhamento por via.');
        }
    };

    const atualizarAcao = (index: number, campo: keyof Acao, valor: string) => {
        const novasAcoes = [...acoes];
        novasAcoes[index][campo] = valor;
        setAcoes(novasAcoes);
    };

    const removerAcao = (index: number) => {
        const novasAcoes = acoes.filter((_, i) => i !== index);
        setAcoes(novasAcoes);
    };

    const handleSalvarEvasao = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!alunoSelecionadoId) {
            alert("Por favor, selecione o aluno antes de salvar.");
            return;
        }

        setCarregando(true);

        const motivoFinal = evasao.motivoAfastamento === 'Outros'
            ? `Outros: ${evasao.outroMotivo}`
            : evasao.motivoAfastamento;

        const acoesFormatadas = acoes.map(acao => {
            const [ano, mes, dia] = acao.dataAcao.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            return {
                dataAcao: dataFormatada,
                acaoTomada: `${acao.tipo.toUpperCase()} - ${acao.observacao}`
            };
        });

        const payload = {
            mesFaltas: evasao.mesFaltas,
            quantidadeFaltas: Number(evasao.quantidadeFaltas),
            reincidente: evasao.reincidente,
            providenciasAdotadas: evasao.providenciasAdotadas,
            outrasProvidencias: evasao.outrasProvidencias,
            motivoAfastamento: motivoFinal,
            encaminhamentosLaudos: evasao.encaminhamentosLaudos,
            conclusao: evasao.conclusao,
            acoes: acoesFormatadas
        };

        try {
            await api.post(`/evasao/${alunoSelecionadoId}`, payload);

            alert('Dossiê de Evasão (FICAI) registrado com sucesso!');
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert('Erro ao registrar evasão. Verifique o console.');
        } finally {
            setCarregando(false);
        }
    };

    const fecharTela = () => {
        if (onClose) {
            onClose();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={fecharTela}>
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>

                <div className="bg-red-700 p-5 flex justify-between items-center text-white shrink-0">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">🚨 Ficha de Comunicação ao Aluno Infrequente</h2>
                        <p className="text-red-200 text-sm mt-1">Preencha os campos abaixo de acordo com o formulário oficial.</p>
                    </div>
                    <button type="button" onClick={(e) => { e.preventDefault(); fecharTela(); }} className="text-red-200 hover:text-white text-4xl leading-none cursor-pointer" title="Fechar">
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSalvarEvasao} className="p-6 md:p-8 space-y-6 bg-slate-50 overflow-y-auto">

                    {/* ========================================== */}
                    {/* SELETOR DE ALUNO BLINDADO (SEM DIGITAÇÃO)  */}
                    {/* ========================================== */}
                    <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm border-l-4 border-l-blue-600 relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Busque e Selecione o Aluno *</label>

                        <select
                            required
                            value={alunoSelecionadoId}
                            onChange={(e) => setAlunoSelecionadoId(Number(e.target.value))}
                            className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer transition"
                        >
                            <option value="" disabled>Selecione um aluno da lista...</option>
                            {listaAlunos.map(aluno => (
                                <option key={aluno.id} value={aluno.id}>{aluno.nomeCompleto}</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-2">Dica: Clique no campo e digite o nome do aluno no teclado para achar mais rápido.</p>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 text-red-700">I - Identificação das Faltas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Mês das Faltas</label>
                                <select required value={evasao.mesFaltas} onChange={e => setEvasao({...evasao, mesFaltas: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 bg-white outline-none">
                                    <option value="" disabled>Selecione...</option>
                                    {mesesAno.map(mes => (
                                        <option key={mes} value={mes}>{mes}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Nº de Dias Letivos de Faltas</label>
                                <input type="number" required min="1" value={evasao.quantidadeFaltas} onChange={e => setEvasao({...evasao, quantidadeFaltas: e.target.value})} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer bg-red-50 p-2.5 rounded border border-red-200 w-full hover:bg-red-100 transition">
                                    <input type="checkbox" checked={evasao.reincidente} onChange={e => setEvasao({...evasao, reincidente: e.target.checked})} className="w-5 h-5 text-red-600 rounded border-red-300 focus:ring-red-500" />
                                    <span className="text-sm font-bold text-red-800">Aluno Reincidente?</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 text-red-700">II - Providências Adotadas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {['Contato Telefônico', 'Visita Domiciliar', 'Contato por Mensagem', 'Conversa com Responsável', 'Outras'].map((prov) => (
                                <label key={prov} className="flex items-center space-x-2 cursor-pointer bg-slate-50 p-2 rounded border border-slate-200 hover:bg-red-50 transition">
                                    <input
                                        type="checkbox"
                                        checked={evasao.providenciasAdotadas.includes(prov)}
                                        onChange={() => toggleProvidencia(prov)}
                                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500 outline-none"
                                    />
                                    <span className="text-sm font-medium text-slate-700">{prov}</span>
                                </label>
                            ))}
                        </div>

                        {evasao.providenciasAdotadas.includes('Outras') && (
                            <div className="mt-4 animate-fadeIn">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Outras providências, quais? *</label>
                                <input type="text" required placeholder="Especifique as outras providências..." value={evasao.outrasProvidencias} onChange={e => setEvasao({...evasao, outrasProvidencias: e.target.value})} className="w-full p-2 border border-red-300 rounded focus:ring-2 focus:ring-red-500 bg-red-50 outline-none" />
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 text-red-700">III - Encaminhamentos</h3>
                        <p className="text-xs text-slate-500 mb-2">Órgãos acionados (Ex: Conselho Tutelar, CRAS, CREAS). Deixe em branco se não houver.</p>
                        <textarea placeholder="Descreva os encaminhamentos realizados..." value={evasao.encaminhamentosLaudos} onChange={e => setEvasao({...evasao, encaminhamentosLaudos: e.target.value})} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 h-20 resize-none outline-none"></textarea>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 text-red-700">IV - Registro de Acompanhamento</h3>
                                <p className="text-xs text-slate-500 mt-1">Adicione o histórico de acompanhamento realizado pela escola (Máximo de 3).</p>
                            </div>
                            <button type="button" onClick={adicionarAcao} className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded font-bold shadow-sm transition">+ Adicionar Ação</button>
                        </div>

                        <div className="space-y-4">
                            {acoes.map((acao, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-4 items-start bg-slate-50 p-4 rounded border border-slate-200 relative">
                                    <div className="w-full md:w-1/4">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Data da Ação</label>
                                        <input type="date" required value={acao.dataAcao} onChange={e => atualizarAcao(index, 'dataAcao', e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                    <div className="w-full md:w-1/3">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Ação / Providência</label>
                                        <select value={acao.tipo} onChange={e => atualizarAcao(index, 'tipo', e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none">
                                            <option value="Contato Telefônico">Contato Telefônico</option>
                                            <option value="Contato por Mensagem">Contato por Mensagem</option>
                                            <option value="Atendimento ao Responsável">Atendimento ao Responsável</option>
                                            <option value="Visita Domiciliar">Visita Domiciliar</option>
                                        </select>
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Observações</label>
                                        <input type="text" required placeholder="Ex: Telefone não atende..." value={acao.observacao} onChange={e => atualizarAcao(index, 'observacao', e.target.value)} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-red-500 outline-none" />
                                    </div>
                                    {acoes.length > 1 && (
                                        <button type="button" onClick={() => removerAcao(index)} className="absolute -top-3 -right-3 md:top-auto md:bottom-2 md:-right-2 bg-red-100 text-red-600 border border-red-200 rounded-full w-8 h-8 flex items-center justify-center font-bold hover:bg-red-200 transition" title="Remover Ação">✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 text-red-700">V - Motivos Identificados para a Baixa Frequência</h3>
                        <select value={evasao.motivoAfastamento} onChange={e => setEvasao({...evasao, motivoAfastamento: e.target.value})} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 bg-white mb-3 outline-none">
                            <option value="Saúde do Aluno e/ou Familiar">Saúde do Aluno e/ou Familiar</option>
                            <option value="Gravidez">Gravidez</option>
                            <option value="Conflitos Familiares">Conflitos Familiares</option>
                            <option value="Trabalho Infantil/Adolescente">Trabalho Infantil/Adolescente</option>
                            <option value="Negligência">Negligência</option>
                            <option value="Outros">Outros, quais?</option>
                        </select>
                        {evasao.motivoAfastamento === 'Outros' && (
                            <div className="bg-red-50 p-3 rounded border border-red-200 animate-fadeIn">
                                <label className="block text-sm font-bold text-red-800 mb-1">Especifique o Motivo *</label>
                                <input type="text" required placeholder="Qual foi o motivo identificado?" value={evasao.outroMotivo} onChange={e => setEvasao({...evasao, outroMotivo: e.target.value})} className="w-full p-2 border border-red-300 rounded focus:ring-2 focus:ring-red-500 bg-white outline-none" />
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 text-red-700">VI - Ações Pedagógicas (Regularização da Frequência)</h3>
                        <textarea placeholder="Descreva as medidas pedagógicas tomadas pela escola para o retorno do aluno..." required value={evasao.conclusao} onChange={e => setEvasao({...evasao, conclusao: e.target.value})} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 h-24 resize-none outline-none"></textarea>
                    </div>

                    <div className="flex justify-end pt-2 pb-4">
                        <button type="submit" disabled={carregando} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-10 rounded-lg shadow-lg disabled:opacity-50 transition-colors text-lg w-full md:w-auto">
                            {carregando ? 'Salvando Dossiê...' : 'Registrar e Finalizar FICAI'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}