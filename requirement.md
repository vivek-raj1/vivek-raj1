You are a senior frontend architect, elite motion UI designer, and performance engineer.

Build a **production-ready, highly animated, ultra-modern, visually stunning (“eye-candy”) static portfolio web application** for a Lead DevOps Engineer.

This must feel like a **top-tier Awwwards-level experience combined with enterprise-grade UI discipline**.

This must be a **fully static website**:

* No backend
* No APIs
* No database
* No server-side rendering

All content must come from JSON files. So in future from json update ui data should be updated aand colors can be also handle from json, add theme light dark and system, default can be system

---

# CORE ARCHITECTURE (STRICT RULES)

* Use **multiple JSON files (modular data system)**:
  /data/meta.json
  /data/hero.json
  /data/about.json
  /data/skills.json
  /data/experience.json
  /data/projects.json
  /data/certifications.json
  /data/theme.json
  /data/animations.json
  /data/ui.json (NEW: controls UI intensity & motion presets)
  add multi more
* NO hardcoded content in components

* ALL UI must dynamically load from JSON

* Adding/removing content must require ONLY JSON edits

---

# TECH STACK

* Next.js (latest, static export compatible)
* React (functional components only)
* Tailwind CSS
* Framer Motion (mandatory)
* GSAP (for premium scroll animations)

---

# BUILD REQUIREMENT

* Must support:
  next build
  next export

* Output must be deployable as static site (HTML/CSS/JS only)

---

# USER PROFILE
Currently
Name: Vivek Raj
Role: Lead DevOps Engineer
Company: Sprinklr

Expertise:

* Kubernetes (1000+ clusters)
* Observability (Prometheus, Thanos, VictoriaMetrics, Grafana)
* GitOps (ArgoCD)
* Multi-cloud (AWS, Azure, GCP)
* Platform engineering for 5000+ users
* Alert automation & remediation
* AI-powered DevOps assistant (LLMs, Langfuse)
* CI/CD + Terraform + system design

Generate **realistic, senior-level content**.

---

# UI / UX DESIGN (HIGH PRIORITY)

Create an **ULTRA MODERN, ENTERPRISE-GRADE, VISUALLY STRIKING UI**.

This must be:

* Eye-catching but not messy
* Premium and futuristic
* Smooth and immersive
* Inspired by:

  * observability dashboards
  * cloud control planes
  * modern SaaS landing pages

---

# VISUAL EFFECTS (MANDATORY)

Include:

* Animated gradient background OR grid system
* Subtle particle or glow effects
* Glassmorphism / soft blur panels
* Neon accent highlights (controlled, not excessive)
* Depth using shadows and layers
* Smooth page transitions
* Scroll-based storytelling

---

# MICRO-INTERACTIONS

* Magnetic buttons
* Hover lift + glow cards
* Animated borders
* Cursor interaction (optional subtle glow)
* Smooth section transitions

---

# HERO SECTION (VERY IMPORTANT)

Must be visually stunning:

* Animated headline reveal

* Background animation (grid / particles / motion gradient)

* Floating DevOps-style elements:

  * metrics cards
  * logs-style lines
  * system indicators

* Optional:
  fake real-time metrics animation (CPU, latency, clusters)

---

# SECTIONS

1. Navbar (from meta.json)
2. Hero (premium animated)
3. About
4. Skills (interactive grid)
5. Experience (animated timeline)
6. Projects (high-end animated cards)
7. Certifications
8. Footer

---

# ANIMATIONS (CRITICAL QUALITY)

* Use Framer Motion for:

  * fade + blur reveal
  * slide transitions
  * stagger animations
  * layout animations

* Use GSAP for:

  * scroll-trigger animations
  * parallax effects

* Animation behavior must be controlled via animations.json

* UI intensity must be configurable via ui.json:

  * "mode": "minimal" | "balanced" | "ultra"

---

# THEME SYSTEM

Theme must come from theme.json:

* colors
* dark/light/system mode
* accent color
* glow intensity

---

# CODE QUALITY

* Modular reusable components

* Clean folder structure:

  /components
  /data
  /app (or /pages)
  /styles

* Avoid unnecessary re-renders

* Use dynamic imports where useful

* Optimize animations for performance

---

# OUTPUT FORMAT (STRICT)

Return ONLY:

1. All JSON files (complete data)
2. Full project folder structure
3. All component code
4. Tailwind/global styles
5. Instructions to run locally
6. Instructions to deploy (Vercel + GitHub Pages static)

NO explanations
NO comments outside code
NO partial output

---

# EXTRA REQUIREMENTS

* Add strong DevOps identity:

  * metrics UI elements
  * system-like layout
  * terminal-inspired components

* Maintain balance:

  * visually impressive
  * still clean and readable

---

# EXECUTION STRATEGY

* First generate JSON files
* Then project structure
* Then components
* Then styles
* Then run + deploy steps

Ensure everything is complete and consistent.

---

# GOAL

Deliver a **visually stunning, ultra-modern, animated DevOps portfolio** that:

* Looks like a premium product UI
* Feels interactive and alive
* Demonstrates senior engineering credibility
* Is fully static and JSON-driven
* add view counter
This must feel like a **top 1% portfolio experience**.
