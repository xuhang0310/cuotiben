# Project Context for Qwen Code

## Project Overview

This is a Vue 3 application for a "错题本" (mistake notebook), built with Vite. It's designed to help students manage their incorrect answers, practice problems, and track their learning progress. The application uses TypeScript for type safety, Pinia for state management, Vue Router for navigation, and Ant Design Vue for UI components.

Key features include:
- Home view with a grid of questions
- Question capture via camera
- AI explanations for questions
- Question management
- Practice mode
- Statistics and analysis
- Settings

The project follows a standard Vue 3 + Vite structure with a `src` directory containing `assets`, `components`, `mock`, `router`, `stores`, and `views`.

## Building and Running

### Prerequisites
- Node.js (version specified in `package.json`: "^20.19.0 || >=22.12.0")

### Setup
```sh
npm install
```

### Development
To start the development server with hot-reloading:
```sh
npm run dev
```

### Production
To build the project for production:
```sh
npm run build
```

### Type Checking
To perform type checking:
```sh
npm run type-check
```

### Linting
To lint the codebase (and fix issues):
```sh
npm run lint
```

## Development Conventions

### Project Structure
- `src/main.ts`: Entry point of the application.
- `src/App.vue`: Main application layout, including the header with navigation menu.
- `src/router/index.ts`: Vue Router configuration, defining all application routes.
- `src/views/`: Contains top-level page components for each route.
- `src/components/`: Reusable UI components.
- `src/stores/`: Pinia stores for state management.
- `src/mock/`: Mock data for development.
- `src/assets/`: Static assets like images and stylesheets.
- `src/utils/`: Utility functions for common operations.

### Technologies & Libraries
- **Vue 3**: Core framework with Composition API (`<script setup>`).
- **Vite**: Build tool and development server.
- **TypeScript**: For type safety.
- **Pinia**: State management.
- **Vue Router**: For routing.
- **Ant Design Vue**: UI component library.
- **Vue I18n**: For internationalization (currently configured with Chinese and English).
- **ESLint**: For code linting, configured with `@vue/eslint-config-typescript`.
- **Vant**: Mobile UI component library.
- **FontAwesome**: Icon library.
- **Katex**: Math typesetting library.
- **Markdown-it**: Markdown parser.
- **html2canvas**: Screenshot library.

### Code Style
- Uses Vue 3's Composition API (`<script setup>`) in Single File Components (SFCs).
- Follows standard Vue and TypeScript conventions.
- Uses `@/` alias for imports relative to the `src` directory.
- Components are registered globally in `main.ts` for easy access.

### Routing
- Routes are defined in `src/router/index.ts`.
- Menu items in the header are dynamically generated from routes that have `meta.showInMenu: true`.
- Each route has associated metadata like `title`, `label`, and `icon`.
- Available routes include:
  - Home (`/`) - Main dashboard with question grid
  - Capture (`/capture`) - Camera-based question capture
  - AI Explain (`/ai-explain`) - AI-powered question explanations
  - Questions (`/questions`) - Question management
  - Question Detail (`/questions/:id`) - Detailed question view
  - Practice (`/practice`) - Practice mode
  - Statistics (`/statistics`) - Learning analytics
  - Settings (`/settings`) - Application settings

### UI/UX
- Responsive design using CSS Grid and Flexbox.
- Utilizes Ant Design Vue components for consistent UI.
- Custom CSS variables for theming (found in `src/assets/base.css`).
- Macaron color scheme with light/dark mode support.
- Mobile-friendly design with adaptive layouts.