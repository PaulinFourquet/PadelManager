import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Player } from '@/types';

type PlayerAvatarProps = {
  player: Player;
  size?: number;
  className?: string;
};

const initialsOf = (player: Player) =>
  player.name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

export const PlayerAvatar = ({ player, size = 56, className }: PlayerAvatarProps) => {
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setErrored(false);
  }, [player.photoUrl]);

  if (errored) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md bg-muted text-xs font-bold tracking-wide text-muted-foreground ring-1 ring-border',
          className,
        )}
        style={{ width: size, height: size }}
        aria-label={player.name}
      >
        {initialsOf(player)}
      </div>
    );
  }

  return (
    <img
      src={player.photoUrl}
      alt={player.name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className={cn('rounded-md object-cover ring-1 ring-border', className)}
      style={{ width: size, height: size }}
    />
  );
};
