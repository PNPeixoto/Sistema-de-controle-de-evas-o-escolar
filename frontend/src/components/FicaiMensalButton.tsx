import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../utils/http';

interface StatusMes {
    registrado?: boolean;
    semFicai?: boolean;
    assinadoPor?: string;
    dataAssinatura?: string;
}

export default function FicaiMensalButton() {
    const { usuario } = useAuth();
    const [statusMes, setStatusMes] = useState<StatusMes | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [termoAceito, setTermoAceito] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const mesAtual = new Date().toISOString().slice(0, 7);
    const nomeMes = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Só verifica quando o usuário estiver carregado
    const verificarMes = useCallback(async () => {
        try {
            const resp = await api.get<StatusMes>(`/ficai-mensal?mes=${mesAtual}`);
            setStatusMes(resp.data);
        } catch (error) {
            console.error('Erro ao verificar FICAI mensal:', error);
            setStatusMes(null);
        }
        setCarregando(false);
    }, [mesAtual]);

    useEffect(() => {
        if (usuario) {
            void verificarMes();
        } else {
            setCarregando(false);
        }
    }, [usuario, verificarMes]);

    const registrarSemFicai = async () => {
        if (!termoAceito) {
            setErro('Você precisa aceitar o termo de consentimento.');
            return;
        }

        try {
            setEnviando(true);
            setErro('');
            await api.post('/ficai-mensal', {
                mesReferencia: mesAtual,
                termoAceito: true
            });
            setSucesso('Declaração registrada com sucesso!');
            void verificarMes();
            setTimeout(() => {
                setMostrarModal(false);
                setSucesso('');
            }, 2000);
        } catch (error: unknown) {
            setErro(getApiErrorMessage(error, 'Erro ao registrar declaracao.'));
        } finally {
            setEnviando(false);
        }
    };

    // Enquanto carrega, mostra placeholder ao invés de null
    if (carregando) {
        return (
            <div className="w-full p-4 bg-slate-50 text-slate-400 font-medium rounded-lg border border-slate-200 text-center text-sm animate-pulse">
                Verificando FICAI mensal...
            </div>
        );
    }

    // Já registrado neste mês
    if (statusMes?.registrado && statusMes?.semFicai) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <p className="text-emerald-700 font-bold text-sm">
                    Declaração de ausência de FICAI registrada para {nomeMes}
                </p>
                <p className="text-emerald-600 text-xs mt-1">
                    Assinado por {statusMes.assinadoPor} em {statusMes.dataAssinatura}
                </p>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => { setMostrarModal(true); setTermoAceito(false); setErro(''); }}
                className="w-full flex items-center justify-center gap-2 p-4 bg-amber-50 text-amber-700 font-bold rounded-lg hover:bg-amber-100 transition border border-amber-200"
            >
                Não possui FICAI este mês
            </button>

            {mostrarModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
                     onClick={() => setMostrarModal(false)}>
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                         onClick={e => e.stopPropagation()}>

                        <div className="bg-amber-500 p-5 text-white">
                            <h2 className="text-xl font-bold">Declaração de Ausência de FICAI</h2>
                            <p className="text-amber-100 text-sm mt-1">Referente a {nomeMes}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            {sucesso ? (
                                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg text-center font-bold">
                                    {sucesso}
                                </div>
                            ) : (
                                <>
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed">
                                        <p className="font-bold mb-2">TERMO DE CONSENTIMENTO E RESPONSABILIDADE</p>
                                        <p>
                                            Declaro, na condição de Diretor(a) / responsável pela unidade escolar,
                                            que neste mês de <strong>{nomeMes}</strong> não houve nenhum caso de
                                            infrequência escolar que necessitasse o preenchimento da Ficha de
                                            Comunicação do Aluno Infrequente (FICAI).
                                        </p>
                                        <p className="mt-2">
                                            Estou ciente de que esta declaração será registrada no sistema com
                                            meu nome e data, e que a veracidade das informações é de minha
                                            total responsabilidade.
                                        </p>
                                        <p className="mt-2 font-semibold text-amber-700">
                                            Caso existam registros de evasão neste mês, esta declaração não
                                            poderá ser efetuada.
                                        </p>
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={termoAceito}
                                            onChange={e => { setTermoAceito(e.target.checked); setErro(''); }}
                                            className="mt-1 w-5 h-5 text-amber-600 rounded"
                                        />
                                        <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                            Li e concordo com o termo de consentimento e responsabilidade acima.
                                        </span>
                                    </label>

                                    {erro && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm font-medium">
                                            {erro}
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setMostrarModal(false)}
                                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-lg transition"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={registrarSemFicai}
                                            disabled={!termoAceito || enviando}
                                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                                        >
                                            {enviando ? 'Registrando...' : 'Assinar e Registrar'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
