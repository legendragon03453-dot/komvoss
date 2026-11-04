/*
 * SEO de todas as rotas do site, num lugar só. Usado:
 *  - pelas páginas (título, descrição, canonical e Open Graph ao navegar);
 *  - pelo build (vite.config.ts), que gera um HTML por rota já com essas tags e os dados
 *    estruturados (Schema.org), além do sitemap.xml e do robots.txt.
 * Só importa dados do CMS (sem componentes), para poder rodar no build.
 */
import { SOLUTIONS } from '../cms/solucoes'
import { COMPANIES } from '../cms/empresas'
import { ARTICLES } from '../cms/insights'
import { CONTACT } from '../cms/site'
import { komvosMind } from '../cms/pages/komvos-mind'
import { ecossistema } from '../cms/pages/ecossistema'
import { clientes } from '../cms/pages/clientes'
import { insights } from '../cms/pages/insights'
import { sobre } from '../cms/pages/sobre'
import { contato } from '../cms/pages/contato'
import { parceiro } from '../cms/pages/parceiro'
import { trabalhe } from '../cms/pages/trabalhe'
import { erp, komvosOs } from '../cms/pages/arquitetura'
import { HOME_SEO, OG_IMAGE, SITE_NAME, SITE_URL, SOLUCOES_SEO, articleSeo, solutionSeo } from './site'

export { HOME_SEO, OG_IMAGE, SITE_NAME, SITE_URL }

export type RouteSeo = {
  path: string
  title: string
  description: string
  /** página no sitemap: prioridade e frequência de mudança */
  priority: number
  changefreq: 'weekly' | 'monthly' | 'yearly'
  /** tipo do Open Graph */
  ogType?: 'website' | 'article'
  /** dados estruturados (JSON-LD) específicos da página */
  jsonLd?: object[]
}

const abs = (p: string) => SITE_URL + (p === '/' ? '' : p)

const ORG_ID = `${SITE_URL}/#organization`

/** Organização (aparece em todas as páginas). */
export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NAME,
  alternateName: 'Komvos',
  url: SITE_URL,
  logo: `${SITE_URL}/assets/logo-komvos-prata.webp`,
  slogan: 'Tecnologia que transforma',
  email: CONTACT.email,
  telephone: '+55 ' + CONTACT.phone,
  sameAs: [CONTACT.linkedin, CONTACT.instagram],
  foundingDate: '2006',
  subOrganization: COMPANIES.map((c) => ({ '@type': 'Organization', name: c.name, description: c.area })),
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: CONTACT.email,
    telephone: '+55 ' + CONTACT.phone,
    areaServed: 'BR',
    availableLanguage: 'Portuguese',
  },
}

const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'pt-BR',
  publisher: { '@id': ORG_ID },
}

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{ name: 'Início', path: '/' }, ...items].map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: abs(it.path),
  })),
})

const page = (path: string, name: string, seo: { title: string; description: string }, extra: Partial<RouteSeo> = {}): RouteSeo => ({
  path,
  ...seo,
  priority: 0.7,
  changefreq: 'monthly',
  jsonLd: [breadcrumbs([{ name, path }])],
  ...extra,
})

export const ROUTES: RouteSeo[] = [
  { path: '/', ...HOME_SEO, priority: 1, changefreq: 'weekly', jsonLd: [websiteLd] },
  page('/solucoes', 'Soluções', SOLUCOES_SEO, {
    priority: 0.9,
    jsonLd: [
      breadcrumbs([{ name: 'Soluções', path: '/solucoes' }]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: SOLUTIONS.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, url: abs(`/solucoes/${s.slug}`) })),
      },
    ],
  }),
  ...SOLUTIONS.map((s) => {
    const seo = solutionSeo(s)
    const path = `/solucoes/${s.slug}`
    return page(path, s.title, seo, {
      priority: 0.9,
      jsonLd: [
        breadcrumbs([
          { name: 'Soluções', path: '/solucoes' },
          { name: s.title, path },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: s.title,
          serviceType: s.title,
          description: `${s.short} ${s.problem}`,
          url: abs(path),
          areaServed: 'BR',
          provider: { '@id': ORG_ID },
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: s.title,
            itemListElement: s.deliveries.map((d) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: d.title, description: d.text },
            })),
          },
        },
      ],
    })
  }),
  page(erp.path, 'ERP by Senior', erp.seo, { priority: 0.9 }),
  page(komvosOs.path, 'Komvos OS', komvosOs.seo, { priority: 0.9 }),
  page('/komvos-mind', 'Komvos Mind', komvosMind.seo, { priority: 0.9 }),
  page('/ecossistema', 'Ecossistema', ecossistema.seo, { priority: 0.8 }),
  page('/clientes', 'Clientes', clientes.seo),
  page('/insights', 'Insights', insights.seo, { priority: 0.8, changefreq: 'weekly' }),
  ...ARTICLES.map((a) => {
    const path = `/insights/${a.slug}`
    return page(path, a.title, articleSeo(a), {
      priority: 0.6,
      ogType: 'article' as const,
      jsonLd: [
        breadcrumbs([
          { name: 'Insights', path: '/insights' },
          { name: a.title, path },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: a.title,
          description: a.excerpt,
          articleSection: a.cat,
          inLanguage: 'pt-BR',
          url: abs(path),
          mainEntityOfPage: abs(path),
          image: SITE_URL + OG_IMAGE,
          author: { '@id': ORG_ID },
          publisher: { '@id': ORG_ID },
        },
      ],
    })
  }),
  page('/sobre', 'Sobre', sobre.seo),
  page('/contato', 'Entre em contato', contato.seo, { priority: 0.8 }),
  page('/seja-um-parceiro', 'Seja um parceiro', parceiro.seo),
  page('/trabalhe-conosco', 'Trabalhe conosco', trabalhe.seo, { priority: 0.5 }),
]

