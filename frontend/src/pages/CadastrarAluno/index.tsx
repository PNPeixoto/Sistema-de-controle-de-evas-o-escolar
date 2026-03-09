import { useState } from 'react';
import { api } from '../../services/api';

export default function CadastrarAluno() {
    const [passo, setPasso] = useState(1);
    const [carregando, setCarregando] = useState(false);
    const escolaLogada = localStorage.getItem('escolaNome') || '';

    // ==========================================
    // 1. ESTADOS BASEADOS NAS SUAS ENTIDADES
    // ==========================================
    const [aluno, setAluno] = useState({
        nomeCompleto: '',
        escola: escolaLogada,
        dataNascimento: '',
        cor: 'Não Declarada',
        escolaridade: 'Ensino Fundamental I',
        aee: 'false',
        turno: 'Manhã',
        defasagem: 'false',
        beneficios: 'Nenhum'
    });

    const [endereco, setEndereco] = useState({
        rua: '',
        numero: '',
        bairro: '',
        cidade: 'Macaé'
    });

    const [filiacao, setFiliacao] = useState({
        mae: '',
        pai: '',
        responsavel: '',
        telefoneResponsável: ''
    });

    const [telefone, setTelefone] = useState({
        ddd: '22',
        numero: ''
    });

    // ==========================================
    // 2. FUNÇÃO DE ENVIO (O "PACOTÃO")
    // ==========================================
    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        setCarregando(true);

        const payload = {
            nomeCompleto: aluno.nomeCompleto,
            escola: aluno.escola,
            dataNascimento: `${aluno.dataNascimento}T00:00:00`,
            cor: aluno.cor,
            escolaridade: aluno.escolaridade,
            aee: aluno.aee === 'true',
            turno: aluno.turno,
            defasagem: aluno.defasagem === 'true',
            beneficios: aluno.beneficios,
            enderecos: [
                {
                    rua: endereco.rua,
                    numero: Number(endereco.numero),
                    bairro: endereco.bairro,
                    cidade: endereco.cidade
                }
            ],
            telefones: [
                {
                    ddd: telefone.ddd,
                    numero: telefone.numero
                }
            ],
            filiacao: [
                {
                    mae: filiacao.mae,
                    pai: filiacao.pai,
                    responsavel: filiacao.responsavel,
                    telefoneResponsável: filiacao.telefoneResponsável
                }
            ],
            historicoEvasao: []
        };

        try {
            const token = localStorage.getItem('token');

            await api.post('/aluno', payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert('Aluno matriculado com sucesso no sistema escolar!');
            window.location.reload();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao salvar aluno. Verifique os dados e o console.');
            console.error(error);
        } finally {
            setCarregando(false);
        }
    }; // <-- AQUI É ONDE O handleSalvar DEVE TERMINAR!

    // ==========================================
    // 3. RENDERIZAÇÃO DA TELA
    // ==========================================
    return (
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Matricular Novo Aluno</h2>

            <div className="flex justify-between mb-8 px-4 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded"></div>
                <div className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 -translate-y-1/2 rounded transition-all duration-300" style={{ width: `${(passo - 1) * 50}%` }}></div>

                {[1, 2, 3].map((num) => (
                    <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${passo >= num ? 'bg-blue-600 border-blue-100 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                        {num}
                    </div>
                ))}
            </div>

            <form onSubmit={passo === 3 ? handleSalvar : (e) => { e.preventDefault(); setPasso(passo + 1); }}>
                {passo === 1 && (
                    <div className="space-y-5 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Informações do Aluno</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Nome Completo</label>
                                <input type="text" required value={aluno.nomeCompleto} onChange={e => setAluno({ ...aluno, nomeCompleto: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Escola de Destino (Automático)</label>
                                <input type="text" readOnly value={aluno.escola} className="w-full p-3 border border-slate-300 rounded bg-slate-200 text-slate-600 font-semibold outline-none cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Data de Nascimento</label>
                                <input type="date" required value={aluno.dataNascimento} onChange={e => setAluno({ ...aluno, dataNascimento: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Cor / Raça</label>
                                <select value={aluno.cor} onChange={e => setAluno({ ...aluno, cor: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option>Não Declarada</option><option>Branca</option><option>Preta</option><option>Parda</option><option>Amarela</option><option>Indígena</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Escolaridade (Série/Ano)</label>
                                <input type="text" required value={aluno.escolaridade} onChange={e => setAluno({ ...aluno, escolaridade: e.target.value })} placeholder="Ex: 5º Ano Fundamental" className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Turno</label>
                                <select value={aluno.turno} onChange={e => setAluno({ ...aluno, turno: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option>Manhã</option><option>Tarde</option><option>Integral</option><option>Noite</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Benefícios Sociais</label>
                                <input type="text" value={aluno.beneficios} onChange={e => setAluno({ ...aluno, beneficios: e.target.value })} placeholder="Ex: Bolsa Família" className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="flex space-x-6 col-span-2 bg-slate-50 p-4 rounded border">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={aluno.aee === 'true'} onChange={e => setAluno({ ...aluno, aee: e.target.checked ? 'true' : 'false' })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-slate-700">Necessita de AEE (Atendimento Especializado)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={aluno.defasagem === 'true'} onChange={e => setAluno({ ...aluno, defasagem: e.target.checked ? 'true' : 'false' })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-slate-700">Defasagem Idade/Série</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {passo === 2 && (
                    <div className="space-y-5 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Localização (Foco em Evasão)</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3">
                                <label className="block text-sm font-medium text-slate-700">Logradouro (Rua, Av)</label>
                                <input type="text" required value={endereco.rua} onChange={e => setEndereco({ ...endereco, rua: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700">Número</label>
                                <input type="number" required value={endereco.numero} onChange={e => setEndereco({ ...endereco, numero: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Bairro</label>
                                <input type="text" required value={endereco.bairro} onChange={e => setEndereco({ ...endereco, bairro: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Cidade</label>
                                <input type="text" required value={endereco.cidade} onChange={e => setEndereco({ ...endereco, cidade: e.target.value })} className="w-full p-3 border border-slate-300 rounded bg-slate-100 outline-none" />
                            </div>
                        </div>
                    </div>
                )}

                {passo === 3 && (
                    <div className="space-y-5 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Núcleo Familiar e Contato</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Nome da Mãe</label>
                                <input type="text" value={filiacao.mae} onChange={e => setFiliacao({ ...filiacao, mae: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Nome do Pai</label>
                                <input type="text" value={filiacao.pai} onChange={e => setFiliacao({ ...filiacao, pai: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Nome de Outro Responsável Legal (Opcional)</label>
                                <input type="text" value={filiacao.responsavel} onChange={e => setFiliacao({ ...filiacao, responsavel: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700">Telefone do Responsável (Filiacao)</label>
                                <input type="text" required value={filiacao.telefoneResponsável} onChange={e => setFiliacao({ ...filiacao, telefoneResponsável: e.target.value })} placeholder="Ex: 99999-9999" className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="col-span-1 flex gap-2">
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium text-slate-700">DDD</label>
                                    <input type="text" required value={telefone.ddd} onChange={e => setTelefone({ ...telefone, ddd: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center" maxLength={3} />
                                </div>
                                <div className="w-2/3">
                                    <label className="block text-sm font-medium text-slate-700">Celular Secundário</label>
                                    <input type="text" value={telefone.numero} onChange={e => setTelefone({ ...telefone, numero: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-10 pt-4 border-t border-slate-200">
                    {passo > 1 ? (
                        <button type="button" onClick={() => setPasso(passo - 1)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded font-bold hover:bg-slate-200 transition">← Voltar</button>
                    ) : <div></div>}

                    <button type="submit" disabled={carregando} className="px-8 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition shadow-md disabled:bg-blue-400">
                        {passo === 3 ? (carregando ? 'Gravando no Banco...' : 'Concluir Matrícula ✓') : 'Próximo Passo →'}
                    </button>
                </div>
            </form>
        </div>
    );
}