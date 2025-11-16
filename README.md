# 🏭 USINE - Factory Builder Game

Un jeu de construction d'usine inspiré de **Factorio** et **Satisfactory**, jouable directement dans votre navigateur web !

![Factory Builder](https://img.shields.io/badge/Type-Factory%20Builder-orange)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow)
![HTML5 Canvas](https://img.shields.io/badge/Tech-HTML5%20Canvas-blue)

## 🎮 Caractéristiques

- **Construction d'usines automatisées** : Placez des bâtiments et créez des chaînes de production
- **Transport automatique** : Les ressources sont transférées automatiquement entre bâtiments adjacents !
- **12 types de ressources** : Minerais, plaques, acier, circuits, câbles, béton et plus
- **9 types de bâtiments** : Extracteurs, fourneaux, assembleurs avancés, convoyeurs et stockage
- **Système de crafting** : Transformez les ressources brutes en composants complexes
- **Animations visuelles** : Particules, pulsations, indicateurs de connexion
- **Carte procédurale** : Nœuds de ressources générés aléatoirement
- **Sauvegarde locale** : Système complet de sauvegarde/chargement
- **Interface intuitive** : Contrôles simples et UI claire
- **Performance optimisée** : Rendu efficace avec Canvas 2D

## 🚀 Comment jouer

### 🐳 Installation avec Docker (Recommandé)

La méthode la plus simple pour déployer le jeu !

```bash
# Clonez le dépôt
git clone <url-du-repo>
cd usine

# Démarrage rapide avec le script
./start-docker.sh

# Ou manuellement avec Docker Compose
docker-compose up -d

# Le jeu est maintenant disponible sur http://localhost:8080
```

**Commandes Docker utiles :**
```bash
# Voir les logs
docker-compose logs -f

# Arrêter le jeu
docker-compose down

# Redémarrer le jeu
docker-compose restart

# Voir le statut
docker-compose ps

# Reconstruire l'image
docker-compose build --no-cache
```

**Avantages Docker :**
- ✅ Déploiement en une commande
- ✅ Pas de dépendances à installer
- ✅ Serveur nginx optimisé
- ✅ Compression gzip activée
- ✅ Configuration de sécurité
- ✅ Healthcheck automatique
- ✅ Facile à déployer sur un serveur

### 📁 Installation locale (Sans Docker)

Aucune installation requise ! Ouvrez simplement `index.html` dans votre navigateur web moderne.

```bash
# Clonez le dépôt
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
- **Pierre** 🪨 - Extrait des carrières

#### Ressources transformées
- **Plaque de Fer** ▭ - Minerai de fer fondu (1 minerai → 1 plaque)
- **Plaque de Cuivre** ▭ - Minerai de cuivre fondu (1 minerai → 1 plaque)
- **Acier** ⬛ - Produit du haut fourneau (5 plaques de fer + 2 charbons → 1 acier)
- **Engrenage** ⚙️ - Fabriqué avec 2 plaques de fer
- **Câble** 〰️ - Fabriqué avec 1 plaque de cuivre (produit 2 câbles)
- **Circuit** ⚡ - Fabriqué avec 2 plaques de cuivre + 1 plaque de fer
- **Circuit Avancé** 💎 - Fabriqué avec 2 circuits + 2 plaques de cuivre + 4 câbles
- **Béton** ▪️ - Fabriqué avec 5 pierres + 1 minerai de fer (produit 10 bétons)

### 🏗️ Types de bâtiments

#### Extracteurs
- **Extracteur de Fer** - Produit du minerai de fer (doit être placé sur un nœud de fer)
- **Extracteur de Cuivre** - Produit du minerai de cuivre (doit être placé sur un nœud de cuivre)
- **Extracteur de Charbon** - Produit du charbon (doit être placé sur un nœud de charbon)
- **Carrière de Pierre** - Extrait de la pierre (doit être placé sur un nœud de pierre)

#### Machines de transformation
- **Fourneau** - Transforme les minerais en plaques
  - Minerai de Fer → Plaque de Fer (1:1)
  - Minerai de Cuivre → Plaque de Cuivre (1:1)
  - ✨ **Transfert automatique activé**

- **Haut Fourneau** - Produit de l'acier
  - 5 Plaques de Fer + 2 Charbons → 1 Acier
  - ✨ **Transfert automatique activé**

- **Assembleur** - Fabrique des composants
  - 2 Plaques de Fer → 1 Engrenage
  - 1 Plaque de Cuivre → 2 Câbles
  - 2 Plaques de Cuivre + 1 Plaque de Fer → 1 Circuit
  - ✨ **Transfert automatique activé**

- **Assembleur Avancé** - Fabrique des composants complexes
  - 2 Circuits + 2 Plaques de Cuivre + 4 Câbles → 1 Circuit Avancé
  - 5 Pierres + 1 Minerai de Fer → 10 Bétons
  - ✨ **Transfert automatique activé**

#### Logistique
- **Convoyeur** - Transporte les ressources entre bâtiments
- **Stockage** - Stocke jusqu'à 100 unités de ressources

## 🎓 Guide de démarrage

### Étape 1 : Trouver des ressources
Les nœuds de ressources sont représentés par des cercles colorés sur la carte :
- 🟤 Marron = Fer
- 🟠 Orange = Cuivre
- ⚫ Gris foncé = Charbon
- ⚪ Gris = Pierre

### Étape 2 : Placer des extracteurs
1. Cliquez sur un type d'extracteur dans le menu de gauche
2. Trouvez un nœud de ressource correspondant
3. Cliquez sur le nœud pour placer l'extracteur

### Étape 3 : Construire des machines
1. Placez un fourneau **adjacent** (côte à côte) à votre extracteur
2. L'extracteur produira automatiquement du minerai
3. **Les ressources sont transférées automatiquement** vers le fourneau adjacent !
4. Le fourneau transformera le minerai en plaques

### Étape 4 : Automatiser la production
1. Placez des assembleurs **adjacents** aux fourneaux pour recevoir les plaques
2. Les ressources circulent automatiquement entre bâtiments adjacents
3. Créez des chaînes de production complètes en alignant vos bâtiments
4. Observez les **indicateurs de connexion dorés** qui montrent le flux de ressources !

### 💡 Astuces
- **Indicateur vert** : Un point vert en haut à droite d'un bâtiment = production active
- **Lignes dorées** : Montrent les transferts automatiques de ressources entre bâtiments
- **Particules** : Des icônes de ressources s'envolent lors de la production
- **Pulsation** : Les bâtiments actifs pulsent légèrement
- **Clic droit** : Inspectez un bâtiment pour voir son inventaire et sa progression

## 🔧 Architecture technique

### Structure du projet

```
usine/
├── index.html          # Structure HTML et canvas
├── styles.css          # Interface utilisateur et styles
├── game.js             # Moteur de jeu complet
├── README.md           # Documentation
├── Dockerfile          # Image Docker
├── docker-compose.yml  # Configuration Docker Compose
├── nginx.conf          # Configuration Nginx
├── .dockerignore       # Fichiers exclus de l'image
└── start-docker.sh     # Script de démarrage rapide
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

## 🐳 Déploiement Docker

### Architecture Docker

Le jeu utilise une image **nginx:alpine** ultra-légère (~10 MB) pour servir les fichiers statiques.

**Stack technique :**
- **Image de base** : nginx:alpine (serveur web léger)
- **Port exposé** : 80 (mappé sur 8080 de l'hôte)
- **Healthcheck** : Vérifie la disponibilité toutes les 30s
- **Network** : Bridge isolé pour la sécurité
- **Restart policy** : unless-stopped (redémarrage automatique)

### Fichiers Docker

#### Dockerfile
- Copie les fichiers HTML/CSS/JS dans `/usr/share/nginx/html/`
- Configure nginx avec compression gzip
- Headers de sécurité (X-Frame-Options, X-XSS-Protection, etc.)
- Healthcheck intégré pour monitoring

#### docker-compose.yml
- Définit le service `usine-game`
- Mapping de port : 8080:80
- Configuration réseau isolée
- Healthcheck automatique

#### nginx.conf
- Compression gzip pour améliorer les performances
- Cache des ressources statiques (1 heure)
- Headers de sécurité
- Logs d'accès et d'erreurs

### Déploiement sur serveur

**Sur un serveur Linux :**
```bash
# 1. Cloner le dépôt
git clone <url-du-repo>
cd usine

# 2. Démarrer avec Docker Compose
docker-compose up -d

# 3. Vérifier que le conteneur tourne
docker-compose ps

# 4. Le jeu est accessible sur http://votre-ip:8080
```

**Avec un reverse proxy (nginx/traefik) :**
```yaml
# Exemple de configuration avec Traefik
services:
  usine-game:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.usine.rule=Host(`usine.votredomaine.com`)"
      - "traefik.http.services.usine.loadbalancer.server.port=80"
```

**Personnaliser le port :**
```bash
# Modifier docker-compose.yml
ports:
  - "80:80"  # Port 80 au lieu de 8080
```

### Monitoring et logs

```bash
# Voir les logs en temps réel
docker-compose logs -f usine-game

# Vérifier le healthcheck
docker inspect usine-game | grep -A 10 Health

# Statistiques d'utilisation
docker stats usine-game
```

## ✅ Nouvelles fonctionnalités (v2.0)

- ✅ **Transport automatique** : Les ressources circulent automatiquement entre bâtiments adjacents
- ✅ **Nouvelles ressources** : Acier, câbles, circuits avancés, béton, pierre
- ✅ **Nouveaux bâtiments** : Haut fourneau, assembleur avancé, carrière de pierre
- ✅ **Animations visuelles** : Particules, pulsations, indicateurs de connexion
- ✅ **Sauvegarde/Chargement** : Système complet de gestion de parties
- ✅ **Effets visuels** : Indicateurs de production, flux de ressources animés

## 🚧 Fonctionnalités à venir

- [ ] Système de convoyeurs longue distance
- [ ] Plus de bâtiments (raffineries, centrales électriques)
- [ ] Système d'électricité avec gestion de l'énergie
- [ ] Système de recherche/technologie
- [ ] Statistiques de production détaillées
- [ ] Mode construction rapide
- [ ] Optimisation pour très grandes usines (1000+ bâtiments)
- [ ] Effets sonores et musique
- [ ] Mode tutoriel interactif
- [ ] Défis et objectifs de production

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
