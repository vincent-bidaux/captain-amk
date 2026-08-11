"use client";

import { useState } from "react";
import AiCostBanner from "./AiCostBanner";
import BreadcrumbStep from "./BreadcrumbStep";
import OrdonnanceEntry from "./OrdonnanceEntry";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import { costUsd } from "@/lib/ngap/pricing";
import { arbre, getActeForNode, getNode } from "@/lib/ngap/tree";
import { isFeuille } from "@/lib/ngap/types";
import type { ArbreOption, DecideResult, PathStep } from "@/lib/ngap/types";

type PatientName = { prenom: string | null; nom: string | null };

interface DecideApiResponse extends Omit<DecideResult, "patientName"> {
  patientName: PatientName | null;
  error?: string;
}

export default function CotationFlow() {
  const [started, setStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [ordonnanceText, setOrdonnanceText] = useState("");

  const [path, setPath] = useState<PathStep[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string>(arbre.racine);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiStoppedReason, setAiStoppedReason] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<PatientName | null>(null);
  const [totalUsage, setTotalUsage] = useState({ inputTokens: 0, outputTokens: 0 });

  const currentNode = getNode(currentNodeId);

  async function runAutoWalk(startNodeId: string, text: string, extractNameFirst: boolean) {
    setIsAiThinking(true);
    setAiStoppedReason(null);
    setApiError(null);

    let nodeId = startNodeId;
    let first = extractNameFirst;

    while (true) {
      const node = getNode(nodeId);
      if (isFeuille(node)) break;

      let data: DecideApiResponse;
      try {
        const res = await fetch("/api/decide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ordonnanceText: text,
            nodeId,
            extractName: first,
          }),
        });
        data = await res.json();
        first = false;
        if (!res.ok) {
          setApiError(data.error ?? "Erreur inconnue lors de l'appel au modèle.");
          break;
        }
      } catch {
        setApiError("Impossible de contacter le service IA.");
        break;
      }

      setTotalUsage((prev) => ({
        inputTokens: prev.inputTokens + data.usage.inputTokens,
        outputTokens: prev.outputTokens + data.usage.outputTokens,
      }));
      if (data.patientName && (data.patientName.prenom || data.patientName.nom)) {
        setPatientName(data.patientName);
      }

      if (!data.answered) {
        setAiStoppedReason(data.justification);
        break;
      }

      const chosen = node.options[data.optionIndex];
      if (!chosen) {
        setApiError("Réponse IA incohérente (option inexistante).");
        break;
      }

      const step: PathStep = {
        nodeId,
        question: node.question,
        chosenLabel: chosen.label,
        chosenAide: data.justification,
        nextNodeId: chosen.next,
        source: "ia",
      };
      setPath((prev) => [...prev, step]);
      nodeId = chosen.next;
      setCurrentNodeId(nodeId);
    }

    setIsAiThinking(false);
  }

  function handleAnalyze(text: string) {
    setOrdonnanceText(text);
    setAiEnabled(true);
    setStarted(true);
    void runAutoWalk(arbre.racine, text, true);
  }

  function handleSkipManual() {
    setAiEnabled(false);
    setStarted(true);
  }

  function handleChoose(question: string, option: ArbreOption) {
    const step: PathStep = {
      nodeId: currentNodeId,
      question,
      chosenLabel: option.label,
      chosenAide: option.aide,
      nextNodeId: option.next,
      source: "manuel",
    };
    setPath((prev) => [...prev, step]);
    setCurrentNodeId(option.next);
    setAiStoppedReason(null);

    // The AI may be able to answer later questions even after a manual
    // detour — resume the auto-walk from here if an ordonnance was given.
    if (aiEnabled && ordonnanceText) {
      void runAutoWalk(option.next, ordonnanceText, false);
    }
  }

  function handleRewind(index: number) {
    const step = path[index];
    setPath((prev) => prev.slice(0, index + 1));
    setCurrentNodeId(step.nextNodeId);
    setAiStoppedReason(null);
  }

  function handleReset() {
    setStarted(false);
    setAiEnabled(false);
    setOrdonnanceText("");
    setPath([]);
    setCurrentNodeId(arbre.racine);
    setAiStoppedReason(null);
    setApiError(null);
    setPatientName(null);
    setTotalUsage({ inputTokens: 0, outputTokens: 0 });
  }

  const cost = costUsd(totalUsage);
  const nodeIsLeaf = isFeuille(currentNode);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <AiCostBanner costUsd={cost} />

      {patientName && (patientName.prenom || patientName.nom) && (
        <p className="mb-3 text-xs text-muted">
          Patient détecté :{" "}
          <span className="font-medium text-foreground">
            {[patientName.prenom, patientName.nom].filter(Boolean).join(" ")}
          </span>{" "}
          — non conservé après la session.
        </p>
      )}

      {path.length > 0 && (
        <div className="mb-4 flex flex-col gap-1 border-b border-border pb-2">
          {path.map((step, i) => (
            <BreadcrumbStep
              key={`${step.nodeId}-${i}`}
              step={step}
              onRewind={() => handleRewind(i)}
            />
          ))}
        </div>
      )}

      {apiError && (
        <p className="mb-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {apiError}
        </p>
      )}

      {!started ? (
        <OrdonnanceEntry
          onAnalyze={handleAnalyze}
          onSkip={handleSkipManual}
          onTranscribeUsage={(usage) =>
            setTotalUsage((prev) => ({
              inputTokens: prev.inputTokens + usage.inputTokens,
              outputTokens: prev.outputTokens + usage.outputTokens,
            }))
          }
          disabled={isAiThinking}
        />
      ) : isAiThinking ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-5 text-sm text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          L&apos;IA analyse l&apos;ordonnance…
        </div>
      ) : nodeIsLeaf ? (
        <ResultCard
          acte={getActeForNode(currentNodeId)}
          path={path}
          currentNodeId={currentNodeId}
          onReset={handleReset}
        />
      ) : (
        <QuestionCard
          node={currentNode}
          onChoose={(option) => handleChoose(currentNode.question, option)}
          aiStoppedReason={aiStoppedReason}
          patientName={patientName}
        />
      )}
    </div>
  );
}
