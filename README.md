# Komvos — site institucional + painel

Site do **Grupo Komvos** (ecossistema de soluções empresariais: gestão, RH, cloud, dados e IA), com um painel administrativo próprio para editar conteúdo, publicar artigos e acompanhar leads e acessos.

🔗 **No ar:** https://komvoss.vercel.app

## Stack

- **React 18 + TypeScript + Vite 6**
- **React Router 7** — rotas do site
- **GSAP + Lenis** — animações e scroll suave
- **Supabase** — conteúdo editável, artigos, leads, eventos de acesso e usuários do painel
- **Vercel** — hospedagem + funções serverless (`/api`)

## Páginas

| Rota | Conteúdo |
| --- | --- |
| `/` | Home |
| `/solucoes`, `/solucoes/:slug` | Soluções e página de cada solução |
| `/erp-by-senior`, `/komvos-os`, `/komvos-mind` | Produtos e plataformas |
| `/ecossistema`, `/clientes`, `/sobre` | Institucional |
| `/insights`, `/insights/:slug` | Blog / artigos |
| `/contato`, `/seja-um-parceiro`, `/trabalhe-conosco` | Formulários (viram leads no painel) |
| `/painel` | Painel administrativo (noindex) |

## Painel (`/painel`)

Login via Supabase Auth. Seções: visão geral, **leads**, **estatísticas** de acesso (país/estado/cidade), **editor do site**, **blog**, **studio** e **usuários**. Sem Supabase configurado, o painel abre em modo demonstração.

## Edição pelo painel (novidades)

- **Formulários** (Editar site → Entre em contato / Seja um parceiro → Formulário): adicionar, remover e reordenar campos; tipos texto, e-mail, telefone, link, número, data, lista suspensa, seleção única, múltipla escolha, aceite e arquivo; obrigatório e meia largura.
- **Instagram da Home** (Editar site → Home → Vídeos): adicionar, remover e reordenar publicações (reel ou post) com capa.
- **Trabalhe conosco**: botão para o Portal de Talentos no lugar do formulário; vídeo de capa opcional (Banner do topo).
- **Insights**: bloco “Texto” com editor completo (Parágrafo/H1…H5, fonte, tamanho, cor, listas, links, tabelas; colar do Word/Google Docs) e “Estilos do blog” (padrão de fonte, tamanho e cor por estilo + cor dos links).
- Toda conversão nos formulários vai também por e-mail (`/api/lead-mail`).

## Estrutura

```
src/
  pages/       páginas do site
  v2/          seções da home (hero, serviços, ecossistema…)
  cms/         conteúdo padrão (soluções, empresas, insights, menu)
  live/        conteúdo vivo vindo do Supabase, leads e tracking
  painel/      app do painel administrativo
  seo/         título, descrição e JSON-LD de cada rota
api/
  geo.js           localização aproximada do visitante (headers da Vercel)
  admin-users.js   gestão de usuários do painel (usa a chave secreta, só no servidor)
  lead-mail.js     e-mail de cada lead dos formulários para o marketing
supabase/schema.sql   tabelas, RLS e policies
seo-plugin.ts         gera um HTML por rota + sitemap.xml + robots.txt no build
site-images-plugin.ts imagens do site no build
```

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha as variáveis
npm run dev
```

Build de produção:

```bash
npm run build   # tsc + vite build → dist/
npm run preview
```

## Variáveis de ambiente

| Variável | Onde | Uso |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | front | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | front | chave pública (anon) |
| `SUPABASE_URL` | servidor | URL do Supabase para `/api/admin-users` |
| `SUPABASE_SECRET_KEY` | servidor | chave secreta — **nunca** expor no front |
| `LEAD_MAIL_TO` | servidor | (opcional) destino dos e-mails de lead; padrão marketing@grupokomvos.com.br |
| `RESEND_API_KEY`, `LEAD_MAIL_FROM` | servidor | (opcional) envio pelo Resend; sem eles, `/api/lead-mail` usa o FormSubmit (ativar uma vez pelo e-mail de confirmação) |

## Banco

Rode `supabase/schema.sql` no SQL Editor do Supabase. Cria `admin_users`, `leads`, `events`, `site_content` e `posts` com RLS.

## Deploy

Projeto Vercel com framework **Vite** (`vercel.json` já define build, cache de assets, cabeçalhos do painel e rotas). Configure as variáveis de ambiente no painel da Vercel e rode `vercel --prod`.
