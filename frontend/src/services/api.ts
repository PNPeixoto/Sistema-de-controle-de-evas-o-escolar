import axios from 'axios';

// PRODUÇÃO: Aponte para o domínio/IP da sua VPS Hostinger com HTTPS
// Exemplos:
//   https://api.seudominio.com.br
//   https://seuip.hostinger.com:8080
// Troque a URL abaixo pelo endereço real da sua VPS
export const api = axios.create({
    baseURL: 'https://api.sistemapnp.com.br',
    withCredentials: true, // Envia cookies HttpOnly automaticamente
});
