{/* Monster overlay during combat */}
{combatState.active && combatState.monsters.length > 0 && (
  <>
    {/* Atmospheric overlay for combat */}
    <div 
      className="absolute inset-0 z-[5] pointer-events-none animate-in fade-in duration-500"
      style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 45%, transparent 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.6) 100%)'
      }}
    />
    
    {/* Enhanced monster positioning with front/back rows */}
    <div className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none pb-24">
      <div className="relative w-full max-w-4xl h-[400px]">
        {/* Back Row (positions 4-7) - smaller, behind front row */}
        <div className="absolute bottom-[60px] left-0 right-0 flex items-end justify-center gap-3">
          {combatState.monsters.slice(4, 8).map((monster, idx) => {
            const actualIdx = idx + 4;
            return (
              <div 
                key={monster.id} 
                className={`relative cursor-pointer transition-all duration-200 ${
                  monster.hp <= 0 ? 'opacity-30 grayscale' : ''
                } ${actualIdx === combatState.targetIndex && monster.hp > 0 ? 'scale-110 z-20' : 'scale-90 z-10'}`}
                onClick={() => monster.hp > 0 && setCombatState(prev => ({ ...prev, targetIndex: actualIdx }))}
                style={{ 
                  pointerEvents: 'auto',
                  transform: `translateY(${monster.hp <= 0 ? '20px' : '0'})`,
                  filter: monster.hp <= 0 ? 'brightness(0.5)' : 'none'
                }}
              >
                {/* Target indicator for back row */}
                {actualIdx === combatState.targetIndex && monster.hp > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce z-30">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                )}
                
                {monster.image ? (
                  <>
                    <TransparentMonster 
                      src={monster.image} 
                      alt={monster.name} 
                      className={`object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] ${
                        combatState.monsters.length <= 4 ? 'w-52 h-52' :
                        combatState.monsters.length <= 6 ? 'w-40 h-40' : 'w-32 h-32'
                      }`}
                      animationState={monsterAnimations[actualIdx] || 'idle'}
                      isFlying={isFlying(monster.name)}
                    />
                    {/* Lighter ground shadow for back row */}
                    <div 
                      className={`absolute bottom-0 left-1/2 rounded-[50%] bg-black/40 blur-md ${
                        combatState.monsters.length <= 4 ? 'w-40 h-6' :
                        combatState.monsters.length <= 6 ? 'w-32 h-5' : 'w-24 h-4'
                      }`}
                      style={{ transform: 'translateX(-50%) translateY(10px)' }}
                    />
                  </>
                ) : (
                  <Skull className={`text-red-500 drop-shadow-lg ${
                    combatState.monsters.length <= 4 ? 'w-32 h-32' :
                    combatState.monsters.length <= 6 ? 'w-24 h-24' : 'w-20 h-20'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Front Row (positions 0-3) - larger, in front */}
        <div className="absolute bottom-[20px] left-0 right-0 flex items-end justify-center gap-4">
          {combatState.monsters.slice(0, 4).map((monster, idx) => (
            <div 
              key={monster.id} 
              className={`relative cursor-pointer transition-all duration-200 ${
                monster.hp <= 0 ? 'opacity-40 grayscale' : ''
              } ${idx === combatState.targetIndex && monster.hp > 0 ? 'scale-115 z-30' : 'scale-100 z-20'}`}
              onClick={() => monster.hp > 0 && setCombatState(prev => ({ ...prev, targetIndex: idx }))}
              style={{ 
                pointerEvents: 'auto',
                transform: `translateY(${monster.hp <= 0 ? '10px' : '0'})`,
                filter: monster.hp <= 0 ? 'brightness(0.6)' : 'none'
              }}
            >
              {/* Target indicator for front row */}
              {idx === combatState.targetIndex && monster.hp > 0 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce z-40">
                  <ChevronDown className="w-6 h-6" />
                </div>
              )}
              
              {monster.image ? (
                <>
                  <TransparentMonster 
                    src={monster.image} 
                    alt={monster.name} 
                    className={`object-contain drop-shadow-[0_0_25px_rgba(0,0,0,0.9)] ${
                      combatState.monsters.length <= 2 ? 'w-72 h-72' :
                      combatState.monsters.length === 3 ? 'w-60 h-60' :
                      combatState.monsters.length <= 6 ? 'w-48 h-48' : 'w-40 h-40'
                    }`}
                    animationState={monsterAnimations[idx] || 'idle'}
                    isFlying={isFlying(monster.name)}
                  />
                  {/* Darker ground shadow for front row */}
                  <div 
                    className={`absolute bottom-0 left-1/2 rounded-[50%] bg-black/60 blur-md ${
                      combatState.monsters.length <= 2 ? 'w-56 h-8' :
                      combatState.monsters.length === 3 ? 'w-44 h-7' :
                      combatState.monsters.length <= 6 ? 'w-36 h-6' : 'w-32 h-5'
                    }`}
                    style={{ transform: 'translateX(-50%) translateY(12px)' }}
                  />
                </>
              ) : (
                <Skull className={`text-red-500 drop-shadow-lg ${
                  combatState.monsters.length <= 2 ? 'w-40 h-40' :
                  combatState.monsters.length === 3 ? 'w-32 h-32' :
                  combatState.monsters.length <= 6 ? 'w-28 h-28' : 'w-24 h-24'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Row indicators (optional visual cue) */}
        {combatState.monsters.length > 4 && (
          <>
            <div className="absolute bottom-[140px] left-1/2 -translate-x-1/2 text-[10px] text-gray-400/60 font-pixel tracking-wider opacity-70">
              BACK ROW
            </div>
            <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 text-[10px] text-gray-400/60 font-pixel tracking-wider opacity-70">
              FRONT ROW
            </div>
          </>
        )}
      </div>
    </div>
    
    {/* Combat UI overlay at bottom */}
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-4 pt-8">
      <div className="space-y-3">
        {/* All Monsters HP bars - Grid layout for many monsters */}
        <div className="grid grid-cols-4 gap-2 max-h-24 overflow-y-auto pr-2">
          {combatState.monsters.map((monster, idx) => (
            <div 
              key={monster.id} 
              className={`p-1.5 rounded border cursor-pointer transition-all ${
                idx === combatState.targetIndex ? 'border-yellow-400 bg-yellow-400/10' : 'border-primary/30 bg-black/40'
              } ${monster.hp <= 0 ? 'opacity-50' : ''} ${
                idx < 4 ? 'border-t-2 border-t-amber-500/50' : 'border-t-2 border-t-blue-500/50'
              }`}
              onClick={() => monster.hp > 0 && setCombatState(prev => ({ ...prev, targetIndex: idx }))}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-2 h-2 rounded-full ${idx < 4 ? 'bg-amber-400' : 'bg-blue-400'}`} />
                <h2 className="font-pixel text-destructive text-xs truncate flex-1">
                  {monster.name}
                  {idx < 4 && <span className="ml-1 text-[8px] text-amber-400">(F)</span>}
                  {idx >= 4 && <span className="ml-1 text-[8px] text-blue-400">(B)</span>}
                </h2>
              </div>
              <StatBar 
                label="HP" 
                current={Math.max(0, monster.hp)} 
                max={monster.maxHp} 
                color={monster.color} 
                showNumbers={combatState.monsters.length <= 6}
              />
            </div>
          ))}
        </div>
        
        {/* Current Character Turn */}
        {game.party[combatState.currentCharIndex] && game.party[combatState.currentCharIndex].hp > 0 && (
          <div className="bg-black/60 p-2 rounded border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-xs text-primary">
                {game.party[combatState.currentCharIndex].name}'s Turn
                {combatState.monsters.length > 0 && (
                  <span className="ml-2 text-yellow-400">
                    ▶ Targeting: {combatState.monsters[combatState.targetIndex]?.name || 'None'}
                  </span>
                )}
              </span>
              <span className="font-retro text-xs text-blue-400">
                MP: {game.party[combatState.currentCharIndex].mp}/{getEffectiveStats(game.party[combatState.currentCharIndex]).maxMp}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getAbilitiesForJob(game.party[combatState.currentCharIndex].job).map((ability) => (
                <RetroButton 
                  key={ability.id}
                  onClick={() => useAbility(ability, combatState.currentCharIndex)} 
                  className="px-3 py-1 text-xs"
                  disabled={ability.mpCost > game.party[combatState.currentCharIndex].mp}
                  data-testid={`button-${ability.id}`}
                >
                  {ability.name}
                  {ability.mpCost > 0 && <span className="ml-1 text-blue-300">({ability.mpCost})</span>}
                </RetroButton>
              ))}
              <RetroButton onClick={handleRun} variant="ghost" className="px-3 py-1 text-xs" data-testid="button-run">
                RUN
              </RetroButton>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
)}