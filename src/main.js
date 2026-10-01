// ============================================================
// NIGHTY - TEST CHAT
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from './firebase/config.js';

// ============================================================
// RÉCUPÉRATION DES ÉLÉMENTS
// ============================================================

const ecranAuth = document.getElementById('ecran-auth');
const ecranChat = document.getElementById('ecran-chat');

const inputPseudo = document.getElementById('pseudo');
const inputEmail = document.getElementById('email');
const inputMdp = document.getElementById('mdp');
const btnInscription = document.getElementById('btn-inscription');
const btnConnexion = document.getElementById('btn-connexion');
const messageAuth = document.getElementById('message-auth');

const userActuel = document.getElementById('user-actuel');
const chatMessages = document.getElementById('chat-messages');
const chatInputTexte = document.getElementById('chat-input-texte');
const btnEnvoyer = document.getElementById('btn-envoyer');

// ============================================================
// AUTHENTIFICATION
// ============================================================

btnInscription.addEventListener('click', async () => {
  const pseudo = inputPseudo.value.trim();
  const email = inputEmail.value.trim();
  const mdp = inputMdp.value;

  if (!pseudo || !email || !mdp) {
    afficherMessageAuth('Remplis tous les champs', 'erreur');
    return;
  }

  try {
    const resultat = await createUserWithEmailAndPassword(auth, email, mdp);
    await updateProfile(resultat.user, { displayName: pseudo });
    afficherMessageAuth('Compte créé !', 'succes');
  } catch (erreur) {
    afficherMessageAuth(traduireErreur(erreur.code), 'erreur');
  }
});

btnConnexion.addEventListener('click', async () => {
  const email = inputEmail.value.trim();
  const mdp = inputMdp.value;

  if (!email || !mdp) {
    afficherMessageAuth('Remplis email + mot de passe', 'erreur');
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, mdp);
    afficherMessageAuth('Connecté !', 'succes');
  } catch (erreur) {
    afficherMessageAuth(traduireErreur(erreur.code), 'erreur');
  }
});

// ============================================================
// SURVEILLANCE DE CONNEXION
// ============================================================

onAuthStateChanged(auth, (user) => {
  if (user) {
    ecranAuth.classList.add('cache');
    ecranChat.classList.remove('cache');
    userActuel.textContent = user.displayName || user.email;
    demarrerChat();
  } else {
    ecranAuth.classList.remove('cache');
    ecranChat.classList.add('cache');
    chatMessages.innerHTML = '';
  }
});

// ============================================================
// CHAT EN TEMPS RÉEL
// ============================================================

let ecouteMessages = null; // pour pouvoir arrêter l'écoute

function demarrerChat() {
  // Si on écoutait déjà, on arrête
  if (ecouteMessages) ecouteMessages();

  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('creeLe', 'asc'));

  // On écoute en temps réel
  ecouteMessages = onSnapshot(q, (snapshot) => {
    chatMessages.innerHTML = '';

    snapshot.forEach((doc) => {
      const data = doc.data();
      const estMoi = data.uid === auth.currentUser.uid;

      const msgDiv = document.createElement('div');
      msgDiv.className = 'message' + (estMoi ? ' moi' : '');
      msgDiv.innerHTML = `
        <div class="auteur">${data.pseudo}</div>
        <div class="texte">${echapperHTML(data.texte)}</div>
      `;

      chatMessages.appendChild(msgDiv);
    });

    // Scroll en bas
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

// Envoyer un message
async function envoyerMessage() {
  const texte = chatInputTexte.value.trim();
  if (!texte) return;

  const user = auth.currentUser;
  if (!user) return;

  try {
    await addDoc(collection(db, 'messages'), {
      uid: user.uid,
      pseudo: user.displayName || user.email,
      texte: texte,
      creeLe: serverTimestamp(),
    });
    chatInputTexte.value = '';
  } catch (erreur) {
    console.error('Erreur envoi :', erreur);
  }
}

btnEnvoyer.addEventListener('click', envoyerMessage);
chatInputTexte.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') envoyerMessage();
});

// ============================================================
// UTILITAIRES
// ============================================================

function afficherMessageAuth(texte, type) {
  messageAuth.textContent = texte;
  messageAuth.className = 'message-auth';
  if (type === 'succes') messageAuth.classList.add('succes');
}

function echapperHTML(texte) {
  const div = document.createElement('div');
  div.textContent = texte;
  return div.innerHTML;
}

function traduireErreur(code) {
  const erreurs = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/invalid-email': 'Email invalide.',
    'auth/weak-password': 'Mot de passe : 6 caractères minimum.',
    'auth/user-not-found': 'Aucun compte trouvé.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/too-many-requests': 'Trop de tentatives. Réessaie plus tard.',
  };
  return erreurs[code] || 'Une erreur est survenue.';
}

console.log('✅ Chat Nighty prêt !');
