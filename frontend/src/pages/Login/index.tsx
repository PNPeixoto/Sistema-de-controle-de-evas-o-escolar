import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/http';

const ACCENT = '#2557d6';

type LoginStep = 1 | 2;
type CardState = 'form' | 'success';
type FieldName = 'email' | 'senhaEscola' | 'senhaIndividual';

interface FloatingInputProps {
    id: FieldName;
    label: string;
    type: string;
    value: string;
    icon: ReactNode;
    autoComplete: string;
    focused: boolean;
    error: boolean;
    placeholder?: string;
    inputMode?: 'email' | 'text';
    trailing?: ReactNode;
    onFocus: () => void;
    onBlur: () => void;
    onChange: (value: string) => void;
}

export default function Login() {
    const [email, setEmail] = useState('');
    const [senhaEscola, setSenhaEscola] = useState('');
    const [senhaIndividual, setSenhaIndividual] = useState('');
    const [etapa, setEtapa] = useState<LoginStep>(1);
    const [cardState, setCardState] = useState<CardState>('form');
    const [escolaNome, setEscolaNome] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [campoFocado, setCampoFocado] = useState<FieldName | null>(null);
    const [mostrarSenhaEscola, setMostrarSenhaEscola] = useState(false);
    const [mostrarCodigo, setMostrarCodigo] = useState(false);
    const [mounted, setMounted] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const timer = window.setTimeout(() => setMounted(true), 50);
        return () => window.clearTimeout(timer);
    }, []);

    const validarEtapa1 = () => {
        if (!email.trim()) return 'Informe o e-mail institucional.';
        if (!email.includes('@')) return 'E-mail invalido.';
        if (!senhaEscola) return 'Informe a senha da unidade.';
        return '';
    };

    const validarEtapa2 = () => {
        if (!senhaIndividual) return 'Informe o codigo de acesso do servidor.';
        return '';
    };

    const handleLoginEtapa1 = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const erroValidacao = validarEtapa1();
        if (erroValidacao) {
            setErro(erroValidacao);
            return;
        }

        setErro('');
        setCarregando(true);

        try {
            const resposta = await api.post<{ escolaNome: string }>('/usuario/login/etapa1', { email, senhaEscola });
            setEscolaNome(resposta.data.escolaNome);
            setSenhaIndividual('');
            setEtapa(2);
        } catch (error: unknown) {
            setErro(getApiErrorMessage(error, 'Credenciais da unidade escolar invalidas.'));
        } finally {
            setCarregando(false);
        }
    };

    const handleLoginEtapa2 = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const erroValidacao = validarEtapa2();
        if (erroValidacao) {
            setErro(erroValidacao);
            return;
        }

        setErro('');
        setCarregando(true);

        try {
            const resposta = await api.post<{ status?: string }>('/usuario/login/etapa2', {
                email,
                senhaIndividual
            });

            if (resposta.data?.status === 'authenticated') {
                await login();
            }

            setCardState('success');
            window.setTimeout(() => navigate('/dashboard'), 450);
        } catch (error: unknown) {
            setErro(getApiErrorMessage(error, 'Codigo de acesso do servidor invalido.'));
        } finally {
            setCarregando(false);
        }
    };

    const voltarParaEtapa1 = () => {
        setEtapa(1);
        setErro('');
        setSenhaIndividual('');
    };

    return (
        <main className="min-h-screen w-full bg-[#f7f8fa] font-['Plus_Jakarta_Sans',sans-serif] lg:flex">
            <section
                className={`relative hidden min-h-screen flex-col overflow-hidden bg-[#0d1b35] transition-all duration-700 ease-out lg:flex lg:basis-[44%] ${
                    mounted ? 'translate-x-0 opacity-100' : '-translate-x-6 opacity-0'
                }`}
            >
                <DecorativeBackground />
                <div className="relative z-10 flex min-h-screen flex-col justify-between px-[52px] py-12">
                    <div className="flex items-center gap-5">
                        <img src="/login-logo-prefeitura.png" alt="Prefeitura Municipal de Macae" className="h-[72px] w-auto object-contain" />
                        <div className="h-12 w-px bg-white/25" />
                        <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.18)]">
                            <img src="/login-logo-ceduc.png" alt="CEDUC" className="h-[50px] w-[50px] object-contain" />
                        </div>
                    </div>

                    <div className="max-w-[430px] pt-[60px]">
                        <h1 className="text-[40px] font-extrabold leading-[1.1] text-white">Sistema PNP</h1>
                        <p className="mt-5 text-sm leading-7 text-white/50">
                            Plataforma de Gestao Educacional / Coordenacao de Educacao Social
                        </p>
                    </div>

                    <p className="text-[11px] text-white/30">Prefeitura Municipal de Macae · 2025</p>
                </div>
            </section>

            <section
                className={`relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-6 py-10 transition-all delay-200 duration-700 ease-out sm:px-8 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                }`}
            >
                <img
                    src="/login-logo-ceduc.png"
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.055]"
                />

                <div className="relative z-10 w-full max-w-[440px] rounded-[20px] bg-white px-7 py-9 shadow-[0_4px_6px_rgba(0,0,0,0.04),0_20px_40px_rgba(0,0,0,0.06)] sm:px-11 sm:py-10">
                    {cardState === 'success' ? (
                        <SuccessState email={email} onBack={() => setCardState('form')} />
                    ) : (
                        <>
                            <div className="mb-5 inline-flex items-center gap-1 rounded-full bg-[#2557d618] px-2.5 py-1 text-[11px] font-semibold text-[#2557d6]">
                                <LockIcon className="h-3.5 w-3.5" />
                                Acesso Restrito - Rede Municipal
                            </div>

                            <div className="mb-7">
                                <h2 className="text-[26px] font-extrabold text-slate-900">Bem-vindo</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {etapa === 1
                                        ? 'Entre com suas credenciais institucionais para continuar.'
                                        : 'Unidade verificada. Informe o codigo individual do servidor.'}
                                </p>
                            </div>

                            {etapa === 2 && (
                                <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                                    <p className="text-xs font-bold text-blue-600">Unidade autenticada</p>
                                    <p className="mt-1 text-base font-extrabold text-slate-900">{escolaNome}</p>
                                    <p className="mt-1 text-xs text-slate-500">{email}</p>
                                </div>
                            )}

                            <form onSubmit={etapa === 1 ? handleLoginEtapa1 : handleLoginEtapa2} className="flex flex-col gap-5">
                                {etapa === 1 ? (
                                    <>
                                        <FloatingInput
                                            id="email"
                                            label="E-mail institucional"
                                            type="email"
                                            value={email}
                                            icon={<MailIcon className="h-5 w-5" />}
                                            autoComplete="email"
                                            inputMode="email"
                                            focused={campoFocado === 'email'}
                                            error={Boolean(erro) && !email.trim()}
                                            placeholder="servidor@prefeitura.rj.gov.br"
                                            onFocus={() => setCampoFocado('email')}
                                            onBlur={() => setCampoFocado(null)}
                                            onChange={setEmail}
                                        />
                                        <FloatingInput
                                            id="senhaEscola"
                                            label="Senha da unidade"
                                            type={mostrarSenhaEscola ? 'text' : 'password'}
                                            value={senhaEscola}
                                            icon={<KeyIcon className="h-5 w-5" />}
                                            autoComplete="current-password"
                                            focused={campoFocado === 'senhaEscola'}
                                            error={Boolean(erro) && !senhaEscola}
                                            placeholder="Senha da unidade"
                                            trailing={
                                                <PasswordToggle
                                                    visible={mostrarSenhaEscola}
                                                    onClick={() => setMostrarSenhaEscola((value) => !value)}
                                                />
                                            }
                                            onFocus={() => setCampoFocado('senhaEscola')}
                                            onBlur={() => setCampoFocado(null)}
                                            onChange={setSenhaEscola}
                                        />
                                    </>
                                ) : (
                                    <FloatingInput
                                        id="senhaIndividual"
                                        label="Codigo de acesso"
                                        type={mostrarCodigo ? 'text' : 'password'}
                                        value={senhaIndividual}
                                        icon={<KeyIcon className="h-5 w-5" />}
                                        autoComplete="one-time-code"
                                        focused={campoFocado === 'senhaIndividual'}
                                        error={Boolean(erro) && !senhaIndividual}
                                        placeholder="Codigo individual"
                                        trailing={
                                            <PasswordToggle
                                                visible={mostrarCodigo}
                                                onClick={() => setMostrarCodigo((value) => !value)}
                                            />
                                        }
                                        onFocus={() => setCampoFocado('senhaIndividual')}
                                        onBlur={() => setCampoFocado(null)}
                                        onChange={setSenhaIndividual}
                                    />
                                )}

                                {erro && <ErrorMessage message={erro} />}

                                <div className={etapa === 2 ? 'grid grid-cols-[0.85fr_1.4fr] gap-3' : ''}>
                                    {etapa === 2 && (
                                        <button
                                            type="button"
                                            onClick={voltarParaEtapa1}
                                            className="h-[52px] rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                                        >
                                            Voltar
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={carregando}
                                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold text-white transition-all duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:brightness-100"
                                        style={{ background: carregando ? '#94a3b8' : ACCENT }}
                                    >
                                        {carregando ? (
                                            <>
                                                <SpinnerIcon className="h-5 w-5 animate-spin" />
                                                {etapa === 1 ? 'Verificando...' : 'Entrando...'}
                                            </>
                                        ) : (
                                            <>
                                                {etapa === 1 ? 'Avancar' : 'Acessar sistema'}
                                                <ArrowRightIcon className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            <p className="mt-6 text-center text-[13px] text-slate-400">
                                Dificuldades de acesso?{' '}
                                <a href="mailto:suporte@prefeitura.rj.gov.br" className="font-semibold text-[#2557d6] hover:underline">
                                    Contate o suporte
                                </a>
                            </p>
                        </>
                    )}

                    <p className="mt-6 text-center text-[11px] text-[#b0bec5]">
                        Coordenacao de Educacao Social · Prefeitura Municipal de Macae
                    </p>
                </div>
            </section>
        </main>
    );
}

function FloatingInput({
    id,
    label,
    type,
    value,
    icon,
    autoComplete,
    focused,
    error,
    placeholder,
    inputMode,
    trailing,
    onFocus,
    onBlur,
    onChange,
}: FloatingInputProps) {
    const floating = focused || value.length > 0;
    const borderColor = error ? '#ef4444' : focused ? ACCENT : '#e2e8f0';
    const iconColor = focused ? ACCENT : '#cbd5e1';

    return (
        <div className="relative">
            <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 transition-colors" style={{ color: iconColor }}>
                {icon}
            </div>
            <label
                htmlFor={id}
                className={`pointer-events-none absolute left-11 z-10 transition-all duration-200 ${
                    floating
                        ? 'top-3 text-[10px] font-semibold uppercase text-[#2557d6]'
                        : 'top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400'
                }`}
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                inputMode={inputMode}
                autoComplete={autoComplete}
                placeholder={focused ? placeholder : ''}
                onFocus={onFocus}
                onBlur={onBlur}
                onChange={(event) => onChange(event.target.value)}
                className="h-[52px] w-full rounded-xl bg-[#fafbfc] pb-1.5 pl-11 pr-12 pt-[18px] text-sm font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-300"
                style={{
                    border: `1.5px solid ${borderColor}`,
                    boxShadow: focused ? '0 0 0 3px #2557d622' : 'none',
                }}
            />
            {trailing}
        </div>
    );
}

function PasswordToggle({ visible, onClick }: { visible: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={onClick}
            className="absolute right-3.5 top-1/2 z-20 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
        >
            {visible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
    );
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] font-medium text-red-500">
            <AlertIcon className="h-4 w-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}

function SuccessState({ email, onBack }: { email: string; onBack: () => void }) {
    return (
        <div className="py-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2557d618] text-[#2557d6]">
                <CheckIcon className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-[22px] font-bold text-slate-900">Acesso verificado</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
                Redirecionando para o sistema...
                <br />
                {email}
            </p>
            <button type="button" onClick={onBack} className="mt-6 text-sm font-semibold text-[#2557d6] hover:underline">
                Voltar ao login
            </button>
        </div>
    );
}

function DecorativeBackground() {
    return (
        <svg className="absolute inset-0 h-full w-full opacity-100" viewBox="0 0 600 900" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, index) => (
                <circle
                    key={index}
                    cx={60 + index * 60}
                    cy={200 + index * 80}
                    r={30 + index * 20}
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                    opacity="0.12"
                />
            ))}
            <polygon points="120,120 460,260 180,420" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" opacity="0.12" />
            <polygon points="400,520 560,760 220,790" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" opacity="0.12" />
            <line x1="0" y1="120" x2="600" y2="720" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
            <line x1="80" y1="900" x2="600" y2="260" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
        </svg>
    );
}

function MailIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16v12H4z" />
            <path d="m4 7 8 6 8-6" />
        </svg>
    );
}

function KeyIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8" cy="15" r="4" />
            <path d="m11 12 8-8" />
            <path d="m16 5 3 3" />
        </svg>
    );
}

function LockIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
    );
}

function EyeIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4" />
            <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18.4 18.4 0 0 1-3.1 4.3" />
            <path d="M6.6 6.6A18.2 18.2 0 0 0 2 12s3.5 8 10 8a10.8 10.8 0 0 0 4.1-.8" />
        </svg>
    );
}

function AlertIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
    );
}

function SpinnerIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

function ArrowRightIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </svg>
    );
}

function CheckIcon({ className }: { className: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}
