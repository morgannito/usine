#!/bin/bash

# Script de démarrage facile pour le jeu Usine
# Usage: ./start-docker.sh

set -e

echo "🏭 Démarrage du jeu USINE - Factory Builder Game"
echo "================================================"
echo ""

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé !"
    echo "📥 Installez Docker depuis: https://docs.docker.com/get-docker/"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé !"
    echo "📥 Installez Docker Compose depuis: https://docs.docker.com/compose/install/"
    exit 1
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down 2>/dev/null || true

# Construire l'image
echo "🔨 Construction de l'image Docker..."
docker-compose build

# Démarrer le conteneur
echo "🚀 Démarrage du conteneur..."
docker-compose up -d

# Attendre que le service soit prêt
echo "⏳ Attente du démarrage du serveur..."
sleep 3

# Vérifier le statut
if docker ps | grep -q usine-game; then
    echo ""
    echo "✅ Le jeu est maintenant disponible !"
    echo "🌐 Ouvrez votre navigateur à l'adresse: http://localhost:8080"
    echo ""
    echo "📋 Commandes utiles:"
    echo "   - Voir les logs:        docker-compose logs -f"
    echo "   - Arrêter le jeu:       docker-compose down"
    echo "   - Redémarrer le jeu:    docker-compose restart"
    echo "   - Voir le statut:       docker-compose ps"
    echo ""
else
    echo "❌ Erreur lors du démarrage du conteneur"
    echo "📋 Consultez les logs avec: docker-compose logs"
    exit 1
fi
