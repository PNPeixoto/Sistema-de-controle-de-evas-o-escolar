import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senhaEscola, setSenhaEscola] = useState('');
    const [senhaIndividual, setSenhaIndividual] = useState('');

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

            const token = resposta.data;
            localStorage.setItem('token', token);
            localStorage.setItem('escolaNome', escolaNome);

            // Busca o cargo real no back-end para liberar as permissões da SEMED
            try {
                const userResp = await api.get(`/usuario/email?email=${encodeURIComponent(email)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                localStorage.setItem('cargo', userResp.data.cargo);
            } catch (err) {
                localStorage.setItem('cargo', 'ESCOLA');
            }

            navigate('/dashboard');
        } catch (error: any) {
            setErro(error.response?.data?.message || 'Código de acesso do servidor inválido.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* ========================================== */}
            {/* HERO BANNER ESCURO (Metade superior da tela) */}
            {/* ========================================== */}
            <div className="absolute top-0 left-0 right-0 h-[45vh] bg-gradient-to-b from-slate-900 to-slate-800 rounded-b-[4rem] shadow-xl z-0"></div>

            {/* MARCA D'ÁGUA SUTIL NO FUNDO */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-multiply"
                style={{
                    backgroundImage: "url('/logoceduc.jpeg')",
                    backgroundPosition: 'center 75%', // Joga a imagem mais para baixo, na área clara
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '50%'
                }}
            />

            {/* ========================================== */}
            {/* LOGOS FLUTUANDO NO TOPO ESCURO */}
            {/* ========================================== */}
            <div className="flex items-center justify-center gap-6 mb-8 relative z-10 mt-[-5vh]">
                <img
                    src="/logo-padrao.png"
                    alt="Prefeitura de Macaé"
                    className="h-16 md:h-20 w-auto object-contain drop-shadow-2xl"
                />

                {/* Divisória elegante */}
                <div className="h-12 md:h-14 w-px bg-slate-600/60 rounded-full"></div>

                {/* Moldura branca para o CEDUC */}
                <div className="bg-white rounded-xl p-1.5 shadow-xl">
                    <img
                        src="/logoceduc.jpeg"
                        alt="CEDUC"
                        className="h-12 md:h-14 w-auto object-contain rounded-lg"
                    />
                </div>
            </div>

            {/* ========================================== */}
            {/* CARD DE LOGIN (Sobrepondo o banner) */}
            {/* ========================================== */}
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-10 transition-all duration-500 relative z-10 border border-slate-200/50 backdrop-blur-xl">

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Sistema PNP</h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">Acesso Restrito - Rede Municipal</p>
                </div>

                {erro && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center shadow-sm animate-fadeIn">
                        ⚠️ {erro}
                    </div>
                )}

                {etapa === 1 && (
                    <form onSubmit={handleLoginEtapa1} className="space-y-5 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">E-mail Institucional</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-slate-700"
                                placeholder="servidor@prefeitura.rj.gov.br"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Senha da Unidade</label>
                            <input
                                type="password"
                                required
                                value={senhaEscola}
                                onChange={(e) => setSenhaEscola(e.target.value)}
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-slate-700"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={carregando}
                            className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-blue-600/30 disabled:opacity-70 mt-4 text-lg"
                        >
                            {carregando ? 'Verificando unidade...' : 'Avançar →'}
                        </button>
                    </form>
                )}

                {etapa === 2 && (
                    <form onSubmit={handleLoginEtapa2} className="space-y-6 animate-fadeIn">
                        <div className="bg-blue-50/70 border border-blue-100 p-5 rounded-2xl text-center shadow-inner">
                            <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mb-1">Unidade Autenticada</p>
                            <p className="text-lg text-slate-800 font-black">{escolaNome}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Código de Acesso do Servidor</label>
                            <input
                                type="password"
                                required
                                value={senhaIndividual}
                                onChange={(e) => setSenhaIndividual(e.target.value)}
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 outline-none text-center tracking-[0.3em] font-mono transition-all text-xl"
                                placeholder="INSIRA O CÓDIGO"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setEtapa(1)}
                                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 px-4 rounded-xl transition-colors border border-slate-200"
                            >
                                Voltar
                            </button>
                            <button
                                type="submit"
                                disabled={carregando}
                                className="w-2/3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-600/30 disabled:opacity-70 text-lg"
                            >
                                {carregando ? 'Entrando...' : 'Acessar ✓'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <div className="mt-8 text-center text-slate-400 text-xs font-medium relative z-10 tracking-wide">
                <p>Prefeitura Municipal de Macaé</p>
                <p>Coordenação de Educação Social</p>
            </div>
        </div>
    );
}