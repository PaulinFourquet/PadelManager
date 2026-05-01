import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export const useDemoBoot = () => {
  const demoBooted = useRef(false);
  const setView = useGameStore((state) => state.setView);
  const career = useGameStore((state) => state.career);
  const choosePlayer = useGameStore((state) => state.choosePlayer);
  const choosePartner = useGameStore((state) => state.choosePartner);
  const startTournamentMatch = useGameStore((state) => state.startTournamentMatch);

  useEffect(() => {
    if (window.location.search.includes('admin=1')) {
      setView('admin');
      return;
    }
    if (window.location.search.includes('progression=1')) {
      if (!career.playerId) {
        choosePlayer('arturo-coello');
        choosePartner('agustin-tapia');
      }
      setView('progression');
      return;
    }
    if (demoBooted.current || !window.location.search.includes('demo3d=1')) {
      return;
    }
    demoBooted.current = true;
    choosePlayer('arturo-coello');
    choosePartner('agustin-tapia');
    startTournamentMatch('sevilla-challenger');
  }, [career.playerId, choosePlayer, choosePartner, setView, startTournamentMatch]);
};
