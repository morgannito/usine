# Utiliser Nginx Alpine pour un conteneur léger
FROM nginx:alpine

# Métadonnées
LABEL maintainer="Usine Factory Game"
LABEL description="Jeu de construction d'usine type Factorio/Satisfactory"
LABEL version="2.0"

# Copier les fichiers du jeu dans le répertoire web de Nginx
COPY index.html /usr/share/nginx/html/
COPY game.js /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY README.md /usr/share/nginx/html/

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Nginx démarre automatiquement avec l'image de base
# La commande par défaut est déjà définie dans l'image nginx:alpine

# Healthcheck pour vérifier que le serveur fonctionne
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
