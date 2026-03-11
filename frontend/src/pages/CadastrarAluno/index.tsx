import { useState } from 'react';
import { api } from '../../services/api';

export default function CadastrarAluno() {
    const [passo, setPasso] = useState(1);
    const [carregando, setCarregando] = useState(false);
    const escolaLogada = localStorage.getItem('escolaNome') || '';

    // ==========================================
    // 1. ESTADOS DO ALUNO
    // ==========================================
    const [aluno, setAluno] = useState({
        nomeCompleto: '',
        escola: escolaLogada,
        dataNascimento: '',
        cor: 'Não Declarada',
        escolaridade: '1º Ano - Ensino Fundamental I', // Atualizado para o novo padrão
        aee: 'false',
        turno: 'Manhã',
        defasagem: 'false',
    });

    // ==========================================
    // NOVO: ESTADOS PARA OS BENEFÍCIOS (Múltipla Seleção)
    // ==========================================
    const [beneficiosSelecionados, setBeneficiosSelecionados] = useState<string[]>(['Nenhum']);
    const [codigoBolsaFamilia, setCodigoBolsaFamilia] = useState('');
    const [outroBeneficio, setOutroBeneficio] = useState('');

    const [endereco, setEndereco] = useState({ rua: '', numero: '', bairro: '', cidade: 'Macaé' });
    const [filiacao, setFiliacao] = useState({ mae: '', pai: '', responsavel: '', telefoneResponsável: '' });
    const [telefone, setTelefone] = useState({ ddd: '22', numero: '' });

    // Lógica inteligente para as caixinhas de benefícios
    const toggleBeneficio = (beneficio: string) => {
        if (beneficio === 'Nenhum') {
            // Se marcou "Nenhum", limpa as outras e marca só ela
            setBeneficiosSelecionados(['Nenhum']);
            setCodigoBolsaFamilia('');
            setOutroBeneficio('');
        } else {
            // Tira o "Nenhum" se a pessoa marcou outra coisa
            let novaLista = beneficiosSelecionados.filter(b => b !== 'Nenhum');

            if (novaLista.includes(beneficio)) {
                // Se já tinha, desmarca
                novaLista = novaLista.filter(b => b !== beneficio);
                if (novaLista.length === 0) novaLista = ['Nenhum']; // Se esvaziou, volta pro Nenhum
            } else {
                // Se não tinha, adiciona
                novaLista.push(beneficio);
            }
            setBeneficiosSelecionados(novaLista);
        }
    };

    // ==========================================
    // 2. FUNÇÃO DE ENVIO (O "PACOTÃO")
    // ==========================================
    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação de preenchimento dos campos condicionais
        if (beneficiosSelecionados.includes('Bolsa Família') && !codigoBolsaFamilia) {
            alert("Por favor, informe o código do Bolsa Família.");
            return;
        }
        if (beneficiosSelecionados.includes('Outro') && !outroBeneficio) {
            alert("Por favor, especifique qual é o outro benefício.");
            return;
        }

        setCarregando(true);

        // Monta a string de benefícios (ex: "BPC, Bolsa Família (Código: 123), Outro: Vale Gás")
        const stringBeneficios = beneficiosSelecionados.map(b => {
            if (b === 'Bolsa Família') return `Bolsa Família (Código NIS/Justificativa: ${codigoBolsaFamilia})`;
            if (b === 'Outro') return `Outro: ${outroBeneficio}`;
            return b;
        }).join(', ');

        const payload = {
            nomeCompleto: aluno.nomeCompleto,
            escola: aluno.escola,
            dataNascimento: `${aluno.dataNascimento}T00:00:00`,
            cor: aluno.cor,
            escolaridade: aluno.escolaridade,
            aee: aluno.aee === 'true',
            turno: aluno.turno,
            defasagem: aluno.defasagem === 'true',
            beneficios: stringBeneficios, // Enviamos a string formatada!
            enderecos: [{ rua: endereco.rua, numero: Number(endereco.numero), bairro: endereco.bairro, cidade: endereco.cidade }],
            telefones: [{ ddd: telefone.ddd, numero: telefone.numero }],
            filiacao: [{ mae: filiacao.mae, pai: filiacao.pai, responsavel: filiacao.responsavel, telefoneResponsável: filiacao.telefoneResponsável }],
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

    // ==========================================
    // 3. RENDERIZAÇÃO DA TELA
    // ==========================================
    return (
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-4xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">Matricular Novo Aluno</h2>

            {/* Barra de Progresso */}
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
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2">Informações do Aluno</h3>
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

                            {/* NOVO: SELECT DE ESCOLARIDADE AGRUPADO */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Escolaridade (Série/Ano)</label>
                                <select
                                    value={aluno.escolaridade}
                                    onChange={e => setAluno({ ...aluno, escolaridade: e.target.value })}
                                    className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
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
                                    <optgroup label="Ensino Médio">
                                        <option value="1º Ano - Ensino Médio">1º Ano</option>
                                        <option value="2º Ano - Ensino Médio">2º Ano</option>
                                        <option value="3º Ano - Ensino Médio">3º Ano</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Turno</label>
                                <select value={aluno.turno} onChange={e => setAluno({ ...aluno, turno: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option>Manhã</option><option>Tarde</option><option>Integral</option><option>Noite</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Cor / Raça</label>
                                <select value={aluno.cor} onChange={e => setAluno({ ...aluno, cor: e.target.value })} className="w-full p-3 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                    <option>Não Declarada</option><option>Branca</option><option>Preta</option><option>Parda</option><option>Amarela</option><option>Indígena</option>
                                </select>
                            </div>

                            <div className="flex flex-col justify-center space-y-3 bg-slate-50 p-3 rounded border border-slate-200">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={aluno.aee === 'true'} onChange={e => setAluno({ ...aluno, aee: e.target.checked ? 'true' : 'false' })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-slate-700">Necessita de AEE Especializado</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" checked={aluno.defasagem === 'true'} onChange={e => setAluno({ ...aluno, defasagem: e.target.checked ? 'true' : 'false' })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                                    <span className="text-sm font-medium text-slate-700">Defasagem Idade/Série</span>
                                </label>
                            </div>

                            {/* NOVO: CAIXA DE MÚLTIPLA SELEÇÃO DE BENEFÍCIOS */}
                            <div className="col-span-2 bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                                <label className="block text-base font-bold text-slate-800 mb-3">Programas e Benefícios Sociais (Múltipla Seleção)</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['Nenhum', 'BPC', 'Jovem Aprendiz', 'Bolsa Família', 'Projeto Nova Vida', 'Outro'].map((beneficio) => (
                                        <label key={beneficio} className="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded border border-slate-200 hover:bg-blue-50 transition">
                                            <input
                                                type="checkbox"
                                                checked={beneficiosSelecionados.includes(beneficio)}
                                                onChange={() => toggleBeneficio(beneficio)}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-medium text-slate-700">{beneficio}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Condicional: Bolsa Família */}
                                {beneficiosSelecionados.includes('Bolsa Família') && (
                                    <div className="mt-4 p-3 bg-blue-100/50 border border-blue-200 rounded animate-fadeIn">
                                        <label className="block text-sm font-bold text-blue-800 mb-1">Código utilizado para justificar baixa frequência *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: 1234567"
                                            value={codigoBolsaFamilia}
                                            onChange={e => setCodigoBolsaFamilia(e.target.value)}
                                            className="w-full p-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                )}

                                {/* Condicional: Outros */}
                                {beneficiosSelecionados.includes('Outro') && (
                                    <div className="mt-4 p-3 bg-slate-100 border border-slate-300 rounded animate-fadeIn">
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Especifique o outro benefício *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Qual o nome do programa/benefício?"
                                            value={outroBeneficio}
                                            onChange={e => setOutroBeneficio(e.target.value)}
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-500 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {passo === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Localização (Foco em Evasão)</h3>
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
                    <div className="space-y-6 animate-fadeIn">
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-2 mb-4">Núcleo Familiar e Contato</h3>
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
                                <label className="block text-sm font-medium text-slate-700">Telefone do Responsável (Filiação)</label>
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