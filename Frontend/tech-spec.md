# Covoiturage — Spécification Technique

## Dépendances

| Package | Version | Rôle |
|---------|---------|------|
| react | ^19.1.0 | UI framework |
| react-dom | ^19.1.0 | DOM renderer |
| react-router-dom | ^7.6.0 | Multi-page routing (5 routes + sidebar panel) |
| tailwindcss | ^4.1.0 | Utility CSS |
| @tailwindcss/vite | ^4.1.0 | Tailwind Vite plugin |
| lucide-react | ^0.510.0 | Icônes (bell, car, map-pin, calendar, star, trash, check, x, chevron-down, etc.) |
| date-fns | ^4.1.0 | Formatage dates (fr locale) |
| geist | ^1.4.0 | Polices Geist Sans + Mono |

Aucun autre package n'est requis. Le design est entièrement CSS (glassmorphism, gradients, animations). Pas de backend.

## Inventaire des Pages

| Page | Route | Description |
|------|-------|-------------|
| Home / Search | `/` | Hero avec barre de recherche 3 champs, grille résultats |
| My Bookings | `/reservations` | Liste réservations avec badges statut + actions |
| Driver Dashboard | `/trips` | Cartes trajets conducteur, section expandable demandes |
| Alerts | `/alertes` | Formulaire création alerte, liste alertes sauvegardées |
| Profile | `/profil` | Avatar, infos, formulaire édition, avis |
| Notifications Panel | Sidebar fixe (pas de route) | Panneau latéral droit toasts temps réel |

## Plan des Composants

### Layout (partagé)

- **AppShell** — Layout racine : Navbar + zone contenu + NotificationsPanel
- **Navbar** — Navigation fixe glassmorphism : logo, liens nav (actif = underline orange), icône cloche avec badge rouge, boutons auth
- **NotificationsPanel** — Sidebar fixe droite 380px, glassmorphism. Header "Notifications" + close + liste items. S'ouvre/ferme via React Context.
- **ToastNotifications** — Conteneur toasts auto-dismissing (5s) qui slide depuis top-right. 3 types : confirmation (vert), annulation (rouge), alerte match (bleu).

### Sections par page

**Home**
- **HeroSection** — Hero 320px avec mesh gradient animé (CSS only, blobs orange/bleu low opacity). Titre + sous-titre centrés.
- **SearchBar** — Conteneur glass, 3 inputs inline (départ, destination, date) + bouton recherche. Stack vertical sur mobile.
- **TripsGrid** — Grille 3 cols cartes trajet. Gère état empty/skeleton/résultats.

**Reservations**
- **BookingsList** — Stack vertical cartes réservation (max-width 800px). Filtre par statut implicite.

**Trips (Driver)**
- **DriverStats** — 4 mini cartes stats (total, actifs, complétés, annulés)
- **DriverTripsList** — Liste cartes trajet avec section "Voir demandes" expandable
- **TripRequestsPanel** — Section expandable : liste demandes en attente avec boutons Accepter/Refuser

**Alertes**
- **AlertForm** — Formulaire création : départ, destination, date (optionnel)
- **AlertsList** — Liste alertes sauvegardées avec icône trash rouge

**Profil**
- **ProfileHeader** — Avatar 120px avec ring orange, nom, email, téléphone, étoiles rating
- **ProfileForm** — Champs éditables : nom, email, téléphone, changement mot de passe
- **ReviewsSection** — Section avis reçus avec cartes review

### Composants réutilisables

- **TripCard** — Route (départ → destination), date, sièges pill orange, prix orange bold, avatar conducteur + nom + étoiles, bouton Réserver. Hover lift.
- **BookingCard** — Badge statut coloré (pending/confirmed/rejected/cancelled), infos trajet, bouton Annuler conditionnel.
- **AlertCard** — Route, date ou "Toute date", date création, bouton trash.
- **ReviewCard** — Étoiles, commentaire, nom reviewer, tags.
- **StatusBadge** — Pill coloré selon statut. Réutilisé dans BookingCard et ailleurs.
- **StarRating** — Affichage étoiles (remplies/vides) + note numérique optionnelle.
- **GlassCard** — Wrapper glassmorphism réutilisable (backdrop-filter, bordure, etc.)
- **Button** — 3 variantes : primary (gradient orange), secondary (gradient blue), ghost (transparent + border).
- **Modal** — Overlay glass backdrop + contenu centré, bordure top orange 3px, fermeture croix.
- **EmptyState** — Illustration centrée + message + CTA.
- **SkeletonCard** — Pulse animation pour état loading.

## Plan des Animations

| Animation | Technique | Implémentation |
|-----------|-----------|----------------|
| Mesh gradient hero blobs | CSS @keyframes | 2-3 divs `position:absolute`, `border-radius:50%`, `filter:blur(80px)`, animation translate/scale, `opacity:0.08`. Pure CSS, pas de bibliothèque. |
| Card hover lift | CSS transition | `transition: transform 200ms ease, box-shadow 200ms ease` ; hover: `translateY(-4px)` + ombre augmentée |
| Notification panel slide | CSS transition | `transform: translateX(100%)` → `translateX(0)`, `transition: 300ms ease-out`. State boolean dans Context. |
| Toasts slide+fade | CSS transition + setTimeout | `transform: translateX(120%)` → `translateX(0)`, `opacity: 0→1`, `transition: 400ms ease-out`. Auto-dismiss via `setTimeout(5000)` + state removal. |
| Expandable requests | CSS transition | `max-height: 0` → `max-height: 500px` (overflow hidden), `transition: max-height 300ms ease`. Overflow hidden + max-height trick pour animation hauteur. |
| Status badge color change | CSS transition | `transition: background-color 300ms, color 300ms` sur le badge |
| Skeleton pulse | CSS @keyframes | `@keyframes pulse { 0%,100% { opacity:0.4 } 50% { opacity:1 } }`, `animation: pulse 1.5s infinite` |
| Button hover | CSS transition | Primary: `transition: filter 150ms` ; hover: `filter: brightness(1.1)`. Ghost: `transition: background 150ms` ; hover: bg fill. |
| Input focus | CSS transition | `transition: border-color 150ms` ; focus: `border-color: #ff6b35` (2px) |
| Modal appear | CSS transition | Overlay: `opacity 0→1` 250ms. Content: `scale(0.95→1)` + `opacity 0→1`. |
| Page content fade | CSS transition | `opacity 0→1`, `transition: opacity 200ms` sur le container de page |
| Nav underline | CSS transition | `::after` pseudo-élément, `width: 0→100%`, `transition: width 200ms ease` |

Toutes les animations sont CSS pures. Aucune bibliothèque d'animation n'est nécessaire.

## État et Logique

### Gestion d'état

React Context uniquement — pas besoin de Zustand/Redux. L'application est un prototype frontend avec données mockées.

**AppContext** (Provider racine) :
- `trips` — liste trajets (mock data)
- `bookings` — liste réservations avec statuts
- `alerts` — liste alertes sauvegardées
- `notifications` — liste notifications (panel + toasts)
- `currentUser` — profil utilisateur connecté
- `authModal` — état modal login/register (ouvert/fermé)

Toutes les mutations (réserver, annuler, accepter, refuser, créer alerte, supprimer alerte, mettre à jour profil) sont des fonctions synchrones qui modifient le state React directement (pas d'appels API). Les "opérations async" simulent un délai de 300-500ms avec `setTimeout` pour montrer les états de loading.

### Données mockées

Je vais créer des données réalistes pour :
- 6+ trajets (Tunis ↔ Sousse, Tunis ↔ Nabeul, Sfax → Tunis, etc.)
- 4+ réservations avec différents statuts
- 2-3 alertes sauvegardées
- 1 utilisateur currentUser avec profil complet
- 3+ notifications de démonstration
- 2-3 avis/reviews

### Temps réel (simulation)

Les notifications "temps réel" sont simulées par des `setInterval` qui injectent périodiquement de nouvelles notifications dans le state. Cela démontre le système de toasts et du panel sans backend WebSocket.

### Routing

React Router v7 avec `BrowserRouter`. 5 routes définies. Le NotificationsPanel n'a pas de route — c'est un composant overlay fixe contrôlé par un state boolean dans le Context.

## Autres Décisions Clés

### Pas de backend
Tout est mocké côté client. Les "appels API" sont des fonctions qui retournent des Promesses résolues après un délai artificiel (300-500ms) pour simuler du réseau.

### Pas d'images externes
Tous les avatars utilisent des initiales avec fond coloré généré (ex: "AS" → fond orange). Pas de chargement d'images réelles nécessaire.

### Pas de bibliothèque UI
Aucun shadcn, Material UI, ou autre. Tous les composants sont construits from scratch avec Tailwind pour un contrôle total sur le glassmorphism et le design system.

### Responsive
- Desktop (≥1024px) : grille 3 cols, search bar inline, notification panel visible
- Tablet (≥640px) : grille 2 cols, search bar inline
- Mobile (<640px) : grille 1 col, search bar verticale stackée, notification panel full-width
