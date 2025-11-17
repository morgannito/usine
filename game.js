// ============================================================================
// USINE - Factory Builder Game
// Un jeu de construction d'usine inspiré de Factorio et Satisfactory
// ============================================================================

// Configuration globale
const CONFIG = {
    TILE_SIZE: 64,
    GRID_WIDTH: 100,
    GRID_HEIGHT: 100,
    FPS_UPDATE_INTERVAL: 500,
    PRODUCTION_TICK_RATE: 1000, // Mise à jour de la production toutes les secondes
    TRANSFER_RATE: 1, // Ressources transférées par tick entre bâtiments adjacents
    MAX_TRANSFER_DISTANCE: 1, // Distance maximale pour le transfert automatique
};

// Types de ressources
const RESOURCES = {
    IRON_ORE: { name: 'Minerai de Fer', color: '#8B4513', icon: '⛏️' },
    COPPER_ORE: { name: 'Minerai de Cuivre', color: '#CD7F32', icon: '⛏️' },
    COAL: { name: 'Charbon', color: '#2F4F4F', icon: '⛏️' },
    STONE: { name: 'Pierre', color: '#808080', icon: '🪨' },
    IRON_PLATE: { name: 'Plaque de Fer', color: '#A9A9A9', icon: '▭' },
    COPPER_PLATE: { name: 'Plaque de Cuivre', color: '#B87333', icon: '▭' },
    STEEL: { name: 'Acier', color: '#4A5568', icon: '⬛' },
    GEAR: { name: 'Engrenage', color: '#C0C0C0', icon: '⚙️' },
    CIRCUIT: { name: 'Circuit', color: '#00FF00', icon: '⚡' },
    ADVANCED_CIRCUIT: { name: 'Circuit Avancé', color: '#FF00FF', icon: '💎' },
    WIRE: { name: 'Câble', color: '#FF8C00', icon: '〰️' },
    CONCRETE: { name: 'Béton', color: '#696969', icon: '▪️' },
};

// Types de bâtiments
const BUILDING_TYPES = {
    IRON_EXTRACTOR: {
        name: 'Extracteur de Fer',
        description: 'Extrait du minerai de fer',
        color: '#8B4513',
        produces: 'IRON_ORE',
        productionRate: 1,
        requiresResource: true,
    },
    COPPER_EXTRACTOR: {
        name: 'Extracteur de Cuivre',
        description: 'Extrait du minerai de cuivre',
        color: '#CD7F32',
        produces: 'COPPER_ORE',
        productionRate: 1,
        requiresResource: true,
    },
    COAL_EXTRACTOR: {
        name: 'Extracteur de Charbon',
        description: 'Extrait du charbon',
        color: '#2F4F4F',
        produces: 'COAL',
        productionRate: 1,
        requiresResource: true,
    },
    STONE_EXTRACTOR: {
        name: 'Carrière de Pierre',
        description: 'Extrait de la pierre',
        color: '#808080',
        produces: 'STONE',
        productionRate: 1,
        requiresResource: true,
    },
    FURNACE: {
        name: 'Fourneau',
        description: 'Transforme les minerais en plaques',
        color: '#FF4500',
        recipes: [
            { input: { IRON_ORE: 1 }, output: { IRON_PLATE: 1 }, time: 1 },
            { input: { COPPER_ORE: 1 }, output: { COPPER_PLATE: 1 }, time: 1 },
        ],
        autoOutput: true, // Transfert automatique des produits finis
    },
    STEEL_FURNACE: {
        name: 'Haut Fourneau',
        description: 'Produit de l\'acier',
        color: '#DC143C',
        recipes: [
            { input: { IRON_PLATE: 5, COAL: 2 }, output: { STEEL: 1 }, time: 3 },
        ],
        autoOutput: true,
    },
    ASSEMBLER: {
        name: 'Assembleur',
        description: 'Fabrique des composants',
        color: '#4169E1',
        recipes: [
            { input: { IRON_PLATE: 2 }, output: { GEAR: 1 }, time: 1 },
            { input: { COPPER_PLATE: 1 }, output: { WIRE: 2 }, time: 1 },
            { input: { COPPER_PLATE: 2, IRON_PLATE: 1 }, output: { CIRCUIT: 1 }, time: 2 },
        ],
        autoOutput: true,
    },
    ADVANCED_ASSEMBLER: {
        name: 'Assembleur Avancé',
        description: 'Fabrique des composants complexes',
        color: '#9370DB',
        recipes: [
            { input: { CIRCUIT: 2, COPPER_PLATE: 2, WIRE: 4 }, output: { ADVANCED_CIRCUIT: 1 }, time: 4 },
            { input: { STONE: 5, IRON_ORE: 1 }, output: { CONCRETE: 10 }, time: 2 },
        ],
        autoOutput: true,
    },
    CONVEYOR: {
        name: 'Convoyeur',
        description: 'Transporte les ressources sur de longues distances',
        color: '#FFD700',
        isConveyor: true,
        transportSpeed: 2, // Ressources par seconde
        capacity: 10, // Peut contenir plusieurs ressources en transit
        autoOutput: true, // Transfère automatiquement aux bâtiments adjacents
    },
    STORAGE: {
        name: 'Stockage',
        description: 'Stocke les ressources',
        color: '#708090',
        storageCapacity: 100,
    },
};

// ============================================================================
// Classes principales
// ============================================================================

class Camera {
    constructor(width, height) {
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.zoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 2;
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.clamp();
    }

    setZoom(zoom) {
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    }

    clamp() {
        const maxX = CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE - this.width / this.zoom;
        const maxY = CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE - this.height / this.zoom;
        this.x = Math.max(0, Math.min(maxX, this.x));
        this.y = Math.max(0, Math.min(maxY, this.y));
    }

    screenToWorld(screenX, screenY) {
        return {
            x: (screenX / this.zoom) + this.x,
            y: (screenY / this.zoom) + this.y,
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x) * this.zoom,
            y: (worldY - this.y) * this.zoom,
        };
    }
}

class Building {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = BUILDING_TYPES[type];
        this.inventory = {};
        this.productionProgress = 0;
        this.currentRecipe = null;
        this.direction = 0; // 0: right, 1: down, 2: left, 3: up
        this.animationTime = 0; // Pour les animations
        this.particleEffects = []; // Effets de particules

        // Initialiser l'inventaire
        Object.keys(RESOURCES).forEach(res => {
            this.inventory[res] = 0;
        });

        // Sélectionner la première recette par défaut si c'est une machine
        if (this.config.recipes && this.config.recipes.length > 0) {
            this.currentRecipe = this.config.recipes[0];
        }
    }

    canProduce() {
        if (this.config.produces) {
            return true; // Les extracteurs peuvent toujours produire
        }

        if (this.currentRecipe) {
            // Vérifier si on a assez de ressources pour la recette
            for (let [resource, amount] of Object.entries(this.currentRecipe.input)) {
                if (this.inventory[resource] < amount) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    produce(deltaTime, game) {
        // Mise à jour de l'animation
        this.animationTime += deltaTime;

        if (this.config.produces) {
            // Production simple (extracteur)
            this.productionProgress += deltaTime;
            if (this.productionProgress >= 1) {
                this.inventory[this.config.produces] += this.config.productionRate;
                this.productionProgress = 0;
                this.createParticleEffect(this.config.produces);

                // Suivre les statistiques
                if (game) {
                    game.productionStats[this.config.produces].produced += this.config.productionRate;
                }
            }
        } else if (this.currentRecipe && this.canProduce()) {
            // Production avec recette
            this.productionProgress += deltaTime;
            if (this.productionProgress >= this.currentRecipe.time) {
                // Consommer les ressources d'entrée
                for (let [resource, amount] of Object.entries(this.currentRecipe.input)) {
                    this.inventory[resource] -= amount;

                    // Suivre les statistiques
                    if (game) {
                        game.productionStats[resource].consumed += amount;
                    }
                }
                // Produire les ressources de sortie
                for (let [resource, amount] of Object.entries(this.currentRecipe.output)) {
                    this.inventory[resource] += amount;
                    this.createParticleEffect(resource);

                    // Suivre les statistiques
                    if (game) {
                        game.productionStats[resource].produced += amount;
                    }
                }
                this.productionProgress = 0;
            }
        }
    }

    createParticleEffect(resourceType) {
        // Ajouter plusieurs particules avec variation
        const particleCount = 2 + Math.floor(Math.random() * 2); // 2-3 particules
        for (let i = 0; i < particleCount; i++) {
            this.particleEffects.push({
                resourceType: resourceType,
                time: 0,
                maxTime: 0.6 + Math.random() * 0.4, // 0.6-1.0 secondes
                offsetX: (Math.random() - 0.5) * 30, // Variation horizontale
                offsetY: (Math.random() - 0.5) * 10, // Variation verticale initiale
                velocity: 30 + Math.random() * 20, // Vitesse de montée
                rotation: Math.random() * Math.PI * 2, // Rotation aléatoire
            });
        }
    }

    updateParticles(deltaTime) {
        // Mettre à jour et nettoyer les particules
        this.particleEffects = this.particleEffects.filter(particle => {
            particle.time += deltaTime;
            return particle.time < particle.maxTime;
        });
    }

    // Transférer des ressources vers un autre bâtiment
    transferTo(targetBuilding, resourceType, amount) {
        if (this.inventory[resourceType] >= amount) {
            this.inventory[resourceType] -= amount;
            targetBuilding.inventory[resourceType] += amount;
            return true;
        }
        return false;
    }

    // Déterminer quelles ressources ce bâtiment a besoin
    getNeededResources() {
        const needed = {};

        if (this.currentRecipe) {
            for (let [resource, amount] of Object.entries(this.currentRecipe.input)) {
                const current = this.inventory[resource] || 0;
                const shortage = Math.max(0, amount * 3 - current); // Stocker 3x la recette
                if (shortage > 0) {
                    needed[resource] = shortage;
                }
            }
        }

        return needed;
    }

    // Déterminer quelles ressources ce bâtiment peut fournir
    getAvailableResources() {
        const available = {};

        // Pour les convoyeurs : toutes les ressources
        if (this.config.isConveyor) {
            for (let [resource, amount] of Object.entries(this.inventory)) {
                if (amount > 0) {
                    available[resource] = amount;
                }
            }
            return available;
        }

        // Pour les extracteurs et les machines avec autoOutput
        if (this.config.produces || this.config.autoOutput) {
            for (let [resource, amount] of Object.entries(this.inventory)) {
                if (amount > 0) {
                    // Si c'est un produit de ce bâtiment
                    if (this.config.produces === resource) {
                        available[resource] = amount;
                    } else if (this.currentRecipe) {
                        // Si c'est un produit de sortie de la recette
                        if (this.currentRecipe.output[resource]) {
                            available[resource] = amount;
                        }
                    }
                }
            }
        }

        return available;
    }

    // Obtenir le total de ressources dans l'inventaire
    getTotalInventory() {
        let total = 0;
        for (let amount of Object.values(this.inventory)) {
            total += amount;
        }
        return total;
    }

    // Pour les convoyeurs : peut-on accepter plus de ressources ?
    canAcceptResources() {
        if (!this.config.isConveyor) {
            return true; // Les autres bâtiments acceptent toujours
        }
        return this.getTotalInventory() < (this.config.capacity || 10);
    }

    getInfo() {
        let info = `<div><strong>${this.config.name}</strong></div>`;
        info += `<div style="margin-top: 10px;"><em>${this.config.description}</em></div>`;

        info += '<div style="margin-top: 15px;"><strong>Inventaire:</strong></div>';
        info += '<div style="max-height: 200px; overflow-y: auto;">';
        for (let [resource, amount] of Object.entries(this.inventory)) {
            if (amount > 0) {
                info += `<div>${RESOURCES[resource].icon} ${RESOURCES[resource].name}: ${Math.floor(amount)}</div>`;
            }
        }
        info += '</div>';

        if (this.currentRecipe) {
            info += '<div style="margin-top: 10px;"><strong>Recette active:</strong></div>';
            info += '<div>';
            for (let [resource, amount] of Object.entries(this.currentRecipe.input)) {
                info += `${RESOURCES[resource].icon} ${amount} `;
            }
            info += '→ ';
            for (let [resource, amount] of Object.entries(this.currentRecipe.output)) {
                info += `${RESOURCES[resource].icon} ${amount} `;
            }
            info += '</div>';

            const progress = Math.floor((this.productionProgress / this.currentRecipe.time) * 100);
            info += `<div style="margin-top: 5px;">Progression: ${progress}%</div>`;
            info += `<div style="background: #333; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 5px;">
                        <div style="background: #ffa500; height: 100%; width: ${progress}%;"></div>
                     </div>`;
        }

        return info;
    }
}

class ResourceNode {
    constructor(x, y, resourceType) {
        this.x = x;
        this.y = y;
        this.resourceType = resourceType;
    }
}

class GameMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = Array(height).fill(null).map(() => Array(width).fill(null));
        this.resourceNodes = [];
        this.generateResourceNodes();
    }

    generateResourceNodes() {
        // Générer des nœuds de ressources aléatoires
        const nodeTypes = [
            { type: 'IRON_ORE', count: 15 },
            { type: 'COPPER_ORE', count: 12 },
            { type: 'COAL', count: 10 },
            { type: 'STONE', count: 8 },
        ];

        nodeTypes.forEach(({ type, count }) => {
            for (let i = 0; i < count; i++) {
                const x = Math.floor(Math.random() * this.width);
                const y = Math.floor(Math.random() * this.height);
                this.resourceNodes.push(new ResourceNode(x, y, type));
            }
        });
    }

    canPlaceBuilding(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.grid[y][x] === null;
    }

    placeBuilding(x, y, buildingType) {
        if (this.canPlaceBuilding(x, y)) {
            const building = new Building(x, y, buildingType);
            this.grid[y][x] = building;
            return building;
        }
        return null;
    }

    removeBuilding(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = null;
        }
    }

    getBuilding(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.grid[y][x];
        }
        return null;
    }

    getResourceNode(x, y) {
        return this.resourceNodes.find(node => node.x === x && node.y === y);
    }

    getAllBuildings() {
        const buildings = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x]) {
                    buildings.push(this.grid[y][x]);
                }
            }
        }
        return buildings;
    }

    // Obtenir les bâtiments adjacents
    getAdjacentBuildings(x, y) {
        const adjacent = [];
        const directions = [
            { dx: 1, dy: 0 },   // droite
            { dx: -1, dy: 0 },  // gauche
            { dx: 0, dy: 1 },   // bas
            { dx: 0, dy: -1 },  // haut
        ];

        directions.forEach(({ dx, dy }) => {
            const building = this.getBuilding(x + dx, y + dy);
            if (building) {
                adjacent.push(building);
            }
        });

        return adjacent;
    }

    // Transférer automatiquement les ressources entre bâtiments
    autoTransferResources() {
        const buildings = this.getAllBuildings();

        buildings.forEach(sourceBuilding => {
            const available = sourceBuilding.getAvailableResources();

            // Pour chaque ressource disponible
            for (let [resourceType, amount] of Object.entries(available)) {
                if (amount > 0) {
                    // Trouver les bâtiments adjacents qui ont besoin de cette ressource
                    const adjacentBuildings = this.getAdjacentBuildings(
                        sourceBuilding.x,
                        sourceBuilding.y
                    );

                    adjacentBuildings.forEach(targetBuilding => {
                        // Vérifier si le bâtiment cible peut accepter des ressources
                        if (!targetBuilding.canAcceptResources()) {
                            return; // Skip si le convoyeur est plein
                        }

                        const needed = targetBuilding.getNeededResources();

                        // Si c'est un convoyeur, il accepte toutes les ressources
                        const canAccept = targetBuilding.config.isConveyor ||
                                         (needed[resourceType] && needed[resourceType] > 0);

                        if (canAccept) {
                            // Transférer des ressources
                            const maxTransfer = targetBuilding.config.isConveyor
                                ? targetBuilding.config.capacity - targetBuilding.getTotalInventory()
                                : needed[resourceType] || CONFIG.TRANSFER_RATE;

                            const transferAmount = Math.min(
                                CONFIG.TRANSFER_RATE,
                                amount,
                                maxTransfer
                            );

                            if (transferAmount > 0) {
                                sourceBuilding.transferTo(
                                    targetBuilding,
                                    resourceType,
                                    transferAmount
                                );
                            }
                        }
                    });
                }
            }
        });
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.map = new GameMap(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);

        this.selectedBuildingType = null;
        this.selectedBuilding = null;
        this.isPaused = false;
        this.lastTime = performance.now();
        this.lastProductionUpdate = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.buildingRotation = 0; // Rotation du bâtiment à placer (0-3)
        this.rapidBuildMode = false; // Mode construction rapide (Shift)
        this.showMinimap = true; // Afficher la minimap
        this.showStats = false; // Afficher les statistiques de production
        this.productionStats = {}; // Statistiques de production
        this.statsResetTime = performance.now(); // Pour calculer les taux de production

        this.resources = {};
        Object.keys(RESOURCES).forEach(res => {
            this.resources[res] = 0;
            this.productionStats[res] = { produced: 0, consumed: 0, producedPerMin: 0, consumedPerMin: 0 };
        });

        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.gridPos = { x: 0, y: 0 };

        this.init();
        this.gameLoop();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.camera) {
            this.camera.width = this.canvas.width;
            this.camera.height = this.canvas.height;
        }
    }

    init() {
        // Événements
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('contextmenu', (e) => this.onRightClick(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));

        // UI
        this.initUI();

        // Position initiale de la caméra
        this.camera.x = CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE / 2 - this.canvas.width / 2;
        this.camera.y = CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE / 2 - this.canvas.height / 2;
    }

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;

        // Raccourcis clavier
        const buildingTypes = Object.keys(BUILDING_TYPES);

        // Touches 1-9 pour sélectionner rapidement les bâtiments
        if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            if (index < buildingTypes.length) {
                const type = buildingTypes[index];
                const buttons = document.querySelectorAll('.building-btn');
                if (buttons[index]) {
                    this.selectBuildingType(type, buttons[index]);
                }
            }
            e.preventDefault();
        }

        // R pour rotation ou reset stats
        if (e.key.toLowerCase() === 'r') {
            if (this.showStats) {
                // Réinitialiser les statistiques
                Object.keys(RESOURCES).forEach(res => {
                    this.productionStats[res] = { produced: 0, consumed: 0, producedPerMin: 0, consumedPerMin: 0 };
                });
                this.statsResetTime = performance.now();
                e.preventDefault();
            } else if (this.selectedBuildingType) {
                // Rotation du bâtiment
                this.buildingRotation = (this.buildingRotation + 1) % 4;
                e.preventDefault();
            }
        }

        // Delete ou X pour supprimer le bâtiment sous la souris
        if ((e.key === 'Delete' || e.key.toLowerCase() === 'x') && !this.selectedBuildingType) {
            const building = this.map.getBuilding(this.gridPos.x, this.gridPos.y);
            if (building) {
                this.map.removeBuilding(this.gridPos.x, this.gridPos.y);
            }
            e.preventDefault();
        }

        // Escape pour désélectionner
        if (e.key === 'Escape') {
            this.selectedBuildingType = null;
            this.selectedBuilding = null;
            this.hideInfo();
            document.querySelectorAll('.building-btn').forEach(btn => btn.classList.remove('selected'));
            e.preventDefault();
        }

        // M pour toggle minimap
        if (e.key.toLowerCase() === 'm') {
            this.showMinimap = !this.showMinimap;
            e.preventDefault();
        }

        // P pour toggle statistiques de production
        if (e.key.toLowerCase() === 'p') {
            this.showStats = !this.showStats;
            e.preventDefault();
        }

        // Shift pour mode construction rapide
        if (e.key === 'Shift') {
            this.rapidBuildMode = true;
        }
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;

        if (e.key === 'Shift') {
            this.rapidBuildMode = false;
        }
    }

    initUI() {
        const buildingButtonsContainer = document.getElementById('building-buttons');

        Object.entries(BUILDING_TYPES).forEach(([type, config], index) => {
            const btn = document.createElement('button');
            btn.className = 'building-btn';
            btn.innerHTML = `
                <div class="building-btn-title">${index + 1}. ${config.name}</div>
                <div class="building-btn-desc">${config.description}</div>
            `;
            btn.addEventListener('click', () => this.selectBuildingType(type, btn));
            buildingButtonsContainer.appendChild(btn);
        });

        document.getElementById('delete-building').addEventListener('click', () => {
            if (this.selectedBuilding) {
                this.map.removeBuilding(this.selectedBuilding.x, this.selectedBuilding.y);
                this.selectedBuilding = null;
                this.hideInfo();
            }
        });

        document.getElementById('save-game').addEventListener('click', () => this.saveGame());
        document.getElementById('load-game').addEventListener('click', () => this.loadGame());
        document.getElementById('reset-game').addEventListener('click', () => this.resetGame());
    }

    selectBuildingType(type, btn) {
        // Désélectionner tous les boutons
        document.querySelectorAll('.building-btn').forEach(b => b.classList.remove('selected'));

        if (this.selectedBuildingType === type) {
            this.selectedBuildingType = null;
        } else {
            this.selectedBuildingType = type;
            btn.classList.add('selected');
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;

        const worldPos = this.camera.screenToWorld(this.mousePos.x, this.mousePos.y);
        this.gridPos.x = Math.floor(worldPos.x / CONFIG.TILE_SIZE);
        this.gridPos.y = Math.floor(worldPos.y / CONFIG.TILE_SIZE);

        // Afficher le tooltip pour le bâtiment sous la souris
        this.updateTooltip(e.clientX, e.clientY);
    }

    updateTooltip(mouseX, mouseY) {
        const tooltip = document.getElementById('building-tooltip');
        const building = this.map.getBuilding(this.gridPos.x, this.gridPos.y);

        if (building) {
            // Générer le contenu du tooltip
            let content = `<div class="tooltip-title">${building.config.name}</div>`;
            content += `<div>${building.config.description}</div>`;

            // Inventaire
            const hasResources = Object.values(building.inventory).some(amount => amount > 0);
            if (hasResources) {
                content += '<div class="tooltip-section">';
                content += '<div class="tooltip-section-title">Inventaire :</div>';
                content += '<div class="tooltip-resources">';
                for (let [resource, amount] of Object.entries(building.inventory)) {
                    if (amount > 0) {
                        content += `<div class="tooltip-resource">${RESOURCES[resource].icon} ${Math.floor(amount)}</div>`;
                    }
                }
                content += '</div>';

                // Pour les convoyeurs, montrer la capacité
                if (building.config.isConveyor) {
                    const total = building.getTotalInventory();
                    const capacity = building.config.capacity || 10;
                    content += `<div style="margin-top: 5px; font-size: 0.85em;">Capacité: ${Math.floor(total)}/${capacity}</div>`;
                }
                content += '</div>';
            }

            // Progression de production
            if (building.currentRecipe && building.productionProgress > 0) {
                const progress = Math.floor((building.productionProgress / building.currentRecipe.time) * 100);
                content += '<div class="tooltip-section">';
                content += '<div class="tooltip-section-title">Production :</div>';
                content += '<div class="tooltip-progress">';
                content += `<div style="font-size: 0.85em;">`;
                for (let [resource, amount] of Object.entries(building.currentRecipe.input)) {
                    content += `${RESOURCES[resource].icon}${amount} `;
                }
                content += '→ ';
                for (let [resource, amount] of Object.entries(building.currentRecipe.output)) {
                    content += `${RESOURCES[resource].icon}${amount} `;
                }
                content += `</div>`;
                content += `<div class="tooltip-progress-bar">`;
                content += `<div class="tooltip-progress-fill" style="width: ${progress}%;"></div>`;
                content += `</div>`;
                content += `<div style="font-size: 0.85em; margin-top: 2px;">${progress}%</div>`;
                content += '</div></div>';
            }

            tooltip.innerHTML = content;
            tooltip.classList.remove('hidden');

            // Positionner le tooltip
            const tooltipWidth = 250;
            const tooltipHeight = 200;
            let left = mouseX + 15;
            let top = mouseY + 15;

            // Ajuster si le tooltip dépasse de l'écran
            if (left + tooltipWidth > window.innerWidth) {
                left = mouseX - tooltipWidth - 15;
            }
            if (top + tooltipHeight > window.innerHeight) {
                top = mouseY - tooltipHeight - 15;
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        } else {
            tooltip.classList.add('hidden');
        }
    }

    onClick(e) {
        if (this.selectedBuildingType) {
            const building = this.map.placeBuilding(this.gridPos.x, this.gridPos.y, this.selectedBuildingType);
            if (building) {
                building.direction = this.buildingRotation;
                console.log(`Building placed: ${building.config.name} at (${this.gridPos.x}, ${this.gridPos.y})`);

                // En mode construction rapide (Shift), garder le bâtiment sélectionné
                if (!this.rapidBuildMode) {
                    // Désélectionner après placement (comportement normal)
                    // this.selectedBuildingType = null;
                    // document.querySelectorAll('.building-btn').forEach(btn => btn.classList.remove('selected'));
                }
            }
        } else {
            // Clic sur un bâtiment pour changer de recette
            const building = this.map.getBuilding(this.gridPos.x, this.gridPos.y);
            if (building && building.config.recipes && building.config.recipes.length > 1) {
                this.cycleRecipe(building);
            }
        }
    }

    cycleRecipe(building) {
        const recipes = building.config.recipes;
        const currentIndex = recipes.indexOf(building.currentRecipe);
        const nextIndex = (currentIndex + 1) % recipes.length;
        building.currentRecipe = recipes[nextIndex];
        building.productionProgress = 0; // Réinitialiser la progression

        // Notification visuelle
        console.log(`Recipe changed for ${building.config.name}`);
    }

    onRightClick(e) {
        e.preventDefault();
        const building = this.map.getBuilding(this.gridPos.x, this.gridPos.y);
        if (building) {
            this.selectedBuilding = building;
            this.showInfo(building);
        } else {
            this.selectedBuilding = null;
            this.hideInfo();
        }
    }

    onWheel(e) {
        e.preventDefault();
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        this.camera.setZoom(this.camera.zoom + zoomDelta);
    }

    showInfo(building) {
        const infoPanel = document.getElementById('building-info');
        const infoTitle = document.getElementById('info-title');
        const infoContent = document.getElementById('info-content');

        infoTitle.textContent = building.config.name;
        infoContent.innerHTML = building.getInfo();
        infoPanel.classList.remove('hidden');
    }

    hideInfo() {
        document.getElementById('building-info').classList.add('hidden');
    }

    updateCamera(deltaTime) {
        const speed = 500 * deltaTime;

        if (this.keys['w'] || this.keys['arrowup']) this.camera.move(0, -speed);
        if (this.keys['s'] || this.keys['arrowdown']) this.camera.move(0, speed);
        if (this.keys['a'] || this.keys['arrowleft']) this.camera.move(-speed, 0);
        if (this.keys['d'] || this.keys['arrowright']) this.camera.move(speed, 0);

        if (this.keys[' ']) {
            this.isPaused = !this.isPaused;
            delete this.keys[' '];
        }
    }

    updateProduction(deltaTime) {
        this.lastProductionUpdate += deltaTime * 1000;

        // Mettre à jour les particules de tous les bâtiments
        const buildings = this.map.getAllBuildings();
        buildings.forEach(building => {
            building.updateParticles(deltaTime);
        });

        if (this.lastProductionUpdate >= CONFIG.PRODUCTION_TICK_RATE) {
            buildings.forEach(building => {
                building.produce(1, this); // 1 tick de production avec référence au jeu
            });

            // Transférer automatiquement les ressources entre bâtiments adjacents
            this.map.autoTransferResources();

            this.lastProductionUpdate = 0;
        }

        // Mettre à jour l'affichage si un bâtiment est sélectionné
        if (this.selectedBuilding) {
            const infoContent = document.getElementById('info-content');
            if (infoContent) {
                infoContent.innerHTML = this.selectedBuilding.getInfo();
            }
        }
    }

    update(deltaTime) {
        if (!this.isPaused) {
            this.updateCamera(deltaTime);
            this.updateProduction(deltaTime);
        } else {
            // Même en pause, permettre le mouvement de la caméra
            this.updateCamera(deltaTime);
        }
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.save();
        ctx.scale(this.camera.zoom, this.camera.zoom);
        ctx.translate(-this.camera.x, -this.camera.y);

        // Dessiner la grille
        this.drawGrid();

        // Dessiner les nœuds de ressources
        this.drawResourceNodes();

        // Dessiner les bâtiments
        this.drawBuildings();

        // Dessiner l'aperçu du bâtiment à placer
        if (this.selectedBuildingType) {
            this.drawBuildingPreview();
        }

        // Dessiner la sélection
        if (this.selectedBuilding) {
            this.drawSelection(this.selectedBuilding.x, this.selectedBuilding.y);
        }

        ctx.restore();

        // Dessiner l'UI
        this.drawUI();

        // Dessiner la minimap (en dehors de la transformation de caméra)
        if (this.showMinimap) {
            this.drawMinimap();
        }

        // Dessiner les statistiques de production
        if (this.showStats) {
            this.drawProductionStats();
        }
    }

    updateProductionRates() {
        // Calculer les taux de production par minute
        const now = performance.now();
        const elapsedSeconds = (now - this.statsResetTime) / 1000;
        const elapsedMinutes = elapsedSeconds / 60;

        if (elapsedMinutes > 0) {
            Object.keys(RESOURCES).forEach(res => {
                this.productionStats[res].producedPerMin = this.productionStats[res].produced / elapsedMinutes;
                this.productionStats[res].consumedPerMin = this.productionStats[res].consumed / elapsedMinutes;
            });
        }
    }

    drawProductionStats() {
        this.updateProductionRates();

        const ctx = this.ctx;
        const panelWidth = 350;
        const panelHeight = 500;
        const panelX = 20;
        const panelY = 100;

        // Fond du panneau
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 2;
        ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

        // Titre
        ctx.fillStyle = '#ffa500';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('📊 Statistiques de Production (P)', panelX + 10, panelY + 25);

        // Temps écoulé
        const elapsedSeconds = (performance.now() - this.statsResetTime) / 1000;
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = Math.floor(elapsedSeconds % 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(`Temps: ${minutes}m ${seconds}s`, panelX + 10, panelY + 45);

        // Bouton reset
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(panelX + panelWidth - 80, panelY + 30, 70, 25);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Reset (R)', panelX + panelWidth - 45, panelY + 47);

        // Tableau des ressources
        let y = panelY + 70;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('Ressource', panelX + 10, y);
        ctx.fillText('Prod/min', panelX + 180, y);
        ctx.fillText('Cons/min', panelX + 260, y);

        y += 5;
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(panelX + 10, y);
        ctx.lineTo(panelX + panelWidth - 10, y);
        ctx.stroke();

        y += 10;

        // Afficher seulement les ressources avec activité
        Object.entries(RESOURCES).forEach(([resKey, resConfig]) => {
            const stats = this.productionStats[resKey];
            const hasActivity = stats.producedPerMin > 0.01 || stats.consumedPerMin > 0.01;

            if (hasActivity) {
                // Icône et nom
                ctx.font = '14px Arial';
                ctx.fillStyle = resConfig.color;
                ctx.fillText(resConfig.icon, panelX + 10, y + 12);

                ctx.font = '12px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.fillText(resConfig.name.substring(0, 18), panelX + 35, y + 12);

                // Production
                ctx.fillStyle = '#4ade80';
                ctx.textAlign = 'right';
                ctx.fillText(`+${stats.producedPerMin.toFixed(1)}`, panelX + 240, y + 12);

                // Consommation
                ctx.fillStyle = '#f87171';
                ctx.textAlign = 'right';
                ctx.fillText(`-${stats.consumedPerMin.toFixed(1)}`, panelX + 320, y + 12);

                // Net
                const net = stats.producedPerMin - stats.consumedPerMin;
                ctx.fillStyle = net >= 0 ? '#4ade80' : '#f87171';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'left';
                const netText = net >= 0 ? `+${net.toFixed(1)}` : `${net.toFixed(1)}`;
                ctx.fillText(`(${netText})`, panelX + 35, y + 24);

                y += 35;

                // Limiter l'affichage pour ne pas déborder
                if (y > panelY + panelHeight - 20) {
                    return;
                }
            }
        });

        // Instructions
        ctx.fillStyle = '#888888';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('R: Réinitialiser | P: Fermer', panelX + 10, panelY + panelHeight - 10);
    }

    drawMinimap() {
        const ctx = this.ctx;
        const minimapSize = 200;
        const minimapX = this.canvas.width - minimapSize - 20;
        const minimapY = this.canvas.height - minimapSize - 20;

        // Fond de la minimap
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);

        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 2;
        ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

        // Échelle de la minimap
        const scaleX = minimapSize / CONFIG.GRID_WIDTH;
        const scaleY = minimapSize / CONFIG.GRID_HEIGHT;

        // Dessiner les nœuds de ressources
        this.map.resourceNodes.forEach(node => {
            const x = minimapX + node.x * scaleX;
            const y = minimapY + node.y * scaleY;
            ctx.fillStyle = RESOURCES[node.resourceType].color;
            ctx.fillRect(x, y, 2, 2);
        });

        // Dessiner les bâtiments
        this.map.getAllBuildings().forEach(building => {
            const x = minimapX + building.x * scaleX;
            const y = minimapY + building.y * scaleY;
            ctx.fillStyle = building.config.color;
            ctx.fillRect(x, y, 2, 2);
        });

        // Dessiner la vue de la caméra
        const viewX = minimapX + (this.camera.x / CONFIG.TILE_SIZE) * scaleX;
        const viewY = minimapY + (this.camera.y / CONFIG.TILE_SIZE) * scaleY;
        const viewW = (this.canvas.width / this.camera.zoom / CONFIG.TILE_SIZE) * scaleX;
        const viewH = (this.canvas.height / this.camera.zoom / CONFIG.TILE_SIZE) * scaleY;

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(viewX, viewY, viewW, viewH);

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Carte (M)', minimapX + 5, minimapY + 15);
    }

    drawGrid() {
        const ctx = this.ctx;
        const startX = Math.floor(this.camera.x / CONFIG.TILE_SIZE);
        const startY = Math.floor(this.camera.y / CONFIG.TILE_SIZE);
        const endX = Math.ceil((this.camera.x + this.canvas.width / this.camera.zoom) / CONFIG.TILE_SIZE);
        const endY = Math.ceil((this.camera.y + this.canvas.height / this.camera.zoom) / CONFIG.TILE_SIZE);

        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;

        for (let x = startX; x <= endX; x++) {
            ctx.beginPath();
            ctx.moveTo(x * CONFIG.TILE_SIZE, startY * CONFIG.TILE_SIZE);
            ctx.lineTo(x * CONFIG.TILE_SIZE, endY * CONFIG.TILE_SIZE);
            ctx.stroke();
        }

        for (let y = startY; y <= endY; y++) {
            ctx.beginPath();
            ctx.moveTo(startX * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE);
            ctx.lineTo(endX * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE);
            ctx.stroke();
        }
    }

    drawResourceNodes() {
        const ctx = this.ctx;
        this.map.resourceNodes.forEach(node => {
            const x = node.x * CONFIG.TILE_SIZE;
            const y = node.y * CONFIG.TILE_SIZE;
            const resource = RESOURCES[node.resourceType];

            ctx.fillStyle = resource.color;
            ctx.beginPath();
            ctx.arc(x + CONFIG.TILE_SIZE / 2, y + CONFIG.TILE_SIZE / 2, CONFIG.TILE_SIZE / 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Icône
            ctx.fillStyle = '#fff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(resource.icon, x + CONFIG.TILE_SIZE / 2, y + CONFIG.TILE_SIZE / 2);
        });
    }

    drawBuildings() {
        const ctx = this.ctx;
        const buildings = this.map.getAllBuildings();

        buildings.forEach(building => {
            const x = building.x * CONFIG.TILE_SIZE;
            const y = building.y * CONFIG.TILE_SIZE;

            // Ombre
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(x + 4, y + 4, CONFIG.TILE_SIZE - 8, CONFIG.TILE_SIZE - 8);

            // Animation de pulsation pour les bâtiments actifs
            let scale = 1;
            const isProducing = building.canProduce() && building.productionProgress > 0;
            if (isProducing) {
                scale = 1 + Math.sin(building.animationTime * 4) * 0.02;

                // Effet de lueur pour les bâtiments actifs
                const glowSize = CONFIG.TILE_SIZE * 1.2;
                const glowAlpha = 0.1 + Math.sin(building.animationTime * 3) * 0.05;
                const gradient = ctx.createRadialGradient(
                    x + CONFIG.TILE_SIZE / 2, y + CONFIG.TILE_SIZE / 2, CONFIG.TILE_SIZE / 3,
                    x + CONFIG.TILE_SIZE / 2, y + CONFIG.TILE_SIZE / 2, glowSize / 2
                );
                gradient.addColorStop(0, `${building.config.color}${Math.floor(glowAlpha * 255).toString(16).padStart(2, '0')}`);
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = gradient;
                ctx.fillRect(x - glowSize / 4, y - glowSize / 4, glowSize, glowSize);
            }

            const centerX = x + CONFIG.TILE_SIZE / 2;
            const centerY = y + CONFIG.TILE_SIZE / 2;
            const size = (CONFIG.TILE_SIZE - 4) * scale;

            ctx.save();
            ctx.translate(centerX, centerY);

            // Rendu spécial pour les convoyeurs
            if (building.config.isConveyor) {
                // Fond du convoyeur avec bandes
                ctx.fillStyle = '#3a3a3a';
                ctx.fillRect(-size / 2, -size / 2, size, size);

                // Bandes du convoyeur (animation)
                const bandOffset = (building.animationTime * 20) % 20;
                ctx.strokeStyle = '#555';
                ctx.lineWidth = 3;
                for (let i = -size; i < size; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(-size / 2, i + bandOffset);
                    ctx.lineTo(size / 2, i + bandOffset);
                    ctx.stroke();
                }

                // Bordure dorée pour les convoyeurs
                ctx.strokeStyle = building.config.color;
                ctx.lineWidth = 3;
                ctx.strokeRect(-size / 2, -size / 2, size, size);

                // Afficher les ressources transportées avec animation
                const total = building.getTotalInventory();
                if (total > 0) {
                    // Afficher les icônes de ressources en mouvement
                    let iconIndex = 0;
                    for (let [resource, amount] of Object.entries(building.inventory)) {
                        if (amount > 0) {
                            const resourcesShown = Math.min(3, Math.ceil(amount)); // Max 3 icônes
                            for (let i = 0; i < resourcesShown; i++) {
                                const offset = (building.animationTime * 15 + i * 15) % 45 - 22.5;
                                const iconX = -size / 4 + offset;
                                const iconY = -size / 4 + (iconIndex * 8);

                                ctx.font = '10px Arial';
                                ctx.textAlign = 'center';
                                ctx.textBaseline = 'middle';
                                ctx.fillStyle = RESOURCES[resource].color;
                                ctx.fillText(RESOURCES[resource].icon, iconX, iconY);
                            }
                            iconIndex++;
                        }
                    }

                    // Compteur total
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.font = 'bold 10px Arial';
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(`${Math.floor(total)}`, size / 2 - 2, size / 2 - 2);
                }
            } else {
                // Bâtiment normal
                ctx.fillStyle = building.config.color;
                ctx.fillRect(-size / 2, -size / 2, size, size);

                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(-size / 2, -size / 2, size, size);
            }

            ctx.restore();

            // Indicateur de production active
            if (building.canProduce() && building.productionProgress > 0) {
                const indicatorSize = 8;
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(x + CONFIG.TILE_SIZE - 10, y + 10, indicatorSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Particules améliorées
            building.particleEffects.forEach(particle => {
                const progress = particle.time / particle.maxTime;
                const particleX = centerX + particle.offsetX;
                const particleY = y + particle.offsetY - (progress * particle.velocity);
                const particleAlpha = 1 - progress;
                const scale = 1 + progress * 0.3; // Agrandir légèrement

                ctx.save();
                ctx.globalAlpha = particleAlpha;
                ctx.translate(particleX, particleY);
                ctx.rotate(particle.rotation + progress * Math.PI * 2);
                ctx.scale(scale, scale);

                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // Ombre portée pour meilleur contraste
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillText(RESOURCES[particle.resourceType].icon, 1, 1);

                // Icône colorée
                ctx.fillStyle = RESOURCES[particle.resourceType].color;
                ctx.fillText(RESOURCES[particle.resourceType].icon, 0, 0);

                ctx.restore();
            });

            // Barre de progression
            if (building.currentRecipe) {
                const progress = building.productionProgress / building.currentRecipe.time;
                const barWidth = CONFIG.TILE_SIZE - 12;
                const barHeight = 6;
                const barX = x + 6;
                const barY = y + CONFIG.TILE_SIZE - 10;

                ctx.fillStyle = '#333';
                ctx.fillRect(barX, barY, barWidth, barHeight);

                ctx.fillStyle = '#ffa500';
                ctx.fillRect(barX, barY, barWidth * progress, barHeight);

                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barWidth, barHeight);
            }

            // Indicateurs de connexion (flèches vers bâtiments adjacents)
            const adjacentBuildings = this.map.getAdjacentBuildings(building.x, building.y);
            const available = building.getAvailableResources();

            if (Object.keys(available).length > 0 && adjacentBuildings.length > 0) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.3 + Math.sin(building.animationTime * 3) * 0.2;

                adjacentBuildings.forEach(adjacent => {
                    const needed = adjacent.getNeededResources();
                    const hasMatch = Object.keys(available).some(res => needed[res]);

                    if (hasMatch) {
                        const adjX = adjacent.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
                        const adjY = adjacent.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;

                        ctx.beginPath();
                        ctx.moveTo(centerX, centerY);
                        ctx.lineTo(adjX, adjY);
                        ctx.stroke();
                    }
                });

                ctx.globalAlpha = 1;
            }
        });
    }

    drawBuildingPreview() {
        const ctx = this.ctx;
        const x = this.gridPos.x * CONFIG.TILE_SIZE;
        const y = this.gridPos.y * CONFIG.TILE_SIZE;
        const canPlace = this.map.canPlaceBuilding(this.gridPos.x, this.gridPos.y);

        ctx.fillStyle = canPlace ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);

        const config = BUILDING_TYPES[this.selectedBuildingType];
        ctx.fillStyle = config.color;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = canPlace ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);

        // Indicateur de rotation (petite flèche)
        if (this.buildingRotation > 0) {
            const centerX = x + CONFIG.TILE_SIZE / 2;
            const centerY = y + CONFIG.TILE_SIZE / 2;
            const arrowSize = 15;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate((this.buildingRotation * Math.PI) / 2);

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(0, -arrowSize);
            ctx.lineTo(arrowSize / 2, 0);
            ctx.lineTo(-arrowSize / 2, 0);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        // Indicateur mode construction rapide
        if (this.rapidBuildMode) {
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SHIFT', x + CONFIG.TILE_SIZE / 2, y - 10);
        }
    }

    drawSelection(gridX, gridY) {
        const ctx = this.ctx;
        const x = gridX * CONFIG.TILE_SIZE;
        const y = gridY * CONFIG.TILE_SIZE;

        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
    }

    drawUI() {
        // Mettre à jour les ressources
        const resourcesDisplay = document.getElementById('resources-display');
        resourcesDisplay.innerHTML = '';

        // Calculer les ressources totales
        const totalResources = { ...this.resources };
        this.map.getAllBuildings().forEach(building => {
            Object.entries(building.inventory).forEach(([resource, amount]) => {
                totalResources[resource] += amount;
            });
        });

        // Afficher seulement les ressources non nulles
        Object.entries(totalResources).forEach(([resource, amount]) => {
            if (amount > 0) {
                const resConfig = RESOURCES[resource];
                const div = document.createElement('div');
                div.className = 'resource-item';
                div.innerHTML = `
                    <div class="resource-icon" style="background: ${resConfig.color};">${resConfig.icon}</div>
                    <span>${resConfig.name}: ${Math.floor(amount)}</span>
                `;
                resourcesDisplay.appendChild(div);
            }
        });

        // FPS
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsUpdate >= CONFIG.FPS_UPDATE_INTERVAL) {
            this.fps = Math.round(this.frameCount / ((now - this.lastFpsUpdate) / 1000));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            document.getElementById('fps').textContent = `FPS: ${this.fps}`;
        }
    }

    saveGame() {
        const saveData = {
            version: '1.0',
            timestamp: Date.now(),
            camera: {
                x: this.camera.x,
                y: this.camera.y,
                zoom: this.camera.zoom,
            },
            resources: this.resources,
            resourceNodes: this.map.resourceNodes.map(node => ({
                x: node.x,
                y: node.y,
                resourceType: node.resourceType,
            })),
            buildings: [],
        };

        // Sauvegarder tous les bâtiments
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                const building = this.map.grid[y][x];
                if (building) {
                    saveData.buildings.push({
                        x: building.x,
                        y: building.y,
                        type: building.type,
                        inventory: building.inventory,
                        productionProgress: building.productionProgress,
                        direction: building.direction,
                    });
                }
            }
        }

        // Sauvegarder dans localStorage
        try {
            localStorage.setItem('usine_save', JSON.stringify(saveData));
            alert('✅ Partie sauvegardée avec succès !');
            console.log('Game saved:', saveData);
        } catch (e) {
            alert('❌ Erreur lors de la sauvegarde : ' + e.message);
            console.error('Save error:', e);
        }
    }

    loadGame() {
        try {
            const saveDataStr = localStorage.getItem('usine_save');
            if (!saveDataStr) {
                alert('❌ Aucune sauvegarde trouvée !');
                return;
            }

            const saveData = JSON.parse(saveDataStr);

            // Vérifier la version
            if (!saveData.version) {
                alert('❌ Format de sauvegarde incompatible !');
                return;
            }

            // Confirmer le chargement
            const date = new Date(saveData.timestamp);
            if (!confirm(`Charger la partie du ${date.toLocaleString()} ?\n\nCela écrasera votre partie actuelle !`)) {
                return;
            }

            // Réinitialiser la carte
            this.map = new GameMap(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);
            this.map.resourceNodes = saveData.resourceNodes.map(node =>
                new ResourceNode(node.x, node.y, node.resourceType)
            );

            // Restaurer les ressources
            this.resources = saveData.resources;

            // Restaurer les bâtiments
            saveData.buildings.forEach(buildingData => {
                const building = new Building(buildingData.x, buildingData.y, buildingData.type);
                building.inventory = buildingData.inventory;
                building.productionProgress = buildingData.productionProgress || 0;
                building.direction = buildingData.direction || 0;
                this.map.grid[buildingData.y][buildingData.x] = building;
            });

            // Restaurer la caméra
            this.camera.x = saveData.camera.x;
            this.camera.y = saveData.camera.y;
            this.camera.zoom = saveData.camera.zoom;

            // Réinitialiser la sélection
            this.selectedBuilding = null;
            this.selectedBuildingType = null;
            this.hideInfo();

            // Désélectionner tous les boutons
            document.querySelectorAll('.building-btn').forEach(btn => btn.classList.remove('selected'));

            alert('✅ Partie chargée avec succès !');
            console.log('Game loaded:', saveData);
        } catch (e) {
            alert('❌ Erreur lors du chargement : ' + e.message);
            console.error('Load error:', e);
        }
    }

    resetGame() {
        if (!confirm('⚠️ Voulez-vous vraiment recommencer une nouvelle partie ?\n\nToutes les données non sauvegardées seront perdues !')) {
            return;
        }

        // Réinitialiser complètement le jeu
        this.map = new GameMap(CONFIG.GRID_WIDTH, CONFIG.GRID_HEIGHT);

        Object.keys(RESOURCES).forEach(res => {
            this.resources[res] = 0;
        });

        this.selectedBuildingType = null;
        this.selectedBuilding = null;
        this.isPaused = false;
        this.hideInfo();

        // Repositionner la caméra au centre
        this.camera.x = CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE / 2 - this.canvas.width / 2;
        this.camera.y = CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE / 2 - this.canvas.height / 2;
        this.camera.zoom = 1;

        // Désélectionner tous les boutons
        document.querySelectorAll('.building-btn').forEach(btn => btn.classList.remove('selected'));

        alert('✅ Nouvelle partie commencée !');
        console.log('Game reset');
    }

    gameLoop() {
        const now = performance.now();
        const deltaTime = (now - this.lastTime) / 1000; // en secondes
        this.lastTime = now;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Démarrer le jeu
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
