# Rapports ventes et acquisition

Le rapport est calculé à la demande depuis `/fr/admin/reports`. Il n'est pas
enregistré dans Sanity. Le cron du lundi réutilise le même calcul et envoie le
résultat par email.

La page permet également à un administrateur d'envoyer manuellement par email
le rapport et la période actuellement affichés. Cet envoi utilise le même
contenu et le même destinataire que le cron hebdomadaire.

## Sources reconnues

- `?src=youtube`
- `?src=tiktok`
- `?src=instagram`
- `?src=udemy`
- `?src=italki`
- Google Ads via `gclid`, `gbraid` ou `wbraid`
- recherche Google via le referrer
- coupon `PACKFIDE10` pour YouTube
- coupon `INSTAGRAM10` pour Instagram
- coupon `TIKTOK10` pour TikTok
- accès sans referrer classé comme `Direct`
- autre lien externe ou source UTM non reconnue classé comme `Autre`

La première source précise est conservée 30 jours dans le navigateur et n'est
pas remplacée par une autre plateforme. Une valeur `Direct`, `Autre` ou
`Inconnue` peut en revanche être remplacée plus tard par une source précise.
L'absence de source n'empêche jamais un paiement.

Exemples de liens :

```text
https://startfrenchnow.ch/fr/fide?src=youtube
https://startfrenchnow.ch/fr/fide?src=instagram
https://startfrenchnow.ch/fr/fide?src=tiktok
https://startfrenchnow.ch/fr/fide?src=udemy
https://startfrenchnow.ch/fr/fide?src=italki
```

La variante `?src=italky` est également acceptée et enregistrée comme
`italki`.

## Email hebdomadaire

Le destinataire est lu dans `REPORT_EMAIL_TO`, avec `EMAILYOH` comme valeur de
repli. Plusieurs destinataires peuvent être séparés par des virgules, comme le
permet Nodemailer.

Le cron Vercel s'exécute le lundi à 07:00 UTC et nécessite le `CRON_SECRET` déjà
utilisé par les autres crons du projet.

Chaque email contient aussi un bilan du mois en cours, du premier jour jusqu'au
jour de génération. Il est comparé à la même durée du mois précédent afin de ne
pas opposer un mois incomplet à un mois complet. La différence porte sur le
résultat marketing estimé en EUR.

## Configuration Google Ads

L'intégration utilise un compte de service afin que le cron n'ait pas besoin
d'une connexion humaine.

1. Ouvrir ou créer un compte Google Ads Manager.
2. Dans l'API Center du compte Manager, demander un developer token.
3. Dans Google Cloud, activer Google Ads API.
4. Créer un compte de service et une clé JSON.
5. Dans Google Ads, ouvrir **Admin > Access and security** et ajouter l'adresse
   email du compte de service comme utilisateur.
6. Ajouter les variables suivantes dans `.env.local`, puis dans les variables
   d'environnement Vercel :

```dotenv
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=
GOOGLE_ADS_LOGIN_CUSTOMER_ID=
GOOGLE_ADS_SERVICE_ACCOUNT_EMAIL=
GOOGLE_ADS_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

- `GOOGLE_ADS_CUSTOMER_ID` : identifiant du compte publicitaire qui contient les
  campagnes.
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` : identifiant du compte Manager.
- Les identifiants peuvent être saisis avec ou sans tirets.
- La clé privée reste exclusivement dans les variables d'environnement et ne
  doit jamais être commitée.

`GOOGLE_ADS_API_VERSION` est optionnel. En son absence, l'intégration utilise la
version configurée dans le code.

Documentation officielle :

- https://developers.google.com/google-ads/api/docs/oauth/service-accounts
- https://developers.google.com/google-ads/api/docs/api-policy/developer-token

## Règles financières

- Les montants des cours privés sont exclus.
- Les cours privés sont aussi retirés du parcours principal et restent dans la
  section discrète dédiée à leur source.
- Les remboursements ne sont pas gérés par le rapport.
- Les revenus restent séparés par devise.
- Chaque achat CHF est automatiquement converti en EUR avec le taux BCE
  historique de sa date via Frankfurter. Pour un week-end ou jour férié, le
  dernier taux ouvré disponible est utilisé. Les taux sont conservés en cache
  pendant 24 heures et ne sont pas affichés dans le rapport.
- Le total final additionne les revenus EUR et les revenus CHF convertis, puis
  retire les dépenses Google Ads lorsqu'elles sont en EUR.
- Ce résultat ne déduit pas les frais Stripe, taxes ou autres coûts.

## Calendly

Seul le type d'événement `Your FIDE Plan` (entretien gratuit de 15 minutes) est
inclus dans la partie commerciale. Les popups reçoivent automatiquement :

- la source d'acquisition dans `utm_source` ;
- l'emplacement du bouton dans `utm_content`.

Les réservations de cours privés et les rendez-vous de feedback d'examen ne sont
pas inclus dans les demandes commerciales.
