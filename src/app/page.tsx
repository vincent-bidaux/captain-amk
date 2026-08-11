export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Captain AMK
      </h1>
      <p className="max-w-xl text-balance text-base text-muted">
        Aide à la cotation NGAP pour les masseurs-kinésithérapeutes. Collez le
        texte d&apos;une ordonnance, l&apos;app propose la cotation et montre
        son raisonnement, étape par étape, corrigeable à tout moment.
      </p>
      <p className="text-sm text-muted">
        En construction — code source ouvert.
      </p>
    </main>
  );
}
