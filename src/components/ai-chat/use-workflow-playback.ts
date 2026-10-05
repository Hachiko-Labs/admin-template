"use client";

import * as React from "react";

interface PlaybackState {
  playing: boolean;
  run: number;
  stage: number | null;
}

interface UseWorkflowPlaybackOptions {
  completeStage: number | null;
  initialStage: number | null;
  interval: number;
  stageCount: number;
}

export function useWorkflowPlayback(
  options: UseWorkflowPlaybackOptions & {
    completeStage: number;
    initialStage: number;
  },
): { restart: () => void; stage: number };
export function useWorkflowPlayback(options: UseWorkflowPlaybackOptions): {
  restart: () => void;
  stage: number | null;
};
export function useWorkflowPlayback({
  completeStage,
  initialStage,
  interval,
  stageCount,
}: UseWorkflowPlaybackOptions) {
  const [playback, setPlayback] = React.useState<PlaybackState>({
    playing: false,
    run: 0,
    stage: initialStage,
  });

  React.useEffect(() => {
    if (!playback.playing || playback.stage === null) return;

    const timeout = window.setTimeout(() => {
      setPlayback((current) => {
        if (current.run !== playback.run || current.stage === null)
          return current;

        const nextStage = current.stage + 1;
        if (nextStage >= stageCount) {
          return {
            ...current,
            playing: false,
            stage: completeStage,
          };
        }
        return { ...current, stage: nextStage };
      });
    }, interval);

    return () => window.clearTimeout(timeout);
  }, [completeStage, interval, playback, stageCount]);

  const restart = React.useCallback(() => {
    setPlayback((current) => ({
      playing: true,
      run: current.run + 1,
      stage: 0,
    }));
  }, []);

  return { restart, stage: playback.stage };
}
