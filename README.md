# 🚤 Régates Organizer V2

Application d'organisation de régates pour l'AMATH KAKIKOUKA et les clubs de voile français.

## 🚀 Installation rapide

### Prérequis
- **Node.js** version 18 ou supérieure : [télécharger ici](https://nodejs.org/)

### Étapes

1. **Ouvrez un terminal** dans ce dossier
   - Windows : Clic droit → "Ouvrir dans le terminal" ou "PowerShell"
   - Mac : Clic droit → "Nouveau terminal au dossier"

2. **Installez les dépendances** :
   ```bash
   npm install
   ```

3. **Lancez l'application** :
   ```bash
   npm run dev
   ```

4. **Ouvrez votre navigateur** à l'adresse affichée (généralement http://localhost:5173)

## ✨ Fonctionnalités

- 📅 **Tableau de bord** avec compte à rebours et KPIs
- 📋 **Rétroplanning** avec 22 tâches pré-configurées
- 📄 **Gestion administrative** (DDTM, mairie, FFVoile...)
- 👥 **Gestion des bénévoles** avec synchronisation Google Forms
- 📧 **Modèles de mails** pré-remplis
- 📊 **Documents** (numéros utiles, émargement, parcours)
- ⚓ **Support RIR** pour régates 5C/5B

## 🔗 Liens utiles intégrés

- Formulaire DDTM
- Carte SHOM (zone de course)
- Documents FFVoile 2025
- Formulaires Google (inscriptions, bénévoles)

## 💾 Sauvegarde

Les données sont automatiquement sauvegardées dans votre navigateur (localStorage).
Pour exporter vos données, utilisez la fonction d'export dans les paramètres.

## 📞 Contact

AMATH KAKIKOUKA - Plougonvelin
kakik.amath@gmail.com

---

## 🔧 Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Crée la version de production |
| `npm run preview` | Prévisualise la version de production |

## 📦 Déploiement

Pour déployer sur Vercel :
```bash
npm run build
npx vercel
```

Pour déployer sur Netlify :
```bash
npm run build
# Glissez le dossier "dist" sur netlify.com
```
