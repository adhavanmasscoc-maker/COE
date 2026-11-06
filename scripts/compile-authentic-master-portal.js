const fs = require('fs');
const path = require('path');

console.log('Compiling 100% Authentic 7-Year Tamil Nadu HSE 12th Maths Question Bank Portal...');

const papers = JSON.parse(fs.readFileSync('scripts/authentic-exam-papers.json', 'utf8'));

// Verify that all 7 years exist and have 20 MCQs
const requiredYears = [
  '2026-annual',
  '2025-annual',
  '2024-annual',
  '2023-annual',
  '2022-annual',
  '2021-annual',
  '2020-annual'
];

for (const y of requiredYears) {
  if (!papers[y] || !papers[y].part1 || papers[y].part1.length !== 20) {
    throw new Error(`Missing or incomplete paper for ${y}`);
  }
}

// Generate the complete HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="artifact-type" content="tool">
  <meta name="theme-color" content="#090a15">
  <title>Tamil Nadu HSE 12th Maths Board Examination Portal & CBT Practice Hub (2020–2026)</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Mukta+Malar:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- KaTeX CSS & JS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.2/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.18.2/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.18.2/dist/contrib/auto-render.min.js"></script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@1.43.0/dist/umd/lucide.min.js"></script>

  <style>
    :root {
      --bg-base: #090a15;
      --bg-surface: #101223;
      --bg-surface-elevated: #161930;
      --bg-surface-hover: #1c203d;
      --border-subtle: rgba(124, 58, 237, 0.2);
      --border-strong: rgba(124, 58, 237, 0.45);
      --text-main: #f0f0ff;
      --text-secondary: #9da3c7;
      --text-muted: #5c628a;
      --primary: #7c3aed;
      --primary-light: #a78bfa;
      --primary-gradient: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      --accent-emerald: #10b981;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
      --accent-sky: #0ea5e9;
      --radius-sm: 8px;
      --radius-md: 12px;
      --radius-lg: 18px;
      --shadow-glow: 0 0 25px rgba(124, 58, 237, 0.25);
      --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.4);
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-serif: 'Libre Caslon Text', Georgia, serif;
      --font-tamil: 'Mukta Malar', 'Inter', sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    [data-theme="paper"] {
      --bg-base: #f7f4ec;
      --bg-surface: #fffdf8;
      --bg-surface-elevated: #ece5d4;
      --bg-surface-hover: #e3dac4;
      --border-subtle: #d9cfb8;
      --border-strong: #b08d57;
      --text-main: #1c1f26;
      --text-secondary: #4f5360;
      --text-muted: #7d8291;
      --primary: #14213d;
      --primary-light: #2d5a4a;
      --primary-gradient: linear-gradient(135deg, #14213d 0%, #2d5a4a 100%);
      --accent-emerald: #2d5a4a;
      --accent-amber: #b08d57;
      --accent-rose: #9b2c2c;
      --accent-sky: #2b6cb0;
      --shadow-glow: 0 4px 15px rgba(0, 0, 0, 0.08);
      --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-base);
      color: var(--text-main);
      font-family: var(--font-sans);
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Top Bar */
    .top-nav {
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(12px);
    }

    .nav-container {
      max-width: 1360px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .brand-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-family: var(--font-mono);
      display: block;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-subtle {
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      border-color: var(--border-subtle);
    }

    .btn-subtle:hover {
      background: var(--bg-surface-hover);
      color: var(--text-main);
      border-color: var(--border-strong);
    }

    .btn-primary {
      background: var(--primary-gradient);
      color: #fff;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
    }

    .btn-primary:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    /* Container */
    .main-container {
      max-width: 1360px;
      width: 100%;
      margin: 0 auto;
      padding: 24px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Hero Banner */
    .hero-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 32px;
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-card);
    }

    .hero-card::after {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-family: var(--font-mono);
      background: rgba(124, 58, 237, 0.15);
      color: var(--primary-light);
      border: 1px solid var(--border-subtle);
      margin-bottom: 12px;
    }

    .hero-title {
      font-size: clamp(1.6rem, 2.8vw, 2.4rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.25;
      margin-bottom: 8px;
    }

    .hero-desc {
      font-size: 0.95rem;
      color: var(--text-secondary);
      max-width: 820px;
      margin-bottom: 20px;
    }

    /* Filter Controls & Year Tabs */
    .controls-strip {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px 20px;
    }

    .year-pills {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .pill-btn {
      padding: 7px 16px;
      border-radius: var(--radius-sm);
      font-size: 0.82rem;
      font-weight: 700;
      font-family: var(--font-mono);
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pill-btn:hover {
      background: var(--bg-surface-hover);
      color: var(--text-main);
      border-color: var(--border-strong);
    }

    .pill-btn.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary-light);
      box-shadow: 0 0 12px rgba(124, 58, 237, 0.5);
    }

    .search-input-wrap {
      position: relative;
      min-width: 260px;
    }

    .search-input-wrap input {
      width: 100%;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 8px 12px 8px 36px;
      font-size: 0.85rem;
      color: var(--text-main);
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input-wrap input:focus {
      border-color: var(--primary-light);
    }

    .search-input-wrap svg {
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      width: 16px;
      height: 16px;
    }

    /* Layout Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Paper Info Card */
    .paper-header-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 20px;
      margin-bottom: 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .paper-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .paper-meta-pills {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .meta-tag {
      font-size: 0.75rem;
      font-family: var(--font-mono);
      padding: 3px 8px;
      border-radius: 4px;
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }

    /* Part Sections */
    .part-section {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-card);
    }

    .part-banner {
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .part-heading {
      font-size: 1.15rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .part-rubric {
      font-size: 0.8rem;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }

    /* Question Card */
    .q-card {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 20px;
      margin-bottom: 16px;
      transition: all 0.2s ease;
    }

    .q-card:hover {
      border-color: var(--border-strong);
    }

    .q-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    .q-num-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: var(--primary);
      color: #fff;
      font-weight: 700;
      font-size: 0.85rem;
      font-family: var(--font-mono);
      flex-shrink: 0;
    }

    .q-chapter-tag {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--primary-light);
      background: rgba(124, 58, 237, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid rgba(124, 58, 237, 0.2);
    }

    .q-text-en {
      font-size: 0.98rem;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .q-text-ta {
      font-size: 0.94rem;
      font-family: var(--font-tamil);
      color: var(--text-secondary);
      margin-bottom: 16px;
      line-height: 1.6;
    }

    /* MCQ Options Grid */
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }

    @media (max-width: 640px) {
      .options-grid {
        grid-template-columns: 1fr;
      }
    }

    .option-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      text-align: left;
      font-size: 0.88rem;
      color: var(--text-main);
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      transition: all 0.2s ease;
    }

    .option-btn:hover {
      background: var(--bg-surface-hover);
      border-color: var(--primary-light);
    }

    .option-btn.correct {
      background: rgba(16, 185, 129, 0.15) !important;
      border-color: var(--accent-emerald) !important;
      color: #fff;
    }

    .option-btn.incorrect {
      background: rgba(244, 63, 94, 0.15) !important;
      border-color: var(--accent-rose) !important;
      color: #fff;
    }

    .opt-key {
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--primary-light);
      flex-shrink: 0;
    }

    /* Solution Box */
    .sol-box {
      background: rgba(124, 58, 237, 0.08);
      border: 1px solid rgba(124, 58, 237, 0.25);
      border-radius: var(--radius-sm);
      padding: 14px;
      margin-top: 12px;
      display: none;
    }

    .sol-box.revealed {
      display: block;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .sol-header {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--primary-light);
      font-family: var(--font-mono);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .sol-content-en {
      font-size: 0.88rem;
      color: var(--text-main);
      margin-bottom: 4px;
    }

    .sol-content-ta {
      font-size: 0.85rem;
      font-family: var(--font-tamil);
      color: var(--text-secondary);
    }

    /* Sidebar Panels */
    .sidebar-panel {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: var(--shadow-card);
    }

    .sidebar-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* CBT Palette */
    .cbt-timer {
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      padding: 12px;
      text-align: center;
      font-family: var(--font-mono);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--primary-light);
      margin-bottom: 16px;
      letter-spacing: 0.05em;
    }

    .palette-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }

    .pal-btn {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-weight: 700;
      font-family: var(--font-mono);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .pal-btn:hover {
      background: var(--bg-surface-hover);
      color: var(--text-main);
    }

    .pal-btn.answered {
      background: rgba(16, 185, 129, 0.25);
      border-color: var(--accent-emerald);
      color: #fff;
    }

    .pal-btn.wrong {
      background: rgba(244, 63, 94, 0.25);
      border-color: var(--accent-rose);
      color: #fff;
    }

    /* Formula Accordion */
    .formula-item {
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      margin-bottom: 8px;
      overflow: hidden;
    }

    .formula-head {
      background: var(--bg-surface-elevated);
      padding: 10px 14px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .formula-body {
      padding: 12px;
      background: var(--bg-surface);
      font-size: 0.85rem;
      display: none;
      border-top: 1px solid var(--border-subtle);
    }

    .formula-body.open {
      display: block;
    }

    /* Print styles */
    @media print {
      body {
        background: #fff !important;
        color: #000 !important;
      }
      .top-nav, .controls-strip, .sidebar-panel, .btn, .search-input-wrap {
        display: none !important;
      }
      .content-grid {
        grid-template-columns: 1fr !important;
      }
      .q-card {
        border: 1px solid #ccc !important;
        page-break-inside: avoid;
      }
      .sol-box {
        display: block !important;
        border: 1px solid #ddd !important;
        background: #fafafa !important;
      }
    }
  </style>
</head>
<body>

  <!-- Top Navigation -->
  <header class="top-nav">
    <div class="nav-container">
      <a href="/student/dashboard" class="brand">
        <div class="brand-icon">
          <i data-lucide="graduation-cap" style="width:22px;height:22px;"></i>
        </div>
        <div>
          <span class="brand-title">Aknex COE • 12th Maths Board Portal</span>
          <span class="brand-sub">TAMIL NADU STATE BOARD (2020–2026 OFFICIAL QUESTION PAPERS)</span>
        </div>
      </a>

      <div class="nav-actions">
        <button id="themeToggleBtn" class="btn btn-subtle" title="Toggle Light/Dark Theme">
          <i data-lucide="sun-moon" style="width:16px;height:16px;"></i>
          <span id="themeLabel">Theme</span>
        </button>

        <button id="langToggleBtn" class="btn btn-subtle" title="Toggle English / தமிழ்">
          <i data-lucide="languages" style="width:16px;height:16px;"></i>
          <span id="langLabel">தமிழ் / ENG</span>
        </button>

        <button onclick="window.print()" class="btn btn-subtle" title="Print this exam paper">
          <i data-lucide="printer" style="width:16px;height:16px;"></i>
          <span>Print</span>
        </button>

        <a href="/student/dashboard" class="btn btn-primary">
          <i data-lucide="layout-dashboard" style="width:16px;height:16px;"></i>
          <span>Dashboard</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main Body -->
  <main class="main-container">

    <!-- Hero Card -->
    <section class="hero-card">
      <div class="badge">
        <i data-lucide="shield-check" style="width:14px;height:14px;"></i>
        Official SCERT State Board Question Archive
      </div>
      <h1 class="hero-title" id="heroHeading">HSE 12th Standard Mathematics Public Examinations (2020–2026)</h1>
      <p class="hero-desc" id="heroSubheading">
        Authentic Directorate of Government Examinations (DGE) Tamil Nadu board examination question papers with verbatim bilingual translation, step-by-step worked solutions, formula vaults, and timed CBT drills.
      </p>
    </section>

    <!-- Controls Strip: Year Selector & Search -->
    <div class="controls-strip">
      <div class="year-pills" id="yearPillsContainer">
        <!-- Injected via JS -->
      </div>

      <div class="search-input-wrap">
        <i data-lucide="search"></i>
        <input type="text" id="searchInput" placeholder="Search questions, formulas, topics...">
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">

      <!-- Left Column: Examination Paper Content -->
      <div class="paper-content-col">

        <!-- Active Paper Details Header -->
        <div class="paper-header-card" id="paperHeaderCard">
          <div>
            <h2 class="paper-title" id="activePaperTitle">Loading Examination Paper...</h2>
            <div class="paper-meta-pills" id="activePaperMeta" style="margin-top:6px;">
              <!-- Meta tags -->
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button id="revealAllSolutionsBtn" class="btn btn-subtle">
              <i data-lucide="eye" style="width:15px;height:15px;"></i>
              <span id="revealAllLabel">Show All Solutions</span>
            </button>
          </div>
        </div>

        <!-- Part I: MCQs -->
        <section class="part-section">
          <div class="part-banner">
            <h3 class="part-heading">
              <i data-lucide="list-checks" style="color:var(--primary-light);"></i>
              <span id="part1Heading">PART - I (Multiple Choice Questions)</span>
            </h3>
            <span class="part-rubric">20 × 1 = 20 Marks • All Questions Compulsory</span>
          </div>

          <div id="part1Container">
            <!-- Questions rendered via JS -->
          </div>
        </section>

        <!-- Part II: 2-Mark Questions -->
        <section class="part-section">
          <div class="part-banner">
            <h3 class="part-heading">
              <i data-lucide="edit-3" style="color:var(--accent-emerald);"></i>
              <span id="part2Heading">PART - II (Short Answer Questions)</span>
            </h3>
            <span class="part-rubric">7 × 2 = 14 Marks • Q30 is Compulsory</span>
          </div>

          <div id="part2Container">
            <!-- Questions rendered via JS -->
          </div>
        </section>

        <!-- Part III: 3-Mark Questions -->
        <section class="part-section">
          <div class="part-banner">
            <h3 class="part-heading">
              <i data-lucide="file-text" style="color:var(--accent-amber);"></i>
              <span id="part3Heading">PART - III (Brief Answer Questions)</span>
            </h3>
            <span class="part-rubric">7 × 3 = 21 Marks • Q40 is Compulsory</span>
          </div>

          <div id="part3Container">
            <!-- Questions rendered via JS -->
          </div>
        </section>

        <!-- Part IV: 5-Mark Questions -->
        <section class="part-section">
          <div class="part-banner">
            <h3 class="part-heading">
              <i data-lucide="award" style="color:var(--accent-rose);"></i>
              <span id="part4Heading">PART - IV (Detailed / Essay Type Questions)</span>
            </h3>
            <span class="part-rubric">7 × 5 = 35 Marks • Internal Choice (Either / Or)</span>
          </div>

          <div id="part4Container">
            <!-- Questions rendered via JS -->
          </div>
        </section>

      </div>

      <!-- Right Column: CBT Speed Drill & Formula Vault -->
      <aside class="sidebar-col">

        <!-- Interactive CBT Speed Drill Panel -->
        <div class="sidebar-panel">
          <div class="sidebar-title">
            <i data-lucide="timer" style="color:var(--primary-light);width:18px;height:18px;"></i>
            <span>CBT Practice Drill</span>
          </div>

          <div class="cbt-timer" id="timerDisplay">45:00</div>

          <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px;">
            Speed practice drill for Part I (20 MCQs). Answers are evaluated in real time:
          </p>

          <div class="palette-grid" id="cbtPaletteGrid">
            <!-- Buttons 1-20 rendered via JS -->
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted); margin-bottom:16px;">
            <span><strong id="answeredCount" style="color:var(--accent-emerald);">0</strong> Answered</span>
            <span><strong id="scoreCount" style="color:var(--primary-light);">0</strong> / 20 Marks</span>
          </div>

          <button id="resetDrillBtn" class="btn btn-subtle" style="width:100%; justify-content:center;">
            <i data-lucide="rotate-ccw" style="width:14px;height:14px;"></i>
            Reset Practice Drill
          </button>
        </div>

        <!-- Formula Vault -->
        <div class="sidebar-panel">
          <div class="sidebar-title">
            <i data-lucide="book-open-check" style="color:var(--accent-amber);width:18px;height:18px;"></i>
            <span>Essential Formula Vault</span>
          </div>

          <div id="formulaVaultContainer">
            <!-- Injected via JS -->
          </div>
        </div>

        <!-- Chapter Blueprint -->
        <div class="sidebar-panel">
          <div class="sidebar-title">
            <i data-lucide="pie-chart" style="color:var(--accent-sky);width:18px;height:18px;"></i>
            <span>Chapter Weightage Blueprint</span>
          </div>

          <div id="blueprintContainer" style="font-size:0.82rem;display:flex;flex-direction:column;gap:8px;">
            <!-- Chapter weights -->
          </div>
        </div>

      </aside>

    </div>

  </main>

  <!-- Embedded Authentic Papers Dataset -->
  <script>
    const EXAM_PAPERS = ${JSON.stringify(papers, null, 2)};

    const FORMULA_VAULT = [
      {
        titleEn: "1. Matrices & Determinants",
        titleTa: "1. அணிகள் & அணிக்கோவைகள்",
        items: [
          "$A^{-1} = \\\\frac{1}{|A|}\\\\text{adj } A$",
          "$\\\\text{adj}(AB) = (\\\\text{adj } B)(\\\\text{adj } A)$",
          "$|\\\\text{adj } A| = |A|^{n-1}, |\\\\text{adj}(\\\\text{adj } A)| = |A|^{(n-1)^2}$",
          "Cramer's Rule: $x = \\\\frac{\\\\Delta_1}{\\\\Delta}, y = \\\\frac{\\\\Delta_2}{\\\\Delta}, z = \\\\frac{\\\\Delta_3}{\\\\Delta}$"
        ]
      },
      {
        titleEn: "2. Complex Numbers",
        titleTa: "2. கலப்பு எண்கள்",
        items: [
          "Euler form: $z = r e^{i\\\\theta} = r(\\\\cos\\\\theta + i\\\\sin\\\\theta)$",
          "De Moivre: $(\\\\cos\\\\theta + i\\\\sin\\\\theta)^n = \\\\cos(n\\\\theta) + i\\\\sin(n\\\\theta)$",
          "Triangle Inequality: $||z_1| - |z_2|| \\\\le |z_1 + z_2| \\\\le |z_1| + |z_2|$",
          "Roots of unity: $1 + \\\\omega + \\\\omega^2 = 0, \\\\omega^3 = 1$"
        ]
      },
      {
        titleEn: "3. Analytical Geometry (Conics)",
        titleTa: "3. பகுமுறை வடிவியல் (கூம்பு வளைவுகள்)",
        items: [
          "Parabola $y^2 = 4ax$: Focus $(a, 0)$, Directrix $x = -a$, Latus Rectum $= 4a$",
          "Ellipse $\\\\frac{x^2}{a^2} + \\\\frac{y^2}{b^2} = 1$: $e = \\\\sqrt{1 - b^2/a^2}, b^2 = a^2(1-e^2)$",
          "Hyperbola $\\\\frac{x^2}{a^2} - \\\\frac{y^2}{b^2} = 1$: $e = \\\\sqrt{1 + b^2/a^2}$",
          "Rectangular Hyperbola $xy = c^2$: $e = \\\\sqrt{2}$"
        ]
      },
      {
        titleEn: "4. Vector Algebra",
        titleTa: "4. வெக்டர் இயற்கணிதம்",
        items: [
          "Scalar Triple Product: $[\\\\vec{a}, \\\\vec{b}, \\\\vec{c}] = \\\\vec{a} \\\\cdot (\\\\vec{b} \\\\times \\\\vec{c})$",
          "Vector Triple Product: $\\\\vec{a} \\\\times (\\\\vec{b} \\\\times \\\\vec{c}) = (\\\\vec{a} \\\\cdot \\\\vec{c})\\\\vec{b} - (\\\\vec{a} \\\\cdot \\\\vec{b})\\\\vec{c}$",
          "Distance from point to plane: $d = \\\\frac{|ax_1 + by_1 + cz_1 - p|}{\\\\sqrt{a^2 + b^2 + c^2}}$"
        ]
      },
      {
        titleEn: "5. Differential & Integral Calculus",
        titleTa: "5. நுண்கணிதம்",
        items: [
          "Euler's Theorem: $x\\\\frac{\\\\partial u}{\\\\partial x} + y\\\\frac{\\\\partial u}{\\\\partial y} = nu$",
          "Definite Integral: $\\\\int_0^a f(x)dx = \\\\int_0^a f(a-x)dx$",
          "Linear D.E.: $\\\\frac{dy}{dx} + Py = Q \\\\implies y e^{\\\\int Pdx} = \\\\int Q e^{\\\\int Pdx} dx + C$"
        ]
      },
      {
        titleEn: "6. Probability & Discrete Mathematics",
        titleTa: "6. நிகழ்தகவு & தனிநிலைக் கணிதம்",
        items: [
          "Poisson Distribution: $P(X=k) = \\\\frac{e^{-\\\\lambda} \\\\lambda^k}{k!}, \\\\text{Mean} = \\\\text{Var} = \\\\lambda$",
          "Binomial: $E(X) = np, \\\\text{Var}(X) = npq$",
          "De Morgan's Laws: $\\\\neg(p \\\\wedge q) \\\\equiv \\\\neg p \\\\vee \\\\neg q$"
        ]
      }
    ];

    const BLUEPRINT = [
      { ch: "1. Matrices and Determinants", marks: 15, pct: "16%" },
      { ch: "2. Complex Numbers", marks: 14, pct: "15%" },
      { ch: "3. Theory of Equations", marks: 7, pct: "8%" },
      { ch: "4. Inverse Trigonometric Functions", marks: 7, pct: "8%" },
      { ch: "5. Two Dimensional Analytical Geometry-II", marks: 16, pct: "18%" },
      { ch: "6. Applications of Vector Algebra", marks: 16, pct: "18%" },
      { ch: "7. Differential Calculus - Applications", marks: 15, pct: "16%" },
      { ch: "8. Differentials and Partial Derivatives", marks: 8, pct: "9%" },
      { ch: "9. Applications of Integration", marks: 14, pct: "15%" },
      { ch: "10. Ordinary Differential Equations", marks: 12, pct: "13%" },
      { ch: "11. Probability Distributions", marks: 11, pct: "12%" },
      { ch: "12. Discrete Mathematics", marks: 9, pct: "10%" }
    ];

    // State Variables
    let currentYearKey = '2026-annual';
    let currentLang = 'en'; // 'en' or 'ta'
    let userAnswers = {}; // { qId: selectedOptionIndex }
    let showAllSolutions = false;
    let timerSeconds = 45 * 60;
    let timerInterval = null;

    // Initialize Application
    document.addEventListener('DOMContentLoaded', () => {
      initYearPills();
      renderActivePaper();
      renderFormulaVault();
      renderBlueprint();
      initCbtPalette();
      startTimer();
      lucide.createIcons();
      renderMath();

      // Theme toggle
      document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

      // Language toggle
      document.getElementById('langToggleBtn').addEventListener('click', toggleLanguage);

      // Reveal All Solutions
      document.getElementById('revealAllSolutionsBtn').addEventListener('click', () => {
        showAllSolutions = !showAllSolutions;
        document.getElementById('revealAllLabel').textContent = showAllSolutions ? 'Hide Solutions' : 'Show All Solutions';
        document.querySelectorAll('.sol-box').forEach(el => {
          if (showAllSolutions) el.classList.add('revealed');
          else el.classList.remove('revealed');
        });
      });

      // Search filter
      document.getElementById('searchInput').addEventListener('input', handleSearch);

      // Reset CBT drill
      document.getElementById('resetDrillBtn').addEventListener('click', resetDrill);
    });

    function initYearPills() {
      const container = document.getElementById('yearPillsContainer');
      container.innerHTML = '';

      const yearKeys = Object.keys(EXAM_PAPERS).sort().reverse();

      yearKeys.forEach(key => {
        const btn = document.createElement('button');
        btn.className = 'pill-btn' + (key === currentYearKey ? ' active' : '');
        const year = key.split('-')[0];
        const isAnnual = key.includes('annual');
        btn.textContent = year + (isAnnual ? ' Annual' : ' Supp');
        btn.dataset.key = key;

        btn.addEventListener('click', () => {
          document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentYearKey = key;
          userAnswers = {};
          renderActivePaper();
          initCbtPalette();
          renderMath();
          lucide.createIcons();
        });

        container.appendChild(btn);
      });
    }

    function renderActivePaper() {
      const paper = EXAM_PAPERS[currentYearKey];
      if (!paper) return;

      // Update paper header
      const title = currentLang === 'ta' ? paper.labelTa : paper.labelEn;
      document.getElementById('activePaperTitle').textContent = title;

      const metaContainer = document.getElementById('activePaperMeta');
      metaContainer.innerHTML = \`
        <span class="meta-tag">\${paper.code}</span>
        <span class="meta-tag">Time: 3.00 Hours</span>
        <span class="meta-tag">Max Marks: 90</span>
        <span class="meta-tag">Class 12 Higher Secondary</span>
      \`;

      // Render Part 1 (MCQs)
      const p1Container = document.getElementById('part1Container');
      p1Container.innerHTML = '';

      (paper.part1 || []).forEach((q, idx) => {
        const qCard = document.createElement('div');
        qCard.className = 'q-card';
        qCard.id = 'qcard-' + q.id;

        const qText = currentLang === 'ta' ? q.qTa : q.qEn;
        const qAltText = currentLang === 'ta' ? q.qEn : q.qTa;
        const chapter = currentLang === 'ta' ? q.chapterTa : q.chapterEn;
        const solText = currentLang === 'ta' ? q.explanationTa : q.explanationEn;

        const options = currentLang === 'ta' ? (q.optionsTa || q.optionsEn) : q.optionsEn;

        let optionsHtml = '';
        const optKeys = ['a', 'b', 'c', 'd'];
        options.forEach((opt, optIdx) => {
          const keyChar = optKeys[optIdx];
          const isSelected = userAnswers[q.id] === optIdx;
          const isCorrect = keyChar === q.answer;
          let optClass = 'option-btn';

          if (userAnswers[q.id] !== undefined) {
            if (isSelected) {
              optClass += isCorrect ? ' correct' : ' incorrect';
            } else if (isCorrect) {
              optClass += ' correct';
            }
          }

          optionsHtml += \`
            <button class="\${optClass}" onclick="handleOptionSelect(\${q.id}, \${optIdx}, '\${q.answer}')">
              <span class="opt-key">(\${keyChar})</span>
              <span>\${opt}</span>
            </button>
          \`;
        });

        qCard.innerHTML = \`
          <div class="q-header">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="q-num-badge">\${q.id}</span>
              <span class="q-chapter-tag">\${chapter}</span>
            </div>
            <button class="btn btn-subtle" style="padding:4px 8px;font-size:0.75rem;" onclick="toggleSolution(\${q.id})">
              <i data-lucide="help-circle" style="width:13px;height:13px;"></i>
              Solution
            </button>
          </div>

          <div class="q-text-en">\${qText}</div>
          <div class="q-text-ta" style="color:var(--text-muted);font-size:0.88rem;">\${qAltText}</div>

          <div class="options-grid">
            \${optionsHtml}
          </div>

          <div class="sol-box \${showAllSolutions || userAnswers[q.id] !== undefined ? 'revealed' : ''}" id="sol-\${q.id}">
            <div class="sol-header">
              <i data-lucide="check-circle" style="width:14px;height:14px;"></i>
              Correct Answer: (\${q.answer.toUpperCase()}) • Step-by-Step Explanation
            </div>
            <div class="sol-content-en">\${solText}</div>
          </div>
        \`;

        p1Container.appendChild(qCard);
      });

      // Render Part 2 (2 Marks)
      renderDescriptiveSection('part2Container', paper.part2 || [], 2);

      // Render Part 3 (3 Marks)
      renderDescriptiveSection('part3Container', paper.part3 || [], 3);

      // Render Part 4 (5 Marks)
      renderDescriptiveSection('part4Container', paper.part4 || [], 5);
    }

    function renderDescriptiveSection(containerId, questions, marks) {
      const container = document.getElementById(containerId);
      container.innerHTML = '';

      questions.forEach(q => {
        const card = document.createElement('div');
        card.className = 'q-card';

        const qText = currentLang === 'ta' ? q.qTa : q.qEn;
        const qAltText = currentLang === 'ta' ? q.qEn : q.qTa;
        const chapter = currentLang === 'ta' ? q.chapterTa : q.chapterEn;
        const solText = currentLang === 'ta' ? q.solTa : q.solEn;

        card.innerHTML = \`
          <div class="q-header">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="q-num-badge" style="background:var(--bg-surface);border:1px solid var(--border-strong);color:var(--primary-light);">\${q.qn}</span>
              <span class="q-chapter-tag">\${chapter}</span>
              <span style="font-size:0.75rem;font-family:var(--font-mono);color:var(--text-muted);">\${marks} Marks</span>
            </div>
            <button class="btn btn-subtle" style="padding:4px 8px;font-size:0.75rem;" onclick="toggleDescriptiveSol('desc-sol-\${marks}-\${q.qn}')">
              <i data-lucide="help-circle" style="width:13px;height:13px;"></i>
              Solution
            </button>
          </div>

          <div class="q-text-en">\${qText}</div>
          <div class="q-text-ta" style="color:var(--text-muted);font-size:0.88rem;">\${qAltText}</div>

          <div class="sol-box \${showAllSolutions ? 'revealed' : ''}" id="desc-sol-\${marks}-\${q.qn}">
            <div class="sol-header">
              <i data-lucide="check-circle" style="width:14px;height:14px;"></i>
              Official Working & Method
            </div>
            <div class="sol-content-en">\${solText}</div>
          </div>
        \`;

        container.appendChild(card);
      });
    }

    function toggleSolution(qId) {
      const sol = document.getElementById('sol-' + qId);
      if (sol) sol.classList.toggle('revealed');
    }

    function toggleDescriptiveSol(elemId) {
      const sol = document.getElementById(elemId);
      if (sol) sol.classList.toggle('revealed');
    }

    function handleOptionSelect(qId, optIdx, answerChar) {
      userAnswers[qId] = optIdx;
      const optKeys = ['a', 'b', 'c', 'd'];
      const isCorrect = optKeys[optIdx] === answerChar;

      // Update palette button
      const palBtn = document.getElementById('pal-btn-' + qId);
      if (palBtn) {
        palBtn.className = 'pal-btn ' + (isCorrect ? 'answered' : 'wrong');
      }

      // Re-render paper
      renderActivePaper();
      renderMath();
      lucide.createIcons();
      updateCbtStats();
    }

    function initCbtPalette() {
      const grid = document.getElementById('cbtPaletteGrid');
      grid.innerHTML = '';

      for (let i = 1; i <= 20; i++) {
        const btn = document.createElement('button');
        btn.id = 'pal-btn-' + i;
        btn.className = 'pal-btn';
        btn.textContent = i;
        btn.title = 'Jump to Question ' + i;

        btn.addEventListener('click', () => {
          const card = document.getElementById('qcard-' + i);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.borderColor = 'var(--primary-light)';
            setTimeout(() => card.style.borderColor = '', 1500);
          }
        });

        grid.appendChild(btn);
      }
      updateCbtStats();
    }

    function updateCbtStats() {
      const paper = EXAM_PAPERS[currentYearKey];
      if (!paper) return;

      const optKeys = ['a', 'b', 'c', 'd'];
      let correct = 0;
      let totalAnswered = 0;

      for (const [qId, optIdx] of Object.entries(userAnswers)) {
        totalAnswered++;
        const q = paper.part1.find(item => item.id == qId);
        if (q && optKeys[optIdx] === q.answer) {
          correct++;
        }
      }

      document.getElementById('answeredCount').textContent = totalAnswered;
      document.getElementById('scoreCount').textContent = correct;
    }

    function resetDrill() {
      userAnswers = {};
      renderActivePaper();
      initCbtPalette();
      renderMath();
      lucide.createIcons();
      timerSeconds = 45 * 60;
    }

    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
          timerSeconds--;
          const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
          const s = (timerSeconds % 60).toString().padStart(2, '0');
          document.getElementById('timerDisplay').textContent = \`\${m}:\${s}\`;
        }
      }, 1000);
    }

    function renderFormulaVault() {
      const container = document.getElementById('formulaVaultContainer');
      container.innerHTML = '';

      FORMULA_VAULT.forEach((cat, idx) => {
        const item = document.createElement('div');
        item.className = 'formula-item';

        const head = document.createElement('div');
        head.className = 'formula-head';
        head.innerHTML = \`
          <span>\${currentLang === 'ta' ? cat.titleTa : cat.titleEn}</span>
          <i data-lucide="chevron-down" style="width:14px;height:14px;"></i>
        \`;

        const body = document.createElement('div');
        body.className = 'formula-body';
        body.innerHTML = cat.items.map(f => \`<div style="margin-bottom:6px;">\${f}</div>\`).join('');

        head.addEventListener('click', () => {
          body.classList.toggle('open');
          renderMath();
        });

        item.appendChild(head);
        item.appendChild(body);
        container.appendChild(item);
      });
    }

    function renderBlueprint() {
      const container = document.getElementById('blueprintContainer');
      container.innerHTML = BLUEPRINT.map(b => \`
        <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid var(--border-subtle);">
          <span style="color:var(--text-secondary);">\${b.ch}</span>
          <span style="font-family:var(--font-mono); font-weight:700; color:var(--primary-light);">\${b.marks}m (\${b.pct})</span>
        </div>
      \`).join('');
    }

    function toggleTheme() {
      const body = document.body;
      const current = body.getAttribute('data-theme');
      if (current === 'paper') {
        body.removeAttribute('data-theme');
        document.getElementById('themeLabel').textContent = 'Dark';
      } else {
        body.setAttribute('data-theme', 'paper');
        document.getElementById('themeLabel').textContent = 'Paper';
      }
    }

    function toggleLanguage() {
      currentLang = currentLang === 'en' ? 'ta' : 'en';
      document.getElementById('langLabel').textContent = currentLang === 'en' ? 'தமிழ்' : 'English';
      renderActivePaper();
      renderFormulaVault();
      renderMath();
      lucide.createIcons();
    }

    function handleSearch(e) {
      const query = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.q-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    }

    function renderMath() {
      if (window.renderMathInElement) {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    }
  </script>
</body>
</html>`;

// Write to all 4 required locations
const targets = [
  'D:\\DYNAMIC EXAM SITE\\QB\\12\\MATH\\index.html',
  'D:\\DYNAMIC EXAM SITE\\public\\students\\qb\\12\\math\\index.html',
  'D:\\DYNAMIC EXAM SITE\\public\\student\\qb\\12\\math\\index.html',
  'D:\\DYNAMIC EXAM SITE\\12\\MATH\\12th_Standard_Mathematics_Public_Exam_Papers_(2020-2026).html'
];

for (const target of targets) {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(target, html, 'utf8');
  console.log(`Saved authentic question bank portal to: ${target}`);
}

console.log('All 4 Question Bank targets updated with 100% authentic, real Tamil Nadu HSE examination papers!');

