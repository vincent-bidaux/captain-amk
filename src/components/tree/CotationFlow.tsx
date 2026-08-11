"use client";

import { useState } from "react";
import AiCostBanner from "./AiCostBanner";
import BreadcrumbStep from "./BreadcrumbStep";
import QuestionCard from "./QuestionCard";
import ResultCard from "./ResultCard";
import { arbre, getActeForNode, getNode } from "@/lib/ngap/tree";
import { isFeuille } from "@/lib/ngap/types";
import type { ArbreOption, PathStep } from "@/lib/ngap/types";

export default function CotationFlow() {
  const [path, setPath] = useState<PathStep[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string>(arbre.racine);

  const currentNode = getNode(currentNodeId);

  function handleChoose(question: string, option: ArbreOption) {
    const step: PathStep = {
      nodeId: currentNodeId,
      question,
      chosenLabel: option.label,
      chosenAide: option.aide,
      nextNodeId: option.next,
    };
    setPath((prev) => [...prev, step]);
    setCurrentNodeId(option.next);
  }

  function handleRewind(index: number) {
    const step = path[index];
    setPath((prev) => prev.slice(0, index + 1));
    setCurrentNodeId(step.nextNodeId);
  }

  function handleReset() {
    setPath([]);
    setCurrentNodeId(arbre.racine);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <AiCostBanner costEuros={0} />

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

      {isFeuille(currentNode) ? (
        <ResultCard acte={getActeForNode(currentNodeId)} onReset={handleReset} />
      ) : (
        <QuestionCard
          node={currentNode}
          onChoose={(option) => handleChoose(currentNode.question, option)}
        />
      )}
    </div>
  );
}
