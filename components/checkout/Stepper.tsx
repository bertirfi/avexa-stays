import { Icon, type IconName } from '@/components/Icon';
import { cn } from '@/lib/cn';

interface StepperProps {
  step: 1 | 2 | 3;
}

const steps: Array<{ num: 1 | 2 | 3; label: string; icon: IconName }> = [
  { num: 1, label: 'Contact Info', icon: 'user' },
  { num: 2, label: 'Payment', icon: 'sparkles' },
  { num: 3, label: 'Booking Confirmation', icon: 'check' },
];

export function Stepper({ step }: StepperProps) {
  return (
    <ol className="flex items-center justify-center gap-3 border-b border-gray-line bg-white py-6">
      {steps.map((s, i) => {
        const isActive = step === s.num;
        const isDone = step > s.num;
        return (
          <li key={s.num} className="flex items-center gap-3">
            <span
              className={cn(
                'grid size-9 place-items-center rounded-full border transition',
                isDone && 'border-gold-dark bg-gold-dark text-cream',
                isActive && 'border-ink bg-ink text-cream',
                !isActive && !isDone && 'border-gray-line bg-white text-ink-60',
              )}
            >
              {isDone ? <Icon name="check" size={14} /> : <Icon name={s.icon} size={14} />}
            </span>
            <span
              className={cn(
                'hidden text-sm font-semibold sm:inline',
                isActive ? 'text-ink' : 'text-ink-60',
              )}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'h-px w-8 transition sm:w-12',
                  step > s.num ? 'bg-gold-dark' : 'bg-gray-line',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
