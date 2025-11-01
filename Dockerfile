# ---------------------------------------------------------
# Étape 1 : Construction de l’application React
# ---------------------------------------------------------
FROM node:22.20.0 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer npm à la version souhaitée
RUN npm install -g npm@10.9.3

# Installer les dépendances du projet
RUN npm install

# Copier le reste du code source
COPY . .

# Construire le projet (sortie dans /app/dist)
RUN npm run build

# ---------------------------------------------------------
# Étape 2 : Serveur léger pour servir les fichiers (Nginx)
# ---------------------------------------------------------
FROM nginx:alpine

# Copier les fichiers de build vers le dossier Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
