# FIDE Mini Mock Exam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un mini-examen FIDE gratuit, anonyme et réellement utilisable, qui reprend l’expérience visuelle de l’examen blanc sans exposer ni dupliquer sa logique payante.

**Architecture:** La page SEO `/[locale]/fide/mock-exams` reste indexable et présente le mini-examen. L’expérience interactive vit sur `/[locale]/fide/mock-exams/mini`, sous le layout `(mock-exam)` déjà en `noindex`. Un petit automate local orchestre trois étapes — parler, comprendre, lire — et conserve la progression dans `sessionStorage`. Les composants visuels génériques sont extraits du runner existant, tandis que l’authentification, les sessions Sanity, Stripe, Calendly, l’upload audio et les corrections OpenAI restent exclusivement dans l’examen payant. Un singleton Sanity public référence précisément un exercice existant par étape et le chargeur ne projette que les champs nécessaires.

**Tech Stack:** Next.js App Router, React, TypeScript, modules ESM testables avec `node:test`, next-intl, Sanity, Tailwind CSS, MediaRecorder navigateur, GTM `dataLayer` existant.

## Global Constraints

- Préserver tous les changements déjà présents dans le worktree ; plusieurs fichiers de la page FIDE et de la page mock-exams sont déjà modifiés.
- Ne pas modifier le contrôle d’accès, la tarification, les coupons, les sessions ou les corrections du véritable examen blanc.
- Ne jamais envoyer l’audio du mini-examen au serveur dans la version 1.
- Ne déclencher aucun appel OpenAI, aucune transcription et aucune écriture Sanity depuis le mini-examen.
- Ne pas attribuer un niveau A1, A2 ou B1 à partir du mini-examen ; afficher uniquement les scores objectifs de compréhension et de lecture.
- Ne pas ajouter la route interactive au sitemap ; elle hérite du `noindex, nofollow` de `app/[locale]/(mock-exam)/layout.tsx`.
- Charger uniquement les données des trois exercices sélectionnés, jamais la compilation payante complète.
- Passer un objet de libellés compact aux composants client ; ne pas ajouter tout `Fide.MockExamsPage` au dictionnaire client global.
- Ne pas committer, pousser, déployer ou appliquer une mutation Sanity sans demande explicite.

## Reuse Decision

| Couche | Réutilisation réaliste | Décision |
| --- | ---: | --- |
| Coquille, en-tête et progression du runner | 75–85 % | Extraire un composant partagé, sans logique de session |
| Visuel de tâche « Parler » | 80–90 % | Extraire `ActivityImageStage`; enregistrer seulement en local |
| Scénario « Comprendre » A2 | 75–85 % | Extraire le lecteur A1/A2 pur de `AudioOverlayPlayer` |
| Question « Lire » à choix unique | 60–70 % | Extraire le rendu et le scoring déterministe des `single_choice` |
| Navigation et état global | 20–30 % | Créer un automate local beaucoup plus petit |
| Sauvegarde, IA, achat, correction et résultat commercial | 0 % | Laisser dans le produit payant |

Au total, environ 60–70 % de l’interface et des données peuvent être réutilisés. La réutilisation fonctionnelle de bout en bout est plutôt de 35–45 %, car les 4 940 lignes de `RunnerScreenRouter.tsx` mélangent actuellement affichage, persistance, IA, offre commerciale et navigation. Ajouter un simple `mode="mini"` à ce composant est explicitement hors plan : cela rendrait le produit payant plus fragile et chargerait beaucoup trop de code sur une expérience gratuite.

## Product Scope V1

- **Introduction :** durée annoncée de 8–10 minutes, trois étapes, aucune création de compte.
- **Parler :** une description d’image A2 ; enregistrement local facultatif, réécoute et auto-évaluation à l’aide d’une courte liste de critères. Cette étape est marquée « réalisée », jamais notée.
- **Comprendre :** un scénario A2 existant, trois réponses, score automatique sur 3.
- **Lire :** la première activité de type `READ_WRITE_M2`, cinq questions `single_choice`, score automatique sur 5.
- **Résultat :** score objectif sur 8 pour « Comprendre + Lire », état de l’exercice oral et explication claire que ce repérage n’est ni un examen officiel ni un diagnostic de niveau.
- **Sorties :** CTA principal vers l’examen blanc payant ; liens secondaires vers le Pack FIDE et les cours privés.

---

## Task 1: Verrouiller le contrat du mini-examen avec des tests purs

**Files:**
- Create: `app/types/fide/mini-exam.ts`
- Create: `app/lib/fide/miniExamCore.mjs`
- Create: `app/lib/fide/miniExamCore.d.mts`
- Create: `scripts/mini-exam/miniExamCore.test.mjs`

- [ ] Définir les types `MiniExamConfig`, `MiniExamStep`, `MiniExamState`, `MiniExamListeningAnswer`, `MiniExamReadingAnswer` et `MiniExamResult`.
- [ ] Écrire d’abord les tests de l’automate pour la séquence stricte `intro -> speaking -> listening -> reading -> result` et les retours autorisés à l’étape précédente.
- [ ] Tester qu’une restauration `sessionStorage` invalide, d’une autre version ou incomplète revient à l’état initial sans exception.
- [ ] Tester le scoring « Comprendre » sur trois questions et « Lire » sur cinq choix uniques, y compris 0/8, 8/8, réponse absente et réponse modifiée.
- [ ] Tester que le résultat ne contient aucune propriété de niveau estimé et sépare `speakingCompleted`, `listeningScore`, `readingScore` et `objectiveMax`.
- [ ] Tester la validation d’une configuration gratuite : une tâche `IMAGE_DESCRIPTION_A2` avec image, un `fideExam` A2 avec trois réponses correctes attendues, et une première activité `READ_WRITE_M2` composée d’une consigne facultative puis uniquement de cinq `single_choice` ayant exactement une bonne option.
- [ ] Exécuter `node --test scripts/mini-exam/miniExamCore.test.mjs` et confirmer l’échec initial dû au module absent.
- [ ] Implémenter l’automate, la sérialisation versionnée, les scores et le validateur sans dépendance React, Sanity ou navigateur.
- [ ] Réexécuter `node --test scripts/mini-exam/miniExamCore.test.mjs` et obtenir 100 % de réussite.

**Expected contract:**

```ts
type MiniExamStep = "intro" | "speaking" | "listening" | "reading" | "result";

type MiniExamResult = {
    speakingCompleted: boolean;
    listeningScore: number;
    listeningMax: 3;
    readingScore: number;
    readingMax: 5;
    objectiveScore: number;
    objectiveMax: 8;
};
```

## Task 2: Ajouter une configuration Sanity publique minimale et sûre

**Files:**
- Create: `app/schemas/mock-exam/miniMockExam.ts`
- Modify: `app/schemas/index.ts`
- Create: `app/lib/fide/miniMockExam.server.ts`
- Create: `scripts/sanity/upsertMiniMockExamConfig.mjs`
- Create: `scripts/sanity/miniMockExamConfig.test.mjs`

- [ ] Écrire un test du script de configuration qui refuse un dataset inconnu, une référence absente, un exercice non publié et un exercice ne respectant pas le contrat de la Task 1.
- [ ] Créer le type Sanity `miniMockExam` avec les champs `isActive`, `speakingTask`, `listeningExam`, `readingTask`, `speakingChecklistFr`, `speakingChecklistEn`, `speakingModelAnswerFr` et `speakingModelAnswerEn`.
- [ ] Filtrer les références Studio : `IMAGE_DESCRIPTION_A2` pour parler, `fideExam` A2 en preview pour comprendre et `READ_WRITE_M2` pour lire.
- [ ] Enregistrer le schéma dans `app/schemas/index.ts` et utiliser l’identifiant singleton stable `miniMockExamConfig`.
- [ ] Implémenter `getPublicMiniMockExam(locale)` dans `miniMockExam.server.ts` avec `import "server-only"`, une requête GROQ limitée aux champs affichés et la validation fermée de `miniExamCore.mjs`.
- [ ] Ne projeter ni `aiContext`, ni `aiCorrectionContext`, ni vidéo de correction, ni prix, ni coupon, ni données de session.
- [ ] Retourner `null` si le singleton est absent, inactif, en draft ou invalide ; la route interactive répond alors avec `notFound()`.
- [ ] Implémenter `upsertMiniMockExamConfig.mjs` avec les modes `--dry-run`, `--apply` et `--verify`, sans modifier les documents sources.
- [ ] Configurer le dataset utilisé par l’application (`production`) avec : `51e9f487-5bf4-434b-b2cc-c855fcb6f7de` pour parler, `140742f0-23ca-40c3-aa29-3cd7aaaaaa96` pour comprendre et `ac353015-f8de-4b93-b60f-dcd6ea04c899` pour lire.
- [ ] Permettre le miroir vers `startfrenchnow` en remplaçant seulement la référence Comprendre par `5e190b2b-be3a-45ad-ab4e-332960f74000`; les deux tâches mock-exam conservent les mêmes IDs mais doivent malgré tout être revalidées dans ce dataset.
- [ ] Exécuter uniquement le `--dry-run` pendant le développement initial ; réserver `--apply` à l’étape de mise en service explicitement autorisée.

**Sanity projection:**

```groq
*[_id == "miniMockExamConfig" && _type == "miniMockExam" && isActive == true][0]{
  _id,
  speakingChecklistFr,
  speakingChecklistEn,
  speakingModelAnswerFr,
  speakingModelAnswerEn,
  "speaking": speakingTask->{_id, title, taskType, activities[0]{_key, image, promptText}},
  "listening": listeningExam->{_id, title, description, levels, image, tracks, responses},
  "reading": readingTask->{_id, title, taskType, activities[0]{_key, title, image, promptText, items}}
}
```

## Task 3: Extraire les briques visuelles sans changer le produit payant

**Files:**
- Create: `app/components/fide/mock-exam/RunnerShell.tsx`
- Create: `app/components/fide/mock-exam/ActivityImageStage.tsx`
- Create: `app/components/fide/mock-exam/ListeningScenarioPlayer.tsx`
- Create: `app/components/fide/mock-exam/ReadWriteSingleChoiceStage.tsx`
- Modify: `app/[locale]/(mock-exam)/mock-exams/[compilationId]/runner/RunnerClient.tsx`
- Modify: `app/[locale]/(mock-exam)/mock-exams/[compilationId]/runner/RunnerScreenRouter.tsx`
- Modify: `app/components/common/AudioOverlayPlayer.tsx`
- Modify: `app/components/ui/expandable-card-demo-standard.tsx`

- [ ] Extraire de `RunnerClient.tsx` la coquille, le titre courant et la barre des trois phases dans `RunnerShell`, avec des props de présentation et des callbacks facultatifs `onBack`/`onQuit`.
- [ ] Remplacer le markup correspondant du runner payant par `RunnerShell` sans modifier ses appels à `advanceMockExamResume`.
- [ ] Extraire `ActivityImageStage` de `RunnerScreenRouter.tsx`; rendre le texte alternatif obligatoire et fournir la même taille d’image, le même ratio réservé et les mêmes classes dans le runner payant.
- [ ] Isoler la mécanique A1/A2 de `AudioOverlayPlayer.tsx` dans `ListeningScenarioPlayer`, pilotée par `exam` et `onComplete`, sans `userId`, `updateUserProgress`, `evaluateB1Answer` ou état de modal.
- [ ] Corriger pendant l’extraction le test d’index `clickedResponse`: utiliser `clickedResponse === null` afin que l’option d’index 0 ne soit pas traitée comme « aucune réponse ».
- [ ] Conserver `AudioOverlayPlayer` comme adaptateur du parcours historique : il appelle `ListeningScenarioPlayer` pour A1/A2 et conserve séparément le parcours B1 et la mise à jour de progression existante lorsque `userId` est défini.
- [ ] Extraire uniquement le rendu `instruction + single_choice`, la navigation entre questions et les états de réponse dans `ReadWriteSingleChoiceStage`; ne pas déplacer les champs libres ni les appels de correction IA.
- [ ] Utiliser les fonctions de score de `miniExamCore.mjs` dans le nouveau composant, mais laisser le runner payant continuer à sauvegarder avec `saveMockExamReadWriteAnswer`.
- [ ] Vérifier le diff après chaque extraction : aucune condition d’accès, aucun nom d’état paid-runner et aucun payload de server action ne doit changer.
- [ ] Exécuter après chaque extraction `npm run typecheck` et un lint ciblé sur les fichiers modifiés.

**`RunnerShell` interface:**

```ts
type RunnerShellProps = {
    phases: readonly string[];
    currentPhaseIndex: number;
    title: string;
    subtitle?: string;
    onBack?: () => void;
    onQuit?: () => void;
    children: React.ReactNode;
};
```

## Task 4: Construire l’expérience locale en trois étapes

**Files:**
- Create: `app/components/fide/mock-exam/LocalSpeakingRecorder.tsx`
- Create: `app/[locale]/(mock-exam)/fide/mock-exams/mini/page.tsx`
- Create: `app/[locale]/(mock-exam)/fide/mock-exams/mini/MiniMockExamClient.tsx`
- Create: `app/[locale]/(mock-exam)/fide/mock-exams/mini/MiniMockExamResult.tsx`
- Create: `app/lib/miniExamTracking.client.ts`

- [ ] Créer la page serveur, valider `locale`, charger `getPublicMiniMockExam(locale)`, appeler `notFound()` en cas d’indisponibilité et passer seulement `config` et un petit objet `labels` au client.
- [ ] Ajouter une métadonnée locale concise, avec `robots: { index: false, follow: false }` en défense supplémentaire au layout parent.
- [ ] Hydrater l’automate après montage depuis `sessionStorage` avec la clé `sfn:fide-mini-exam:v1`; enregistrer après chaque transition et proposer « Recommencer » au résultat.
- [ ] Créer l’introduction avec la durée, les trois étapes, la mention « sans compte » et la promesse exacte : découverte du format, pas estimation officielle du niveau.
- [ ] Pour Parler, afficher `ActivityImageStage`, demander le micro uniquement après clic, enregistrer avec `MediaRecorder`, créer une URL Blob locale, permettre écouter/refaire/supprimer et révoquer chaque URL devenue inutile.
- [ ] Ne jamais construire de `FormData`, ne jamais appeler `fetch`, et ne jamais utiliser `saveMockExamSpeakingAnswer` dans `LocalSpeakingRecorder`.
- [ ] Fournir un repli « Faire l’exercice sans enregistrement » si `MediaRecorder` ou la permission micro est indisponible.
- [ ] Afficher ensuite la checklist et la réponse modèle Sanity ; exiger une confirmation d’auto-évaluation avant de continuer, sans score oral.
- [ ] Pour Comprendre, rendre `ListeningScenarioPlayer` avec le scénario A2 sélectionné et stocker son score 0–3 dans l’automate local.
- [ ] Pour Lire, rendre la première activité via `ReadWriteSingleChoiceStage`, exiger une réponse à chaque question et stocker le score 0–5.
- [ ] Dans `MiniMockExamResult`, afficher `Comprendre x/3`, `Lire x/5`, « Parler : exercice réalisé » et le total objectif x/8, sans seuil de niveau.
- [ ] Ajouter un CTA principal localisé vers `/fide/mock-exams`, puis des liens secondaires vers `/fide/pack-fide` et `/fide/private-courses`.
- [ ] Ajouter les événements `mini_exam_start`, `mini_exam_step_complete`, `mini_exam_complete` et `mini_exam_cta_click` via `window.dataLayer`, sans audio, transcript, réponse ou PII dans les payloads.
- [ ] Respecter le Consent Mode déjà géré par `ClientBoot`; ne charger aucun nouveau script analytics.
- [ ] Ajouter `aria-live` aux changements d’étape et de score, des labels explicites aux contrôles audio, un focus visible et une navigation clavier complète.

## Task 5: Présenter le mini-examen sur la page SEO indexable

**Files:**
- Create: `app/[locale]/(sfn)/fide/mock-exams/components/sections/MockExamsMiniExamSection.tsx`
- Modify: `app/[locale]/(sfn)/fide/mock-exams/components/MockExamsPageSections.tsx`
- Modify: `app/[locale]/(sfn)/fide/mock-exams/components/HeroMockExams.tsx`
- Modify: `app/[locale]/(sfn)/fide/mock-exams/page.tsx`
- Modify: `app/dictionaries/fr.json`
- Modify: `app/dictionaries/en.json`
- Modify: `scripts/seo/check-priority-pages.mjs`

- [ ] Ajouter d’abord aux contrôles SEO les assertions pour un seul H1, une section mini-examen visible, un lien français `/fr/fide/mock-exams/mini`, un lien anglais `/fide/mock-exams/mini` et aucune inclusion de la route interactive dans le sitemap.
- [ ] Exécuter `node scripts/seo/check-priority-pages.mjs` contre une build actuelle et constater l’échec attendu sur la section absente.
- [ ] Créer une section serveur placée avant `MockExamsTestsSection`, avec une composition compacte en trois jalons plutôt qu’une nouvelle grille de cards génériques.
- [ ] Expliquer dans le HTML indexable les trois compétences testées, la durée, l’absence de compte, le caractère gratuit et la limite « découverte, pas résultat officiel ».
- [ ] Ajouter un CTA secondaire « Essayer gratuitement » dans le héros, visuellement inférieur au CTA d’achat principal et sans transformer le checkout existant.
- [ ] Ajouter les traductions sous `Fide.MockExamsPage.MiniExam` en français et anglais ; conserver les composants client alimentés par props compactes.
- [ ] Ajuster la description metadata de la page seulement si l’ajout reste naturel et respecte la longueur actuelle ; ne pas créer une deuxième page SEO concurrente ciblant « examen blanc FIDE ».
- [ ] Ne pas ajouter de données structurées de score, de niveau, de quiz officiel ou d’avis propres au mini-examen.
- [ ] Réexécuter les contrôles SEO après implémentation et confirmer les deux destinations localisées.

## Task 6: Vérifier la sécurité fonctionnelle et les régressions

**Files:**
- Create: `scripts/mini-exam/checkMiniExamPages.mjs`
- Verify: all files above

- [ ] Tester le flux complet avec un score 8/8, un score 0/8, un refus micro, un navigateur sans `MediaRecorder`, un rafraîchissement à chaque étape et un redémarrage depuis le résultat.
- [ ] Vérifier dans l’onglet Réseau qu’aucune requête ne part vers `/api/mock-exams/speaking/*`, OpenAI, une mutation Sanity, Stripe ou Calendly pendant le mini-examen.
- [ ] Vérifier que l’audio enregistré reste une URL `blob:` locale et disparaît après suppression, recommencement ou démontage du composant.
- [ ] Tester à 390 × 844 et 1440 × 900 : aucune barre horizontale, CTA accessible, hauteur réservée pour les images, contenu utilisable avec clavier et focus visible.
- [ ] Ouvrir un examen blanc payant déverrouillé dans une session authentifiée et parcourir au minimum une transition Parler, un scénario Comprendre et une question Lire/Écrire pour valider les extractions partagées.
- [ ] Exécuter `node --test scripts/mini-exam/*.test.mjs scripts/sanity/miniMockExamConfig.test.mjs` et obtenir 100 % de réussite.
- [ ] Exécuter `npm run typecheck` et obtenir le code 0.
- [ ] Exécuter un lint ciblé sur tous les fichiers créés/modifiés, puis `npm run lint:quiet`, et obtenir le code 0.
- [ ] Exécuter `NODE_OPTIONS=--max-old-space-size=4096 npm run build` et obtenir une build Next.js réussie.
- [ ] Démarrer la build localement puis exécuter `node scripts/mini-exam/checkMiniExamPages.mjs` et `node scripts/seo/check-priority-pages.mjs`.
- [ ] Vérifier avec `checkMiniExamPages.mjs` : statut 200 des quatre routes EN/FR, `noindex` sur les routes `/mini`, absence de H1 dupliqué, présence des trois étapes et absence de la route `/mini` dans le sitemap.
- [ ] Comparer les chunks JS et le nombre de requêtes de la page mini avec ceux du runner payant ; confirmer que Stripe, Calendly et le code OpenAI ne sont pas chargés dans le parcours gratuit.
- [ ] Examiner `git diff --check`, puis le diff complet, et confirmer qu’aucune modification hors périmètre n’a été introduite.

## Task 7: Mettre la configuration en service après validation explicite

**Files:**
- Modify externally: Sanity dataset `production`, singleton `miniMockExamConfig` uniquement
- Optional mirror: Sanity dataset `startfrenchnow`, singleton `miniMockExamConfig` uniquement

- [ ] Présenter le résultat du `--dry-run`, les trois références résolues et les validations de contenu avant toute écriture.
- [ ] Après autorisation, exécuter `node scripts/sanity/upsertMiniMockExamConfig.mjs --dataset=production --apply`.
- [ ] Exécuter immédiatement le même script avec `--verify` et confirmer une configuration active valide.
- [ ] Refaire les contrôles EN/FR sur la build utilisant cette configuration.
- [ ] Ne déployer qu’après réussite des tests, de la build, du flux payant de régression et du contrôle réseau du mini-examen.

## Acceptance Criteria

- Un visiteur non connecté termine le mini-examen en français ou en anglais sans achat ni compte.
- L’expérience reprend la coquille et les principales briques visuelles du mock-exam existant, sans importer son routeur de 4 940 lignes.
- L’oral est enregistré et relu uniquement dans le navigateur ; aucun audio ni texte personnel n’est transmis.
- Comprendre est noté sur 3, Lire sur 5, et aucun niveau FIDE n’est déduit.
- La page marketing indexable présente naturellement le mini-examen ; la route interactive est `noindex` et absente du sitemap.
- Aucun appel IA, Stripe, Calendly ou mutation Sanity n’est déclenché par le parcours gratuit.
- Le runner payant conserve son contrôle d’accès, sa reprise de session, ses sauvegardes et ses corrections.
- Les tests Node, le typecheck, le lint, la build et les contrôles de pages passent avant livraison.

