# Mock Exam FIDE — README (Préprompt Codex)

## Objectif

Mettre en place dans Start French Now une fonctionnalité **d’examen blanc FIDE** (expérience “mode examen”, séquentielle, sans retour arrière) avec :

- **Compilation** d’un mock exam à partir d’éléments (tasks/packs Sanity)
- **Runner** sur une page unique `/exam/[compilationId]`
- **Corrections IA** (speaking + read/write), et **comprendre** via composant existant
- **Retake** (relancer une compilation) avec chemin verrouillé
- **Crédits** utilisateur (clé `mock_exam`) : 1 crédit consommé à chaque compilation payante

Langue UI : **FR uniquement**, sauf dans le dashboard où il faut utiliser les dictionnaires FR/EN.

---

## Tech stack & contraintes

- Next.js **App Router** (`app/`)
- TypeScript partout
- Tailwind + shadcn/ui (déjà partiellement), design inspiration : page `/fide/dashboard`
- Animations : Framer Motion (minimal : fade/slide courts)
- Auth : NextAuth (le `userId` vient de la session auth)
- Data : Sanity (GROQ + serverActions)
    - client : `import { client } from "@/app/lib/sanity.client";`
    - mutations (create/patch) : **server-side uniquement** via serverActions

---

## Routing (Option A — page unique)

- Dashboard : `/dashboard#mock-exams` (section “Mock exam”)
- Détail compilation : `/dashboard/mock-exams/[compilationId]`
- Runner : `/exam/[compilationId]` (**page unique**, pas de `/resume`)

➡️ Le runner affiche les écrans selon `resume.state` (source de vérité = session Sanity).

---

## Documents de référence (à respecter)

- `MOCK_EXAM_Impl_Guide`
- `01_FIDE_exam.md`
- `02_flow_state_machine.md`
- `03_UX_Screens.md`
- `04_Routing_OptionA.md`
- `05_UI_Preferences_MockExam.md`
- `06_Data_Contracts.ts` (types finaux : `MockExamTask`, `ExamCompilation`, `MockExamSession`, etc.)

---

## Réutilisation (IMPORTANT)

Ne pas réinventer la roue : s’inspirer des patterns existants.

### Audio UI

S’inspirer de :

- `ExpandableCardDemo` + enfants (`AudioOverlayPlayer`, etc.), mais ne pas reprendre le code qui est assez brouillon.

### STT (transcription)

S’inspirer de la route existante :

- `/home/nicou/projects/start-french-now/app/api/fide-exam-b1/transcribe/route.ts`

### Feedback IA / corrections

S’inspirer des serverActions existantes :

- `/home/nicou/projects/start-french-now/app/serverActions/fideExamActions.ts`

---

## Logique produit (résumé)

### Compilation & crédits

- L’utilisateur a une liste de `ExamCompilation` dans le dashboard.
- Il peut **relancer** une compilation (retake) ou **créer une nouvelle compilation** (payant).
- Les crédits sont dans `user.credits[]` (Sanity), avec `referenceKey="mock_exam"`.
    - création compilation : consomme **1 crédit** (`remainingCredits--`)
    - la compilation est créée puis ajoutée dans le tableau, ensuite sur la ligne on peut cliquer "Commencer".

### Chemin verrouillé (retake)

- `oralBranch` et `writtenCombo` sont **choisis une seule fois** (1ère tentative), ensuite affichés en “disabled/informatif”.

### Pruning (après choix)

Après choix définitif :

- prune la branche non choisie dans `examConfig.speakBranchTaskIds`
- prune les packs compréhension non requis (A1+A2 ou A2+B1)
- prune le combo read/write non choisi dans `examConfig.readWriteTaskIds`

Objectif : ne pas “consommer” les éléments non joués et permettre leur réutilisation lors d’une future compilation.

### Sessions (attempts)

- `ExamCompilation.session[]` contient l’historique des tentatives.
- Conserver **les 5 dernières** sessions.
- Pendant une session : on stocke les réponses (`*Answers`).
- Fin de session : on **supprime les réponses** et on conserve uniquement `scores` (+ `overtimeTaskRefs`).
- Option : “retour professeur” → transfert des réponses dans le document `ExamReview`.

### Hors temps

- Si une règle de temps (codée dans le programme) est dépassée pour une task :
    - afficher une modale warning : `Arrêter` / `Continuer hors temps`
    - si continue : ajouter la ref task à `overtimeTaskRefs`

---

## Ce que Codex doit produire (scope)

1. Schémas Sanity (schemas) pour :
    - `MockExamTask`
    - `ExamCompilation`
    - (optionnel / plus tard) `ExamReview`
2. Runner `/exam/[compilationId]` (page unique) + store Zustand + écrans (cf. docs UX)
3. ServerActions Sanity : create/patch session, save answers, save resume, pruning, finalize session
4. UI cohérente (shadcn/ui + Tailwind + inspiration `/fide/dashboard`)

Non-scope (pour MVP) :

- tests automatisés
- page d’achat multi-crédits (prévue plus tard)

---

## Conventions projet (structure)

Créer les dossiers :

- `app/components/mock-exam/` (UI)
- `app/hooks/mock-exam/` (hooks)
- `app/stores/mock-exam/` (zustand)
- `app/types/mock-exam/` (types)
- `app/schemas/mock-exam/` (sanity schemas)
- `app/serverActions/mock-exam/` (server actions)
- `app/api/mock-exam/` (routes API si nécessaire)

Garder les fichiers **petits**, éviter les “god components”.

---

## UX (principes non négociables)

- Mode examen : séquentiel, pas de retour arrière entre épreuves
- Speaking : `record → STT → edit transcript → validate`
- Feedback/scoring affiché fin de section
- Desktop : layout 2 colonnes (idéalement sans scroll)
- Mobile : CTA sticky + scroll contrôlé
- Quit modal (back navigateur / quitter) : “Ta progression est enregistrée”
