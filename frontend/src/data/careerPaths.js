/**
 * frontend/src/data/careerPaths.js
 * Single source of truth for all 42 career paths across 9 categories.
 * Synchronized 1:1 with backend/app/core/roles_catalog.py
 */

export const CAREER_PATHS = [
  {
    "slug": "python-developer",
    "title": "Python Developer",
    "category": "Software Development",
    "icon": "🐍",
    "demand": "🔥 Very High",
    "tagline": "Build scalable backend APIs, web applications, and asynchronous microservices.",
    "overview": "Python Developers architect and develop robust server-side logic, design relational databases, integrate third-party services, and build high-performance APIs using FastAPI, Django, and modern tooling.",
    "skills": [
      "Python",
      "SQL",
      "Git",
      "FastAPI",
      "Data Structures"
    ],
    "skillsDetailed": [
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Core language features, OOP, data structures, and asynchronous programming"
      },
      {
        "name": "SQL",
        "level": "Intermediate",
        "desc": "Database design, queries, and ORM integration (SQLAlchemy/Django ORM)"
      },
      {
        "name": "Git",
        "level": "Expert",
        "desc": "Branching workflows, pull requests, rebase, and version control hygiene"
      },
      {
        "name": "FastAPI",
        "level": "Intermediate",
        "desc": "RESTful API development, Pydantic validation, and dependency injection"
      },
      {
        "name": "Data Structures",
        "level": "Intermediate",
        "desc": "Arrays, linked lists, trees, hash maps, and algorithmic complexity"
      },
      {
        "name": "REST APIs",
        "level": "Expert",
        "desc": "HTTP methods, status codes, JSON payload design, and authentication tokens"
      },
      {
        "name": "Docker",
        "level": "Intermediate",
        "desc": "Containerizing backend services and docker-compose configurations"
      },
      {
        "name": "Linux",
        "level": "Intermediate",
        "desc": "Shell commands, file system navigation, and process management"
      }
    ],
    "roles": [
      "Junior Python Developer",
      "Python Developer",
      "Senior Python Developer",
      "Lead Python Developer",
      "Principal Python Developer / Engineering Manager"
    ],
    "salaryRange": "₹5L – ₹18L per annum (India)",
    "avgSalary": "₹8.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Python foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "SQL and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Git & FastAPI implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Production-ready RESTful CRUD API with FastAPI, SQLAlchemy ORM, and JWT authentication"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "VS Code",
      "PyCharm",
      "Git",
      "Docker",
      "Postman",
      "PostgreSQL",
      "Redis"
    ],
    "certifications": [
      "Industry Standard Python Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Production-ready RESTful CRUD API with FastAPI, SQLAlchemy ORM, and JWT authentication",
      "Asynchronous task queue worker with Redis, Celery, and automated pytest coverage"
    ],
    "interview_topics": [
      "Python memory management & GIL",
      "Async/await event loops",
      "REST API architecture",
      "SQL indexing & query optimization",
      "pytest & mock testing"
    ]
  },
  {
    "slug": "java-developer",
    "title": "Java Developer",
    "category": "Software Development",
    "icon": "☕",
    "demand": "🔥 Very High",
    "tagline": "Engineer enterprise-grade microservices and secure, high-throughput backend systems.",
    "overview": "Java Developers design, implement, and maintain enterprise backend systems, scalable cloud microservices, and secure transaction workflows using Java, Spring Boot, and relational databases.",
    "skills": [
      "Java",
      "Spring Boot",
      "SQL",
      "REST APIs",
      "Git"
    ],
    "skillsDetailed": [
      {
        "name": "Java",
        "level": "Expert",
        "desc": "Core Java, OOP, collections, multithreading, and Stream API"
      },
      {
        "name": "Spring Boot",
        "level": "Expert",
        "desc": "Spring MVC, Spring Data JPA, dependency injection, and REST endpoints"
      },
      {
        "name": "SQL",
        "level": "Intermediate",
        "desc": "Relational schema design, complex joins, and query optimization"
      },
      {
        "name": "REST APIs",
        "level": "Expert",
        "desc": "Designing resilient RESTful microservices and JSON data interchange"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control, GitFlow branching, and repository collaboration"
      },
      {
        "name": "Data Structures",
        "level": "Intermediate",
        "desc": "Core data structures, algorithms, and computational complexity"
      },
      {
        "name": "Hibernate",
        "level": "Intermediate",
        "desc": "ORM mapping, entity lifecycles, and caching strategies"
      },
      {
        "name": "Maven",
        "level": "Intermediate",
        "desc": "Dependency management, build lifecycle, and multi-module configurations"
      }
    ],
    "roles": [
      "Junior Java Developer",
      "Java Developer",
      "Senior Java Developer",
      "Lead Java Developer",
      "Principal Java Developer / Engineering Manager"
    ],
    "salaryRange": "₹5.5L – ₹19L per annum (India)",
    "avgSalary": "₹9.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Java foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Spring Boot and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "SQL & REST APIs implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Enterprise E-Commerce Microservice with Spring Boot, Spring Data JPA, and PostgreSQL"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "IntelliJ IDEA",
      "Maven",
      "Git",
      "Docker",
      "Postman",
      "MySQL",
      "Spring Tool Suite"
    ],
    "certifications": [
      "Industry Standard Java Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Enterprise E-Commerce Microservice with Spring Boot, Spring Data JPA, and PostgreSQL",
      "Secure Banking Transaction API with JWT Auth, Role-Based Access Control, and JUnit 5 tests"
    ],
    "interview_topics": [
      "Java Memory Model & Garbage Collection",
      "Spring Bean Lifecycle & Dependency Injection",
      "JPA Entity States & N+1 Queries",
      "Multithreading & Concurrency",
      "JUnit & Mockito Testing"
    ]
  },
  {
    "slug": "javascript-developer",
    "title": "JavaScript Developer",
    "category": "Software Development",
    "icon": "⚡",
    "demand": "🔥 Very High",
    "tagline": "Build modern web applications and performant event-driven runtime services.",
    "overview": "JavaScript Developers build interactive client applications and asynchronous server runtimes using modern ECMAScript, Node.js, and web standards across the entire browser-to-server lifecycle.",
    "skills": [
      "JavaScript",
      "TypeScript",
      "Node.js",
      "HTML5",
      "CSS3"
    ],
    "skillsDetailed": [
      {
        "name": "JavaScript",
        "level": "Expert",
        "desc": "ES6+, event loop, closures, promises, prototypes, and asynchronous execution"
      },
      {
        "name": "TypeScript",
        "level": "Intermediate",
        "desc": "Static typing, generics, interfaces, and compile-time safety"
      },
      {
        "name": "Node.js",
        "level": "Intermediate",
        "desc": "Event-driven runtime, core modules, file system, and streams"
      },
      {
        "name": "HTML5",
        "level": "Expert",
        "desc": "Semantic elements, accessibility standards, and modern DOM structure"
      },
      {
        "name": "CSS3",
        "level": "Intermediate",
        "desc": "Flexbox, CSS Grid, media queries, and responsive web layouts"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Source control, branching strategies, and collaboration workflows"
      },
      {
        "name": "Express.js",
        "level": "Intermediate",
        "desc": "RESTful routing, middleware pipelines, and error handling"
      },
      {
        "name": "REST APIs",
        "level": "Intermediate",
        "desc": "HTTP protocols, payload formatting, and status code standards"
      }
    ],
    "roles": [
      "Junior JavaScript Developer",
      "JavaScript Developer",
      "Senior JavaScript Developer",
      "Lead JavaScript Developer",
      "Principal JavaScript Developer / Engineering Manager"
    ],
    "salaryRange": "₹4.8L – ₹16L per annum (India)",
    "avgSalary": "₹8.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "JavaScript foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "TypeScript and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Node.js & HTML5 implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Real-Time Chat & Collaboration App with Node.js, Express, and WebSocket"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "VS Code",
      "Node.js",
      "npm/yarn",
      "Git",
      "Chrome DevTools",
      "Postman"
    ],
    "certifications": [
      "Industry Standard JavaScript Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Real-Time Chat & Collaboration App with Node.js, Express, and WebSocket",
      "Modern Task Management Dashboard with TypeScript, REST APIs, and Jest unit tests"
    ],
    "interview_topics": [
      "Event loop & call stack",
      "Closures & lexical scope",
      "Promises & Async/Await",
      "Prototypes & ES6 Classes",
      "TypeScript Generics"
    ]
  },
  {
    "slug": "frontend-developer",
    "title": "Frontend Developer",
    "category": "Software Development",
    "icon": "🎨",
    "demand": "🔥 Very High",
    "tagline": "Craft responsive, accessible, and delighting user interfaces with modern web frameworks.",
    "overview": "Frontend Developers translate design mockups into fast, accessible, interactive web applications using React, JavaScript, CSS, and modern web optimization practices.",
    "skills": [
      "React",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Tailwind CSS"
    ],
    "skillsDetailed": [
      {
        "name": "React",
        "level": "Expert",
        "desc": "Component architecture, hooks, state management, and virtual DOM"
      },
      {
        "name": "JavaScript",
        "level": "Expert",
        "desc": "Modern ES6+, DOM manipulation, fetch API, and async programming"
      },
      {
        "name": "HTML5",
        "level": "Expert",
        "desc": "Semantic web markup, accessibility (ARIA), and SEO best practices"
      },
      {
        "name": "CSS3",
        "level": "Expert",
        "desc": "Modern CSS, Flexbox, Grid, transitions, and responsive design"
      },
      {
        "name": "Tailwind CSS",
        "level": "Intermediate",
        "desc": "Utility-first styling, design token configuration, and responsive classes"
      },
      {
        "name": "Responsive Design",
        "level": "Expert",
        "desc": "Mobile-first layouts, fluid typography, and breakpoint systems"
      },
      {
        "name": "TypeScript",
        "level": "Intermediate",
        "desc": "Typed React components, props, state, and API response models"
      },
      {
        "name": "Redux",
        "level": "Intermediate",
        "desc": "Centralized application state management and data flows"
      }
    ],
    "roles": [
      "Junior Frontend Developer",
      "Frontend Developer",
      "Senior Frontend Developer",
      "Lead Frontend Developer",
      "Principal Frontend Developer / Engineering Manager"
    ],
    "salaryRange": "₹5L – ₹17L per annum (India)",
    "avgSalary": "₹8.2L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "React foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "JavaScript and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "HTML5 & CSS3 implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Interactive SaaS Analytics Dashboard with React, Tailwind CSS, and Recharts"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "VS Code",
      "Chrome DevTools",
      "Git",
      "Figma",
      "npm",
      "Vite",
      "Tailwind CSS"
    ],
    "certifications": [
      "Industry Standard Frontend Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Interactive SaaS Analytics Dashboard with React, Tailwind CSS, and Recharts",
      "Accessible Multi-Step E-Commerce Checkout with Zustand state and client-side validation"
    ],
    "interview_topics": [
      "React reconciliation & Virtual DOM",
      "Hooks lifecycle & dependency arrays",
      "CSS Specificity & Flexbox/Grid",
      "Web Accessibility (WCAG)",
      "Core Web Vitals & Performance"
    ]
  },
  {
    "slug": "backend-developer",
    "title": "Backend Developer",
    "category": "Software Development",
    "icon": "⚙️",
    "demand": "🔥 Very High",
    "tagline": "Build resilient server architectures, high-performance APIs, and data persistence layers.",
    "overview": "Backend Developers architect and maintain server-side business logic, database structures, integration APIs, and authentication pipelines that power web and mobile platforms.",
    "skills": [
      "Python",
      "SQL",
      "REST APIs",
      "Database Design",
      "System Design"
    ],
    "skillsDetailed": [
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Server runtime environments, asynchronous I/O, and backend frameworks"
      },
      {
        "name": "SQL",
        "level": "Expert",
        "desc": "Relational schema design, complex queries, transactions, and indexing"
      },
      {
        "name": "REST APIs",
        "level": "Expert",
        "desc": "API architecture, HTTP semantics, payload validation, and versioning"
      },
      {
        "name": "Database Design",
        "level": "Intermediate",
        "desc": "Normalization, indexing strategies, foreign keys, and migration scripts"
      },
      {
        "name": "System Design",
        "level": "Intermediate",
        "desc": "Caching, horizontal scaling, load balancing, and failure isolation"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Branching, PRs, and collaborative software development"
      },
      {
        "name": "Docker",
        "level": "Intermediate",
        "desc": "Containerizing backend services and environments"
      },
      {
        "name": "Redis",
        "level": "Intermediate",
        "desc": "Caching layer, session store, and rate limiting"
      }
    ],
    "roles": [
      "Junior Backend Developer",
      "Backend Developer",
      "Senior Backend Developer",
      "Lead Backend Developer",
      "Principal Backend Developer / Engineering Manager"
    ],
    "salaryRange": "₹5.5L – ₹20L per annum (India)",
    "avgSalary": "₹9.2L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Python foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "SQL and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "REST APIs & Database Design implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Scalable Microservices-Based Authentication & User Service with JWT, Redis cache, and PostgreSQL"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "VS Code",
      "Postman",
      "Docker",
      "PostgreSQL",
      "Redis",
      "Git",
      "Linux"
    ],
    "certifications": [
      "Industry Standard Backend Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Scalable Microservices-Based Authentication & User Service with JWT, Redis cache, and PostgreSQL",
      "Multi-Tenant Billing and Invoicing Backend with Webhook processing and automated PDF generation"
    ],
    "interview_topics": [
      "RESTful API design & idempotency",
      "Database Normalization & ACID properties",
      "Caching patterns & cache invalidation",
      "Authentication (JWT vs OAuth2 vs Sessions)",
      "Horizontal scaling & load balancers"
    ]
  },
  {
    "slug": "full-stack-developer",
    "title": "Full Stack Developer",
    "category": "Software Development",
    "icon": "🌐",
    "demand": "🔥 Very High",
    "tagline": "Bridge client interfaces and scalable backend infrastructure seamlessly.",
    "overview": "Full Stack Developers work across the entire technology stack, designing intuitive user interfaces, implementing robust server APIs, and maintaining relational and NoSQL databases.",
    "skills": [
      "React",
      "Node.js",
      "JavaScript",
      "SQL",
      "REST APIs"
    ],
    "skillsDetailed": [
      {
        "name": "React",
        "level": "Expert",
        "desc": "Component architecture, hooks, and client state management"
      },
      {
        "name": "Node.js",
        "level": "Expert",
        "desc": "Server-side runtime, Express API endpoints, and middleware"
      },
      {
        "name": "JavaScript",
        "level": "Expert",
        "desc": "ES6+, asynchronous patterns, and full-stack language fluency"
      },
      {
        "name": "SQL",
        "level": "Intermediate",
        "desc": "Database design, queries, table joins, and migrations"
      },
      {
        "name": "REST APIs",
        "level": "Expert",
        "desc": "End-to-end API specification, serialization, and authentication"
      },
      {
        "name": "Git",
        "level": "Expert",
        "desc": "Repository management, branching, and team integration workflows"
      },
      {
        "name": "Docker",
        "level": "Beginner",
        "desc": "Containerized development workflows and service composition"
      },
      {
        "name": "MongoDB",
        "level": "Intermediate",
        "desc": "NoSQL schemas, aggregation pipelines, and document storage"
      }
    ],
    "roles": [
      "Junior Full Stack Developer",
      "Full Stack Developer",
      "Senior Full Stack Developer",
      "Lead Full Stack Developer",
      "Principal Full Stack Developer / Engineering Manager"
    ],
    "salaryRange": "₹6L – ₹22L per annum (India)",
    "avgSalary": "₹10.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "React foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Node.js and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "JavaScript & SQL implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Full-Stack Project Collaboration Platform with React, Node.js, Express, and PostgreSQL"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "VS Code",
      "Git",
      "Docker",
      "Postman",
      "MongoDB Compass",
      "Chrome DevTools"
    ],
    "certifications": [
      "Industry Standard Full Stack Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Full-Stack Project Collaboration Platform with React, Node.js, Express, and PostgreSQL",
      "Job Portal with Student Resume Uploads, Search Filters, and Application Tracker"
    ],
    "interview_topics": [
      "Full-stack architecture & data flow",
      "CORS & Browser security policies",
      "Relational vs NoSQL database selection",
      "State synchronization across client & server",
      "Docker containerization & deployment"
    ]
  },
  {
    "slug": "android-developer",
    "title": "Android Developer",
    "category": "Software Development",
    "icon": "📱",
    "demand": "🔥 High",
    "tagline": "Build responsive, user-friendly native Android applications with Kotlin and modern Android SDK.",
    "overview": "Android Developers build native mobile applications for Android smartphones and tablets using Kotlin, Jetpack libraries, Material Design components, and RESTful web service integrations.",
    "skills": [
      "Kotlin",
      "Android SDK",
      "Jetpack Compose",
      "REST APIs",
      "Java"
    ],
    "skillsDetailed": [
      {
        "name": "Kotlin",
        "level": "Expert",
        "desc": "Null safety, coroutines, extension functions, and modern Kotlin idioms"
      },
      {
        "name": "Android SDK",
        "level": "Expert",
        "desc": "Activity and Fragment lifecycles, intents, services, and permissions"
      },
      {
        "name": "Jetpack Compose",
        "level": "Intermediate",
        "desc": "Declarative UI components, state hoisting, and Material Design 3"
      },
      {
        "name": "REST APIs",
        "level": "Intermediate",
        "desc": "Consuming backend web services, JSON parsing, and network error handling"
      },
      {
        "name": "Java",
        "level": "Intermediate",
        "desc": "Core Java object-oriented principles and interoperability"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control, mobile release tagging, and team collaboration"
      },
      {
        "name": "Coroutines",
        "level": "Intermediate",
        "desc": "Asynchronous background processing and flow streams"
      },
      {
        "name": "Room DB",
        "level": "Intermediate",
        "desc": "Local SQLite persistence and data access objects"
      }
    ],
    "roles": [
      "Junior Android Developer",
      "Android Developer",
      "Senior Android Developer",
      "Lead Android Developer",
      "Principal Android Developer / Engineering Manager"
    ],
    "salaryRange": "₹4.8L – ₹16L per annum (India)",
    "avgSalary": "₹7.8L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Kotlin foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Android SDK and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Jetpack Compose & REST APIs implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Native Expense & Budget Tracking App with Jetpack Compose, Room Database, and Coroutines"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Android Studio",
      "Kotlin",
      "Gradle",
      "Git",
      "Postman",
      "AVD"
    ],
    "certifications": [
      "Industry Standard Android Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Native Expense & Budget Tracking App with Jetpack Compose, Room Database, and Coroutines",
      "News Reader App with Retrofit network caching, offline sync, and Material 3 UI"
    ],
    "interview_topics": [
      "Activity & Fragment lifecycle",
      "ViewModel & LiveData / StateFlow",
      "Kotlin Coroutines & Flow",
      "Room DB migrations & DAOs",
      "Android permissions & Background workers"
    ]
  },
  {
    "slug": "flutter-developer",
    "title": "Flutter Developer",
    "category": "Software Development",
    "icon": "💙",
    "demand": "🔥 High",
    "tagline": "Create sleek, high-performance cross-platform mobile apps from a single codebase.",
    "overview": "Flutter Developers craft beautiful, natively compiled cross-platform applications for iOS and Android using Google's Flutter framework, the Dart programming language, and reactive state management.",
    "skills": [
      "Flutter",
      "Dart",
      "State Management",
      "REST APIs",
      "Mobile UI Design"
    ],
    "skillsDetailed": [
      {
        "name": "Flutter",
        "level": "Expert",
        "desc": "Widget tree, custom painters, animations, and lifecycle management"
      },
      {
        "name": "Dart",
        "level": "Expert",
        "desc": "Object-oriented programming, async/await, streams, and null safety"
      },
      {
        "name": "State Management",
        "level": "Expert",
        "desc": "Provider, Riverpod, or BLoC architectural patterns"
      },
      {
        "name": "REST APIs",
        "level": "Intermediate",
        "desc": "Http package, JSON serialization, and API integration"
      },
      {
        "name": "Mobile UI Design",
        "level": "Intermediate",
        "desc": "Responsive layouts, Cupertino & Material components"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control and multi-platform collaboration"
      },
      {
        "name": "Firebase",
        "level": "Intermediate",
        "desc": "Authentication, Firestore, push notifications, and analytics"
      },
      {
        "name": "SQLite",
        "level": "Intermediate",
        "desc": "Local persistent storage and key-value databases"
      }
    ],
    "roles": [
      "Junior Flutter Developer",
      "Flutter Developer",
      "Senior Flutter Developer",
      "Lead Flutter Developer",
      "Principal Flutter Developer / Engineering Manager"
    ],
    "salaryRange": "₹4.8L – ₹16L per annum (India)",
    "avgSalary": "₹7.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Flutter foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Dart and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "State Management & REST APIs implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Cross-Platform Food Delivery App with Flutter, BLoC state management, and Firebase"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "VS Code",
      "Android Studio",
      "Flutter CLI",
      "Dart DevTools",
      "Git",
      "Postman",
      "Firebase Console"
    ],
    "certifications": [
      "Industry Standard Flutter Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Cross-Platform Food Delivery App with Flutter, BLoC state management, and Firebase",
      "Personal Habit Tracker with Hive local persistence, dynamic charts, and push notifications"
    ],
    "interview_topics": [
      "StatelessWidget vs StatefulWidget",
      "Flutter rendering pipeline & Widget Tree",
      "BLoC vs Provider vs Riverpod",
      "Dart event loop & Isolates",
      "Platform channels for native code"
    ]
  },
  {
    "slug": "data-analyst",
    "title": "Data Analyst",
    "category": "Data Science and Artificial Intelligence",
    "icon": "📊",
    "demand": "🔥 High",
    "tagline": "Transform raw datasets into actionable executive insights and dashboards.",
    "overview": "Data Analysts inspect, clean, transform, and model data to discover useful information, inform conclusions, and support organizational decision-making using SQL, BI tools, and Python.",
    "skills": [
      "SQL",
      "Python",
      "Excel",
      "Power BI",
      "Tableau"
    ],
    "skillsDetailed": [
      {
        "name": "SQL",
        "level": "Expert",
        "desc": "Relational data querying, complex aggregations, joins, and CTEs"
      },
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Data wrangling, scripting, and pipeline automation"
      },
      {
        "name": "Excel",
        "level": "Expert",
        "desc": "Advanced formulas, pivot tables, and spreadsheet data modeling"
      },
      {
        "name": "Power BI",
        "level": "Intermediate",
        "desc": "Interactive reporting dashboards and DAX metrics"
      },
      {
        "name": "Tableau",
        "level": "Intermediate",
        "desc": "Visual data storytelling and executive analytics dashboards"
      },
      {
        "name": "Statistics",
        "level": "Intermediate",
        "desc": "Hypothesis testing, probability distributions, and descriptive analytics"
      },
      {
        "name": "Pandas",
        "level": "Intermediate",
        "desc": "DataFrame manipulations, cleaning, and ETL transformations"
      },
      {
        "name": "NumPy",
        "level": "Intermediate",
        "desc": "Vectorized computations and numerical transformations"
      }
    ],
    "roles": [
      "Junior Data Analyst",
      "Data Analyst",
      "Senior Data Analyst",
      "Lead Data Analyst",
      "Principal Data Analyst / Engineering Manager"
    ],
    "salaryRange": "₹4.5L – ₹14L per annum (India)",
    "avgSalary": "₹7.2L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "SQL foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Python and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Excel & Power BI implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: End-to-end Sales Analytics Dashboard in Power BI with dynamic DAX metrics"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "SQL Server",
      "Power BI",
      "Excel",
      "Tableau",
      "Jupyter Notebook",
      "Python"
    ],
    "certifications": [
      "Industry Standard Data Analyst Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "End-to-end Sales Analytics Dashboard in Power BI with dynamic DAX metrics",
      "Customer Churn exploratory analysis in Python using Pandas, Seaborn, and SQL queries"
    ],
    "interview_topics": [
      "SQL joins & window functions",
      "Data cleaning & handling missing values",
      "KPI metric definitions",
      "A/B testing basics & statistical significance",
      "Dashboard storytelling"
    ]
  },
  {
    "slug": "bi-analyst",
    "title": "Business Intelligence Analyst",
    "category": "Data Science and Artificial Intelligence",
    "icon": "📈",
    "demand": "🔥 High",
    "tagline": "Design data models, KPI dashboards, and enterprise reporting solutions.",
    "overview": "Business Intelligence Analysts design and manage data models, automated ETL transformations, and interactive executive reporting dashboards to provide strategic visibility across enterprise operations.",
    "skills": [
      "Power BI",
      "SQL",
      "Tableau",
      "Data Modeling",
      "Excel"
    ],
    "skillsDetailed": [
      {
        "name": "Power BI",
        "level": "Expert",
        "desc": "Data modeling, DAX measures, row-level security, and report publishing"
      },
      {
        "name": "SQL",
        "level": "Expert",
        "desc": "Writing performant analytical queries, views, and stored procedures"
      },
      {
        "name": "Tableau",
        "level": "Intermediate",
        "desc": "Visual analytics, LOD expressions, and dashboard actions"
      },
      {
        "name": "Data Modeling",
        "level": "Expert",
        "desc": "Dimensional modeling, star schemas, fact and dimension tables"
      },
      {
        "name": "Excel",
        "level": "Expert",
        "desc": "Power Query, Power Pivot, financial formulas, and macros"
      },
      {
        "name": "Business Analysis",
        "level": "Intermediate",
        "desc": "Requirements elicitation and translating business goals to metrics"
      },
      {
        "name": "ETL Pipelines",
        "level": "Intermediate",
        "desc": "Extract, transform, and load workflows using SQL/SSIS"
      },
      {
        "name": "Data Warehousing",
        "level": "Intermediate",
        "desc": "Understanding OLAP cubes and warehouse architecture"
      }
    ],
    "roles": [
      "Junior Business Intelligence Analyst",
      "Business Intelligence Analyst",
      "Senior Business Intelligence Analyst",
      "Lead Business Intelligence Analyst",
      "Principal Business Intelligence Analyst / Engineering Manager"
    ],
    "salaryRange": "₹4.8L – ₹15L per annum (India)",
    "avgSalary": "₹7.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Power BI foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "SQL and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Tableau & Data Modeling implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Enterprise Financial Performance BI Dashboard with dimensional data modeling and DAX measures"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Power BI",
      "Tableau",
      "SQL Server / SSIS",
      "DAX Studio",
      "Excel",
      "Alteryx"
    ],
    "certifications": [
      "Industry Standard Business Intelligence Analyst Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Enterprise Financial Performance BI Dashboard with dimensional data modeling and DAX measures",
      "Supply Chain & Inventory Optimization Suite with automated SQL refresh and drill-down reports"
    ],
    "interview_topics": [
      "Star schema vs Snowflake schema",
      "DAX calculations (CALCULATE, FILTER, RELATED)",
      "Data warehousing fundamentals",
      "Executive KPI design",
      "Data refresh optimization & partitioning"
    ]
  },
  {
    "slug": "data-scientist",
    "title": "Data Scientist",
    "category": "Data Science and Artificial Intelligence",
    "icon": "🔬",
    "demand": "🔥 Extremely High",
    "tagline": "Discover predictive patterns and formulate data-driven solutions using statistical modeling.",
    "overview": "Data Scientists combine statistical analysis, machine learning algorithms, and deep domain understanding to build predictive models, run experiments, and uncover insights from complex datasets.",
    "skills": [
      "Python",
      "Machine Learning",
      "Statistics",
      "SQL",
      "Pandas"
    ],
    "skillsDetailed": [
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Data science libraries, scripting, OOP, and scientific computing"
      },
      {
        "name": "Machine Learning",
        "level": "Expert",
        "desc": "Supervised, unsupervised algorithms, model evaluation, and validation"
      },
      {
        "name": "Statistics",
        "level": "Expert",
        "desc": "Inferential statistics, distributions, hypothesis testing, and Bayes theorem"
      },
      {
        "name": "SQL",
        "level": "Intermediate",
        "desc": "Data extraction, aggregations, window functions, and CTEs"
      },
      {
        "name": "Pandas",
        "level": "Expert",
        "desc": "DataFrame operations, exploratory data analysis, and missing data imputation"
      },
      {
        "name": "Scikit-learn",
        "level": "Expert",
        "desc": "Constructing robust pipelines, cross-validation grids, and metrics"
      },
      {
        "name": "Deep Learning",
        "level": "Beginner",
        "desc": "Neural networks, activation functions, and backpropagation"
      },
      {
        "name": "Data Visualization",
        "level": "Intermediate",
        "desc": "Matplotlib, Seaborn, and Plotly visual storytelling"
      }
    ],
    "roles": [
      "Junior Data Scientist",
      "Data Scientist",
      "Senior Data Scientist",
      "Lead Data Scientist",
      "Principal Data Scientist / Engineering Manager"
    ],
    "salaryRange": "₹6.5L – ₹24L per annum (India)",
    "avgSalary": "₹11.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Python foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Machine Learning and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Statistics & SQL implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Customer Lifetime Value (LTV) Prediction with Feature Engineering, XGBoost, and SHAP explainability"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Python",
      "Jupyter",
      "Scikit-Learn",
      "Pandas",
      "SQL",
      "Seaborn",
      "Git"
    ],
    "certifications": [
      "Industry Standard Data Scientist Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Customer Lifetime Value (LTV) Prediction with Feature Engineering, XGBoost, and SHAP explainability",
      "Healthcare Diagnostic Classifier with imbalanced data handling (SMOTE) and ROC-AUC optimization"
    ],
    "interview_topics": [
      "Bias-variance tradeoff & cross-validation",
      "Linear & Logistic Regression assumptions",
      "Decision Trees & Random Forests",
      "Hypothesis testing & p-values",
      "Feature engineering techniques"
    ]
  },
  {
    "slug": "data-engineer",
    "title": "Data Engineer",
    "category": "Data Science and Artificial Intelligence",
    "icon": "🏗️",
    "demand": "🔥 Extremely High",
    "tagline": "Architect and maintain robust, high-volume batch and real-time data pipelines.",
    "overview": "Data Engineers build the foundational data infrastructure, scalable ETL/ELT pipelines, and distributed storage systems that enable reliable analytics and production machine learning.",
    "skills": [
      "SQL",
      "Python",
      "Apache Spark",
      "ETL Pipelines",
      "Data Warehousing"
    ],
    "skillsDetailed": [
      {
        "name": "SQL",
        "level": "Expert",
        "desc": "Complex relational queries, indexing, partitioning, and execution plans"
      },
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Data processing scripts, OOP pipelines, and integration APIs"
      },
      {
        "name": "Apache Spark",
        "level": "Intermediate",
        "desc": "Distributed computing, PySpark DataFrames, and partition management"
      },
      {
        "name": "ETL Pipelines",
        "level": "Expert",
        "desc": "Extract, Transform, Load design, data validation, and idempotency"
      },
      {
        "name": "Data Warehousing",
        "level": "Intermediate",
        "desc": "Star schema, snowflake schema, and columnar storage design"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Code and pipeline configuration version control"
      },
      {
        "name": "Apache Airflow",
        "level": "Intermediate",
        "desc": "Workflow orchestration, DAG creation, and monitoring"
      },
      {
        "name": "Kafka",
        "level": "Beginner",
        "desc": "Message brokers, topics, partitions, and streaming data concepts"
      }
    ],
    "roles": [
      "Junior Data Engineer",
      "Data Engineer",
      "Senior Data Engineer",
      "Lead Data Engineer",
      "Principal Data Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6L – ₹22L per annum (India)",
    "avgSalary": "₹10.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "SQL foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Python and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Apache Spark & ETL Pipelines implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Automated Event Ingestion Pipeline with Apache Kafka, PySpark, and PostgreSQL"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Python",
      "Apache Spark",
      "SQL",
      "Airflow",
      "Kafka",
      "PostgreSQL",
      "Docker"
    ],
    "certifications": [
      "Industry Standard Data Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Automated Event Ingestion Pipeline with Apache Kafka, PySpark, and PostgreSQL",
      "Batch Data Warehouse ETL orchestrated with Apache Airflow and dbt"
    ],
    "interview_topics": [
      "Batch vs Streaming processing",
      "Spark RDDs, DataFrames & partitioning",
      "Database indexing & partitioning strategies",
      "Airflow DAG scheduling & idempotency",
      "Data lake vs data warehouse"
    ]
  },
  {
    "slug": "ml-engineer",
    "title": "Machine Learning Engineer",
    "category": "Data Science and Artificial Intelligence",
    "icon": "🤖",
    "demand": "🔥 Extremely High",
    "tagline": "Design predictive mathematical models and deploy production AI pipelines.",
    "overview": "Machine Learning Engineers bridge data science and software engineering by researching, building, validating, and deploying machine learning models into low-latency production applications.",
    "skills": [
      "Python",
      "Machine Learning",
      "Scikit-learn",
      "Pandas",
      "NumPy"
    ],
    "skillsDetailed": [
      {
        "name": "Python",
        "level": "Expert",
        "desc": "High-performance Python scripting and object-oriented ML pipelines"
      },
      {
        "name": "Machine Learning",
        "level": "Expert",
        "desc": "Supervised/unsupervised algorithms, evaluation metrics, and bias-variance tradeoff"
      },
      {
        "name": "Scikit-learn",
        "level": "Expert",
        "desc": "Model pipelines, feature preprocessors, and cross-validation grids"
      },
      {
        "name": "Pandas",
        "level": "Expert",
        "desc": "Advanced data cleaning, feature engineering, and exploratory data analysis"
      },
      {
        "name": "NumPy",
        "level": "Expert",
        "desc": "Matrix mathematics, tensor indexing, and linear algebra operations"
      },
      {
        "name": "SQL",
        "level": "Intermediate",
        "desc": "Extracting large training datasets and aggregating feature stores"
      },
      {
        "name": "Deep Learning",
        "level": "Intermediate",
        "desc": "Neural network architectures, activations, and backpropagation"
      },
      {
        "name": "PyTorch",
        "level": "Intermediate",
        "desc": "Dynamic computation graphs and deep neural network training"
      }
    ],
    "roles": [
      "Junior Machine Learning Engineer",
      "Machine Learning Engineer",
      "Senior Machine Learning Engineer",
      "Lead Machine Learning Engineer",
      "Principal Machine Learning Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6.5L – ₹25L per annum (India)",
    "avgSalary": "₹11.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Python foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Machine Learning and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Scikit-learn & Pandas implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: End-to-end Scikit-learn Pipeline with ColumnTransformer, cross-validation, and FastAPI inference endpoint"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Python",
      "PyTorch",
      "Scikit-Learn",
      "Docker",
      "FastAPI",
      "MLflow",
      "Git"
    ],
    "certifications": [
      "Industry Standard Machine Learning Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "End-to-end Scikit-learn Pipeline with ColumnTransformer, cross-validation, and FastAPI inference endpoint",
      "Computer vision or NLP classification model deployed inside a containerized Docker service"
    ],
    "interview_topics": [
      "Supervised vs unsupervised algorithms",
      "Model optimization (gradient descent, learning rates)",
      "ML pipeline serialization (Joblib/ONNX)",
      "REST API serving with FastAPI & Docker",
      "Model drift & monitoring"
    ]
  },
  {
    "slug": "ai-engineer",
    "title": "AI Engineer",
    "category": "Data Science and Artificial Intelligence",
    "icon": "🧠",
    "demand": "🔥 Extremely High",
    "tagline": "Build intelligent systems powered by neural networks, LLMs, and cognitive APIs.",
    "overview": "AI Engineers integrate cutting-edge artificial intelligence, foundational models, neural networks, and semantic retrieval systems into production software products.",
    "skills": [
      "Python",
      "Deep Learning",
      "PyTorch",
      "Large Language Models",
      "REST APIs"
    ],
    "skillsDetailed": [
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Asynchronous backend programming, data manipulation, and API clients"
      },
      {
        "name": "Deep Learning",
        "level": "Intermediate",
        "desc": "Neural network topologies, embeddings, loss functions, and inference"
      },
      {
        "name": "PyTorch",
        "level": "Intermediate",
        "desc": "Model loading, tensor operations, and inference pipelines"
      },
      {
        "name": "Large Language Models",
        "level": "Expert",
        "desc": "Prompt structuring, tokenization, context windows, and model orchestration"
      },
      {
        "name": "REST APIs",
        "level": "Expert",
        "desc": "FastAPI development, streaming responses, and asynchronous endpoints"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Source code management and continuous integration"
      },
      {
        "name": "Vector Databases",
        "level": "Intermediate",
        "desc": "Chroma, Pinecone, or FAISS indexing and semantic similarity search"
      },
      {
        "name": "LangChain",
        "level": "Intermediate",
        "desc": "Chains, agents, memory modules, and document loaders"
      }
    ],
    "roles": [
      "Junior AI Engineer",
      "AI Engineer",
      "Senior AI Engineer",
      "Lead AI Engineer",
      "Principal AI Engineer / Engineering Manager"
    ],
    "salaryRange": "₹7L – ₹26L per annum (India)",
    "avgSalary": "₹12.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Python foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Deep Learning and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "PyTorch & Large Language Models implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Domain-Specific Knowledge Base QA Bot with Vector DB embeddings and LangChain"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Python",
      "PyTorch",
      "LangChain",
      "OpenAI API",
      "ChromaDB",
      "FastAPI",
      "Docker"
    ],
    "certifications": [
      "Industry Standard AI Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Domain-Specific Knowledge Base QA Bot with Vector DB embeddings and LangChain",
      "Multi-Modal Content Moderation and Tagging Pipeline with Vision-Language Models"
    ],
    "interview_topics": [
      "Transformer attention mechanism",
      "Vector embeddings & cosine similarity",
      "Fine-tuning vs In-Context Learning",
      "API rate limiting & prompt token economics",
      "Evaluation of non-deterministic models"
    ]
  },
  {
    "slug": "generative-ai-developer",
    "title": "Generative AI Developer",
    "category": "Data Science and Artificial Intelligence",
    "icon": "✨",
    "demand": "🔥 Extremely High",
    "tagline": "Architect agentic workflows, Retrieval-Augmented Generation (RAG), and generative experiences.",
    "overview": "Generative AI Developers specialize in designing and deploying conversational agents, RAG architectures, document synthesis tools, and generative multi-modal workflows using modern foundational LLMs.",
    "skills": [
      "Python",
      "Prompt Engineering",
      "RAG",
      "Vector Databases",
      "LangChain"
    ],
    "skillsDetailed": [
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Modern Python, asynchronous execution, and API development"
      },
      {
        "name": "Prompt Engineering",
        "level": "Expert",
        "desc": "Structured prompting, system instructions, few-shot conditioning"
      },
      {
        "name": "RAG",
        "level": "Expert",
        "desc": "Document parsing, chunking, embedding generation, and contextual retrieval"
      },
      {
        "name": "Vector Databases",
        "level": "Expert",
        "desc": "Semantic search, indexing, metadata filtering, and distance metrics"
      },
      {
        "name": "LangChain",
        "level": "Intermediate",
        "desc": "Orchestrating prompts, chains, tools, and retrieval agents"
      },
      {
        "name": "REST APIs",
        "level": "Intermediate",
        "desc": "Streaming web endpoints, SSE, and FastAPI microservices"
      },
      {
        "name": "LlamaIndex",
        "level": "Intermediate",
        "desc": "Advanced data indexing, querying, and routing engines"
      },
      {
        "name": "Fine-Tuning",
        "level": "Beginner",
        "desc": "PEFT, LoRA adapters, and dataset curation for open weights"
      }
    ],
    "roles": [
      "Junior Generative AI Developer",
      "Generative AI Developer",
      "Senior Generative AI Developer",
      "Lead Generative AI Developer",
      "Principal Generative AI Developer / Engineering Manager"
    ],
    "salaryRange": "₹7L – ₹28L per annum (India)",
    "avgSalary": "₹12.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Python foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Prompt Engineering and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "RAG & Vector Databases implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Enterprise Document Intelligence System with Hybrid RAG, re-ranking, and citation tracking"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Python",
      "LangChain",
      "LlamaIndex",
      "ChromaDB / Qdrant",
      "OpenAI/Gemini APIs",
      "FastAPI"
    ],
    "certifications": [
      "Industry Standard Generative AI Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Enterprise Document Intelligence System with Hybrid RAG, re-ranking, and citation tracking",
      "Autonomous Code Review Assistant using Multi-Agent ReAct framework and GitHub API"
    ],
    "interview_topics": [
      "Retrieval-Augmented Generation (RAG) architecture",
      "Chunking strategies & embedding trade-offs",
      "Agentic patterns (ReAct, Plan-and-Solve)",
      "Hallucination mitigation & evaluation benchmarks (RAGAS)",
      "Structured output validation with Pydantic"
    ]
  },
  {
    "slug": "nlp-engineer",
    "title": "NLP Engineer",
    "category": "Data Science and Artificial Intelligence",
    "icon": "💬",
    "demand": "🔥 High",
    "tagline": "Build language parsing models, sentiment analyzers, and computational linguistic pipelines.",
    "overview": "NLP Engineers apply natural language processing algorithms, transformer architectures, and linguistic rules to extract meaning, classify text, and generate human-like summaries from unstructured data.",
    "skills": [
      "Python",
      "Natural Language Processing",
      "Hugging Face",
      "PyTorch",
      "Text Preprocessing"
    ],
    "skillsDetailed": [
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Text processing, regular expressions, and scientific computing"
      },
      {
        "name": "Natural Language Processing",
        "level": "Expert",
        "desc": "Linguistic fundamentals, parsing, sentiment analysis, and topic modeling"
      },
      {
        "name": "Hugging Face",
        "level": "Expert",
        "desc": "Transformers library, AutoTokenizer, and pre-trained model hubs"
      },
      {
        "name": "PyTorch",
        "level": "Intermediate",
        "desc": "Model fine-tuning, loss backpropagation, and tensor manipulation"
      },
      {
        "name": "Text Preprocessing",
        "level": "Expert",
        "desc": "Stemming, lemmatization, stop words, regex, and subword tokenization"
      },
      {
        "name": "Machine Learning",
        "level": "Intermediate",
        "desc": "Classification algorithms, evaluation metrics, and validation sets"
      },
      {
        "name": "spaCy",
        "level": "Intermediate",
        "desc": "Industrial-strength tokenization, dependency parsing, and NER pipelines"
      },
      {
        "name": "NLTK",
        "level": "Intermediate",
        "desc": "Corpora processing and classical linguistic analysis"
      }
    ],
    "roles": [
      "Junior NLP Engineer",
      "NLP Engineer",
      "Senior NLP Engineer",
      "Lead NLP Engineer",
      "Principal NLP Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6L – ₹22L per annum (India)",
    "avgSalary": "₹10.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Python foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Natural Language Processing and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Hugging Face & PyTorch implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Customer Review Aspect-Based Sentiment Classifier fine-tuned on RoBERTa"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Python",
      "Hugging Face",
      "spaCy",
      "PyTorch",
      "NLTK",
      "Scikit-Learn"
    ],
    "certifications": [
      "Industry Standard NLP Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Customer Review Aspect-Based Sentiment Classifier fine-tuned on RoBERTa",
      "Legal Contract Entity Extraction and Clause Summarizer using spaCy and Transformers"
    ],
    "interview_topics": [
      "Tokenization & WordPiece/BytePair encoding",
      "TF-IDF vs Word2Vec vs Transformers",
      "BERT vs GPT architectural differences",
      "Named Entity Recognition (NER) & POS tagging",
      "Evaluation metrics: BLEU, ROUGE, and F1"
    ]
  },
  {
    "slug": "computer-vision-engineer",
    "title": "Computer Vision Engineer",
    "category": "Data Science and Artificial Intelligence",
    "icon": "👁️",
    "demand": "🔥 High",
    "tagline": "Develop visual perception pipelines, object detection models, and image processing tools.",
    "overview": "Computer Vision Engineers design and deploy software algorithms that allow machines to extract high-level understanding from digital images, videos, and multi-spectral sensors.",
    "skills": [
      "Python",
      "OpenCV",
      "PyTorch",
      "Deep Learning",
      "Image Processing"
    ],
    "skillsDetailed": [
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Scientific computation, image array manipulation, and pipeline code"
      },
      {
        "name": "OpenCV",
        "level": "Expert",
        "desc": "Color spaces, morphological operations, contours, filtering, and video streams"
      },
      {
        "name": "PyTorch",
        "level": "Expert",
        "desc": "CNN model training, loss tracking, and GPU tensor acceleration"
      },
      {
        "name": "Deep Learning",
        "level": "Expert",
        "desc": "CNN architectures, ResNet, EfficientNet, and transfer learning"
      },
      {
        "name": "Image Processing",
        "level": "Intermediate",
        "desc": "Histogram equalization, edge detection, and thresholding"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Source code and model training experiment management"
      },
      {
        "name": "YOLO",
        "level": "Intermediate",
        "desc": "Object detection training, bounding box annotations, and inference"
      },
      {
        "name": "Object Detection",
        "level": "Intermediate",
        "desc": "Non-maximum suppression, IoU metrics, and mAP evaluation"
      }
    ],
    "roles": [
      "Junior Computer Vision Engineer",
      "Computer Vision Engineer",
      "Senior Computer Vision Engineer",
      "Lead Computer Vision Engineer",
      "Principal Computer Vision Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6.5L – ₹24L per annum (India)",
    "avgSalary": "₹11.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Python foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "OpenCV and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "PyTorch & Deep Learning implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Real-Time PPE Detection on Construction Sites using YOLOv8 and OpenCV"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Python",
      "OpenCV",
      "PyTorch",
      "YOLO",
      "Albumentations",
      "Git"
    ],
    "certifications": [
      "Industry Standard Computer Vision Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Real-Time PPE Detection on Construction Sites using YOLOv8 and OpenCV",
      "Medical Image Segmentation Model with U-Net for Cell Defect Identification"
    ],
    "interview_topics": [
      "Convolution operations & kernel math",
      "Object detection architectures (YOLO, Faster R-CNN)",
      "Image segmentation (U-Net, Mask R-CNN)",
      "Data augmentation & lighting invariance",
      "Inference optimization (ONNX, TensorRT)"
    ]
  },
  {
    "slug": "cloud-engineer",
    "title": "Cloud Engineer",
    "category": "Cloud and DevOps",
    "icon": "☁️",
    "demand": "🔥 Very High",
    "tagline": "Architect, provision, and maintain reliable cloud infrastructure and services.",
    "overview": "Cloud Engineers manage cloud architecture, automated deployments, container orchestration, and infrastructure security across AWS, Azure, and modern Linux environments.",
    "skills": [
      "Cloud Computing",
      "Linux",
      "Networking",
      "Terraform",
      "Docker"
    ],
    "skillsDetailed": [
      {
        "name": "Cloud Computing",
        "level": "Expert",
        "desc": "Cloud architectures, virtual networks, compute instances, and storage tiers"
      },
      {
        "name": "Linux",
        "level": "Expert",
        "desc": "CLI navigation, bash scripting, SSH, permissions, and service management"
      },
      {
        "name": "Networking",
        "level": "Intermediate",
        "desc": "TCP/IP, DNS, subnets, CIDR notation, firewalls, and HTTP protocols"
      },
      {
        "name": "Terraform",
        "level": "Intermediate",
        "desc": "Declarative Infrastructure as Code (IaC) and provider configurations"
      },
      {
        "name": "Docker",
        "level": "Intermediate",
        "desc": "Dockerfile construction, multi-stage builds, and container networking"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control for infrastructure code and automation scripts"
      },
      {
        "name": "CI/CD",
        "level": "Intermediate",
        "desc": "Automated build and deployment pipelines (GitHub Actions / GitLab)"
      },
      {
        "name": "Kubernetes",
        "level": "Beginner",
        "desc": "Pods, deployments, services, and cluster orchestration basics"
      }
    ],
    "roles": [
      "Junior Cloud Engineer",
      "Cloud Engineer",
      "Senior Cloud Engineer",
      "Lead Cloud Engineer",
      "Principal Cloud Engineer / Engineering Manager"
    ],
    "salaryRange": "₹5.5L – ₹20L per annum (India)",
    "avgSalary": "₹9.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Cloud Computing foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Linux and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Networking & Terraform implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: High-Availability Cloud Architecture on AWS with EC2 Auto-Scaling, ALB, and RDS"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "AWS / Azure",
      "Terraform",
      "Docker",
      "Linux",
      "Git",
      "Bash",
      "Kubernetes"
    ],
    "certifications": [
      "Industry Standard Cloud Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "High-Availability Cloud Architecture on AWS with EC2 Auto-Scaling, ALB, and RDS",
      "Infrastructure-as-Code Terraform Repository provisioning a secure multi-tier VPC"
    ],
    "interview_topics": [
      "Cloud service models (IaaS, PaaS, SaaS)",
      "VPC design, subnets, and routing tables",
      "IAM policies & principle of least privilege",
      "Terraform state management & HCL",
      "Containerization vs Virtual Machines"
    ]
  },
  {
    "slug": "aws-cloud-engineer",
    "title": "AWS Cloud Engineer",
    "category": "Cloud and DevOps",
    "icon": "🟧",
    "demand": "🔥 Very High",
    "tagline": "Build secure, scalable, and cost-effective cloud workloads on Amazon Web Services.",
    "overview": "AWS Cloud Engineers focus deeply on the Amazon Web Services ecosystem, provisioning compute, database, and network services while optimizing architecture for high availability and low cost.",
    "skills": [
      "AWS Services",
      "Linux",
      "Terraform",
      "Docker",
      "Networking"
    ],
    "skillsDetailed": [
      {
        "name": "AWS Services",
        "level": "Expert",
        "desc": "EC2, S3, RDS, IAM, VPC, Route 53, and Application Load Balancers"
      },
      {
        "name": "Linux",
        "level": "Expert",
        "desc": "Amazon Linux / Ubuntu administration, systemd, and bash scripting"
      },
      {
        "name": "Terraform",
        "level": "Intermediate",
        "desc": "AWS provider modules, remote S3 state backends, and variables"
      },
      {
        "name": "Docker",
        "level": "Intermediate",
        "desc": "Containerizing backend workloads for ECR and ECS deployment"
      },
      {
        "name": "Networking",
        "level": "Intermediate",
        "desc": "VPC CIDR design, public/private subnets, and routing"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Source control and collaborative IaC management"
      },
      {
        "name": "AWS Lambda",
        "level": "Intermediate",
        "desc": "Event-driven serverless functions and API Gateway triggers"
      },
      {
        "name": "CloudWatch",
        "level": "Intermediate",
        "desc": "Log groups, metric filters, dashboards, and automated alarms"
      }
    ],
    "roles": [
      "Junior AWS Cloud Engineer",
      "AWS Cloud Engineer",
      "Senior AWS Cloud Engineer",
      "Lead AWS Cloud Engineer",
      "Principal AWS Cloud Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6L – ₹22L per annum (India)",
    "avgSalary": "₹10.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "AWS Services foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Linux and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Terraform & Docker implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Serverless REST API using AWS Lambda, API Gateway, DynamoDB, and Cognito"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "AWS Management Console",
      "AWS CLI",
      "Terraform",
      "Boto3",
      "Docker",
      "Linux"
    ],
    "certifications": [
      "Industry Standard AWS Cloud Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Serverless REST API using AWS Lambda, API Gateway, DynamoDB, and Cognito",
      "Containerized Microservice running on AWS ECS Fargate behind an Application Load Balancer"
    ],
    "interview_topics": [
      "AWS IAM policies & cross-account roles",
      "EC2 vs ECS vs Lambda serverless",
      "S3 storage classes & lifecycle policies",
      "VPC endpoints, NAT Gateways & peering",
      "CloudWatch alarms & AWS CloudTrail"
    ]
  },
  {
    "slug": "azure-cloud-engineer",
    "title": "Azure Cloud Engineer",
    "category": "Cloud and DevOps",
    "icon": "🔷",
    "demand": "🔥 Very High",
    "tagline": "Design, automate, and govern enterprise cloud solutions on Microsoft Azure.",
    "overview": "Azure Cloud Engineers architect and govern enterprise infrastructure, Active Directory identity, and application hosting environments within Microsoft Azure.",
    "skills": [
      "Microsoft Azure",
      "PowerShell",
      "Cloud Computing",
      "Terraform",
      "Docker"
    ],
    "skillsDetailed": [
      {
        "name": "Microsoft Azure",
        "level": "Expert",
        "desc": "Virtual Machines, App Services, Blob Storage, VNets, and Resource Groups"
      },
      {
        "name": "PowerShell",
        "level": "Intermediate",
        "desc": "Azure PowerShell scripting, automation runbooks, and CLI commands"
      },
      {
        "name": "Cloud Computing",
        "level": "Expert",
        "desc": "Core cloud principles, high availability, and cloud storage tiers"
      },
      {
        "name": "Terraform",
        "level": "Intermediate",
        "desc": "AzureRM provider configurations, state files, and reusable modules"
      },
      {
        "name": "Docker",
        "level": "Intermediate",
        "desc": "Container creation and deployment to Azure Container Instances/Apps"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Source code and infrastructure pipeline versioning"
      },
      {
        "name": "Azure DevOps",
        "level": "Intermediate",
        "desc": "Azure Repos, CI/CD pipelines, and release gates"
      },
      {
        "name": "Linux",
        "level": "Intermediate",
        "desc": "Managing Linux VMs on Azure and SSH key authentication"
      }
    ],
    "roles": [
      "Junior Azure Cloud Engineer",
      "Azure Cloud Engineer",
      "Senior Azure Cloud Engineer",
      "Lead Azure Cloud Engineer",
      "Principal Azure Cloud Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6L – ₹21L per annum (India)",
    "avgSalary": "₹9.8L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Microsoft Azure foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "PowerShell and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Cloud Computing & Terraform implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Enterprise Multi-Tier Web App on Azure App Service with Azure SQL and Key Vault"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Azure Portal",
      "Azure CLI",
      "PowerShell",
      "Terraform",
      "Azure DevOps",
      "Docker"
    ],
    "certifications": [
      "Industry Standard Azure Cloud Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Enterprise Multi-Tier Web App on Azure App Service with Azure SQL and Key Vault",
      "Automated Azure Infrastructure Deployment with Bicep and Azure DevOps Pipelines"
    ],
    "interview_topics": [
      "Microsoft Entra ID (Azure AD) & RBAC roles",
      "Azure Virtual Networks (VNet) & NSGs",
      "Azure App Services vs Azure Functions",
      "ARM / Bicep vs Terraform",
      "Azure Monitor & Log Analytics workspaces"
    ]
  },
  {
    "slug": "devops-engineer",
    "title": "DevOps Engineer",
    "category": "Cloud and DevOps",
    "icon": "♾️",
    "demand": "🔥 Extremely High",
    "tagline": "Automate continuous integration, container orchestration, and delivery pipelines.",
    "overview": "DevOps Engineers bridge software development and operations by building continuous delivery pipelines, managing container platforms, and fostering high-velocity, reliable software deployment.",
    "skills": [
      "CI/CD",
      "Docker",
      "Kubernetes",
      "Linux",
      "Git"
    ],
    "skillsDetailed": [
      {
        "name": "CI/CD",
        "level": "Expert",
        "desc": "Building automated build, test, and release pipelines in GitHub Actions/Jenkins"
      },
      {
        "name": "Docker",
        "level": "Expert",
        "desc": "Multi-stage Dockerfiles, image optimization, layer caching, and compose"
      },
      {
        "name": "Kubernetes",
        "level": "Intermediate",
        "desc": "Declarative YAML manifests, deployments, services, configmaps, and secrets"
      },
      {
        "name": "Linux",
        "level": "Expert",
        "desc": "Advanced shell scripting, process managers, networking, and system diagnostics"
      },
      {
        "name": "Git",
        "level": "Expert",
        "desc": "Advanced git workflows, submodules, tagging, and branch protections"
      },
      {
        "name": "Bash",
        "level": "Intermediate",
        "desc": "Writing robust automation and deployment scripts with error handling"
      },
      {
        "name": "Terraform",
        "level": "Intermediate",
        "desc": "Automating cloud infrastructure provisioning"
      },
      {
        "name": "Prometheus",
        "level": "Beginner",
        "desc": "Time-series monitoring, PromQL queries, and Grafana dashboards"
      }
    ],
    "roles": [
      "Junior DevOps Engineer",
      "DevOps Engineer",
      "Senior DevOps Engineer",
      "Lead DevOps Engineer",
      "Principal DevOps Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6L – ₹24L per annum (India)",
    "avgSalary": "₹10.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "CI/CD foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Docker and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Kubernetes & Linux implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Complete CI/CD GitOps Pipeline deploying a microservice to Kubernetes with automated testing and ArgoCD"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Docker",
      "Kubernetes",
      "GitHub Actions",
      "Jenkins",
      "Linux",
      "Terraform",
      "Prometheus"
    ],
    "certifications": [
      "Industry Standard DevOps Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Complete CI/CD GitOps Pipeline deploying a microservice to Kubernetes with automated testing and ArgoCD",
      "Prometheus & Grafana Observability Stack monitoring cluster health and application metrics"
    ],
    "interview_topics": [
      "CI/CD pipeline stages & best practices",
      "Kubernetes Pods, Services, Ingress, and Deployments",
      "Immutable infrastructure principles",
      "GitOps workflows (ArgoCD)",
      "Zero-downtime deployment strategies (Blue/Green, Canary)"
    ]
  },
  {
    "slug": "sre",
    "title": "Site Reliability Engineer",
    "category": "Cloud and DevOps",
    "icon": "🛡️",
    "demand": "🔥 Extremely High",
    "tagline": "Apply software engineering principles to infrastructure operations and reliability.",
    "overview": "Site Reliability Engineers apply software engineering methodologies to infrastructure problems, ensuring high availability, latency targets, and automated self-healing across distributed platforms.",
    "skills": [
      "Linux",
      "Monitoring",
      "Python",
      "Kubernetes",
      "Networking"
    ],
    "skillsDetailed": [
      {
        "name": "Linux",
        "level": "Expert",
        "desc": "Deep kernel parameters, system calls, network sockets, and performance tools"
      },
      {
        "name": "Monitoring",
        "level": "Expert",
        "desc": "Observability pillars (metrics, logs, traces) and alerting thresholds"
      },
      {
        "name": "Python",
        "level": "Intermediate",
        "desc": "Writing tools, bots, and remediation scripts in Python or Go"
      },
      {
        "name": "Kubernetes",
        "level": "Intermediate",
        "desc": "Cluster operations, health checks, resource requests, and limits"
      },
      {
        "name": "Networking",
        "level": "Intermediate",
        "desc": "TCP handshakes, latency profiling, DNS resolution, and load balancing"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control for operational scripts and configurations"
      },
      {
        "name": "Docker",
        "level": "Intermediate",
        "desc": "Container troubleshooting and lifecycle inspection"
      },
      {
        "name": "Terraform",
        "level": "Beginner",
        "desc": "Infrastructure as code definitions"
      }
    ],
    "roles": [
      "Junior Site Reliability Engineer",
      "Site Reliability Engineer",
      "Senior Site Reliability Engineer",
      "Lead Site Reliability Engineer",
      "Principal Site Reliability Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6.5L – ₹25L per annum (India)",
    "avgSalary": "₹11.2L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Linux foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Monitoring and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Python & Kubernetes implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: SLO-Driven Alerting Framework with Prometheus, Alertmanager, and Grafana dashboards"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Linux",
      "Prometheus",
      "Grafana",
      "Python",
      "Go",
      "Docker",
      "Kubernetes"
    ],
    "certifications": [
      "Industry Standard Site Reliability Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "SLO-Driven Alerting Framework with Prometheus, Alertmanager, and Grafana dashboards",
      "Automated Chaos Testing Suite injecting network latency and pod crashes to test system resilience"
    ],
    "interview_topics": [
      "SLIs, SLOs, and Error Budgets",
      "Incident triage & root cause analysis (RCA)",
      "Distributed systems bottlenecks & noisy neighbors",
      "Chaos engineering fundamentals",
      "Capacity planning & auto-scaling math"
    ]
  },
  {
    "slug": "cybersecurity-analyst",
    "title": "Cybersecurity Analyst",
    "category": "Cybersecurity",
    "icon": "🔒",
    "demand": "🔥 Extremely High",
    "tagline": "Protect digital assets, investigate threats, and defend networks from unauthorized access.",
    "overview": "Cybersecurity Analysts monitor organizational networks and systems, analyze security alerts, conduct vulnerability assessments, and safeguard sensitive data against cyber threats.",
    "skills": [
      "Network Security",
      "Threat Analysis",
      "Linux",
      "Vulnerability Assessment",
      "Cryptography"
    ],
    "skillsDetailed": [
      {
        "name": "Network Security",
        "level": "Expert",
        "desc": "Protocols, packet analysis, firewalls, VPNs, and intrusion detection"
      },
      {
        "name": "Threat Analysis",
        "level": "Expert",
        "desc": "Identifying malware, threat actors, IOCs, and attack surfaces"
      },
      {
        "name": "Linux",
        "level": "Intermediate",
        "desc": "Command line, user security, permissions, and log file analysis"
      },
      {
        "name": "Vulnerability Assessment",
        "level": "Intermediate",
        "desc": "Port scanning, vulnerability scanners, and risk prioritization"
      },
      {
        "name": "Cryptography",
        "level": "Intermediate",
        "desc": "Hashing, SSL/TLS, public-key encryption, and certificate management"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control for security scripts and compliance artifacts"
      },
      {
        "name": "Python",
        "level": "Intermediate",
        "desc": "Scripting automated security checks and log parsing"
      },
      {
        "name": "SIEM",
        "level": "Intermediate",
        "desc": "Monitoring security events in Splunk or ELK"
      }
    ],
    "roles": [
      "Junior Cybersecurity Analyst",
      "Cybersecurity Analyst",
      "Senior Cybersecurity Analyst",
      "Lead Cybersecurity Analyst",
      "Principal Cybersecurity Analyst / Engineering Manager"
    ],
    "salaryRange": "₹5L – ₹18L per annum (India)",
    "avgSalary": "₹8.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Network Security foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Threat Analysis and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Linux & Vulnerability Assessment implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Virtual Cybersecurity Home Lab simulating attacks and packet inspection with Wireshark and Snort"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Wireshark",
      "Nmap",
      "Splunk",
      "Kali Linux",
      "Burp Suite",
      "Metasploit"
    ],
    "certifications": [
      "Industry Standard Cybersecurity Analyst Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Virtual Cybersecurity Home Lab simulating attacks and packet inspection with Wireshark and Snort",
      "Comprehensive Vulnerability Assessment and Hardening Report for a Linux Web Server"
    ],
    "interview_topics": [
      "OSI model & TCP/IP security vulnerabilities",
      "Common attack vectors (Phishing, DDoS, Ransomware)",
      "Firewalls vs IDS vs IPS",
      "Symmetric vs Asymmetric cryptography",
      "Incident response life cycle (NIST)"
    ]
  },
  {
    "slug": "soc-analyst",
    "title": "SOC Analyst",
    "category": "Cybersecurity",
    "icon": "🚨",
    "demand": "🔥 Very High",
    "tagline": "Monitor real-time security events, triage alerts, and defend enterprise perimeters 24/7.",
    "overview": "Security Operations Center (SOC) Analysts monitor telemetry feeds around the clock, triage high-priority alerts, investigate potential breaches, and initiate containment protocols.",
    "skills": [
      "SIEM",
      "Log Analysis",
      "Network Security",
      "Incident Response",
      "Threat Analysis"
    ],
    "skillsDetailed": [
      {
        "name": "SIEM",
        "level": "Expert",
        "desc": "Splunk/ELK query language, correlation searches, and dashboard triaging"
      },
      {
        "name": "Log Analysis",
        "level": "Expert",
        "desc": "Analyzing syslog, Windows Event Logs, firewall and auth logs"
      },
      {
        "name": "Network Security",
        "level": "Intermediate",
        "desc": "Understanding TCP/IP flags, DNS tunneling, and suspicious traffic"
      },
      {
        "name": "Incident Response",
        "level": "Intermediate",
        "desc": "Alert verification, ticket escalation, and initial host isolation"
      },
      {
        "name": "Threat Analysis",
        "level": "Intermediate",
        "desc": "Correlating IOCs with VirusTotal, AlienVault OTX, and Threat Intel feeds"
      },
      {
        "name": "Linux",
        "level": "Intermediate",
        "desc": "Reviewing Linux auth logs, bash command histories, and cron jobs"
      },
      {
        "name": "Wireshark",
        "level": "Intermediate",
        "desc": "Extracting PCAP payloads and identifying malware beacons"
      },
      {
        "name": "Python",
        "level": "Beginner",
        "desc": "Automating threat intelligence lookups via REST APIs"
      }
    ],
    "roles": [
      "Junior SOC Analyst",
      "SOC Analyst",
      "Senior SOC Analyst",
      "Lead SOC Analyst",
      "Principal SOC Analyst / Engineering Manager"
    ],
    "salaryRange": "₹4.8L – ₹16L per annum (India)",
    "avgSalary": "₹7.8L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "SIEM foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Log Analysis and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Network Security & Incident Response implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: SOC Detection Lab with Elastic SIEM ingesting Windows Sysmon and web server logs"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Splunk",
      "QRadar",
      "Elastic SIEM",
      "Wireshark",
      "VirusTotal",
      "CrowdStrike"
    ],
    "certifications": [
      "Industry Standard SOC Analyst Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "SOC Detection Lab with Elastic SIEM ingesting Windows Sysmon and web server logs",
      "Phishing Investigation Playbook analyzing malicious URLs, attachments, and email headers"
    ],
    "interview_topics": [
      "Tier 1 SOC triage workflows & alert escalation",
      "MITRE ATT&CK framework mapping",
      "Phishing email header analysis & defanging",
      "Host-based artifacts (Windows Event Logs, Prefetch)",
      "Brute-force vs credential stuffing indicators"
    ]
  },
  {
    "slug": "penetration-tester",
    "title": "Penetration Tester",
    "category": "Cybersecurity",
    "icon": "🎯",
    "demand": "🔥 High",
    "tagline": "Simulate adversary attacks to identify and remediate security vulnerabilities ethically.",
    "overview": "Penetration Testers (Ethical Hackers) simulate real-world cyberattacks on networks, web applications, and systems to expose security weaknesses before malicious hackers can exploit them.",
    "skills": [
      "Web Application Security",
      "Burp Suite",
      "Linux",
      "Network Security",
      "Python"
    ],
    "skillsDetailed": [
      {
        "name": "Web Application Security",
        "level": "Expert",
        "desc": "OWASP Top 10: SQL injection, Cross-Site Scripting, IDOR, and auth flaws"
      },
      {
        "name": "Burp Suite",
        "level": "Expert",
        "desc": "Intercepting proxies, Repeater, Intruder, and custom extension usage"
      },
      {
        "name": "Linux",
        "level": "Expert",
        "desc": "Kali Linux navigation, terminal scripting, permissions, and privilege checks"
      },
      {
        "name": "Network Security",
        "level": "Intermediate",
        "desc": "Nmap port scanning, banner grabbing, and protocol exploitation"
      },
      {
        "name": "Python",
        "level": "Intermediate",
        "desc": "Writing custom exploit proof-of-concepts and payload scripts"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Managing tool repositories and automation scripts"
      },
      {
        "name": "Metasploit",
        "level": "Intermediate",
        "desc": "Exploit modules, meterpreter payloads, and auxiliary scanners"
      },
      {
        "name": "Bash",
        "level": "Intermediate",
        "desc": "Rapid command-line reconnaissance and pipeline automation"
      }
    ],
    "roles": [
      "Junior Penetration Tester",
      "Penetration Tester",
      "Senior Penetration Tester",
      "Lead Penetration Tester",
      "Principal Penetration Tester / Engineering Manager"
    ],
    "salaryRange": "₹5.5L – ₹20L per annum (India)",
    "avgSalary": "₹9.2L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Web Application Security foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Burp Suite and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Linux & Network Security implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Comprehensive Web App Penetration Test on DVWA / Juice Shop with detailed findings report"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Burp Suite",
      "Kali Linux",
      "Nmap",
      "Metasploit",
      "OWASP ZAP",
      "SQLmap",
      "Hydra"
    ],
    "certifications": [
      "Industry Standard Penetration Tester Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Comprehensive Web App Penetration Test on DVWA / Juice Shop with detailed findings report",
      "Custom Vulnerability Scanner in Python checking for exposed API keys and outdated headers"
    ],
    "interview_topics": [
      "OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, IDOR)",
      "Privilege escalation techniques (Linux & Windows)",
      "Network pivoting & port forwarding",
      "Active Directory attack basics (Kerberoasting)",
      "Ethical disclosure guidelines & reporting"
    ]
  },
  {
    "slug": "security-engineer",
    "title": "Security Engineer",
    "category": "Cybersecurity",
    "icon": "🔐",
    "demand": "🔥 Very High",
    "tagline": "Engineer resilient security architectures, cryptographic controls, and DevSecOps pipelines.",
    "overview": "Security Engineers design, implement, and automate technical defense mechanisms, cryptographic keys, IAM boundaries, and secure code validation pipelines across software architectures.",
    "skills": [
      "Application Security",
      "Cloud Security",
      "Linux",
      "Cryptography",
      "CI/CD"
    ],
    "skillsDetailed": [
      {
        "name": "Application Security",
        "level": "Expert",
        "desc": "Secure coding practices, code reviews, and threat modeling"
      },
      {
        "name": "Cloud Security",
        "level": "Expert",
        "desc": "Cloud IAM, principle of least privilege, security groups, and encryption"
      },
      {
        "name": "Linux",
        "level": "Expert",
        "desc": "Kernel hardening, SSH security, firewall (iptables/nftables), and PAM"
      },
      {
        "name": "Cryptography",
        "level": "Intermediate",
        "desc": "Key rotation, TLS certificates, symmetric/asymmetric algorithms"
      },
      {
        "name": "CI/CD",
        "level": "Intermediate",
        "desc": "Integrating security scanners into automated deployment workflows"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control and managing security policy code"
      },
      {
        "name": "Docker",
        "level": "Intermediate",
        "desc": "Container image scanning, rootless containers, and security policies"
      },
      {
        "name": "Python",
        "level": "Intermediate",
        "desc": "Writing security automation scripts and policy validators"
      }
    ],
    "roles": [
      "Junior Security Engineer",
      "Security Engineer",
      "Senior Security Engineer",
      "Lead Security Engineer",
      "Principal Security Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6L – ₹22L per annum (India)",
    "avgSalary": "₹10.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Application Security foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Cloud Security and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Linux & Cryptography implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: DevSecOps CI/CD Pipeline with automated SAST (Semgrep), container scanning (Trivy), and secret detection"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "GitLab CI / GitHub Actions",
      "Trivy / Snyk",
      "HashiCorp Vault",
      "Docker",
      "AWS IAM",
      "Linux"
    ],
    "certifications": [
      "Industry Standard Security Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "DevSecOps CI/CD Pipeline with automated SAST (Semgrep), container scanning (Trivy), and secret detection",
      "Centralized Secrets Management Service using HashiCorp Vault with dynamic database credentials"
    ],
    "interview_topics": [
      "DevSecOps pipeline stages (SAST, DAST, SCA)",
      "Public Key Infrastructure (PKI) & Secrets Management",
      "Zero Trust Architecture principles",
      "Authentication protocols (OAuth 2.0, OpenID Connect, SAML)",
      "Container isolation & Linux cgroups"
    ]
  },
  {
    "slug": "qa-engineer",
    "title": "QA Engineer",
    "category": "Software Testing",
    "icon": "✅",
    "demand": "🔥 High",
    "tagline": "Ensure product excellence through rigorous test plans, bug tracking, and regression analysis.",
    "overview": "Quality Assurance (QA) Engineers design comprehensive test scenarios, execute manual and automated validations, verify user requirements, and ensure software deliverables are stable and bug-free.",
    "skills": [
      "Test Case Design",
      "Functional Testing",
      "Bug Life Cycle",
      "REST APIs",
      "SQL"
    ],
    "skillsDetailed": [
      {
        "name": "Test Case Design",
        "level": "Expert",
        "desc": "Authoring edge cases, happy paths, acceptance criteria, and traceability"
      },
      {
        "name": "Functional Testing",
        "level": "Expert",
        "desc": "Black-box validation, exploratory testing, and feature verification"
      },
      {
        "name": "Bug Life Cycle",
        "level": "Expert",
        "desc": "Writing reproducible bug reports, steps, attachments, and tracking in Jira"
      },
      {
        "name": "REST APIs",
        "level": "Intermediate",
        "desc": "Testing endpoints with Postman, validating JSON schemas and response codes"
      },
      {
        "name": "SQL",
        "level": "Intermediate",
        "desc": "Querying relational databases to verify back-end data consistency"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Accessing code repositories, inspecting pull requests, and changelogs"
      },
      {
        "name": "Regression Testing",
        "level": "Intermediate",
        "desc": "Executing test suites to verify new changes do not break existing behavior"
      },
      {
        "name": "Jira",
        "level": "Intermediate",
        "desc": "Managing sprints, user stories, bug workflows, and velocity"
      }
    ],
    "roles": [
      "Junior QA Engineer",
      "QA Engineer",
      "Senior QA Engineer",
      "Lead QA Engineer",
      "Principal QA Engineer / Engineering Manager"
    ],
    "salaryRange": "₹4L – ₹14L per annum (India)",
    "avgSalary": "₹6.8L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Test Case Design foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Functional Testing and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Bug Life Cycle & REST APIs implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Comprehensive Test Plan & Bug Life Cycle Documentation for an E-Commerce Web Application"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Jira",
      "Postman",
      "TestRail",
      "Chrome DevTools",
      "SQL",
      "Git"
    ],
    "certifications": [
      "Industry Standard QA Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Comprehensive Test Plan & Bug Life Cycle Documentation for an E-Commerce Web Application",
      "REST API Test Suite in Postman with environment variables, assertions, and runner automation"
    ],
    "interview_topics": [
      "SDLC vs STLC phases",
      "Equivalence partitioning & boundary value analysis",
      "Severity vs Priority in defect lifecycle",
      "Smoke vs Sanity vs Regression testing",
      "API status codes & validation methods"
    ]
  },
  {
    "slug": "automation-test-engineer",
    "title": "Automation Test Engineer",
    "category": "Software Testing",
    "icon": "🧪",
    "demand": "🔥 Very High",
    "tagline": "Build scalable automated test suites and continuous quality gates with modern frameworks.",
    "overview": "Automation Test Engineers develop maintainable automated test scripts for web, API, and mobile applications using frameworks like Selenium, Playwright, and Pytest/TestNG integrated into CI/CD pipelines.",
    "skills": [
      "Selenium",
      "Python",
      "Playwright",
      "Test Case Design",
      "Git"
    ],
    "skillsDetailed": [
      {
        "name": "Selenium",
        "level": "Expert",
        "desc": "WebDriver APIs, element locators, explicit waits, and browser actions"
      },
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Scripting test logic, assertions, OOP abstractions, and data parsing"
      },
      {
        "name": "Playwright",
        "level": "Intermediate",
        "desc": "Modern headless browser testing, tracing, auto-waiting, and network mocking"
      },
      {
        "name": "Test Case Design",
        "level": "Expert",
        "desc": "Designing robust, non-flaky test specifications and assertion logic"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Managing test repositories and versioning framework code"
      },
      {
        "name": "REST APIs",
        "level": "Intermediate",
        "desc": "Automating API requests, status checks, and response body schemas"
      },
      {
        "name": "CI/CD",
        "level": "Intermediate",
        "desc": "Triggering test automation runs in GitHub Actions or Jenkins pipelines"
      },
      {
        "name": "SQL",
        "level": "Intermediate",
        "desc": "Database queries for test fixture setup and data verification"
      }
    ],
    "roles": [
      "Junior Automation Test Engineer",
      "Automation Test Engineer",
      "Senior Automation Test Engineer",
      "Lead Automation Test Engineer",
      "Principal Automation Test Engineer / Engineering Manager"
    ],
    "salaryRange": "₹5L – ₹17L per annum (India)",
    "avgSalary": "₹8.2L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Selenium foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Python and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Playwright & Test Case Design implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: End-to-End Test Automation Suite using Playwright & TypeScript with Page Object Model and HTML reports"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Selenium",
      "Playwright",
      "Python / Java",
      "Pytest / TestNG",
      "Git",
      "Postman",
      "Jenkins"
    ],
    "certifications": [
      "Industry Standard Automation Test Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "End-to-End Test Automation Suite using Playwright & TypeScript with Page Object Model and HTML reports",
      "Data-Driven API Test Framework in Python using Pytest, Requests, and Jenkins integration"
    ],
    "interview_topics": [
      "Page Object Model (POM) design pattern",
      "Dynamic element locators (XPath vs CSS Selectors)",
      "Handling asynchronous waits (Explicit vs Implicit)",
      "Data-driven testing with parameterized fixtures",
      "CI/CD automated regression triggers"
    ]
  },
  {
    "slug": "software-test-engineer",
    "title": "Software Test Engineer",
    "category": "Software Testing",
    "icon": "🔍",
    "demand": "🔥 High",
    "tagline": "Execute end-to-end software verification across UI, APIs, and data persistence layers.",
    "overview": "Software Test Engineers execute functional, exploratory, performance, and regression testing across complex distributed software systems, bridging manual domain expertise with automated scripting.",
    "skills": [
      "Test Case Design",
      "REST APIs",
      "SQL",
      "Functional Testing",
      "Git"
    ],
    "skillsDetailed": [
      {
        "name": "Test Case Design",
        "level": "Expert",
        "desc": "Structured test plans, traceability matrices, and edge case coverage"
      },
      {
        "name": "REST APIs",
        "level": "Expert",
        "desc": "API testing, headers, auth tokens, status codes, and JSON assertions"
      },
      {
        "name": "SQL",
        "level": "Expert",
        "desc": "Querying relational databases to validate state changes and transactions"
      },
      {
        "name": "Functional Testing",
        "level": "Expert",
        "desc": "System testing, integration testing, and acceptance workflows"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control for test scripts and issue reproductions"
      },
      {
        "name": "Bug Life Cycle",
        "level": "Expert",
        "desc": "Defect logging, reproduction steps, severity tagging, and re-testing"
      },
      {
        "name": "Python",
        "level": "Intermediate",
        "desc": "Scripting automated checks and data generation"
      },
      {
        "name": "Cypress",
        "level": "Intermediate",
        "desc": "Modern web application end-to-end testing"
      }
    ],
    "roles": [
      "Junior Software Test Engineer",
      "Software Test Engineer",
      "Senior Software Test Engineer",
      "Lead Software Test Engineer",
      "Principal Software Test Engineer / Engineering Manager"
    ],
    "salaryRange": "₹4.5L – ₹15L per annum (India)",
    "avgSalary": "₹7.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Test Case Design foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "REST APIs and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "SQL & Functional Testing implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Cross-Browser E-Commerce Quality Assurance Matrix with Postman API tests and Cypress smoke tests"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Postman",
      "Cypress / Playwright",
      "SQL",
      "Jira",
      "Git",
      "Linux"
    ],
    "certifications": [
      "Industry Standard Software Test Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Cross-Browser E-Commerce Quality Assurance Matrix with Postman API tests and Cypress smoke tests",
      "Banking Transaction Regression Suite with complex SQL database state validations"
    ],
    "interview_topics": [
      "Test matrix & coverage strategies",
      "Cross-browser and cross-device testing",
      "REST vs SOAP testing approaches",
      "Database verification and rollback tests",
      "Non-functional testing parameters"
    ]
  },
  {
    "slug": "business-analyst",
    "title": "Business Analyst",
    "category": "Business and Product",
    "icon": "📋",
    "demand": "🔥 Very High",
    "tagline": "Bridge business objectives and engineering implementations with clear technical requirements.",
    "overview": "Business Analysts analyze business domains, document processes, gather stakeholder requirements, and translate commercial goals into actionable technical specifications and user stories.",
    "skills": [
      "Business Analysis",
      "Requirements Gathering",
      "SQL",
      "Excel",
      "Process Mapping"
    ],
    "skillsDetailed": [
      {
        "name": "Business Analysis",
        "level": "Expert",
        "desc": "Requirements elicitation, stakeholder discovery, and functional specification"
      },
      {
        "name": "Requirements Gathering",
        "level": "Expert",
        "desc": "Documenting BRDs, FSDs, user acceptance criteria, and traceability"
      },
      {
        "name": "SQL",
        "level": "Intermediate",
        "desc": "Querying relational data to validate business hypotheses and metrics"
      },
      {
        "name": "Excel",
        "level": "Expert",
        "desc": "Financial modeling, pivot tables, data visualization, and scenario planning"
      },
      {
        "name": "Process Mapping",
        "level": "Expert",
        "desc": "BPMN flowcharts, sequence diagrams, and current-state/future-state modeling"
      },
      {
        "name": "Jira",
        "level": "Intermediate",
        "desc": "Backlog grooming, sprint planning, and writing Agile user stories"
      },
      {
        "name": "Power BI",
        "level": "Intermediate",
        "desc": "Building analytical dashboards to track business KPIs"
      },
      {
        "name": "Wireframing",
        "level": "Intermediate",
        "desc": "Creating low-fidelity screen mockups in Figma or Balsamiq"
      }
    ],
    "roles": [
      "Junior Business Analyst",
      "Business Analyst",
      "Senior Business Analyst",
      "Lead Business Analyst",
      "Principal Business Analyst / Engineering Manager"
    ],
    "salaryRange": "₹5L – ₹17L per annum (India)",
    "avgSalary": "₹8.2L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Business Analysis foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Requirements Gathering and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "SQL & Excel implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Complete Business Requirements Package & Wireframes for a FinTech Loan Origination Platform"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Jira",
      "Confluence",
      "Excel",
      "Figma",
      "SQL",
      "Draw.io / Visio",
      "Power BI"
    ],
    "certifications": [
      "Industry Standard Business Analyst Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Complete Business Requirements Package & Wireframes for a FinTech Loan Origination Platform",
      "Operations Process Optimization & Gap Analysis with BPMN diagrams and KPI dashboard in Power BI"
    ],
    "interview_topics": [
      "Business Requirements Document (BRD) vs Functional Specs (FSD)",
      "Writing effective Agile user stories with INVEST criteria",
      "Process mapping with BPMN 2.0 flowcharts",
      "Gap analysis and SWOT frameworks",
      "Stakeholder interview and prioritization techniques"
    ]
  },
  {
    "slug": "product-analyst",
    "title": "Product Analyst",
    "category": "Business and Product",
    "icon": "📌",
    "demand": "🔥 High",
    "tagline": "Analyze user behavior, optimize conversion funnels, and guide product roadmap decisions.",
    "overview": "Product Analysts evaluate user interactions, retention cohorts, feature engagement, and conversion funnels, using behavioral telemetry and statistical experiments to optimize digital product growth.",
    "skills": [
      "SQL",
      "Product Analytics",
      "Statistics",
      "Excel",
      "Data Visualization"
    ],
    "skillsDetailed": [
      {
        "name": "SQL",
        "level": "Expert",
        "desc": "Extracting timeseries events, window functions, and user cohort aggregations"
      },
      {
        "name": "Product Analytics",
        "level": "Expert",
        "desc": "Funnel analysis, user journeys, event tracking, and cohort retention"
      },
      {
        "name": "Statistics",
        "level": "Expert",
        "desc": "A/B testing, hypothesis testing, confidence intervals, and p-values"
      },
      {
        "name": "Excel",
        "level": "Expert",
        "desc": "Cohort modeling, sensitivity analysis, and metric trend forecasts"
      },
      {
        "name": "Data Visualization",
        "level": "Intermediate",
        "desc": "Communicating insights with Tableau, Power BI, or Python charts"
      },
      {
        "name": "Business Analysis",
        "level": "Intermediate",
        "desc": "Connecting user behavioral metrics with commercial unit economics"
      },
      {
        "name": "Python",
        "level": "Intermediate",
        "desc": "Statistical modeling, pandas analysis, and automation"
      },
      {
        "name": "Tableau",
        "level": "Intermediate",
        "desc": "Interactive product metric dashboards for leadership"
      }
    ],
    "roles": [
      "Junior Product Analyst",
      "Product Analyst",
      "Senior Product Analyst",
      "Lead Product Analyst",
      "Principal Product Analyst / Engineering Manager"
    ],
    "salaryRange": "₹5.5L – ₹18L per annum (India)",
    "avgSalary": "₹8.8L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "SQL foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Product Analytics and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Statistics & Excel implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: E-Commerce Checkout Funnel Optimization & A/B Experiment Analysis with SQL and Python"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Mixpanel",
      "Amplitude",
      "SQL",
      "Google Analytics 4",
      "Tableau",
      "Python"
    ],
    "certifications": [
      "Industry Standard Product Analyst Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "E-Commerce Checkout Funnel Optimization & A/B Experiment Analysis with SQL and Python",
      "SaaS User Retention & Feature Engagement Dashboard in Mixpanel / Amplitude and Tableau"
    ],
    "interview_topics": [
      "A/B test design, sample sizing & statistical power",
      "Conversion funnel analysis & drop-off diagnosis",
      "Cohort analysis & retention curves (D1, D7, D30)",
      "North Star Metric & input metric hierarchies",
      "Event taxonomy & tracking plan design"
    ]
  },
  {
    "slug": "product-manager",
    "title": "Product Manager",
    "category": "Business and Product",
    "icon": "🚀",
    "demand": "🔥 Extremely High",
    "tagline": "Define product vision, orchestrate cross-functional delivery, and maximize customer value.",
    "overview": "Product Managers guide the strategy, roadmap, and feature execution of digital products, collaborating with engineering, design, marketing, and executives to deliver high-impact user experiences.",
    "skills": [
      "Product Roadmap",
      "Agile/Scrum",
      "User Stories",
      "Market Research",
      "Product Analytics"
    ],
    "skillsDetailed": [
      {
        "name": "Product Roadmap",
        "level": "Expert",
        "desc": "Strategic milestone planning, vision alignment, and release cadence"
      },
      {
        "name": "Agile/Scrum",
        "level": "Expert",
        "desc": "Sprint ceremonies, backlog refinement, story points, and velocity"
      },
      {
        "name": "User Stories",
        "level": "Expert",
        "desc": "Authoring acceptance criteria, user personas, and edge case definitions"
      },
      {
        "name": "Market Research",
        "level": "Intermediate",
        "desc": "Competitive analysis, user interviews, TAM calculation, and surveys"
      },
      {
        "name": "Product Analytics",
        "level": "Intermediate",
        "desc": "Tracking feature adoption, DAU/MAU ratios, and drop-off rates"
      },
      {
        "name": "Communication",
        "level": "Expert",
        "desc": "Cross-functional alignment across engineers, designers, and executives"
      },
      {
        "name": "Wireframing",
        "level": "Intermediate",
        "desc": "Rapid paper and Figma wireframing to illustrate UX concepts"
      },
      {
        "name": "SQL",
        "level": "Beginner",
        "desc": "Self-service querying of user and transaction metrics"
      }
    ],
    "roles": [
      "Junior Product Manager",
      "Product Manager",
      "Senior Product Manager",
      "Lead Product Manager",
      "Principal Product Manager / Engineering Manager"
    ],
    "salaryRange": "₹8L – ₹30L per annum (India)",
    "avgSalary": "₹14.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Product Roadmap foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Agile/Scrum and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "User Stories & Market Research implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Complete Product Requirement Document (PRD) & Prototype for an AI Study Planner with RICE scoring"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Jira",
      "Figma",
      "Notion",
      "Mixpanel",
      "Linear",
      "Miro",
      "Confluence"
    ],
    "certifications": [
      "Industry Standard Product Manager Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Complete Product Requirement Document (PRD) & Prototype for an AI Study Planner with RICE scoring",
      "Go-To-Market & Growth Strategy Case Study for a B2B SaaS Workflow Tool"
    ],
    "interview_topics": [
      "Product sense: Designing a product for a specific niche",
      "Prioritization frameworks (RICE, MoSCoW, Kano Model)",
      "Metrics: Defining North Star and counter-metrics",
      "Execution: Handling engineering delays and scope trade-offs",
      "Root cause analysis for dropped engagement"
    ]
  },
  {
    "slug": "project-coordinator",
    "title": "Project Coordinator",
    "category": "Business and Product",
    "icon": "🗓️",
    "demand": "🔥 High",
    "tagline": "Organize schedules, track milestones, eliminate blockers, and ensure timely project delivery.",
    "overview": "Project Coordinators facilitate smooth project execution by organizing schedules, tracking deliverables, documenting risks, facilitating team communication, and managing administrative sprint artifacts.",
    "skills": [
      "Project Scheduling",
      "Jira",
      "Agile/Scrum",
      "Risk Management",
      "Excel"
    ],
    "skillsDetailed": [
      {
        "name": "Project Scheduling",
        "level": "Expert",
        "desc": "Milestone planning, dependency tracking, Gantt charts, and deadlines"
      },
      {
        "name": "Jira",
        "level": "Expert",
        "desc": "Sprint boards, issue assignments, epic tracking, and workflow transitions"
      },
      {
        "name": "Agile/Scrum",
        "level": "Intermediate",
        "desc": "Standup facilitation, sprint reviews, retrospectives, and backlog grooming"
      },
      {
        "name": "Risk Management",
        "level": "Intermediate",
        "desc": "Identifying delivery risks, documenting contingencies, and escalating blockers"
      },
      {
        "name": "Excel",
        "level": "Expert",
        "desc": "Budget tracking, resource allocation tables, and project status sheets"
      },
      {
        "name": "Communication",
        "level": "Expert",
        "desc": "Clear meeting minutes, stakeholder status updates, and action item logs"
      },
      {
        "name": "Confluence",
        "level": "Intermediate",
        "desc": "Maintaining team wikis, project charters, and documentation"
      },
      {
        "name": "Asana",
        "level": "Intermediate",
        "desc": "Task delegation, workflow templates, and milestone management"
      }
    ],
    "roles": [
      "Junior Project Coordinator",
      "Project Coordinator",
      "Senior Project Coordinator",
      "Lead Project Coordinator",
      "Principal Project Coordinator / Engineering Manager"
    ],
    "salaryRange": "₹4.2L – ₹14L per annum (India)",
    "avgSalary": "₹6.8L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Project Scheduling foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Jira and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Agile/Scrum & Risk Management implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: End-to-End Software Release Plan in Jira with Gantt schedules, risk register, and RACI matrix"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Jira",
      "Asana",
      "Trello",
      "Confluence",
      "Excel / Google Sheets",
      "Slack / MS Teams"
    ],
    "certifications": [
      "Industry Standard Project Coordinator Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "End-to-End Software Release Plan in Jira with Gantt schedules, risk register, and RACI matrix",
      "Sprint Coordination & Retrospective Documentation for a multi-disciplinary development team"
    ],
    "interview_topics": [
      "Agile vs Waterfall project life cycles",
      "Managing project constraints (Scope, Time, Cost triangle)",
      "Risk registers & mitigation planning",
      "Sprint velocity & burndown chart interpretation",
      "Handling scope creep during delivery"
    ]
  },
  {
    "slug": "sql-developer",
    "title": "SQL Developer",
    "category": "Database and Data Infrastructure",
    "icon": "💾",
    "demand": "🔥 High",
    "tagline": "Engineer high-performance relational database schemas, stored procedures, and complex queries.",
    "overview": "SQL Developers specialize in relational database design, query optimization, complex stored procedures, indexing strategies, and ETL data loading across enterprise SQL platforms.",
    "skills": [
      "SQL",
      "Database Design",
      "Query Optimization",
      "Stored Procedures",
      "PostgreSQL"
    ],
    "skillsDetailed": [
      {
        "name": "SQL",
        "level": "Expert",
        "desc": "Expert SQL: complex joins, subqueries, CTEs, window functions, and aggregations"
      },
      {
        "name": "Database Design",
        "level": "Expert",
        "desc": "Relational modeling, primary/foreign keys, normalization, and constraints"
      },
      {
        "name": "Query Optimization",
        "level": "Expert",
        "desc": "Analyzing EXPLAIN plans, creating indexes, eliminating cartesian products"
      },
      {
        "name": "Stored Procedures",
        "level": "Expert",
        "desc": "Authoring performant T-SQL or PL/pgSQL procedures, functions, and triggers"
      },
      {
        "name": "PostgreSQL",
        "level": "Expert",
        "desc": "Schema configuration, data types, JSONB operations, and vacuuming"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control for database migration scripts (Flyway/Liquibase)"
      },
      {
        "name": "Python",
        "level": "Intermediate",
        "desc": "Scripting automated data loads, CSV parsing, and database connections"
      },
      {
        "name": "ETL Pipelines",
        "level": "Intermediate",
        "desc": "Extracting, transforming, and loading large transactional datasets"
      }
    ],
    "roles": [
      "Junior SQL Developer",
      "SQL Developer",
      "Senior SQL Developer",
      "Lead SQL Developer",
      "Principal SQL Developer / Engineering Manager"
    ],
    "salaryRange": "₹4.8L – ₹16L per annum (India)",
    "avgSalary": "₹7.8L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "SQL foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Database Design and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Query Optimization & Stored Procedures implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Enterprise Inventory & Order Processing Database with normalized schemas, stored procedures, and triggers"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "PostgreSQL",
      "SQL Server / SSMS",
      "MySQL Workbench",
      "DBeaver",
      "Git",
      "Python"
    ],
    "certifications": [
      "Industry Standard SQL Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Enterprise Inventory & Order Processing Database with normalized schemas, stored procedures, and triggers",
      "Database Performance Tuning Case Study optimizing slow queries with indexing and CTE rewrites"
    ],
    "interview_topics": [
      "Clustered vs Non-Clustered Indexes & B-Trees",
      "Window functions (ROW_NUMBER, DENSE_RANK, LEAD/LAG)",
      "Query execution plans & table scans",
      "Transactions, ACID properties, and isolation levels",
      "Normalization (1NF to BCNF) vs intentional denormalization"
    ]
  },
  {
    "slug": "database-administrator",
    "title": "Database Administrator",
    "category": "Database and Data Infrastructure",
    "icon": "🗃️",
    "demand": "🔥 High",
    "tagline": "Safeguard database uptime, disaster recovery, security auditing, and server performance.",
    "overview": "Database Administrators (DBAs) install, configure, monitor, and safeguard enterprise database management systems, ensuring high availability, continuous backup, security access, and fast recovery.",
    "skills": [
      "SQL",
      "Database Administration",
      "Backup and Recovery",
      "Linux",
      "Performance Monitoring"
    ],
    "skillsDetailed": [
      {
        "name": "SQL",
        "level": "Expert",
        "desc": "Administrative SQL queries, permission grants, roles, and schema audits"
      },
      {
        "name": "Database Administration",
        "level": "Expert",
        "desc": "Installation, configuration, memory tuning, and storage management"
      },
      {
        "name": "Backup and Recovery",
        "level": "Expert",
        "desc": "Full, differential, WAL archiving, point-in-time recovery, and restore drills"
      },
      {
        "name": "Linux",
        "level": "Expert",
        "desc": "Server administration, disk mounting, file permissions, and process inspection"
      },
      {
        "name": "Performance Monitoring",
        "level": "Intermediate",
        "desc": "Monitoring IOPS, connection pools, deadlocks, and buffer cache hits"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control for administrative automation scripts"
      },
      {
        "name": "Bash",
        "level": "Intermediate",
        "desc": "Automating routine backups, rotation, and server health checks"
      },
      {
        "name": "Security Auditing",
        "level": "Intermediate",
        "desc": "Enforcing least privilege, firewall rules, and auditing login logs"
      }
    ],
    "roles": [
      "Junior Database Administrator",
      "Database Administrator",
      "Senior Database Administrator",
      "Lead Database Administrator",
      "Principal Database Administrator / Engineering Manager"
    ],
    "salaryRange": "₹5L – ₹18L per annum (India)",
    "avgSalary": "₹8.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "SQL foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Database Administration and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Backup and Recovery & Linux implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Automated Database Backup & Point-in-Time Disaster Recovery Lab with PostgreSQL and Bash"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "PostgreSQL",
      "MySQL",
      "SQL Server",
      "Linux",
      "Bash",
      "Prometheus / pgWatch"
    ],
    "certifications": [
      "Industry Standard Database Administrator Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Automated Database Backup & Point-in-Time Disaster Recovery Lab with PostgreSQL and Bash",
      "High-Availability Database Cluster with Master-Replica Streaming Replication and failover scripts"
    ],
    "interview_topics": [
      "Backup strategies (Full, Differential, Transaction Log) & point-in-time recovery",
      "Replication topologies (Primary-Replica, Master-Master)",
      "User permission auditing and database encryption (TDE)",
      "Diagnosing CPU/memory resource bottlenecks and deadlocks",
      "Database maintenance (VACUUM, re-indexing, statistics updates)"
    ]
  },
  {
    "slug": "data-warehouse-engineer",
    "title": "Data Warehouse Engineer",
    "category": "Database and Data Infrastructure",
    "icon": "🏢",
    "demand": "🔥 Very High",
    "tagline": "Design modern cloud data warehouses, columnar schemas, and enterprise analytics storage.",
    "overview": "Data Warehouse Engineers architect and manage large-scale analytical data repositories using modern cloud platforms like Snowflake, BigQuery, and Redshift, optimizing storage and query performance for BI.",
    "skills": [
      "Data Warehousing",
      "SQL",
      "dbt",
      "Data Modeling",
      "Python"
    ],
    "skillsDetailed": [
      {
        "name": "Data Warehousing",
        "level": "Expert",
        "desc": "Star/Snowflake schema design, surrogate keys, fact/dimension tables"
      },
      {
        "name": "SQL",
        "level": "Expert",
        "desc": "Advanced analytical SQL: window functions, complex joins, and aggregations"
      },
      {
        "name": "dbt",
        "level": "Intermediate",
        "desc": "Data build tool: Jinja templating, incremental models, tests, and documentation"
      },
      {
        "name": "Data Modeling",
        "level": "Expert",
        "desc": "Kimball dimensional modeling methodology and schema normalization"
      },
      {
        "name": "Python",
        "level": "Intermediate",
        "desc": "Scripting data ingestion pipelines and API integrations"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control for analytical models and dbt repositories"
      },
      {
        "name": "Snowflake",
        "level": "Intermediate",
        "desc": "Virtual warehouses, stages, clustering keys, and time travel"
      },
      {
        "name": "Apache Airflow",
        "level": "Beginner",
        "desc": "Orchestrating warehouse ELT batch workflows"
      }
    ],
    "roles": [
      "Junior Data Warehouse Engineer",
      "Data Warehouse Engineer",
      "Senior Data Warehouse Engineer",
      "Lead Data Warehouse Engineer",
      "Principal Data Warehouse Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6L – ₹22L per annum (India)",
    "avgSalary": "₹10.2L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Data Warehousing foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "SQL and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "dbt & Data Modeling implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Modern Cloud Data Warehouse on Snowflake or BigQuery modeled with dbt and star schema"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Snowflake",
      "Google BigQuery",
      "dbt (data build tool)",
      "SQL",
      "Python",
      "Airflow",
      "Git"
    ],
    "certifications": [
      "Industry Standard Data Warehouse Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Modern Cloud Data Warehouse on Snowflake or BigQuery modeled with dbt and star schema",
      "Automated ELT Pipeline transforming raw transactional JSON events into dimensional analytics marts"
    ],
    "interview_topics": [
      "OLTP vs OLAP architectures",
      "Dimensional modeling (Fact tables vs Dimension tables)",
      "Slowly Changing Dimensions (SCD Type 1, 2, 3)",
      "dbt models, tests, and documentation",
      "Columnar storage compression & micro-partitioning"
    ]
  },
  {
    "slug": "ui-designer",
    "title": "UI Designer",
    "category": "UI/UX and Design",
    "icon": "🖌️",
    "demand": "🔥 High",
    "tagline": "Design beautiful, cohesive design systems, micro-interactions, and visual layouts.",
    "overview": "User Interface (UI) Designers craft aesthetically compelling, polished visual layouts, design tokens, iconography, and responsive design systems that make digital products delighting and intuitive.",
    "skills": [
      "Figma",
      "Visual Design",
      "Design Systems",
      "Typography",
      "Color Theory"
    ],
    "skillsDetailed": [
      {
        "name": "Figma",
        "level": "Expert",
        "desc": "Auto-layout, components, variants, variables, prototyping, and smart animate"
      },
      {
        "name": "Visual Design",
        "level": "Expert",
        "desc": "Hierarchy, visual balance, whitespace, contrast, and layout composition"
      },
      {
        "name": "Design Systems",
        "level": "Expert",
        "desc": "Atomic design principles, reusable component libraries, and style guides"
      },
      {
        "name": "Typography",
        "level": "Intermediate",
        "desc": "Font pairing, line height, letter spacing, and responsive text scaling"
      },
      {
        "name": "Color Theory",
        "level": "Intermediate",
        "desc": "Palette generation, accessibility contrast (WCAG AA/AAA), and dark modes"
      },
      {
        "name": "Responsive UI",
        "level": "Expert",
        "desc": "Grid systems, flex layouts, mobile/tablet/desktop breakpoint adaptations"
      },
      {
        "name": "Prototyping",
        "level": "Intermediate",
        "desc": "Building interactive click-through prototypes with realistic state changes"
      },
      {
        "name": "Micro-interactions",
        "level": "Intermediate",
        "desc": "Designing hover, active, loading, and success micro-animations"
      }
    ],
    "roles": [
      "Junior UI Designer",
      "UI Designer",
      "Senior UI Designer",
      "Lead UI Designer",
      "Principal UI Designer / Engineering Manager"
    ],
    "salaryRange": "₹4.5L – ₹16L per annum (India)",
    "avgSalary": "₹7.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Figma foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Visual Design and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Design Systems & Typography implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Complete SaaS Design System in Figma with atomic components, variants, and light/dark modes"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Figma",
      "Adobe Illustrator",
      "Photoshop",
      "Principle",
      "Tokens Studio",
      "Whimsical"
    ],
    "certifications": [
      "Industry Standard UI Designer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Complete SaaS Design System in Figma with atomic components, variants, and light/dark modes",
      "High-Fidelity Mobile Banking UI Prototype with micro-interactions and developer specs"
    ],
    "interview_topics": [
      "Color theory (contrast ratios, 60-30-10 rule)",
      "Typography hierarchy & modular scales",
      "Design system tokens & component variants in Figma",
      "Micro-interactions and animation curves",
      "Developer handoff & design specification"
    ]
  },
  {
    "slug": "ux-designer",
    "title": "UX Designer",
    "category": "UI/UX and Design",
    "icon": "💡",
    "demand": "🔥 High",
    "tagline": "Uncover user needs, conduct research, map journeys, and architect intuitive product workflows.",
    "overview": "User Experience (UX) Designers research human behaviors, define information architecture, build wireframes, and run usability tests to solve user problems and create frictionless product flows.",
    "skills": [
      "User Research",
      "Wireframing",
      "Usability Testing",
      "Information Architecture",
      "User Journey Mapping"
    ],
    "skillsDetailed": [
      {
        "name": "User Research",
        "level": "Expert",
        "desc": "User interviews, persona creation, survey design, and observational research"
      },
      {
        "name": "Wireframing",
        "level": "Expert",
        "desc": "Low and mid-fidelity wireframing to establish workflow and hierarchy"
      },
      {
        "name": "Usability Testing",
        "level": "Expert",
        "desc": "Task-based user testing, prototype evaluation, and heuristic reviews"
      },
      {
        "name": "Information Architecture",
        "level": "Intermediate",
        "desc": "Sitemaps, navigation hierarchies, content taxonomies, and user flows"
      },
      {
        "name": "User Journey Mapping",
        "level": "Expert",
        "desc": "Mapping customer emotions, touchpoints, pain points, and opportunities"
      },
      {
        "name": "Figma",
        "level": "Intermediate",
        "desc": "Creating clickable wireframes and research visual assets"
      },
      {
        "name": "Prototyping",
        "level": "Intermediate",
        "desc": "Rapid interactive prototypes for user testing sessions"
      },
      {
        "name": "Visual Design",
        "level": "Beginner",
        "desc": "Basic visual styling to communicate layout intent"
      }
    ],
    "roles": [
      "Junior UX Designer",
      "UX Designer",
      "Senior UX Designer",
      "Lead UX Designer",
      "Principal UX Designer / Engineering Manager"
    ],
    "salaryRange": "₹5L – ₹18L per annum (India)",
    "avgSalary": "₹8.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "User Research foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Wireframing and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Usability Testing & Information Architecture implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Comprehensive UX Case Study: Redesigning Healthcare Appointment Booking with User Research & Testing"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Figma",
      "Miro / FigJam",
      "Maze",
      "UserTesting",
      "Notion",
      "OptimalSort"
    ],
    "certifications": [
      "Industry Standard UX Designer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Comprehensive UX Case Study: Redesigning Healthcare Appointment Booking with User Research & Testing",
      "Information Architecture & User Journey Map for a Complex Multi-Role SaaS Platform"
    ],
    "interview_topics": [
      "Design Thinking methodology (Empathize, Define, Ideate, Prototype, Test)",
      "Conducting user interviews without leading questions",
      "Information architecture (Card sorting, tree testing)",
      "Usability testing & SUS (System Usability Scale) scoring",
      "Jakob Nielsen's 10 Usability Heuristics"
    ]
  },
  {
    "slug": "ui-ux-designer",
    "title": "UI/UX Designer",
    "category": "UI/UX and Design",
    "icon": "🎭",
    "demand": "🔥 Extremely High",
    "tagline": "Blend empathetic user research with pixel-perfect visual execution for complete product experiences.",
    "overview": "UI/UX Designers manage the complete user experience lifecycle, conducting empathetic user research, creating wireframes, building design systems, and crafting polished, interactive digital interfaces.",
    "skills": [
      "Figma",
      "User Research",
      "Visual Design",
      "Wireframing",
      "Design Systems"
    ],
    "skillsDetailed": [
      {
        "name": "Figma",
        "level": "Expert",
        "desc": "Advanced components, auto-layout, design tokens, interactive prototyping"
      },
      {
        "name": "User Research",
        "level": "Expert",
        "desc": "User interviews, persona synthesis, journey mapping, and usability testing"
      },
      {
        "name": "Visual Design",
        "level": "Expert",
        "desc": "Layout grids, typography, color harmony, iconography, and visual hierarchy"
      },
      {
        "name": "Wireframing",
        "level": "Expert",
        "desc": "Translating user requirements into low and high-fidelity screen wireframes"
      },
      {
        "name": "Design Systems",
        "level": "Intermediate",
        "desc": "Component architecture, style guidelines, and design-developer tokens"
      },
      {
        "name": "Responsive UI",
        "level": "Expert",
        "desc": "Adapting UI seamlessly across desktop, tablet, and mobile displays"
      },
      {
        "name": "Prototyping",
        "level": "Intermediate",
        "desc": "Creating realistic micro-interactions and animated user flows"
      },
      {
        "name": "Usability Testing",
        "level": "Intermediate",
        "desc": "Conducting test sessions, recording friction points, and iterating"
      }
    ],
    "roles": [
      "Junior UI/UX Designer",
      "UI/UX Designer",
      "Senior UI/UX Designer",
      "Lead UI/UX Designer",
      "Principal UI/UX Designer / Engineering Manager"
    ],
    "salaryRange": "₹5L – ₹18L per annum (India)",
    "avgSalary": "₹8.2L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Figma foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "User Research and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Visual Design & Wireframing implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: End-to-End Mobile App Case Study: From Problem Discovery to Interactive High-Fidelity Prototype"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Figma",
      "FigJam",
      "Miro",
      "Adobe XD / Illustrator",
      "Notion",
      "Maze"
    ],
    "certifications": [
      "Industry Standard UI/UX Designer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "End-to-End Mobile App Case Study: From Problem Discovery to Interactive High-Fidelity Prototype",
      "B2B SaaS Dashboard Redesign combining User Journey Maps with a modern Figma Design System"
    ],
    "interview_topics": [
      "End-to-end design process walkthrough on portfolio project",
      "Balancing user needs vs business constraints",
      "Responsive design patterns across mobile and web",
      "Design system governance and maintenance",
      "Accessibility audits (WCAG guidelines)"
    ]
  },
  {
    "slug": "blockchain-developer",
    "title": "Blockchain Developer",
    "category": "Emerging Technologies",
    "icon": "⛓️",
    "demand": "🔥 High",
    "tagline": "Write secure smart contracts, decentralized applications (dApps), and cryptographic protocols.",
    "overview": "Blockchain Developers engineer decentralized applications, write and audit Ethereum smart contracts using Solidity, and integrate Web3 interfaces with distributed ledger networks.",
    "skills": [
      "Solidity",
      "Smart Contracts",
      "JavaScript",
      "Cryptography",
      "Git"
    ],
    "skillsDetailed": [
      {
        "name": "Solidity",
        "level": "Expert",
        "desc": "Writing smart contracts, modifiers, mappings, events, and gas optimization"
      },
      {
        "name": "Smart Contracts",
        "level": "Expert",
        "desc": "ERC-20, ERC-721, security patterns, reentrancy guards, and access control"
      },
      {
        "name": "JavaScript",
        "level": "Expert",
        "desc": "Modern JS, async/await, and interaction with blockchain nodes"
      },
      {
        "name": "Cryptography",
        "level": "Intermediate",
        "desc": "Elliptic curve cryptography, Merkle trees, SHA-256, and digital signatures"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control for smart contract repositories and deployments"
      },
      {
        "name": "REST APIs",
        "level": "Intermediate",
        "desc": "Connecting backend services with blockchain RPC endpoints"
      },
      {
        "name": "Hardhat",
        "level": "Intermediate",
        "desc": "Testing, compiling, debugging, and deploying Ethereum smart contracts"
      },
      {
        "name": "Web3.js",
        "level": "Intermediate",
        "desc": "Connecting browser wallets (MetaMask) and executing contract methods"
      }
    ],
    "roles": [
      "Junior Blockchain Developer",
      "Blockchain Developer",
      "Senior Blockchain Developer",
      "Lead Blockchain Developer",
      "Principal Blockchain Developer / Engineering Manager"
    ],
    "salaryRange": "₹6L – ₹24L per annum (India)",
    "avgSalary": "₹11.0L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Solidity foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Smart Contracts and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "JavaScript & Cryptography implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Decentralized Crowdfunding Platform with Solidity smart contracts, Hardhat tests, and React frontend"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Solidity",
      "Hardhat",
      "Remix IDE",
      "Ethers.js / Web3.js",
      "Metamask",
      "Git"
    ],
    "certifications": [
      "Industry Standard Blockchain Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Decentralized Crowdfunding Platform with Solidity smart contracts, Hardhat tests, and React frontend",
      "NFT Minting & Staking Protocol adhering to ERC-721 standards with automated unit tests"
    ],
    "interview_topics": [
      "EVM architecture & gas optimization",
      "Reentrancy attacks and smart contract security",
      "ERC-20 vs ERC-721 token standards",
      "Consensus mechanisms (Proof of Work vs Proof of Stake)",
      "Hashing, Merkle Trees, and public/private key cryptography"
    ]
  },
  {
    "slug": "iot-developer",
    "title": "IoT Developer",
    "category": "Emerging Technologies",
    "icon": "📡",
    "demand": "🔥 High",
    "tagline": "Connect embedded microcontrollers, sensors, and telemetry streams to modern cloud systems.",
    "overview": "Internet of Things (IoT) Developers build connected device firmware, integrate analog/digital sensors, establish low-power wireless communication, and channel telemetry into cloud processing pipelines.",
    "skills": [
      "Embedded C/C++",
      "Python",
      "MQTT",
      "Linux",
      "Sensor Integration"
    ],
    "skillsDetailed": [
      {
        "name": "Embedded C/C++",
        "level": "Expert",
        "desc": "Microcontroller programming, pointer math, memory limits, and interrupts"
      },
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Raspberry Pi scripts, telemetry processing, and serial communication"
      },
      {
        "name": "MQTT",
        "level": "Expert",
        "desc": "Pub/sub messaging, QoS levels, brokers, and lightweight payloads"
      },
      {
        "name": "Linux",
        "level": "Intermediate",
        "desc": "Embedded Linux, systemd services, GPIO pin controls, and networking"
      },
      {
        "name": "Sensor Integration",
        "level": "Expert",
        "desc": "Interfacing with I2C, SPI, UART temperature, humidity, and motion sensors"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control for firmware and gateway scripts"
      },
      {
        "name": "Networking",
        "level": "Intermediate",
        "desc": "TCP/IP, Wi-Fi, Bluetooth Low Energy (BLE), and Zigbee concepts"
      },
      {
        "name": "REST APIs",
        "level": "Intermediate",
        "desc": "Sending telemetry packets to cloud webhooks and endpoints"
      }
    ],
    "roles": [
      "Junior IoT Developer",
      "IoT Developer",
      "Senior IoT Developer",
      "Lead IoT Developer",
      "Principal IoT Developer / Engineering Manager"
    ],
    "salaryRange": "₹4.8L – ₹16L per annum (India)",
    "avgSalary": "₹7.8L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "Embedded C/C++ foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "Python and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "MQTT & Linux implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Smart Environmental Monitoring Station with ESP32, DHT22 sensors, MQTT, and Grafana dashboard"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "Raspberry Pi",
      "ESP32 / Arduino",
      "MQTT (Mosquitto)",
      "VS Code / PlatformIO",
      "Python",
      "Linux"
    ],
    "certifications": [
      "Industry Standard IoT Developer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Smart Environmental Monitoring Station with ESP32, DHT22 sensors, MQTT, and Grafana dashboard",
      "Automated RFID Access Control & Telemetry Gateway using Raspberry Pi, Python, and SQLite"
    ],
    "interview_topics": [
      "MQTT vs HTTP/REST for constrained devices",
      "I2C, SPI, and UART communication protocols",
      "Power management & sleep modes in microcontrollers",
      "Sensor calibration & ADC conversions",
      "Edge computing vs Cloud telemetry processing"
    ]
  },
  {
    "slug": "robotics-software-engineer",
    "title": "Robotics Software Engineer",
    "category": "Emerging Technologies",
    "icon": "🦾",
    "demand": "🔥 High",
    "tagline": "Develop autonomous navigation, motion planning, and kinematics software for robotic systems.",
    "overview": "Robotics Software Engineers design and implement autonomous navigation, sensor fusion, path planning algorithms, and motor actuation controls using ROS/ROS2, C++, and Linux.",
    "skills": [
      "ROS/ROS2",
      "C++",
      "Python",
      "Linux",
      "Kinematics"
    ],
    "skillsDetailed": [
      {
        "name": "ROS/ROS2",
        "level": "Expert",
        "desc": "Nodes, topics, publishers, subscribers, TF transformations, and launch files"
      },
      {
        "name": "C++",
        "level": "Expert",
        "desc": "Modern C++, memory management, pointers, STL, and real-time computation"
      },
      {
        "name": "Python",
        "level": "Expert",
        "desc": "Rapid prototyping of robotics nodes, data math, and scripting"
      },
      {
        "name": "Linux",
        "level": "Expert",
        "desc": "Ubuntu, bash, process priority, serial ports, and environment variables"
      },
      {
        "name": "Kinematics",
        "level": "Intermediate",
        "desc": "Coordinate frames, rotation matrices, transformation trees, and odometry"
      },
      {
        "name": "Git",
        "level": "Intermediate",
        "desc": "Version control for robotics software packages and workspace configs"
      },
      {
        "name": "Simulation",
        "level": "Intermediate",
        "desc": "Gazebo physics simulation, URDF models, and sensor emulation"
      },
      {
        "name": "Computer Vision",
        "level": "Intermediate",
        "desc": "OpenCV for camera feed processing and visual fiducial markers"
      }
    ],
    "roles": [
      "Junior Robotics Software Engineer",
      "Robotics Software Engineer",
      "Senior Robotics Software Engineer",
      "Lead Robotics Software Engineer",
      "Principal Robotics Software Engineer / Engineering Manager"
    ],
    "salaryRange": "₹6L – ₹22L per annum (India)",
    "avgSalary": "₹10.5L",
    "roadmap": [
      {
        "month": "Month 1–2",
        "focus": "ROS/ROS2 foundations & technical core concepts"
      },
      {
        "month": "Month 3–4",
        "focus": "C++ and practical data/workflow integration"
      },
      {
        "month": "Month 5–6",
        "focus": "Python & Linux implementation and best practices"
      },
      {
        "month": "Month 7–8",
        "focus": "Build Capstone Project: Autonomous Mobile Robot Navigation in Gazebo with ROS2, SLAM, and Nav2 path planning"
      },
      {
        "month": "Month 9–10",
        "focus": "Testing, automation, containerization & deployment"
      },
      {
        "month": "Month 11–12",
        "focus": "Portfolio presentation, GitHub cleanup & interview prep"
      }
    ],
    "tools": [
      "ROS2",
      "Gazebo Simulator",
      "C++",
      "Python",
      "Linux (Ubuntu)",
      "Git"
    ],
    "certifications": [
      "Industry Standard Robotics Software Engineer Certification",
      "Cloud & Agile Practitioner Credential"
    ],
    "companies": [
      "Google",
      "Amazon",
      "Microsoft",
      "TCS",
      "Infosys",
      "Wipro",
      "Accenture",
      "Startups"
    ],
    "recommended_projects": [
      "Autonomous Mobile Robot Navigation in Gazebo with ROS2, SLAM, and Nav2 path planning",
      "Robotic Arm Inverse Kinematics & Pick-and-Place Simulator with MoveIt and C++"
    ],
    "interview_topics": [
      "ROS/ROS2 nodes, topics, services, and actions",
      "Forward & Inverse Kinematics",
      "Kalman Filtering & sensor fusion (IMU + Odometry)",
      "Path planning algorithms (A*, Dijkstra, RRT)",
      "Coordinate frames & TF tree transformations"
    ]
  }
];

export const CAREER_CATEGORIES = [
  "All",
  "Software Development",
  "Data Science and Artificial Intelligence",
  "Cloud and DevOps",
  "Cybersecurity",
  "Software Testing",
  "Business and Product",
  "Database and Data Infrastructure",
  "UI/UX and Design",
  "Emerging Technologies"
];

export const ALL_SUPPORTED_ROLES = CAREER_PATHS.map((c) => c.title);

export const CATEGORIZED_ROLES = CAREER_CATEGORIES
  .filter((c) => c !== 'All')
  .map((cat) => ({
    category: cat,
    roles: CAREER_PATHS.filter((p) => p.category === cat).map((p) => p.title),
  }));
