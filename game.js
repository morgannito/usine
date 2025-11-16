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
};

// Types de ressources
const RESOURCES = {
    IRON_ORE: { name: 'Minerai de Fer', color: '#8B4513', icon: '⛏️' },
    COPPER_ORE: { name: 'Minerai de Cuivre', color: '#CD7F32', icon: '⛏️' },
    COAL: { name: 'Charbon', color: '#2F4F4F', icon: '⛏️' },
    IRON_PLATE: { name: 'Plaque de Fer', color: '#A9A9A9', icon: '▭' },
    COPPER_PLATE: { name: 'Plaque de Cuivre', color: '#B87333', icon: '▭' },
    GEAR: { name: 'Engrenage', color: '#C0C0C0', icon: '⚙️' },
    CIRCUIT: { name: 'Circuit', color: '#00FF00', icon: '⚡' },
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
    FURNACE: {
        name: 'Fourneau',
        description: 'Transforme les minerais en plaques',
        color: '#FF4500',
        recipes: [
            { input: { IRON_ORE: 1 }, output: { IRON_PLATE: 1 }, time: 1 },
            { input: { COPPER_ORE: 1 }, output: { COPPER_PLATE: 1 }, time: 1 },
        ],
    },
    ASSEMBLER: {
        name: 'Assembleur',
        description: 'Fabrique des composants complexes',
        color: '#4169E1',
        recipes: [
            { input: { IRON_PLATE: 2 }, output: { GEAR: 1 }, time: 1 },
            { input: { COPPER_PLATE: 2, IRON_PLATE: 1 }, output: { CIRCUIT: 1 }, time: 2 },
        ],
    },
    CONVEYOR: {
        name: 'Convoyeur',
        description: 'Transporte les ressources',
        color: '#FFD700',
        isConveyor: true,
        transportSpeed: 1,
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

    produce(deltaTime) {
        if (this.config.produces) {
            // Production simple (extracteur)
            this.productionProgress += deltaTime;
            if (this.productionProgress >= 1) {
                this.inventory[this.config.produces] += this.config.productionRate;
                this.productionProgress = 0;
            }
        } else if (this.currentRecipe && this.canProduce()) {
            // Production avec recette
            this.productionProgress += deltaTime;
            if (this.productionProgress >= this.currentRecipe.time) {
                // Consommer les ressources d'entrée
                for (let [resource, amount] of Object.entries(this.currentRecipe.input)) {
                    this.inventory[resource] -= amount;
                }
                // Produire les ressources de sortie
                for (let [resource, amount] of Object.entries(this.currentRecipe.output)) {
                    this.inventory[resource] += amount;
                }
                this.productionProgress = 0;
            }
        }
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

        this.resources = {};
        Object.keys(RESOURCES).forEach(res => {
            this.resources[res] = 0;
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
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);

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

    initUI() {
        const buildingButtonsContainer = document.getElementById('building-buttons');

        Object.entries(BUILDING_TYPES).forEach(([type, config]) => {
            const btn = document.createElement('button');
            btn.className = 'building-btn';
            btn.innerHTML = `
                <div class="building-btn-title">${config.name}</div>
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
    }

    onClick(e) {
        if (this.selectedBuildingType) {
            const building = this.map.placeBuilding(this.gridPos.x, this.gridPos.y, this.selectedBuildingType);
            if (building) {
                console.log(`Building placed: ${building.config.name} at (${this.gridPos.x}, ${this.gridPos.y})`);
            }
        }
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

        if (this.lastProductionUpdate >= CONFIG.PRODUCTION_TICK_RATE) {
            const buildings = this.map.getAllBuildings();
            buildings.forEach(building => {
                building.produce(1); // 1 tick de production
            });
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

            // Bâtiment
            ctx.fillStyle = building.config.color;
            ctx.fillRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, CONFIG.TILE_SIZE - 4, CONFIG.TILE_SIZE - 4);

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
