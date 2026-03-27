import { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface Bairro {
    id: number;
    nome: string;
}

export default function CadastrarAluno() {
    const [passo, setPasso] = useState(1);
    const [carregando, setCarregando] = useState(false);
    const escolaLogada = localStorage.getItem('escolaNome') || '';

    const [listaBairros, setListaBairros] = useState<Bairro[]>([]);

    useEffect(() => {
        buscarBairros();
    }, []);

    const buscarBairros = async () => {
        try {
            const token = localStorage.getItem('token');
            const resposta = await api.get('/bairros', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListaBairros(resposta.data);
        } catch (error) {
            console.error("Erro ao carregar a lista de bairros", error);
        }
    };

    const [aluno, setAluno] = useState({
        nomeCompleto: '',
        escola: escolaLogada,
        dataNascimento: '',
        sexo: '',
        cor: 'Não Declarada',
        escolaridade: '1º Ano - Ensino Fundamental I',
        aee: 'false',
        turno: 'Manhã',
        defasagem: 'false',
    });

    const [beneficiosSelecionados, setBeneficiosSelecionados] = useState<string[]>(['Nenhum']);
    const [codigoBolsaFamilia, setCodigoBolsaFamilia] = useState('');
    const [outroBeneficio, setOutroBeneficio] = useState('');

    const [endereco, setEndereco] = useState({ rua: '', numero: '', bairro: '', cidade: 'Macaé' });

    const [filiacao, setFiliacao] = useState({ mae: '', pai: '', responsavel: '', telefoneResponsavel: '' });

    const toggleBeneficio = (beneficio: string) => {
        if (beneficio === 'Nenhum') {
            setBeneficiosSelecionados(['Nenhum']);
            setCodigoBolsaFamilia('');
            setOutroBeneficio('');
        } else {
            let novaLista = beneficiosSelecionados.filter(b => b !== 'Nenhum');
            if (novaLista.includes(beneficio)) {
                novaLista = novaLista.filter(b => b !== beneficio);
                if (novaLista.length === 0) novaLista = ['Nenhum'];
            } else {
                novaLista.push(beneficio);
            }
            setBeneficiosSelecionados(novaLista);
        }
    };

    const avancarPasso = () => {
        if (passo === 1) {
            if (!aluno.nomeCompleto || !aluno.dataNascimento || !aluno.sexo) {
                alert("⚠️ Por favor, preencha o Nome, Data de Nascimento e Sexo antes de avançar.");
                return;
            }
        }
        if (passo === 2) {
            if (!endereco.rua || !endereco.numero || !endereco.bairro) {
                alert("⚠️ Por favor, selecione o Bairro e preencha a Rua e Número antes de avançar.");
                return;
            }
        }
        setPasso(passo + 1);
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();

        if (beneficiosSelecionados.includes('Bolsa Família') && !codigoBolsaFamilia) {
            alert("Por favor, informe o código do Bolsa Família.");
            return;
        }
        if (beneficiosSelecionados.includes('Outro') && !outroBeneficio) {
            alert("Por favor, especifique qual é o outro benefício.");
            return;
        }

        setCarregando(true);

        const stringBeneficios = beneficiosSelecionados.map(b => {
            if (b === 'Bolsa Família') return `Bolsa Família (Código NIS/Justificativa: ${codigoBolsaFamilia})`;
            if (b === 'Outro') return `Outro: ${outroBeneficio}`;
            return b;
        }).join(', ');

        const payload = {
            nomeCompleto: aluno.nomeCompleto,
            escola: aluno.escola,
            dataNascimento: `${aluno.dataNascimento}T00:00:00`,
            sexo: aluno.sexo,
            cor: aluno.cor,
            escolaridade: aluno.escolaridade,
            aee: aluno.aee === 'true',
            turno: aluno.turno,
            defasagem: aluno.defasagem === 'true',
            beneficios: stringBeneficios,
            enderecos: [{ rua: endereco.rua, numero: Number(endereco.numero), bairro: endereco.bairro, cidade: endereco.cidade }],
            telefones: [],
            filiacao: [{
                mae: filiacao.mae,
                pai: filiacao.pai,
                responsavel: filiacao.responsavel,
                telefoneResponsavel: filiacao.telefoneResponsavel
            }],
            historicoEvasao: []
        };

        try {
            const token = localStorage.getItem('token');
            await api.post('/aluno', payload, { headers: { Authorization: `Bearer ${token}` } });
            alert('Aluno matriculado com sucesso no sistema escolar!');
            window.location.reload();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao salvar aluno. Verifique os dados e o console.');
            console.error(error);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-4xl mx-auto mb-10">
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

            <form onSubmit={passo === 3 ? handleSalvar : (e) => { e.preventDefault(); avancarPasso(); }}>
                {passo === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Informações do Aluno</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Nome Completo *</label>
                                <input type="text" required value={aluno.nomeCompleto} onChange={e => setAluno({ ...aluno, nomeCompleto: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Escola de Destino</label>
                                <input type="text" readOnly value={aluno.escola} className="w-full p-3 border border-slate-300 rounded bg-slate-200 text-slate-600 font-semibold outline-none cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Data de Nascimento *</label>
                                <input type="date" required value={aluno.dataNascimento} onChange={e => setAluno({ ...aluno, dataNascimento: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Sexo *</label>
                                <select required value={aluno.sexo} onChange={e => setAluno({ ...aluno, sexo: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option value="" disabled>Selecione...</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Escolaridade (Série/Ano) *</label>
                                <select value={aluno.escolaridade} onChange={e => setAluno({ ...aluno, escolaridade: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white" >
                                    <optgroup label="Ensino Fundamental I">
                                        <option value="1º Ano - Ensino Fundamental I">1º Ano</option>
                                        <option value="2º Ano - Ensino Fundamental I">2º Ano</option>
                                        <option value="3º Ano - Ensino Fundamental I">3º Ano</option>
                                        <option value="4º Ano - Ensino Fundamental I">4º Ano</option>
                                        <option value="5º Ano - Ensino Fundamental I">5º Ano</option>
                                    </optgroup>
                                    <optgroup label="Ensino Fundamental II">
                                        <option value="6º Ano - Ensino Fundamental II">6º Ano</option>
                                        <option value="7º Ano - Ensino Fundamental II">7º Ano</option>
                                        <option value="8º Ano - Ensino Fundamental II">8º Ano</option>
                                        <option value="9º Ano - Ensino Fundamental II">9º Ano</option>
                                    </optgroup>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Turno *</label>
                                <select value={aluno.turno} onChange={e => setAluno({ ...aluno, turno: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option>Manhã</option><option>Tarde</option><option>Integral</option><option>Noite</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Cor / Raça *</label>
                                <select value={aluno.cor} onChange={e => setAluno({ ...aluno, cor: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option>Não Declarada</option><option>Branca</option><option>Preta</option><option>Parda</option><option>Amarela</option><option>Indígena</option>
                                </select>
                            </div>

                            <div className="col-span-2 flex justify-center space-x-6 bg-slate-50 p-4 rounded border border-slate-200 mt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={aluno.aee === 'true'} onChange={e => setAluno({ ...aluno, aee: e.target.checked ? 'true' : 'false' })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-slate-700">Necessita de AEE Especializado</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={aluno.defasagem === 'true'} onChange={e => setAluno({ ...aluno, defasagem: e.target.checked ? 'true' : 'false' })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-slate-700">Defasagem Idade/Série</span>
                                </label>
                            </div>

                            <div className="col-span-2 bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                                <label className="block text-base font-bold text-slate-800 mb-3">Programas e Benefícios Sociais</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['Nenhum', 'BPC', 'Jovem Aprendiz', 'Bolsa Família', 'Projeto Nova Vida', 'Outro'].map((beneficio) => (
                                        <label key={beneficio} className="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded border border-slate-200 hover:bg-blue-50 transition">
                                            <input type="checkbox" checked={beneficiosSelecionados.includes(beneficio)} onChange={() => toggleBeneficio(beneficio)} className="w-4 h-4 text-blue-600 rounded" />
                                            <span className="text-sm font-medium text-slate-700">{beneficio}</span>
                                        </label>
                                    ))}
                                </div>

                                {beneficiosSelecionados.includes('Bolsa Família') && (
                                    <div className="mt-4 p-3 bg-blue-100/50 border border-blue-200 rounded animate-fadeIn">
                                        <label className="block text-sm font-bold text-blue-800 mb-1">Código NIS / Justificativa *</label>
                                        <input type="text" required placeholder="Ex: 1234567" value={codigoBolsaFamilia} onChange={e => setCodigoBolsaFamilia(e.target.value)} className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {passo === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Localização</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3">
                                <label className="block text-sm font-medium text-slate-700">Logradouro (Rua, Av) *</label>
                                <input type="text" required value={endereco.rua} onChange={e => setEndereco({ ...endereco, rua: e.target.value })} className="w-full p-3 border border-slate-300 rounded outline-none" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-slate-700">Número *</label>
                                <input type="number" required value={endereco.numero} onChange={e => setEndereco({ ...endereco, numero: e.target.value })} className="w-full p-3 border border-slate-300 rounded outline-none" />
                            </div>

                            {/* ========================================== */}
                            {/* NOVO: BAIRRO BLINDADO COMO SELECT          */}
                            {/* ========================================== */}
                            <div className="col-span-2 relative">
                                <label className="block text-sm font-medium text-slate-700">Bairro *</label>
                                <select
                                    required
                                    value={endereco.bairro}
                                    onChange={e => setEndereco({ ...endereco, bairro: e.target.value })}
                                    className="w-full p-3 border border-slate-300 rounded bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="" disabled>Selecione um bairro da lista...</option>
                                    {listaBairros.map((bairro) => (
                                        <option key={bairro.id} value={bairro.nome}>{bairro.nome}</option>
                                    ))}
                                </select>
                            </div>

                            {/* ========================================== */}
                            {/* NOVO: CIDADE BLINDADA SÓ COM 3 OPÇÕES      */}
                            {/* ========================================== */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Cidade *</label>
                                <select
                                    required
                                    value={endereco.cidade}
                                    onChange={e => setEndereco({ ...endereco, cidade: e.target.value })}
                                    className="w-full p-3 border border-slate-300 rounded bg-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="" disabled>Selecione a cidade...</option>
                                    <option value="Macaé">Macaé</option>
                                    <option value="Rio das Ostras">Rio das Ostras</option>
                                    <option value="Quissamã">Quissamã</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {passo === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Núcleo Familiar e Contato</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Nome da Mãe</label>
                                <input type="text" value={filiacao.mae} onChange={e => setFiliacao({ ...filiacao, mae: e.target.value })} className="w-full p-3 border border-slate-300 rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Nome do Pai</label>
                                <input type="text" value={filiacao.pai} onChange={e => setFiliacao({ ...filiacao, pai: e.target.value })} className="w-full p-3 border border-slate-300 rounded" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700">Nome de Outro Responsável Legal (Opcional)</label>
                                <input type="text" value={filiacao.responsavel} onChange={e => setFiliacao({ ...filiacao, responsavel: e.target.value })} className="w-full p-3 border border-slate-300 rounded" />
                            </div>

                            <div className="col-span-2 bg-red-50 p-4 rounded border border-red-200 mt-2">
                                <label className="block text-sm font-bold text-red-800 mb-1">
                                    Tel. Principal do Responsável (Aparecerá na FICAI) *
                                </label>
                                <input type="text" required value={filiacao.telefoneResponsavel} onChange={e => setFiliacao({ ...filiacao, telefoneResponsavel: e.target.value })} placeholder="Ex: (22) 99999-9999" className="w-full p-3 border border-red-300 rounded focus:ring-2 focus:ring-red-500 outline-none" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-10 pt-4 border-t border-slate-200">
                    {passo > 1 ? (
                        <button type="button" onClick={() => setPasso(passo - 1)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded font-bold hover:bg-slate-200 transition">← Voltar</button>
                    ) : <div></div>}

                    <button type="submit" disabled={carregando} className="px-8 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-md">
                        {passo === 3 ? (carregando ? 'Gravando...' : 'Concluir Matrícula ✓') : 'Próximo Passo →'}
                    </button>
                </div>
            </form>
        </div>
    );
}