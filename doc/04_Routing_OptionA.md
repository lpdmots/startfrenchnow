# 04 — Routing (Option A) — Next.js + Zustand (Mock Exam)

Ce document définit le routing minimal et les règles de navigation pour une UX “app-like” (page unique) pour le passage d’un examen blanc.

## 1) Routes retenues

### Dashboard

- `/fide/dashboard#exams`
    - Pas de page dédiée : c’est une **section** “Mock exams” dans le dashboard (liste des `ExamCompilation`, CTA “débloquer une compilation” payant).

### Détail compilation

- `/mock-exams/[compilationId]`
    - Détail d’une `ExamCompilation` :
        - bouton **Start / Retake**
        - affichage des **5 dernières sessions** (scores uniquement)
        - statut “in_progress” si une session est en cours

### Runner (page unique)

- `/mock-exams/[compilationId]/runner`
    - Page unique “Exam Runner” :
        - contrôle toute l’expérience (intro, parler A2, parler branche, comprendre, lire/écrire, résultats)
        - navigation **interne** pilotée par `resume.state` (pas de sous-routes)

---

## 2) Principes UX de navigation

- **Aucun retour arrière entre épreuves** (comme un vrai examen).
- Les étapes sont strictement séquentielles.
- Le navigateur “Back” n’est pas utilisé pour naviguer dans l’examen.

### Quitter l’examen (Back navigateur / fermeture)

- Si l’utilisateur tente de quitter (Back, refresh, fermeture onglet), on affiche une modale :
    - **Titre** : “Quitter l’examen ?”
    - **Texte** : “Ta progression est enregistrée. Tu pourras reprendre plus tard.”
    - **Actions** : `Continuer l’examen` / `Quitter`
- Objectif : limiter les sorties involontaires, sans bloquer.

---

## 3) Comportement au mount de `/mock-exams/[compilationId]/runner`

### 3.1 Chargement et (re)prise

À l’ouverture de la page :

1. **Fetch** `ExamCompilation` par `compilationId`.
2. Déterminer la session courante :
    - Si une `MockExamSession.status === "in_progress"` existe → c’est la session active.
    - Sinon → créer une nouvelle `MockExamSession` (`status="in_progress"`, `startedAt=now`, `resume.state="EXAM_INTRO"`), puis refetch/patch local.

3. **Hydratation Zustand** avec :
    - `examConfig` (refs Sanity, potentiellement déjà “pruned”)
    - `oralBranch` / `writtenCombo`
    - `resume`
    - `scores` (si présents)
    - `overtimeTaskRefs` (si présents)

4. **Render** du screen correspondant à `resume.state`.

### 3.2 Rétention de sessions

- Conserver **les 5 dernières** sessions dans `ExamCompilation.session[]`.
- En fin de session :
    - suppression des réponses (`speakA2Answers`, `speakBranchAnswers`, `readWriteAnswers`)
    - conservation des scores + `overtimeTaskRefs`
    - si “retour professeur” demandé : transfert des réponses vers `ExamReview` (hors scope ici)

---

## 4) Navigation interne (sans routes)

La page “Runner” fonctionne comme une machine à états :

- `resume.state` = source de vérité UI
- le runner rend un composant par état (switch/mapper)

Exemples de screens (non exhaustif) :

- `EXAM_INTRO`
- `SPEAK_A2_RUN` → `SPEAK_A2_RESULT`
- `SPEAK_BRANCH_RUN` → `SPEAK_BRANCH_RESULT`
- `LISTENING_RUN`
- `WRITTEN_COMBO_RESULT`
- `READ_WRITE_RUN` → `READ_WRITE_RESULT`
- `EXAM_SUMMARY`

---

## 5) Guards (cohérence du parcours)

Même avec une page unique, l’app doit empêcher les incohérences.

### 5.1 Guards de progression (exemples)

- Si `resume.state` exige un choix absent :
    - ex: accès à `SPEAK_BRANCH_RUN` alors que `oralBranch.chosen` est vide
    - → corriger en repositionnant `resume.state` vers l’écran précédent logique (ex: `SPEAK_A2_RESULT`)

- Si `writtenCombo.chosen` est vide :
    - → empêcher le démarrage du `READ_WRITE_RUN` et renvoyer vers `WRITTEN_COMBO_RESULT`.

### 5.2 Retake (choix verrouillés)

- Si `ExamCompilation.oralBranch.chosen` existe :
    - écran branche = **informatif** (disabled)
- Si `ExamCompilation.writtenCombo.chosen` existe :
    - écran combo écrit = **informatif** (disabled)

---

## 6) Persistance (Sanity) et Zustand

### 6.1 Source de vérité

- La session en cours est persistée dans `ExamCompilation.session[]`.
- `resume` est persisté et sert à **reprendre** après refresh/reopen.

### 6.2 Stratégie d’autosave

- Sur chaque action critique :
    - validation d’une activity (Speaking/ReadWrite)
    - changement d’état (`resume.state`)
    - ajout `overtimeTaskRefs`
- → patch Sanity + mise à jour store.

---

## 7) Pruning de `examConfig` (après choix)

Après le **premier choix** utilisateur :

- Après `SPEAK_A2_RESULT` (oralBranch fixé) :
    - supprimer les refs de la branche non choisie dans `examConfig.speakBranchTaskIds`
    - ajuster `examConfig.listeningPackIds` pour ne garder que les niveaux nécessaires au chemin (A1+A2 ou A2+B1)
- Après `WRITTEN_COMBO_RESULT` (writtenCombo fixé) :
    - supprimer les refs du combo non choisi dans `examConfig.readWriteTaskIds`

Objectif : ne pas “consommer” les branches non jouées, et permettre leur réutilisation dans de futures compilations.

---

## 8) Notes Next.js

- Route `/mock-exams/[compilationId]/runner` peut être implémentée en App Router (`app/[locale]/(mock-exam)/mock-exams/[compilationId]/runner/page.tsx`).
- La page doit être protégée (auth) et afficher :
    - loading state
    - error state (fetch/patch)
    - retry action
