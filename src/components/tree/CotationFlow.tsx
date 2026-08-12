"use client";

import { Route } from "lucide-react";
import { useState } from "react";
import AiCostBanner from "./AiCostBanner";
import BreadcrumbStep from "./BreadcrumbStep";
import FeedbackBox from "./FeedbackBox";
import OrdonnanceEntry from "./OrdonnanceEntry";
import OrdonnanceHeaderCard from "./OrdonnanceHeaderCard";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import SectionLabel from "./SectionLabel";
import { costUsd, DEFAULT_AI_MODEL } from "@/lib/ngap/pricing";
import { arbre, getActeForNode, getNode } from "@/lib/ngap/tree";
import { isFeuille } from "@/lib/ngap/types";
import { useWorkState } from "@/lib/ui/workState";
import type { AiModel } from "@/lib/ngap/pricing";
import type { ArbreOption, DecideResult, PathStep } from "@/lib/ngap/types";

type PatientName = { prenom: string | null; nom: string | null };

interface DecideApiResponse extends Omit<DecideResult, "patientName"> {
  patientName: PatientName | null;
  error?: string;
}

export default function CotationFlow() {
  const { startWork } = useWorkState();
  const [started, setStarted] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [ordonnanceText, setOrdonnanceText] = useState("");
  const [aiModel, setAiModel] = useState<AiModel>(DEFAULT_AI_MODEL);

  const [path, setPath] = useState<PathStep[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string>(arbre.racine);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiStoppedReason, setAiStoppedReason] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<PatientName | null>(null);
  const [medecinNom, setMedecinNom] = useState<string | null>(null);
  const [medecinTelephone, setMedecinTelephone] = useState<string | null>(null);
  const [dateOrdonnance, setDateOrdonnance] = useState<string | null>(null);
  const [totalUsage, setTotalUsage] = useState({ inputTokens: 0, outputTokens: 0 });

  const currentNode = getNode(currentNodeId);

  async function runAutoWalk(startNodeId: string, text: string, extractHeaderFirst: boolean) {
    setIsAiThinking(true);
    setAiStoppedReason(null);
    setApiError(null);

    let nodeId = startNodeId;
    let first = extractHeaderFirst;

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
            extractHeader: first,
            model: aiModel,
          }),
        });
        data = await res.json();
        first = false;
        if (!res.ok) {
          setApiError(data.error ?? "Erreur inconnue lors de l'appel au modèle.");
          break;
        }
      } catch {
        setApiError("Connexion impossible, réessayez.");
        break;
      }

      setTotalUsage((prev) => ({
        inputTokens: prev.inputTokens + data.usage.inputTokens,
        outputTokens: prev.outputTokens + data.usage.outputTokens,
      }));
      if (data.patientName && (data.patientName.prenom || data.patientName.nom)) {
        setPatientName(data.patientName);
      }
      if (data.medecinNom) setMedecinNom(data.medecinNom);
      if (data.medecinTelephone) setMedecinTelephone(data.medecinTelephone);
      if (data.dateOrdonnance) setDateOrdonnance(data.dateOrdonnance);

      if (!data.answered) {
        setAiStoppedReason(data.justification);
        break;
      }

      const chosen = node.options[data.optionIndex];
      if (!chosen) {
        setApiError("Réponse incohérente (option inexistante).");
        break;
      }

      const step: PathStep = {
        nodeId,
        question: node.question,
        chosenLabel: chosen.label,
        chosenAide: data.justification,
        nextNodeId: chosen.next,
        source: "auto",
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
    startWork();
    void runAutoWalk(arbre.racine, text, true);
  }

  function handleSkipManual() {
    setAiEnabled(false);
    setStarted(true);
    startWork();
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

  /** Rewind to right before `index` was answered, so its question is asked again. */
  function handleRewind(index: number) {
    const step = path[index];
    setPath((prev) => prev.slice(0, index));
    setCurrentNodeId(step.nodeId);
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
    setMedecinNom(null);
    setMedecinTelephone(null);
    setDateOrdonnance(null);
    setTotalUsage({ inputTokens: 0, outputTokens: 0 });
    setAiModel(DEFAULT_AI_MODEL);
  }

  const cost = costUsd(totalUsage, aiModel);
  const nodeIsLeaf = isFeuille(currentNode);
  const ordonnanceHeader = {
    patientName,
    medecinNom,
    medecinTelephone,
    dateOrdonnance,
    prescription: ordonnanceText || null,
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <AiCostBanner costUsd={cost} usage={totalUsage} model={aiModel} />

      {started && <OrdonnanceHeaderCard header={ordonnanceHeader} />}

      {path.length > 0 && (
        <div className="mb-4 flex flex-col gap-0 border-b border-border pb-2">
          <SectionLabel>
            <Route className="h-3.5 w-3.5" />
            Cheminement
          </SectionLabel>
          {path.map((step, i) => (
            <BreadcrumbStep
              key={`${step.nodeId}-${i}`}
              step={step}
              onRewind={() => handleRewind(i)}
              showConnector={i > 0}
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
          aiModel={aiModel}
          onModelChange={setAiModel}
          disabled={isAiThinking}
        />
      ) : isAiThinking ? (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-5 text-sm text-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          J&apos;analyse l&apos;ordonnance…
        </div>
      ) : nodeIsLeaf ? (
        <>
          <ResultCard
            acte={getActeForNode(currentNodeId)}
            path={path}
            currentNodeId={currentNodeId}
            onReset={handleReset}
            showHeader={false}
            usage={totalUsage}
            aiModel={aiModel}
            ordonnanceHeader={ordonnanceHeader}
          />
          <FeedbackBox />
        </>
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
