"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface WorkState {
  /** True once the practitioner has started working (analyse lancée, ou navigation vers une session). */
  expanded: boolean;
  startWork: () => void;
}

const WorkStateContext = createContext<WorkState | null>(null);

export function WorkStateProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState({ pathname, expanded: pathname !== "/" });

  // Reaching a session directly (via la barre latérale) compte comme du travail démarré ;
  // revenir sur "/" repart sur l'état replié tant que rien n'est relancé. Dérivé pendant le
  // rendu plutôt que dans un effet (voir https://react.dev/learn/you-might-not-need-an-effect).
  if (state.pathname !== pathname) {
    setState({ pathname, expanded: pathname !== "/" });
  }

  return (
    <WorkStateContext.Provider
      value={{
        expanded: state.expanded,
        startWork: () => setState((s) => ({ ...s, expanded: true })),
      }}
    >
      {children}
    </WorkStateContext.Provider>
  );
}

export function useWorkState() {
  const ctx = useContext(WorkStateContext);
  if (!ctx) throw new Error("useWorkState doit être utilisé dans WorkStateProvider");
  return ctx;
}
