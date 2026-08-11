import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = { title: "Sources — Captain AMK" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-2 flex flex-col gap-2 text-muted">{children}</div>
    </section>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline"
    >
      {children}
    </a>
  );
}

export default function SourcesPage() {
  return (
    <StaticPage
      title="Sources"
      subtitle="Sur quoi se base Captain AMK, et ce qu'il ne faut pas lui demander."
    >
      <Section title="Principe">
        <p>
          Captain AMK ne laisse jamais un modèle d&apos;IA inventer une cotation.
          Toute la logique de cotation est un{" "}
          <strong className="text-foreground">arbre de décision déterministe et versionné</strong>{" "}
          (94 actes, 138 nœuds, 90 feuilles), construit à la main à partir du
          texte réglementaire de la NGAP. Le modèle d&apos;IA (Claude Sonnet 5
          par défaut, Opus 5 en option) ne fait qu&apos;une chose : lire le
          texte de l&apos;ordonnance et choisir,
          à chaque embranchement de l&apos;arbre, l&apos;option la plus probable —
          ou s&apos;arrêter et poser la question si le texte ne permet pas de
          trancher. C&apos;est l&apos;arbre qui produit la cotation, jamais le
          modèle directement. Chaque résultat est donc traçable, corrigeable au
          clic, et rejouable.
        </p>
      </Section>

      <Section title="Source normative">
        <p>
          Référence unique :{" "}
          <strong className="text-foreground">
            NGAP (Nomenclature Générale des Actes Professionnels), titre XIV —
            actes de rééducation et de réadaptation fonctionnelles
          </strong>
          , version en vigueur du 21/06/2026, telle que refondue par
          l&apos;avenant n° 7 à la convention nationale des masseurs-kinésithérapeutes
          (entré en vigueur le 22/02/2024).
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <ExtLink href="https://www.ameli.fr/sites/default/files/Documents/NGAP-21062026.pdf">
              NGAP — version du 21/06/2026 (PDF officiel, ameli.fr)
            </ExtLink>{" "}
            — source normative unique utilisée pour construire l&apos;arbre.
          </li>
          <li>
            <ExtLink href="https://www.ameli.fr/sites/default/files/Documents/NGAP-28052026.pdf">
              NGAP — version du 28/05/2026 (ameli.fr)
            </ExtLink>{" "}
            — version précédente, consultée pour comparaison.
          </li>
          <li>
            <ExtLink href="https://www.ameli.fr/masseur-kinesitherapeute/exercice-liberal/facturation-remuneration/nouvelle-nomenclature">
              La nouvelle nomenclature des actes de kinésithérapie — ameli.fr
            </ExtLink>
          </li>
          <li>
            <ExtLink href="https://www.ameli.fr/masseur-kinesitherapeute/exercice-liberal/facturation-remuneration/tarifs-conventionnels/tarifs">
              Les tarifs conventionnels — ameli.fr
            </ExtLink>{" "}
            — valeurs de la lettre-clé, IFD/IFS/IK, majorations.
          </li>
          <li>
            <ExtLink href="https://gard.ordremk.fr/files/2024/11/CVL_Livret-avenant-7-kine-web_VF.pdf">
              Avenant n° 7 à la convention nationale (livret, Ordre des
              masseurs-kinésithérapeutes)
            </ExtLink>
          </li>
          <li>
            <ExtLink href="https://actus-ps-74.cpam-haute-savoie.fr/sitepad-data/uploads/2025/01/GUIDE-PRATIQUE-DE-LA-NGAP-MASSO-KINESITHERAPIE_Assurance-Maladie-AURA_janvier-2025.pdf">
              Guide pratique de la NGAP en masso-kinésithérapie (Assurance
              Maladie AURA)
            </ExtLink>{" "}
            — pédagogique, utilisé en lecture croisée ; antérieur aux
            revalorisations de 2026.
          </li>
        </ul>
        <p>
          Une copie du PDF source et son extraction texte du titre XIV sont
          conservées dans le dépôt (
          <code className="rounded bg-background px-1 py-0.5 text-xs">
            data/sources/
          </code>
          ), avec la spécification complète qui en a été tirée (
          <code className="rounded bg-background px-1 py-0.5 text-xs">
            docs/SPEC-NGAP.md
          </code>
          ).
        </p>
      </Section>

      <Section title="Ce qu'il y a dans les données">
        <p>
          <code className="rounded bg-background px-1 py-0.5 text-xs">
            data/actes-ngap.json
          </code>{" "}
          : le catalogue des 94 actes du titre XIV (lettre-clé, coefficient,
          référentiel HAS éventuel, éligibilité à l&apos;IFS).{" "}
          <code className="rounded bg-background px-1 py-0.5 text-xs">
            data/arbre-decision.json
          </code>{" "}
          : le graphe de 138 nœuds (90 feuilles) reliant chaque embranchement
          clinique à un acte. Le point de départ du raisonnement : le
          coefficient (8,07 / 8,08 / 8,09…) n&apos;est pas qu&apos;une base
          tarifaire, c&apos;est un identifiant d&apos;acte — deux coefficients
          proches peuvent désigner des actes cliniquement très différents. Le
          tarif se calcule ensuite simplement : coefficient × valeur de la
          lettre-clé (2,21 € en métropole, 2,43 € outre-mer).
        </p>
      </Section>

      <Section title="Défis rencontrés">
        <ul className="ml-4 list-disc space-y-2">
          <li>
            <strong className="text-foreground">
              Aucun mapping officiel « texte de l&apos;ordonnance → acte ».
            </strong>{" "}
            Le médecin écrit en langage libre (« 15 séances de kiné pour
            gonalgie droite post-arthroscopie »). Faire correspondre ce texte à
            un embranchement de l&apos;arbre est un problème de compréhension du
            langage, pas une règle juridique écrite quelque part — d&apos;où le
            choix d&apos;un modèle de langage en amont de l&apos;arbre, plutôt
            qu&apos;une simple recherche de mots-clés.
          </li>
          <li>
            <strong className="text-foreground">
              Le « coefficient » n&apos;est pas qu&apos;un chiffre.
            </strong>{" "}
            La distinction entre deux actes voisins tient parfois à une
            exclusion de routage précise (par exemple : deux territoires du
            même membre relèvent d&apos;un article différent de deux territoires
            distincts) — une lecture rapide de la NGAP peut facilement inverser
            ce genre de règle.
          </li>
          <li>
            <strong className="text-foreground">
              Le texte réglementaire change souvent.
            </strong>{" "}
            Trois versions de la NGAP entre janvier et juin 2026. La
            spécification et les données repartent toujours du PDF officiel
            ameli.fr, jamais d&apos;un résumé tiers.
          </li>
        </ul>
      </Section>

      <Section title="Limites connues">
        <ul className="ml-4 list-disc space-y-2">
          <li>
            <strong className="text-foreground">
              Des informations manquent souvent à l&apos;ordonnance elle-même.
            </strong>{" "}
            Contexte chirurgical, date de sortie d&apos;hospitalisation (pour
            l&apos;IFS), âge du patient, nombre de séances déjà réalisées dans
            les 12 mois (seuils d&apos;accord préalable) : quand ce n&apos;est pas
            écrit, l&apos;app pose la question plutôt que de deviner — mais elle
            ne peut pas deviner ce que le médecin n&apos;a pas précisé.
          </li>
          <li>
            <strong className="text-foreground">
              L&apos;accord préalable et les seuils de référentiel HAS ne sont
              pas vérifiés automatiquement.
            </strong>{" "}
            L&apos;arbre identifie l&apos;acte, pas le nombre de séances déjà
            facturées dans l&apos;année pour ce patient.
          </li>
          <li>
            <strong className="text-foreground">Hébergement.</strong> L&apos;app
            est hébergée sur Netlify, qui n&apos;est pas un hébergeur certifié
            HDS (données de santé). C&apos;est pourquoi la conservation du nom du
            patient et du texte de l&apos;ordonnance reste une option explicite
            (case à cocher), jamais automatique.
          </li>
          <li>
            <strong className="text-foreground">
              Le modèle d&apos;IA peut se tromper sur l&apos;extraction.
            </strong>{" "}
            Même si l&apos;arbre lui-même est déterministe, une mauvaise lecture
            du texte source peut conduire à un mauvais choix à un embranchement
            — d&apos;où le fil d&apos;Ariane entièrement corrigeable au clic, et le
            rappel systématique que la cotation finale reste sous la
            responsabilité du praticien.
          </li>
        </ul>
      </Section>
    </StaticPage>
  );
}
