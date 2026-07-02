# 🔗 Guide de synchronisation Google Forms → Régates Organizer

Ce guide explique comment configurer une synchronisation automatique entre votre formulaire Google d'inscription des bénévoles et l'application Régates Organizer.

## 📋 Prérequis

- Accès au formulaire Google Forms des bénévoles
- L'application Régates Organizer déployée (Vercel, Netlify, ou local)

---

## 🚀 Méthode 1 : Import manuel (recommandé pour commencer)

### Étapes :

1. **Ouvrez les réponses** de votre [formulaire bénévoles](https://docs.google.com/forms/d/187cx0pEQARNMDnMdrQj59z285LbnhQW9LYnsIgHRTTw/edit#responses)

2. **Créez une feuille de calcul** en cliquant sur l'icône Google Sheets (carré vert)

3. **Sélectionnez les lignes** de données (sans la ligne d'en-tête)

4. **Copiez** (Ctrl+C ou Cmd+C)

5. **Dans l'application**, allez dans l'onglet **Bénévoles** → cliquez sur **Importer**

6. **Collez** les données dans la zone de texte

7. Cliquez sur **Importer**

### Format attendu des colonnes :
```
Horodateur | Nom | Prénom | Email | Téléphone | Permis bateau | Panier repas
```

---

## 🤖 Méthode 2 : Synchronisation automatique avec Apps Script

Cette méthode envoie automatiquement chaque nouvelle inscription vers l'application.

### Étape 1 : Créer le script

1. Ouvrez votre Google Form en mode édition
2. Cliquez sur **⋮** (menu 3 points) → **Éditeur de scripts**
3. Supprimez le code existant et collez le code ci-dessous :

```javascript
/**
 * RÉGATES ORGANIZER - Script de synchronisation Google Forms
 * 
 * Ce script envoie automatiquement les nouvelles inscriptions de bénévoles
 * vers l'application Régates Organizer.
 * 
 * Configuration requise :
 * 1. Remplacez WEBHOOK_URL par l'URL de votre application
 * 2. Configurez le déclencheur sur "Lors de l'envoi du formulaire"
 */

// ⚠️ CONFIGURATION - Modifiez cette URL avec celle de votre application
const WEBHOOK_URL = 'https://votre-app.vercel.app/api/webhook/benevoles';

// Mapping des colonnes du formulaire (ajustez selon vos questions)
const COLUMN_MAPPING = {
  timestamp: 0,      // Horodateur
  nom: 1,            // Question "Nom"
  prenom: 2,         // Question "Prénom"  
  email: 3,          // Question "Email"
  telephone: 4,      // Question "Téléphone"
  permis_bateau: 5,  // Question "Avez-vous le permis bateau ?"
  panier_repas: 6,   // Question "Souhaitez-vous un panier repas ?"
  disponibilite: 7,  // Question "Vos disponibilités" (optionnel)
  commentaire: 8     // Question "Commentaires" (optionnel)
};

/**
 * Fonction principale déclenchée à chaque soumission du formulaire
 */
function onFormSubmit(e) {
  try {
    const responses = e.values;
    
    // Construire l'objet bénévole
    const benevole = {
      id: new Date().getTime(),
      timestamp: responses[COLUMN_MAPPING.timestamp] || new Date().toISOString(),
      name: responses[COLUMN_MAPPING.nom] || '',
      firstName: responses[COLUMN_MAPPING.prenom] || '',
      email: responses[COLUMN_MAPPING.email] || '',
      phone: responses[COLUMN_MAPPING.telephone] || '',
      permisB: parseBoolean(responses[COLUMN_MAPPING.permis_bateau]),
      panierRepas: parsePanierRepas(responses[COLUMN_MAPPING.panier_repas]),
      disponibilite: responses[COLUMN_MAPPING.disponibilite] || '',
      commentaire: responses[COLUMN_MAPPING.commentaire] || '',
      role: '', // À assigner manuellement dans l'app
      source: 'google_forms'
    };

    // Envoyer au webhook
    sendToWebhook(benevole);
    
    // Log pour debug
    console.log('Bénévole envoyé:', JSON.stringify(benevole));
    
  } catch (error) {
    console.error('Erreur onFormSubmit:', error);
    // Optionnel : envoyer une notification d'erreur
    sendErrorNotification(error);
  }
}

/**
 * Envoie les données au webhook de l'application
 */
function sendToWebhook(data) {
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      console.error('Erreur webhook:', responseCode, response.getContentText());
    }
    
    return response;
  } catch (error) {
    console.error('Erreur envoi webhook:', error);
    throw error;
  }
}

/**
 * Parse une réponse oui/non en booléen
 */
function parseBoolean(value) {
  if (!value) return false;
  const normalized = value.toString().toLowerCase().trim();
  return normalized === 'oui' || normalized === 'yes' || normalized === 'true' || normalized === '1';
}

/**
 * Parse la réponse panier repas
 */
function parsePanierRepas(value) {
  if (!value) return 'oui';
  const normalized = value.toString().toLowerCase().trim();
  if (normalized.includes('non')) return 'non';
  if (normalized.includes('végé') || normalized.includes('veggie') || normalized.includes('végétarien')) return 'veggie';
  return 'oui';
}

/**
 * Envoie une notification d'erreur par email (optionnel)
 */
function sendErrorNotification(error) {
  const email = Session.getActiveUser().getEmail();
  if (email) {
    MailApp.sendEmail({
      to: email,
      subject: '[Régates Organizer] Erreur de synchronisation',
      body: `Une erreur s'est produite lors de la synchronisation d'un bénévole:\n\n${error.toString()}`
    });
  }
}

/**
 * Fonction de test - À exécuter manuellement pour vérifier la configuration
 */
function testWebhook() {
  const testData = {
    id: new Date().getTime(),
    timestamp: new Date().toISOString(),
    name: 'Test',
    firstName: 'Bénévole',
    email: 'test@example.com',
    phone: '0600000000',
    permisB: true,
    panierRepas: 'oui',
    role: '',
    source: 'google_forms_test'
  };
  
  console.log('Envoi test vers:', WEBHOOK_URL);
  const response = sendToWebhook(testData);
  console.log('Réponse:', response.getResponseCode(), response.getContentText());
}

/**
 * Synchronise tous les bénévoles existants (exécution unique)
 */
function syncAllExisting() {
  const form = FormApp.getActiveForm();
  const responses = form.getResponses();
  
  console.log(`Synchronisation de ${responses.length} réponses existantes...`);
  
  responses.forEach((response, index) => {
    const values = response.getItemResponses().map(item => item.getResponse());
    
    // Simuler l'événement onFormSubmit
    onFormSubmit({ values: [response.getTimestamp(), ...values] });
    
    // Pause pour éviter le rate limiting
    Utilities.sleep(500);
    
    console.log(`${index + 1}/${responses.length} synchronisé`);
  });
  
  console.log('Synchronisation terminée!');
}
```

### Étape 2 : Configurer le déclencheur

1. Dans l'éditeur de scripts, cliquez sur **⏰ Déclencheurs** (icône horloge à gauche)
2. Cliquez sur **+ Ajouter un déclencheur**
3. Configurez :
   - **Fonction** : `onFormSubmit`
   - **Source de l'événement** : `À partir du formulaire`
   - **Type d'événement** : `Lors de l'envoi du formulaire`
4. Cliquez sur **Enregistrer**
5. Autorisez le script quand demandé

### Étape 3 : Configurer le webhook dans l'application

Pour recevoir les données, vous devez ajouter un endpoint webhook à votre application.

---

## 🔧 Option A : Application avec Vercel (serverless)

Créez un fichier `api/webhook/benevoles.js` :

```javascript
// api/webhook/benevoles.js
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const benevole = req.body;
    
    // Validation basique
    if (!benevole.name) {
      return res.status(400).json({ error: 'Nom requis' });
    }
    
    // Ici vous pouvez :
    // 1. Sauvegarder dans une base de données (Supabase, Firebase, etc.)
    // 2. Envoyer une notification
    // 3. Mettre à jour un fichier JSON
    
    console.log('Nouveau bénévole reçu:', benevole);
    
    // Exemple avec Supabase :
    // const { data, error } = await supabase
    //   .from('benevoles')
    //   .insert([benevole]);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Bénévole enregistré',
      id: benevole.id 
    });
    
  } catch (error) {
    console.error('Erreur webhook:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
```

---

## 🔧 Option B : Stockage local avec localStorage (sans backend)

Si vous n'avez pas de backend, vous pouvez utiliser un service gratuit comme **JSONbin.io** ou **Supabase** pour stocker les données.

### Avec JSONbin.io (gratuit, simple) :

1. Créez un compte sur [jsonbin.io](https://jsonbin.io)
2. Créez un nouveau bin avec `[]` comme contenu initial
3. Copiez votre **Bin ID** et **API Key**
4. Modifiez le script Apps Script :

```javascript
const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/VOTRE_BIN_ID';
const JSONBIN_KEY = 'VOTRE_API_KEY';

function sendToWebhook(data) {
  // Récupérer les données existantes
  const getOptions = {
    method: 'GET',
    headers: { 'X-Master-Key': JSONBIN_KEY }
  };
  
  const currentData = JSON.parse(
    UrlFetchApp.fetch(JSONBIN_URL + '/latest', getOptions).getContentText()
  ).record || [];
  
  // Ajouter le nouveau bénévole
  currentData.push(data);
  
  // Sauvegarder
  const putOptions = {
    method: 'PUT',
    contentType: 'application/json',
    headers: { 'X-Master-Key': JSONBIN_KEY },
    payload: JSON.stringify(currentData)
  };
  
  return UrlFetchApp.fetch(JSONBIN_URL, putOptions);
}
```

---

## 🔧 Option C : Avec Supabase (recommandé pour production)

### 1. Créer la table dans Supabase

```sql
CREATE TABLE benevoles (
  id BIGINT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  first_name TEXT,
  email TEXT,
  phone TEXT,
  permis_bateau BOOLEAN DEFAULT FALSE,
  panier_repas TEXT DEFAULT 'oui',
  role TEXT,
  disponibilite TEXT,
  commentaire TEXT,
  source TEXT DEFAULT 'manual'
);

-- Permettre les insertions anonymes (pour le webhook)
ALTER TABLE benevoles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON benevoles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON benevoles
  FOR SELECT USING (true);
```

### 2. Script Apps Script pour Supabase

```javascript
const SUPABASE_URL = 'https://VOTRE_PROJET.supabase.co';
const SUPABASE_KEY = 'VOTRE_ANON_KEY';

function sendToWebhook(data) {
  const options = {
    method: 'POST',
    contentType: 'application/json',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Prefer': 'return=representation'
    },
    payload: JSON.stringify({
      id: data.id,
      name: data.name,
      first_name: data.firstName,
      email: data.email,
      phone: data.phone,
      permis_bateau: data.permisB,
      panier_repas: data.panierRepas,
      disponibilite: data.disponibilite,
      commentaire: data.commentaire,
      source: data.source
    }),
    muteHttpExceptions: true
  };
  
  return UrlFetchApp.fetch(SUPABASE_URL + '/rest/v1/benevoles', options);
}
```

---

## ✅ Test de la configuration

1. Dans l'éditeur Apps Script, exécutez la fonction `testWebhook()`
2. Vérifiez les logs (Affichage → Journaux)
3. Soumettez un formulaire test
4. Vérifiez que les données apparaissent dans votre base/application

---

## 🔄 Synchroniser les données existantes

Pour importer tous les bénévoles déjà inscrits :

1. Dans l'éditeur Apps Script, exécutez `syncAllExisting()`
2. Attendez que tous les enregistrements soient traités

---

## 🆘 Dépannage

| Problème | Solution |
|----------|----------|
| Erreur 403 | Vérifiez les autorisations du script |
| Erreur 404 | Vérifiez l'URL du webhook |
| Données manquantes | Vérifiez le mapping des colonnes |
| Script ne se déclenche pas | Vérifiez le déclencheur |

---

## 📧 Support

Pour toute question, consultez :
- [Documentation Apps Script](https://developers.google.com/apps-script)
- [Documentation Supabase](https://supabase.com/docs)

