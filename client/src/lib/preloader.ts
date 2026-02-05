// Image preloader utility - loads all game assets into memory before gameplay

// Monster sprite imports
import basilisk from '@/assets/monsters/basilisk.png';
import caveBat from '@/assets/monsters/cave_bat.png';
import caveCrawler from '@/assets/monsters/cave_crawler.png';
import darkKnight from '@/assets/monsters/dark_knight.png';
import deathKnight from '@/assets/monsters/death_knight.png';
import demon from '@/assets/monsters/demon.png';
import dragon from '@/assets/monsters/dragon.png';
import dungeonSpider from '@/assets/monsters/dungeon_spider.png';
import fireImp from '@/assets/monsters/fire_imp.png';
import gargoyle from '@/assets/monsters/gargoyle.png';
import giantBeetle from '@/assets/monsters/giant_beetle.png';
import giantRat from '@/assets/monsters/giant_rat.png';
import golem from '@/assets/monsters/golem.png';
import harpy from '@/assets/monsters/harpy.png';
import kobold from '@/assets/monsters/kobold.png';
import lich from '@/assets/monsters/lich.png';
import minotaur from '@/assets/monsters/minotaur.png';
import mummy from '@/assets/monsters/mummy.png';
import orcWarrior from '@/assets/monsters/orc_warrior.png';
import poisonMushroom from '@/assets/monsters/poison_mushroom.png';
import shadowWisp from '@/assets/monsters/shadow_wisp.png';
import skeleton from '@/assets/monsters/skeleton.png';
import slimeWarrior from '@/assets/monsters/slime_warrior.png';
import slimyOoze from '@/assets/monsters/slimy_ooze.png';
import smallGoblin from '@/assets/monsters/small_goblin.png';
import troll from '@/assets/monsters/troll.png';
import werewolf from '@/assets/monsters/werewolf.png';
import wraith from '@/assets/monsters/wraith.png';
import zombie from '@/assets/monsters/zombie.png';

// All monster sprites
const monsterSprites = [
  basilisk, caveBat, caveCrawler, darkKnight, deathKnight,
  demon, dragon, dungeonSpider, fireImp, gargoyle,
  giantBeetle, giantRat, golem, harpy, kobold,
  lich, minotaur, mummy, orcWarrior, poisonMushroom,
  shadowWisp, skeleton, slimeWarrior, slimyOoze, smallGoblin,
  troll, werewolf, wraith, zombie
];

// Dungeon textures (from public folder)
const dungeonTextures = [
  '/assets/textures/floor_cobble.png',
  '/assets/textures/floor_crypt.png',
  '/assets/textures/floor_forest.png',
  '/assets/textures/floor_ice.png',
  '/assets/textures/floor_temple.png',
  '/assets/textures/wall_crypt.png',
  '/assets/textures/wall_forest.png',
  '/assets/textures/wall_ice.png',
  '/assets/textures/wall_stone.png',
  '/assets/textures/wall_temple.png'
];

// All assets to preload
const allAssets = [...monsterSprites, ...dungeonTextures];

// Cache for loaded images
const imageCache: Map<string, HTMLImageElement> = new Map();

// Preload a single image and return a promise
function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Check cache first
    if (imageCache.has(src)) {
      resolve(imageCache.get(src)!);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => {
      // Don't fail on single image error, just log and continue
      console.warn(`Failed to preload: ${src}`);
      resolve(img);
    };
    img.src = src;
  });
}

// Main preload function with progress callback
export async function preloadGameAssets(
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  const total = allAssets.length;
  let loaded = 0;
  
  // Load images in parallel batches for speed
  const batchSize = 10;
  
  for (let i = 0; i < allAssets.length; i += batchSize) {
    const batch = allAssets.slice(i, i + batchSize);
    await Promise.all(batch.map(async (src) => {
      await preloadImage(src);
      loaded++;
      onProgress?.(loaded, total);
    }));
  }
}

// Get cached image (for use in rendering)
export function getCachedImage(src: string): HTMLImageElement | undefined {
  return imageCache.get(src);
}

// Check if all assets are loaded
export function areAssetsLoaded(): boolean {
  return allAssets.every(src => imageCache.has(src));
}

// Get total asset count
export function getTotalAssetCount(): number {
  return allAssets.length;
}
