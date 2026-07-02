import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, FileText, ClipboardList, Settings, Award, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronRight, Plus, Trash2, Download, Mail, ExternalLink, Phone, Anchor, MapPin, Ship, Edit, Copy, Eye, Printer } from 'lucide-react';

// ==================== CONSTANTS ====================
const INITIAL_REGATTA = { 
  name: '', 
  date: '', 
  location: 'Plage du Trez-Hir – Centre Nautique de PLOUGONVELIN',
  grade: '5C', 
  supports: [], 
  expectedParticipants: 50,
  vhfChannels: { rond1: '69', rond2: '72' },
  whatsappLink: ''
};

const GRADES = [
  { value: '5C', label: '5C - Club' },
  { value: '5B', label: '5B - Locale' },
  { value: '5A', label: '5A - Régionale' },
  { value: '4', label: '4 - Nationale' }
];

const SUPPORTS = ['Optimist', 'T293', 'RCB', 'ILCA 4', 'ILCA 6', 'ILCA 7', '420', '470', '29er', 'RS Feva', 'OpenBic', 'OpenSkiff', 'Catamaran INC', 'Dériveur IND', 'Windsurf', 'Kitesurf', 'Wing'];

const TASK_CATEGORIES = [
  { id: 'admin', name: 'Administratif', icon: FileText, color: '#3B82F6' },
  { id: 'volunteers', name: 'Bénévoles', icon: Users, color: '#10B981' },
  { id: 'logistics', name: 'Logistique', icon: ClipboardList, color: '#F59E0B' },
  { id: 'catering', name: 'Restauration', icon: Award, color: '#EF4444' },
  { id: 'communication', name: 'Communication', icon: Mail, color: '#8B5CF6' }
];

const DEFAULT_TASKS = [
  // J-180
  { id: 1, category: 'admin', title: 'Donner dates à NPI', description: 'Vérifier conflits dates avec AMP', daysBeforeEvent: 180, required: true },
  { id: 2, category: 'admin', title: 'Déclaration DDTM/AffMar', description: 'Manifestation nautique - formulaire en ligne', daysBeforeEvent: 180, required: true, link: 'https://www.premar-atlantique.gouv.fr/uploads/ckeditor_storage/atlantique/01%20DMN%20fa%C3%A7ade%20Atlantique%202019.pdf' },
  { id: 3, category: 'logistics', title: 'Réserver matériel mairie', description: 'Barnum, tables, chaises - services techniques', daysBeforeEvent: 180, required: true },
  // J-60
  { id: 4, category: 'admin', title: 'Déclaration mairie', description: 'Plan animation, fiche sécurité, assurance, débit boissons', daysBeforeEvent: 60, required: true },
  { id: 5, category: 'admin', title: 'Déclaration police', description: 'Avec accusé réception AffMar', daysBeforeEvent: 60, required: true },
  { id: 6, category: 'admin', title: 'Inscription calendrier FFVoile', description: 'Via interface gestion club', daysBeforeEvent: 60, required: true },
  { id: 7, category: 'admin', title: 'Demande débit de boissons', description: 'Copie à police', daysBeforeEvent: 60, required: false },
  // J-30
  { id: 8, category: 'admin', title: 'Créer formulaire inscriptions', description: 'Google Forms', daysBeforeEvent: 30, required: true, link: 'https://docs.google.com/forms/d/1XRVowqJk8F7EPYKIxsQs7fTmUYHv-2OX0ZykQg7MAAs/edit' },
  { id: 9, category: 'admin', title: 'Rédiger avis de course', description: 'Modèles FFVoile - faire relire arbitres', daysBeforeEvent: 30, required: true },
  { id: 10, category: 'communication', title: 'Publier avis de course', description: 'Site web, VPB, clubs', daysBeforeEvent: 30, required: true },
  { id: 11, category: 'volunteers', title: 'Créer formulaire bénévoles', description: 'Inscription en ligne', daysBeforeEvent: 30, required: true, link: 'https://docs.google.com/forms/d/187cx0pEQARNMDnMdrQj59z285LbnhQW9LYnsIgHRTTw/edit' },
  { id: 12, category: 'volunteers', title: 'Email appel bénévoles', description: 'Avec lien formulaire', daysBeforeEvent: 30, required: true },
  { id: 13, category: 'admin', title: 'Commander fonds de caisse', description: 'BPGO - 2 caisses', daysBeforeEvent: 30, required: true },
  { id: 14, category: 'communication', title: 'Contacter sponsors/élus/presse', description: 'Invitations', daysBeforeEvent: 30, required: false },
  // J-14
  { id: 15, category: 'logistics', title: 'Demande matériel NPI', description: '5 sécus 15-20CV, 2 sécus 30CV, 10 VHF', daysBeforeEvent: 14, required: true },
  { id: 16, category: 'admin', title: 'Surveiller réponse AffMar', description: 'À afficher obligatoirement jour J', daysBeforeEvent: 14, required: true },
  { id: 17, category: 'logistics', title: 'Impressions documents', description: 'Émargement, parcours, numéros utiles', daysBeforeEvent: 14, required: true },
  { id: 18, category: 'admin', title: 'Mettre à jour fiche numéros utiles', description: 'Selon bénévoles inscrits', daysBeforeEvent: 14, required: true },
  { id: 19, category: 'logistics', title: 'Élaborer parcours', description: '2 ronds - bouées disponibles', daysBeforeEvent: 14, required: true },
  // J-7
  { id: 20, category: 'volunteers', title: 'Relance bénévoles', description: 'Confirmer présences', daysBeforeEvent: 7, required: true },
  { id: 21, category: 'volunteers', title: 'Email organisation bénévoles', description: 'Détail journée, horaires, postes', daysBeforeEvent: 7, required: true },
  { id: 22, category: 'volunteers', title: 'Nommer responsable sécu', description: 'Armer bateaux, navette équipe mer', daysBeforeEvent: 7, required: true },
  { id: 23, category: 'volunteers', title: 'Nommer responsable catamarans', description: 'Attribution équipages, rangement', daysBeforeEvent: 7, required: false },
  { id: 24, category: 'logistics', title: 'Contacter services techniques', description: 'Confirmation dépôt matériel vendredi', daysBeforeEvent: 7, required: true },
  { id: 25, category: 'catering', title: 'Inventaire club house', description: 'Vérifier péremptions', daysBeforeEvent: 7, required: true },
  { id: 26, category: 'catering', title: 'Commander baguettes', description: 'Boulangerie', daysBeforeEvent: 7, required: true },
  { id: 27, category: 'logistics', title: 'Rappeler CNPK dossards', description: 'À ramener', daysBeforeEvent: 7, required: false },
  // J-1
  { id: 28, category: 'logistics', title: 'Gonflage bouées', description: 'Compresseur - samedi après-midi', daysBeforeEvent: 1, required: true },
  { id: 29, category: 'logistics', title: 'Préparer marocains/livardes', description: 'Pavillonnerie', daysBeforeEvent: 1, required: true },
  { id: 30, category: 'logistics', title: 'Vérifier mallettes', description: 'Crayon, compas, girouette, feuilles pointage, parcours, numéros', daysBeforeEvent: 1, required: true },
  { id: 31, category: 'logistics', title: 'Vérifier caisse pharmacie', description: 'Sécu G', daysBeforeEvent: 1, required: true },
  { id: 32, category: 'catering', title: 'Faire les courses', description: 'Selon liste - prévoir 2ème cafetière', daysBeforeEvent: 1, required: true },
  { id: 33, category: 'logistics', title: 'Imprimer répartition bénévoles', description: 'Pour accueil barnum et briefing mer', daysBeforeEvent: 1, required: true },
  { id: 34, category: 'volunteers', title: 'Générer feuille émargement', description: 'Avec noms pré-remplis', daysBeforeEvent: 1, required: true }
];

// Rôles bénévoles enrichis basés sur le fichier Excel
const VOLUNTEER_ROLES = [
  // Équipe à terre
  { id: 'resp_terre', name: 'Responsable terre & bénévoles', location: 'terre', minPeople: 1, timeSlot: '8h-17h' },
  { id: 'installation', name: 'Installation barnums/tables', location: 'terre', minPeople: 6, timeSlot: '8h-10h30' },
  { id: 'parking', name: 'Gestion parkings', location: 'terre', minPeople: 4, timeSlot: '8h-10h30' },
  { id: 'inscription', name: 'Inscriptions coureurs', location: 'terre', minPeople: 4, timeSlot: '9h-11h30' },
  { id: 'emargement', name: 'Émargement retour', location: 'terre', minPeople: 3, timeSlot: '15h30-17h30' },
  { id: 'commissaire', name: 'Commissaire aux résultats', location: 'terre', minPeople: 2, timeSlot: '10h-17h' },
  { id: 'pc_terre', name: 'PC Terre', location: 'terre', minPeople: 1, timeSlot: '12h-16h' },
  { id: 'buvette_matin', name: 'Buvette/crêpes matin', location: 'terre', minPeople: 2, timeSlot: '9h-13h' },
  { id: 'buvette_aprem', name: 'Buvette/goûter après-midi', location: 'terre', minPeople: 3, timeSlot: '13h-17h' },
  { id: 'jury', name: 'Jury (arbitre FFV)', location: 'terre', minPeople: 1, timeSlot: '10h-17h' },
  // Équipe mer - Rond 1 (PAV/Opti)
  { id: 'comite_r1', name: 'Comité rond PAV/Opti', location: 'mer', minPeople: 5, timeSlot: '10h30-17h', rond: 1 },
  { id: 'arrivee_r1', name: 'Arrivée PAV/Opti', location: 'mer', minPeople: 4, timeSlot: '10h30-17h', rond: 1 },
  { id: 'secu_r1', name: 'Sécu G PAV/Opti', location: 'mer', minPeople: 2, timeSlot: '10h30-17h', rond: 1 },
  { id: 'mouilleur_r1', name: 'Mouilleur PAV/Opti', location: 'mer', minPeople: 2, timeSlot: '10h30-17h', rond: 1 },
  // Équipe mer - Rond 2 (Cata/Dér)
  { id: 'comite_r2', name: 'Comité rond Cata/Dér', location: 'mer', minPeople: 4, timeSlot: '10h30-17h', rond: 2 },
  { id: 'arrivee_r2', name: 'Arrivée Cata/Dér', location: 'mer', minPeople: 4, timeSlot: '10h30-17h', rond: 2 },
  { id: 'secu_r2', name: 'Sécu G Cata/Dér', location: 'mer', minPeople: 2, timeSlot: '10h30-17h', rond: 2 },
  { id: 'mouilleur_r2', name: 'Mouilleur Cata/Dér', location: 'mer', minPeople: 2, timeSlot: '10h30-17h', rond: 2 },
  // Multi-ronds
  { id: 'secu_multi', name: 'Sécu G multironds', location: 'mer', minPeople: 2, timeSlot: '10h30-17h' },
  { id: 'photo', name: 'Photographe', location: 'mer', minPeople: 2, timeSlot: '10h30-17h' },
  { id: 'entraineur', name: 'Entraîneur AMATH', location: 'mer', minPeople: 1, timeSlot: '10h30-17h' },
  // Préparatifs
  { id: 'gonflage', name: 'Gonflage bouées (samedi)', location: 'terre', minPeople: 2, timeSlot: '14h-16h (J-1)' }
];

const ADMIN_DOCS = [
  { id: 'ddtm', name: 'Déclaration DDTM/AffMar', deadline: 15, required: true, link: 'https://www.premar-atlantique.gouv.fr/uploads/ckeditor_storage/atlantique/01%20DMN%20fa%C3%A7ade%20Atlantique%202019.pdf', 
    piecesJointes: ['Plan de la manifestation (obligatoire)', 'Zone de course (carte SHOM)'] },
  { id: 'mairie', name: 'Déclaration Mairie', deadline: 60, required: true,
    piecesJointes: ['Plan animation', 'Fiche sécurité', 'Attestation assurance', 'Demande débit boissons', 'Annuaire téléphonique'] },
  { id: 'police', name: 'Déclaration Police', deadline: 60, required: true,
    piecesJointes: ['Accusé réception DDTM'] },
  { id: 'ffv', name: 'Calendrier FFVoile', deadline: 30, required: true },
  { id: 'boisson', name: 'Débit boissons temporaire', deadline: 60, required: false,
    piecesJointes: ['Formulaire complété'] },
  { id: 'fiche_secu', name: 'Fiche sécurité', deadline: 60, required: true,
    piecesJointes: ['Plan situation', 'Annuaire contacts', 'Localisation DZ/PMA'] }
];

// Liens utiles pour les documents
const USEFUL_LINKS = {
  ddtm_formulaire: 'https://www.premar-atlantique.gouv.fr/uploads/ckeditor_storage/atlantique/01%20DMN%20fa%C3%A7ade%20Atlantique%202019.pdf',
  shom_carte: 'https://data.shom.fr/#001=eyJjIjpbLTUxNzAxNS41ODE0Mjc0Njc2LDYxNjEzNjguNjg1NzQ3Nl0sInoiOjEzLjMzMzUyMzUwNTE2OTczMSwiciI6MCwibCI6W3sidHlwZSI6IklOVEVSTkFMX0xBWUVSIiwiaWRlbnRpZmllciI6IlJBU1RFUl9NQVJJTkVfMzg1N19XTVRTIiwib3BhY2l0eSI6MSwidmlzaWJpbGl0eSI6dHJ1ZX0seyJ0eXBlIjoiSU5URVJOQUxfTEFZRVIiLCJpZGVudGlmaWVyIjoiRkRDX0dFQkNPX1BZUi1QTkdfMzg1N19XTVRTIiwib3BhY2l0eSI6MSwidmlzaWJpbGl0eSI6dHJ1ZX1dfQ==',
  ffvoile_ac_simplifie: 'https://arbitrage.ffvoile.fr/media/33pc1eic/2025_ac-type-voile-légère-simplifié-5c-5b-sept-25.docx',
  ffvoile_ac_complet: 'https://arbitrage.ffvoile.fr/media/ywld0ayh/2025_ac-type-voile-legere-def-sept-25-forme-texte.docx',
  ffvoile_ic_types: 'https://arbitrage.ffvoile.fr/media/xiajwvrh/ic-types-vl-avec-champs-25-28-mars-25-def.docx',
  ffvoile_fiche_course_rir: 'https://arbitrage.ffvoile.fr/regles-et-documents/ac-ic-annexes-types/',
  google_form_benevoles: 'https://docs.google.com/forms/d/187cx0pEQARNMDnMdrQj59z285LbnhQW9LYnsIgHRTTw/edit',
  google_form_inscriptions: 'https://docs.google.com/forms/d/1XRVowqJk8F7EPYKIxsQs7fTmUYHv-2OX0ZykQg7MAAs/edit',
  inscription_vpb: 'https://tinyurl.com/2r55zrzs'  // Lien inscriptions VPB
};

// Tarifs officiels Voile en Pays de Brest
const TARIFS_VPB = {
  solitaire: 12,
  double: 24,
  double_location_cata: 30
};

const EMERGENCY_CONTACTS = [
  { name: 'CROSS CORSEN', role: 'Accident en mer', phone: '196', vhf: '16' },
  { name: 'SAMU', role: 'Accident à terre', phone: '15 / 112', vhf: '' },
  { name: 'Pompiers', role: 'Accident à terre', phone: '18', vhf: '' },
  { name: 'URGENCE CCA', role: 'Après les secours', phone: '01 40 60 37 58', vhf: '' }
];

const MAIL_TEMPLATES = {
  benevoles_invitation: {
    subject: 'Appel aux bénévoles - Régate {regattaName} du {date}',
    body: `Bonjour à toutes et à tous,

La régate {regattaName}, organisée par l'Amath, aura lieu le {date} à {location}.

Nous recherchons des bénévoles pour assurer le bon déroulement de cette journée.

Plusieurs postes sont à pourvoir :
- À terre : installation, inscriptions, émargement, buvette
- En mer : comité de course, sécurité, mouilleur

👉 Inscrivez-vous via ce formulaire : {formLink}

Même si vous n'êtes pas disponible toute la journée, votre aide sera précieuse !

À bientôt,
L'équipe du CA`
  },
  benevoles_organisation: {
    subject: 'Organisation bénévoles - Régate du {date}',
    body: `Bonjour à toutes et à tous,

La régate de Voile en Pays de Brest tous supports en voiles légères, organisée par l'Amath, aura lieu dimanche {date}.

Pour celles et ceux qui sont inscrits en tant que bénévoles, voici l'organisation de la journée :

8H00 : installation du site, montage des barnums
8H30 : préparation des paniers repas pour les bénévoles
9h15 : ouverture des inscriptions (prévoir d'arriver 15 minutes avant)
10h : briefing équipe mer en salle Jardin des Mers (présence requise de tous les bénévoles mer)
10h30 : départ sur l'eau de l'équipe mer - briefing entraîneurs
10h45 : briefing coureurs
12h : premier départ
15h30-17h00 : retour à terre. Ouverture de l'émargement retour des coureurs
17h00-18h : remise des prix - pot de convivialité
18h15 : rangement du site

📋 Votre poste : consultez le tableau de répartition ci-joint

NB : N'oubliez pas d'émarger la fiche de présence des bénévoles qui sera à votre disposition sur place.

À bientôt,
L'équipe du CA`
  },
  mairie: {
    subject: 'Déclaration manifestation nautique - {regattaName} du {date}',
    body: `Madame, Monsieur,

L'association AMATH KAKIKOUKA organise une régate de voile légère le {date} à {location}.

Nous vous informons que la déclaration de manifestation nautique a été déposée auprès de la DDTM/Affaires Maritimes.

Veuillez trouver ci-joint les documents requis :
- Le plan de l'animation / emprise de la manifestation
- L'annuaire téléphonique des responsables
- La fiche de sécurité
- L'attestation d'assurance RC
- La demande de débit de boissons temporaire (groupe 3)

Informations pratiques :
- Horaires : 10h à 18h
- Nombre de participants attendus : {expectedParticipants}
- Localisation : {location}

Nous restons à votre disposition pour tout renseignement complémentaire.

Cordialement,
{organizerName}
AMATH KAKIKOUKA

Copie : Police municipale (police@plougonvelin.fr)`
  },
  ddtm: {
    subject: 'Déclaration manifestation nautique - {regattaName} du {date}',
    body: `Madame, Monsieur,

Conformément à la réglementation en vigueur, nous sollicitons l'autorisation d'organiser une manifestation nautique :

INFORMATIONS GÉNÉRALES
━━━━━━━━━━━━━━━━━━━━━━
Événement : {regattaName}
Date : {date}
Organisateur : AMATH KAKIKOUKA
Lieu : {location}
Zone de course : Anse de Bertheaume (voir carte SHOM ci-jointe)
Grade FFVoile : {grade}

PARTICIPANTS
━━━━━━━━━━━━━━━━━━━━━━
Nombre attendu : {expectedParticipants} coureurs
Supports : {supports}

DISPOSITIF DE SÉCURITÉ
━━━━━━━━━━━━━━━━━━━━━━
- Bateaux de sécurité avec personnel qualifié (ratio selon règlement FFVoile)
- Communication VHF sur canaux {vhfChannel} et 72
- PC Terre en liaison permanente avec l'équipe mer
- Émargement obligatoire départ et retour

PIÈCES JOINTES
━━━━━━━━━━━━━━━━━━━━━━
☐ Plan de la zone de course (carte SHOM)
☐ Plan de la manifestation à terre
☐ Attestation d'assurance RC

Nous sollicitons votre autorisation pour cette manifestation.

Cordialement,
{organizerName}
AMATH KAKIKOUKA
kakik.amath@gmail.com`
  },
  npi: {
    subject: 'Demande matériel - Régate du {date}',
    body: `Bonjour,

L'Amath organise une régate le {date}.

Nous souhaitons demander la mise à disposition du matériel suivant :
- 5 sécus 15/20 CV
- 2 sécus 30 CV
- 10 VHF

Ainsi que l'accès au bâtiment :
- Salle Jardin des Mers
- Local essence

Merci de nous confirmer la disponibilité de ce matériel.

Cordialement,
{organizerName}
AMATH KAKIKOUKA`
  },
  presse: {
    subject: 'Résultats régate {regattaName} du {date}',
    body: `{regattaName} - {date}

[RÉSUMÉ : météo, ambiance, nombre de participants]

Résultats :
[À compléter avec les classements]

Prochaine régate : [date]

Contact : AMATH KAKIKOUKA
Photos disponibles sur demande.`
  },
  debit_boissons: {
    subject: 'Demande débit de boissons temporaire - {regattaName} du {date}',
    body: `DEMANDE D'AUTORISATION D'OUVRIR UN DEBIT TEMPORAIRE

Monsieur le Maire,

Je soussigné(e) :
Nom : GUERIN
Prénoms : LOIC
Profession ou qualité : Président de l'association AMATH KAKIKOUKA
Domicile : 6 boulevard de la mer
CP/ville : 29217 PLOUGONVELIN

Ai l'honneur de solliciter de votre bienveillance l'autorisation d'établir un débit de boisson temporaire à :

Lieu : Centre nautique du Trez-Hir
Du : {date} à 13h00
Au : {date} à 18h00

Motif : ☒ Autre : {regattaName} - Critérium de Bassin Voile en Pays de Brest

Boissons de 3ème catégorie (groupe 3)

Fait à Plougonvelin le __/__/____

SIGNATURE DU DEMANDEUR


Je souhaite recevoir mon document finalisé à l'adresse mail :
kakik.amath@gmail.com`
  },
  fiche_securite: {
    subject: 'Fiche sécurité - {regattaName} du {date}',
    body: `FICHE SÉCURITÉ - MANIFESTATION NAUTIQUE

Nom de la manifestation : {regattaName}
Date : {date}
Organisateur : AMATH KAKIKOUKA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTIE TERRE – ENREGISTREMENT – POT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Présence public : 10h-12h puis 15h30-18h

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LA MANIFESTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Description :
- Date : {date}
- Jauge max : {expectedParticipants} personnes
- Parkings : 
  1. Face office du tourisme
  2. Rue de Kerouanen Stang
- Barnum devant centre nautique (extincteur présent)
- Boissons groupe 3 de 10h à 19h

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSABLES SÉCURITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Responsable principal : GUERIN Loïc - 06 66 99 19 89
Responsable adjoint : BLANCKAERT Godelieve - 06 15 87 10 03
Nombre de bénévoles : ~20

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECOURS / SANTÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Évacuation : Appel SDIS (18)
DZ : Boulevard de la mer
  Latitude : 48°20'55,5"
  Longitude : -4°42'8,87"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMMODITÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Eau gratuite : Centre nautique
WC : Centre nautique + WC public entrée plage`
  }
};

// ==================== UTILITY FUNCTIONS ====================
const calcDeadline = (eventDate, daysBefore) => {
  if (!eventDate) return null;
  const d = new Date(eventDate);
  d.setDate(d.getDate() - daysBefore);
  return d;
};

const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
const formatDateShort = (date) => date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-';

const getDaysUntil = (date) => {
  if (!date) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(date); target.setHours(0,0,0,0);
  return Math.ceil((target - today) / 86400000);
};

const getStatus = (task, eventDate, completed) => {
  if (completed.includes(task.id)) return 'completed';
  const dl = calcDeadline(eventDate, task.daysBeforeEvent);
  const days = getDaysUntil(dl);
  if (days === null) return 'pending';
  if (days < 0) return 'overdue';
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'soon';
  return 'pending';
};

const generateMailContent = (templateKey, regatta, volunteers) => {
  const template = MAIL_TEMPLATES[templateKey];
  if (!template) return { subject: '', body: '' };
  
  let subject = template.subject;
  let body = template.body;
  
  const replacements = {
    '{regattaName}': regatta.name || 'Régate',
    '{date}': formatDate(regatta.date),
    '{location}': regatta.location || '',
    '{grade}': regatta.grade || '',
    '{expectedParticipants}': regatta.expectedParticipants || '50',
    '{supports}': (regatta.supports || []).join(', '),
    '{vhfChannel}': regatta.vhfChannels?.rond1 || '69',
    '{formLink}': 'https://docs.google.com/forms/d/187cx0pEQARNMDnMdrQj59z285LbnhQW9LYnsIgHRTTw/edit',
    '{organizerName}': 'Le Bureau'
  };
  
  Object.entries(replacements).forEach(([key, value]) => {
    subject = subject.replace(new RegExp(key, 'g'), value);
    body = body.replace(new RegExp(key, 'g'), value);
  });
  
  return { subject, body };
};

// ==================== COMPONENTS ====================
const TabNav = ({ active, setActive }) => {
  const tabs = [
    { id: 'dashboard', label: 'Accueil', icon: Calendar },
    { id: 'tasks', label: 'Planning', icon: Clock },
    { id: 'admin', label: 'Admin', icon: FileText },
    { id: 'volunteers', label: 'Bénévoles', icon: Users },
    { id: 'documents', label: 'Documents', icon: Printer },
    { id: 'mails', label: 'Mails', icon: Mail },
    { id: 'avis', label: 'Avis course', icon: Award },
    { id: 'settings', label: 'Config', icon: Settings }
  ];
  return (
    <nav className="bg-white shadow-sm border-b overflow-x-auto">
      <div className="flex gap-1 p-2">
        {tabs.map(t => {
          const I = t.icon;
          return (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${active === t.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              <I size={16}/>{t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Dashboard avec KPIs enrichis
const Dashboard = ({ regatta, tasks, completed, volunteers }) => {
  const progress = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
  const urgent = tasks.filter(t => ['urgent','overdue'].includes(getStatus(t, regatta.date, completed)));
  const days = getDaysUntil(regatta.date);
  
  const totalNeeded = VOLUNTEER_ROLES.reduce((s, r) => s + r.minPeople, 0);
  const assigned = volunteers.filter(v => v.role).length;
  const merVolunteers = volunteers.filter(v => VOLUNTEER_ROLES.find(r => r.id === v.role)?.location === 'mer').length;
  const terreVolunteers = volunteers.filter(v => VOLUNTEER_ROLES.find(r => r.id === v.role)?.location === 'terre').length;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="text-xs text-gray-500">Jours restants</div>
          <div className="text-2xl font-bold text-blue-600">{days ?? '-'}</div>
          <div className="text-xs text-gray-400">{formatDateShort(regatta.date)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="text-xs text-gray-500">Avancement</div>
          <div className="text-2xl font-bold text-green-600">{progress}%</div>
          <div className="text-xs text-gray-400">{completed.length}/{tasks.length} tâches</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <div className="text-xs text-gray-500">Urgentes</div>
          <div className="text-2xl font-bold text-orange-600">{urgent.length}</div>
          <div className="text-xs text-gray-400">à traiter</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
          <div className="text-xs text-gray-500">Bénévoles</div>
          <div className="text-2xl font-bold text-purple-600">{assigned}/{totalNeeded}</div>
          <div className="text-xs text-gray-400">🌊 {merVolunteers} | 🏖️ {terreVolunteers}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="text-sm font-medium mb-2">Progression globale</div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all" style={{width:`${progress}%`}}/>
        </div>
      </div>

      {/* Alertes urgentes */}
      {urgent.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-800 font-medium text-sm mb-2">
            <AlertCircle size={16}/>Tâches urgentes
          </div>
          <div className="space-y-1.5">
            {urgent.slice(0, 5).map(t => (
              <div key={t.id} className="flex justify-between items-center bg-white rounded p-2 text-sm">
                <span>{t.title}</span>
                <span className="text-red-600 text-xs font-medium">
                  {(() => {
                    const d = getDaysUntil(calcDeadline(regatta.date, t.daysBeforeEvent));
                    return d < 0 ? `${-d}j retard` : `J-${t.daysBeforeEvent}`;
                  })()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liens rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <a href="https://www.premar-atlantique.gouv.fr/uploads/ckeditor_storage/atlantique/01%20DMN%20fa%C3%A7ade%20Atlantique%202019.pdf" 
          target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-blue-600 font-medium text-sm mb-1">
            <FileText size={18}/>Déclaration DDTM<ExternalLink size={12}/>
          </div>
          <p className="text-xs text-gray-500">Formulaire manifestation nautique</p>
        </a>
        <a href="https://data.shom.fr/#001=eyJjIjpbLTUxNzAxNS41ODE0Mjc0Njc2LDYxNjEzNjguNjg1NzQ3Nl0sInoiOjEzLjMzMzUyMzUwNTE2OTczMSwiciI6MCwibCI6W3sidHlwZSI6IklOVEVSTkFMX0xBWUVSIiwiaWRlbnRpZmllciI6IlJBU1RFUl9NQVJJTkVfMzg1N19XTVRTIiwib3BhY2l0eSI6MSwidmlzaWJpbGl0eSI6dHJ1ZX0seyJ0eXBlIjoiSU5URVJOQUxfTEFZRVIiLCJpZGVudGlmaWVyIjoiRkRDX0dFQkNPX1BZUi1QTkdfMzg1N19XTVRTIiwib3BhY2l0eSI6MSwidmlzaWJpbGl0eSI6dHJ1ZX1dfQ==" 
          target="_blank" rel="noopener noreferrer" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-cyan-600 font-medium text-sm mb-1">
            <MapPin size={18}/>Carte SHOM<ExternalLink size={12}/>
          </div>
          <p className="text-xs text-gray-500">Zone de course Anse de Bertheaume</p>
        </a>
        <a href="https://arbitrage.ffvoile.fr/regles-et-documents/ac-ic-annexes-types/" target="_blank" rel="noopener noreferrer"
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-green-600 font-medium text-sm mb-1">
            <Award size={18}/>Documents FFVoile<ExternalLink size={12}/>
          </div>
          <p className="text-xs text-gray-500">AC, IC, Fiche Course RIR</p>
        </a>
        <a href="https://docs.google.com/forms/d/1XRVowqJk8F7EPYKIxsQs7fTmUYHv-2OX0ZykQg7MAAs/edit" target="_blank" rel="noopener noreferrer"
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-orange-600 font-medium text-sm mb-1">
            <ClipboardList size={18}/>Pré-inscriptions<ExternalLink size={12}/>
          </div>
          <p className="text-xs text-gray-500">Formulaire coureurs</p>
        </a>
        <a href="https://docs.google.com/forms/d/187cx0pEQARNMDnMdrQj59z285LbnhQW9LYnsIgHRTTw/edit" target="_blank" rel="noopener noreferrer"
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-purple-600 font-medium text-sm mb-1">
            <Users size={18}/>Inscription bénévoles<ExternalLink size={12}/>
          </div>
          <p className="text-xs text-gray-500">Formulaire Google</p>
        </a>
        <a href="https://arbitrage.ffvoile.fr/logiciel-de-classement/" target="_blank" rel="noopener noreferrer"
          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm mb-1">
            <Award size={18}/>SCORE FFVoile<ExternalLink size={12}/>
          </div>
          <p className="text-xs text-gray-500">Logiciel résultats</p>
        </a>
      </div>

      {/* Infos régate */}
      {regatta.name && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Anchor className="text-blue-600" size={20}/>
            <span className="font-semibold">{regatta.name}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-gray-500">Date:</span> {formatDate(regatta.date)}</div>
            <div><span className="text-gray-500">Lieu:</span> {regatta.location}</div>
            <div><span className="text-gray-500">Grade:</span> {regatta.grade}</div>
            <div><span className="text-gray-500">Supports:</span> {regatta.supports?.length || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Panel Tâches
const TasksPanel = ({ regatta, tasks, completed, setCompleted }) => {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(TASK_CATEGORIES.map(c => c.id));
  
  const toggle = (id) => setCompleted(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleCat = (id) => setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    const s = getStatus(t, regatta.date, completed);
    return filter === 'pending' ? s !== 'completed' : filter === 'completed' ? s === 'completed' : ['urgent','overdue'].includes(s);
  });

  const grouped = TASK_CATEGORIES.map(c => ({...c, tasks: filtered.filter(t => t.category === c.id)})).filter(g => g.tasks.length);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-3 shadow-sm flex flex-wrap gap-2">
        {['all','pending','urgent','completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            {f === 'all' ? 'Toutes' : f === 'pending' ? 'À faire' : f === 'urgent' ? 'Urgentes' : 'Faites'}
          </button>
        ))}
      </div>

      {grouped.map(g => {
        const I = g.icon;
        const exp = expanded.includes(g.id);
        const done = g.tasks.filter(t => completed.includes(t.id)).length;
        return (
          <div key={g.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button onClick={() => toggleCat(g.id)} className="w-full flex items-center justify-between p-3 hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor:`${g.color}20`}}>
                  <I size={16} style={{color:g.color}}/>
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{g.name}</div>
                  <div className="text-xs text-gray-500">{done}/{g.tasks.length}</div>
                </div>
              </div>
              {exp ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
            </button>
            {exp && (
              <div className="border-t divide-y">
                {g.tasks.map(t => {
                  const st = getStatus(t, regatta.date, completed);
                  const dl = calcDeadline(regatta.date, t.daysBeforeEvent);
                  const d = getDaysUntil(dl);
                  return (
                    <div key={t.id} className={`p-3 flex items-start gap-3 ${st === 'completed' ? 'bg-gray-50' : ''}`}>
                      <button onClick={() => toggle(t.id)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${st === 'completed' ? 'bg-green-500 border-green-500 text-white' : st === 'overdue' ? 'border-red-500' : st === 'urgent' ? 'border-orange-500' : 'border-gray-300'}`}>
                        {st === 'completed' && <CheckCircle size={12}/>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${st === 'completed' ? 'text-gray-400 line-through' : ''}`}>
                          {t.title}{t.required && <span className="text-red-500 ml-1">*</span>}
                          {t.link && <a href={t.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500"><ExternalLink size={12} className="inline"/></a>}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{t.description}</div>
                      </div>
                      <div className="text-right text-xs shrink-0">
                        <div className={st === 'overdue' ? 'text-red-600 font-medium' : st === 'urgent' ? 'text-orange-600 font-medium' : st === 'completed' ? 'text-green-600' : 'text-gray-600'}>
                          {st === 'completed' ? '✓' : `J-${t.daysBeforeEvent}`}
                        </div>
                        <div className="text-gray-400">{formatDateShort(dl)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Panel Admin enrichi
const AdminPanel = ({ regatta, docs, setDocs }) => {
  const update = (id, f, v) => setDocs(p => p.map(d => d.id === id ? {...d, [f]: v} : d));
  
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="font-medium text-blue-800 text-sm mb-2">📋 Délais réglementaires</div>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• <strong>Maritime (AffMar)</strong> : 15 jours avant</p>
          <p>• <strong>Plans d'eau intérieurs</strong> : 2 mois (préfecture/VNF)</p>
          <p>• <strong>Mairie</strong> : 2 mois avant</p>
          <p>• <strong>FFVoile</strong> : 1 mois (club) / 2 mois (plan d'eau intérieur)</p>
        </div>
      </div>

      {/* Liens utiles */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="font-medium text-sm mb-3">🔗 Ressources</div>
        <div className="grid grid-cols-2 gap-2">
          <a href="https://www.premar-atlantique.gouv.fr/uploads/ckeditor_storage/atlantique/01%20DMN%20fa%C3%A7ade%20Atlantique%202019.pdf" 
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm text-blue-700 hover:bg-blue-100">
            <FileText size={16}/>Formulaire DDTM<ExternalLink size={12}/>
          </a>
          <a href="https://data.shom.fr/#001=eyJjIjpbLTUxNzAxNS41ODE0Mjc0Njc2LDYxNjEzNjguNjg1NzQ3Nl0sInoiOjEzLjMzMzUyMzUwNTE2OTczMSwiciI6MCwibCI6W3sidHlwZSI6IklOVEVSTkFMX0xBWUVSIiwiaWRlbnRpZmllciI6IlJBU1RFUl9NQVJJTkVfMzg1N19XTVRTIiwib3BhY2l0eSI6MSwidmlzaWJpbGl0eSI6dHJ1ZX0seyJ0eXBlIjoiSU5URVJOQUxfTEFZRVIiLCJpZGVudGlmaWVyIjoiRkRDX0dFQkNPX1BZUi1QTkdfMzg1N19XTVRTIiwib3BhY2l0eSI6MSwidmlzaWJpbGl0eSI6dHJ1ZX1dfQ==" 
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-cyan-50 rounded text-sm text-cyan-700 hover:bg-cyan-100">
            <MapPin size={16}/>Carte SHOM<ExternalLink size={12}/>
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-3 border-b font-medium text-sm">Documents administratifs</div>
        <div className="divide-y">
          {docs.map(d => {
            const dl = calcDeadline(regatta.date, d.deadline);
            const days = getDaysUntil(dl);
            const docInfo = ADMIN_DOCS.find(ad => ad.id === d.id);
            return (
              <div key={d.id} className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{d.name}</span>
                    {d.required && <span className="text-xs bg-red-100 text-red-600 px-1.5 rounded">Oblig.</span>}
                    {docInfo?.link && (
                      <a href={docInfo.link} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        <ExternalLink size={14}/>
                      </a>
                    )}
                  </div>
                  <span className={`text-xs ${d.status === 'done' ? 'text-green-600' : days && days < 7 ? 'text-red-600' : 'text-gray-500'}`}>
                    {d.status === 'done' ? '✓ Fait' : `J-${d.deadline}`}
                  </span>
                </div>
                
                {/* Pièces jointes requises */}
                {docInfo?.piecesJointes && (
                  <div className="mb-2 text-xs text-gray-500">
                    <span className="font-medium">PJ requises :</span> {docInfo.piecesJointes.join(', ')}
                  </div>
                )}
                
                <select value={d.status || 'pending'} onChange={e => update(d.id, 'status', e.target.value)}
                  className="w-full px-2 py-1.5 border rounded text-xs">
                  <option value="pending">À faire</option>
                  <option value="inProgress">En cours</option>
                  <option value="done">Terminé</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rappel DDTM */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="font-medium text-amber-800 text-sm mb-2">⚠️ Rappel DDTM</div>
        <div className="text-xs text-amber-700 space-y-1">
          <p>Le <strong>plan de la manifestation</strong> est <strong>obligatoire</strong> pour toute demande.</p>
          <p>À joindre également :</p>
          <ul className="list-disc list-inside ml-2">
            <li>Zone de course (capture carte SHOM)</li>
            <li>Attestation d'assurance RC</li>
            <li>Liste des bateaux de sécurité</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="font-medium text-sm mb-3">📞 Contacts administratifs</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">
            <strong>Mairie Animation</strong><br/>
            <a href="mailto:animation@plougonvelin.fr" className="text-blue-600">animation@plougonvelin.fr</a>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <strong>Police municipale</strong><br/>
            <a href="mailto:police@plougonvelin.fr" className="text-blue-600">police@plougonvelin.fr</a>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <strong>Ouest France</strong><br/>
            <a href="mailto:gery.baldenweck@orange.fr" className="text-blue-600">gery.baldenweck@orange.fr</a>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <strong>Le Télégramme</strong><br/>
            <a href="mailto:cessoumich@gmail.com" className="text-blue-600">cessoumich@gmail.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Panel Bénévoles enrichi
const VolunteersPanel = ({ volunteers, setVolunteers, regatta }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [newV, setNewV] = useState({ name:'', firstName:'', email:'', phone:'', role:'', permisB: false, panierRepas: 'oui', dietaryRestriction: '' });
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'byRole' | 'byLocation'
  const [importData, setImportData] = useState('');
  const [jsonbinConfig, setJsonbinConfig] = useState({ binId: '', apiKey: '' });
  const [syncStatus, setSyncStatus] = useState('');
  const [syncMode, setSyncMode] = useState('manual'); // 'manual' | 'jsonbin'

  const add = () => { 
    if(newV.name) { 
      setVolunteers(p => [...p, {...newV, id: Date.now()}]); 
      setNewV({ name:'', firstName:'', email:'', phone:'', role:'', permisB: false, panierRepas: 'oui', dietaryRestriction: '' }); 
      setShowAdd(false); 
    }
  };
  const remove = id => setVolunteers(p => p.filter(v => v.id !== id));
  const upd = (id, f, v) => setVolunteers(p => p.map(x => x.id === id ? {...x, [f]: v} : x));

  // Import depuis CSV (copié depuis Google Sheets)
  const importFromCSV = () => {
    if (!importData.trim()) return;
    const lines = importData.trim().split('\n');
    const newVolunteers = [];
    lines.forEach((line, idx) => {
      if (idx === 0 && line.toLowerCase().includes('horodateur')) return; // Skip header
      const cols = line.split('\t');
      if (cols.length >= 2) {
        newVolunteers.push({
          id: Date.now() + idx,
          name: cols[1] || '',
          firstName: cols[2] || '',
          email: cols[3] || '',
          phone: cols[4] || '',
          role: '',
          permisB: cols[5]?.toLowerCase().includes('oui'),
          panierRepas: cols[6]?.toLowerCase().includes('veggie') ? 'veggie' : cols[6]?.toLowerCase().includes('non') ? 'non' : 'oui'
        });
      }
    });
    if (newVolunteers.length > 0) {
      setVolunteers(p => [...p, ...newVolunteers]);
      setImportData('');
      setSyncStatus(`✅ ${newVolunteers.length} bénévole(s) importé(s) !`);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  // Synchronisation avec JSONbin
  const syncFromJSONbin = async () => {
    if (!jsonbinConfig.binId || !jsonbinConfig.apiKey) {
      setSyncStatus('❌ Configurez d\'abord le Bin ID et l\'API Key');
      return;
    }
    
    setSyncStatus('🔄 Synchronisation en cours...');
    
    try {
      const response = await fetch(`https://api.jsonbin.io/v3/b/${jsonbinConfig.binId}/latest`, {
        headers: { 'X-Master-Key': jsonbinConfig.apiKey }
      });
      
      if (!response.ok) throw new Error('Erreur ' + response.status);
      
      const data = await response.json();
      const remoteVolunteers = data.record || [];
      
      // Fusionner avec les bénévoles existants (éviter les doublons par ID)
      const existingIds = new Set(volunteers.map(v => v.id));
      const newOnes = remoteVolunteers.filter(v => !existingIds.has(v.id));
      
      if (newOnes.length > 0) {
        setVolunteers(p => [...p, ...newOnes]);
        setSyncStatus(`✅ ${newOnes.length} nouveau(x) bénévole(s) synchronisé(s) !`);
      } else {
        setSyncStatus('✓ Déjà à jour');
      }
      
      // Sauvegarder la config
      localStorage.setItem('jsonbinConfig', JSON.stringify(jsonbinConfig));
      
    } catch (error) {
      setSyncStatus('❌ Erreur: ' + error.message);
    }
    
    setTimeout(() => setSyncStatus(''), 5000);
  };

  // Charger la config JSONbin sauvegardée
  useEffect(() => {
    const saved = localStorage.getItem('jsonbinConfig');
    if (saved) {
      try {
        setJsonbinConfig(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const byRole = VOLUNTEER_ROLES.map(r => ({...r, vols: volunteers.filter(v => v.role === r.id)}));
  const merRoles = byRole.filter(r => r.location === 'mer');
  const terreRoles = byRole.filter(r => r.location === 'terre');

  const totalNeeded = VOLUNTEER_ROLES.reduce((s, r) => s + r.minPeople, 0);
  const totalAssigned = volunteers.filter(v => v.role).length;

  return (
    <div className="space-y-4">
      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-600">{volunteers.length}</div>
          <div className="text-xs text-gray-500">Total inscrits</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <div className="text-2xl font-bold text-green-600">{totalAssigned}</div>
          <div className="text-xs text-gray-500">Assignés</div>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <div className={`text-2xl font-bold ${totalAssigned >= totalNeeded ? 'text-green-600' : 'text-orange-600'}`}>
            {totalNeeded - totalAssigned}
          </div>
          <div className="text-xs text-gray-500">Manquants</div>
        </div>
      </div>

      {/* Bouton Sync Google Forms */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium text-purple-800 text-sm mb-1">🔗 Synchroniser avec Google Forms</div>
            <p className="text-xs text-purple-600">Importez les bénévoles depuis votre formulaire</p>
          </div>
          <button onClick={() => setShowSync(!showSync)} 
            className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm">
            {showSync ? 'Fermer' : 'Configurer'}
          </button>
        </div>
        
        {syncStatus && (
          <div className={`mt-2 p-2 rounded text-sm ${syncStatus.includes('✅') || syncStatus.includes('✓') ? 'bg-green-100 text-green-700' : syncStatus.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            {syncStatus}
          </div>
        )}
        
        {showSync && (
          <div className="mt-4 space-y-4">
            {/* Onglets de méthode */}
            <div className="flex gap-2">
              <button onClick={() => setSyncMode('manual')}
                className={`flex-1 py-2 rounded text-sm ${syncMode === 'manual' ? 'bg-purple-600 text-white' : 'bg-white border'}`}>
                📋 Import manuel
              </button>
              <button onClick={() => setSyncMode('jsonbin')}
                className={`flex-1 py-2 rounded text-sm ${syncMode === 'jsonbin' ? 'bg-purple-600 text-white' : 'bg-white border'}`}>
                🔄 Auto (JSONbin)
              </button>
            </div>

            {/* Import manuel */}
            {syncMode === 'manual' && (
              <div className="space-y-3">
                <div className="bg-white rounded p-3 text-xs">
                  <div className="font-medium mb-2">📋 Comment importer :</div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Ouvrez les <a href="https://docs.google.com/forms/d/187cx0pEQARNMDnMdrQj59z285LbnhQW9LYnsIgHRTTw/edit#responses" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">réponses du formulaire</a></li>
                    <li>Cliquez sur l'icône Google Sheets</li>
                    <li>Sélectionnez et copiez les lignes de données</li>
                    <li>Collez ci-dessous</li>
                  </ol>
                </div>
                <textarea 
                  value={importData}
                  onChange={e => setImportData(e.target.value)}
                  placeholder="Collez ici les données copiées depuis Google Sheets..."
                  className="w-full h-24 px-3 py-2 border rounded text-sm font-mono"
                />
                <button onClick={importFromCSV} className="w-full py-2 bg-green-600 text-white rounded text-sm">
                  Importer
                </button>
              </div>
            )}

            {/* Sync automatique JSONbin */}
            {syncMode === 'jsonbin' && (
              <div className="space-y-3">
                <div className="bg-white rounded p-3 text-xs">
                  <div className="font-medium mb-2">🤖 Synchronisation automatique :</div>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    <li>Créez un compte sur <a href="https://jsonbin.io" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">jsonbin.io</a> (gratuit)</li>
                    <li>Créez un nouveau Bin avec <code className="bg-gray-100 px-1">[]</code> comme contenu</li>
                    <li>Copiez le Bin ID et l'API Key ci-dessous</li>
                    <li>Installez le script Apps Script dans votre Google Form</li>
                  </ol>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    value={jsonbinConfig.binId}
                    onChange={e => setJsonbinConfig(p => ({...p, binId: e.target.value}))}
                    placeholder="Bin ID"
                    className="px-3 py-2 border rounded text-sm"
                  />
                  <input 
                    value={jsonbinConfig.apiKey}
                    onChange={e => setJsonbinConfig(p => ({...p, apiKey: e.target.value}))}
                    placeholder="API Key (X-Master-Key)"
                    type="password"
                    className="px-3 py-2 border rounded text-sm"
                  />
                </div>
                
                <button onClick={syncFromJSONbin} className="w-full py-2 bg-blue-600 text-white rounded text-sm flex items-center justify-center gap-2">
                  🔄 Synchroniser maintenant
                </button>
                
                <div className="bg-amber-50 border border-amber-200 rounded p-3">
                  <div className="font-medium text-amber-800 text-xs mb-1">📜 Script Apps Script</div>
                  <p className="text-xs text-amber-700 mb-2">
                    Téléchargez et installez le script dans votre Google Form pour activer la synchronisation automatique.
                  </p>
                  <a href="#" onClick={(e) => {
                    e.preventDefault();
                    const script = `Voir le fichier AppsScript_Benevoles_Sync.js`;
                    alert('Téléchargez le fichier AppsScript_Benevoles_Sync.js depuis les fichiers de l\'application');
                  }} className="text-xs text-amber-800 underline">
                    Voir les instructions complètes
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Onglets de vue */}
      <div className="bg-white rounded-xl p-2 shadow-sm flex gap-2">
        {[{id:'list', label:'Liste'}, {id:'byRole', label:'Par poste'}, {id:'byLocation', label:'Mer/Terre'}].map(v => (
          <button key={v.id} onClick={() => setViewMode(v.id)}
            className={`flex-1 px-3 py-1.5 rounded text-sm ${viewMode === v.id ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-sm">Bénévoles ({volunteers.length})</span>
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm">
              <Plus size={14}/>Ajouter
            </button>
          </div>

          {showAdd && (
            <div className="bg-gray-50 rounded p-3 mb-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={newV.name} onChange={e => setNewV(p=>({...p,name:e.target.value}))} placeholder="Nom *" className="px-2 py-1.5 border rounded text-sm"/>
                <input value={newV.firstName} onChange={e => setNewV(p=>({...p,firstName:e.target.value}))} placeholder="Prénom" className="px-2 py-1.5 border rounded text-sm"/>
                <input value={newV.email} onChange={e => setNewV(p=>({...p,email:e.target.value}))} placeholder="Email" className="px-2 py-1.5 border rounded text-sm"/>
                <input value={newV.phone} onChange={e => setNewV(p=>({...p,phone:e.target.value}))} placeholder="Téléphone" className="px-2 py-1.5 border rounded text-sm"/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={newV.role} onChange={e => setNewV(p=>({...p,role:e.target.value}))} className="px-2 py-1.5 border rounded text-sm">
                  <option value="">Poste...</option>
                  <optgroup label="🏖️ Terre">
                    {VOLUNTEER_ROLES.filter(r => r.location === 'terre').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </optgroup>
                  <optgroup label="🌊 Mer">
                    {VOLUNTEER_ROLES.filter(r => r.location === 'mer').map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </optgroup>
                </select>
                <select value={newV.panierRepas} onChange={e => setNewV(p=>({...p,panierRepas:e.target.value}))} className="px-2 py-1.5 border rounded text-sm">
                  <option value="oui">Panier repas: Oui</option>
                  <option value="veggie">Panier repas: Veggie</option>
                  <option value="non">Panier repas: Non</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newV.permisB} onChange={e => setNewV(p=>({...p,permisB:e.target.checked}))}/>
                  Permis bateau
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={()=>setShowAdd(false)} className="px-3 py-1 text-sm text-gray-600">Annuler</button>
                <button onClick={add} className="px-3 py-1 bg-green-600 text-white rounded text-sm">OK</button>
              </div>
            </div>
          )}

          <div className="divide-y max-h-96 overflow-y-auto">
            {!volunteers.length ? <p className="text-gray-500 text-center py-6 text-sm">Aucun bénévole</p> :
              volunteers.map(v => {
                const role = VOLUNTEER_ROLES.find(r => r.id === v.role);
                return (
                  <div key={v.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${role?.location === 'mer' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                        {(v.firstName || v.name)[0]}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{v.firstName} {v.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          {v.phone && <span><Phone size={10} className="inline"/> {v.phone}</span>}
                          {v.permisB && <span className="text-blue-500">🚤</span>}
                          {v.panierRepas === 'veggie' && <span>🥬</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={v.role||''} onChange={e => upd(v.id,'role',e.target.value)} className="px-2 py-1 border rounded text-xs max-w-32">
                        <option value="">Non assigné</option>
                        {VOLUNTEER_ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <button onClick={()=>remove(v.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      )}

      {/* Vue par poste */}
      {viewMode === 'byRole' && (
        <div className="space-y-3">
          {byRole.map(r => (
            <div key={r.id} className={`bg-white rounded-xl shadow-sm p-3 border-l-4 ${r.location === 'mer' ? 'border-blue-500' : 'border-green-500'}`}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-medium text-sm">{r.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({r.timeSlot})</span>
                </div>
                <span className={`text-sm font-medium ${r.vols.length >= r.minPeople ? 'text-green-600' : 'text-orange-600'}`}>
                  {r.vols.length}/{r.minPeople}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.vols.map(v => (
                  <span key={v.id} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    {v.firstName || v.name}
                    {v.permisB && <span className="text-blue-500">🚤</span>}
                  </span>
                ))}
                {r.vols.length < r.minPeople && Array(r.minPeople - r.vols.length).fill(0).map((_, i) => (
                  <span key={`empty-${i}`} className="border-dashed border px-2 py-0.5 rounded-full text-xs text-gray-400">+1</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue Mer/Terre */}
      {viewMode === 'byLocation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="font-medium text-blue-800 mb-3 flex items-center gap-2">
              <Ship size={18}/>Équipe Mer ({merRoles.reduce((s,r) => s + r.vols.length, 0)})
            </div>
            <div className="space-y-2">
              {merRoles.map(r => (
                <div key={r.id} className="bg-white rounded p-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{r.name}</span>
                    <span className={r.vols.length >= r.minPeople ? 'text-green-600' : 'text-orange-600'}>
                      {r.vols.length}/{r.minPeople}
                    </span>
                  </div>
                  {r.vols.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {r.vols.map(v => `${v.firstName || ''} ${v.name}`).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="font-medium text-green-800 mb-3 flex items-center gap-2">
              <MapPin size={18}/>Équipe Terre ({terreRoles.reduce((s,r) => s + r.vols.length, 0)})
            </div>
            <div className="space-y-2">
              {terreRoles.map(r => (
                <div key={r.id} className="bg-white rounded p-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{r.name}</span>
                    <span className={r.vols.length >= r.minPeople ? 'text-green-600' : 'text-orange-600'}>
                      {r.vols.length}/{r.minPeople}
                    </span>
                  </div>
                  {r.vols.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {r.vols.map(v => `${v.firstName || ''} ${v.name}`).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Panel Documents (Numéros utiles, Émargement, Parcours)
const DocumentsPanel = ({ regatta, volunteers }) => {
  const [activeDoc, setActiveDoc] = useState('numeros');

  // Générer les numéros utiles dynamiquement
  const generateNumerosUtiles = () => {
    const assignedVolunteers = volunteers.filter(v => v.role && v.phone);
    const byRole = {};
    assignedVolunteers.forEach(v => {
      if (!byRole[v.role]) byRole[v.role] = [];
      byRole[v.role].push(v);
    });
    return byRole;
  };

  const numerosUtiles = generateNumerosUtiles();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-2 shadow-sm flex gap-2 flex-wrap">
        {[
          {id:'numeros', label:'📞 Numéros utiles'},
          {id:'emargement', label:'✍️ Émargement'},
          {id:'parcours', label:'🗺️ Parcours'}
        ].map(d => (
          <button key={d.id} onClick={() => setActiveDoc(d.id)}
            className={`px-3 py-1.5 rounded text-sm ${activeDoc === d.id ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
            {d.label}
          </button>
        ))}
      </div>

      {/* Numéros utiles */}
      {activeDoc === 'numeros' && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Numéros utiles</h3>
            <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded text-sm">
              <Printer size={14}/>Imprimer
            </button>
          </div>

          {/* Urgences */}
          <div className="mb-4">
            <div className="text-sm font-medium text-red-600 mb-2">🚨 URGENCES</div>
            <div className="grid grid-cols-2 gap-2">
              {EMERGENCY_CONTACTS.map(c => (
                <div key={c.name} className="bg-red-50 p-2 rounded text-sm">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-600">{c.role}</div>
                  <div className="text-red-600 font-medium">{c.phone}</div>
                  {c.vhf && <div className="text-xs">VHF: canal {c.vhf}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* VHF */}
          <div className="mb-4 bg-blue-50 p-3 rounded">
            <div className="text-sm font-medium mb-2">📻 Canaux VHF</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Rond 1 (PAV/Opti): <strong>Canal {regatta.vhfChannels?.rond1 || '69'}</strong></div>
              <div>Rond 2 (Cata/Dér): <strong>Canal {regatta.vhfChannels?.rond2 || '72'}</strong></div>
            </div>
          </div>

          {/* Bénévoles par rôle */}
          <div>
            <div className="text-sm font-medium mb-2">👥 Équipe</div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(numerosUtiles).map(([roleId, vols]) => {
                const role = VOLUNTEER_ROLES.find(r => r.id === roleId);
                return (
                  <div key={roleId} className="border rounded p-2">
                    <div className="text-xs font-medium text-gray-600 mb-1">{role?.name}</div>
                    {vols.map(v => (
                      <div key={v.id} className="flex justify-between text-sm">
                        <span>{v.firstName} {v.name}</span>
                        <span className="text-blue-600">{v.phone}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
              {Object.keys(numerosUtiles).length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">Ajoutez des bénévoles avec numéro de téléphone</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Émargement */}
      {activeDoc === 'emargement' && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Feuille d'émargement bénévoles</h3>
            <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded text-sm">
              <Printer size={14}/>Imprimer
            </button>
          </div>
          <div className="text-sm text-gray-600 mb-4">Régate du {formatDate(regatta.date)}</div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Nom</th>
                  <th className="border p-2 text-left">Prénom</th>
                  <th className="border p-2 text-left">Poste</th>
                  <th className="border p-2 text-left w-32">Signature</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(v => {
                  const role = VOLUNTEER_ROLES.find(r => r.id === v.role);
                  return (
                    <tr key={v.id}>
                      <td className="border p-2">{v.name}</td>
                      <td className="border p-2">{v.firstName}</td>
                      <td className="border p-2 text-xs">{role?.name || '-'}</td>
                      <td className="border p-2"></td>
                    </tr>
                  );
                })}
                {/* Lignes vides pour inscription sur place */}
                {Array(Math.max(0, 10 - volunteers.length)).fill(0).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="border p-2 h-8"></td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Parcours */}
      {activeDoc === 'parcours' && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-4">Schémas des parcours</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rond 1 */}
            <div className="border rounded-xl p-4">
              <div className="bg-blue-100 rounded p-2 mb-3">
                <div className="font-medium">Rond 1 : PAV (T293 & RCB) et Optimist</div>
                <div className="text-sm">📻 VHF Canal {regatta.vhfChannels?.rond1 || '69'}</div>
              </div>
              <div className="text-sm space-y-1 mb-3">
                <p><span className="inline-block w-4 h-4 bg-yellow-400 rounded-full mr-2"></span>Bouée départ : cylindrique jaune</p>
                <p><span className="inline-block w-4 h-4 bg-orange-500 rounded-full mr-2"></span>Bouée 1 : conique orange</p>
                <p><span className="inline-block w-4 h-4 bg-white border rounded-full mr-2"></span>Bouées 2, 3, 4 : cylindrique blanche</p>
                <p><span className="inline-block w-4 h-4 bg-yellow-300 rounded mr-2"></span>Bouée arrivée : frite jaune</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-sm">
                <div><strong>EXT :</strong> Départ – 1 – 2 – 3 – 2 – 3 – Arrivée</div>
                <div><strong>INT :</strong> Départ – 1 – 4 – 1 – 2 – 3 – Arrivée</div>
                <div><strong>R :</strong> Départ – 1 – 2 – 3 – Arrivée</div>
              </div>
            </div>

            {/* Rond 2 */}
            <div className="border rounded-xl p-4">
              <div className="bg-green-100 rounded p-2 mb-3">
                <div className="font-medium">Rond 2 : INC, IND, OpenSkiff</div>
                <div className="text-sm">📻 VHF Canal {regatta.vhfChannels?.rond2 || '72'}</div>
              </div>
              <div className="text-sm space-y-1 mb-3">
                <p><span className="inline-block w-4 h-4 bg-yellow-400 rounded-full mr-2"></span>Bouée départ : cylindrique jaune</p>
                <p><span className="inline-block w-4 h-4 bg-yellow-500 rounded-full mr-2"></span>Bouée 1 : cylindrique jaune BP</p>
                <p><span className="inline-block w-4 h-4 bg-white border rounded-full mr-2"></span>Bouée 2 : cylindrique blanche BP</p>
                <p><span className="inline-block w-4 h-4 bg-orange-400 rounded-full mr-2"></span>Bouée 3 : cylindrique orange BP</p>
                <p><span className="inline-block w-4 h-4 bg-orange-500 rounded mr-2"></span>Bouée 4 : conique orange</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-sm">
                <div><strong>EXT :</strong> Départ – 1 – 2 – 3 – 2 – 3 – Arrivée</div>
                <div><strong>INT :</strong> Départ – 1 – 4 – 1 – 2 – 3 – Arrivée</div>
                <div><strong>R :</strong> Départ – 1 – 2 – 3 – Arrivée</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Panel Mails
const MailsPanel = ({ regatta, volunteers }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('benevoles_invitation');
  const [mailContent, setMailContent] = useState({ subject: '', body: '' });

  useEffect(() => {
    setMailContent(generateMailContent(selectedTemplate, regatta, volunteers));
  }, [selectedTemplate, regatta, volunteers]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copié !');
  };

  const templates = [
    { id: 'benevoles_invitation', label: '📢 Appel bénévoles', icon: Users },
    { id: 'benevoles_organisation', label: '📋 Organisation bénévoles', icon: ClipboardList },
    { id: 'mairie', label: '🏛️ Déclaration mairie', icon: FileText },
    { id: 'ddtm', label: '⚓ Déclaration DDTM', icon: Anchor },
    { id: 'npi', label: '🚤 Demande matériel NPI', icon: Ship },
    { id: 'debit_boissons', label: '🍺 Débit boissons', icon: FileText },
    { id: 'fiche_securite', label: '🛡️ Fiche sécurité', icon: AlertCircle },
    { id: 'presse', label: '📰 Article presse', icon: Mail }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="font-medium text-sm mb-3">Modèles de mails</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {templates.map(t => {
            const I = t.icon;
            return (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                className={`p-2 rounded-lg text-left text-sm flex items-center gap-2 ${selectedTemplate === t.id ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <I size={16}/>{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="font-medium text-sm">Contenu du mail</div>
          <div className="flex gap-2">
            <button onClick={() => copyToClipboard(mailContent.subject + '\n\n' + mailContent.body)} 
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm">
              <Copy size={14}/>Copier tout
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Objet</label>
            <div className="flex gap-2">
              <input value={mailContent.subject} onChange={e => setMailContent(p => ({...p, subject: e.target.value}))}
                className="flex-1 px-3 py-2 border rounded text-sm"/>
              <button onClick={() => copyToClipboard(mailContent.subject)} className="px-2 py-1 bg-gray-100 rounded">
                <Copy size={14}/>
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Corps du message</label>
            <div className="relative">
              <textarea value={mailContent.body} onChange={e => setMailContent(p => ({...p, body: e.target.value}))}
                className="w-full px-3 py-2 border rounded text-sm h-64 font-mono"/>
              <button onClick={() => copyToClipboard(mailContent.body)} 
                className="absolute top-2 right-2 px-2 py-1 bg-gray-100 rounded">
                <Copy size={14}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
        <div className="font-medium text-yellow-800 mb-2">💡 Conseil</div>
        <p className="text-yellow-700">
          Personnalisez le mail avant envoi. N'oubliez pas de joindre les documents nécessaires selon le type de mail (plan, attestation assurance, etc.).
        </p>
      </div>
    </div>
  );
};

// Panel Avis de course avec Fiche Course RIR
const AvisPanel = ({ regatta }) => {
  const isRIR = regatta.grade === '5C' || regatta.grade === '5B';
  
  return (
    <div className="space-y-4">
      {/* Alerte RIR pour grades 5C/5B */}
      {isRIR && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="font-medium text-amber-800 text-sm mb-2">⚠️ Régates 5C et 5B : Règlement Intérieur de Régate (RIR)</div>
          <p className="text-xs text-amber-700 mb-3">
            Les régates de grade 5C et 5B appliquent les <strong>RIR</strong>. Utilisez une <strong>Fiche Course</strong> à la place des Instructions de Course (IC).
          </p>
          <a href="https://arbitrage.ffvoile.fr/regles-et-documents/ac-ic-annexes-types/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded text-xs w-fit">
            <Download size={12}/>Modèle Fiche Course RIR
          </a>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="font-medium text-blue-800 text-sm mb-2">📋 Modèles officiels FFVoile 2025</div>
        <p className="text-xs text-blue-700 mb-3">
          {isRIR 
            ? "Pour votre régate " + regatta.grade + ", utilisez l'AC simplifié + Fiche Course (pas d'IC)."
            : "Pour régates 5A et supérieures, utilisez AC complet + IC types."
          }
        </p>
        <div className="flex flex-wrap gap-2">
          <a href="https://arbitrage.ffvoile.fr/media/33pc1eic/2025_ac-type-voile-légère-simplifié-5c-5b-sept-25.docx" target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${isRIR ? 'bg-blue-600 text-white' : 'bg-white border border-blue-600 text-blue-600'}`}>
            <Download size={12}/>AC simplifié 5C/5B
          </a>
          <a href="https://arbitrage.ffvoile.fr/media/ywld0ayh/2025_ac-type-voile-legere-def-sept-25-forme-texte.docx" target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs ${!isRIR ? 'bg-blue-600 text-white' : 'bg-white border border-blue-600 text-blue-600'}`}>
            <Download size={12}/>AC complet
          </a>
          {!isRIR && (
            <a href="https://arbitrage.ffvoile.fr/media/xiajwvrh/ic-types-vl-avec-champs-25-28-mars-25-def.docx" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-600 text-blue-600 rounded text-xs">
              <Download size={12}/>IC types
            </a>
          )}
        </div>
      </div>

      {/* Structure Fiche Course pour RIR */}
      {isRIR && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="font-medium text-sm mb-3">📄 Structure Fiche Course RIR</div>
          <div className="text-sm space-y-2 text-gray-600">
            <p><strong>1. Règles applicables</strong> — RIR, avis de course, fiche course</p>
            <p><strong>2. Programme</strong> — Briefing obligatoire 11h, nombre de courses</p>
            <p><strong>3. Parcours</strong> — Zone de course, description des marques, schéma</p>
            <p><strong>4. Procédure de départ</strong> — Signaux, pavillons de série</p>
            <p><strong>5. Rappels</strong> — Individuel (X), Général (1er substitut), Aperçu</p>
            <p><strong>6. Pénalités RIR</strong> — Observateur, 1 tour, DSQ</p>
            <p><strong>7. Émargement</strong> — Obligatoire au retour, sanction DNF</p>
            <p><strong>8. Classement</strong> — Points, rejet, départage</p>
          </div>
        </div>
      )}

      {/* Structure AC classique */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="font-medium text-sm mb-3">Structure avis de course</div>
        <div className="text-sm space-y-2 text-gray-600">
          <p><strong>1. Organisateur</strong> — AMATH KAKIKOUKA</p>
          <p><strong>2. Dates et lieu</strong> — {formatDate(regatta.date)} à {regatta.location || '[Lieu]'}</p>
          <p><strong>3. Classes admises</strong> — {regatta.supports?.join(', ') || '[Supports]'}</p>
          <p><strong>4. Grade</strong> — {regatta.grade} {isRIR && '(RIR applicable)'}</p>
          <p><strong>5. Inscriptions</strong> — Formulaire en ligne, droits: 12€ (solo) / 24€ (double) / 30€ (double + loc. cata)</p>
          <p><strong>6. Programme</strong> — Accueil 9h, briefing {isRIR ? '11h' : '10h45'}, 1er départ 12h</p>
          <p><strong>7. Contact</strong> — Email/téléphone organisateur</p>
          <p><strong>8. Assurance</strong> — RC obligatoire, licence compétition</p>
        </div>
      </div>

      {/* Pavillons RIR */}
      {isRIR && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="font-medium text-sm mb-3">🚩 Pavillons RIR</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 p-2 rounded"><strong>Série</strong> — Signal avertissement (pavillon classe)</div>
            <div className="bg-gray-50 p-2 rounded"><strong>P</strong> — Signal préparatoire</div>
            <div className="bg-gray-50 p-2 rounded"><strong>X</strong> — Rappel individuel (OCS)</div>
            <div className="bg-gray-50 p-2 rounded"><strong>1er substitut</strong> — Rappel général</div>
            <div className="bg-gray-50 p-2 rounded"><strong>AP</strong> — Départ retardé</div>
            <div className="bg-gray-50 p-2 rounded"><strong>N</strong> — Course annulée</div>
            <div className="bg-gray-50 p-2 rounded"><strong>Bleu</strong> — Ligne d'arrivée</div>
            <div className="bg-gray-50 p-2 rounded"><strong>C</strong> — Changement de parcours</div>
            <div className="bg-gray-50 p-2 rounded"><strong>Y</strong> — Brassière obligatoire</div>
            <div className="bg-gray-50 p-2 rounded"><strong>Orange</strong> — En course</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="font-medium text-sm mb-3">✅ Checklist publication</div>
        <div className="text-sm space-y-2">
          {[
            'Lien inscription en ligne intégré',
            'Programme horaire détaillé',
            'Tarifs (12€ solo / 24€ double / 30€ double+loc)',
            'Contact organisateur',
            isRIR ? 'Fiche course jointe (pas IC)' : 'Instructions de course jointes',
            'Envoyé à VPB et clubs',
            'Publié sur site web club',
            'Transmis aux arbitres pour relecture'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border rounded"></div>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Panel Paramètres
const SettingsPanel = ({ regatta, setRegatta }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="font-medium text-sm mb-3">⚙️ Configuration régate</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Nom de la régate</label>
          <input value={regatta.name} onChange={e => setRegatta(p=>({...p,name:e.target.value}))} 
            placeholder="Ex: Coupe du Finistère" className="w-full px-3 py-2 border rounded text-sm"/>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Date</label>
          <input type="date" value={regatta.date} onChange={e => setRegatta(p=>({...p,date:e.target.value}))} 
            className="w-full px-3 py-2 border rounded text-sm"/>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-gray-700 block mb-1">Lieu</label>
          <input value={regatta.location} onChange={e => setRegatta(p=>({...p,location:e.target.value}))} 
            placeholder="Plage du Trez-Hir" className="w-full px-3 py-2 border rounded text-sm"/>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Grade</label>
          <select value={regatta.grade} onChange={e => setRegatta(p=>({...p,grade:e.target.value}))} 
            className="w-full px-3 py-2 border rounded text-sm">
            {GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Participants attendus</label>
          <input type="number" value={regatta.expectedParticipants} 
            onChange={e => setRegatta(p=>({...p,expectedParticipants:parseInt(e.target.value)||50}))} 
            className="w-full px-3 py-2 border rounded text-sm"/>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-gray-700 block mb-2">Canaux VHF</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Rond 1 (PAV/Opti)</label>
            <input value={regatta.vhfChannels?.rond1 || '69'} 
              onChange={e => setRegatta(p=>({...p,vhfChannels:{...p.vhfChannels, rond1:e.target.value}}))} 
              className="w-full px-3 py-2 border rounded text-sm"/>
          </div>
          <div>
            <label className="text-xs text-gray-500">Rond 2 (Cata/Dér)</label>
            <input value={regatta.vhfChannels?.rond2 || '72'} 
              onChange={e => setRegatta(p=>({...p,vhfChannels:{...p.vhfChannels, rond2:e.target.value}}))} 
              className="w-full px-3 py-2 border rounded text-sm"/>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-gray-700 block mb-2">Supports admis</label>
        <div className="flex flex-wrap gap-1.5">
          {SUPPORTS.map(s => (
            <button key={s} onClick={() => setRegatta(p => ({...p, supports: p.supports.includes(s) ? p.supports.filter(x=>x!==s) : [...p.supports, s]}))}
              className={`px-2 py-1 rounded-full text-xs ${regatta.supports.includes(s) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="font-medium text-sm mb-3">💾 Export / Import</div>
      <div className="flex gap-2">
        <button onClick={() => {
          const data = JSON.stringify({ regatta }, null, 2);
          navigator.clipboard.writeText(data);
          alert('Données copiées dans le presse-papier !');
        }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded text-sm">
          <Download size={16}/>Exporter JSON
        </button>
      </div>
    </div>
  </div>
);

// ==================== MAIN APP ====================
export default function RegattaOrganizerV2() {
  const [tab, setTab] = useState('dashboard');
  const [regatta, setRegatta] = useState(INITIAL_REGATTA);
  const [tasks] = useState(DEFAULT_TASKS);
  const [completed, setCompleted] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [docs, setDocs] = useState(ADMIN_DOCS.map(d => ({...d, status:'pending'})));

  // Persistence localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('regattaOrganizerV2');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.regatta) setRegatta(d.regatta);
        if (d.completed) setCompleted(d.completed);
        if (d.volunteers) setVolunteers(d.volunteers);
        if (d.docs) setDocs(d.docs);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    localStorage.setItem('regattaOrganizerV2', JSON.stringify({regatta, completed, volunteers, docs}));
  }, [regatta, completed, volunteers, docs]);

  const days = getDaysUntil(regatta.date);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white px-4 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Anchor size={24}/>
            </div>
            <div>
              <h1 className="text-lg font-bold">Régates Organizer</h1>
              <p className="text-blue-200 text-xs">{regatta.name || 'Nouvelle régate'}{regatta.date && ` • ${formatDateShort(regatta.date)}`}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-200">Jours</div>
            <div className="text-2xl font-bold">{days !== null ? (days >= 0 ? `J-${days}` : `J+${-days}`) : '-'}</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <TabNav active={tab} setActive={setTab}/>

      {/* Content */}
      <main className="p-4 max-w-4xl mx-auto">
        {tab === 'dashboard' && <Dashboard regatta={regatta} tasks={tasks} completed={completed} volunteers={volunteers}/>}
        {tab === 'tasks' && <TasksPanel regatta={regatta} tasks={tasks} completed={completed} setCompleted={setCompleted}/>}
        {tab === 'admin' && <AdminPanel regatta={regatta} docs={docs} setDocs={setDocs}/>}
        {tab === 'volunteers' && <VolunteersPanel volunteers={volunteers} setVolunteers={setVolunteers} regatta={regatta}/>}
        {tab === 'documents' && <DocumentsPanel regatta={regatta} volunteers={volunteers}/>}
        {tab === 'mails' && <MailsPanel regatta={regatta} volunteers={volunteers}/>}
        {tab === 'avis' && <AvisPanel regatta={regatta}/>}
        {tab === 'settings' && <SettingsPanel regatta={regatta} setRegatta={setRegatta}/>}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-500 border-t bg-white mt-8">
        Basé sur le Guide FFVoile et documents AMATH • <a href="https://arbitrage.ffvoile.fr" className="text-blue-600">arbitrage.ffvoile.fr</a>
      </footer>
    </div>
  );
}
