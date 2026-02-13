# FarmerAssist Frontend (React + Vite)

This is a clean React frontend for the FarmerAssist app based on your flowchart:

- Learning Platform (Gamified + Special Courses)
- Real-time Updates (Weather, Disaster Alerts, Govt Schemes/Loans)
- AI-based Suggestions (Chatbot + Crop Recommendation)

## Getting Started

1) Install dependencies
```
npm install
```

2) Start the dev server
```
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Project Structure

- `src/components/` — `Header`, `Sidebar` and other UI parts
- `src/pages/learning/` — Learning modules and special platform
- `src/pages/updates/` — Realtime weather, disaster alerts, and schemes
- `src/pages/ai/` — Chatbot and crop suggestions form
- `src/services/` — Mock API services (`weather`, `govt`, `ai`)
- `src/shared/SectionGrid.jsx` — Reusable grid for listing items

## Styling

Tailwind CSS powers the UI via `tailwind.config.js` and `postcss.config.js`. The main stylesheet `src/index.css` includes `@tailwind` directives and a few utility classes.

## Next Steps

- Wire services to real APIs (OpenWeather, government portals, your AI backend)
- Add authentication and user profiles
- Persist user progress for gamified learning
