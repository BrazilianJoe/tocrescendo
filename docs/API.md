# API de publicação v1

A API em `/api/v1` cria, edita, publica e remove artigos sem sessão do painel administrativo. Ela não altera a autenticação por sessão existente em `/api/admin/*`.

## Configuração na Vercel

Defina estas variáveis de ambiente antes de usar a API:

- `NEXT_PUBLIC_SITE_URL=https://www.tocrescendo.com.br` (URL canônica pública, sem barra final).
- `API_V1_TOKEN_HASH`: hash SHA-256 hexadecimal do token Bearer. Gere-o com `npm run api:token`.
- `API_V1_AUTHOR_ID`: UUID de um usuário `ADMIN` que já exista na tabela `users`. O autor é obrigatório para todos os posts criados pela API e para uploads de mídia.
- `CRON_SECRET`: segredo aleatório usado pelo Vercel Cron.
- `BLOB_READ_WRITE_TOKEN`: obrigatório em produção para que os uploads sejam armazenados no Vercel Blob. Sem ele, o fallback `/public/uploads` serve somente para desenvolvimento local.

`API_V1_TOKEN_HASH` é a única forma de armazenar o token da API: nunca grave o token puro no repositório ou em uma variável de ambiente. O script mostra o token puro uma única vez e mostra também o hash a cadastrar.

## Autenticação

Envie o token puro em todas as rotas `/api/v1`:

```http
Authorization: Bearer SEU_TOKEN
```

Cabeçalhos ausentes, malformados, token incorreto, hash ausente ou hash malformado recebem `401`. A comparação é feita com hash SHA-256 e comparação em tempo constante.

## Endpoints

| Método | Caminho | Descrição |
| --- | --- | --- |
| `GET` | `/api/v1/posts?status=DRAFT&page=1&pageSize=20` | Lista posts autenticados. `status`, `page` e `pageSize` são opcionais; o máximo é 100 por página. |
| `POST` | `/api/v1/posts` | Cria um post. O status padrão é `DRAFT`. |
| `GET` | `/api/v1/posts/:idOrSlug` | Busca por UUID ou slug. |
| `PATCH` | `/api/v1/posts/:idOrSlug` | Atualiza os campos enviados. |
| `DELETE` | `/api/v1/posts/:idOrSlug` | Exclui um post. |
| `POST` | `/api/v1/upload` | Envia `multipart/form-data` com `file` e `alt` opcional. Aceita JPEG, PNG, WebP, GIF e AVIF de até 4 MiB e 25 megapixels. |

Respostas de listagem usam `{ data, pagination: { page, pageSize, hasMore, nextPage } }`. As rotas de post retornam o registro completo, incluindo o JSON TipTap armazenado.

## Campos de post

No `POST`, `title` é obrigatório. Os demais campos são opcionais:

- `slug`: substituição opcional do slug; continua normalizado e testado contra unicidade. Se omitido, é gerado a partir do título.
- `summary`: até 500 caracteres.
- `content`: JSON validado pelo schema TipTap ou Markdown em uma string. O conversor aceita títulos, parágrafos, listas simples, citações, separadores, código, ênfase e links HTTP(S). HTML entra como texto. O limite serializado é 500.000 caracteres.
- `coverAvifUrl`, `coverWebpUrl` e `coverAlt`: URLs `http(s)` ou caminhos locais `/uploads/...`; o texto alternativo tem até 200 caracteres.
- `seoTitle` e `seoDescription`: substituem, respectivamente, o título e a descrição usados na metadata do artigo. Os limites são 200 e 500 caracteres.
- `status`: `DRAFT` ou `PUBLISHED`.
- `publishedAt`: data ISO 8601 com timezone, por exemplo `2026-12-01T15:00:00-03:00`.

Um `POST` sem `status` sempre cria rascunho. Para publicar um rascunho imediatamente, envie `status: "PUBLISHED"` e omita `publishedAt`. Para agendar, mantenha `status: "DRAFT"` e envie um `publishedAt` futuro. Para cancelar um agendamento, envie `publishedAt: null` enquanto o post estiver em `DRAFT`. O status `PUBLISHED` aceita somente datas presentes ou passadas. Se um `PATCH` receber `409` por uma alteração concorrente, consulte o post novamente antes de atualizar.

Quando um post publicado é criado, alterado, excluído ou promovido pelo cron, `/blog`, a página do post e `/sitemap.xml` são revalidados. A listagem pública e o sitemap também exigem `PUBLISHED` e uma data de publicação que não esteja no futuro.

## Exemplos cURL

```bash
export API_TOKEN='cole-o-token-gerado-aqui'
export API_URL='https://www.tocrescendo.com.br'

curl -X POST "$API_URL/api/v1/posts" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Como criar uma rotina de estudos",
    "summary": "Sugestões práticas para famílias.",
    "content": "## Um passo por vez\n\nComece com uma rotina simples.",
    "seoTitle": "Rotina de estudos para crianças",
    "status": "DRAFT"
  }'

curl -X PATCH "$API_URL/api/v1/posts/como-criar-uma-rotina-de-estudos" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"summary":"Uma nova descrição curta."}'

curl -X PATCH "$API_URL/api/v1/posts/como-criar-uma-rotina-de-estudos" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"PUBLISHED"}'

curl -X POST "$API_URL/api/v1/upload" \
  -H "Authorization: Bearer $API_TOKEN" \
  -F 'file=@/caminho/para/capa.jpg' \
  -F 'alt=Criança estudando com material colorido'
```

Use os valores `srcAvif` e `srcWebp` da resposta de upload em `coverAvifUrl` e `coverWebpUrl`, ou em nós `optimizedImage` do conteúdo TipTap.

Na Vercel, o arquivo pode ter até 4 MiB. A requisição inteira, incluindo os campos e os cabeçalhos de cada parte, pode ter até 4,25 MiB. Requisições acima do limite recebem `413`.

## Agendamento e Vercel Cron

No plano Hobby, `vercel.json` agenda uma chamada diária a `GET /api/cron/publish-scheduled` com `0 11 * * *` (11:00 UTC, 08:00 em America/Sao_Paulo). A Vercel Hobby pode iniciar o job em qualquer minuto da hora agendada. O Vercel envia `Authorization: Bearer $CRON_SECRET`. A rota devolve `401` quando o segredo está ausente ou incorreto. O cron promove os rascunhos cujo `publishedAt` já chegou para `PUBLISHED` e revalida as páginas públicas. Um agendamento fica pendente até a primeira execução bem-sucedida a partir de `publishedAt`.

## Migrações

Este repositório passa a versionar migrações em `drizzle/`. A primeira migração pressupõe o schema anterior, gerenciado por `drizzle-kit push`. Ela adiciona `posts.seo_title` e `posts.seo_description` com `ADD COLUMN IF NOT EXISTS`. O Drizzle cria seu schema e sua tabela de controle de migrações, caso ainda estejam ausentes. Em um banco novo, restaure ou crie o schema anterior antes de aplicar a migração incremental. Aplique a migração no banco de destino antes de publicar o código que usa as novas colunas.

```bash
npm run db:migrate
```
