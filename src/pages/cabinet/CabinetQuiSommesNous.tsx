import imgChantier from '@/assets/images/cabinet-chantier.jpg';
import imgSignature from '@/assets/images/cabinet-signature.jpg';
import { firmPositioningParagraph, firmStrategicContextParagraph } from '@/data/siteCopy';
import { SEO } from '@/components/SEO';
import { PageHeroBanner } from '@/components/PageHeroBanner';

export function CabinetQuiSommesNous() {
  return (
    <>
      <SEO
        title="Qui sommes-nous — ORBIS PUBLICA"
        description="Présentation du cabinet ORBIS PUBLICA : positionnement et contexte stratégique en RDC."
      />
      <PageHeroBanner className="py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl font-bold md:text-5xl">Qui sommes-nous ?</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Identité, ancrage et mission du cabinet.</p>
        </div>
      </PageHeroBanner>

      <section className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col items-start gap-12 md:flex-row">
            <div className="md:w-1/2">
              <p className="mb-6 leading-relaxed text-slate-600">
                <strong className="text-slate-900">ORBIS PUBLICA</strong>
                {firmPositioningParagraph.replace(/^ORBIS PUBLICA/, '')}
              </p>
              <p className="leading-relaxed text-slate-600">{firmStrategicContextParagraph}</p>
            </div>
            <div className="grid w-full grid-cols-2 gap-4 md:w-1/2">
              <img
                src={imgChantier}
                alt="Chantier et ingénierie"
                className="h-48 w-full rounded-lg object-cover shadow-md"
              />
              <img
                src={imgSignature}
                alt="Documents et conformité"
                className="h-48 w-full translate-y-8 rounded-lg object-cover shadow-md"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
