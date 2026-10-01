import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config.js';

// INSCRIPTION
export async function inscription(pseudo, email, motDePasse) {
  try {
    const resultat = await createUserWithEmailAndPassword(
      auth,
      email,
      motDePasse
    );
    const user = resultat.user;

    await updateProfile(user, { displayName: pseudo });

    await setDoc(doc(db, 'joueurs', user.uid), {
      pseudo: pseudo,
      email: email,
      uid: user.uid,
      amis: [],
      stats: { partiesJouees: 0, victoires: 0, defaites: 0 },
      creeLe: new Date().toISOString(),
    });

    return { succes: true, user };
  } catch (erreur) {
    return { succes: false, message: traduireErreur(erreur.code) };
  }
}

// CONNEXION
export async function connexion(email, motDePasse) {
  try {
    const resultat = await signInWithEmailAndPassword(auth, email, motDePasse);
    return { succes: true, user: resultat.user };
  } catch (erreur) {
    return { succes: false, message: traduireErreur(erreur.code) };
  }
}

// DÉCONNEXION
export async function deconnexion() {
  try {
    await signOut(auth);
    return { succes: true };
  } catch (erreur) {
    return { succes: false, message: 'Erreur lors de la déconnexion' };
  }
}

// SURVEILLER LA CONNEXION
export function surChangementDeConnexion(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) callback(user);
    else callback(null);
  });
}

// TRADUIRE LES ERREURS
function traduireErreur(code) {
  const erreurs = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/invalid-email': "Cet email n'est pas valide.",
    'auth/weak-password':
      'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/user-not-found': 'Aucun compte trouvé avec cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/too-many-requests': 'Trop de tentatives. Réessaie plus tard.',
    'auth/network-request-failed': 'Problème de connexion internet.',
  };
  return erreurs[code] || 'Une erreur est survenue.';
}