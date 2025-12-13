# FlashScore Clone

A modern sports scores and fixtures application built with React, TypeScript, and Tailwind CSS. This project replicates the core functionality of FlashScore with live match updates, league navigation, and a responsive design.

## 🔐 Authentication

This application uses **HTTP-only cookie-based authentication** for enhanced security:
- Tokens stored in secure, HTTP-only cookies (protected from XSS attacks)
- Automatic token refresh mechanism
- Seamless user experience

For complete authentication documentation, see [HTTP_ONLY_COOKIE_AUTH.md](./HTTP_ONLY_COOKIE_AUTH.md).

## Features

- 🏆 **Live Scores**: Real-time match updates with live status indicators
- 📅 **Date Navigation**: Browse matches by date with intuitive date picker
- 🏟️ **League Filtering**: Filter matches by different leagues and competitions
- 🌙 **Dark/Light Mode**: Toggle between dark and light themes
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- ⚽ **Match Details**: Detailed match view with timeline and events
- 🎯 **Match Events**: Goals, cards, substitutions, and other match events
- 🔐 **Admin Panel**: JWT-based authentication with role-based access control
- 📝 **Blog Management**: Create, edit, and manage blog entries (for editors and admins)

## Tech Stack

- **React 18+** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Vite** - Fast build tool and development server
- **Lucide React** - Beautiful icons

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Navbar.tsx
│   │   └── ThemeToggle.tsx
│   ├── match/
│   │   ├── MatchCard.tsx
│   │   ├── MatchList.tsx
│   │   ├── MatchTimeline.tsx
│   │   └── MatchDetails.tsx
│   ├── league/
│   │   ├── LeagueSelector.tsx
│   │   └── SeasonSelector.tsx
│   └── common/
│       ├── LoadingSpinner.tsx
│       ├── ErrorMessage.tsx
│       └── DatePicker.tsx
├── pages/
│   ├── Home.tsx
│   ├── MatchDetails.tsx
│   └── LeagueOverview.tsx
├── mock-data/
│   ├── leagues.json
│   ├── seasons.json
│   ├── matches.json
│   ├── teams.json
│   └── events.json
├── utils/
│   ├── types.ts
│   ├── dateUtils.ts
│   └── matchUtils.ts
├── contexts/
│   └── ThemeContext.tsx
└── App.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd flashscore-clone
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Admin Panel

The application includes a comprehensive admin panel for content management:

### Authentication
- JWT-based authentication (access + refresh tokens)
- Login modal accessible from the home page
- Secure token storage and automatic refresh
- Role-based access control (Admin/Editor)

### Blog Management
- Create, edit, and delete blog entries
- Rich text content editor
- Publish/draft status control
- Featured image support
- Author tracking

### User Roles
- **Admin**: Full access to all features and entries
- **Editor**: Can manage only their own blog entries

### Accessing the Admin Panel
1. Click the "Zaloguj" button in the header
2. Enter your credentials
3. Navigate to the admin panel from the user menu
4. Manage blog entries and content

**Note**: The admin panel requires backend API endpoints to be implemented. See `SERVER_ENDPOINTS_DOCUMENTATION.md` for complete API specifications.

## Mock Data

The application currently uses mock data for demonstration purposes. The mock data includes:

- **Leagues**: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions League
- **Teams**: Popular teams from various leagues
- **Matches**: Sample matches with different statuses (Live, Finished, Scheduled)
- **Events**: Goals, cards, substitutions for sample matches

## Features in Detail

### Live Match Updates
- Real-time status indicators for live matches
- Match minute display for ongoing games
- Visual indicators for match status (Live, Finished, Scheduled)

### Theme Support
- System preference detection
- Manual theme toggle
- Persistent theme selection
- Dark mode optimized design

### Responsive Design
- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-friendly interface
- Optimized performance

### Match Navigation
- Date-based filtering
- League-specific views
- Season selection
- Detailed match pages with events timeline

## Customization

### Adding New Leagues
Edit `src/mock-data/leagues.json` to add new leagues:

```json
{
  "id": "new-league",
  "name": "New League",
  "country": "Country",
  "logo": "/assets/team-logos/new-league.png"
}
```

### Styling
The application uses Tailwind CSS. Customize the theme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by FlashScore's user interface and functionality
- Icons provided by Lucide React
- Typography powered by Inter font family
