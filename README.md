# Tô Crescendo — Neuropsicopedagogia

Landing page e blog para neuropsicopedagogia online e a domicílio em Porto Alegre. Next.js + Neon Postgres + TipTap (admin).

## Desenvolvimento local

```bash
npm install
cp .env.example .env.local
# Preencha DATABASE_URL, AUTH_SECRET, ADMIN_*
npm run db:push
npm run db:seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

### Blog / admin

| Item | Detalhe |
|------|---------|
| DB | Neon Postgres (`DATABASE_URL`) |
| ORM | Drizzle (`npm run db:push` / `db:generate`) |
| Auth | Auth.js credentials (`/admin/login`) |
| Editor | TipTap — salva JSON no banco |
| Imagens | Sharp → AVIF + WebP; Vercel Blob em prod (`BLOB_READ_WRITE_TOKEN`), fallback `public/uploads` em local |

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
| `logo-mark.jpg` | Logomarca sem texto (decoração) |
| `favicon.png` | Ícone do site (origem; gera `app/favicon.ico`, `app/icon.png`) |

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

## SEO e presença online

### No código (já configurado)

- Meta title e description em [`content/site.ts`](content/site.ts) → `seo`
- Headings com palavras-chave (Porto Alegre, TEA, TDAH, online, domicílio)
- `sitemap.xml`, `robots.txt`, Open Graph, canonical, JSON-LD
- Botão flutuante WhatsApp

Após o deploy, atualize `site.url` com a URL real de produção e faça push.

### Google Search Console

1. Acesse [Google Search Console](https://search.google.com/search-console)
2. Adicione a propriedade com a URL do site
3. Verifique a propriedade (tag HTML ou DNS na Vercel)
4. Envie o sitemap: `https://SEU-DOMINIO/sitemap.xml`

### Google Business Profile

1. Acesse [Google Business](https://business.google.com)
2. Crie ou reivindique o perfil (ex.: Tô Crescendo / Instituto Tô Crescendo)
3. Tipo: **área de atendimento** (Porto Alegre e região) — sem endereço de consultório se não houver
4. Preencha igual ao site:
   - Site: URL de produção
   - Telefone: (51) 99322-9937
   - Instagram: https://www.instagram.com/institutotocrescendo/
5. Descreva os serviços: avaliações TEA/TDAH, acompanhamento, online e a domicílio
6. Adicione fotos e horários de atendimento

### Validar dados estruturados

Teste em [Rich Results Test](https://search.google.com/test/rich-results) com a URL publicada.

## Próximas fases (roadmap)

- Captação de leads (formulário + e-mail)
- Integração Google Calendar
- Agendamento online
- Assistente de IA para agendamento
