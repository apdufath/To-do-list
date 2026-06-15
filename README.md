# Aura — Premium Focus & Task Management SPA

A luxury, dark-mode single-page productivity dashboard built using clean HTML5, modern CSS3 variables/effects, and Vanilla Javascript.

## ✨ Features    
    
- **SPA Routing Engine:** Fast, client-side routing with smooth fade-and-slide page transitions.
- **Dashboard (Home View):** 
  - Dynamic greetings and motivational quotes.
  - Interactive SVG completion rings for today's intentions. 
  - Live metric summaries (Total, Completed, In Progress, Overdue).
  - Quick-add capture input and a sliding activity feed log.
- **Tasks Workspace:**
  - Standard CRUD task management.
  - Custom checkboxes with fluid draw animations. 
  - Prioritization labels (High/Medium/Low), category tags, and relative due dates.
  - Multi-condition sort (Date/Priority/Name) and search filters.  
- **Kanban Board:**
  - 4 columns (To Do, In Progress, Review, Done) with colored top border glows.
  - Full drag-and-drop support built on native HTML5 Drag and Drop APIs.
  - Live column card trackers and inline column quick adders.
- **Calendar View:**
  - Interactive monthly calendar with priority-colored dot notifications.
  - Selected day task detail panel.
- **Settings Workspace:**
  - Theme Accent Engine (Dynamically updates primary and shadow colors in CSS variables between Vivid Yellow and Fresh Green).
  - Micro-sound notifications (metallic bell success chime synthesized via the Web Audio API).
  - Profile metadata management.
  - JSON backup exports and local storage wipes.

## 📁 Repository Structure

```
To-do List/
│
├── index.html   # Main structural skeleton, SVGs, and modal panels
├── style.css    # Typography, glass variables, layouts, and animations
├── app.js       # State machines, routing, calendar, drag/drop, and audio
└── README.md    # Repository overview and metadata
```

## 🛠️ Technology Stack

- **Markup:** Semantic HTML5
- **Styling:** CSS3 variables, Backdrop Filter Blur, Moving Radial Gradients
- **Scripting:** Vanilla JavaScript ES6
- **Storage:** LocalStorage Web API
- **Audio:** Web Audio API (real-time sound synthesis)

## 🚀 Setup & Execution

Since the app is built on pure Vanilla Javascript, it can be run directly from the local file system or via a static file server:

1. Clone this repository:
   ```bash
   git clone https://github.com/apdufath/To-do-list.git
   ```
2. Launch a lightweight local server in the project folder (for audio contexts and browser sandboxes):
   ```bash
   npx http-server -p 8080
   ```
3. Open `http://localhost:8080` in your web browser.
