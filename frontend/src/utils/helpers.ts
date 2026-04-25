export function calcularIdade(dataNascimentoISO?: string): number {
    if (!dataNascimentoISO) return 0;
    const nascimento = new Date(dataNascimentoISO);
    if (isNaN(nascimento.getTime())) return 0;

    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const fezAniversario =
        hoje.getMonth() > nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() >= nascimento.getDate());
    if (!fezAniversario) idade--;
    return Math.max(0, idade);
}

export function formatarData(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('pt-BR');
}
