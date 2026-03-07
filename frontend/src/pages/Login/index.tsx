import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api'; // <-- Caminho atualizado!

export default function Login() {
    const [email, setEmail] = useState('');
    const [senhaEscola, setSenhaEscola] = useState('');
    const [senhaIndividual, setsenhaIndividual] = useState('');

    const [etapa, setEtapa] = useState(1);
    const [escolaNome, setEscolaNome] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const navigate = useNavigate();

    const handleLoginEtapa1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            const resposta = await api.post('/usuario/login/etapa1', { email, senhaEscola });
            setEscolaNome(resposta.data.escolaNome);
            setEtapa(2);
        } catch (error: any) {
            setErro(error.response?.data?.message || 'Credenciais da unidade escolar inválidas.');
        } finally {
            setCarregando(false);
        }
    };

    const handleLoginEtapa2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            const resposta = await api.post('/usuario/login/etapa2', {
                email: email,
                senhaIndividual: senhaIndividual
            });

            localStorage.setItem('token', resposta.data);
            localStorage.setItem('escolaNome', escolaNome); // <-- SALVA A ESCOLA
            navigate('/dashboard');
        } catch (error: any) {
            setErro(error.response?.data?.message || 'Código de acesso do servidor inválido.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 transition-all duration-500">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">Controle de Frequência</h1>
                    <p className="text-slate-500 mt-2">Acesso Restrito - Rede Municipal</p>
                </div>

                {erro && (
                    <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm rounded animate-pulse">
                        {erro}
                    </div>
                )}

                {etapa === 1 && (
                    <form onSubmit={handleLoginEtapa1} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Institucional</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="servidor@prefeitura.rj.gov.br" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Senha da Unidade Escolar</label>
                            <input type="password" required value={senhaEscola} onChange={(e) => setSenhaEscola(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={carregando} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:bg-blue-400">
                            {carregando ? 'Verificando unidade...' : 'Continuar'}
                        </button>
                    </form>
                )}

                {etapa === 2 && (
                    <form onSubmit={handleLoginEtapa2} className="space-y-6 animate-fadeIn">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center mb-6">
                            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Unidade Confirmada</p>
                            <p className="text-lg text-blue-900 font-semibold">{escolaNome}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Código de Acesso do Servidor</label>
                            <input type="password" required value={senhaIndividual} onChange={(e) => setsenhaIndividual(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-[0.2em] font-mono transition-all" placeholder="Insira o código de segurança" />
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setEtapa(1)} className="w-1/3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-lg transition-colors">
                                Voltar
                            </button>
                            <button type="submit" disabled={carregando} className="w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:bg-green-400">
                                {carregando ? 'Autenticando...' : 'Acessar Sistema'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}