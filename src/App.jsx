import { useState, useEffect, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════
// CONSTANTS & DATA
// ═══════════════════════════════════════════════
const VER = "4.0";
const LS_KEY = "regates_org_v4";
const SB_KEY = "regates_sb_cfg";

const GRADES = [
  { value: "5C", label: "5C — Club" },
  { value: "5B", label: "5B — Locale" },
  { value: "5A", label: "5A — Régionale" },
  { value: "4", label: "4 — Nationale" },
];

const SUPPORTS = [
  "Optimist","T293","RCB","ILCA 4","ILCA 6","ILCA 7","420","470",
  "29er","RS Feva","OpenBic","OpenSkiff","Catamaran INC","Dériveur IND",
  "Windsurf","Kitesurf","Wing"
];

const TASK_CATS = [
  { id: "admin", name: "Administratif", icon: "📁", color: "#3B82F6" },
  { id: "volunteers", name: "Bénévoles", icon: "🤝", color: "#10B981" },
  { id: "logistics", name: "Logistique", icon: "📦", color: "#F59E0B" },
  { id: "catering", name: "Restauration", icon: "🍽️", color: "#EF4444" },
  { id: "communication", name: "Communication", icon: "📢", color: "#8B5CF6" },
  { id: "security", name: "Sécurité", icon: "🛟", color: "#DC2626" },
];

const DEFAULT_TASKS = [
  { id:1, cat:"admin", title:"Donner dates à NPI", desc:"Vérifier conflits dates avec AMP", jb:180, req:true },
  { id:2, cat:"admin", title:"Déclaration DDTM/AffMar", desc:"Manifestation nautique — formulaire en ligne", jb:180, req:true },
  { id:3, cat:"admin", title:"Inscription calendrier FFVoile", desc:"Via interface gestion club. Bien renseigner les classes.", jb:180, req:true },
  { id:4, cat:"logistics", title:"Réserver matériel mairie", desc:"Barnum, tables, chaises, sono, poste électrique, barrières", jb:180, req:true },
  { id:5, cat:"admin", title:"Déclaration mairie (animation)", desc:"Plan animation, fiche sécurité, assurance, débit boissons. Mail : animation@plougonvelin.fr", jb:60, req:true },
  { id:6, cat:"admin", title:"Déclaration police municipale", desc:"Avec accusé réception AffMar. Mail : police@plougonvelin.fr", jb:60, req:true },
  { id:7, cat:"admin", title:"Demande débit de boissons temporaire", desc:"Copie à la police. Groupe 3.", jb:60, req:false },
  { id:8, cat:"admin", title:"Contacter arbitres, juge et commissaire", desc:"Pour 5C/5B, un arbitre de club suffit. Désigné par le président.", jb:60, req:true },
  { id:9, cat:"admin", title:"Créer formulaire inscriptions en ligne", desc:"Dupliquer le précédent, modifier la date. Tester le formulaire.", jb:30, req:true },
  { id:10, cat:"admin", title:"Rédiger et publier l'avis de course", desc:"Intégrer lien d'inscription. Publier sur site web. Transmettre aux clubs VPB et arbitres.", jb:30, req:true },
  { id:11, cat:"volunteers", title:"Créer formulaire bénévoles", desc:"Inscription Google Forms en ligne", jb:30, req:true },
  { id:12, cat:"volunteers", title:"Email appel bénévoles", desc:"Avec lien formulaire et tableau Excel", jb:30, req:true },
  { id:13, cat:"admin", title:"Commander fonds de caisse", desc:"BPGO — 2 caisses (inscriptions + restauration)", jb:30, req:true },
  { id:14, cat:"communication", title:"Contacter sponsors, élus, presse", desc:"Informer Ouest France, Le Télégramme. Inviter l'équipe municipale. Bulletin municipal.", jb:30, req:false },
  { id:15, cat:"security", title:"Organiser dispositif de sécurité", desc:"Prévenir pompiers, identifier DZ, trousse de secours, nb bateaux sécu (2 pers/bateau).", jb:30, req:true },
  { id:16, cat:"logistics", title:"Contacter NPI pour matériel", desc:"5 sécus 15/20 CV, 2 sécus 30 CV, 10 VHF. Accès salle JDM + local essence.", jb:14, req:true },
  { id:17, cat:"admin", title:"Surveiller réponse AffMar", desc:"Arrive généralement la semaine précédant la régate. À afficher jour J.", jb:14, req:true },
  { id:18, cat:"logistics", title:"Imprimer émargement bénévoles", desc:"Feuilles de présence", jb:14, req:true },
  { id:19, cat:"logistics", title:"Imprimer numéros utiles", desc:"Compléter selon bénévoles inscrits. 10 exemplaires : 1/mallette + 2 à terre.", jb:14, req:true },
  { id:20, cat:"logistics", title:"Imprimer bulletins d'inscription", desc:"Si pas de pré-inscription : plusieurs tableaux/série pour 100 coureurs.", jb:14, req:false },
  { id:21, cat:"logistics", title:"Imprimer parcours en couleur", desc:"12 ex : 1/mallette + affichage terre. Modifier selon bouées dispo.", jb:14, req:true },
  { id:22, cat:"logistics", title:"Impressions réglementaires", desc:"Réclamation, pointage, remplact matériel, AC, IC, convocations jury.", jb:14, req:true },
  { id:23, cat:"logistics", title:"Vérifier stock médailles", desc:"~21 médailles. Vérifier au club house. Impression couleur + étiquetage.", jb:14, req:true },
  { id:24, cat:"logistics", title:"Récupérer trophées", desc:"Mail aux clubs pour qu'ils pensent à les apporter.", jb:14, req:false },
  { id:25, cat:"volunteers", title:"Relance bénévoles", desc:"Confirmer les présences, s'assurer que tous les postes sont pourvus.", jb:7, req:true },
  { id:26, cat:"volunteers", title:"Email organisation bénévoles", desc:"Détail journée, horaires, postes, tableau de répartition.", jb:7, req:true },
  { id:27, cat:"volunteers", title:"Nommer responsable sécu", desc:"Armer bateaux le matin, navette équipe mer, ranger le soir.", jb:7, req:true },
  { id:28, cat:"volunteers", title:"Nommer responsable catamarans", desc:"Attribution équipages, aide pour gréer, inspection et rangement.", jb:7, req:false },
  { id:29, cat:"logistics", title:"Appeler services techniques mairie", desc:"S'assurer que le matériel sera déposé au centre nautique le vendredi.", jb:7, req:true },
  { id:30, cat:"logistics", title:"Recenser réservations catamarans", desc:"Si dépassement flotte, l'arbitre devra faire des pools — le prévenir.", jb:7, req:false },
  { id:31, cat:"catering", title:"Inventaire club house + courses", desc:"Vérifier péremptions. Faire liste en fonction de ce qui reste.", jb:7, req:true },
  { id:32, cat:"catering", title:"Commander baguettes boulangerie", desc:"+ pâte à crêpes si nécessaire.", jb:7, req:true },
  { id:33, cat:"logistics", title:"Vérifier réservation parking", desc:"Voir avec mairie et policier municipal.", jb:7, req:false },
  { id:34, cat:"logistics", title:"Gonfler les bouées", desc:"Trouver un compresseur. Pré-gonfler toutes les bouées.", jb:1, req:true },
  { id:35, cat:"logistics", title:"Préparer marocains, livardes, pavillonnerie", desc:"Vérifier que tout est en état.", jb:1, req:true },
  { id:36, cat:"logistics", title:"Vérifier les mallettes", desc:"Crayon, compas, girouette, feuilles pointage, parcours, numéros utiles.", jb:1, req:true },
  { id:37, cat:"security", title:"Vérifier caisse pharmacie sécu G", desc:"Trousse de secours complète.", jb:1, req:true },
  { id:38, cat:"logistics", title:"Rappeler CNPK dossards", desc:"Contacter Portsall.", jb:1, req:false },
  { id:39, cat:"catering", title:"Faire les courses", desc:"Intermarché : boissons, nourriture. Prévoir 2ᵉ cafetière. Percolateur café.", jb:1, req:true },
  { id:40, cat:"volunteers", title:"Imprimer répartition bénévoles", desc:"Pour accueil barnum et briefing mer.", jb:1, req:true },
  { id:41, cat:"volunteers", title:"Réunion des bénévoles", desc:"Coordination la veille au soir.", jb:1, req:true },
];

const VOL_ROLES = [
  { id:"resp_terre", name:"Responsable terre", loc:"terre", min:1, slot:"8h-17h" },
  { id:"installation", name:"Installation barnums/tables", loc:"terre", min:6, slot:"8h-10h30" },
  { id:"parking", name:"Gestion parkings", loc:"terre", min:4, slot:"8h-10h30" },
  { id:"inscription", name:"Inscriptions coureurs", loc:"terre", min:4, slot:"9h-11h30" },
  { id:"emargement", name:"Émargement retour", loc:"terre", min:3, slot:"15h30-17h30" },
  { id:"commissaire", name:"Commissaire aux résultats", loc:"terre", min:2, slot:"10h-17h" },
  { id:"pc_terre", name:"PC Terre", loc:"terre", min:1, slot:"12h-16h" },
  { id:"buvette_matin", name:"Buvette/crêpes matin", loc:"terre", min:2, slot:"9h-13h" },
  { id:"buvette_aprem", name:"Buvette/goûter après-midi", loc:"terre", min:3, slot:"13h-17h" },
  { id:"jury", name:"Jury (arbitre FFV)", loc:"terre", min:1, slot:"10h-17h" },
  { id:"comite_r1", name:"Comité rond 1 (PAV/Opti)", loc:"mer", min:5, slot:"10h30-17h", rond:1 },
  { id:"arrivee_r1", name:"Arrivée rond 1", loc:"mer", min:4, slot:"10h30-17h", rond:1 },
  { id:"secu_r1", name:"Sécu rond 1", loc:"mer", min:2, slot:"10h30-17h", rond:1 },
  { id:"mouilleur_r1", name:"Mouilleur rond 1", loc:"mer", min:2, slot:"10h30-17h", rond:1 },
  { id:"comite_r2", name:"Comité rond 2 (Cata/Dér)", loc:"mer", min:4, slot:"10h30-17h", rond:2 },
  { id:"arrivee_r2", name:"Arrivée rond 2", loc:"mer", min:4, slot:"10h30-17h", rond:2 },
  { id:"secu_r2", name:"Sécu rond 2", loc:"mer", min:2, slot:"10h30-17h", rond:2 },
  { id:"mouilleur_r2", name:"Mouilleur rond 2", loc:"mer", min:2, slot:"10h30-17h", rond:2 },
  { id:"secu_multi", name:"Sécu multironds", loc:"mer", min:2, slot:"10h30-17h" },
  { id:"photo", name:"Photographe", loc:"mer", min:1, slot:"10h30-17h" },
  { id:"gonflage", name:"Gonflage bouées (samedi)", loc:"terre", min:2, slot:"14h-16h (J-1)" },
];

const EMERGENCY = [
  { name:"CROSS CORSEN", role:"Accident en mer", phone:"196", vhf:"16" },
  { name:"SAMU", role:"Accident à terre", phone:"15 / 112", vhf:"" },
  { name:"Pompiers", role:"Accident à terre", phone:"18", vhf:"" },
  { name:"URGENCE CCA", role:"Après les secours", phone:"01 40 60 37 58", vhf:"" },
];

const ADMIN_DOCS = [
  { id:"ddtm", name:"Déclaration DDTM/AffMar", deadline:15, req:true, pj:["Plan de la manifestation","Zone de course (carte SHOM)","Attestation assurance RC"] },
  { id:"mairie", name:"Déclaration Mairie", deadline:60, req:true, pj:["Plan animation","Fiche sécurité","Attestation assurance","Demande débit boissons","Annuaire téléphonique"] },
  { id:"police", name:"Déclaration Police", deadline:60, req:true, pj:["Accusé réception DDTM"] },
  { id:"ffv", name:"Calendrier FFVoile", deadline:30, req:true, pj:[] },
  { id:"boisson", name:"Débit boissons temporaire", deadline:60, req:false, pj:["Formulaire complété"] },
  { id:"fiche_secu", name:"Fiche sécurité", deadline:60, req:true, pj:["Plan situation","Annuaire contacts","Localisation DZ/PMA"] },
];

const LINKS = {
  ddtm: "https://www.premar-atlantique.gouv.fr/uploads/ckeditor_storage/atlantique/01%20DMN%20fa%C3%A7ade%20Atlantique%202019.pdf",
  shom: "https://data.shom.fr",
  ac_simple: "https://arbitrage.ffvoile.fr/media/33pc1eic/2025_ac-type-voile-l%C3%A9g%C3%A8re-simplifi%C3%A9-5c-5b-sept-25.docx",
  ac_complet: "https://arbitrage.ffvoile.fr/media/ywld0ayh/2025_ac-type-voile-legere-def-sept-25-forme-texte.docx",
  ic_types: "https://arbitrage.ffvoile.fr/media/xiajwvrh/ic-types-vl-avec-champs-25-28-mars-25-def.docx",
  fiche_rir: "https://arbitrage.ffvoile.fr/regles-et-documents/ac-ic-annexes-types/",
  form_benevoles: "https://docs.google.com/forms/d/187cx0pEQARNMDnMdrQj59z285LbnhQW9LYnsIgHRTTw/edit",
  form_inscriptions: "https://docs.google.com/forms/d/1XRVowqJk8F7EPYKIxsQs7fTmUYHv-2OX0ZykQg7MAAs/edit",
  score: "https://arbitrage.ffvoile.fr/logiciel-de-classement/",
};

const MAIL_TEMPLATES = [
  { id:"benevoles_invitation", label:"📢 Appel bénévoles",
    subject:"Appel aux bénévoles — Régate {name} du {date}",
    body:`Bonjour à toutes et à tous,

La régate {name}, organisée par l'Amath, aura lieu le {date} à {location}.

Nous recherchons des bénévoles pour assurer le bon déroulement de cette journée.

Plusieurs postes sont à pourvoir :
- À terre : installation, inscriptions, émargement, buvette
- En mer : comité de course, sécurité, mouilleur

👉 Inscrivez-vous via ce formulaire : ${LINKS.form_benevoles}

Même si vous n'êtes pas disponible toute la journée, votre aide sera précieuse !

À bientôt,
L'équipe du CA` },
  { id:"benevoles_organisation", label:"📋 Organisation bénévoles",
    subject:"Organisation bénévoles — Régate du {date}",
    body:`Bonjour à toutes et à tous,

La régate de Voile en Pays de Brest tous supports en voiles légères, organisée par l'Amath, aura lieu dimanche {date}.

Pour celles et ceux qui sont inscrits en tant que bénévoles, voici l'organisation de la journée :

8H00 : installation du site, montage des barnums
8H30 : préparation des paniers repas pour les bénévoles
9h15 : ouverture des inscriptions (prévoir d'arriver 15 min avant)
10h : briefing équipe mer en salle Jardin des Mers
10h30 : départ sur l'eau de l'équipe mer — briefing entraîneurs
10h45 : briefing coureurs
12h : premier départ
15h30-17h : retour à terre — émargement retour des coureurs
17h-18h : remise des prix — pot de convivialité
18h15 : rangement du site

📋 Votre poste : consultez le tableau de répartition ci-joint

NB : N'oubliez pas d'émarger la fiche de présence bénévoles.

À bientôt,
L'équipe du CA` },
  { id:"mairie", label:"🏛️ Déclaration mairie",
    subject:"Déclaration manifestation nautique — {name} du {date}",
    body:`Madame, Monsieur,

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
- Nombre de participants attendus : {participants}
- Localisation : {location}

Nous restons à votre disposition pour tout renseignement complémentaire.

Cordialement,
Le Bureau — AMATH KAKIKOUKA

Copie : Police municipale (police@plougonvelin.fr)` },
  { id:"ddtm", label:"⚓ Déclaration DDTM",
    subject:"Déclaration manifestation nautique — {name} du {date}",
    body:`Madame, Monsieur,

Conformément à la réglementation en vigueur, nous sollicitons l'autorisation d'organiser une manifestation nautique :

INFORMATIONS GÉNÉRALES
Événement : {name}
Date : {date}
Organisateur : AMATH KAKIKOUKA
Lieu : {location}
Zone de course : Anse de Bertheaume (voir carte SHOM ci-jointe)
Grade FFVoile : {grade}

PARTICIPANTS
Nombre attendu : {participants} coureurs
Supports : {supports}

DISPOSITIF DE SÉCURITÉ
- Bateaux de sécurité avec personnel qualifié
- Communication VHF sur canaux {vhf1} et {vhf2}
- PC Terre en liaison permanente avec l'équipe mer
- Émargement obligatoire départ et retour

PIÈCES JOINTES
☐ Plan de la zone de course (carte SHOM)
☐ Plan de la manifestation à terre
☐ Attestation d'assurance RC

Cordialement,
Le Bureau — AMATH KAKIKOUKA
kakik.amath@gmail.com` },
  { id:"npi", label:"🚤 Demande matériel NPI",
    subject:"Demande matériel — Régate du {date}",
    body:`Bonjour,

L'Amath organise une régate le {date}.

Nous souhaitons demander la mise à disposition du matériel suivant :
- 5 sécus 15/20 CV
- 2 sécus 30 CV
- 10 VHF

Ainsi que l'accès au bâtiment :
- Salle Jardin des Mers
- Local essence

Merci de nous confirmer la disponibilité.

Cordialement,
Le Bureau — AMATH KAKIKOUKA` },
  { id:"debit_boissons", label:"🍺 Débit boissons",
    subject:"Demande débit de boissons temporaire — {name} du {date}",
    body:`DEMANDE D'AUTORISATION D'OUVRIR UN DEBIT TEMPORAIRE

Monsieur le Maire,

Je soussigné :
Nom : GUERIN
Prénoms : LOIC
Qualité : Président de l'association AMATH KAKIKOUKA
Domicile : 6 boulevard de la mer
CP/ville : 29217 PLOUGONVELIN

Ai l'honneur de solliciter l'autorisation d'établir un débit de boisson temporaire à :
Lieu : Centre nautique du Trez-Hir
Du : {date} à 13h00  Au : {date} à 18h00
Motif : {name} — Critérium de Bassin Voile en Pays de Brest
Boissons de 3ᵉ catégorie (groupe 3)

Fait à Plougonvelin le __/__/____

SIGNATURE DU DEMANDEUR` },
  { id:"fiche_securite", label:"🛡️ Fiche sécurité",
    subject:"Fiche sécurité — {name} du {date}",
    body:`FICHE SÉCURITÉ — MANIFESTATION NAUTIQUE

Nom : {name}
Date : {date}
Organisateur : AMATH KAKIKOUKA

PARTIE TERRE
Présence public : 10h-12h puis 15h30-18h

DESCRIPTION
- Jauge max : {participants} personnes
- Parkings : face office tourisme + rue de Kerouanen Stang
- Barnum devant centre nautique (extincteur présent)
- Boissons groupe 3 de 10h à 19h

RESPONSABLES SÉCURITÉ
Responsable principal : GUERIN Loïc — 06 66 99 19 89
Responsable adjoint : BLANCKAERT Godelieve — 06 15 87 10 03
Nombre de bénévoles : ~20

SECOURS / SANTÉ
Évacuation : Appel SDIS (18)
DZ : Boulevard de la mer (48°20'55.5"N / -4°42'8.87"W)

COMMODITÉS
Eau gratuite : Centre nautique
WC : Centre nautique + WC public entrée plage` },
  { id:"presse", label:"📰 Article presse",
    subject:"Résultats régate {name} du {date}",
    body:`{name} — {date}

[RÉSUMÉ : météo, ambiance, nombre de participants]

Résultats :
[À compléter avec les classements]

Prochaine régate : [date]

Contact : AMATH KAKIKOUKA
Photos disponibles sur demande.

---
Contacts presse :
- Le Télégramme : cessoumich@gmail.com
- Ouest France : gery.baldenweck@orange.fr

⚠️ Envoyer au plus tard le mardi matin suivant la régate.` },
];

// ═══════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════
const uid = () => Math.random().toString(36).slice(2,10);
const shareCode = () => { const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s=""; for(let i=0;i<6;i++) s+=c[Math.floor(Math.random()*c.length)]; return s; };
const fmtDate = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : "";
const fmtShort = d => d ? new Date(d).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}) : "";
const daysUntil = d => { if(!d) return null; const diff=new Date(d)-new Date(); return Math.ceil(diff/864e5); };
const calcDL = (ev,jb) => { if(!ev) return null; const d=new Date(ev); d.setDate(d.getDate()-jb); return d; };

const fillMail = (tpl, r) => {
  const reps = { "{name}":r.name||"Régate", "{date}":fmtDate(r.date), "{location}":r.location||"", "{grade}":r.grade||"", "{participants}":r.expected_participants||"50", "{supports}":(r.supports||[]).join(", "), "{vhf1}":r.vhf1||"69", "{vhf2}":r.vhf2||"72" };
  let s=tpl.subject, b=tpl.body;
  Object.entries(reps).forEach(([k,v])=>{ s=s.replaceAll(k,v); b=b.replaceAll(k,v); });
  return {subject:s, body:b};
};

const loadLS = k => { try{ return JSON.parse(localStorage.getItem(k)); }catch{ return null; } };
const saveLS = (k,v) => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };

// ═══════════════════════════════════════════════
// SUPABASE CLIENT (lightweight fetch)
// ═══════════════════════════════════════════════
const makeSB = (url,key) => {
  if(!url||!key) return null;
  const base = url.replace(/\/$/,"");
  const hdr = { "Content-Type":"application/json", apikey:key, Authorization:`Bearer ${key}` };
  const req = async (path,opts={}) => {
    try {
      const r = await fetch(`${base}/rest/v1/${path}`,{...opts, headers:{...hdr, Prefer: opts.method==="POST"?"return=representation":"return=minimal", ...opts.headers}});
      if(!r.ok) throw new Error(r.status);
      const t = await r.text(); return t ? JSON.parse(t) : null;
    } catch(e) { console.warn("SB:",e); return null; }
  };
  return {
    list: t => req(`${t}?select=*&order=created_at.desc`),
    get: (t,q) => req(`${t}?${q}&select=*`),
    ins: (t,d) => req(t,{method:"POST",body:JSON.stringify(d)}),
    upd: (t,q,d) => req(`${t}?${q}`,{method:"PATCH",body:JSON.stringify(d)}),
    del: (t,q) => req(`${t}?${q}`,{method:"DELETE"}),
  };
};

// ═══════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════
const CSS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
*{box-sizing:border-box}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
button:active{transform:scale(0.97)}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
@media print{.no-print{display:none!important}.print-only{display:block!important}}
.print-only{display:none}`;
const ff = "'DM Sans',sans-serif";
const ff2 = "'Playfair Display',serif";

// ═══════════════════════════════════════════════
// MICRO-COMPONENTS
// ═══════════════════════════════════════════════
const Modal = ({open,onClose,title,children,wide}) => {
  if(!open) return null;
  return <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,20,40,0.5)",backdropFilter:"blur(5px)",padding:16,animation:"fadeIn .2s"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:"#fff",borderRadius:16,maxWidth:wide?720:500,width:"100%",maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.18)",animation:"slideUp .25s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid #e5e7eb"}}>
        <h2 style={{margin:0,fontSize:17,fontWeight:700,fontFamily:ff}}>{title}</h2>
        <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",color:"#64748b"}}>✕</button>
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  </div>;
};

const Btn = ({children,onClick,v="primary",s="md",icon,disabled,style:sx}) => {
  const vs = {primary:{background:"linear-gradient(135deg,#1e40af,#3b82f6)",color:"#fff",border:"none"},secondary:{background:"#f1f5f9",color:"#334155",border:"1px solid #e2e8f0"},danger:{background:"#fef2f2",color:"#dc2626",border:"1px solid #fecaca"},ghost:{background:"transparent",color:"#64748b",border:"none"},success:{background:"linear-gradient(135deg,#059669,#10b981)",color:"#fff",border:"none"}};
  const ss = {sm:{padding:"5px 10px",fontSize:12},md:{padding:"8px 16px",fontSize:13},lg:{padding:"10px 20px",fontSize:14}};
  return <button onClick={onClick} disabled={disabled} style={{...vs[v],...ss[s],borderRadius:9,fontWeight:600,fontFamily:ff,cursor:disabled?"not-allowed":"pointer",display:"inline-flex",alignItems:"center",gap:5,opacity:disabled?.5:1,transition:"all .15s",...sx}}>{icon&&<span style={{fontSize:s==="sm"?13:15}}>{icon}</span>}{children}</button>;
};

const Input = ({label,value,onChange,placeholder,type="text",textarea,req:required}) => (
  <div style={{marginBottom:14}}>
    {label&&<label style={{display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:4,fontFamily:ff}}>{label}{required&&<span style={{color:"#ef4444"}}> *</span>}</label>}
    {textarea
      ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{width:"100%",padding:"8px 12px",border:"1.5px solid #d1d5db",borderRadius:9,fontSize:13,fontFamily:ff,resize:"vertical",outline:"none",boxSizing:"border-box"}}/>
      : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",padding:"8px 12px",border:"1.5px solid #d1d5db",borderRadius:9,fontSize:13,fontFamily:ff,outline:"none",boxSizing:"border-box"}}/>}
  </div>
);

const Badge = ({label,color,small}) => <span style={{display:"inline-flex",alignItems:"center",padding:small?"2px 7px":"3px 9px",borderRadius:5,fontSize:small?10:11,fontWeight:600,background:color+"18",color,fontFamily:ff}}>{label}</span>;

const ProgressBar = ({val,total,color="#3b82f6"}) => {
  const p = total>0?Math.round(val/total*100):0;
  return <div style={{display:"flex",alignItems:"center",gap:8}}>
    <div style={{flex:1,height:7,background:"#e2e8f0",borderRadius:4,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:color,borderRadius:4,transition:"width .4s"}}/></div>
    <span style={{fontSize:12,fontWeight:600,color:"#475569",fontFamily:ff,minWidth:38,textAlign:"right"}}>{val}/{total}</span>
  </div>;
};

const ExtLink = ({href,children,style:sx}) => <a href={href} target="_blank" rel="noopener noreferrer" style={{color:"#3b82f6",textDecoration:"none",fontSize:13,fontFamily:ff,...sx}}>{children} ↗</a>;

// ═══════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════

// ── TAB: DASHBOARD ──
const TabDashboard = ({reg,tasks,vols}) => {
  const days = daysUntil(reg.date);
  const done = tasks.filter(t=>t.done).length;
  const total = tasks.length;
  const pct = total?Math.round(done/total*100):0;
  const totalNeed = VOL_ROLES.reduce((s,r)=>s+r.min,0);
  const assigned = vols.filter(v=>v.role).length;
  const urgent = tasks.filter(t=>{
    if(t.done) return false;
    const dl = calcDL(reg.date,t.jb);
    const d = daysUntil(dl);
    return d!==null && d<=7 && d>=0;
  });
  const overdue = tasks.filter(t=>{
    if(t.done) return false;
    const dl = calcDL(reg.date,t.jb);
    const d = daysUntil(dl);
    return d!==null && d<0;
  });

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    {days!==null && <div style={{background:days<=7?"linear-gradient(135deg,#dc2626,#f97316)":"linear-gradient(135deg,#1e40af,#0891b2)",borderRadius:16,padding:24,textAlign:"center",color:"#fff"}}>
      <div style={{fontSize:48,fontWeight:800,fontFamily:ff2}}>{days<0?"Terminée":`J-${days}`}</div>
      <div style={{fontSize:14,opacity:.85}}>{fmtDate(reg.date)}</div>
    </div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10}}>
      {[
        {label:"Avancement",val:`${pct}%`,sub:`${done}/${total} tâches`,color:"#3b82f6",icon:"📋"},
        {label:"Bénévoles",val:`${assigned}/${totalNeed}`,sub:`🌊 ${vols.filter(v=>VOL_ROLES.find(r=>r.id===v.role)?.loc==="mer").length} | 🏖️ ${vols.filter(v=>VOL_ROLES.find(r=>r.id===v.role)?.loc==="terre").length}`,color:"#10b981",icon:"👥"},
        {label:"Urgentes",val:urgent.length,sub:"à traiter",color:"#f59e0b",icon:"⚠️"},
        {label:"En retard",val:overdue.length,sub:"échéance passée",color:"#ef4444",icon:"🔴"},
      ].map((k,i)=><div key={i} style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)",borderLeft:`4px solid ${k.color}`}}>
        <div style={{fontSize:11,color:"#6b7280",fontFamily:ff}}>{k.icon} {k.label}</div>
        <div style={{fontSize:24,fontWeight:700,color:k.color,fontFamily:ff}}>{k.val}</div>
        <div style={{fontSize:11,color:"#9ca3af",fontFamily:ff}}>{k.sub}</div>
      </div>)}
    </div>

    <div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:8,fontFamily:ff}}>Progression globale</div>
      <ProgressBar val={done} total={total}/>
    </div>

    {(urgent.length>0||overdue.length>0) && <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:14}}>
      <div style={{fontSize:13,fontWeight:600,color:"#92400e",marginBottom:8,fontFamily:ff}}>⚠️ Tâches à traiter ({urgent.length+overdue.length})</div>
      {[...overdue,...urgent].slice(0,5).map(t=><div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",fontSize:12,fontFamily:ff}}>
        <span style={{color:"#78350f"}}>{t.title}</span>
        <span style={{color:"#dc2626",fontWeight:600}}>J-{t.jb}</span>
      </div>)}
    </div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
      {[
        {label:"Déclaration DDTM",url:LINKS.ddtm,icon:"📁"},
        {label:"Carte SHOM",url:LINKS.shom,icon:"🗺️"},
        {label:"Documents FFVoile",url:LINKS.fiche_rir,icon:"🏆"},
        {label:"Pré-inscriptions",url:LINKS.form_inscriptions,icon:"✍️"},
        {label:"Formulaire bénévoles",url:LINKS.form_benevoles,icon:"👥"},
        {label:"SCORE FFVoile",url:LINKS.score,icon:"📊"},
      ].map((l,i)=><a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{background:"#fff",borderRadius:10,padding:10,boxShadow:"0 1px 3px rgba(0,0,0,.04)",display:"flex",alignItems:"center",gap:8,fontSize:12,fontFamily:ff,color:"#1e293b",textDecoration:"none"}}>
        <span>{l.icon}</span><span style={{flex:1}}>{l.label}</span><span style={{color:"#94a3b8",fontSize:10}}>↗</span>
      </a>)}
    </div>
  </div>;
};

// ── TAB: PLANNING (TASKS) ──
const TabPlanning = ({reg,tasks,setTasks,onNewTask}) => {
  const [filter,setFilter] = useState("all");
  const [expandedCats,setExpandedCats] = useState(TASK_CATS.map(c=>c.id));

  const toggle = id => setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const toggleCat = id => setExpandedCats(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const filtered = tasks.filter(t=>{
    if(filter==="all") return true;
    if(filter==="todo") return !t.done;
    if(filter==="done") return t.done;
    if(filter==="urgent"){
      if(t.done) return false;
      const dl=calcDL(reg.date,t.jb); const d=daysUntil(dl);
      return d!==null&&d<=7;
    }
    return true;
  }).sort((a,b)=>a.jb-b.jb);

  const grouped = TASK_CATS.map(c=>({...c, items:filtered.filter(t=>t.cat===c.id)})).filter(g=>g.items.length>0);

  return <div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
      {[{id:"all",label:"Toutes"},{id:"todo",label:"À faire"},{id:"urgent",label:"Urgentes"},{id:"done",label:"Terminées"}].map(f=><button key={f.id} onClick={()=>setFilter(f.id)} style={{padding:"5px 12px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:ff,border:"none",cursor:"pointer",background:filter===f.id?"#1e40af":"#f1f5f9",color:filter===f.id?"#fff":"#475569"}}>{f.label}</button>)}
      <div style={{flex:1}}/>
      <Btn icon="➕" s="sm" onClick={onNewTask}>Tâche</Btn>
    </div>

    {grouped.map(g=>{
      const exp = expandedCats.includes(g.id);
      const done = g.items.filter(t=>t.done).length;
      return <div key={g.id} style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,.04)",overflow:"hidden"}}>
        <button onClick={()=>toggleCat(g.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"10px 14px",border:"none",background:"transparent",cursor:"pointer",textAlign:"left"}}>
          <span style={{fontSize:16}}>{g.icon}</span>
          <span style={{flex:1,fontWeight:600,fontSize:13,color:g.color,fontFamily:ff}}>{g.name}</span>
          <span style={{fontSize:11,color:"#6b7280",fontFamily:ff}}>{done}/{g.items.length}</span>
          <span style={{fontSize:12,color:"#94a3b8"}}>{exp?"▼":"▶"}</span>
        </button>
        {exp && <div style={{borderTop:"1px solid #f1f5f9"}}>
          {g.items.map(t=>{
            const dl = calcDL(reg.date,t.jb);
            const d = daysUntil(dl);
            const isLate = d!==null&&d<0&&!t.done;
            const isUrgent = d!==null&&d<=7&&d>=0&&!t.done;
            return <div key={t.id} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 14px",borderBottom:"1px solid #f8fafc",background:t.done?"#f0fdf4":"transparent"}}>
              <button onClick={()=>toggle(t.id)} style={{width:20,height:20,borderRadius:5,flexShrink:0,marginTop:1,border:t.done?"none":"2px solid #cbd5e1",cursor:"pointer",background:t.done?"#22c55e":isLate?"#fef2f2":isUrgent?"#fffbeb":"#fff",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:700}}>{t.done?"✓":""}</button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:t.done?"#16a34a":"#1e293b",textDecoration:t.done?"line-through":"none",fontFamily:ff}}>{t.title}{t.req&&!t.done&&<span style={{color:"#ef4444",marginLeft:4}}>*</span>}</div>
                {t.desc&&<div style={{fontSize:11,color:"#64748b",fontFamily:ff,marginTop:2}}>{t.desc}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:11,fontWeight:600,color:isLate?"#dc2626":isUrgent?"#f59e0b":t.done?"#16a34a":"#6b7280",fontFamily:ff}}>{t.done?"✓":`J-${t.jb}`}</div>
                <div style={{fontSize:10,color:"#9ca3af",fontFamily:ff}}>{fmtShort(dl)}</div>
              </div>
            </div>;
          })}
        </div>}
      </div>;
    })}
  </div>;
};

// ── TAB: ADMIN ──
const TabAdmin = ({reg,docs,setDocs}) => {
  const upd = (id,v) => setDocs(p=>p.map(d=>d.id===id?{...d,status:v}:d));
  return <div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12,padding:14}}>
      <div style={{fontSize:13,fontWeight:700,color:"#1e40af",marginBottom:6,fontFamily:ff}}>📋 Délais réglementaires</div>
      <div style={{fontSize:12,color:"#1e40af",fontFamily:ff,lineHeight:1.8}}>
        Maritime (AffMar) : 15 jours avant — Mairie : 2 mois — FFVoile : 1 mois (club) — Plans d'eau intérieurs : 2 mois (préfecture/VNF)
      </div>
    </div>

    <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{padding:"10px 14px",borderBottom:"1px solid #f1f5f9",fontWeight:600,fontSize:13,fontFamily:ff}}>Documents administratifs</div>
      {docs.map(d=>{
        const info = ADMIN_DOCS.find(a=>a.id===d.id);
        return <div key={d.id} style={{padding:"10px 14px",borderBottom:"1px solid #f8fafc"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontWeight:600,fontSize:13,fontFamily:ff}}>{d.name}</span>
              {info?.req&&<span style={{fontSize:10,background:"#fef2f2",color:"#dc2626",padding:"1px 6px",borderRadius:4,fontWeight:600}}>Oblig.</span>}
            </div>
            <span style={{fontSize:11,color:d.status==="done"?"#16a34a":"#6b7280",fontWeight:600,fontFamily:ff}}>{d.status==="done"?"✓ Fait":`J-${info?.deadline||"?"}`}</span>
          </div>
          {info?.pj?.length>0&&<div style={{fontSize:11,color:"#6b7280",marginBottom:6,fontFamily:ff}}>PJ : {info.pj.join(", ")}</div>}
          <select value={d.status||"pending"} onChange={e=>upd(d.id,e.target.value)} style={{width:"100%",padding:"5px 8px",border:"1px solid #e2e8f0",borderRadius:6,fontSize:12,fontFamily:ff}}>
            <option value="pending">À faire</option><option value="inProgress">En cours</option><option value="done">Terminé</option>
          </select>
        </div>;
      })}
    </div>

    <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:14}}>
      <div style={{fontSize:13,fontWeight:600,color:"#92400e",marginBottom:4,fontFamily:ff}}>⚠️ Rappel DDTM</div>
      <div style={{fontSize:12,color:"#78350f",fontFamily:ff,lineHeight:1.6}}>Le plan de la manifestation est obligatoire. À joindre : zone de course (carte SHOM), attestation d'assurance RC, liste des bateaux de sécurité.</div>
    </div>

    <div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:8,fontFamily:ff}}>📞 Contacts administratifs</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {[{n:"Mairie Animation",e:"animation@plougonvelin.fr"},{n:"Police municipale",e:"police@plougonvelin.fr"},{n:"Ouest France",e:"gery.baldenweck@orange.fr"},{n:"Le Télégramme",e:"cessoumich@gmail.com"}].map((c,i)=><div key={i} style={{background:"#f8fafc",borderRadius:8,padding:8}}>
          <div style={{fontSize:12,fontWeight:600,fontFamily:ff}}>{c.n}</div>
          <a href={`mailto:${c.e}`} style={{fontSize:11,color:"#3b82f6",fontFamily:ff,textDecoration:"none"}}>{c.e}</a>
        </div>)}
      </div>
    </div>

    <div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:8,fontFamily:ff}}>🔗 Ressources</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        <ExtLink href={LINKS.ddtm}>📁 Formulaire DDTM</ExtLink>
        <ExtLink href={LINKS.shom}>🗺️ Carte SHOM</ExtLink>
      </div>
    </div>
  </div>;
};

// ── TAB: BÉNÉVOLES ──
const TabVolunteers = ({vols,setVols}) => {
  const [showAdd,setShowAdd]=useState(false);
  const [showSync,setShowSync]=useState(false);
  const [viewMode,setViewMode]=useState("list");
  const [importData,setImportData]=useState("");
  const [syncMsg,setSyncMsg]=useState("");
  const [nv,setNv]=useState({name:"",firstName:"",email:"",phone:"",role:"",permisB:false,panierRepas:"oui"});

  const add = () => { if(nv.name){setVols(p=>[...p,{...nv,id:uid()}]);setNv({name:"",firstName:"",email:"",phone:"",role:"",permisB:false,panierRepas:"oui"});setShowAdd(false);} };
  const del = id => setVols(p=>p.filter(v=>v.id!==id));
  const upd = (id,f,v) => setVols(p=>p.map(x=>x.id===id?{...x,[f]:v}:x));
  const importCSV = () => {
    if(!importData.trim()) return;
    const lines=importData.trim().split("\n"); const nw=[];
    lines.forEach((l,i)=>{ if(i===0&&l.toLowerCase().includes("horodateur")) return; const c=l.split("\t"); if(c.length>=2) nw.push({id:uid(),name:c[1]||"",firstName:c[2]||"",email:c[3]||"",phone:c[4]||"",role:"",permisB:c[5]?.toLowerCase().includes("oui"),panierRepas:c[6]?.toLowerCase().includes("veggie")?"veggie":c[6]?.toLowerCase().includes("non")?"non":"oui"}); });
    if(nw.length>0){setVols(p=>[...p,...nw]);setImportData("");setSyncMsg(`✅ ${nw.length} bénévole(s) importé(s) !`);setTimeout(()=>setSyncMsg(""),3000);}
  };

  const totalNeed = VOL_ROLES.reduce((s,r)=>s+r.min,0);
  const assigned = vols.filter(v=>v.role).length;
  const byRole = VOL_ROLES.map(r=>({...r,v:vols.filter(v=>v.role===r.id)}));

  return <div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
      {[{l:"Inscrits",v:vols.length,c:"#3b82f6"},{l:"Assignés",v:assigned,c:"#10b981"},{l:"Manquants",v:Math.max(0,totalNeed-assigned),c:assigned>=totalNeed?"#10b981":"#f59e0b"}].map((k,i)=><div key={i} style={{background:"#fff",borderRadius:10,padding:10,textAlign:"center",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
        <div style={{fontSize:22,fontWeight:700,color:k.c,fontFamily:ff}}>{k.v}</div>
        <div style={{fontSize:11,color:"#6b7280",fontFamily:ff}}>{k.l}</div>
      </div>)}
    </div>

    {/* Sync Google Forms */}
    <div style={{background:"linear-gradient(135deg,#f5f3ff,#eff6ff)",border:"1px solid #c4b5fd",borderRadius:12,padding:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><div style={{fontSize:13,fontWeight:600,color:"#5b21b6",fontFamily:ff}}>🔗 Import depuis Google Forms</div><div style={{fontSize:11,color:"#7c3aed",fontFamily:ff}}>Collez les données depuis le tableur</div></div>
        <Btn v="secondary" s="sm" onClick={()=>setShowSync(!showSync)}>{showSync?"Fermer":"Importer"}</Btn>
      </div>
      {syncMsg&&<div style={{marginTop:8,padding:6,borderRadius:6,fontSize:12,background:syncMsg.includes("✅")?"#dcfce7":"#fef2f2",color:syncMsg.includes("✅")?"#166534":"#991b1b",fontFamily:ff}}>{syncMsg}</div>}
      {showSync&&<div style={{marginTop:12}}>
        <div style={{fontSize:11,color:"#6b7280",fontFamily:ff,marginBottom:8,lineHeight:1.6}}>1. Ouvrez les <a href={`${LINKS.form_benevoles}#responses`} target="_blank" rel="noopener noreferrer" style={{color:"#7c3aed"}}>réponses du formulaire</a> → icône Google Sheets. 2. Sélectionnez et copiez les lignes. 3. Collez ci-dessous.</div>
        <textarea value={importData} onChange={e=>setImportData(e.target.value)} placeholder="Collez les données ici…" style={{width:"100%",height:80,padding:8,border:"1px solid #d1d5db",borderRadius:8,fontSize:12,fontFamily:"monospace",boxSizing:"border-box"}}/>
        <Btn v="success" s="sm" onClick={importCSV} style={{marginTop:8,width:"100%"}}>Importer</Btn>
      </div>}
    </div>

    <div style={{display:"flex",gap:6}}>
      <Btn icon="➕" s="sm" onClick={()=>setShowAdd(!showAdd)}>Ajouter</Btn>
      {["list","byRole","byLoc"].map(m=><button key={m} onClick={()=>setViewMode(m)} style={{padding:"5px 10px",borderRadius:7,fontSize:11,fontWeight:600,fontFamily:ff,border:"none",cursor:"pointer",background:viewMode===m?"#1e40af":"#f1f5f9",color:viewMode===m?"#fff":"#475569"}}>{m==="list"?"Liste":m==="byRole"?"Par poste":"Mer/Terre"}</button>)}
    </div>

    {showAdd&&<div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        <input value={nv.name} onChange={e=>setNv({...nv,name:e.target.value})} placeholder="Nom *" style={{padding:"6px 10px",border:"1px solid #d1d5db",borderRadius:7,fontSize:12}}/>
        <input value={nv.firstName} onChange={e=>setNv({...nv,firstName:e.target.value})} placeholder="Prénom" style={{padding:"6px 10px",border:"1px solid #d1d5db",borderRadius:7,fontSize:12}}/>
        <input value={nv.email} onChange={e=>setNv({...nv,email:e.target.value})} placeholder="Email" style={{padding:"6px 10px",border:"1px solid #d1d5db",borderRadius:7,fontSize:12}}/>
        <input value={nv.phone} onChange={e=>setNv({...nv,phone:e.target.value})} placeholder="Téléphone" style={{padding:"6px 10px",border:"1px solid #d1d5db",borderRadius:7,fontSize:12}}/>
      </div>
      <select value={nv.role} onChange={e=>setNv({...nv,role:e.target.value})} style={{width:"100%",padding:"6px 10px",border:"1px solid #d1d5db",borderRadius:7,fontSize:12,marginTop:6}}>
        <option value="">— Poste —</option>
        <optgroup label="🏖️ Terre">{VOL_ROLES.filter(r=>r.loc==="terre").map(r=><option key={r.id} value={r.id}>{r.name} ({r.slot})</option>)}</optgroup>
        <optgroup label="🌊 Mer">{VOL_ROLES.filter(r=>r.loc==="mer").map(r=><option key={r.id} value={r.id}>{r.name} ({r.slot})</option>)}</optgroup>
      </select>
      <div style={{display:"flex",alignItems:"center",gap:12,marginTop:6}}>
        <label style={{display:"flex",alignItems:"center",gap:4,fontSize:12,fontFamily:ff}}><input type="checkbox" checked={nv.permisB} onChange={e=>setNv({...nv,permisB:e.target.checked})}/>Permis bateau</label>
        <select value={nv.panierRepas} onChange={e=>setNv({...nv,panierRepas:e.target.value})} style={{padding:"3px 8px",border:"1px solid #d1d5db",borderRadius:5,fontSize:11}}>
          <option value="oui">🍽️ Repas</option><option value="veggie">🥗 Végétarien</option><option value="non">❌ Pas de repas</option>
        </select>
      </div>
      <div style={{display:"flex",gap:6,marginTop:8}}>
        <Btn v="secondary" s="sm" onClick={()=>setShowAdd(false)}>Annuler</Btn>
        <Btn v="success" s="sm" onClick={add}>Ajouter</Btn>
      </div>
    </div>}

    {viewMode==="list"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
      {vols.length===0?<div style={{background:"#fff",borderRadius:12,padding:32,textAlign:"center",color:"#94a3b8",fontSize:13,fontFamily:ff}}>Aucun bénévole inscrit</div>:
      vols.map(v=>{
        const role=VOL_ROLES.find(r=>r.id===v.role);
        return <div key={v.id} style={{background:"#fff",borderRadius:10,padding:10,boxShadow:"0 1px 3px rgba(0,0,0,.04)",display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,fontFamily:ff}}>{v.firstName} {v.name}</div>
            {v.phone&&<div style={{fontSize:11,color:"#6b7280",fontFamily:ff}}>{v.phone}</div>}
            {role&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:role.loc==="mer"?"#dbeafe":"#dcfce7",color:role.loc==="mer"?"#1e40af":"#166534",fontWeight:600}}>{role.name}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            {v.permisB&&<span title="Permis bateau">🚤</span>}
            {v.panierRepas==="veggie"&&<span title="Végétarien">🥗</span>}
            <select value={v.role||""} onChange={e=>upd(v.id,"role",e.target.value)} style={{padding:"3px 6px",border:"1px solid #e2e8f0",borderRadius:5,fontSize:10,maxWidth:120}}>
              <option value="">Poste…</option>
              {VOL_ROLES.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <button onClick={()=>del(v.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontSize:14}}>🗑️</button>
          </div>
        </div>;
      })}
    </div>}

    {viewMode==="byRole"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      {["terre","mer"].map(loc=><div key={loc}>
        <div style={{fontSize:13,fontWeight:700,color:loc==="mer"?"#1e40af":"#166534",marginBottom:6,fontFamily:ff}}>{loc==="mer"?"🌊 Équipe mer":"🏖️ Équipe terre"}</div>
        {byRole.filter(r=>r.loc===loc).map(r=><div key={r.id} style={{background:"#fff",borderRadius:10,padding:10,marginBottom:4,borderLeft:`4px solid ${loc==="mer"?"#3b82f6":"#22c55e"}`,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,fontFamily:ff}}><span>{r.name}</span><span style={{color:r.v.length>=r.min?"#16a34a":"#f59e0b"}}>{r.v.length}/{r.min}</span></div>
          <div style={{fontSize:11,color:"#6b7280",fontFamily:ff}}>{r.slot}</div>
          {r.v.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:4}}>{r.v.map(v=><span key={v.id} style={{fontSize:10,background:"#f1f5f9",padding:"2px 6px",borderRadius:4}}>{v.firstName} {v.name} {v.permisB&&"🚤"}</span>)}</div>}
        </div>)}
      </div>)}
    </div>}

    {viewMode==="byLoc"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {["mer","terre"].map(loc=><div key={loc} style={{background:loc==="mer"?"#eff6ff":"#f0fdf4",borderRadius:12,padding:12}}>
        <div style={{fontSize:13,fontWeight:700,color:loc==="mer"?"#1e40af":"#166534",marginBottom:8,fontFamily:ff}}>{loc==="mer"?"🌊 Mer":"🏖️ Terre"} ({byRole.filter(r=>r.loc===loc).reduce((s,r)=>s+r.v.length,0)})</div>
        {byRole.filter(r=>r.loc===loc).map(r=><div key={r.id} style={{background:"#fff",borderRadius:8,padding:6,marginBottom:4,fontSize:11,fontFamily:ff}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:600}}>{r.name}</span><span style={{color:r.v.length>=r.min?"#16a34a":"#f59e0b"}}>{r.v.length}/{r.min}</span></div>
          {r.v.length>0&&<div style={{color:"#6b7280",marginTop:2}}>{r.v.map(v=>`${v.firstName||""} ${v.name}`).join(", ")}</div>}
        </div>)}
      </div>)}
    </div>}
  </div>;
};

// ── TAB: DOCUMENTS ──
const TabDocs = ({reg,vols}) => {
  const [sub,setSub]=useState("contacts");
  const volsWithPhone = vols.filter(v=>v.phone&&v.role);
  const byRolePhone = {};
  volsWithPhone.forEach(v=>{ if(!byRolePhone[v.role]) byRolePhone[v.role]=[]; byRolePhone[v.role].push(v); });

  return <div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{display:"flex",gap:6,overflowX:"auto"}}>
      {[{id:"contacts",l:"📞 N° utiles"},{id:"emargement",l:"✍️ Émargement"},{id:"parcours",l:"🗺️ Parcours"}].map(t=><button key={t.id} onClick={()=>setSub(t.id)} style={{padding:"5px 12px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:ff,border:"none",cursor:"pointer",background:sub===t.id?"#1e40af":"#f1f5f9",color:sub===t.id?"#fff":"#475569",whiteSpace:"nowrap"}}>{t.l}</button>)}
    </div>

    {sub==="contacts"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:"#fef2f2",borderRadius:12,padding:14}}>
        <div style={{fontSize:13,fontWeight:700,color:"#991b1b",marginBottom:8,fontFamily:ff}}>🚨 URGENCES</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {EMERGENCY.map(c=><a key={c.name} href={`tel:${c.phone.replace(/\s/g,"")}`} style={{background:"#fff",borderRadius:8,padding:8,textDecoration:"none",color:"inherit"}}>
            <div style={{fontSize:12,fontWeight:600,fontFamily:ff}}>{c.name}</div>
            <div style={{fontSize:10,color:"#6b7280",fontFamily:ff}}>{c.role}</div>
            <div style={{fontSize:13,fontWeight:700,color:"#dc2626",fontFamily:ff}}>{c.phone}</div>
            {c.vhf&&<div style={{fontSize:10,fontFamily:ff}}>VHF : canal {c.vhf}</div>}
          </a>)}
        </div>
      </div>
      <div style={{background:"#eff6ff",borderRadius:12,padding:14}}>
        <div style={{fontSize:13,fontWeight:600,color:"#1e40af",marginBottom:6,fontFamily:ff}}>📻 Canaux VHF</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div style={{background:"#fff",borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:28,fontWeight:800,color:"#1e40af",fontFamily:ff}}>{reg.vhf1||"69"}</div><div style={{fontSize:10,color:"#6b7280",fontFamily:ff}}>Rond 1 (PAV/Opti)</div></div>
          <div style={{background:"#fff",borderRadius:8,padding:10,textAlign:"center"}}><div style={{fontSize:28,fontWeight:800,color:"#1e40af",fontFamily:ff}}>{reg.vhf2||"72"}</div><div style={{fontSize:10,color:"#6b7280",fontFamily:ff}}>Rond 2 (Cata/Dér)</div></div>
        </div>
      </div>
      {Object.keys(byRolePhone).length>0&&<div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
        <div style={{fontSize:13,fontWeight:600,marginBottom:8,fontFamily:ff}}>👥 Contacts bénévoles</div>
        {Object.entries(byRolePhone).map(([rid,vs])=>{
          const role=VOL_ROLES.find(r=>r.id===rid);
          return <div key={rid} style={{border:"1px solid #f1f5f9",borderRadius:8,padding:6,marginBottom:4}}>
            <div style={{fontSize:10,fontWeight:600,color:"#6b7280",fontFamily:ff,marginBottom:2}}>{role?.name}</div>
            {vs.map(v=><div key={v.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,fontFamily:ff}}><span>{v.firstName} {v.name}</span><a href={`tel:${v.phone}`} style={{color:"#3b82f6"}}>{v.phone}</a></div>)}
          </div>;
        })}
      </div>}
    </div>}

    {sub==="emargement"&&<div className="print-target" style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:14,fontWeight:700,fontFamily:ff}}>Feuille d'émargement bénévoles</div>
        <Btn v="secondary" s="sm" icon="🖨️" onClick={()=>window.print()}>Imprimer</Btn>
      </div>
      <div style={{fontSize:12,color:"#6b7280",marginBottom:8,fontFamily:ff}}>Régate du {fmtDate(reg.date)}</div>
      <table style={{width:"100%",fontSize:12,borderCollapse:"collapse",fontFamily:ff}}>
        <thead><tr style={{background:"#f1f5f9"}}><th style={{border:"1px solid #e2e8f0",padding:6,textAlign:"left"}}>Nom</th><th style={{border:"1px solid #e2e8f0",padding:6,textAlign:"left"}}>Prénom</th><th style={{border:"1px solid #e2e8f0",padding:6,textAlign:"left"}}>Poste</th><th style={{border:"1px solid #e2e8f0",padding:6,textAlign:"left",width:100}}>Signature</th></tr></thead>
        <tbody>
          {vols.map(v=>{const role=VOL_ROLES.find(r=>r.id===v.role); return <tr key={v.id}><td style={{border:"1px solid #e2e8f0",padding:6}}>{v.name}</td><td style={{border:"1px solid #e2e8f0",padding:6}}>{v.firstName}</td><td style={{border:"1px solid #e2e8f0",padding:6,fontSize:10}}>{role?.name||"-"}</td><td style={{border:"1px solid #e2e8f0",padding:6}}></td></tr>;})}
          {Array(Math.max(0,10-vols.length)).fill(0).map((_,i)=><tr key={`e${i}`}><td style={{border:"1px solid #e2e8f0",padding:10}}></td><td style={{border:"1px solid #e2e8f0",padding:10}}></td><td style={{border:"1px solid #e2e8f0",padding:10}}></td><td style={{border:"1px solid #e2e8f0",padding:10}}></td></tr>)}
        </tbody>
      </table>
    </div>}

    {sub==="parcours"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {[{name:"Rond 1 : PAV (T293 & RCB) / Optimist",vhf:reg.vhf1||"69",color:"#ef4444",bouees:["Départ : bouée cylindrique jaune","Bouée 1 : conique orange","Bouées 2,3,4 : cylindriques blanches BP","Arrivée : frite jaune + bateau pavillon bleu"]},
        {name:"Rond 2 : INC / IND / OpenSkiff",vhf:reg.vhf2||"72",color:"#22c55e",bouees:["Départ : bouée cylindrique jaune","Bouée 1 : cylindrique jaune BP","Bouée 2 : cylindrique blanche BP","Bouée 3 : cylindrique orange BP","Bouée 4 : conique orange","Arrivée : frite jaune + bateau pavillon bleu"]}
      ].map((r,i)=><div key={i} style={{background:"#fff",borderRadius:12,padding:14,borderTop:`4px solid ${r.color}`,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
        <div style={{fontSize:13,fontWeight:700,fontFamily:ff,marginBottom:4}}>{r.name}</div>
        <div style={{fontSize:11,color:"#3b82f6",fontWeight:600,marginBottom:8,fontFamily:ff}}>📻 VHF Canal {r.vhf}</div>
        <div style={{fontSize:11,fontFamily:ff,lineHeight:1.8,marginBottom:8}}>{r.bouees.map((b,j)=><div key={j}>{b}</div>)}</div>
        <div style={{background:"#f8fafc",borderRadius:6,padding:8,fontSize:11,fontFamily:ff,lineHeight:1.6}}>
          <strong>EXT :</strong> Départ – 1 – 2 – 3 – 2 – 3 – Arrivée<br/>
          <strong>INT :</strong> Départ – 1 – 4 – 1 – 2 – 3 – Arrivée<br/>
          <strong>R :</strong> Départ – 1 – 2 – 3 – Arrivée
        </div>
      </div>)}
    </div>}
  </div>;
};

// ── TAB: MAILS ──
const TabMails = ({reg}) => {
  const [sel,setSel]=useState(MAIL_TEMPLATES[0].id);
  const tpl = MAIL_TEMPLATES.find(t=>t.id===sel);
  const content = tpl ? fillMail(tpl,reg) : {subject:"",body:""};
  const [body,setBody]=useState(content.body);
  const [subj,setSubj]=useState(content.subject);

  useEffect(()=>{ const c=tpl?fillMail(tpl,reg):{subject:"",body:""}; setBody(c.body); setSubj(c.subject); },[sel,reg.name,reg.date]);

  const copy = t => { navigator.clipboard?.writeText(t); };

  return <div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:13,fontWeight:600,marginBottom:8,fontFamily:ff}}>Modèles de mails</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:6}}>
        {MAIL_TEMPLATES.map(t=><button key={t.id} onClick={()=>setSel(t.id)} style={{padding:"6px 10px",borderRadius:8,fontSize:11,fontFamily:ff,border:sel===t.id?"2px solid #3b82f6":"1px solid #e2e8f0",background:sel===t.id?"#eff6ff":"#f8fafc",color:sel===t.id?"#1e40af":"#475569",cursor:"pointer",textAlign:"left",fontWeight:sel===t.id?700:500}}>{t.label}</button>)}
      </div>
    </div>

    <div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:13,fontWeight:600,fontFamily:ff}}>Contenu du mail</div>
        <Btn v="primary" s="sm" icon="📋" onClick={()=>copy(subj+"\n\n"+body)}>Copier tout</Btn>
      </div>
      <div style={{marginBottom:8}}>
        <label style={{fontSize:11,fontWeight:600,color:"#6b7280",fontFamily:ff}}>Objet</label>
        <div style={{display:"flex",gap:4}}><input value={subj} onChange={e=>setSubj(e.target.value)} style={{flex:1,padding:"6px 10px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,fontFamily:ff}}/><button onClick={()=>copy(subj)} style={{padding:"4px 8px",background:"#f1f5f9",border:"none",borderRadius:5,cursor:"pointer",fontSize:12}}>📋</button></div>
      </div>
      <div>
        <label style={{fontSize:11,fontWeight:600,color:"#6b7280",fontFamily:ff}}>Corps</label>
        <div style={{position:"relative"}}><textarea value={body} onChange={e=>setBody(e.target.value)} style={{width:"100%",height:220,padding:10,border:"1px solid #e2e8f0",borderRadius:7,fontSize:12,fontFamily:"monospace",boxSizing:"border-box",resize:"vertical"}}/><button onClick={()=>copy(body)} style={{position:"absolute",top:8,right:8,padding:"3px 7px",background:"#f1f5f9",border:"none",borderRadius:5,cursor:"pointer",fontSize:12}}>📋</button></div>
      </div>
    </div>

    <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:12}}>
      <div style={{fontSize:12,fontWeight:600,color:"#92400e",fontFamily:ff}}>💡 Personnalisez le mail avant envoi. N'oubliez pas de joindre les documents nécessaires.</div>
    </div>
  </div>;
};

// ── TAB: AVIS DE COURSE ──
const TabAvis = ({reg}) => {
  const isRIR = reg.grade==="5C"||reg.grade==="5B";
  return <div style={{display:"flex",flexDirection:"column",gap:12}}>
    {isRIR&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:14}}>
      <div style={{fontSize:13,fontWeight:700,color:"#92400e",fontFamily:ff,marginBottom:4}}>⚠️ Régates 5C/5B : Règlement Intérieur de Régate (RIR)</div>
      <div style={{fontSize:12,color:"#78350f",fontFamily:ff,marginBottom:8}}>Utilisez une Fiche Course à la place des Instructions de Course (IC).</div>
      <ExtLink href={LINKS.fiche_rir}>📄 Modèle Fiche Course RIR</ExtLink>
    </div>}

    <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12,padding:14}}>
      <div style={{fontSize:13,fontWeight:700,color:"#1e40af",fontFamily:ff,marginBottom:4}}>📋 Modèles officiels FFVoile 2025</div>
      <div style={{fontSize:12,color:"#1e40af",fontFamily:ff,marginBottom:10}}>{isRIR?"Pour votre régate "+reg.grade+", utilisez l'AC simplifié + Fiche Course (pas d'IC).":"Pour 5A et supérieures : AC complet + IC types."}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        <ExtLink href={LINKS.ac_simple} style={{padding:"5px 10px",background:isRIR?"#1e40af":"#fff",color:isRIR?"#fff":"#1e40af",borderRadius:7,border:"1px solid #1e40af",fontSize:11,textDecoration:"none"}}>AC simplifié 5C/5B ↗</ExtLink>
        <ExtLink href={LINKS.ac_complet} style={{padding:"5px 10px",background:!isRIR?"#1e40af":"#fff",color:!isRIR?"#fff":"#1e40af",borderRadius:7,border:"1px solid #1e40af",fontSize:11,textDecoration:"none"}}>AC complet ↗</ExtLink>
        {!isRIR&&<ExtLink href={LINKS.ic_types} style={{padding:"5px 10px",background:"#fff",color:"#1e40af",borderRadius:7,border:"1px solid #1e40af",fontSize:11,textDecoration:"none"}}>IC types ↗</ExtLink>}
      </div>
    </div>

    {isRIR&&<div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:13,fontWeight:700,fontFamily:ff,marginBottom:6}}>📄 Structure Fiche Course RIR</div>
      <div style={{fontSize:12,color:"#475569",fontFamily:ff,lineHeight:1.8}}>
        <strong>1. Règles applicables</strong> — RIR, avis de course, fiche course<br/>
        <strong>2. Programme</strong> — Briefing obligatoire 11h, nombre de courses<br/>
        <strong>3. Parcours</strong> — Zone de course, description des marques<br/>
        <strong>4. Procédure de départ</strong> — Signaux, pavillons de série<br/>
        <strong>5. Rappels</strong> — Individuel (X), Général (1er substitut)<br/>
        <strong>6. Pénalités RIR</strong> — Observateur, 1 tour, DSQ<br/>
        <strong>7. Émargement</strong> — Obligatoire au retour, sanction DNF<br/>
        <strong>8. Classement</strong> — Points, rejet, départage
      </div>
    </div>}

    <div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:13,fontWeight:700,fontFamily:ff,marginBottom:6}}>Structure avis de course</div>
      <div style={{fontSize:12,color:"#475569",fontFamily:ff,lineHeight:1.8}}>
        <strong>1. Organisateur</strong> — AMATH KAKIKOUKA<br/>
        <strong>2. Dates et lieu</strong> — {fmtDate(reg.date)} à {reg.location||"[Lieu]"}<br/>
        <strong>3. Classes admises</strong> — {(reg.supports||[]).join(", ")||"[Supports]"}<br/>
        <strong>4. Grade</strong> — {reg.grade} {isRIR&&"(RIR applicable)"}<br/>
        <strong>5. Inscriptions</strong> — Formulaire en ligne, droits : 12 € (solo) / 24 € (double) / 30 € (double + loc. cata)<br/>
        <strong>6. Programme</strong> — Accueil 9h, briefing {isRIR?"11h":"10h45"}, 1er départ 12h<br/>
        <strong>7. Contact</strong> — Email/téléphone organisateur<br/>
        <strong>8. Assurance</strong> — RC obligatoire, licence compétition
      </div>
    </div>

    {isRIR&&<div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:13,fontWeight:700,fontFamily:ff,marginBottom:6}}>🚩 Pavillons RIR</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {[
          ["Série","Signal avertissement (pavillon classe)"],["P","Signal préparatoire"],
          ["X","Rappel individuel (OCS)"],["1er substitut","Rappel général"],
          ["AP","Départ retardé"],["N","Course annulée"],
          ["Bleu","Ligne d'arrivée"],["C","Changement de parcours"],
          ["Y","Brassière obligatoire"],["Orange","En course"],
        ].map(([k,v],i)=><div key={i} style={{background:"#f8fafc",borderRadius:6,padding:6,fontSize:11,fontFamily:ff}}><strong>{k}</strong> — {v}</div>)}
      </div>
    </div>}

    <div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
      <div style={{fontSize:13,fontWeight:700,fontFamily:ff,marginBottom:6}}>✅ Checklist publication</div>
      {[
        "Lien inscription en ligne intégré","Programme horaire détaillé",
        "Tarifs (12 € solo / 24 € double / 30 € double + loc)",
        "Contact organisateur",
        isRIR?"Fiche course jointe (pas IC)":"Instructions de course jointes",
        "Envoyé à VPB et clubs","Publié sur site web club","Transmis aux arbitres pour relecture",
      ].map((item,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",fontSize:12,color:"#475569",fontFamily:ff}}>
        <div style={{width:16,height:16,border:"1.5px solid #cbd5e1",borderRadius:4,flexShrink:0}}/>
        {item}
      </div>)}
    </div>
  </div>;
};

// ═══════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════
export default function App() {
  const [screen,setScreen]=useState("home");
  const [regattas,setRegattas]=useState([]);
  const [curId,setCurId]=useState(null);
  const [tab,setTab]=useState("dashboard");
  const [sbCfg,setSbCfg]=useState(loadLS(SB_KEY));
  const [sb,setSb]=useState(null);
  const [toast,setToast]=useState(null);

  // Modals
  const [showCreate,setShowCreate]=useState(false);
  const [showJoin,setShowJoin]=useState(false);
  const [showShare,setShowShare]=useState(false);
  const [showSbCfg,setShowSbCfg]=useState(false);
  const [showNewTask,setShowNewTask]=useState(false);
  const [joinCode,setJoinCode]=useState("");
  const [newReg,setNewReg]=useState({name:"",date:"",grade:"5B"});
  const [newTask,setNewTask]=useState({cat:"admin",title:"",desc:"",jb:30,req:false});

  const cur = regattas.find(r=>r.id===curId);

  useEffect(()=>{if(sbCfg?.url&&sbCfg?.key) setSb(makeSB(sbCfg.url,sbCfg.key));},[sbCfg]);
  useEffect(()=>{ const d=loadLS(LS_KEY); if(d?.regattas) setRegattas(d.regattas); const p=new URLSearchParams(window.location?.search||""); const c=p.get("join"); if(c){setJoinCode(c.toUpperCase());setShowJoin(true);} },[]);
  useEffect(()=>{ saveLS(LS_KEY,{regattas}); },[regattas]);

  const flash = (msg,type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  // CRUD régate
  const createReg = () => {
    if(!newReg.name.trim()){flash("Nom obligatoire","err");return;}
    const r = {
      id:uid(), name:newReg.name.trim(), date:newReg.date, grade:newReg.grade,
      location:"Plage du Trez-Hir — Centre Nautique de PLOUGONVELIN",
      supports:[], expected_participants:50, vhf1:"69", vhf2:"72",
      share_code:shareCode(), created_at:new Date().toISOString(),
      tasks: DEFAULT_TASKS.map(t=>({...t,id:uid(),done:false})),
      volunteers:[], adminDocs:ADMIN_DOCS.map(d=>({...d,status:"pending"})),
    };
    setRegattas(p=>[r,...p]); setCurId(r.id); setScreen("detail"); setTab("dashboard");
    setShowCreate(false); setNewReg({name:"",date:"",grade:"5B"});
    flash(`Régate « ${r.name} » créée !`);
  };

  const joinReg = () => {
    const c=joinCode.trim().toUpperCase(); if(!c){flash("Code requis","err");return;}
    const f=regattas.find(r=>r.share_code===c);
    if(f){setCurId(f.id);setScreen("detail");setTab("dashboard");setShowJoin(false);setJoinCode("");flash(`Connecté à « ${f.name} »`);}
    else flash("Code introuvable","err");
  };

  const delReg = id => {
    if(!window.confirm("Supprimer cette régate ?")) return;
    setRegattas(p=>p.filter(r=>r.id!==id));
    if(curId===id){setCurId(null);setScreen("home");}
    flash("Régate supprimée");
  };

  // CRUD tasks
  const setTasks = fn => setRegattas(p=>p.map(r=>r.id===curId?{...r,tasks:typeof fn==="function"?fn(r.tasks):fn}:r));
  const setVols = fn => setRegattas(p=>p.map(r=>r.id===curId?{...r,volunteers:typeof fn==="function"?fn(r.volunteers):fn}:r));
  const setDocs = fn => setRegattas(p=>p.map(r=>r.id===curId?{...r,adminDocs:typeof fn==="function"?fn(r.adminDocs):fn}:r));
  const updateReg = upd => setRegattas(p=>p.map(r=>r.id===curId?{...r,...upd}:r));

  const addTask = () => {
    if(!newTask.title.trim()){flash("Titre obligatoire","err");return;}
    setTasks(p=>[...p,{...newTask,id:uid(),done:false}]);
    setShowNewTask(false);setNewTask({cat:"admin",title:"",desc:"",jb:30,req:false});
    flash("Tâche ajoutée");
  };

  // ─── TABS CONFIG ───
  const TABS = [
    {id:"dashboard",label:"Accueil",icon:"🏠"},
    {id:"tasks",label:"Planning",icon:"📋"},
    {id:"admin",label:"Admin",icon:"📁"},
    {id:"volunteers",label:"Bénévoles",icon:"👥"},
    {id:"docs",label:"Documents",icon:"📄"},
    {id:"mails",label:"Mails",icon:"✉️"},
    {id:"avis",label:"Avis course",icon:"🏆"},
    {id:"settings",label:"Config",icon:"⚙️"},
  ];

  // ─── RENDER: HOME ───
  const renderHome = () => (
    <div style={{maxWidth:700,margin:"0 auto",padding:16}}>
      <div style={{background:"linear-gradient(135deg,#0c1e3a,#1e40af,#0369a1)",borderRadius:18,padding:28,marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-10,fontSize:100,opacity:.08,transform:"rotate(-15deg)"}}>⛵</div>
        <h1 style={{fontFamily:ff2,fontSize:28,fontWeight:800,color:"#fff",margin:"0 0 6px"}}>Régates Organizer</h1>
        <div style={{color:"#93c5fd",fontSize:14,fontFamily:ff}}>AMATH KAKIKOUKA</div>
        <div style={{color:"#60a5fa80",fontSize:11,fontFamily:ff}}>v{VER} {sb?"• 🟢 Sync":"• Mode local"}</div>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <Btn icon="➕" s="lg" onClick={()=>setShowCreate(true)}>Nouvelle régate</Btn>
        <Btn icon="🔗" v="secondary" s="lg" onClick={()=>setShowJoin(true)}>Rejoindre</Btn>
        <Btn icon="⚙️" v="ghost" s="lg" onClick={()=>setShowSbCfg(true)}>Supabase</Btn>
      </div>

      {regattas.length===0?<div style={{textAlign:"center",padding:50,background:"#f8fafc",borderRadius:14,border:"2px dashed #cbd5e1"}}>
        <div style={{fontSize:44,marginBottom:12}}>⛵</div>
        <div style={{fontSize:15,color:"#475569",fontWeight:600,fontFamily:ff}}>Aucune régate</div>
        <div style={{fontSize:13,color:"#94a3b8",fontFamily:ff}}>Créez votre première régate ou rejoignez-en une.</div>
      </div>:
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {regattas.map(r=>{
          const d=daysUntil(r.date); const tasks=r.tasks||[]; const done=tasks.filter(t=>t.done).length;
          return <div key={r.id} style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:12,padding:16,cursor:"pointer",transition:"all .2s",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}} onClick={()=>{setCurId(r.id);setScreen("detail");setTab("dashboard");}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,fontFamily:ff,color:"#0f172a"}}>⛵ {r.name}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:4}}>
                  {r.date&&<Badge label={`📅 ${fmtShort(r.date)}`} color="#6366f1" small/>}
                  <Badge label={r.grade} color="#d97706" small/>
                  {r.share_code&&<Badge label={`🔗 ${r.share_code}`} color="#8b5cf6" small/>}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {d!==null&&<div style={{fontSize:20,fontWeight:800,color:d<=7?"#dc2626":"#3b82f6",fontFamily:ff}}>{d<0?"Passée":`J-${d}`}</div>}
                <button onClick={e=>{e.stopPropagation();delReg(r.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#94a3b8"}}>🗑️</button>
              </div>
            </div>
            <ProgressBar val={done} total={tasks.length}/>
          </div>;
        })}
      </div>}
    </div>
  );

  // ─── RENDER: DETAIL ───
  const renderDetail = () => {
    if(!cur) return null;
    return <div style={{maxWidth:800,margin:"0 auto",padding:16,paddingBottom:80}}>
      {/* Header */}
      <div className="no-print" style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <Btn icon="←" v="ghost" s="sm" onClick={()=>{setScreen("home");setTab("dashboard");}}>Retour</Btn>
        <div style={{flex:1}}/>
        <Btn icon="📤" v="secondary" s="sm" onClick={()=>setShowShare(true)}>Partager</Btn>
      </div>

      {/* Tab bar */}
      <div className="no-print" style={{display:"flex",gap:3,overflowX:"auto",marginBottom:14,padding:"2px 0"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,fontFamily:ff,border:"none",cursor:"pointer",whiteSpace:"nowrap",background:tab===t.id?"#1e40af":"#f1f5f9",color:tab===t.id?"#fff":"#475569"}}>{t.icon} {t.label}</button>)}
      </div>

      {/* Tab content */}
      {tab==="dashboard"&&<TabDashboard reg={cur} tasks={cur.tasks||[]} vols={cur.volunteers||[]}/>}
      {tab==="tasks"&&<TabPlanning reg={cur} tasks={cur.tasks||[]} setTasks={setTasks} onNewTask={()=>setShowNewTask(true)}/>}
      {tab==="admin"&&<TabAdmin reg={cur} docs={cur.adminDocs||[]} setDocs={setDocs}/>}
      {tab==="volunteers"&&<TabVolunteers vols={cur.volunteers||[]} setVols={setVols}/>}
      {tab==="docs"&&<TabDocs reg={cur} vols={cur.volunteers||[]}/>}
      {tab==="mails"&&<TabMails reg={cur}/>}
      {tab==="avis"&&<TabAvis reg={cur}/>}
      {tab==="settings"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:"#fff",borderRadius:12,padding:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
          <div style={{fontSize:13,fontWeight:700,fontFamily:ff,marginBottom:10}}>⚙️ Configuration régate</div>
          <Input label="Nom" value={cur.name} onChange={v=>updateReg({name:v})}/>
          <Input label="Date" type="date" value={cur.date||""} onChange={v=>updateReg({date:v})}/>
          <Input label="Lieu" value={cur.location||""} onChange={v=>updateReg({location:v})}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:"#374151",fontFamily:ff}}>Grade</label>
              <select value={cur.grade} onChange={e=>updateReg({grade:e.target.value})} style={{width:"100%",padding:"8px 10px",border:"1.5px solid #d1d5db",borderRadius:9,fontSize:13,fontFamily:ff}}>{GRADES.map(g=><option key={g.value} value={g.value}>{g.label}</option>)}</select>
            </div>
            <Input label="Participants" type="number" value={cur.expected_participants||50} onChange={v=>updateReg({expected_participants:parseInt(v)||50})}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Input label="VHF Rond 1" value={cur.vhf1||"69"} onChange={v=>updateReg({vhf1:v})}/>
            <Input label="VHF Rond 2" value={cur.vhf2||"72"} onChange={v=>updateReg({vhf2:v})}/>
          </div>
          <div style={{marginTop:8}}>
            <label style={{fontSize:12,fontWeight:600,color:"#374151",fontFamily:ff,display:"block",marginBottom:6}}>Supports admis</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {SUPPORTS.map(s=><button key={s} onClick={()=>updateReg({supports:(cur.supports||[]).includes(s)?(cur.supports||[]).filter(x=>x!==s):[...(cur.supports||[]),s]})} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontFamily:ff,border:"none",cursor:"pointer",background:(cur.supports||[]).includes(s)?"#1e40af":"#f1f5f9",color:(cur.supports||[]).includes(s)?"#fff":"#475569",fontWeight:600}}>{s}</button>)}
            </div>
          </div>
        </div>
        {cur.share_code&&<div style={{background:"#f5f3ff",borderRadius:12,padding:14}}>
          <div style={{fontSize:13,fontWeight:600,color:"#5b21b6",fontFamily:ff,marginBottom:4}}>🔗 Code de partage</div>
          <div style={{fontSize:24,fontWeight:800,letterSpacing:4,color:"#1e40af",fontFamily:ff}}>{cur.share_code}</div>
        </div>}
      </div>}
    </div>;
  };

  // ─── RENDER ───
  return <div style={{minHeight:"100vh",background:"linear-gradient(180deg,#f0f4ff,#fafbff,#f8fafc)",fontFamily:ff}}>
    <style>{CSS}</style>

    {/* Toast */}
    {toast&&<div style={{position:"fixed",top:16,right:16,zIndex:9999,background:toast.type==="err"?"#fef2f2":"#f0fdf4",color:toast.type==="err"?"#dc2626":"#16a34a",border:`1.5px solid ${toast.type==="err"?"#fecaca":"#bbf7d0"}`,borderRadius:10,padding:"10px 18px",fontSize:13,fontWeight:600,boxShadow:"0 6px 20px rgba(0,0,0,.08)",fontFamily:ff,animation:"slideUp .3s",maxWidth:360}}>{toast.type==="err"?"⚠️":"✅"} {toast.msg}</div>}

    {screen==="home"&&renderHome()}
    {screen==="detail"&&renderDetail()}

    {/* Create Modal */}
    <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="Nouvelle régate">
      <Input label="Nom" value={newReg.name} onChange={v=>setNewReg({...newReg,name:v})} placeholder="Ex. : Coupe du Finistère" req/>
      <Input label="Date" type="date" value={newReg.date} onChange={v=>setNewReg({...newReg,date:v})}/>
      <div><label style={{fontSize:12,fontWeight:600,color:"#374151",fontFamily:ff}}>Grade</label><select value={newReg.grade} onChange={e=>setNewReg({...newReg,grade:e.target.value})} style={{width:"100%",padding:"8px 10px",border:"1.5px solid #d1d5db",borderRadius:9,fontSize:13,fontFamily:ff,marginTop:4,marginBottom:14}}>{GRADES.map(g=><option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
      <div style={{fontSize:11,color:"#64748b",marginBottom:14,fontFamily:ff}}>💡 La régate sera préremplie avec {DEFAULT_TASKS.length} tâches types et {ADMIN_DOCS.length} documents administratifs.</div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setShowCreate(false)}>Annuler</Btn><Btn onClick={createReg} icon="⛵">Créer</Btn></div>
    </Modal>

    {/* Join Modal */}
    <Modal open={showJoin} onClose={()=>setShowJoin(false)} title="Rejoindre une régate">
      <div style={{fontSize:13,color:"#475569",marginBottom:14,fontFamily:ff}}>Entrez le code de partage fourni par l'organisateur.</div>
      <Input label="Code" value={joinCode} onChange={v=>setJoinCode(v.toUpperCase())} placeholder="ABC123" req/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>{setShowJoin(false);setJoinCode("");}}>Annuler</Btn><Btn onClick={joinReg} icon="🔗">Rejoindre</Btn></div>
    </Modal>

    {/* Share Modal */}
    <Modal open={showShare} onClose={()=>setShowShare(false)} title="Partager cette régate">
      {cur&&<div>
        <div style={{textAlign:"center",padding:16,background:"#f0f4ff",borderRadius:12,marginBottom:16}}>
          <div style={{fontSize:12,color:"#64748b",fontFamily:ff}}>Code de partage</div>
          <div style={{fontSize:32,fontWeight:800,color:"#1e40af",letterSpacing:5,fontFamily:ff}}>{cur.share_code}</div>
        </div>
        <div style={{textAlign:"center",marginBottom:16}}>
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${window.location?.origin||"https://regatta-organizer-v3.vercel.app"}?join=${cur.share_code}`)}`} alt="QR" style={{borderRadius:10,border:"2px solid #e2e8f0"}} width="160" height="160"/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn v="success" icon="📱" style={{flex:1}} onClick={()=>{const url=`${window.location?.origin}?join=${cur.share_code}`; window.open(`https://wa.me/?text=${encodeURIComponent(`Rejoins la régate « ${cur.name} » !\nCode : ${cur.share_code}\nLien : ${url}`)}`,"_blank");}}>WhatsApp</Btn>
          <Btn v="secondary" icon="📋" onClick={()=>{navigator.clipboard?.writeText(`Code : ${cur.share_code}`);flash("Copié !");}}>Copier</Btn>
        </div>
      </div>}
    </Modal>

    {/* Supabase Config Modal */}
    <Modal open={showSbCfg} onClose={()=>setShowSbCfg(false)} title="Configuration Supabase">
      <div style={{fontSize:12,color:"#64748b",marginBottom:14,fontFamily:ff}}>Connectez Supabase pour la synchronisation multi-appareils. Sans Supabase, les données restent locales.</div>
      <Input label="URL du projet" value={sbCfg?.url||""} onChange={v=>setSbCfg({...sbCfg,url:v})} placeholder="https://xxxxx.supabase.co"/>
      <Input label="Clé API (anon)" value={sbCfg?.key||""} onChange={v=>setSbCfg({...sbCfg,key:v})} placeholder="eyJhbGciOi…"/>
      <div style={{display:"flex",gap:8}}>
        <Btn onClick={()=>{saveLS(SB_KEY,sbCfg);setSb(makeSB(sbCfg?.url,sbCfg?.key));setShowSbCfg(false);flash("Configuration enregistrée")}} icon="💾">Enregistrer</Btn>
        {sbCfg?.url&&<Btn v="danger" onClick={()=>{setSbCfg(null);setSb(null);saveLS(SB_KEY,null);flash("Déconnecté");}}>Déconnecter</Btn>}
      </div>
    </Modal>

    {/* New Task Modal */}
    <Modal open={showNewTask} onClose={()=>setShowNewTask(false)} title="Nouvelle tâche personnalisée">
      <Input label="Titre" value={newTask.title} onChange={v=>setNewTask({...newTask,title:v})} placeholder="Titre de la tâche" req/>
      <Input label="Description" value={newTask.desc} onChange={v=>setNewTask({...newTask,desc:v})} placeholder="Détails…" textarea/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <div>
          <label style={{fontSize:12,fontWeight:600,color:"#374151",fontFamily:ff}}>Catégorie</label>
          <select value={newTask.cat} onChange={e=>setNewTask({...newTask,cat:e.target.value})} style={{width:"100%",padding:"8px 10px",border:"1.5px solid #d1d5db",borderRadius:9,fontSize:13,fontFamily:ff}}>{TASK_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
        </div>
        <Input label="Jours avant (J-?)" type="number" value={newTask.jb} onChange={v=>setNewTask({...newTask,jb:parseInt(v)||0})}/>
      </div>
      <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontFamily:ff,marginBottom:14}}><input type="checkbox" checked={newTask.req} onChange={e=>setNewTask({...newTask,req:e.target.checked})}/>Tâche obligatoire</label>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn v="secondary" onClick={()=>setShowNewTask(false)}>Annuler</Btn><Btn onClick={addTask} icon="➕">Ajouter</Btn></div>
    </Modal>
  </div>;
}
