import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Impressum = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20 flex flex-col">
      <Header />
      <main className="flex-1 container max-w-4xl px-4 md:px-6 pt-32 pb-24">
        <h1 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">Impressum</h1>
        <div className="prose prose-invert max-w-none text-white/70 font-light space-y-6">
          <p>Angaben gemäß § 5 TMG</p>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 my-8 backdrop-blur-sm">
            <h2 className="text-2xl font-medium text-white mb-4">Kontakt</h2>
            <p className="text-white/80 leading-relaxed">
              [DEIN VOLLSTÄNDIGER NAME]<br />
              [DEINE STRASSE / NR]<br />
              [DEINE PLZ / STADT]<br />
              Deutschland
            </p>

            <h2 className="text-2xl font-medium text-white mt-8 mb-4">Kontaktmöglichkeiten</h2>
            <p className="text-white/80 leading-relaxed">
              E-Mail: [DEINE E-MAIL ADRESSE]<br />
              Discord: [DEIN DISCORD LINK/TAG]
            </p>
          </div>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>
            [DEIN NAME]<br />
            [DEINE STRASSE / NR]<br />
            [DEINE PLZ / STADT]
          </p>

          <h2 className="text-2xl font-medium text-white mt-12 mb-4">Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            <a href="https://ec.europa.eu/consumers/odr" className="text-white hover:underline ml-1" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.<br />
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impressum;
