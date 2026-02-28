# Mock Exam FIDE — Guide d’implémentation (Codex)

Ce guide est une checklist courte pour implémenter sans improvisation.

---

## 1) Sanity — Schémas à créer

Basés sur `06_Data_Contracts.ts` (source de vérité TS).

### 1.1 MockExamTask

Champs essentiels :

- `taskType` (enum `TaskType`)
- `introBlocks` (`TaskMediaBlock[]`)
- `aiTaskContext` (string optionnel)
- `activities` (`Activity[]`)
- `correctionBlocks` (`TaskMediaBlock[]`)

Notes :

- `activities[]` est ordonné (Sanity array order)
- `activities[]` a un `_key` automatique, utilisé comme `activityKey` dans les réponses

### 1.2 ExamCompilation

Champs essentiels :

- `userId`
- `examConfig: MockExamConfigRef` (refs)
- `oralBranch: { recommended, chosen? }`
- `writtenCombo: { recommended, chosen? }`
- `session: MockExamSession[]` (5 dernières)

### 1.3 User credits

User possède :

- `credits[]` avec `referenceKey="mock_exam"`, `totalCredits`, `remainingCredits`

Règle :

- création compilation payante : `remainingCredits--`

---

## 2) Runner (page unique) — `/mock-exam/[compilationId]`

Au mount :

1. fetch `ExamCompilation`
2. trouver une session `in_progress` sinon en créer une nouvelle
3. hydrater Zustand (`examConfig`, `resume`, choix, scores, overtime)
4. rendre le composant correspondant à `resume.state`

**Guards internes** :

- interdire de passer à une section si les prérequis ne sont pas remplis (ex: branch non fixée)

**Back navigateur / quitter** :

- afficher modale “Quitter l’examen ?” (continuer / quitter)

---

## 3) Speaking runner (A2 + branche)

- boucle sur tasks (`MockExamConfigRef`) puis sur `activities[]`
- flow : record → STT → user edits transcript → validate
- persister `SpeakingAnswer` à chaque validation (taskId + activityKey)
- analyse IA : possible “au fil de l’eau” (stockée dans answer), affichée fin de section

---

## 4) Comprendre (2 packs)

Selon chemin :

- A2+A1 → `listeningPackIds.A1` puis `listeningPackIds.A2`
- A2+B1 → `listeningPackIds.A2` puis `listeningPackIds.B1`

Résultat : stocker seulement `scores.listening`.

---

## 5) Read/Write runner

- tasks = `readWriteTaskIds` selon `writtenCombo.chosen`
- UI : textareas par activity
- si 3+ sous-tâches → accordion (question en trigger, textarea dans body)
- hors temps : modale `Arrêter` / `Continuer hors temps` + ajout `overtimeTaskRefs`

---

## 6) Pruning (après choix)

Après fixation des choix (1ère tentative) :

- oralBranch fixé : supprimer la branche non choisie + prune listening packs non nécessaires
- writtenCombo fixé : supprimer le combo RW non choisi

---

## 7) Fin de session (cleanup)

En fin d’exam :

- conserver `scores` (+ `overtimeTaskRefs`)
- supprimer `speakA2Answers`, `speakBranchAnswers`, `readWriteAnswers`
- conserver l’historique des 5 dernières sessions

Option :

- si “retour prof” demandé : créer `ExamReview` (plus tard) et transférer les answers avant purge.

---

## 8) Style & UI

- shadcn/ui + Tailwind
- inspiration : `/fide/dashboard`
- Framer Motion : animations minimales (fade/slide courts)
