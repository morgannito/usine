# 🏭 USINE - Factory Builder Game

Un jeu de construction d'usine inspiré de **Factorio** et **Satisfactory**, jouable directement dans votre navigateur web !

![Factory Builder](https://img.shields.io/badge/Type-Factory%20Builder-orange)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow)
![HTML5 Canvas](https://img.shields.io/badge/Tech-HTML5%20Canvas-blue)

## 🎮 Caractéristiques

- **Construction d'usines automatisées** : Placez des bâtiments et créez des chaînes de production
- **Système de ressources** : Minerai de fer, cuivre, charbon et ressources transformées
- **Machines de production** : Extracteurs, fourneaux, assembleurs, convoyeurs et stockage
- **Système de crafting** : Transformez les ressources brutes en composants complexes
- **Carte procédurale** : Nœuds de ressources générés aléatoirement
- **Interface intuitive** : Contrôles simples et UI claire
- **Performance optimisée** : Rendu efficace avec Canvas 2D

## 🚀 Comment jouer

### Installation

Aucune installation requise ! Ouvrez simplement `index.html` dans votre navigateur web moderne.

```bash
# Clonez le dépôt (si applicable)
git clone <url-du-repo>
cd usine

# Ouvrez index.html dans votre navigateur
# Sur Linux/Mac :
open index.html
# ou
xdg-open index.html

# Sur Windows :
start index.html
```

Ou utilisez un serveur local :

```bash
# Avec Python 3
python3 -m http.server 8000

# Avec Node.js
npx http-server

# Puis ouvrez http://localhost:8000 dans votre navigateur
```

### 🎯 Contrôles

| Touche | Action |
|--------|--------|
| **WASD** ou **Flèches** | Déplacer la caméra |
| **Molette** | Zoom / Dézoom |
| **Clic gauche** | Placer un bâtiment sélectionné |
| **Clic droit** | Sélectionner et inspecter un bâtiment |
| **Espace** | Pause / Play |

### 📦 Types de ressources

#### Ressources brutes
- **Minerai de Fer** ⛏️ - Extrait des nœuds de fer
- **Minerai de Cuivre** ⛏️ - Extrait des nœuds de cuivre
- **Charbon** ⛏️ - Extrait des nœuds de charbon

#### Ressources transformées
- **Plaque de Fer** ▭ - Minerai de fer fondu
- **Plaque de Cuivre** ▭ - Minerai de cuivre fondu
- **Engrenage** ⚙️ - Fabriqué avec 2 plaques de fer
- **Circuit** ⚡ - Fabriqué avec 2 plaques de cuivre + 1 plaque de fer

### 🏗️ Types de bâtiments

#### Extracteurs
- **Extracteur de Fer** - Produit du minerai de fer (doit être placé sur un nœud de fer)
- **Extracteur de Cuivre** - Produit du minerai de cuivre (doit être placé sur un nœud de cuivre)
- **Extracteur de Charbon** - Produit du charbon (doit être placé sur un nœud de charbon)

#### Machines de transformation
- **Fourneau** - Transforme les minerais en plaques
  - Minerai de Fer → Plaque de Fer (1:1)
  - Minerai de Cuivre → Plaque de Cuivre (1:1)

- **Assembleur** - Fabrique des composants complexes
  - 2 Plaques de Fer → 1 Engrenage
  - 2 Plaques de Cuivre + 1 Plaque de Fer → 1 Circuit

#### Logistique
- **Convoyeur** - Transporte les ressources entre bâtiments (à venir)
- **Stockage** - Stocke jusqu'à 100 unités de ressources

## 🎓 Guide de démarrage

### Étape 1 : Trouver des ressources
Les nœuds de ressources sont représentés par des cercles colorés sur la carte :
- 🟤 Marron = Fer
- 🟠 Orange = Cuivre
- ⚫ Gris foncé = Charbon

### Étape 2 : Placer des extracteurs
1. Cliquez sur un type d'extracteur dans le menu de gauche
2. Trouvez un nœud de ressource correspondant
3. Cliquez sur le nœud pour placer l'extracteur

### Étape 3 : Construire des machines
1. Placez un fourneau près de vos extracteurs
2. L'extracteur produira automatiquement du minerai
3. Transférez manuellement le minerai au fourneau (pour l'instant)
4. Le fourneau transformera le minerai en plaques

### Étape 4 : Automatiser la production
1. Placez des assembleurs pour créer des composants
2. Créez des chaînes de production complètes
3. Optimisez vos usines pour une production maximale !

## 🔧 Architecture technique

### Structure du projet

```
usine/
├── index.html      # Structure HTML et canvas
├── styles.css      # Interface utilisateur et styles
├── game.js         # Moteur de jeu complet
└── README.md       # Ce fichier
```

### Composants principaux

- **Camera** : Gestion de la vue, zoom et déplacement
- **GameMap** : Grille de jeu et gestion des bâtiments
- **Building** : Système de production et inventaire
- **ResourceNode** : Nœuds de ressources sur la carte
- **Game** : Boucle principale et rendu

### Configuration

Vous pouvez modifier les paramètres dans `game.js` :

```javascript
const CONFIG = {
    TILE_SIZE: 64,           // Taille d'une case en pixels
    GRID_WIDTH: 100,         // Largeur de la carte
    GRID_HEIGHT: 100,        // Hauteur de la carte
    PRODUCTION_TICK_RATE: 1000, // Vitesse de production (ms)
};
```

## 🚧 Fonctionnalités à venir

- [ ] Système de convoyeurs fonctionnel avec transport automatique
- [ ] Plus de types de bâtiments (raffineries, centrales électriques)
- [ ] Système d'électricité
- [ ] Système de recherche/technologie
- [ ] Sauvegarde et chargement de parties
- [ ] Statistiques de production
- [ ] Mode construction rapide
- [ ] Optimisation des performances pour grandes usines
- [ ] Effets visuels et animations
- [ ] Son et musique

## 🎨 Personnalisation

Vous pouvez facilement ajouter de nouvelles ressources et bâtiments en modifiant les objets `RESOURCES` et `BUILDING_TYPES` dans `game.js`.

### Exemple : Ajouter une nouvelle ressource

```javascript
const RESOURCES = {
    // ... ressources existantes
    STEEL: { name: 'Acier', color: '#A8B8C8', icon: '🔩' },
};
```

### Exemple : Ajouter un nouveau bâtiment

```javascript
const BUILDING_TYPES = {
    // ... bâtiments existants
    STEEL_MILL: {
        name: 'Aciérie',
        description: 'Produit de l\'acier',
        color: '#606060',
        recipes: [
            { input: { IRON_PLATE: 2, COAL: 1 }, output: { STEEL: 1 }, time: 3 },
        ],
    },
};
```

## 🐛 Dépannage

**Le jeu ne se charge pas ?**
- Vérifiez que JavaScript est activé dans votre navigateur
- Ouvrez la console développeur (F12) pour voir les erreurs
- Assurez-vous d'utiliser un navigateur moderne (Chrome, Firefox, Edge)

**Performance lente ?**
- Réduisez le zoom
- Limitez le nombre de bâtiments actifs
- Fermez les autres onglets du navigateur

**Les bâtiments ne produisent pas ?**
- Vérifiez que le jeu n'est pas en pause (Espace)
- Assurez-vous que les extracteurs sont placés sur des nœuds de ressources
- Clic droit sur un bâtiment pour voir son inventaire et sa progression

## 📝 Licence

Ce projet est un prototype éducatif. Vous êtes libre de l'utiliser, le modifier et le distribuer.

## 🙏 Remerciements

Inspiré par les excellents jeux :
- **Factorio** par Wube Software
- **Satisfactory** par Coffee Stain Studios

---

**Bon jeu ! Construisez l'usine de vos rêves ! 🏭**
