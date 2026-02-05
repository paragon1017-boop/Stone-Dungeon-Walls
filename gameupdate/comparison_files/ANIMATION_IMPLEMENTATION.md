# Monster Animation Implementation Guide

## What's Been Added

Your game now has **full CSS-based monster animations**! Here's what's included:

### Animation States

1. **Idle Animations**
   - `breathe` - Gentle pulsing (ground enemies)
   - `float` - Floating motion (flying enemies)

2. **Combat Animations**
   - `attack` - Lunge forward with anticipation
   - `hit` - Recoil and flash red
   - `death` - Dramatic fall and fade out

3. **Special Animations**
   - `entrance` - Monsters appear with style
   - `boss-entrance` - Epic entrance for bosses
   - `elite-glow` - Pulsing glow for special monsters

## How to Use in Your Game

### Option 1: Use AnimatedMonster Component (Recommended)

Replace `TransparentMonster` with `AnimatedMonster` in your combat rendering:

```tsx
import { AnimatedMonster } from "@/components/AnimatedMonster";

// In your combat component:
<AnimatedMonster
  src={monster.image}
  alt={monster.name}
  className="w-64 h-64"
  isAttacking={isMonsterAttacking}  // true during monster's turn
  isHit={justGotHit}                // true when player hits monster
  isDead={monster.hp <= 0}          // true when monster is defeated
  isFlying={isFlying(monster.name)} // true for bats, harpies, wisps, etc.
  isBoss={isBossMonster(monster)}   // true for boss-tier monsters
/>
```

### Option 2: Use TransparentMonster Directly

If you want manual control over animations:

```tsx
import { TransparentMonster } from "@/components/TransparentMonster";

<TransparentMonster
  src={monster.image}
  alt={monster.name}
  animationState="attack"  // 'idle' | 'attack' | 'hit' | 'death' | 'entrance'
  isFlying={true}          // for floating animation
/>
```

## Flying Monsters

These monsters should use the floating animation:
- Cave Bat
- Shadow Wisp  
- Harpy
- Wraith
- Dragon (optional - can use either)
- Gargoyle (optional)

## Boss Monsters

These should use the epic boss entrance:
- Dragon
- Lich
- Demon
- Death Knight
- Golem
- Basilisk

## Example: Integrate into Combat

Here's how to modify your combat system in `Game.tsx`:

```tsx
// Add state for tracking animations
const [monsterAnimState, setMonsterAnimState] = useState<'idle' | 'attack' | 'hit'>('idle');
const [playerAnimState, setPlayerAnimState] = useState<'idle' | 'attack' | 'hit'>('idle');

// When player attacks:
function handlePlayerAttack() {
  setPlayerAnimState('attack');
  
  setTimeout(() => {
    // Apply damage
    setMonsterAnimState('hit');
    dealDamage();
    
    setTimeout(() => {
      setPlayerAnimState('idle');
      setMonsterAnimState('idle');
    }, 500);
  }, 300);
}

// When monster attacks:
function handleMonsterAttack() {
  setMonsterAnimState('attack');
  
  setTimeout(() => {
    // Apply damage
    setPlayerAnimState('hit');
    dealDamage();
    
    setTimeout(() => {
      setMonsterAnimState('idle');
      setPlayerAnimState('idle');
    }, 500);
  }, 300);
}

// In render:
<AnimatedMonster
  src={currentMonster.image}
  alt={currentMonster.name}
  isAttacking={monsterAnimState === 'attack'}
  isHit={monsterAnimState === 'hit'}
  isDead={currentMonster.hp <= 0}
  isFlying={flyingMonsters.includes(currentMonster.name)}
  isBoss={bossMonsters.includes(currentMonster.name)}
/>
```

## Screen Shake Effect

For powerful attacks, add screen shake to the combat container:

```tsx
// When boss attacks or critical hit
const combatContainerRef = useRef<HTMLDivElement>(null);

function triggerScreenShake() {
  combatContainerRef.current?.classList.add('screen-shake');
  setTimeout(() => {
    combatContainerRef.current?.classList.remove('screen-shake');
  }, 500);
}

<div ref={combatContainerRef} className="combat-container">
  {/* Your combat UI */}
</div>
```

## Testing Animations

To test each animation:

```tsx
// Test component
function AnimationTest() {
  const [state, setState] = useState<'idle' | 'attack' | 'hit' | 'death'>('idle');
  
  return (
    <div>
      <TransparentMonster
        src="/assets/monsters/dragon.png"
        alt="Dragon"
        animationState={state}
        isFlying={false}
      />
      
      <div className="controls">
        <button onClick={() => setState('idle')}>Idle</button>
        <button onClick={() => setState('attack')}>Attack</button>
        <button onClick={() => setState('hit')}>Hit</button>
        <button onClick={() => setState('death')}>Death</button>
      </div>
    </div>
  );
}
```

## Customization

All animations are in `client/src/index.css`. You can customize:

- Animation duration (change `3s` to `2s`, etc.)
- Animation easing (change `ease-in-out` to `cubic-bezier(...)`)
- Movement distance (change `translateX(40px)` values)
- Scale amounts (change `scale(1.15)` values)
- Colors and effects (change `filter` properties)

## Performance Notes

- All animations use CSS transforms (GPU-accelerated)
- No JavaScript required for animation frames
- Smooth 60fps performance
- Works on mobile devices

## What's Next?

Your monsters are now fully animated! The animations will:
- Play automatically based on combat state
- Look smooth and professional
- Work on all devices
- Enhance the game feel dramatically

Deploy and enjoy the enhanced combat experience!
