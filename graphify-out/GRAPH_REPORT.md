# Graph Report - .  (2026-04-26)

## Corpus Check
- 39 files · ~60,315 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 97 nodes · 71 edges · 37 communities detected
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Site Architecture & Deploy|Site Architecture & Deploy]]
- [[_COMMUNITY_Profile & Brand Spec|Profile & Brand Spec]]
- [[_COMMUNITY_Animated Background Canvas|Animated Background Canvas]]
- [[_COMMUNITY_Sparkline Chart|Sparkline Chart]]
- [[_COMMUNITY_PayU SRE Experience|PayU SRE Experience]]
- [[_COMMUNITY_Next.js 16 Upgrade|Next.js 16 Upgrade]]
- [[_COMMUNITY_Paytm DevOps & Cloud Migration|Paytm DevOps & Cloud Migration]]
- [[_COMMUNITY_Magnetic Button|Magnetic Button]]
- [[_COMMUNITY_Reveal Animations|Reveal Animations]]
- [[_COMMUNITY_Theme Toggle|Theme Toggle]]
- [[_COMMUNITY_Theme Provider|Theme Provider]]
- [[_COMMUNITY_Root Layout|Root Layout]]
- [[_COMMUNITY_Page Entry|Page Entry]]
- [[_COMMUNITY_Hero Section|Hero Section]]
- [[_COMMUNITY_Experience Section|Experience Section]]
- [[_COMMUNITY_Footer|Footer]]
- [[_COMMUNITY_About Section|About Section]]
- [[_COMMUNITY_Certifications|Certifications]]
- [[_COMMUNITY_DevOps Floating Icons|DevOps Floating Icons]]
- [[_COMMUNITY_Scroll Progress|Scroll Progress]]
- [[_COMMUNITY_View Counter|View Counter]]
- [[_COMMUNITY_Cursor Glow|Cursor Glow]]
- [[_COMMUNITY_GSAP Smooth Scroll|GSAP Smooth Scroll]]
- [[_COMMUNITY_Media Query Hook|Media Query Hook]]
- [[_COMMUNITY_Icon Library|Icon Library]]
- [[_COMMUNITY_Next Config|Next Config]]
- [[_COMMUNITY_Next Env Types|Next Env Types]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Projects Section|Projects Section]]
- [[_COMMUNITY_Navbar|Navbar]]
- [[_COMMUNITY_Skills Section|Skills Section]]
- [[_COMMUNITY_Section Header|Section Header]]
- [[_COMMUNITY_Content Data|Content Data]]
- [[_COMMUNITY_Shared Types|Shared Types]]
- [[_COMMUNITY_IaC Skills|IaC Skills]]

## God Nodes (most connected - your core abstractions)
1. `Vivek Raj Portfolio (Next.js static site)` - 11 edges
2. `Vivek Raj (Lead DevOps Engineer)` - 7 edges
3. `One97 Communications (Paytm) — Lead DevOps Engineer` - 4 edges
4. `PayU Payments — Site Reliability Engineer` - 4 edges
5. `Portfolio build requirement spec` - 4 edges
6. `Sparkline()` - 3 edges
7. `sparkPath()` - 3 edges
8. `sparkArea()` - 3 edges
9. `Session context Apr 25 2026 (Next 16 upgrade)` - 3 edges
10. `Next.js 16.2.4 upgrade with --webpack flag` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Favicon — gradient VR monogram (violet→cyan)` --semantically_similar_to--> `Theme system (light/dark/system + accents)`  [INFERRED] [semantically similar]
  public/favicon.svg → README.md
- `Vivek Raj Resume PDF` --is_artifact_of--> `Vivek Raj (Lead DevOps Engineer)`  [INFERRED]
  public/Vivek-Raj's-Resume.pdf → resume.txt
- `Portrait photo of Vivek Raj (white kurta, plain backdrop)` --depicts--> `Vivek Raj (Lead DevOps Engineer)`  [INFERRED]
  public/image.jpg → resume.txt
- `Favicon — gradient VR monogram (violet→cyan)` --branding_for--> `Vivek Raj Portfolio (Next.js static site)`  [INFERRED]
  public/favicon.svg → README.md
- `Profile: Lead DevOps @ Sprinklr (current)` --describes_same_person--> `Vivek Raj (Lead DevOps Engineer)`  [INFERRED]
  requirement.md → resume.txt

## Hyperedges (group relationships)
- **Core DevOps stack used across roles** — resume_skills_aws, resume_skills_kubernetes, resume_skills_monitoring, resume_skills_iac [INFERRED 0.85]
- **Portfolio frontend animation stack** — readme_stack_nextjs, readme_stack_tailwind, readme_stack_framer, readme_stack_gsap [EXTRACTED 1.00]
- **Vivek Raj identity across artifacts** — resume_vivek_raj, public_resume_pdf, public_image_jpg, requirement_user_profile_sprinklr [INFERRED 0.85]

## Communities

### Community 0 - "Site Architecture & Deploy"
Cohesion: 0.22
Nodes (10): Favicon — gradient VR monogram (violet→cyan), GitHub Pages deploy, Vercel deploy, JSON-driven content (public/data/*.json), Vivek Raj Portfolio (Next.js static site), Framer Motion 11, GSAP 3 + ScrollTrigger, Tailwind CSS 3 with CSS variables (+2 more)

### Community 1 - "Profile & Brand Spec"
Cohesion: 0.22
Nodes (9): Portrait photo of Vivek Raj (white kurta, plain backdrop), Vivek Raj Resume PDF, Hero section spec (animated, fake metrics), Portfolio build requirement spec, UI intensity modes minimal/balanced/ultra, Profile: Lead DevOps @ Sprinklr (current), Bharti Airtel — Senior SRE, B.Tech, Greater Noida Institute Of Technology (+1 more)

### Community 2 - "Animated Background Canvas"
Cohesion: 0.47
Nodes (4): getAccent(), getColors(), loop(), step()

### Community 3 - "Sparkline Chart"
Cohesion: 0.47
Nodes (3): Sparkline(), sparkArea(), sparkPath()

### Community 4 - "PayU SRE Experience"
Cohesion: 0.4
Nodes (5): 2FA Integration with Firewall, Business Metrics Grafana/Prometheus Dashboard, DevOps Custom UI project, PayU Payments — Site Reliability Engineer, Prometheus, Grafana, ELK, Loki monitoring

### Community 5 - "Next.js 16 Upgrade"
Cohesion: 0.5
Nodes (5): ESLint 9 flat config (eslint.config.mjs), Next.js 16.2.4 upgrade with --webpack flag, Session context Apr 25 2026 (Next 16 upgrade), Turbopack + output:'export' PageNotFoundError, Next.js 14 static export

### Community 6 - "Paytm DevOps & Cloud Migration"
Cohesion: 0.67
Nodes (4): One97 Communications (Paytm) — Lead DevOps Engineer, PG2 Migration (Ali Cloud to AWS), AWS skills (EKS, ECS, Lambda, etc.), Kubernetes & Containers

### Community 7 - "Magnetic Button"
Cohesion: 0.67
Nodes (0): 

### Community 8 - "Reveal Animations"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "Theme Toggle"
Cohesion: 0.67
Nodes (0): 

### Community 10 - "Theme Provider"
Cohesion: 0.67
Nodes (0): 

### Community 11 - "Root Layout"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Page Entry"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Hero Section"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Experience Section"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Footer"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "About Section"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Certifications"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "DevOps Floating Icons"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Scroll Progress"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "View Counter"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Cursor Glow"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "GSAP Smooth Scroll"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Media Query Hook"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Icon Library"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Next Config"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Next Env Types"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Tailwind Config"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Projects Section"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Navbar"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Skills Section"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Section Header"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Content Data"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Shared Types"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "IaC Skills"
Cohesion: 1.0
Nodes (1): Terraform & Ansible (IaC)

## Knowledge Gaps
- **19 isolated node(s):** `Bharti Airtel — Senior SRE`, `DevOps Custom UI project`, `2FA Integration with Firewall`, `B.Tech, Greater Noida Institute Of Technology`, `Kubernetes & Containers` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Root Layout`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Page Entry`** (2 nodes): `page.tsx`, `Page()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hero Section`** (2 nodes): `Hero.tsx`, `tick()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Experience Section`** (2 nodes): `Experience.tsx`, `onKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Footer`** (2 nodes): `Footer.tsx`, `copyEmail()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `About Section`** (2 nodes): `About()`, `About.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Certifications`** (2 nodes): `Certifications()`, `Certifications.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `DevOps Floating Icons`** (2 nodes): `DevOpsFloatingIcons.tsx`, `DevOpsFloatingIcons()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scroll Progress`** (2 nodes): `ScrollProgress.tsx`, `ScrollProgress()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `View Counter`** (2 nodes): `ViewCounter.tsx`, `ViewCounter()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cursor Glow`** (2 nodes): `CursorGlow.tsx`, `CursorGlow()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `GSAP Smooth Scroll`** (2 nodes): `GsapSmooth.tsx`, `GsapSmooth()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Media Query Hook`** (2 nodes): `use-media-query.ts`, `useMediaQuery()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Icon Library`** (2 nodes): `Icon()`, `icons.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next Config`** (1 nodes): `next.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next Env Types`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tailwind Config`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Projects Section`** (1 nodes): `Projects.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Navbar`** (1 nodes): `Navbar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skills Section`** (1 nodes): `Skills.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Section Header`** (1 nodes): `SectionHeader.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Content Data`** (1 nodes): `data.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Shared Types`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `IaC Skills`** (1 nodes): `Terraform & Ansible (IaC)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Vivek Raj Portfolio (Next.js static site)` connect `Site Architecture & Deploy` to `Profile & Brand Spec`, `Next.js 16 Upgrade`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `Vivek Raj (Lead DevOps Engineer)` connect `Profile & Brand Spec` to `PayU SRE Experience`, `Paytm DevOps & Cloud Migration`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `Portfolio build requirement spec` connect `Profile & Brand Spec` to `Site Architecture & Deploy`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Vivek Raj Portfolio (Next.js static site)` (e.g. with `Portfolio build requirement spec` and `Favicon — gradient VR monogram (violet→cyan)`) actually correct?**
  _`Vivek Raj Portfolio (Next.js static site)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Vivek Raj (Lead DevOps Engineer)` (e.g. with `Profile: Lead DevOps @ Sprinklr (current)` and `Vivek Raj Resume PDF`) actually correct?**
  _`Vivek Raj (Lead DevOps Engineer)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `PayU Payments — Site Reliability Engineer` (e.g. with `2FA Integration with Firewall` and `Business Metrics Grafana/Prometheus Dashboard`) actually correct?**
  _`PayU Payments — Site Reliability Engineer` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Bharti Airtel — Senior SRE`, `DevOps Custom UI project`, `2FA Integration with Firewall` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._