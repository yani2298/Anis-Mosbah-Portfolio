#!/bin/bash

# Script de release automatique pour Anis Mosbah Portfolio
# Usage: ./scripts/release.sh <version>

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Script de release automatique${NC}"
echo -e "${BLUE}=================================${NC}"

# Vérifier les arguments
if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <version>${NC}"
    echo -e "${YELLOW}   Exemple: $0 1.0.1${NC}"
    exit 1
fi

VERSION=$1
TAG="v$VERSION"

echo -e "${YELLOW}📋 Version à publier: $VERSION${NC}"

# Vérifier que nous sommes sur la branche main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${RED}❌ Vous devez être sur la branche main/master pour faire une release${NC}"
    exit 1
fi

# Vérifier que le working directory est propre
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Le working directory n'est pas propre. Commitez vos changements d'abord.${NC}"
    git status
    exit 1
fi

# Mettre à jour la version dans package.json
echo -e "${YELLOW}📝 Mise à jour de la version dans package.json...${NC}"
npm version $VERSION --no-git-tag-version

# Committer les changements de version
echo -e "${YELLOW}💾 Commit des changements de version...${NC}"
git add package.json package-lock.json
git commit -m "chore: bump version to $VERSION"

# Créer le tag
echo -e "${YELLOW}🏷️  Création du tag $TAG...${NC}"
git tag -a $TAG -m "Release $VERSION

🎉 Nouvelle version du Portfolio Pro d'Anis Mosbah

✨ Fonctionnalités:
- Interface moderne et responsive
- Système d'authentification Pro
- Mises à jour automatiques
- Performances optimisées

📱 Compatible macOS 10.14+"

# Pousser les changements et le tag
echo -e "${YELLOW}⬆️  Push vers GitHub...${NC}"
git push origin $CURRENT_BRANCH
git push origin $TAG

echo -e "${GREEN}✅ Tag $TAG créé et poussé avec succès!${NC}"
echo -e "${BLUE}🔄 GitHub Actions va maintenant construire et publier la release automatiquement.${NC}"
echo -e "${BLUE}📦 Suivez le progrès sur: https://github.com/yani2298/Anis-Mosbah-Portfolio/actions${NC}"

# Attendre un peu puis vérifier le statut du workflow
echo -e "${YELLOW}⏳ Attente du démarrage du workflow...${NC}"
sleep 10

echo -e "${GREEN}🎉 Release $VERSION lancée avec succès!${NC}"
echo -e "${BLUE}📱 L'application se mettra à jour automatiquement pour les utilisateurs existants.${NC}" 