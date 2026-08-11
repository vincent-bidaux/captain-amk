import arbreJson from "@/data/arbre-decision.json";
import actesJson from "@/data/actes-ngap.json";
import type { Acte, ActesData, ArbreDecision, Noeud, Region } from "./types";
import { isFeuille } from "./types";

export const arbre = arbreJson as unknown as ArbreDecision;
export const actesData = actesJson as unknown as ActesData;

const acteById = new Map<string, Acte>(actesData.actes.map((a) => [a.id, a]));

export function getNode(id: string): Noeud {
  const node = arbre.noeuds[id];
  if (!node) throw new Error(`Nœud d'arbre inconnu : ${id}`);
  return node;
}

export function getActe(id: string): Acte {
  const acte = acteById.get(id);
  if (!acte) throw new Error(`Acte inconnu : ${id}`);
  return acte;
}

export function getActeForNode(nodeId: string): Acte {
  const node = getNode(nodeId);
  if (!isFeuille(node)) {
    throw new Error(`Le nœud ${nodeId} n'est pas une feuille (pas d'acte associé)`);
  }
  return getActe(node.acte);
}

export function valeurLettreCle(region: Region = "metropole"): number {
  return actesData.meta.valeurLettreCle[region];
}

export function tarifActe(acte: Acte, region: Region = "metropole"): number {
  return acte.coefficient * valeurLettreCle(region);
}

export function formatEuros(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

export function ifsMontant(): number {
  return actesData.meta.deplacements.IFS.montant;
}

export function lettreCleDescription(code: string): string | undefined {
  return actesData.lettresCles[code];
}
