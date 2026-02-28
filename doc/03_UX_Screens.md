# 03 — UX Screens (MVP) — Mock Exam Runner (Next.js, page unique)

Objectif : définir **les écrans**, leurs **CTA**, et les règles UX essentielles pour que l’expérience soit “mode examen” (séquentielle, sans retour arrière).  
Ce document reste volontairement **simple** : il décrit la structure et les comportements attendus, pas l’UI pixel perfect.

---

## 0) Règles UX globales (toutes les phases)

### 0.1 Navigation

- **Pas de retour arrière entre épreuves** (comme un vrai examen).
- L’utilisateur avance toujours via un CTA principal “Continuer”.

### 0.2 Header persistant (recommandé)

Affiché sur toutes les phases “en cours d’examen” (sauf Intro & Summary si tu veux).

- `Section` : Parler A2 / Parler Branche / Comprendre / Lire-Écrire
- `Progress` : Tâche X/Y + Question i/n (basé sur `MockExamTask` + `activities[]`)
- `Essais` : Essai a/3 (speaking)
- `Autosave` : état visuel discret (Sauvegarde… / Enregistré ✓)

### 0.3 États standards (composants)

Chaque écran doit gérer :

- `loading` (fetch/patch)
- `error` (retry)
- `offline/slow network` (message + retry)

---

## 1) Dashboard (section Mock Exams)

### 1.1 Liste des compilations

**But** : afficher les `ExamCompilation` disponibles.

- Carte compilation : titre, dernière tentative, scores récents (si existants)
- CTA : `Lancer` / `Relancer`
- CTA secondaire : `Créer une nouvelle compilation` (payant)

**Comportement**

- Cliquer une compilation → `/dashboard/mock-exams/[compilationId]`

---

## 2) Détail compilation — `/dashboard/mock-exams/[compilationId]`

**But** : lancer/relancer l’examen compilé.

- Résumé : oralBranch & writtenCombo (si fixés), “verrouillé” si déjà choisi
- Historique : 5 dernières `MockExamSession` (scores uniquement)
- CTA principal : `Démarrer` (ou `Relancer`)
- CTA secondaire : `Retour dashboard`

**Comportement**

- `Démarrer/Relancer` → route `/exam/[compilationId]` (Exam Runner)

---

## 3) Exam Runner — `/exam/[compilationId]` (page unique)

### 3.1 Écran : EXAM_INTRO

**But** : cadrer l’expérience.

- Vidéo intro skippable
- 3 bullets max : durée, pas de retour arrière, progression enregistrée

**CTA**

- `Commencer`

---

## 4) Parler A2 (obligatoire)

### 4.1 Écran : SPEAK_A2_INTRO (par task si introBlocks non vide)

**But** : présenter l’épreuve A2 (selon `MockExamTask.introBlocks[]`)

- Carousel/stack simple des `introBlocks` (texte/vidéo/image)
- CTA principal : `Commencer la tâche`

> Si `introBlocks=[]`, on saute cet écran.

---

### 4.2 Écran : SPEAK_A2_RUN (runner activities)

**But** : exécuter les prompts (`activities[]`) dans l’ordre, sur plusieurs tasks.

#### Layout recommandé

- **Stimulus** (selon activity) :
    - image si `activity.image`
    - player audio si `activity.audioUrl`
    - prompt rich text si `activity.promptText`
- **Réponse orale** :
    - bouton record (gros)
    - après record : player pour réécouter
    - STT auto puis éditeur transcript (obligatoire)
- **CTA**
    - principal : `Valider ma réponse`
    - secondaire : `Refaire (essai 2/3)` puis `Refaire (essai 3/3)` (désactivé après 3)

#### Micro-interactions

- Après validation : toast “Réponse enregistrée ✓” + autoswitch vers prompt suivant.
- Autosave : patch session à chaque validation (réponse + resume).

---

### 4.3 Écran : SPEAK_A2_ANALYZE (court)

**But** : rendre l’attente acceptable.

- Message : “Analyse de ta section A2…”
- Loader/animation légère (pas trop longue)

---

### 4.4 Écran : SPEAK_A2_RESULT (résultats + choix branche)

**But** : afficher feedback/scoring A2 (fin de section) + proposer la branche.

Contenu :

- Score A2 (et feedback résumé)
- Correction type : `correctionBlocks[]` des tasks A2 (afficher en accordéon/sections)
- Bloc “Branche recommandée” :
    - si première tentative : choix A1/B1 activé
    - sinon (retake) : affichage indicatif, choix disabled

**CTA**

- `Continuer`

**Comportement important (pruning)**

- Après validation du choix `oralBranch.chosen` :
    - supprimer les refs de branche non choisie dans `examConfig.speakBranchTaskIds`
    - ajuster `examConfig.listeningPackIds` pour ne garder que les niveaux nécessaires au chemin (A1+A2 ou A2+B1)

---

## 5) Parler branche (A1 ou B1)

### 5.1 Écran : SPEAK_BRANCH_INTRO

Même logique que A2 : afficher `introBlocks` si présents.

### 5.2 Écran : SPEAK_BRANCH_RUN

Même runner que A2 (record → STT → edit → validate).

### 5.3 Écran : SPEAK_BRANCH_ANALYZE

Analyse courte (identique).

### 5.4 Écran : SPEAK_BRANCH_RESULT

- Score + feedback
- Correction type via `correctionBlocks[]`
- CTA : `Continuer`

---

## 6) Comprendre (2 blocs)

### 6.1 Écran : LISTENING_PART_INTRO (partie 1/2)

**But** : expliquer qu’il y a 2 niveaux.

- Titre : “Comprendre — Partie 1/2 : niveau X”
- CTA : `Commencer`

### 6.2 Écran : LISTENING_RUN (composant existant)

- Exécute le composant existant (pack 1)
- À la fin → passer au pack 2

### 6.3 Écran : LISTENING_PART_INTRO (partie 2/2)

- Titre : “Comprendre — Partie 2/2 : niveau Y”
- CTA : `Commencer`

### 6.4 Écran : LISTENING_RESULT (simple)

- Affiche score global Comprendre (pas besoin de détail)
- CTA : `Continuer`

---

## 7) Combo Lire/Écrire (choix écrit)

### 7.1 Écran : WRITTEN_COMBO_RESULT

- Affiche combo recommandé (A1_A2 ou A2_B1)
- Choix activé uniquement si première tentative, sinon disabled (informatif)

**CTA**

- `Continuer`

**Comportement important (pruning)**

- Après validation du choix `writtenCombo.chosen` :
    - supprimer les refs du combo non choisi dans `examConfig.readWriteTaskIds`

---

## 8) Lire/Écrire (modules)

### 8.1 Écran : READ_WRITE_INTRO

- Rappel : 60 minutes, pas de retour arrière
- CTA : `Commencer`

### 8.2 Écran : READ_WRITE_RUN (runner)

**But** : exécuter les tasks/modules dans l’ordre.

#### Layout recommandé

- Header : “Module i / n”
- Zone scénario : `introBlocks` (si utilisés comme scénario) + supports (texte/vidéo/image)
- Zone réponses : champs texte pour chaque `activity` (selon ton modèle)
- CTA : `Valider et continuer` (module suivant) / `Soumettre Lire/Écrire` (dernier)

#### Hors temps (UX demandée)

Quand une règle de temps est dépassée pour une task :

- afficher **une modale warning** :
    - message : “Temps dépassé. Pour être conforme, tu dois arrêter.”
    - actions :
        - `Arrêter`
        - `Continuer hors temps` (continue mais marque la task dans `overtimeTaskRefs`)
- éviter de reshow la modale en boucle : une seule fois par task (puis badge discret “Hors temps”).

### 8.3 Écran : READ_WRITE_ANALYZE

Analyse courte.

### 8.4 Écran : READ_WRITE_RESULT

- Score + feedback
- Correction type (si `correctionBlocks` présents)
- CTA : `Continuer`

---

## 9) Récap final

### 9.1 Écran : EXAM_SUMMARY

Contenu :

- Scores : Parler A2 / Parler branche / Comprendre / Lire-Écrire / Total
- Indicateur conformité :
    - si `overtimeTaskRefs` non vide → “Hors temps (non conforme)”
- CTA principal : `Terminer`

CTA secondaire :

- `Demander un retour professeur` (si activé)
    - action : transfert answers vers `ExamReview` (hors scope)
    - dans tous les cas : purge answers de la session, garder uniquement scores

---

## 10) Quitter l’examen (modale globale)

Déclencheurs possibles :

- back navigateur
- fermeture/refresh détecté (si géré)
- bouton “Quitter” (si tu l’ajoutes)

Modal :

- Titre : “Quitter l’examen ?”
- Texte : “Ta progression est enregistrée. Tu pourras reprendre plus tard.”
- Actions : `Continuer l’examen` / `Quitter`
