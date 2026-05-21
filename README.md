# Tô Crescendo — Neuropsicopedagogia

Landing page profissional para atendimento neuropsicopedagógico online e presencial. Site estático em Next.js, sem banco de dados.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Erro no `npm run dev` (Turbopack / página em branco)

Se o servidor mostrar erro de cache (`Failed to open SST file`, `build-manifest.json` ENOENT), pare o dev (`Ctrl+C`) e rode:

```bash
npm run dev:clean
```

Isso apaga `.next` e reinicia. O código do site não está quebrado — é cache corrompido do Turbopack.

## Personalizar conteúdo

Edite [`content/site.ts`](content/site.ts):

| Campo | O que alterar |
|-------|----------------|
| `contact.whatsappPhone` | Número com DDI, só dígitos (ex.: `5551999999999`) |
| `contact.instagram` | URL completa do perfil |
| `professional.name` | Nome da profissional |
| `professional.credential` | Registro profissional (CRP, etc.) |
| `url` | URL final do site (para SEO e sitemap) |

Logos em [`public/`](public/):

| Arquivo | Uso |
|---------|-----|
| `logo-full.png` | Logo com texto (header, footer, redes sociais) |
| `logo-mark.jpg` | Logomarca sem texto (favicon, decoração no hero) |

Originais mantidos: `To Crescendo Logo Gemini.png`, `Fundo logomarca - Tô Crescendo.jpg`.

## Deploy na Vercel (gratuito)

1. Crie um repositório no GitHub e envie o código:

   ```bash
   git remote add origin https://github.com/SEU_USUARIO/tocrescendo.git
   git push -u origin main
   ```

2. Acesse [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório.

3. A Vercel detecta Next.js automaticamente. Clique em **Deploy**.

4. Após o deploy, atualize `site.url` em `content/site.ts` com a URL `.vercel.app` (ou domínio customizado) e faça um novo push.

### Domínio customizado

No painel da Vercel: **Settings → Domains** → adicione seu domínio e configure o DNS conforme as instruções.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção local |
| `npm run lint` | ESLint |

## Próximas fases (roadmap)

- Captação de leads (formulário + e-mail)
- Integração Google Calendar
- Agendamento online
- Assistente de IA para agendamento
