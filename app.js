// ==========================================================================
// 1. DYNAMIC SYSTEM STATE & CONSTANTS
// ==========================================================================
const STORAGE_TASKS_KEY = 'aura_focus_tasks';
const STORAGE_SETTINGS_KEY = 'aura_focus_settings';
const STORAGE_ACTIVITY_KEY = 'aura_focus_activity';

// Dynamic Date Helpers to keep sample data relative and fresh
const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getRelativeDateString = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d);
};

// Initial Sample Data for first-time loads
const getSampleTasks = () => [
  {
    id: 1,
    title: "Review project proposal & architectural draft",
    description: "Prepare recommendations for the client kickoff meeting on key technical risks.",
    priority: "high",
    category: "Work",
    dueDate: getRelativeDateString(0), // Today
    kanbanStatus: "todo",
    assignee: "AC",
    completed: false
  },
  {
    id: 2,
    title: "Cardio workout & hydration tracking",
    description: "45 minutes Zone 2 running. Aim for 3L water consumption.",
    priority: "medium",
    category: "Health",
    dueDate: getRelativeDateString(0), // Today
    kanbanStatus: "done",
    assignee: "AC",
    completed: true
  },
  {
    id: 3,
    title: "Source local organic groceries",
    description: "Visit organic market to stock up on greens, proteins, and coffee beans.",
    priority: "low",
    category: "Personal",
    dueDate: getRelativeDateString(0), // Today
    kanbanStatus: "todo",
    assignee: "AC",
    completed: false
  },
  {
    id: 4,
    title: "Design system dark mode colors",
    description: "Define primary glows, overlay transparency values, and card borders in CSS variables.",
    priority: "high",
    category: "Design",
    dueDate: getRelativeDateString(1), // Tomorrow
    kanbanStatus: "inprogress",
    assignee: "JD",
    completed: false
  },
  {
    id: 5,
    title: "Q2 financial report audit",
    description: "Conduct double-entry ledger audits for design deliverables and verify invoices.",
    priority: "high",
    category: "Finance",
    dueDate: getRelativeDateString(2), // Day after tomorrow
    kanbanStatus: "review",
    assignee: "ME",
    completed: false
  },
  {
    id: 6,
    title: "Refactor database migrations",
    description: "Optimize indexing protocols on task entities to support fast dashboard aggregates.",
    priority: "medium",
    category: "Work",
    dueDate: getRelativeDateString(1), // Tomorrow
    kanbanStatus: "todo",
    assignee: "AC",
    completed: false
  },
  {
    id: 7,
    title: "Synthesize user research notes",
    description: "Analyze transcription feedback from the early testing groups regarding workspace layouts.",
    priority: "medium",
    category: "Design",
    dueDate: getRelativeDateString(-1), // Yesterday (Overdue)
    kanbanStatus: "inprogress",
    assignee: "JD",
    completed: false
  },
  {
    id: 8,
    title: "Publish release v1.2 updates",
    description: "Push distribution packages to production CDN nodes and upload changelog logs.",
    priority: "low",
    category: "Work",
    dueDate: getRelativeDateString(-2), // 2 Days Ago
    kanbanStatus: "done",
    assignee: "ME",
    completed: true
  }
];

const quotes = [
  "Focus is a muscle, and you are building it.",
  "Elegance is not abundance, it is the absence of clutter.",
  "Simplicity is the ultimate sophistication in daily execution.",
  "What you choose to ignore is as important as what you focus on.",
  "Design your days with intention, execute them with grace.",
  "Remain present in your scope. Build beautiful things."
];

// App Core State
let tasks = [];
let activityLog = [];
let currentFilter = 'all';
let currentSort = 'dueDate';
let searchQuery = '';
let currentView = 'dashboard';

// Calendar View State
let calCurrentDate = new Date();
let calSelectedDate = new Date();

// Settings Defaults
let settings = {
  username: "Abdifatah Bashe",
  email: "abdifatah@aurasystem.co",
  role: "Lead Producer",
  sounds: true,
  accentColor: "yellow",
  darkMode: true
};

// ==========================================================================
// 2. DOM SELECTOR CACHE
// ==========================================================================
const views = document.querySelectorAll('.view');
const navLinks = document.querySelectorAll('.nav-link');
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileCloseBtn = document.getElementById('mobile-close-btn');
const mobileTitle = document.getElementById('mobile-title');

// Modals
const taskModal = document.getElementById('task-modal');
const modalForm = document.getElementById('modal-form');
const modalTitle = document.getElementById('modal-title');
const modalTaskIdInput = document.getElementById('modal-task-id');
const modalInputTitle = document.getElementById('modal-input-title');
const modalInputDesc = document.getElementById('modal-input-description');
const modalInputPriority = document.getElementById('modal-input-priority');
const modalInputCategory = document.getElementById('modal-input-category');
const modalInputDate = document.getElementById('modal-input-date');
const modalInputAssignee = document.getElementById('modal-input-assignee');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const openAddModalBtn = document.getElementById('open-add-modal-btn');

// Lists
const dashTodayList = document.getElementById('dash-today-list');
const fullTodoList = document.getElementById('full-todo-list');
const dashEmptyState = document.getElementById('dash-empty-state');
const workspaceEmptyState = document.getElementById('workspace-empty-state');

// Settings Elements
const setUsername = document.getElementById('set-username');
const setEmail = document.getElementById('set-email');
const setRole = document.getElementById('set-role');
const setSounds = document.getElementById('set-sounds');
const saveProfileBtn = document.getElementById('save-profile-btn');
const btnExportData = document.getElementById('btn-export-data');
const btnPurgeData = document.getElementById('btn-purge-data');

// ==========================================================================
// 3. CORE INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  applyAccentTheme();
  applyThemeMode();
  setupRouting();
  setupEventListeners();
  setupDragAndDrop();
  
  // Renders
  simulateSkeletonLoad(() => {
    renderDashboard();
    renderTasksList();
    renderKanban();
    renderCalendar();
  });
});

// Load all storage elements
function loadData() {
  // 1. Tasks
  const storedTasks = localStorage.getItem(STORAGE_TASKS_KEY);
  if (storedTasks) {
    try {
      tasks = JSON.parse(storedTasks);
    } catch (e) {
      tasks = getSampleTasks();
    }
  } else {
    tasks = getSampleTasks();
    saveTasks();
  }

  // 2. Settings
  const storedSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);
  if (storedSettings) {
    try {
      settings = { ...settings, ...JSON.parse(storedSettings) };
      // Migration from placeholder username
      if (settings.username === "Alex Carter") {
        settings.username = "Abdifatah Bashe";
        settings.email = "abdifatah@aurasystem.co";
        saveSettings();
      }
    } catch (e) { }
  } else {
    saveSettings();
  }

  // Sync settings inputs
  setUsername.value = settings.username;
  setEmail.value = settings.email;
  setRole.value = settings.role;
  setSounds.checked = settings.sounds;
  const setDarkmode = document.getElementById('set-darkmode');
  if (setDarkmode) setDarkmode.checked = settings.darkMode !== false;
  const radio = document.querySelector(`input[name="accent-color"][value="${settings.accentColor}"]`);
  if (radio) radio.checked = true;

  // 3. Activity Feed
  const storedActivity = localStorage.getItem(STORAGE_ACTIVITY_KEY);
  if (storedActivity) {
    try {
      activityLog = JSON.parse(storedActivity);
    } catch (e) {
      activityLog = [{ text: "Workspace initialized successfully", type: "info", time: Date.now() }];
    }
  } else {
    activityLog = [{ text: "Workspace initialized successfully", type: "info", time: Date.now() }];
    saveActivity();
  }

  // Apply user metadata to HTML
  updateProfileDisplays();
}

function saveTasks() {
  localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
}

function saveSettings() {
  localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
}

function saveActivity() {
  localStorage.setItem(STORAGE_ACTIVITY_KEY, JSON.stringify(activityLog));
}

function logActivity(text, type = 'info') {
  activityLog.unshift({ text, type, time: Date.now() });
  if (activityLog.length > 20) activityLog.pop(); // keep log thin
  saveActivity();
  renderActivityFeed();
}

// ==========================================================================
// 4. SPA ROUTER ENGINE
// ==========================================================================
function setupRouting() {
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const target = link.dataset.target;
      navigateToView(target);
    });
  });
}

function navigateToView(target) {
  if (target === currentView) return;
  currentView = target;

  // Update navbar visual links
  navLinks.forEach(l => {
    if (l.dataset.target === target) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });

  // Switch Views with smooth scaling transition
  views.forEach(v => {
    if (v.id === `view-${target}`) {
      v.classList.add('active');
      setTimeout(() => {
        v.classList.add('show');
      }, 50); // slight offset triggers keyframe animations
    } else {
      v.classList.remove('show');
      // Delay removal of active to allow fadeout to complete
      setTimeout(() => {
        if (v.id !== `view-${currentView}`) v.classList.remove('active');
      }, 200);
    }
  });

  // Mobile modifications
  mobileTitle.textContent = target.charAt(0).toUpperCase() + target.slice(1) + (target === 'tasks' ? ' Workspace' : target === 'kanban' ? ' Board' : ' View');
  sidebar.classList.remove('open');

  // Trigger view updates
  if (target === 'dashboard') {
    renderDashboard();
  } else if (target === 'tasks') {
    renderTasksList();
  } else if (target === 'kanban') {
    renderKanban();
  } else if (target === 'calendar') {
    renderCalendar();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// 5. THEME ENGINE & IDENTITY SETUP
// ==========================================================================
function applyAccentTheme() {
  document.body.className = `theme-${settings.accentColor}`;
  const dot = document.querySelector('.brand-logo span');
  if (dot) {
    dot.style.boxShadow = `0 0 10px var(--color-primary)`;
  }
}

function applyThemeMode() {
  const isDark = settings.darkMode !== false;
  
  if (isDark) {
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
  }
  
  const checkbox = document.getElementById('set-darkmode');
  if (checkbox) checkbox.checked = isDark;
  
  const sunIcons = document.querySelectorAll('.theme-toggle-btn .sun-icon');
  const moonIcons = document.querySelectorAll('.theme-toggle-btn .moon-icon');
  
  if (isDark) {
    sunIcons.forEach(el => el.style.display = 'none');
    moonIcons.forEach(el => el.style.display = 'block');
  } else {
    sunIcons.forEach(el => el.style.display = 'block');
    moonIcons.forEach(el => el.style.display = 'none');
  }
}

function updateProfileDisplays() {
  // Update sidebar initials
  const initials = settings.username.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  const avatarElements = [document.getElementById('sidebar-avatar'), document.getElementById('mobile-avatar')];
  avatarElements.forEach(el => {
    if (el) el.textContent = initials || 'AU';
  });

  // Update text elements
  const nameEl = document.getElementById('sidebar-name');
  if (nameEl) nameEl.textContent = settings.username;
  
  const roleEl = document.querySelector('.profile-role');
  if (roleEl) roleEl.textContent = settings.role;

  const dashNameEl = document.getElementById('dash-username');
  if (dashNameEl) dashNameEl.textContent = settings.username.split(' ')[0];
}

// Web Audio synthesizer completion chime
function playSuccessBell() {
  if (!settings.sounds) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Play a dual-tone premium chime
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.08); // G5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.error("Audio Context failed to boot: ", e);
  }
}

// Toast alerts helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast glass-card`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'info') {
    iconSvg = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  } else if (type === 'danger') {
    iconSvg = `<svg viewBox="0 0 24 24"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon ${type}">
      ${iconSvg}
    </div>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Automatically dispose
  toast.addEventListener('animationend', (e) => {
    if (e.animationName === 'toastFadeOut') {
      toast.remove();
    }
  });
}

// Shimmer load skeleton
function simulateSkeletonLoad(callback) {
  // Show skeletons
  const lists = [dashTodayList, fullTodoList];
  lists.forEach(list => {
    if (list) {
      list.innerHTML = `
        <li class="todo-item skeleton-shimmer" style="height: 58px; background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.02); --i: 0;"></li>
        <li class="todo-item skeleton-shimmer" style="height: 58px; background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.02); --i: 1;"></li>
        <li class="todo-item skeleton-shimmer" style="height: 58px; background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.02); --i: 2;"></li>
      `;
    }
  });
  
  setTimeout(() => {
    callback();
  }, 400); // quick shimmering loads
}

// Escape HTML utility
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==========================================================================
// 6. DASHBOARD LOGIC (PAGE 1)
// ==========================================================================
function renderDashboard() {
  // Set Date
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  document.getElementById('dash-current-date').textContent = new Date().toLocaleDateString('en-US', dateOptions);

  // Load Random Quote
  const quoteHash = Math.floor(Date.now() / 86400000) % quotes.length;
  document.getElementById('dash-quote').textContent = `"${quotes[quoteHash]}"`;

  // Filter today's tasks
  const todayStr = formatDate(new Date());
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);

  const countBadge = document.getElementById('dash-today-count');
  countBadge.textContent = `${todayTasks.length} today`;

  dashTodayList.innerHTML = '';
  
  if (todayTasks.length === 0) {
    dashTodayList.style.display = 'none';
    dashEmptyState.style.display = 'flex';
  } else {
    dashTodayList.style.display = 'flex';
    dashEmptyState.style.display = 'none';

    todayTasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;
      li.style.setProperty('--i', index);
      li.dataset.id = task.id;

      li.innerHTML = `
        <div class="checkbox-container">
          <div class="custom-checkbox">
            <svg viewBox="0 0 12 12">
              <polyline points="2.5 6 4.5 8 9.5 3"></polyline>
            </svg>
          </div>
          <div class="todo-text-group">
            <span class="todo-text">${escapeHTML(task.title)}</span>
            <div class="todo-meta-row">
              <span class="priority-badge ${task.priority}">${task.priority}</span>
              <span class="tag-badge">${escapeHTML(task.category)}</span>
            </div>
          </div>
        </div>
      `;

      li.querySelector('.checkbox-container').addEventListener('click', () => toggleTaskComplete(task.id));
      dashTodayList.appendChild(li);
    });
  }

  // Update metrics
  calculateStats();
  renderActivityFeed();
}

function calculateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const inProgress = tasks.filter(t => !t.completed && t.kanbanStatus === 'inprogress').length;
  
  // Calculate Overdue
  const todayStr = formatDate(new Date());
  const overdue = tasks.filter(t => !t.completed && t.dueDate < todayStr).length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-progress').textContent = inProgress;
  document.getElementById('stat-overdue').textContent = overdue;

  // Progress ring computation
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter(t => t.completed).length;
  const percentage = todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;

  const circle = document.getElementById('dash-progress-ring');
  const percentText = document.getElementById('dash-progress-percent');
  
  if (circle && percentText) {
    // 2 * PI * r = 2 * 3.14159 * 40 = 251.2
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    percentText.textContent = `${percentage}%`;
  }
}

function renderActivityFeed() {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;
  
  feed.innerHTML = '';
  activityLog.slice(0, 6).forEach(act => {
    const li = document.createElement('li');
    li.className = 'activity-item';
    
    // time format
    const timeStr = new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    li.innerHTML = `
      <div class="activity-marker ${act.type}"></div>
      <div>
        <span>${escapeHTML(act.text)}</span>
        <span class="activity-time">${timeStr}</span>
      </div>
    `;
    feed.appendChild(li);
  });
}

// ==========================================================================
// 7. TO-DO WORKSPACE CRUD (PAGE 2)
// ==========================================================================
function renderTasksList() {
  fullTodoList.innerHTML = '';
  
  // 1. Filter Tasks
  let filtered = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  // 2. Search Filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(q) || 
      task.category.toLowerCase().includes(q) ||
      (task.description && task.description.toLowerCase().includes(q))
    );
  }

  // 3. Sort Tasks
  filtered.sort((a, b) => {
    if (currentSort === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (currentSort === 'priority') {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    if (currentSort === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  if (filtered.length === 0) {
    fullTodoList.style.display = 'none';
    workspaceEmptyState.style.display = 'flex';
  } else {
    fullTodoList.style.display = 'flex';
    workspaceEmptyState.style.display = 'none';

    filtered.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;
      li.style.setProperty('--i', index);
      li.dataset.id = task.id;

      // Overdue Check
      const todayStr = formatDate(new Date());
      const isOverdue = !task.completed && task.dueDate < todayStr;
      const dateDisplay = isOverdue ? 'Overdue' : new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      li.innerHTML = `
        <div class="checkbox-container">
          <div class="custom-checkbox">
            <svg viewBox="0 0 12 12">
              <polyline points="2.5 6 4.5 8 9.5 3"></polyline>
            </svg>
          </div>
          <div class="todo-text-group">
            <span class="todo-text">${escapeHTML(task.title)}</span>
            <div class="todo-meta-row">
              <span class="priority-badge ${task.priority}">${task.priority}</span>
              <span class="tag-badge">${escapeHTML(task.category)}</span>
              <span class="due-date-badge ${isOverdue ? 'overdue' : ''}">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${dateDisplay}
              </span>
            </div>
          </div>
        </div>
        <div class="todo-actions">
          <button class="edit-btn" aria-label="Edit Task" data-tooltip="Edit">
            <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="delete-btn" aria-label="Delete Task" data-tooltip="Delete">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      `;

      // Event handlers
      li.querySelector('.checkbox-container').addEventListener('click', () => toggleTaskComplete(task.id));
      li.querySelector('.edit-btn').addEventListener('click', () => openTaskModalForEdit(task.id));
      li.querySelector('.delete-btn').addEventListener('click', () => triggerDeleteTask(task.id));

      fullTodoList.appendChild(li);
    });
  }

  // Update clear list button state
  const clearBtn = document.getElementById('list-clear-btn');
  if (tasks.some(t => t.completed)) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
  }
}

// ==========================================================================
// 8. UNIFIED STATE ACTIONS (ADD / EDIT / TOGGLE / DELETE)
// ==========================================================================
function toggleTaskComplete(id) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;

  const t = tasks[idx];
  t.completed = !t.completed;
  
  // Sync Completed state with Kanban Status
  if (t.completed) {
    t.kanbanStatus = 'done';
    playSuccessBell();
    logActivity(`Completed task: ${t.title}`, 'completed');
    showToast(`Task completed successfully`);
  } else {
    t.kanbanStatus = 'todo';
    logActivity(`Re-opened task: ${t.title}`, 'info');
    showToast(`Task set to active`, 'info');
  }

  saveTasks();

  // Animating directly in DOM for fluid aesthetics
  const items = document.querySelectorAll(`.todo-item[data-id="${id}"]`);
  items.forEach(li => {
    if (t.completed) {
      li.classList.add('completed');
    } else {
      li.classList.remove('completed');
    }
  });

  // Re-render delayed on filter pages to prevent immediate disappearances
  if (currentFilter !== 'all' && currentView === 'tasks') {
    setTimeout(() => {
      items.forEach(li => li.classList.add('slide-out'));
      setTimeout(() => {
        renderTasksList();
      }, 350);
    }, 450);
  } else {
    setTimeout(() => {
      if (currentView === 'dashboard') renderDashboard();
      if (currentView === 'tasks') renderTasksList();
      if (currentView === 'kanban') renderKanban();
      if (currentView === 'calendar') renderCalendar();
    }, 350);
  }
}

function triggerDeleteTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const items = document.querySelectorAll(`.todo-item[data-id="${id}"], .kanban-card[data-id="${id}"]`);
  items.forEach(el => el.classList.add('slide-out'));

  // Wait for slide-out animations to end
  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    logActivity(`Deleted task: ${task.title}`, 'deleted');
    showToast('Task deleted successfully', 'danger');
    
    // Refresh all views
    renderDashboard();
    renderTasksList();
    renderKanban();
    renderCalendar();
  }, 350);
}

function clearCompletedTasks() {
  const completed = tasks.filter(t => t.completed);
  if (completed.length === 0) return;

  const items = document.querySelectorAll('.todo-item.completed, .kanban-card.completed');
  items.forEach(el => el.classList.add('slide-out'));

  setTimeout(() => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    logActivity(`Cleared ${completed.length} completed tasks`, 'deleted');
    showToast('Cleared completed tasks');
    
    renderDashboard();
    renderTasksList();
    renderKanban();
    renderCalendar();
  }, 350);
}

// Quick Add Action
function handleQuickAdd() {
  const input = document.getElementById('dash-quick-input');
  const title = input.value.trim();
  if (!title) return;

  const todayStr = formatDate(new Date());
  const newTask = {
    id: Date.now(),
    title: title,
    description: "",
    priority: "medium",
    category: "Work",
    dueDate: todayStr,
    kanbanStatus: "todo",
    assignee: "AC",
    completed: false
  };

  tasks.unshift(newTask);
  saveTasks();
  input.value = '';

  logActivity(`Added task: ${title}`, 'added');
  showToast('Intention logged successfully', 'info');

  renderDashboard();
}

// Unified Modal Action (Submit)
function handleModalSubmit() {
  const idVal = modalTaskIdInput.value;
  const title = modalInputTitle.value.trim();
  const desc = modalInputDesc.value.trim();
  const priority = modalInputPriority.value;
  const category = modalInputCategory.value;
  const date = modalInputDate.value;
  const assignee = modalInputAssignee.value.trim().toUpperCase() || 'AC';

  if (!title || !date) return;

  if (idVal) {
    // Edit Mode
    const id = parseInt(idVal);
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      tasks[idx] = {
        ...tasks[idx],
        title,
        description: desc,
        priority,
        category,
        dueDate: date,
        assignee
      };
      logActivity(`Updated task: ${title}`, 'info');
      showToast('Task updated');
    }
  } else {
    // Add Mode
    const newTask = {
      id: Date.now(),
      title,
      description: desc,
      priority,
      category,
      dueDate: date,
      kanbanStatus: "todo",
      assignee,
      completed: false
    };
    tasks.unshift(newTask);
    logActivity(`Added task: ${title}`, 'added');
    showToast('Task added successfully', 'info');
  }

  saveTasks();
  closeTaskModal();
  
  // Re-render
  renderDashboard();
  renderTasksList();
  renderKanban();
  renderCalendar();
}

// ==========================================================================
// 9. KANBAN INTERACTIVITY (PAGE 3)
// ==========================================================================
function renderKanban() {
  const statuses = ['todo', 'inprogress', 'review', 'done'];
  
  statuses.forEach(status => {
    const col = document.getElementById(`kanban-${status}`);
    const badge = document.getElementById(`badge-${status}`);
    col.innerHTML = '';

    const colTasks = tasks.filter(t => t.kanbanStatus === status);
    badge.textContent = colTasks.length;

    if (colTasks.length === 0) {
      col.innerHTML = `
        <div class="kanban-column-empty">
          <span>Drop tasks here</span>
        </div>
      `;
    } else {
      colTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `kanban-card ${task.completed ? 'completed' : ''}`;
        card.draggable = true;
        card.dataset.id = task.id;

        card.innerHTML = `
          <div class="kanban-card-title">${escapeHTML(task.title)}</div>
          <div class="kanban-card-footer">
            <span class="priority-badge ${task.priority}">${task.priority}</span>
            <div class="kanban-card-assignee">${escapeHTML(task.assignee)}</div>
          </div>
        `;

        // Click on card opens edit modal
        card.addEventListener('click', (e) => {
          if (!card.classList.contains('dragging')) {
            openTaskModalForEdit(task.id);
          }
        });

        col.appendChild(card);
      });
    }
  });

  // Re-bind drag listeners to new elements
  setupDragCards();
}

function setupDragAndDrop() {
  const columns = document.querySelectorAll('.kanban-cards');
  
  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      
      const idStr = e.dataTransfer.getData('text/plain');
      const id = parseInt(idStr);
      const targetColumn = col.parentNode.dataset.column;
      
      moveKanbanTask(id, targetColumn);
    });
  });
}

function setupDragCards() {
  const cards = document.querySelectorAll('.kanban-card');
  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', card.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });
}

function moveKanbanTask(id, newStatus) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;

  const t = tasks[idx];
  const oldStatus = t.kanbanStatus;
  if (oldStatus === newStatus) return;

  t.kanbanStatus = newStatus;
  
  // Toggling status done vs others completes/re-opens tasks
  if (newStatus === 'done') {
    if (!t.completed) {
      t.completed = true;
      playSuccessBell();
    }
  } else {
    t.completed = false;
  }

  saveTasks();
  
  // Log activity & toast
  const statusLabels = { todo: 'To Do', inprogress: 'In Progress', review: 'Review', done: 'Done' };
  logActivity(`Moved: "${t.title}" to ${statusLabels[newStatus]}`, 'info');
  showToast(`Moved to ${statusLabels[newStatus]}`, 'success');

  renderDashboard();
  renderTasksList();
  renderKanban();
  renderCalendar();
}

// Inline card creators inside Columns
function setupInlineKanbanCreators() {
  const addButtons = document.querySelectorAll('.inline-add-btn');
  addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const col = btn.dataset.column;
      const container = btn.parentNode;
      const inputWrapper = container.querySelector('.inline-input-box');
      const input = inputWrapper.querySelector('.inline-add-input');
      
      btn.style.display = 'none';
      inputWrapper.style.display = 'block';
      input.focus();

      // Submit on enter or blur
      const submit = () => {
        const title = input.value.trim();
        if (title) {
          const newTask = {
            id: Date.now(),
            title,
            description: "",
            priority: "medium",
            category: "Work",
            dueDate: formatDate(new Date()),
            kanbanStatus: col,
            assignee: "AC",
            completed: col === 'done'
          };
          tasks.unshift(newTask);
          saveTasks();
          logActivity(`Added card: ${title}`, 'added');
          showToast('Card logged successfully');
          renderDashboard();
          renderTasksList();
          renderKanban();
          renderCalendar();
        }
        btn.style.display = 'block';
        inputWrapper.style.display = 'none';
        input.value = '';
      };

      input.onkeypress = (e) => {
        if (e.key === 'Enter') submit();
      };
      
      input.onblur = () => {
        setTimeout(submit, 150); // slight timeout prevents race conditions on clicks
      };
    });
  });
}

// ==========================================================================
// 10. MONTHLY CALENDAR GRID ENGINE (PAGE 4)
// ==========================================================================
function renderCalendar() {
  const container = document.getElementById('calendar-days-container');
  const monthYearLabel = document.getElementById('cal-month-year');
  if (!container) return;

  container.innerHTML = '';

  const year = calCurrentDate.getFullYear();
  const month = calCurrentDate.getMonth();

  // Set header text
  const monthName = calCurrentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  monthYearLabel.textContent = monthName;

  // Math dates configuration
  const firstDayIndex = new Date(year, month, 1).getDay(); // day of week index of day 1
  const totalDays = new Date(year, month + 1, 0).getDate(); // days in current month
  const prevTotalDays = new Date(year, month, 0).getDate(); // days in previous month

  // Total calendar slots: 35 or 42 based on grid offsets
  const totalSlots = (firstDayIndex + totalDays) > 35 ? 42 : 35;

  let cellIndex = 0;

  // Render preceding month padding cells
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevTotalDays - i;
    const paddingDate = new Date(year, month - 1, day);
    renderCalendarCell(container, paddingDate, false);
    cellIndex++;
  }

  // Render current month active cells
  for (let d = 1; d <= totalDays; d++) {
    const currentDate = new Date(year, month, d);
    renderCalendarCell(container, currentDate, true);
    cellIndex++;
  }

  // Render next month padding cells
  let nextDay = 1;
  while (cellIndex < totalSlots) {
    const paddingDate = new Date(year, month + 1, nextDay);
    renderCalendarCell(container, paddingDate, false);
    nextDay++;
    cellIndex++;
  }

  // Render side panel details for selected day
  renderCalendarPanel();
}

function renderCalendarCell(container, date, isActiveMonth) {
  const cell = document.createElement('div');
  cell.className = `cal-day-cell ${isActiveMonth ? 'active-month' : 'other-month'}`;
  
  const dateStr = formatDate(date);
  cell.dataset.date = dateStr;

  // Check if cell is Today
  const todayStr = formatDate(new Date());
  if (dateStr === todayStr) cell.classList.add('today');

  // Check if selected
  if (dateStr === formatDate(calSelectedDate)) cell.classList.add('selected');

  // Day Number
  const number = document.createElement('div');
  number.className = 'cal-day-number';
  number.textContent = date.getDate();
  cell.appendChild(number);

  // Day Dot indicators
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'cal-day-dots';

  const dayTasks = tasks.filter(t => t.dueDate === dateStr);
  
  // Show at most 3 dots sorted by priority weight
  dayTasks.slice(0, 3).forEach(t => {
    const dot = document.createElement('span');
    dot.className = `cal-dot ${t.priority}`;
    dotsContainer.appendChild(dot);
  });

  cell.appendChild(dotsContainer);

  // Bind cell selection
  cell.addEventListener('click', () => {
    calSelectedDate = date;
    
    // Update active highlight classes directly in DOM
    const cells = document.querySelectorAll('.cal-day-cell');
    cells.forEach(c => c.classList.remove('selected'));
    cell.classList.add('selected');

    renderCalendarPanel();
  });

  container.appendChild(cell);
}

function renderCalendarPanel() {
  const panelList = document.getElementById('cal-panel-list');
  const panelEmpty = document.getElementById('cal-panel-empty');
  const dateLabel = document.getElementById('cal-selected-date-label');

  // format label
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  dateLabel.textContent = calSelectedDate.toLocaleDateString('en-US', options);

  panelList.innerHTML = '';
  const dateStr = formatDate(calSelectedDate);
  const dayTasks = tasks.filter(t => t.dueDate === dateStr);

  if (dayTasks.length === 0) {
    panelList.style.display = 'none';
    panelEmpty.style.display = 'flex';
  } else {
    panelList.style.display = 'flex';
    panelEmpty.style.display = 'none';

    dayTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `todo-item ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <div class="checkbox-container">
          <div class="custom-checkbox">
            <svg viewBox="0 0 12 12">
              <polyline points="2.5 6 4.5 8 9.5 3"></polyline>
            </svg>
          </div>
          <div class="todo-text-group">
            <span class="todo-text">${escapeHTML(task.title)}</span>
            <div class="todo-meta-row">
              <span class="priority-badge ${task.priority}">${task.priority}</span>
            </div>
          </div>
        </div>
      `;

      li.querySelector('.checkbox-container').addEventListener('click', () => toggleTaskComplete(task.id));
      panelList.appendChild(li);
    });
  }
}

// Navigation triggers for Month changes
function navigateMonth(direction) {
  calCurrentDate.setMonth(calCurrentDate.getMonth() + direction);
  renderCalendar();
}

// ==========================================================================
// 11. WORKSPACE SETTINGS & ACTIONS (PAGE 5)
// ==========================================================================
function saveProfileIdentity() {
  const u = setUsername.value.trim();
  const e = setEmail.value.trim();
  const r = setRole.value.trim();

  if (!u) return;

  settings.username = u;
  settings.email = e;
  settings.role = r;

  saveSettings();
  updateProfileDisplays();

  logActivity(`Updated profile credentials`, 'info');
  showToast('Profile credentials saved');
}

function handleAccentChange(color) {
  settings.accentColor = color;
  saveSettings();
  applyAccentTheme();
  logActivity(`Accent color color updated to ${color}`, 'info');
  showToast(`Accent set to ${color}`);
}

function exportTasksJSON() {
  try {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", `aura_workspace_backup.json`);
    dlAnchorElem.click();
    showToast('JSON Export complete');
  } catch (e) {
    showToast('Export failed', 'danger');
  }
}

function purgeWorkspace() {
  if (confirm("Are you sure you want to permanently erase this workspace? This will purge all tasks and log files.")) {
    tasks = [];
    activityLog = [{ text: "Workspace fully purged & reset", type: "deleted", time: Date.now() }];
    
    saveTasks();
    saveActivity();
    
    showToast('Workspace purged', 'danger');
    
    // render everything back
    renderDashboard();
    renderTasksList();
    renderKanban();
    renderCalendar();
  }
}

// ==========================================================================
// 12. UNIFIED MODAL BINDERS
// ==========================================================================
function openTaskModalForAdd() {
  modalTitle.textContent = "Establish Intention";
  modalTaskIdInput.value = '';
  modalForm.reset();
  
  // Set default due date to today
  modalInputDate.value = formatDate(new Date());
  
  taskModal.classList.add('active');
  modalInputTitle.focus();
}

function openTaskModalForEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  modalTitle.textContent = "Refine Intention";
  modalTaskIdInput.value = task.id;
  modalInputTitle.value = task.title;
  modalInputDesc.value = task.description || '';
  modalInputPriority.value = task.priority;
  modalInputCategory.value = task.category;
  modalInputDate.value = task.dueDate;
  modalInputAssignee.value = task.assignee || 'AC';

  taskModal.classList.add('active');
  modalInputTitle.focus();
}

function closeTaskModal() {
  taskModal.classList.remove('active');
  modalForm.reset();
}

// ==========================================================================
// 13. GLOBAL WINDOW EVENT BINDERS
// ==========================================================================
function setupEventListeners() {
  // Mobile responsive sidebar hooks
  mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
  });

  mobileCloseBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });

  // Modal open/close binds
  openAddModalBtn.addEventListener('click', openTaskModalForAdd);
  modalCloseBtn.addEventListener('click', closeTaskModal);
  modalCancelBtn.addEventListener('click', closeTaskModal);

  // Close modal clicking outside container
  taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) closeTaskModal();
  });

  // Save Modal Form submit
  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleModalSubmit();
  });

  // Quick task add hooks
  document.getElementById('dash-quick-btn').addEventListener('click', handleQuickAdd);
  document.getElementById('dash-quick-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleQuickAdd();
  });

  // Workspace list filters & clear completed
  const listFilters = document.querySelectorAll('.list-filters .filter-tab');
  listFilters.forEach(tab => {
    tab.addEventListener('click', () => {
      listFilters.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderTasksList();
    });
  });

  document.getElementById('list-clear-btn').addEventListener('click', clearCompletedTasks);

  // Search input triggers
  document.getElementById('task-search').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasksList();
  });

  // Sort dropdown changes
  document.getElementById('task-sort').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTasksList();
  });

  // Kanban Board Card Creators
  setupInlineKanbanCreators();

  // Calendar prev/next buttons
  document.getElementById('cal-prev-btn').addEventListener('click', () => navigateMonth(-1));
  document.getElementById('cal-next-btn').addEventListener('click', () => navigateMonth(1));

  // Settings: Identity
  saveProfileBtn.addEventListener('click', saveProfileIdentity);

  // Settings: Accent picker inputs
  const accentRadios = document.querySelectorAll('input[name="accent-color"]');
  accentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) handleAccentChange(radio.value);
    });
  });

  // Settings: Sounds toggler
  setSounds.addEventListener('change', () => {
    settings.sounds = setSounds.checked;
    saveSettings();
    showToast(`Sounds ${settings.sounds ? 'enabled' : 'disabled'}`, 'info');
  });

  // Settings: Dark Mode toggler
  const setDarkmode = document.getElementById('set-darkmode');
  if (setDarkmode) {
    setDarkmode.addEventListener('change', (e) => {
      settings.darkMode = e.target.checked;
      saveSettings();
      applyThemeMode();
      logActivity(`Switched theme to ${settings.darkMode ? 'Dark' : 'Light'} Mode`, 'info');
      showToast(`${settings.darkMode ? 'Dark' : 'Light'} Mode active`, 'info');
    });
  }

  // Sidebar & Mobile Header quick toggles
  const toggleTheme = () => {
    settings.darkMode = settings.darkMode === false;
    saveSettings();
    applyThemeMode();
    logActivity(`Switched theme to ${settings.darkMode ? 'Dark' : 'Light'} Mode`, 'info');
    showToast(`${settings.darkMode ? 'Dark' : 'Light'} Mode active`, 'info');
  };

  const btnSidebar = document.getElementById('theme-toggle-sidebar');
  const btnMobile = document.getElementById('theme-toggle-mobile');
  if (btnSidebar) btnSidebar.addEventListener('click', toggleTheme);
  if (btnMobile) btnMobile.addEventListener('click', toggleTheme);

  // Settings: Data management hooks
  btnExportData.addEventListener('click', exportTasksJSON);
  btnPurgeData.addEventListener('click', purgeWorkspace);
}
