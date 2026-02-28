# UI Preferences — Mock Exam (MVP)

Ce document fixe des **préférences UI/UX** (composants + transitions + layouts) adaptées à :
- page unique “Exam Runner” (`/mock-exams/[compilationId]/runner`)
- parcours strict (pas de retour arrière entre épreuves)
- speaking avec record → STT → édition transcript → validation
- read/write avec parfois plusieurs sous-tâches
- desktop “no scroll si possible”, mobile “scroll contrôlé + CTA sticky”

---

## 1) Transitions (standards)

### 1.1 Transition entre épreuves (Parler A2 → Parler branche → Comprendre → Lire/Écrire)
**Préférence : écran unique combiné**
- En haut : “Section terminée ✓”
- En dessous : loader + “Analyse des résultats…”
- Durée minimale à l’écran : **600–1000 ms** (évite l’effet clignotement)
- Si l’analyse dure plus longtemps : rester sur cet écran jusqu’à résultat, avec micro-texte évolutif (ex: “Analyse en cours…”, puis “Presque terminé…”)

Ensuite : transition directe vers l’écran **Résultat**.

**Animation**
- Fade + léger slide (250–350 ms), pas d’animations longues.

---

### 1.2 Transition entre tâches (ex: A2 tâche 1 → tâche 2)
**Préférence : interstitial**
- **Desktop : modal** centré (“Tâche suivante : …”) + CTA `Commencer`
- **Mobile : écran plein** (même contenu) + CTA `Commencer`

Contenu minimal :
- “Tâche X/Y : [nom]”
- “Tu vas répondre à N questions” (si connu)
- CTA : `Commencer`

---

### 1.3 Transition entre questions (activities[]) dans une même tâche
**Préférence : ultra rapide**
- Après validation :
  - toast “Réponse enregistrée ✓”
  - transition courte (slide 150–220 ms)
  - focus en haut du stimulus

Pas d’écran intermédiaire.

---

## 2) Composants UI recommandés

### 2.1 À privilégier
- **ProgressHeader (sticky)** :
  - section (Parler A2 / Branche / Comprendre / Lire-Écrire)
  - progression : “Tâche X/Y • Question i/n”
  - essais restants (speaking)
  - autosave status (discret)
- **StimulusPanel** : image / audio consigne / promptText
- **RecorderCard** : record/stop + compteur + réécoute + états (upload/STT)
- **TranscriptEditor** : édition transcript obligatoire + CTA `Valider`
- **Toast** : confirmations courtes (“Enregistré ✓”)
- **Accordion** :
  - corrections longues (résultats)
  - read/write quand il y a **3+ sous-tâches**

### 2.2 À éviter dans ce contexte
- breadcrumb (suggère navigation libre)
- wizard cliquable (même problème)
- carousels partout (fatigue + accessibilité)
- animations “spectacle” (mode examen)

---

## 3) Layouts globaux (responsive)

### 3.1 Desktop (objectif : pas de scroll)
**Grille 2 colonnes**
- Gauche (≈40–45%) : stimulus + prompt
- Droite (≈55–60%) : réponse (record/transcript ou textareas)

**Footer sticky**
- CTA principal (plein largeur sur la colonne droite ou bas de page)
- CTA secondaire (Refaire / Quitter) en style discret

**Scroll interne**
- Si contenu long (scénario RW, transcript), préférer **scroll dans une card** plutôt que scroll page.

---

### 3.2 Mobile (scroll contrôlé)
**Stack vertical**
1) Stimulus
2) Interaction (record/textarea)
3) Validation

**CTA sticky bas**
- bouton principal toujours visible
- bouton secondaire discret

---

## 4) Layouts par TaskType

> Chaque `MockExamTask` est rendu via son `taskType` + `activities[]` ordonnées.

### 4.1 IMAGE_DESCRIPTION_A2
**Desktop**
- Gauche : image grande + audio consigne + promptText
- Droite : Recorder + TranscriptEditor + CTA sticky

**Mobile**
- Image → audio → record → transcript
- CTA sticky bas

---

### 4.2 PHONE_CONVERSATION_A2 (multi-questions)
**Desktop**
- Gauche : contexte (introBlocks ou premier prompt) + audio/prompt de la question courante + “Question i/n”
- Droite : Recorder + TranscriptEditor + CTA

**Mobile**
- Contexte (collapsible si long) → question courante → record → transcript
- CTA sticky

---

### 4.3 DISCUSSION_A2 (multi-questions)
**Desktop**
- Gauche : thème + question courante (promptText) + tips éventuels
- Droite : Recorder + TranscriptEditor + CTA

**Mobile**
- Thème → question → record → transcript
- CTA sticky

---

### 4.4 IMAGE_DESCRIPTION_A1_T1 / IMAGE_DESCRIPTION_A1_T2 (multi images / activities)
**Desktop**
- Gauche : image courante + audio question + “Image i/n”
- Droite : Recorder + TranscriptEditor + CTA

**Mobile**
- Image → audio → record → transcript
- CTA sticky

---

### 4.5 DISCUSSION_B1 (souvent thème + questions)
**Pré-step (1ère tentative seulement) : choix de sujet**
- 2 cards sujet A/B → CTA “Choisir ce sujet”
- Ensuite runner questions (comme discussion)

**Desktop**
- Gauche : sujet + question courante
- Droite : Recorder + TranscriptEditor + CTA

**Mobile**
- Sujet → question → record → transcript
- CTA sticky

---

### 4.6 READ_WRITE_M1 (et autres modules RW)
**Desktop**
- Gauche : scénario (introBlocks) dans une card scrollable + consignes
- Droite : sous-tâches (activities) avec textareas

**Mobile**
- Scénario collapsible
- Questions + textareas
- CTA sticky

**Accordion RW (si 3+ sous-tâches)**
- Trigger = consigne courte + indicateur “Répondu / Non répondu”
- Body = textarea + autosave status
- Règles :
  - au moins 1 panel ouvert
  - optionnel : auto-open de la question suivante après validation

---

## 5) Hors temps (overtimeTaskRefs)

Quand une règle de temps (définie dans le programme) est dépassée pour une task :
- afficher une **modale warning**
  - message : “Temps dépassé. Pour être conforme, tu dois arrêter.”
  - actions :
    - `Arrêter`
    - `Continuer hors temps` (continue et ajoute la ref task dans `overtimeTaskRefs`)
- éviter répétition : une seule modale par task, puis badge discret “Hors temps”.

---

## 6) Quitter l’examen (modale globale)

Déclencheur recommandé : back navigateur / action “Quitter”.
- Titre : “Quitter l’examen ?”
- Texte : “Ta progression est enregistrée. Tu pourras reprendre plus tard.”
- Actions : `Continuer l’examen` / `Quitter`
