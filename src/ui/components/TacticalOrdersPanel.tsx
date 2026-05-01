import { Megaphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Separator } from '@/components/ui/separator';
import { useGameStore } from '@/store/gameStore';
import type {
  GlobalStyle,
  MatchState,
  NetPosition,
  NetPressure,
  RiskTaking,
  TacticalOrders,
  TargetPreference,
} from '@/types';

const styleOptions: Array<[GlobalStyle, string]> = [
  ['veryDefensive', 'Tres def.'],
  ['defensive', 'Def.'],
  ['balanced', 'Equilibre'],
  ['offensive', 'Off.'],
  ['veryOffensive', 'Tres off.'],
];

const positionOptions: Array<[NetPosition, string]> = [
  ['deep', 'Reculee'],
  ['standard', 'Standard'],
  ['advanced', 'Avancee'],
];

const pressureOptions: Array<[NetPressure, string]> = [
  ['low', 'Faible'],
  ['medium', 'Moyenne'],
  ['high', 'Forte'],
];

const targetOptions: Array<[TargetPreference, string]> = [
  ['weakPlayer', 'Faible'],
  ['balanced', '50-50'],
  ['strongPlayer', 'Fort'],
  ['center', 'Centre'],
];

const riskOptions: Array<[RiskTaking, string]> = [
  ['safe', 'Securise'],
  ['standard', 'Standard'],
  ['risky', 'Risque'],
];

type TacticalOrdersPanelProps = {
  matchState: MatchState | null;
};

export const TacticalOrdersPanel = ({ matchState }: TacticalOrdersPanelProps) => {
  const orders = useGameStore((state) => state.orders.A);
  const opponentOrders = useGameStore((state) => state.orders.B);
  const updateOrder = useGameStore((state) => state.updateOrder);
  const useMoraleBoost = useGameStore((state) => state.useMoraleBoost);

  return (
    <Card className="shadow-card">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4 text-primary" />
          Ordres tactiques
        </CardTitle>
        <p className="text-xs text-muted-foreground">Consignes pour ton equipe (A) en temps reel.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <OrderRow<GlobalStyle>
          label="Style global"
          value={orders.globalStyle}
          options={styleOptions}
          onChange={(value) => updateOrder('A', 'globalStyle', value)}
        />
        <OrderRow<NetPosition>
          label="Position au filet"
          value={orders.netPosition}
          options={positionOptions}
          onChange={(value) => updateOrder('A', 'netPosition', value)}
        />
        <OrderRow<NetPressure>
          label="Pression au filet"
          value={orders.netPressure}
          options={pressureOptions}
          onChange={(value) => updateOrder('A', 'netPressure', value)}
        />
        <OrderRow<TargetPreference>
          label="Cible preferee"
          value={orders.targetPreference}
          options={targetOptions}
          onChange={(value) => updateOrder('A', 'targetPreference', value)}
        />
        <OrderRow<RiskTaking>
          label="Prise de risque"
          value={orders.riskTaking}
          options={riskOptions}
          onChange={(value) => updateOrder('A', 'riskTaking', value)}
        />

        <Button
          variant="outline"
          className="w-full gap-2 border-accent/40 text-accent hover:bg-accent/10"
          disabled={orders.moraleBoostsRemaining <= 0}
          onClick={() => useMoraleBoost('A')}
        >
          <Sparkles className="h-4 w-4" />
          Soutien moral ({orders.moraleBoostsRemaining})
        </Button>

        <Separator />

        <div className="space-y-1.5 rounded-md border border-border bg-background/40 p-3 text-xs">
          <p className="font-semibold uppercase tracking-wider text-muted-foreground">Adversaire</p>
          <p className="text-foreground">
            {opponentOrders.globalStyle} · risque {opponentOrders.riskTaking}
          </p>
          {matchState ? (
            <p className="text-muted-foreground">
              Fatigue A {(matchState.fatigue.A * 100).toFixed(1)}% · B {(matchState.fatigue.B * 100).toFixed(1)}%
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

type OrderRowProps<T extends string> = {
  label: string;
  value: T;
  options: Array<[T, string]>;
  onChange: (value: T) => void;
};

const OrderRow = <T extends string>({ label, value, options, onChange }: OrderRowProps<T>) => (
  <div className="space-y-2">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as T);
      }}
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map(([optionValue, optionLabel]) => (
        <ToggleGroupItem
          key={optionValue}
          value={optionValue}
          size="sm"
          className="text-xs data-[state=on]:bg-primary/15 data-[state=on]:text-primary"
        >
          {optionLabel}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  </div>
);

export type { TacticalOrders };
