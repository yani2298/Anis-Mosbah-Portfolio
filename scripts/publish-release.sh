#!/bin/bash

# Script pour publier une release GitHub sans exposer le code source
# Usage: ./scripts/publish-release.sh <version>

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Publication de release GitHub${NC}"
echo -e "${BLUE}================================${NC}"

# Vérifier les arguments
if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <version>${NC}"
    echo -e "${YELLOW}   Exemple: $0 1.0.0${NC}"
    exit 1
fi

VERSION=$1
TAG="v$VERSION"

# Vérifier que GitHub CLI est installé
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) n'est pas installé${NC}"
    echo -e "${YELLOW}💡 Installez-le avec: brew install gh${NC}"
    exit 1
fi

# Vérifier l'authentification GitHub
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔐 Authentification GitHub requise...${NC}"
    gh auth login
fi

# Vérifier que les DMG existent
DMG_UNIVERSAL="./dist/Anis Mosbah Portfolio-${VERSION}-universal.dmg"
DMG_ARM64="./dist/Anis Mosbah Portfolio-${VERSION}-arm64.dmg"
DMG_X64="./dist/Anis Mosbah Portfolio-${VERSION}.dmg"

if [ ! -f "$DMG_UNIVERSAL" ]; then
    echo -e "${RED}❌ DMG universal non trouvé: $DMG_UNIVERSAL${NC}"
    exit 1
fi

echo -e "${GREEN}✅ DMG trouvés:${NC}"
echo -e "   📦 Universal: $(basename "$DMG_UNIVERSAL")"
[ -f "$DMG_ARM64" ] && echo -e "   📦 ARM64: $(basename "$DMG_ARM64")"
[ -f "$DMG_X64" ] && echo -e "   📦 Intel: $(basename "$DMG_X64")"

# Créer les notes de release
RELEASE_NOTES="🎉 **Anis Mosbah Portfolio Pro v${VERSION}**

📱 **Application macOS native** du portfolio professionnel d'Anis Mosbah - Creative Developer

## ✨ Fonctionnalités

- 🎨 **Interface moderne** et responsive
- 🔐 **Système Pro** avec authentification
- 🔄 **Mises à jour automatiques**
- 📊 **Analytics** en temps réel
- 📁 **Export** multi-format (PDF, JSON, HTML)
- 🎭 **Thèmes** personnalisés
- 🔔 **Notifications** système natives

## 📥 Installation

1. Téléchargez le fichier \`.dmg\` correspondant à votre Mac
2. Ouvrez le fichier DMG
3. Glissez l'application dans le dossier Applications
4. Lancez **Anis Mosbah Portfolio**

## 💻 Compatibilité

- **macOS 10.14+** (Mojave et plus récent)
- **Universal Binary** : Compatible Intel et Apple Silicon (M1/M2/M3)

## 🔐 Accès Pro

- **Raccourci** : \`Ctrl+Shift+P\`
- **Identifiants** : Contactez dev@anismosbah.art

## 🔄 Mises à jour

L'application vérifie automatiquement les mises à jour et vous notifie quand une nouvelle version est disponible.

---

**Développé avec ❤️ par Anis Mosbah**
- 🌐 [Portfolio](https://anismosbah.art)
- 📧 dev@anismosbah.art"

# Créer la release
echo -e "${YELLOW}📤 Création de la release $TAG...${NC}"

gh release create "$TAG" \
    --title "Portfolio Pro v$VERSION" \
    --notes "$RELEASE_NOTES" \
    --repo "yani2298/Anis-Mosbah-Portfolio" \
    "$DMG_UNIVERSAL#Anis Mosbah Portfolio v$VERSION (Universal - Recommandé)"

# Ajouter les autres DMG si ils existent
if [ -f "$DMG_ARM64" ]; then
    gh release upload "$TAG" "$DMG_ARM64" --repo "yani2298/Anis-Mosbah-Portfolio"
fi

if [ -f "$DMG_X64" ]; then
    gh release upload "$TAG" "$DMG_X64" --repo "yani2298/Anis-Mosbah-Portfolio"
fi

echo -e "${GREEN}🎉 Release $TAG publiée avec succès !${NC}"
echo -e "${BLUE}📱 Lien de téléchargement: https://github.com/yani2298/Anis-Mosbah-Portfolio/releases/tag/$TAG${NC}"
echo -e "${YELLOW}💡 Les utilisateurs existants recevront automatiquement la notification de mise à jour${NC}" 