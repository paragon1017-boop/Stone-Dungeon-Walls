import { WebGLRenderer } from './webgl-renderer.js';
import { 
  createInitialState, 
  GameData, 
  getRandomMonster, 
  getRandomEquipmentDrop, 
  getRandomPotionDrop,
  generateFloorMap,
  isValidTile,
  TILE_WALL,
  TILE_LADDER_DOWN,
  TILE_LADDER_UP,
  Player
} from './game-engine.js';

class GameApplication {
  private renderer: WebGLRenderer;
  private gameData: GameData;
  private canvas: HTMLCanvasElement;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private messages: string[] = [];
  
  // UI Elements
  private playerStatsEl: HTMLElement;
  private floorLevelEl: HTMLElement;
  private goldAmountEl: HTMLElement;
  private playerPositionEl: HTMLElement;
  private actionCountEl: HTMLElement;
  private messageLogEl: HTMLElement;
  private loadingEl: HTMLElement;
  
  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    
    // Get UI elements
    this.playerStatsEl = document.getElementById('playerStats')!;
    this.floorLevelEl = document.getElementById('floorLevel')!;
    this.goldAmountEl = document.getElementById('goldAmount')!;
    this.playerPositionEl = document.getElementById('playerPosition')!;
    this.actionCountEl = document.getElementById('actionCount')!;
    this.messageLogEl = document.getElementById('messageLog')!;
    this.loadingEl = document.getElementById('loading')!;
    
    // Initialize WebGL renderer
    try {
      this.renderer = new WebGLRenderer(this.canvas);
      
      // Load game data
      this.gameData = createInitialState();
      
      // Center camera on player
      this.centerCameraOnPlayer();
      
      // Setup event listeners
      this.setupControls();
      this.setupUI();
      
      // Hide loading screen
      setTimeout(() => {
        this.loadingEl.style.display = 'none';
      }, 500);
      
      // Start game loop
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop();
      
      // Add welcome message
      this.addMessage('Welcome to the Dungeon Crawler!', 'system');
      this.addMessage('Use WASD or arrow keys to move', 'system');
      this.addMessage('Press SPACE to attack or interact', 'system');
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.loadingEl.innerHTML = `Error: ${error}. Please use a browser that supports WebGL2.`;
    }
  }
  
  private centerCameraOnPlayer(): void {
    const centerX = this.canvas.width / 2 / 32;
    const centerY = this.canvas.height / 2 / 32;
    this.renderer.setCamera(this.gameData.x - centerX, this.gameData.y - centerY, 1.0);
  }
  
  private setupControls(): void {
    // Keyboard controls
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    
    // Button controls
    document.getElementById('btnUp')?.addEventListener('click', () => this.movePlayer(0, -1));
    document.getElementById('btnDown')?.addEventListener('click', () => this.movePlayer(0, 1));
    document.getElementById('btnLeft')?.addEventListener('click', () => this.movePlayer(-1, 0));
    document.getElementById('btnRight')?.addEventListener('click', () => this.movePlayer(1, 0));
    document.getElementById('btnAttack')?.addEventListener('click', () => this.handleCombat());
    document.getElementById('btnInventory')?.addEventListener('click', () => this.showInventory());
    
    // Window resize
    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
  }
  
  private handleResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.canvas.width = width;
    this.canvas.height = height;
    this.renderer.resize(width, height);
    this.centerCameraOnPlayer();
  }
  
  private setupUI(): void {
    this.updateUI();
  }
  
  private updateUI(): void {
    // Update player stats
    this.playerStatsEl.innerHTML = '';
    this.gameData.party.forEach(player => {
      const healthPercent = (player.hp / player.maxHp) * 100;
      const manaPercent = player.maxMp > 0 ? (player.mp / player.maxMp) * 100 : 0;
      
      const playerStat = document.createElement('div');
      playerStat.className = `player-stat ${player.job.toLowerCase()}`;
      playerStat.innerHTML = `
        <div class="stat-name">${player.name} (${player.job})</div>
        <div class="stat-value">Lvl ${player.level}</div>
        <div>HP: ${player.hp}/${player.maxHp}</div>
        <div class="health-bar">
          <div class="health-fill" style="width: ${healthPercent}%"></div>
        </div>
        ${player.maxMp > 0 ? `
          <div>MP: ${player.mp}/${player.maxMp}</div>
          <div class="mana-bar" style="width: ${manaPercent}%"></div>
        ` : ''}
      `;
      this.playerStatsEl.appendChild(playerStat);
    });
    
    // Update game info
    this.floorLevelEl.textContent = this.gameData.level.toString();
    this.goldAmountEl.textContent = this.gameData.gold.toString();
    this.playerPositionEl.textContent = `${this.gameData.x}, ${this.gameData.y}`;
    this.actionCountEl.textContent = this.gameData.actionCount.toString();
  }
  
  private addMessage(text: string, type: 'combat' | 'item' | 'system' = 'system'): void {
    const message = document.createElement('div');
    message.className = `message ${type}-message`;
    message.textContent = text;
    this.messageLogEl.appendChild(message);
    
    // Keep only last 10 messages
    while (this.messageLogEl.children.length > 10) {
      this.messageLogEl.removeChild(this.messageLogEl.firstChild!);
    }
    
    // Scroll to bottom
    this.messageLogEl.scrollTop = this.messageLogEl.scrollHeight;
  }
  
  private handleKeyDown(event: KeyboardEvent): void {
    // Prevent default behavior for game controls
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(event.key)) {
      event.preventDefault();
    }
    
    let moved = false;
    let dx = 0;
    let dy = 0;
    
    switch (event.key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        dy = -1;
        moved = true;
        break;
      case 'arrowdown':
      case 's':
        dy = 1;
        moved = true;
        break;
      case 'arrowleft':
      case 'a':
        dx = -1;
        moved = true;
        break;
      case 'arrowright':
      case 'd':
        dx = 1;
        moved = true;
        break;
      case ' ': // Space bar for combat/interaction
        this.handleCombat();
        break;
      case 'i': // Inventory
        this.showInventory();
        break;
    }
    
    if (moved) {
      this.movePlayer(dx, dy);
    }
  }
  
  private movePlayer(dx: number, dy: number): void {
    const