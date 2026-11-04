import { Reels } from '../Reels'
import { CtaFinal, Footer, Insights, Partners, ProvaSocial } from '../sections'
import { Architecture } from '../v2/Architecture'
import { Ecosystem } from '../v2/Ecosystem'
import { Features } from '../v2/Features'
import { Hero } from '../v2/Hero'
import { Services } from '../v2/Services'
import { usePageMeta } from './ui'
import { HOME_SEO } from '../seo/site'

/* Home no design v2 (Figma 78:239): hero 3D, serviços em rolagem, arquitetura e ecossistema.
   As seções seguintes não estão no Figma e seguem a mesma identidade. */
export function HomePage({ isMobile }: { isMobile: boolean }) {
  usePageMeta(HOME_SEO.title, HOME_SEO.description)

  return (
    <>
      <main className="page home">
        <Hero />
        <Partners />
        <Services />
        <Architecture isMobile={isMobile} />
        <Ecosystem />
        <Reels />
        <Features />
        <ProvaSocial />
        <Insights />
        <CtaFinal />
      </main>
      <Footer />
    </>
  )
}
