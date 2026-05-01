import { useGameStore } from '@/store/gameStore';
import { SelectionScreen } from '@/ui/pages/PlayerSelectPage';

export const PartnerSelectPage = () => {
  const choosePartner = useGameStore((state) => state.choosePartner);
  const career = useGameStore((state) => state.career);
  const players = useGameStore((state) => state.players);
  const partners = players.filter((player) => player.id !== career.playerId);

  return (
    <SelectionScreen
      eyebrow="Carriere"
      title="Choix du partenaire"
      description="Compose une paire complementaire avant de t'inscrire au premier tournoi."
      players={partners}
      selectedId={career.partnerId}
      onSelect={choosePartner}
      actionLabel="Signer"
    />
  );
};
