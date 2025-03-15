import {
  categories,
  guides,
  recentlyViewed,
  tips,
  type Category,
  type Guide,
  type RecentlyViewed,
  type Tip,
  type InsertCategory,
  type InsertGuide,
  type InsertRecentlyViewed,
  type InsertTip
} from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getSubcategories(parentId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Guides
  getGuides(): Promise<Guide[]>;
  getGuidesByCategory(categoryId: number): Promise<Guide[]>;
  getGuide(id: number): Promise<Guide | undefined>;
  getGuideBySlug(slug: string): Promise<Guide | undefined>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  searchGuides(query: string): Promise<Guide[]>;
  getRelatedGuides(guideId: number, limit?: number): Promise<Guide[]>;
  
  // Recently Viewed
  getRecentlyViewed(sessionId: string, limit?: number): Promise<RecentlyViewed[]>;
  addRecentlyViewed(entry: InsertRecentlyViewed): Promise<RecentlyViewed>;
  
  // Tips
  getTipsByGuide(guideId: number): Promise<Tip[]>;
  createTip(tip: InsertTip): Promise<Tip>;
  incrementHelpful(tipId: number): Promise<Tip | undefined>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private guides: Map<number, Guide>;
  private recentlyViewed: Map<number, RecentlyViewed>;
  private tips: Map<number, Tip>;
  
  private categoryIdCounter: number;
  private guideIdCounter: number;
  private recentlyViewedIdCounter: number;
  private tipIdCounter: number;

  constructor() {
    this.categories = new Map();
    this.guides = new Map();
    this.recentlyViewed = new Map();
    this.tips = new Map();
    
    this.categoryIdCounter = 1;
    this.guideIdCounter = 1;
    this.recentlyViewedIdCounter = 1;
    this.tipIdCounter = 1;
    
    // Add initial data
    this.seedData();
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async getSubcategories(parentId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.parentId === parentId
    );
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Guides
  async getGuides(): Promise<Guide[]> {
    return Array.from(this.guides.values());
  }

  async getGuidesByCategory(categoryId: number): Promise<Guide[]> {
    return Array.from(this.guides.values()).filter(
      (guide) => guide.categoryId === categoryId
    );
  }

  async getGuide(id: number): Promise<Guide | undefined> {
    return this.guides.get(id);
  }

  async getGuideBySlug(slug: string): Promise<Guide | undefined> {
    return Array.from(this.guides.values()).find(
      (guide) => guide.slug === slug
    );
  }

  async createGuide(guide: InsertGuide): Promise<Guide> {
    const id = this.guideIdCounter++;
    const now = new Date();
    const newGuide: Guide = { 
      ...guide, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.guides.set(id, newGuide);
    return newGuide;
  }

  async searchGuides(query: string): Promise<Guide[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.guides.values()).filter(
      (guide) => 
        guide.title.toLowerCase().includes(lowercaseQuery) ||
        (guide.excerpt && guide.excerpt.toLowerCase().includes(lowercaseQuery)) ||
        guide.content.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getRelatedGuides(guideId: number, limit: number = 3): Promise<Guide[]> {
    const guide = await this.getGuide(guideId);
    if (!guide) return [];

    return Array.from(this.guides.values())
      .filter((g) => g.id !== guideId && g.categoryId === guide.categoryId)
      .slice(0, limit);
  }

  // Recently Viewed
  async getRecentlyViewed(sessionId: string, limit: number = 5): Promise<RecentlyViewed[]> {
    return Array.from(this.recentlyViewed.values())
      .filter((entry) => entry.sessionId === sessionId)
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime())
      .slice(0, limit);
  }

  async addRecentlyViewed(entry: InsertRecentlyViewed): Promise<RecentlyViewed> {
    const id = this.recentlyViewedIdCounter++;
    const viewedAt = new Date();
    const newEntry: RecentlyViewed = { ...entry, id, viewedAt };
    this.recentlyViewed.set(id, newEntry);
    return newEntry;
  }

  // Tips
  async getTipsByGuide(guideId: number): Promise<Tip[]> {
    return Array.from(this.tips.values())
      .filter((tip) => tip.guideId === guideId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTip(tip: InsertTip): Promise<Tip> {
    const id = this.tipIdCounter++;
    const createdAt = new Date();
    const newTip: Tip = { ...tip, id, createdAt, helpfulCount: 0 };
    this.tips.set(id, newTip);
    return newTip;
  }

  async incrementHelpful(tipId: number): Promise<Tip | undefined> {
    const tip = this.tips.get(tipId);
    if (!tip) return undefined;

    const updatedTip: Tip = { ...tip, helpfulCount: tip.helpfulCount + 1 };
    this.tips.set(tipId, updatedTip);
    return updatedTip;
  }

  // Seed initial data
  private seedData() {
    // Main categories
    const classesCategory = this.seedCategory({ 
      name: "Classes", 
      slug: "classes", 
      description: "Character classes available in Baldur's Gate 3",
      icon: "sword" 
    });
    
    const companionsCategory = this.seedCategory({ 
      name: "Companions", 
      slug: "companions", 
      description: "Companions who can join your party in Baldur's Gate 3",
      icon: "character" 
    });
    
    const questsCategory = this.seedCategory({ 
      name: "Quests", 
      slug: "quests", 
      description: "Main and side quests in Baldur's Gate 3",
      icon: "quest" 
    });
    
    const itemsCategory = this.seedCategory({ 
      name: "Items & Equipment", 
      slug: "items-equipment", 
      description: "Items, weapons, armor and magical artifacts in Baldur's Gate 3",
      icon: "shield" 
    });
    
    const mechanicsCategory = this.seedCategory({ 
      name: "Mechanics", 
      slug: "mechanics", 
      description: "Game mechanics and systems in Baldur's Gate 3",
      icon: "spell" 
    });

    // Class subcategories
    const fighterCategory = this.seedCategory({ 
      name: "Fighter", 
      slug: "fighter", 
      parentId: classesCategory.id,
      description: "Guides for the Fighter class in Baldur's Gate 3" 
    });
    
    this.seedCategory({ 
      name: "Wizard", 
      slug: "wizard", 
      parentId: classesCategory.id,
      description: "Guides for the Wizard class in Baldur's Gate 3" 
    });
    
    this.seedCategory({ 
      name: "Rogue", 
      slug: "rogue", 
      parentId: classesCategory.id,
      description: "Guides for the Rogue class in Baldur's Gate 3" 
    });

    // Companion subcategories
    this.seedCategory({ 
      name: "Shadowheart", 
      slug: "shadowheart", 
      parentId: companionsCategory.id,
      description: "Guides for the Shadowheart companion in Baldur's Gate 3" 
    });
    
    this.seedCategory({ 
      name: "Astarion", 
      slug: "astarion", 
      parentId: companionsCategory.id,
      description: "Guides for the Astarion companion in Baldur's Gate 3" 
    });
    
    this.seedCategory({ 
      name: "Gale", 
      slug: "gale", 
      parentId: companionsCategory.id,
      description: "Guides for the Gale companion in Baldur's Gate 3" 
    });

    // Guides
    const fighterGuide = this.seedGuide({
      title: "Fighter Class Guide",
      slug: "fighter-class-guide",
      excerpt: "Masters of martial combat, fighters are skilled with many weapons and armor types. Whether you prefer the brute force of a greatsword or the precision of a bow, the fighter class offers versatility and power.",
      content: `
# Fighter Class Overview

Fighters excel at combat—defeating their enemies through superior weapons and armor. They are skilled in a variety of fighting styles, from two-handed weapons to sword and shield tactics. In Baldur's Gate 3, fighters are strong frontliners who can absorb damage and dish out consistent damage.

## Fighter Class Stats

- **Hit Dice**: d10
- **Primary Ability**: Strength or Dexterity
- **Saving Throws**: Strength, Constitution
- **Armor Proficiency**: All armor, shields
- **Weapon Proficiency**: Simple and martial weapons
- **Tool Proficiency**: None

## Key Fighter Features

### Fighting Style
At 1st level, fighters adopt a particular style of fighting. Choose from options like Archery, Defense, Dueling, Great Weapon Fighting, Protection, or Two-Weapon Fighting. Each provides unique benefits.

### Second Wind
You have a limited well of stamina that you can draw on to protect yourself from harm. As a bonus action, you can regain hit points equal to 1d10 + your fighter level. Once used, you must take a short or long rest before using it again.

### Action Surge
Starting at 2nd level, you can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once used, you must finish a short or long rest before using it again.

## Recommended Ability Scores

- **Strength**: 15-16 (Primary for melee fighters)
- **Dexterity**: 14-16 (Useful for AC and ranged attacks)
- **Constitution**: 14-16 (More health and CON saves)
- **Intelligence**: 8-10 (Important for Eldritch Knight)
- **Wisdom**: 10-12 (Helps with Perception)
- **Charisma**: 8-10 (Not essential for fighters)

## Pro Tips

- **Position Wisely**: As a fighter, you'll want to position yourself between enemies and your more vulnerable allies.
- **Conserve Resources**: Save Action Surge for critical moments when you need burst damage.
- **Know Your Role**: Depending on your build, you might be the party's tank, damage dealer, or a mix of both.
- **Tactical Advantage**: Use height and terrain to gain combat advantages when possible.
      `,
      categoryId: fighterCategory.id,
      featuredImage: "https://images.unsplash.com/photo-1595327656903-2f54e37ce09b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tags: ["Melee Combat", "Heavy Armor", "Battle Master", "Eldritch Knight", "Champion"],
      patch: "Patch 5"
    });

    this.seedGuide({
      title: "Battle Master Fighter Guide",
      slug: "battle-master-fighter-guide",
      excerpt: "Master combat maneuvers with the Battle Master. Learn the best tactics and builds.",
      content: `
# Battle Master Fighter Guide

The Battle Master is a fighter subclass that focuses on combat maneuvers. These maneuvers allow you to control the battlefield, deal extra damage, and support your allies.

## Key Features

- **Combat Superiority**: You gain a pool of superiority dice that you can spend to fuel various maneuvers.
- **Maneuvers**: You learn three maneuvers at 3rd level, with more at higher levels.
- **Know Your Enemy**: Starting at 7th level, you can study a creature to gain information about its capabilities.

## Best Maneuvers

1. **Menacing Attack**: This maneuver can frighten enemies, preventing them from moving closer to you.
2. **Trip Attack**: Knock enemies prone to give melee allies advantage on attacks.
3. **Riposte**: Counter-attack when an enemy misses you.
4. **Precision Attack**: Add to your attack roll when you need it most.

## Recommended Builds

### Battlefield Controller
Focus on maneuvers that control enemy movement and positioning. Use a shield and one-handed weapon for better survivability.

### Damage Dealer
Focus on maneuvers that add damage and use a two-handed weapon for maximum damage output.

## Tips and Tricks

- Save your superiority dice for critical moments.
- Coordinate with your party for maximum effect.
- Position yourself to affect multiple enemies with your maneuvers.
      `,
      categoryId: fighterCategory.id,
      featuredImage: "https://images.unsplash.com/photo-1612870946687-066929736e99?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      tags: ["Fighter", "Battle Master", "Combat Maneuvers", "Tactics"],
      patch: "Patch 5"
    });

    this.seedGuide({
      title: "Eldritch Knight Guide",
      slug: "eldritch-knight-guide",
      excerpt: "Combine fighter combat abilities with wizard spells for a devastating hybrid.",
      content: `
# Eldritch Knight Guide

The Eldritch Knight is a fighter subclass that combines martial prowess with arcane magic. You gain access to wizard spells, primarily from the Abjuration and Evocation schools.

## Key Features

- **Spellcasting**: You can cast wizard spells, primarily from the Abjuration and Evocation schools.
- **Weapon Bond**: You can bond with up to two weapons, allowing you to summon them to your hand as a bonus action.
- **War Magic**: Starting at 7th level, you can cast a cantrip and make a weapon attack as a bonus action.

## Recommended Spells

### Cantrips
- **Booming Blade**: Great for controlling enemy movement.
- **Green-Flame Blade**: Good for dealing with groups of enemies.
- **Blade Ward**: Reduce incoming damage when needed.

### 1st Level
- **Shield**: Boost your AC when you need it most.
- **Absorb Elements**: Reduce elemental damage and add it to your next attack.
- **Magic Missile**: Guaranteed damage that doesn't require an attack roll.

## Ability Score Priorities

1. **Strength/Dexterity**: Still your primary stat for attacks and damage.
2. **Intelligence**: Powers your spells, but can be secondary.
3. **Constitution**: Important for concentration checks and hit points.

## Tips and Tricks

- Use your spells to supplement your combat abilities, not replace them.
- Focus on spells that don't rely heavily on your Intelligence score.
- Use War Magic to cast a cantrip and then make a weapon attack.
      `,
      categoryId: fighterCategory.id,
      featuredImage: "https://images.unsplash.com/photo-1594380404522-8e7e41d63fa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      tags: ["Fighter", "Eldritch Knight", "Spellcasting", "Magic"],
      patch: "Patch 5"
    });

    this.seedGuide({
      title: "Best Fighter Weapons in BG3",
      slug: "best-fighter-weapons-bg3",
      excerpt: "From legendary swords to enchanted hammers, find the best weapons for your Fighter.",
      content: `
# Best Fighter Weapons in Baldur's Gate 3

This guide covers the most powerful and effective weapons for Fighters in Baldur's Gate 3, organized by weapon type and where to find them.

## One-Handed Weapons

### Swords
1. **The Watcher**: A +1 longsword that grants advantage on perception checks. Found in the Blighted Village.
2. **Bloodthirst**: This +2 shortsword has a chance to deal extra necrotic damage. Looted from a certain boss in Act 2.

### Axes
1. **Axe of Mielikki**: This handaxe grants extra poison damage and can be thrown. Found in a hidden chest in the Emerald Grove.

## Two-Handed Weapons

### Greatswords
1. **Faithbreaker**: A +2 greatsword that deals extra damage to religious targets. Found in the Underdark.
2. **Sword of Justice**: This greatsword grants advantage against undead and fiends. Reward for completing a specific quest in Act 2.

### Polearms
1. **Spear of Night**: A +1 halberd that grants darkvision. Found in a cave in the Underdark.

## Ranged Weapons

### Bows
1. **Longbow of the Seldarine**: This +2 longbow grants extra radiant damage. Rare drop from certain enemies in Act 3.

## Unique Weapons

1. **Hellrider's Pride**: A versatile weapon that changes type based on your chosen fighting style. Complete the Hellrider questline to obtain.

## Best Weapons By Build

### Tank Build
- **Shield of the Emperor** + **The Watcher**: Great defensive combination with good damage.

### Two-Handed Build
- **Faithbreaker**: High damage output with useful effects against certain enemies.

### Ranged Build
- **Longbow of the Seldarine**: Excellent damage and range with bonus radiant damage.
      `,
      categoryId: fighterCategory.id,
      featuredImage: "https://images.unsplash.com/photo-1586788224331-947f68671cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      tags: ["Fighter", "Weapons", "Equipment", "Loot"],
      patch: "Patch 5"
    });

    // Tips
    this.seedTip({
      guideId: fighterGuide.id,
      author: "TavernWanderer",
      content: "For Battle Masters, the Menacing Attack maneuver is amazing for controlling enemies. The fear effect prevents them from moving closer to you, giving your ranged party members free attacks."
    });

    this.seedTip({
      guideId: fighterGuide.id,
      author: "DungeonMaster42",
      content: "Don't underestimate the power of high ground! As a Fighter, try to position yourself on elevated terrain whenever possible for that +2 bonus to attack rolls. It makes a huge difference, especially with Action Surge."
    });
  }

  private seedCategory(category: InsertCategory): Category {
    const id = this.categoryIdCounter++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  private seedGuide(guide: InsertGuide): Guide {
    const id = this.guideIdCounter++;
    const now = new Date();
    const newGuide: Guide = { 
      ...guide, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.guides.set(id, newGuide);
    return newGuide;
  }

  private seedTip(tip: InsertTip): Tip {
    const id = this.tipIdCounter++;
    const createdAt = new Date();
    const newTip: Tip = { 
      ...tip, 
      id, 
      createdAt, 
      helpfulCount: Math.floor(Math.random() * 30) 
    };
    this.tips.set(id, newTip);
    return newTip;
  }
}

export const storage = new MemStorage();
