import type { Metadata } from "next";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = { title: "Changelog — Captain AMK" };

function Version({
  version,
  date,
  children,
}: {
  version: string;
  date: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground">
        v{version}{" "}
        <span className="font-normal text-muted">— {date}</span>
      </h2>
      <ul className="ml-4 mt-2 list-disc space-y-1.5 text-muted">{children}</ul>
    </section>
  );
}

export default function ChangelogPage() {
  return (
    <StaticPage title="Changelog" subtitle="Historique des versions de Captain AMK.">
      <Version version="1.2.0" date="12 août 2026">
        <li>
          Sessions sauvegardées uniquement sur votre appareil (localStorage) —
          plus aucun stockage central partagé, préparation de la bêta
          publique.
        </li>
        <li>
          L&apos;enregistrement du nom du patient est désactivé pendant la
          bêta : une session sauvegardée ne contient plus jamais de donnée
          patient.
        </li>
        <li>
          Mode test : 6 ordonnances de démonstration pour découvrir l&apos;app
          sans donnée réelle, dont deux cas volontairement ambigus.
        </li>
        <li>
          Un bouton « Laisser des commentaires » à la fin de chaque cotation
          permet de nous faire un retour.
        </li>
      </Version>

      <Version version="1.1.0" date="11 août 2026">
        <li>
          Choix du modèle IA avant l&apos;analyse : Sonnet 5 par défaut (rapide,
          moins cher), Opus 5 disponible en option pour les cas où vous
          préférez plus de prudence.
        </li>
        <li>
          Le coût de la session est désormais conservé avec la session
          sauvegardée, retrouvé tel quel à la réouverture.
        </li>
        <li>
          Le dossier (patient, médecin et son téléphone, date, prescription)
          s&apos;affiche dès le lancement de l&apos;analyse, plus seulement sur
          le résultat final.
        </li>
        <li>
          Nom du patient affiché sous le titre d&apos;une session sauvegardée,
          comme dans la barre latérale.
        </li>
        <li>Icônes de l&apos;interface harmonisées, sans emoji.</li>
        <li>
          Barre latérale fixe : elle ne défile plus avec la page.
        </li>
      </Version>

      <Version version="1.0.0" date="11 août 2026">
        <li>Première version complète et publique de Captain AMK.</li>
        <li>
          Arbre de décision NGAP complet (94 actes, 138 nœuds) couvrant le
          titre XIV — traitements individuels, articles 1 à 11.
        </li>
        <li>
          Pilotage automatique de l&apos;arbre par IA (Claude Opus 5) à partir
          du texte de l&apos;ordonnance, avec arrêt et question au praticien dès
          qu&apos;une information manque.
        </li>
        <li>
          Fil d&apos;Ariane vertical, cliquable à n&apos;importe quelle étape
          pour corriger une réponse et repartir en manuel.
        </li>
        <li>
          Upload photo ou PDF de l&apos;ordonnance avec transcription
          automatique, purgée du bruit administratif et légal (identifiants,
          mentions RGPD, blocs de signature électronique…).
        </li>
        <li>
          Sessions sauvegardées et listées dans une barre latérale
          (archivage, suppression), avec conservation du nom du patient et de
          la prescription en option explicite (case à cocher), jamais par
          défaut.
        </li>
        <li>
          Cartouche de résultat (date, médecin, patient, prescription) et
          bouton de copie des résultats.
        </li>
        <li>Coût réel de chaque session affiché en dollars US.</li>
        <li>
          Barre latérale repliée à l&apos;arrivée sur le site, dépliée
          seulement une fois le travail démarré.
        </li>
        <li>Pages Aide et Sources, changelog public.</li>
      </Version>
    </StaticPage>
  );
}
