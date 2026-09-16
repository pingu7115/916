/**
 * Personal Pulse - Interactive Hub & Clock Engine
 */

(function () {
  'use strict';

  // State
  const state = {
    is24Hour: true,
    soundEnabled: false,
    theme: 'aurora',
    name: '蕭宥瑄',
    bio: 'Software Crafter & Creative Explorer',
    statusEmoji: '⚡',
    statusText: 'In The Flow',
    focusText: '',
  };

  // Audio Context (Synthesizer for subtle tick)
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function playGentleTick() {
    if (!state.soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (err) {
      console.warn('Audio tick error:', err);
    }
  }

  // DOM Elements
  const elements = {
    // Clock
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    ampmTag: document.getElementById('ampm-tag'),
    dateDisplay: document.getElementById('date-display'),
    timeFormatBtn: document.getElementById('time-format-btn'),
    formatLabel: document.getElementById('format-label'),
    soundToggleBtn: document.getElementById('sound-toggle-btn'),
    soundIcon: document.getElementById('sound-icon'),
    dayProgressBar: document.getElementById('day-progress-bar'),
    progressMarker: document.getElementById('progress-marker'),
    dayProgressVal: document.getElementById('day-progress-val'),
    
    // Greeting & Identity
    greetingIcon: document.getElementById('greeting-icon'),
    greetingPrefix: document.getElementById('greeting-prefix'),
    userDisplayName: document.getElementById('user-display-name'),
    nameInput: document.getElementById('name-input'),
    editNameBtn: document.getElementById('edit-name-btn'),
    avatarDisplay: document.getElementById('avatar-display'),
    avatarInitials: document.getElementById('avatar-initials'),
    userBio: document.getElementById('user-bio'),
    bioInput: document.getElementById('bio-input'),
    timezoneText: document.getElementById('timezone-text'),
    
    // Status
    statusPickerBtn: document.getElementById('status-picker-btn'),
    currentStatusEmoji: document.getElementById('current-status-emoji'),
    currentStatusText: document.getElementById('current-status-text'),
    statusModal: document.getElementById('status-modal'),
    closeStatusModal: document.getElementById('close-status-modal'),
    customEmojiInput: document.getElementById('custom-emoji-input'),
    customTextInput: document.getElementById('custom-text-input'),
    saveCustomStatusBtn: document.getElementById('save-custom-status-btn'),
    statusChoices: document.querySelectorAll('.status-choice'),
    
    // Theme
    themeBtn: document.getElementById('theme-btn'),
    themeName: document.getElementById('theme-name'),
    themeMenu: document.getElementById('theme-menu'),
    themeOptions: document.querySelectorAll('.theme-option'),
    
    // World Clock
    timeTokyo: document.getElementById('time-tokyo'),
    timeLondon: document.getElementById('time-london'),
    timeNewYork: document.getElementById('time-newyork'),
    timeSf: document.getElementById('time-sf'),
    
    // Daily Focus
    dailyFocusText: document.getElementById('daily-focus-text'),
    focusSaveStatus: document.getElementById('focus-save-status'),
    clearFocusBtn: document.getElementById('clear-focus-btn'),
  };

  // Helper: compute initials
  function computeInitials(fullName) {
    if (!fullName) return 'U';
    const trimmed = fullName.trim();
    if (/[\u4e00-\u9fa5]/.test(trimmed)) {
      return trimmed.length > 2 ? trimmed.slice(-2) : trimmed;
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Load Saved Preferences from localStorage
  function loadPreferences() {
    try {
      const saved24 = localStorage.getItem('personal_pulse_24h');
      if (saved24 !== null) state.is24Hour = saved24 === 'true';

      const savedTheme = localStorage.getItem('personal_pulse_theme');
      if (savedTheme) state.theme = savedTheme;

      const savedName = localStorage.getItem('personal_pulse_name');
      if (savedName && savedName !== 'Alex Rivera') {
        state.name = savedName;
      } else {
        state.name = '蕭宥瑄';
        localStorage.setItem('personal_pulse_name', '蕭宥瑄');
      }

      const savedBio = localStorage.getItem('personal_pulse_bio');
      if (savedBio) state.bio = savedBio;

      const savedEmoji = localStorage.getItem('personal_pulse_status_emoji');
      if (savedEmoji) state.statusEmoji = savedEmoji;

      const savedStatus = localStorage.getItem('personal_pulse_status_text');
      if (savedStatus) state.statusText = savedStatus;

      const savedFocus = localStorage.getItem('personal_pulse_focus');
      if (savedFocus) state.focusText = savedFocus;
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  // Apply State to DOM
  function applyState() {
    // Theme
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeNames = {
      aurora: 'Aurora',
      midnight: 'Midnight',
      sunset: 'Sunset',
      emerald: 'Emerald'
    };
    if (elements.themeName) elements.themeName.textContent = themeNames[state.theme] || 'Theme';
    elements.themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === state.theme);
    });

    // 12/24H format button
    if (elements.formatLabel) {
      elements.formatLabel.textContent = state.is24Hour ? '24H' : '12H';
    }
    if (elements.ampmTag) {
      elements.ampmTag.classList.toggle('hidden', state.is24Hour);
    }

    // Name & Bio
    if (elements.userDisplayName) elements.userDisplayName.textContent = state.name;
    if (elements.avatarInitials) elements.avatarInitials.textContent = computeInitials(state.name);
    if (elements.userBio) elements.userBio.textContent = state.bio;
    document.title = `${state.name} • Personal Hub`;

    // Status
    if (elements.currentStatusEmoji) elements.currentStatusEmoji.textContent = state.statusEmoji;
    if (elements.currentStatusText) elements.currentStatusText.textContent = state.statusText;

    // Focus
    if (elements.dailyFocusText) elements.dailyFocusText.value = state.focusText;
  }

  // Detect and Display Timezone
  function setupTimezoneDisplay() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
      const offsetMinutes = -new Date().getTimezoneOffset();
      const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
      const offsetRemMinutes = Math.abs(offsetMinutes) % 60;
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const gmtString = `UTC${sign}${offsetHours}${offsetRemMinutes > 0 ? `:${offsetRemMinutes}` : ''}`;
      
      if (elements.timezoneText) {
        elements.timezoneText.textContent = `${tz} (${gmtString})`;
      }
    } catch (err) {
      if (elements.timezoneText) {
        elements.timezoneText.textContent = 'Local Time';
      }
    }
  }

  // Real-Time Clock Loop
  let lastSecond = -1;

  function updateClock() {
    const now = new Date();
    const currentSecond = now.getSeconds();

    if (currentSecond !== lastSecond) {
      lastSecond = currentSecond;
      playGentleTick();
    }

    let h = now.getHours();
    const m = now.getMinutes();
    const s = currentSecond;

    // Format Hours
    let ampm = 'AM';
    if (!state.is24Hour) {
      ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      h = h ? h : 12; // 0 becomes 12
    }

    const hStr = String(h).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    const sStr = String(s).padStart(2, '0');

    if (elements.hours) elements.hours.textContent = hStr;
    if (elements.minutes) elements.minutes.textContent = mStr;
    if (elements.seconds) elements.seconds.textContent = sStr;
    if (elements.ampmTag) elements.ampmTag.textContent = ampm;

    // Full Date String
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (elements.dateDisplay) {
      elements.dateDisplay.textContent = now.toLocaleDateString(undefined, dateOptions);
    }

    // Dynamic Greeting based on raw 24h
    updateGreeting(now.getHours());

    // Day Progress Percentage
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const msIntoDay = now.getTime() - startOfDay;
    const totalDayMs = 24 * 60 * 60 * 1000;
    const progressPercent = Math.min(100, Math.max(0, (msIntoDay / totalDayMs) * 100));
    const formattedPercent = `${progressPercent.toFixed(1)}%`;

    if (elements.dayProgressVal) elements.dayProgressVal.textContent = formattedPercent;
    if (elements.dayProgressBar) elements.dayProgressBar.style.width = formattedPercent;
    if (elements.progressMarker) elements.progressMarker.style.left = formattedPercent;

    // World Times
    updateWorldTimes(now);
  }

  // Dynamic Greeting Engine
  function updateGreeting(hour) {
    let greeting = 'Good day,';
    let icon = '☀️';

    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning,';
      icon = '🌅';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon,';
      icon = '☀️';
    } else if (hour >= 17 && hour < 21) {
      greeting = 'Good evening,';
      icon = '🌆';
    } else {
      greeting = 'Good night,';
      icon = '🌙';
    }

    if (elements.greetingPrefix) elements.greetingPrefix.textContent = greeting;
    if (elements.greetingIcon) elements.greetingIcon.textContent = icon;
  }

  // World Times Updater
  function updateWorldTimes(now) {
    const formatCityTime = (timeZone) => {
      try {
        const timeOptions = {
          timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: !state.is24Hour
        };
        return new Intl.DateTimeFormat('en-US', timeOptions).format(now);
      } catch (e) {
        return '--:--';
      }
    };

    if (elements.timeTokyo) elements.timeTokyo.textContent = formatCityTime('Asia/Tokyo');
    if (elements.timeLondon) elements.timeLondon.textContent = formatCityTime('Europe/London');
    if (elements.timeNewYork) elements.timeNewYork.textContent = formatCityTime('America/New_York');
    if (elements.timeSf) elements.timeSf.textContent = formatCityTime('America/Los_Angeles');
  }

  // Inline Name Editor
  function setupNameEditor() {
    function startEdit() {
      elements.userDisplayName.classList.add('hidden');
      elements.nameInput.classList.remove('hidden');
      elements.nameInput.value = state.name;
      elements.nameInput.focus();
      elements.nameInput.select();
    }

    function saveEdit() {
      const trimmed = elements.nameInput.value.trim();
      if (trimmed) {
        state.name = trimmed;
        localStorage.setItem('personal_pulse_name', trimmed);
        elements.userDisplayName.textContent = trimmed;
        if (elements.avatarInitials) elements.avatarInitials.textContent = computeInitials(trimmed);
        document.title = `${trimmed} • Personal Hub`;
      }
      elements.nameInput.classList.add('hidden');
      elements.userDisplayName.classList.remove('hidden');
    }

    elements.userDisplayName.addEventListener('click', startEdit);
    elements.editNameBtn.addEventListener('click', startEdit);

    elements.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveEdit();
      if (e.key === 'Escape') {
        elements.nameInput.classList.add('hidden');
        elements.userDisplayName.classList.remove('hidden');
      }
    });

    elements.nameInput.addEventListener('blur', saveEdit);
  }

  // Inline Bio Editor
  function setupBioEditor() {
    function startEditBio() {
      elements.userBio.classList.add('hidden');
      elements.bioInput.classList.remove('hidden');
      elements.bioInput.value = state.bio;
      elements.bioInput.focus();
      elements.bioInput.select();
    }

    function saveEditBio() {
      const trimmed = elements.bioInput.value.trim();
      if (trimmed) {
        state.bio = trimmed;
        localStorage.setItem('personal_pulse_bio', trimmed);
        elements.userBio.textContent = trimmed;
      }
      elements.bioInput.classList.add('hidden');
      elements.userBio.classList.remove('hidden');
    }

    elements.userBio.addEventListener('click', startEditBio);

    elements.bioInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveEditBio();
      if (e.key === 'Escape') {
        elements.bioInput.classList.add('hidden');
        elements.userBio.classList.remove('hidden');
      }
    });

    elements.bioInput.addEventListener('blur', saveEditBio);
  }

  // Status Modal Handlers
  function setupStatusModal() {
    elements.statusPickerBtn.addEventListener('click', () => {
      elements.statusModal.classList.remove('hidden');
      elements.statusModal.setAttribute('aria-hidden', 'false');
    });

    function closeModal() {
      elements.statusModal.classList.add('hidden');
      elements.statusModal.setAttribute('aria-hidden', 'true');
    }

    elements.closeStatusModal.addEventListener('click', closeModal);
    elements.statusModal.addEventListener('click', (e) => {
      if (e.target === elements.statusModal) closeModal();
    });

    elements.statusChoices.forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.dataset.emoji;
        const text = btn.dataset.text;
        updateStatus(emoji, text);
        closeModal();
      });
    });

    elements.saveCustomStatusBtn.addEventListener('click', () => {
      const emoji = elements.customEmojiInput.value.trim() || '✨';
      const text = elements.customTextInput.value.trim() || 'Focusing';
      updateStatus(emoji, text);
      closeModal();
    });
  }

  function updateStatus(emoji, text) {
    state.statusEmoji = emoji;
    state.statusText = text;
    localStorage.setItem('personal_pulse_status_emoji', emoji);
    localStorage.setItem('personal_pulse_status_text', text);
    elements.currentStatusEmoji.textContent = emoji;
    elements.currentStatusText.textContent = text;
  }

  // Theme Dropdown Handlers
  function setupThemeDropdown() {
    elements.themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.themeMenu.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      elements.themeMenu.classList.remove('active');
    });

    elements.themeOptions.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedTheme = opt.dataset.theme;
        state.theme = selectedTheme;
        localStorage.setItem('personal_pulse_theme', selectedTheme);
        applyState();
        elements.themeMenu.classList.remove('active');
      });
    });
  }

  // 12h / 24h Toggle
  function setupTimeFormatToggle() {
    elements.timeFormatBtn.addEventListener('click', () => {
      state.is24Hour = !state.is24Hour;
      localStorage.setItem('personal_pulse_24h', state.is24Hour);
      applyState();
      updateClock();
    });
  }

  // Sound Toggle
  function setupSoundToggle() {
    elements.soundToggleBtn.addEventListener('click', () => {
      initAudio();
      state.soundEnabled = !state.soundEnabled;
      elements.soundIcon.textContent = state.soundEnabled ? '🔔' : '🔇';
      elements.soundToggleBtn.classList.toggle('primary', state.soundEnabled);
      if (state.soundEnabled) playGentleTick();
    });
  }

  // Daily Focus & Scratchpad
  function setupDailyFocus() {
    let debounceTimer;
    elements.dailyFocusText.addEventListener('input', () => {
      if (elements.focusSaveStatus) elements.focusSaveStatus.textContent = 'Saving...';
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.focusText = elements.dailyFocusText.value;
        localStorage.setItem('personal_pulse_focus', state.focusText);
        if (elements.focusSaveStatus) elements.focusSaveStatus.textContent = 'Saved';
      }, 500);
    });

    elements.clearFocusBtn.addEventListener('click', () => {
      elements.dailyFocusText.value = '';
      state.focusText = '';
      localStorage.removeItem('personal_pulse_focus');
      if (elements.focusSaveStatus) elements.focusSaveStatus.textContent = 'Cleared';
      setTimeout(() => {
        if (elements.focusSaveStatus) elements.focusSaveStatus.textContent = 'Saved';
      }, 1500);
    });
  }

  // Initialize
  function init() {
    loadPreferences();
    applyState();
    setupTimezoneDisplay();
    setupNameEditor();
    setupBioEditor();
    setupStatusModal();
    setupThemeDropdown();
    setupTimeFormatToggle();
    setupSoundToggle();
    setupDailyFocus();

    // Initial clock update and loop
    updateClock();
    setInterval(updateClock, 500);
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
