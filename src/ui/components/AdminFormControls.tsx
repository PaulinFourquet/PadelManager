import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LabelledFieldProps = {
  label: string;
  className?: string;
  children: React.ReactNode;
};

const LabelledField = ({ label, className, children }: LabelledFieldProps) => (
  <label className={cn('grid gap-1 text-sm', className)}>
    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

type AdminInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export const AdminInput = ({ label, value, onChange }: AdminInputProps) => (
  <LabelledField label={label}>
    <Input value={value} onChange={(event) => onChange(event.target.value)} />
  </LabelledField>
);

type AdminNumberProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export const AdminNumber = ({ label, value, onChange }: AdminNumberProps) => (
  <LabelledField label={label}>
    <Input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
  </LabelledField>
);

type AdminSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export const AdminSelect = ({ label, value, options, onChange }: AdminSelectProps) => (
  <LabelledField label={label}>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-background text-foreground">
          {option}
        </option>
      ))}
    </select>
  </LabelledField>
);

export { Label };
