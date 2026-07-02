/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RÉGATES ORGANIZER - Script de synchronisation Google Forms
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Ce script synchronise automatiquement les inscriptions de bénévoles
 * depuis Google Forms vers l'application Régates Organizer.
 * 
 * INSTALLATION :
 * 1. Ouvrez votre Google Form → Menu ⋮ → Éditeur de scripts
 * 2. Supprimez tout le code existant
 * 3. Collez ce script complet
 * 4. Modifiez la CONFIGURATION ci-dessous
 * 5. Exécutez "initialSetup" une première fois
 * 6. Le déclencheur sera créé automatiquement
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║                              CONFIGURATION                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

const CONFIG = {
  // ─── Option 1: JSONbin.io (gratuit, simple, recommandé pour commencer) ───
  // Créez un compte sur jsonbin.io, créez un bin avec [] comme contenu
  USE_JSONBIN: true,
  JSONBIN_BIN_ID: 'VOTRE_BIN_ID_ICI',           // Ex: '507f1f77bcf86cd799439011'
  JSONBIN_API_KEY: 'VOTRE_API_KEY_ICI',         // Ex: '$2b$10$...'
  
  // ─── Option 2: Supabase (plus robuste, pour production) ───
  USE_SUPABASE: false,
  SUPABASE_URL: 'https://VOTRE_PROJET.supabase.co',
  SUPABASE_ANON_KEY: 'VOTRE_ANON_KEY_ICI',
  
  // ─── Option 3: Webhook personnalisé ───
  USE_CUSTOM_WEBHOOK: false,
  WEBHOOK_URL: 'https://votre-app.vercel.app/api/benevoles',
  
  // ─── Notifications par email ───
  SEND_EMAIL_ON_NEW: true,                       // Envoyer un email à chaque inscription
  ADMIN_EMAIL: 'kakik.amath@gmail.com',          // Email de notification
  
  // ─── Mapping des colonnes du formulaire ───
  // Ajustez les numéros selon l'ordre de vos questions (commence à 0)
  COLUMNS: {
    TIMESTAMP: 0,        // Horodateur (automatique)
    NOM: 1,              // "Votre nom"
    PRENOM: 2,           // "Votre prénom"
    EMAIL: 3,            // "Votre email"
    TELEPHONE: 4,        // "Votre numéro de téléphone"
    PERMIS_BATEAU: 5,    // "Avez-vous le permis bateau ?"
    PANIER_REPAS: 6,     // "Souhaitez-vous un panier repas ?"
    DISPONIBILITE: 7,    // "Quelles sont vos disponibilités ?" (optionnel)
    POSTE_SOUHAITE: 8,   // "Quel poste souhaiteriez-vous ?" (optionnel)
    COMMENTAIRE: 9       // "Commentaires" (optionnel)
  },
  
  // ─── Nom de la régate (pour les notifications) ───
  REGATTA_NAME: 'Coupe du Finistère',
  REGATTA_DATE: '22/06/2025'
};

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║                         FONCTIONS PRINCIPALES                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Configuration initiale - Exécutez cette fonction UNE FOIS après avoir collé le script
 */
function initialSetup() {
  // Supprimer les anciens déclencheurs
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Créer le nouveau déclencheur
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(FormApp.getActiveForm())
    .onFormSubmit()
    .create();
  
  Logger.log('✅ Configuration terminée !');
  Logger.log('📋 Déclencheur créé sur onFormSubmit');
  Logger.log('🔧 Testez avec la fonction testConfiguration()');
  
  // Afficher la configuration actuelle
  Logger.log('\n═══ Configuration actuelle ═══');
  Logger.log('JSONbin: ' + CONFIG.USE_JSONBIN);
  Logger.log('Supabase: ' + CONFIG.USE_SUPABASE);
  Logger.log('Webhook: ' + CONFIG.USE_CUSTOM_WEBHOOK);
}

/**
 * Fonction déclenchée automatiquement à chaque soumission du formulaire
 */
function onFormSubmit(e) {
  try {
    Logger.log('📥 Nouvelle soumission reçue');
    
    const responses = e.values;
    const cols = CONFIG.COLUMNS;
    
    // Construire l'objet bénévole
    const benevole = {
      id: Date.now(),
      timestamp: responses[cols.TIMESTAMP] || new Date().toISOString(),
      name: cleanString(responses[cols.NOM]),
      firstName: cleanString(responses[cols.PRENOM]),
      email: cleanString(responses[cols.EMAIL]),
      phone: formatPhone(responses[cols.TELEPHONE]),
      permisB: parseBoolean(responses[cols.PERMIS_BATEAU]),
      panierRepas: parsePanierRepas(responses[cols.PANIER_REPAS]),
      disponibilite: cleanString(responses[cols.DISPONIBILITE]),
      posteSouhaite: cleanString(responses[cols.POSTE_SOUHAITE]),
      commentaire: cleanString(responses[cols.COMMENTAIRE]),
      role: '',  // À assigner dans l'application
      source: 'google_forms',
      synced: new Date().toISOString()
    };
    
    Logger.log('👤 Bénévole: ' + benevole.firstName + ' ' + benevole.name);
    
    // Sauvegarder selon la configuration
    let success = false;
    
    if (CONFIG.USE_JSONBIN) {
      success = saveToJSONbin(benevole);
    } else if (CONFIG.USE_SUPABASE) {
      success = saveToSupabase(benevole);
    } else if (CONFIG.USE_CUSTOM_WEBHOOK) {
      success = sendToWebhook(benevole);
    } else {
      Logger.log('⚠️ Aucune méthode de stockage configurée !');
      // Fallback: sauvegarder dans une feuille de calcul
      saveToSpreadsheet(benevole);
      success = true;
    }
    
    // Envoyer notification email
    if (success && CONFIG.SEND_EMAIL_ON_NEW) {
      sendNotificationEmail(benevole);
    }
    
    Logger.log(success ? '✅ Synchronisation réussie' : '❌ Échec de la synchronisation');
    
  } catch (error) {
    Logger.log('❌ Erreur: ' + error.toString());
    sendErrorEmail(error);
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║                         MÉTHODES DE STOCKAGE                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Sauvegarde dans JSONbin.io
 */
function saveToJSONbin(benevole) {
  try {
    const baseUrl = 'https://api.jsonbin.io/v3/b/' + CONFIG.JSONBIN_BIN_ID;
    const headers = {
      'X-Master-Key': CONFIG.JSONBIN_API_KEY,
      'Content-Type': 'application/json'
    };
    
    // Récupérer les données existantes
    const getResponse = UrlFetchApp.fetch(baseUrl + '/latest', {
      method: 'GET',
      headers: headers,
      muteHttpExceptions: true
    });
    
    let existingData = [];
    if (getResponse.getResponseCode() === 200) {
      const json = JSON.parse(getResponse.getContentText());
      existingData = json.record || [];
    }
    
    // Ajouter le nouveau bénévole
    existingData.push(benevole);
    
    // Sauvegarder
    const putResponse = UrlFetchApp.fetch(baseUrl, {
      method: 'PUT',
      headers: headers,
      payload: JSON.stringify(existingData),
      muteHttpExceptions: true
    });
    
    if (putResponse.getResponseCode() === 200) {
      Logger.log('💾 Sauvegardé dans JSONbin (' + existingData.length + ' bénévoles)');
      return true;
    } else {
      Logger.log('❌ Erreur JSONbin: ' + putResponse.getContentText());
      return false;
    }
    
  } catch (error) {
    Logger.log('❌ Erreur JSONbin: ' + error.toString());
    return false;
  }
}

/**
 * Sauvegarde dans Supabase
 */
function saveToSupabase(benevole) {
  try {
    const url = CONFIG.SUPABASE_URL + '/rest/v1/benevoles';
    
    const payload = {
      id: benevole.id,
      name: benevole.name,
      first_name: benevole.firstName,
      email: benevole.email,
      phone: benevole.phone,
      permis_bateau: benevole.permisB,
      panier_repas: benevole.panierRepas,
      disponibilite: benevole.disponibilite,
      poste_souhaite: benevole.posteSouhaite,
      commentaire: benevole.commentaire,
      source: benevole.source
    };
    
    const response = UrlFetchApp.fetch(url, {
      method: 'POST',
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 201) {
      Logger.log('💾 Sauvegardé dans Supabase');
      return true;
    } else {
      Logger.log('❌ Erreur Supabase: ' + response.getContentText());
      return false;
    }
    
  } catch (error) {
    Logger.log('❌ Erreur Supabase: ' + error.toString());
    return false;
  }
}

/**
 * Envoi vers webhook personnalisé
 */
function sendToWebhook(benevole) {
  try {
    const response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      payload: JSON.stringify(benevole),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      Logger.log('💾 Envoyé au webhook');
      return true;
    } else {
      Logger.log('❌ Erreur webhook: ' + response.getResponseCode());
      return false;
    }
    
  } catch (error) {
    Logger.log('❌ Erreur webhook: ' + error.toString());
    return false;
  }
}

/**
 * Sauvegarde de secours dans une Google Sheet
 */
function saveToSpreadsheet(benevole) {
  const form = FormApp.getActiveForm();
  let spreadsheetId = PropertiesService.getScriptProperties().getProperty('BACKUP_SHEET_ID');
  
  if (!spreadsheetId) {
    // Créer une nouvelle feuille
    const ss = SpreadsheetApp.create('Bénévoles - ' + CONFIG.REGATTA_NAME);
    spreadsheetId = ss.getId();
    PropertiesService.getScriptProperties().setProperty('BACKUP_SHEET_ID', spreadsheetId);
    
    // Ajouter les en-têtes
    const sheet = ss.getActiveSheet();
    sheet.appendRow(['ID', 'Timestamp', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Permis', 'Repas', 'Dispo', 'Poste', 'Commentaire']);
  }
  
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getActiveSheet();
  
  sheet.appendRow([
    benevole.id,
    benevole.timestamp,
    benevole.name,
    benevole.firstName,
    benevole.email,
    benevole.phone,
    benevole.permisB ? 'Oui' : 'Non',
    benevole.panierRepas,
    benevole.disponibilite,
    benevole.posteSouhaite,
    benevole.commentaire
  ]);
  
  Logger.log('💾 Sauvegardé dans Google Sheets (backup)');
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║                              NOTIFICATIONS                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Envoie un email de notification pour une nouvelle inscription
 */
function sendNotificationEmail(benevole) {
  if (!CONFIG.ADMIN_EMAIL) return;
  
  const subject = '🙋 Nouveau bénévole - ' + CONFIG.REGATTA_NAME;
  
  const body = `
Bonjour,

Une nouvelle inscription bénévole a été reçue pour ${CONFIG.REGATTA_NAME} (${CONFIG.REGATTA_DATE}) :

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 ${benevole.firstName} ${benevole.name}
📧 ${benevole.email || 'Non renseigné'}
📱 ${benevole.phone || 'Non renseigné'}
🚤 Permis bateau : ${benevole.permisB ? 'Oui' : 'Non'}
🍽️ Panier repas : ${benevole.panierRepas}
${benevole.posteSouhaite ? '📋 Poste souhaité : ' + benevole.posteSouhaite : ''}
${benevole.commentaire ? '💬 Commentaire : ' + benevole.commentaire : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👉 Pensez à l'assigner à un poste dans l'application Régates Organizer.

--
Email automatique - Régates Organizer
  `;
  
  try {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: subject,
      body: body
    });
    Logger.log('📧 Email de notification envoyé');
  } catch (error) {
    Logger.log('⚠️ Impossible d\'envoyer l\'email: ' + error.toString());
  }
}

/**
 * Envoie un email en cas d'erreur
 */
function sendErrorEmail(error) {
  if (!CONFIG.ADMIN_EMAIL) return;
  
  try {
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: '⚠️ Erreur sync bénévoles - ' + CONFIG.REGATTA_NAME,
      body: 'Une erreur s\'est produite lors de la synchronisation :\n\n' + error.toString()
    });
  } catch (e) {
    Logger.log('Impossible d\'envoyer l\'email d\'erreur');
  }
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║                           FONCTIONS UTILITAIRES                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

function cleanString(value) {
  if (!value) return '';
  return value.toString().trim();
}

function formatPhone(value) {
  if (!value) return '';
  // Nettoyer et formater le numéro
  let phone = value.toString().replace(/\D/g, '');
  if (phone.length === 10 && phone.startsWith('0')) {
    return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return value.toString().trim();
}

function parseBoolean(value) {
  if (!value) return false;
  const v = value.toString().toLowerCase().trim();
  return v === 'oui' || v === 'yes' || v === 'true' || v === '1';
}

function parsePanierRepas(value) {
  if (!value) return 'oui';
  const v = value.toString().toLowerCase().trim();
  if (v.includes('non')) return 'non';
  if (v.includes('végé') || v.includes('veggie') || v.includes('végétarien')) return 'veggie';
  return 'oui';
}

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║                              FONCTIONS DE TEST                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

/**
 * Teste la configuration complète
 */
function testConfiguration() {
  Logger.log('═══════════════════════════════════════');
  Logger.log('       TEST DE CONFIGURATION');
  Logger.log('═══════════════════════════════════════');
  
  // Test données
  const testBenevole = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    name: 'TEST',
    firstName: 'Bénévole',
    email: 'test@example.com',
    phone: '06 00 00 00 00',
    permisB: true,
    panierRepas: 'oui',
    disponibilite: 'Toute la journée',
    posteSouhaite: 'Sécurité',
    commentaire: 'Ceci est un test',
    role: '',
    source: 'google_forms_test',
    synced: new Date().toISOString()
  };
  
  Logger.log('\n📋 Données de test:');
  Logger.log(JSON.stringify(testBenevole, null, 2));
  
  // Test selon la configuration
  Logger.log('\n🔧 Test de sauvegarde...');
  
  let result = false;
  if (CONFIG.USE_JSONBIN) {
    Logger.log('→ Méthode: JSONbin.io');
    result = saveToJSONbin(testBenevole);
  } else if (CONFIG.USE_SUPABASE) {
    Logger.log('→ Méthode: Supabase');
    result = saveToSupabase(testBenevole);
  } else if (CONFIG.USE_CUSTOM_WEBHOOK) {
    Logger.log('→ Méthode: Webhook');
    result = sendToWebhook(testBenevole);
  } else {
    Logger.log('→ Méthode: Google Sheets (backup)');
    saveToSpreadsheet(testBenevole);
    result = true;
  }
  
  Logger.log('\n═══════════════════════════════════════');
  Logger.log(result ? '✅ TEST RÉUSSI' : '❌ TEST ÉCHOUÉ');
  Logger.log('═══════════════════════════════════════');
  
  return result;
}

/**
 * Récupère tous les bénévoles depuis JSONbin (pour debug)
 */
function getAllBenevoles() {
  if (!CONFIG.USE_JSONBIN) {
    Logger.log('JSONbin non configuré');
    return [];
  }
  
  const response = UrlFetchApp.fetch('https://api.jsonbin.io/v3/b/' + CONFIG.JSONBIN_BIN_ID + '/latest', {
    method: 'GET',
    headers: { 'X-Master-Key': CONFIG.JSONBIN_API_KEY },
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() === 200) {
    const data = JSON.parse(response.getContentText());
    Logger.log('📋 ' + (data.record || []).length + ' bénévoles trouvés');
    Logger.log(JSON.stringify(data.record, null, 2));
    return data.record || [];
  }
  
  Logger.log('Erreur: ' + response.getContentText());
  return [];
}

/**
 * Vide la liste des bénévoles dans JSONbin (⚠️ ATTENTION)
 */
function clearAllBenevoles() {
  if (!CONFIG.USE_JSONBIN) {
    Logger.log('JSONbin non configuré');
    return;
  }
  
  const response = UrlFetchApp.fetch('https://api.jsonbin.io/v3/b/' + CONFIG.JSONBIN_BIN_ID, {
    method: 'PUT',
    headers: {
      'X-Master-Key': CONFIG.JSONBIN_API_KEY,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify([]),
    muteHttpExceptions: true
  });
  
  Logger.log(response.getResponseCode() === 200 ? '🗑️ Liste vidée' : '❌ Erreur');
}

/**
 * Synchronise toutes les réponses existantes du formulaire
 */
function syncAllExistingResponses() {
  Logger.log('🔄 Synchronisation des réponses existantes...');
  
  const form = FormApp.getActiveForm();
  const responses = form.getResponses();
  
  Logger.log('📋 ' + responses.length + ' réponses à synchroniser');
  
  let successCount = 0;
  
  responses.forEach((response, index) => {
    try {
      const itemResponses = response.getItemResponses();
      const values = [response.getTimestamp().toISOString()];
      
      itemResponses.forEach(item => {
        values.push(item.getResponse() || '');
      });
      
      // Simuler l'événement
      onFormSubmit({ values: values });
      successCount++;
      
      // Pause pour éviter le rate limiting
      Utilities.sleep(1000);
      
      Logger.log(`${index + 1}/${responses.length} ✓`);
      
    } catch (error) {
      Logger.log(`${index + 1}/${responses.length} ✗ - ${error.toString()}`);
    }
  });
  
  Logger.log('\n═══════════════════════════════════════');
  Logger.log(`✅ Synchronisation terminée: ${successCount}/${responses.length}`);
  Logger.log('═══════════════════════════════════════');
}
