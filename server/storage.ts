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
      name: "Классы", 
      slug: "classes", 
      description: "Игровые классы персонажей в Baldur's Gate 3",
      icon: "sword" 
    });
    
    const companionsCategory = this.seedCategory({ 
      name: "Компаньоны", 
      slug: "companions", 
      description: "Спутники, которые могут присоединиться к вашей группе в Baldur's Gate 3",
      icon: "character" 
    });
    
    const questsCategory = this.seedCategory({ 
      name: "Квесты", 
      slug: "quests", 
      description: "Основные и второстепенные задания в Baldur's Gate 3",
      icon: "quest" 
    });
    
    const itemsCategory = this.seedCategory({ 
      name: "Предметы и снаряжение", 
      slug: "items-equipment", 
      description: "Предметы, оружие, броня и магические артефакты в Baldur's Gate 3",
      icon: "shield" 
    });
    
    const mechanicsCategory = this.seedCategory({ 
      name: "Механики", 
      slug: "mechanics", 
      description: "Игровые механики и системы в Baldur's Gate 3",
      icon: "spell" 
    });

    // Class subcategories
    const fighterCategory = this.seedCategory({ 
      name: "Воин", 
      slug: "fighter", 
      parentId: classesCategory.id,
      description: "Руководства по классу Воин в Baldur's Gate 3" 
    });
    
    this.seedCategory({ 
      name: "Волшебник", 
      slug: "wizard", 
      parentId: classesCategory.id,
      description: "Руководства по классу Волшебник в Baldur's Gate 3" 
    });
    
    this.seedCategory({ 
      name: "Плут", 
      slug: "rogue", 
      parentId: classesCategory.id,
      description: "Руководства по классу Плут в Baldur's Gate 3" 
    });

    // Companion subcategories
    this.seedCategory({ 
      name: "Шэдоухарт", 
      slug: "shadowheart", 
      parentId: companionsCategory.id,
      description: "Руководства по спутнику Шэдоухарт в Baldur's Gate 3" 
    });
    
    this.seedCategory({ 
      name: "Астарион", 
      slug: "astarion", 
      parentId: companionsCategory.id,
      description: "Руководства по спутнику Астарион в Baldur's Gate 3" 
    });
    
    this.seedCategory({ 
      name: "Гейл", 
      slug: "gale", 
      parentId: companionsCategory.id,
      description: "Руководства по спутнику Гейл в Baldur's Gate 3" 
    });

    // Guides
    const fighterGuide = this.seedGuide({
      title: "Руководство по классу Воин",
      slug: "fighter-class-guide",
      excerpt: "Мастера боевых искусств, воины владеют множеством видов оружия и типов брони. Независимо от того, предпочитаете ли вы грубую силу двуручного меча или точность лука, класс воина предлагает универсальность и мощь.",
      content: `
# Обзор класса Воин

Воины превосходны в бою — побеждая своих врагов благодаря превосходному оружию и броне. Они искусны в различных боевых стилях, от двуручного оружия до тактики меча и щита. В Baldur's Gate 3 воины — сильные фронтлайнеры, которые могут поглощать урон и наносить постоянный урон.

## Характеристики класса Воин

- **Кость здоровья**: d10
- **Основная характеристика**: Сила или Ловкость
- **Спасброски**: Сила, Телосложение
- **Владение доспехами**: Все доспехи, щиты
- **Владение оружием**: Простое и воинское оружие
- **Владение инструментами**: Нет

## Ключевые особенности Воина

### Боевой стиль
На 1-м уровне воины выбирают определенный стиль боя. Выберите из таких вариантов, как Стрельба, Защита, Дуэлянт, Сражение большим оружием, Защитник или Сражение двумя оружиями. Каждый стиль предоставляет уникальные преимущества.

### Второе дыхание
У вас есть ограниченный запас выносливости, который вы можете использовать для защиты от вреда. Бонусным действием вы можете восстановить очки здоровья, равные 1d10 + ваш уровень воина. После использования вы должны совершить короткий или продолжительный отдых, прежде чем использовать эту способность снова.

### Всплеск действий
Начиная со 2-го уровня, вы можете на мгновение выйти за пределы своих обычных возможностей. В свой ход вы можете совершить одно дополнительное действие. После использования вы должны завершить короткий или продолжительный отдых, прежде чем использовать эту способность снова.

## Рекомендуемые значения характеристик

- **Сила**: 15-16 (Основная для воинов ближнего боя)
- **Ловкость**: 14-16 (Полезна для КД и дальних атак)
- **Телосложение**: 14-16 (Больше здоровья и спасбросков ТЕЛ)
- **Интеллект**: 8-10 (Важно для Мистического Рыцаря)
- **Мудрость**: 10-12 (Помогает с Восприятием)
- **Харизма**: 8-10 (Не существенна для воинов)

## Профессиональные советы

- **Разумное позиционирование**: Как воин, вы должны располагаться между врагами и вашими более уязвимыми союзниками.
- **Сохраняйте ресурсы**: Берегите Всплеск действий для критических моментов, когда вам нужен взрывной урон.
- **Знайте свою роль**: В зависимости от вашей сборки, вы можете быть танком отряда, наносителем урона или сочетать оба этих качества.
- **Тактическое преимущество**: Используйте высоту и местность для получения боевых преимуществ, когда это возможно.
      `,
      categoryId: fighterCategory.id,
      featuredImage: "https://images.unsplash.com/photo-1595327656903-2f54e37ce09b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      tags: ["Ближний бой", "Тяжёлая броня", "Мастер боя", "Мистический рыцарь", "Чемпион"],
      patch: "Патч 5"
    });

    this.seedGuide({
      title: "Руководство по Мастеру Боя",
      slug: "battle-master-fighter-guide",
      excerpt: "Освойте боевые приемы с Мастером Боя. Изучите лучшие тактики и сборки.",
      content: `
# Руководство по Мастеру Боя

Мастер Боя - это подкласс воина, который фокусируется на боевых приемах. Эти приемы позволяют вам контролировать поле боя, наносить дополнительный урон и поддерживать своих союзников.

## Ключевые особенности

- **Боевое превосходство**: Вы получаете запас кубиков превосходства, которые можно использовать для различных приемов.
- **Приемы**: Вы изучаете три приема на 3-м уровне, с возможностью изучения новых на более высоких уровнях.
- **Знай своего врага**: Начиная с 7-го уровня, вы можете изучать существо, чтобы получить информацию о его возможностях.

## Лучшие приемы

1. **Пугающая атака**: Этот прием может испугать врагов, не позволяя им приближаться к вам.
2. **Сбивающая атака**: Сбивает врагов с ног, давая союзникам ближнего боя преимущество при атаках.
3. **Ответный удар**: Контратака, когда враг промахивается по вам.
4. **Точная атака**: Добавляет бонус к броску атаки, когда это наиболее необходимо.

## Рекомендуемые сборки

### Контроль поля боя
Сосредоточьтесь на приемах, которые контролируют передвижение и позиционирование врагов. Используйте щит и одноручное оружие для лучшей выживаемости.

### Наноситель урона
Сосредоточьтесь на приемах, которые добавляют урон, и используйте двуручное оружие для максимальной эффективности.

## Советы и хитрости

- Берегите кубики превосходства для критических моментов.
- Координируйте свои действия с группой для максимального эффекта.
- Располагайтесь так, чтобы влиять на нескольких противников вашими приемами.
      `,
      categoryId: fighterCategory.id,
      featuredImage: "https://images.unsplash.com/photo-1612870946687-066929736e99?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      tags: ["Воин", "Мастер Боя", "Боевые приемы", "Тактика"],
      patch: "Патч 5"
    });

    this.seedGuide({
      title: "Руководство по Мистическому Рыцарю",
      slug: "eldritch-knight-guide",
      excerpt: "Объедините боевые способности воина с заклинаниями волшебника для сокрушительного гибрида.",
      content: `
# Руководство по Мистическому Рыцарю

Мистический Рыцарь — это подкласс воина, который сочетает боевое мастерство с тайной магией. Вы получаете доступ к заклинаниям волшебника, преимущественно из школ Ограждения и Воплощения.

## Ключевые особенности

- **Колдовство**: Вы можете использовать заклинания волшебника, преимущественно из школ Ограждения и Воплощения.
- **Связь с оружием**: Вы можете связаться с двумя видами оружия, позволяя призывать их в руку бонусным действием.
- **Боевая магия**: Начиная с 7-го уровня, вы можете сотворить заговор и совершить атаку оружием бонусным действием.

## Рекомендуемые заклинания

### Заговоры
- **Гремящий клинок**: Отлично подходит для контроля движения противника.
- **Клинок зеленого пламени**: Хорош для борьбы с группами противников.
- **Защита клинка**: Снижает получаемый урон при необходимости.

### 1-й уровень
- **Щит**: Повышает вашу КД, когда это особенно необходимо.
- **Поглощение стихий**: Уменьшает стихийный урон и добавляет его к вашей следующей атаке.
- **Волшебная стрела**: Гарантированный урон, не требующий броска атаки.

## Приоритеты характеристик

1. **Сила/Ловкость**: По-прежнему ваша основная характеристика для атак и урона.
2. **Интеллект**: Усиливает ваши заклинания, но может быть второстепенной.
3. **Телосложение**: Важно для проверок концентрации и очков здоровья.

## Советы и хитрости

- Используйте ваши заклинания для дополнения боевых способностей, а не для их замены.
- Сосредоточьтесь на заклинаниях, которые не сильно зависят от показателя Интеллекта.
- Используйте Боевую магию, чтобы сотворить заговор, а затем совершить атаку оружием.
      `,
      categoryId: fighterCategory.id,
      featuredImage: "https://images.unsplash.com/photo-1594380404522-8e7e41d63fa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      tags: ["Воин", "Мистический Рыцарь", "Колдовство", "Магия"],
      patch: "Патч 5"
    });

    this.seedGuide({
      title: "Лучшее оружие для Воина в BG3",
      slug: "best-fighter-weapons-bg3",
      excerpt: "От легендарных мечей до зачарованных молотов, найдите лучшее оружие для вашего Воина.",
      content: `
# Лучшее оружие для Воина в Baldur's Gate 3

Это руководство охватывает самое мощное и эффективное оружие для Воинов в Baldur's Gate 3, организованное по типам и местам, где их можно найти.

## Одноручное оружие

### Мечи
1. **Страж**: Длинный меч +1, который дает преимущество при проверках восприятия. Можно найти в Заброшенной деревне.
2. **Кровожадность**: Этот короткий меч +2 имеет шанс нанести дополнительный некротический урон. Добывается с определенного босса в Акте 2.

### Топоры
1. **Топор Миелики**: Этот ручной топор наносит дополнительный урон ядом и может быть брошен. Находится в спрятанном сундуке в Изумрудной роще.

## Двуручное оружие

### Двуручные мечи
1. **Разрушитель веры**: Двуручный меч +2, который наносит дополнительный урон религиозным целям. Находится в Подземье.
2. **Меч правосудия**: Этот двуручный меч дает преимущество против нежити и демонов. Награда за выполнение определенного задания в Акте 2.

### Древковое оружие
1. **Копье ночи**: Алебарда +1, которая дает темное зрение. Находится в пещере в Подземье.

## Дальнобойное оружие

### Луки
1. **Длинный лук Селдарина**: Этот длинный лук +2 наносит дополнительный урон излучением. Редкий трофей с определенных противников в Акте 3.

## Уникальное оружие

1. **Гордость Адского всадника**: Универсальное оружие, которое меняет тип в зависимости от выбранного боевого стиля. Завершите квестовую линию Адского всадника, чтобы получить его.

## Лучшее оружие по сборкам

### Сборка Танка
- **Щит Императора** + **Страж**: Отличная защитная комбинация с хорошим уроном.

### Сборка с двуручным оружием
- **Разрушитель веры**: Высокий выходной урон с полезными эффектами против определенных противников.

### Сборка дальнего боя
- **Длинный лук Селдарина**: Отличный урон и дальность с бонусным уроном излучением.
      `,
      categoryId: fighterCategory.id,
      featuredImage: "https://images.unsplash.com/photo-1586788224331-947f68671cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      tags: ["Воин", "Оружие", "Снаряжение", "Добыча"],
      patch: "Патч 5"
    });

    // Tips
    this.seedTip({
      guideId: fighterGuide.id,
      author: "TavernWanderer",
      content: "Для Мастеров Боя приём Пугающая атака превосходен для контроля противников. Эффект страха не позволяет им приближаться к вам, давая дальнобойным членам группы возможность атаковать свободно."
    });

    this.seedTip({
      guideId: fighterGuide.id,
      author: "DungeonMaster42",
      content: "Не недооценивайте силу высокой позиции! Как Воин, старайтесь располагаться на возвышенной местности, когда это возможно, для получения бонуса +2 к броскам атаки. Это создаёт огромную разницу, особенно при использовании Всплеска действий."
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
