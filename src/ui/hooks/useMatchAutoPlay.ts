import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export const useMatchAutoPlay = () => {
  const matchState = useGameStore((state) => state.liveMatchState);
  const playbackSpeed = useGameStore((state) => state.playbackSpeed);
  const isAutoPlaying = useGameStore((state) => state.isAutoPlaying);
  const simulateLivePoint = useGameStore((state) => state.simulateLivePoint);

  useEffect(() => {
    if (!isAutoPlaying || !matchState || matchState.score.matchWinner) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      simulateLivePoint();
    }, 1900 / playbackSpeed);
    return () => window.clearInterval(interval);
  }, [isAutoPlaying, matchState, playbackSpeed, simulateLivePoint]);
};
