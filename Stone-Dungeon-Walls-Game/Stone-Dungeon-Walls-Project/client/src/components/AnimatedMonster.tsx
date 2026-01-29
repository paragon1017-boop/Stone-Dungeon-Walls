import { useState, useEffect } from "react";
import { TransparentMonster } from "./TransparentMonster";

interface AnimatedMonsterProps {
  src: string;
  alt: string;
  className?: string;
  isAttacking?: boolean;
  isHit?: boolean;
  isDead?: boolean;
  isFlying?: boolean;
  isBoss?: boolean;
}

export function AnimatedMonster({
  src,
  alt,
  className,
  isAttacking = false,
  isHit = false,
  isDead = false,
  isFlying = false,
  isBoss = false,
}: AnimatedMonsterProps) {
  const [animationState, setAnimationState] = useState<'idle' | 'attack' | 'hit' | 'death' | 'entrance'>('entrance');
  const [showEntrance, setShowEntrance] = useState(true);

  // Handle entrance animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEntrance(false);
      setAnimationState('idle');
    }, isBoss ? 2000 : 800); // Longer entrance for bosses

    return () => clearTimeout(timer);
  }, [isBoss]);

  // Update animation state based on combat status
  useEffect(() => {
    if (showEntrance) return; // Don't interrupt entrance

    if (isDead) {
      setAnimationState('death');
    } else if (isAttacking) {
      setAnimationState('attack');
      // Return to idle after attack animation
      const timer = setTimeout(() => {
        setAnimationState('idle');
      }, 600);
      return () => clearTimeout(timer);
    } else if (isHit) {
      setAnimationState('hit');
      // Return to idle after hit animation
      const timer = setTimeout(() => {
        setAnimationState('idle');
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('idle');
    }
  }, [isAttacking, isHit, isDead, showEntrance]);

  return (
    <TransparentMonster
      src={src}
      alt={alt}
      className={className}
      animationState={showEntrance ? (isBoss ? 'entrance' : 'entrance') : animationState}
      isFlying={isFlying}
    />
  );
}
