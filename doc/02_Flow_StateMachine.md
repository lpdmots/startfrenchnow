# 02 — Flow & State Machine (MVP) — Mock Exam FIDE (avec compilation + sessions)

Ce document décrit le **parcours utilisateur**, la **state machine** et les **règles de persistance** pour l’examen blanc FIDE dans l’app.  
La logique est **data-driven via Sanity** (`MockExamTask` / `Activity`) et l’examen est **compilé** en amont dans un document `ExamCompilation` (puis relançable).

---

## 1) Concepts & objets (résumé)

### 1.1 Objets Sanity de contenu
- **`MockExamTask`** : une tâche (speaking A2/A1/B1 ou read/write M1…M6) contenant :
  - `taskType: TaskType`
  - `introBlocks: TaskMediaBlock[]` (peut être `[]`)
  - `activities: Activity[]` (ordre Sanity)
  - `aiTaskContext?` + `activities[].aiContext?`
  - `correctionBlocks: TaskMediaBlock[]` (peut être `[]`)

> **Règles fixes (codées dans le programme, pas dans la data)** :
> - STT toujours activé
> - transcript toujours éditable + validation obligatoire
> - 3 essais max
> - feedback/scoring affichés à la fin de chaque section (Parler A2 complet / Parler branche complet / Lire-Écrire complet)
> - `_key` Sanity = identifiant stable d’un élément d’array `activities[]`

ExamCompilation.examConfig est plein au moment de la compilation (A1/B1 + RW combos + listening packs).

Après le premier choix utilisateur (oralBranch, puis writtenCombo), on prune examConfig :

- suppression des refs non choisies (branches/combos non utilisés),

- la compilation devient “figée” et plus légère.

### 1.2 Compilation d’examen & tentatives
- **`ExamCompilation`** : “examen compilé” accessible depuis le dashboard
  - `examConfig: MockExamConfigRef` (refs vers tasks/packs)
  - `oralBranch` et `writtenCombo` : **proposés par l’IA puis choisis** (et verrouillés ensuite)
  - `session: MockExamSession[]` : historique des tentatives (on garde **les 5 dernières**)
- **`MockExamSession`** : une tentative (attempt)
  - `status`, `startedAt`, `resume`, `scores`, `overtimeTaskRefs?`
  - Les réponses (`speakA2Answers`, etc.) sont **présentes pendant la session** puis **supprimées en fin de session** (on conserve uniquement les scores).
  - Option fin de session : si l’utilisateur demande un retour prof → les réponses sont transférées dans un document `ExamReview`.

> Important : un utilisateur peut relancer une compilation autant qu’il veut (retake), ou créer une nouvelle compilation (payant).  
> **Retake = même compilation** (mêmes tâches référencées, mêmes choix oralBranch/writtenCombo verrouillés).

---

## 2) Vue d’ensemble du flow (MVP)

### 2.1 Dashboard FIDE
1. L’utilisateur voit la liste de ses `ExamCompilation`.
2. Il peut :
   - **Relancer** une compilation existante (retake),
   - **Créer une nouvelle compilation** (payant), qui apparaît ensuite dans la liste et peut être lancée.

### 2.2 Lancement d’une tentative (MockExamSession)
1. Au lancement, l’app crée une nouvelle entrée dans `ExamCompilation.session[]` (status `in_progress`) et initialise `resume`.
2. L’utilisateur suit le parcours :

#### A. Intro examen
- Vidéo explicative skippable (règles, format, avertissements).

#### B. Parler A2 obligatoire
- `examConfig.speakA2TaskIds` (généralement 3 tasks) exécutées **dans l’ordre**.
- Chaque `MockExamTask.activities[]` = prompts successifs :
  - `record → STT → user edits transcript → validate` (max 3 essais)
  - on stocke un `SpeakingAnswer` par activity (avec `taskId` + `activityKey`)
- Analyse IA possible **au fur et à mesure** (stockée sur chaque answer), mais **affichage feedback/scoring seulement à la fin** de la section A2.
- À la fin A2 : l’IA propose **oralBranch** (A1/B1). L’utilisateur choisit (première fois), puis ce choix est stocké dans `ExamCompilation.oralBranch`.

#### C. Parler branche (A1 ou B1)
- `examConfig.speakBranchTaskIds[A1|B1]` exécutées.
- Même mécanique par activity.
- Affichage feedback/scoring seulement à la fin de la section “Parler branche”.

#### D. Comprendre (2 niveaux selon le chemin)
> Règle : la compréhension est aussi une **combinaison de 2 niveaux** :
- Si chemin oral = **A2 + A1** → Comprendre = **A1 + A2**
- Si chemin oral = **A2 + B1** → Comprendre = **A2 + B1**

Donc l’app lance 2 blocs du composant existant :
- soit `listeningPackIds.A1` puis `listeningPackIds.A2`
- soit `listeningPackIds.A2` puis `listeningPackIds.B1`
et agrège ensuite un score `scores.listening`.

#### E. Proposition automatique de combinaison Lire/Écrire
- L’IA propose `writtenCombo` (`A1_A2` ou `A2_B1`) selon les scores (règles paramétrables dans le programme).
- L’utilisateur choisit (première fois). Ensuite **verrouillé** dans `ExamCompilation.writtenCombo`.

#### F. Lire/Écrire
- On exécute les tasks référencées par :
  - `examConfig.readWriteTaskIds[A1_A2]` **ou** `examConfig.readWriteTaskIds[A2_B1]`
- Affichage feedback/scoring seulement à la fin de la section Lire/Écrire.

#### G. Fin d’examen
- Récap : réussites/difficultés + scores par section.
- Option : “Demander un retour professeur” → transfert réponses dans `ExamReview`.
- Nettoyage : suppression des réponses de la session (aussi les audios dans aws!), conservation des scores.

---

## 3) State machine (états principaux)

> Les états sont des **phases UX**.  
> La granularité “question/prompt” est gérée via `resume.taskId` + `resume.activityKey` et la progression dans `activities[]`.

### 3.1 États
- `EXAM_DASHBOARD`
- `COMPILATION_CREATE` (payant, si activé)
- `COMPILATION_DETAIL`

- `EXAM_INIT`
- `EXAM_INTRO`

- `SPEAK_A2_INTRO`
- `SPEAK_A2_RUN`      (boucle activities / tasks A2)
- `SPEAK_A2_RESULT`   (affichage feedback/scoring A2 + proposition oralBranch)

- `ORAL_BRANCH_LOCKED_INFO` (affiche recommended/chosen; choix désactivé en retake)
- `SPEAK_BRANCH_INTRO`
- `SPEAK_BRANCH_RUN`
- `SPEAK_BRANCH_RESULT`

- `LISTENING_INTRO` (fixé dans le programme)
- `LISTENING_RUN`     (2 sous-blocs internes selon combo)
- `WRITTEN_COMBO_RESULT` (affiche recommended/chosen; choix désactivé en retake)

- `READ_WRITE_RUN`
- `READ_WRITE_RESULT`

- `EXAM_SUMMARY`
- `EXAM_COMPLETED`

---

## 4) Transitions & règles (détaillées)

### 4.1 Dashboard & compilation
- `EXAM_DASHBOARD`
  - (select compilation) → `COMPILATION_DETAIL`
  - (create new compilation) → `COMPILATION_CREATE` → `COMPILATION_DETAIL`

- `COMPILATION_DETAIL`
  - (start / retake) → `EXAM_INIT`

### 4.2 Création d’une tentative
- `EXAM_INIT`
  - crée une nouvelle entrée `MockExamSession` dans `ExamCompilation.session[]` :
    - `status="in_progress"`
    - `startedAt=now`
    - `resume.state="EXAM_INTRO"`
  - applique règle de rétention :
    - conserver **les 5 dernières** sessions (trim si nécessaire)
  - → `EXAM_INTRO`

### 4.3 Intro
- `EXAM_INTRO`
  - (skip/ended) → `SPEAK_A2_INTRO`

### 4.4 Parler A2 (run)
- `SPEAK_A2_INTRO`
  - (skip/ended) → `SPEAK_A2_RUN`
  - initialise `resume` :
    - `resume.taskId = first(examConfig.speakA2TaskIds)._ref`
    - `resume.activityKey = firstActivityKey(taskId)` (depuis fetch task)
    - `resume.state = "SPEAK_A2_RUN"`

- `SPEAK_A2_RUN` (boucle)
  - Pour l’activity courante :
    - enregistrement audio
    - STT
    - édition transcript
    - validation
    - persist `SpeakingAnswer { taskId, activityKey, audioUrl, transcriptFinal, AiFeedback?, AiScore? }`
    - si une règle de temps est dépassée (programme) → ajouter le ref task dans `overtimeTaskRefs` (voir §5)
  - progression :
    - s’il existe une prochaine activity dans la task → avancer `resume.activityKey`
    - sinon si prochaine task A2 → avancer `resume.taskId` et reset `resume.activityKey` (première activity)
    - sinon (fin A2) → `SPEAK_A2_RESULT`

- `SPEAK_A2_RESULT`
  - calcule/agrège `scores.speakA2` (depuis AiScore ou via correction fin section)
  - calcule `ExamCompilation.oralBranch.recommended`
  - si `ExamCompilation.oralBranch.chosen` absent (première tentative) :
    - l’utilisateur choisit A1/B1 → on écrit `chosen`
  - sinon (retake) :
    - choix disabled, affichage indicatif recommended/chosen
  - → `SPEAK_BRANCH_INTRO`

### 4.5 Parler branche
- `SPEAK_BRANCH_INTRO`
  - sélectionne la liste de tasks :
    - si `oralBranch.chosen="A1"` → `examConfig.speakBranchTaskIds.A1`
    - si `oralBranch.chosen="B1"` → `examConfig.speakBranchTaskIds.B1`
  - init `resume.taskId` + `resume.activityKey`
  - → `SPEAK_BRANCH_RUN`

- `SPEAK_BRANCH_RUN`
  - même boucle que `SPEAK_A2_RUN` mais sur tasks de branche
  - → `SPEAK_BRANCH_RESULT` quand fin

- `SPEAK_BRANCH_RESULT`
  - agrège `scores.speakBranch`
  - → `LISTENING_RUN`

### 4.6 Comprendre (2 niveaux)
- `LISTENING_RUN`
  - si chemin oral = A2 + A1 :
    - run composant compréhension sur `listeningPackIds.A1`
    - run composant compréhension sur `listeningPackIds.A2`
  - si chemin oral = A2 + B1 :
    - run sur `listeningPackIds.A2`
    - run sur `listeningPackIds.B1`
  - agrège `scores.listening`
  - → `WRITTEN_COMBO_RESULT`

### 4.7 Combinaison écrit (verrouillable)
- `WRITTEN_COMBO_RESULT`
  - calcule `writtenCombo.recommended`
  - si `writtenCombo.chosen` absent (première tentative) :
    - l’utilisateur choisit `A1_A2` ou `A2_B1` → écrire `chosen`
  - sinon (retake) :
    - choix disabled, affichage indicatif
  - → `READ_WRITE_RUN`

### 4.8 Lire/Écrire
- `READ_WRITE_RUN`
  - charge tasks selon `writtenCombo.chosen`
  - boucle `activities[]` :
    - l’utilisateur saisit la réponse texte
    - persist `ReadWriteAnswer { taskId, activityKey, textAnswer, AiFeedback?, AiScore? }`
    - si dépassement d’une règle de temps (programme) → ajouter le ref task à `overtimeTaskRefs`
  - fin → `READ_WRITE_RESULT`

- `READ_WRITE_RESULT`
  - agrège `scores.readWrite`
  - agrège `scores.total` si nécessaire
  - → `EXAM_SUMMARY`

### 4.9 Fin
- `EXAM_SUMMARY`
  - affiche récap + scores + indicateur “hors temps” basé sur `overtimeTaskRefs`
  - action :
    - (request teacher review) → créer `ExamReview` (hors scope) en transférant les réponses
  - **nettoyage obligatoire** :
    - supprimer `speakA2Answers`, `speakBranchAnswers`, `readWriteAnswers` de la session, ainsi que les audios dans aws SI pas de demande d'ExamReview.
    - conserver uniquement `scores` (+ `overtimeTaskRefs`)
  - set `status="completed"`
  - → `EXAM_COMPLETED`

---

## 5) Règles “hors temps” (`overtimeTaskRefs`)
- `overtimeTaskRefs?: Reference[]` stocke les **refs Sanity** des tasks où l’utilisateur a dépassé un temps imparti.
- Le temps imparti et la condition de dépassement sont **définis dans le programme** (pas dans la data).
- Règle d’écriture :
  - si une task est déjà présente dans `overtimeTaskRefs`, ne pas dupliquer
  - ajouter `{ _type:"reference", _ref: taskId }` quand la condition “hors temps” se déclenche.

---

## 6) Notes d’implémentation minimales (pour Codex)

### 6.1 Fetch Sanity
- La config contient des `Reference[]` : il faut résoudre `_ref` vers le document `MockExamTask`.
- Les réponses se relient à :
  - `taskId` = Sanity `_id`
  - `activityKey` = Sanity `activities[]` item `_key`

### 6.2 Retake (compilation existante)
- Si retake :
  - `oralBranch.chosen` et `writtenCombo.chosen` sont **déjà renseignés** → choix UI disabled
  - on crée une nouvelle entrée `MockExamSession` et on exécute le même chemin.

### 6.3 Nettoyage fin de session
- À la fin d’une session :
  - conserver `scores` + `overtimeTaskRefs`
  - supprimer les answers (mais transfert vers `ExamReview` si demandé)

---

## 7) Checklist des écrans (minimale)
- Dashboard compilations
- Détail compilation (Start / Retake / New compilation payant)
- Intro examen (vidéo)
- Parler A2 (runner activities)
- Résultat A2 + affichage oralBranch (choix si 1ère fois, sinon disabled)
- Parler branche (runner)
- Résultat branche
- Comprendre (2 blocs)
- Résultat writtenCombo (choix si 1ère fois, sinon disabled)
- Lire/Écrire (runner)
- Résultat lire/écrire
- Récap + option “retour professeur”
