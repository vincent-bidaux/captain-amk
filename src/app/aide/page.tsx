import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = { title: "Aide — Captain AMK" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-2 flex flex-col gap-2 text-muted">{children}</div>
    </section>
  );
}

export default function AidePage() {
  return (
    <StaticPage
      title="Aide"
      subtitle="Comment utiliser Captain AMK, étape par étape."
    >
      <Section title="1. Donner l'ordonnance">
        <p>
          Deux façons de faire, sur la page d&apos;accueil : coller le texte de la
          prescription directement dans la zone de texte, ou cliquer sur{" "}
          <strong className="text-foreground">
            « Importer une photo / un PDF »
          </strong>{" "}
          (ou glisser-déposer le fichier) pour que Captain AMK transcrive
          l&apos;ordonnance à votre place. La transcription apparaît ensuite dans
          la zone de texte, modifiable avant de lancer l&apos;analyse.
        </p>
        <p>
          Formats acceptés en upload : JPEG, PNG, WebP, PDF (10 Mo max). Les
          photos sont redimensionnées automatiquement avant l&apos;envoi.
        </p>
      </Section>

      <Section title="2. Lancer l'analyse">
        <p>
          Le bouton <strong className="text-foreground">« Analyser l&apos;ordonnance »</strong>{" "}
          lance le parcours automatique de l&apos;arbre de décision NGAP : à
          chaque embranchement, le modèle lit le texte de l&apos;ordonnance et
          choisit la réponse la plus probable, avec une justification affichée
          en petit sous chaque étape.
        </p>
        <p>
          Le bouton <strong className="text-foreground">« Remplir manuellement »</strong> saute
          directement au premier embranchement, sans passer par le texte — utile
          si vous préférez répondre vous-même à toutes les questions.
        </p>
      </Section>

      <Section title="3. Répondre à une question">
        <p>
          Dès que l&apos;ordonnance ne permet pas de trancher un embranchement,
          Captain AMK s&apos;arrête et vous pose la question, avec un gros bouton
          cliquable par réponse possible.
        </p>
        <p>
          Si vous ne connaissez pas la réponse, cliquez sur{" "}
          <strong className="text-foreground">« Je ne sais pas répondre »</strong> : l&apos;app
          rédige un message prêt à copier-coller pour le demander au médecin
          prescripteur.
        </p>
      </Section>

      <Section title="4. Corriger une étape passée">
        <p>
          Le fil d&apos;Ariane (les cartes empilées verticalement) garde la trace
          de chaque question posée et de la réponse retenue. Survolez une carte
          passée et cliquez sur{" "}
          <strong className="text-foreground">« Modifier le choix »</strong> pour revenir à
          cette étape précise et repartir avec une autre réponse — tout ce qui
          suivait cette étape est recalculé.
        </p>
      </Section>

      <Section title="5. Lire le résultat">
        <p>
          Une fois l&apos;arbre parcouru jusqu&apos;à une feuille, la cotation
          proposée s&apos;affiche : lettre-clé et coefficient, tarif, indemnité
          IFS le cas échéant, et les exclusions à vérifier. Le bouton{" "}
          <strong className="text-foreground">« Copier les résultats »</strong> copie
          l&apos;ensemble (cheminement + cotation) au format texte, prêt à coller
          dans votre logiciel de facturation ou un dossier patient.
        </p>
        <p className="text-foreground">
          Cette proposition reste sous la responsabilité du praticien — à
          vérifier avant facturation.
        </p>
      </Section>

      <Section title="6. Sauvegarder une session">
        <p>
          En bas du résultat, une case à cocher{" "}
          <strong className="text-foreground">
            « Enregistrer aussi le nom du patient et la prescription »
          </strong>{" "}
          contrôle ce qui est conservé : par défaut, seul le cheminement
          (questions, réponses, justifications) est enregistré — jamais le
          texte de l&apos;ordonnance ni le nom du patient. Cochez la case si vous
          voulez retrouver cette session nommément plus tard.
        </p>
        <p>
          Les sessions enregistrées apparaissent dans la barre latérale gauche.
          Depuis la liste, vous pouvez les rouvrir, les archiver ou les
          supprimer définitivement. Les sessions archivées restent
          consultables via le lien « Voir les archivées » en bas de liste.
        </p>
      </Section>

      <Section title="7. Le coût affiché">
        <p>
          Le bandeau en haut de chaque session affiche le coût réel des appels
          au modèle d&apos;IA (transcription + décisions d&apos;arbre) pour cette
          session, en dollars US — la devise de facturation d&apos;Anthropic.
        </p>
      </Section>
    </StaticPage>
  );
}
