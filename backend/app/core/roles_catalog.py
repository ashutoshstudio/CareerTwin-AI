"""
Centralized Roles Catalog for CareerTwin AI.
Single source of truth for all 42 supported job profiles across 9 technology categories.
Provides standard benchmarks, competencies, demand levels, and educational guidance.
"""
from typing import Any, Dict, List, Optional

ROLES_DATA: List[Dict[str, Any]] = [
    {
        "id": "python-developer",
        "name": "Python Developer",
        "category": "Software Development",
        "tagline": "Build scalable backend APIs, web applications, and asynchronous microservices.",
        "demand_level": "Very High",
        "description": "Python Developers architect and develop robust server-side logic, design relational databases, integrate third-party services, and build high-performance APIs using FastAPI, Django, and modern tooling.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "B.Sc Computer Science",
            "MCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95L \u2013 \u20b918L per annum (India)",
        "avg_salary": "\u20b98.5L",
        "tools": [
            "VS Code",
            "PyCharm",
            "Git",
            "Docker",
            "Postman",
            "PostgreSQL",
            "Redis"
        ],
        "interview_topics": [
            "Python memory management & GIL",
            "Async/await event loops",
            "REST API architecture",
            "SQL indexing & query optimization",
            "pytest & mock testing"
        ],
        "recommended_projects": [
            "Production-ready RESTful CRUD API with FastAPI, SQLAlchemy ORM, and JWT authentication",
            "Asynchronous task queue worker with Redis, Celery, and automated pytest coverage"
        ],
        "learning_resources": [
            {
                "title": "Official Python 3 Documentation",
                "url": "https://docs.python.org/3/tutorial/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "FastAPI Official Tutorial",
                "url": "https://fastapi.tiangolo.com/tutorial/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Python",
                "required_level": 4,
                "description": "Core language features, OOP, data structures, and asynchronous programming",
                "weight": 1.0
            },
            {
                "name": "SQL",
                "required_level": 3,
                "description": "Database design, queries, and ORM integration (SQLAlchemy/Django ORM)",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 4,
                "description": "Branching workflows, pull requests, rebase, and version control hygiene",
                "weight": 0.8
            },
            {
                "name": "FastAPI",
                "required_level": 3,
                "description": "RESTful API development, Pydantic validation, and dependency injection",
                "weight": 0.85
            },
            {
                "name": "HTML",
                "required_level": 3,
                "description": "Semantic markup and web page structure",
                "weight": 0.75
            },
            {
                "name": "CSS",
                "required_level": 3,
                "description": "Responsive styling, modern CSS layouts, and UI frameworks",
                "weight": 0.75
            },
            {
                "name": "JavaScript",
                "required_level": 3,
                "description": "Frontend scripting and asynchronous DOM interaction",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Docker",
                "required_level": 3,
                "description": "Containerizing backend services and docker-compose configurations"
            },
            {
                "name": "Linux",
                "required_level": 3,
                "description": "Shell commands, file system navigation, and process management"
            },
            {
                "name": "CI/CD",
                "required_level": 3,
                "description": "Automated testing pipelines and continuous integration"
            },
            {
                "name": "Communication",
                "required_level": 3,
                "description": "Collaborative code reviews and technical documentation"
            },
            {
                "name": "Problem Solving",
                "required_level": 3,
                "description": "Algorithmic thinking and debugging systematic bugs"
            }
        ],
        "soft_skills": [
            {
                "name": "Problem Solving",
                "description": "Structured analytical problem decomposition and debugging"
            },
            {
                "name": "Communication",
                "description": "Clear technical documentation and cross-functional team discussions"
            }
        ]
    },
    {
        "id": "java-developer",
        "name": "Java Developer",
        "category": "Software Development",
        "tagline": "Engineer enterprise-grade microservices and secure, high-throughput backend systems.",
        "demand_level": "Very High",
        "description": "Java Developers design, implement, and maintain enterprise backend systems, scalable cloud microservices, and secure transaction workflows using Java, Spring Boot, and relational databases.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95.5L \u2013 \u20b919L per annum (India)",
        "avg_salary": "\u20b99.0L",
        "tools": [
            "IntelliJ IDEA",
            "Maven",
            "Git",
            "Docker",
            "Postman",
            "MySQL",
            "Spring Tool Suite"
        ],
        "interview_topics": [
            "Java Memory Model & Garbage Collection",
            "Spring Bean Lifecycle & Dependency Injection",
            "JPA Entity States & N+1 Queries",
            "Multithreading & Concurrency",
            "JUnit & Mockito Testing"
        ],
        "recommended_projects": [
            "Enterprise E-Commerce Microservice with Spring Boot, Spring Data JPA, and PostgreSQL",
            "Secure Banking Transaction API with JWT Auth, Role-Based Access Control, and JUnit 5 tests"
        ],
        "learning_resources": [
            {
                "title": "Spring Boot Official Guides",
                "url": "https://spring.io/guides",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Baeldung Java Tutorials",
                "url": "https://www.baeldung.com/",
                "type": "Tutorial",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Java",
                "required_level": 4,
                "description": "Core Java, OOP, collections, multithreading, and Stream API",
                "weight": 1.0
            },
            {
                "name": "Spring Boot",
                "required_level": 4,
                "description": "Spring MVC, Spring Data JPA, dependency injection, and REST endpoints",
                "weight": 0.9
            },
            {
                "name": "SQL",
                "required_level": 3,
                "description": "Relational schema design, complex joins, and query optimization",
                "weight": 0.8
            },
            {
                "name": "REST APIs",
                "required_level": 4,
                "description": "Designing resilient RESTful microservices and JSON data interchange",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control, GitFlow branching, and repository collaboration",
                "weight": 0.75
            },
            {
                "name": "Data Structures",
                "required_level": 3,
                "description": "Core data structures, algorithms, and computational complexity",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Hibernate",
                "required_level": 3,
                "description": "ORM mapping, entity lifecycles, and caching strategies"
            },
            {
                "name": "Maven",
                "required_level": 3,
                "description": "Dependency management, build lifecycle, and multi-module configurations"
            },
            {
                "name": "JUnit",
                "required_level": 3,
                "description": "Unit testing, Mockito mocks, and automated test suites"
            },
            {
                "name": "Docker",
                "required_level": 2,
                "description": "Containerizing Spring Boot applications for cloud deployment"
            },
            {
                "name": "Microservices",
                "required_level": 3,
                "description": "Service discovery, API gateways, and distributed logging"
            }
        ],
        "soft_skills": [
            {
                "name": "Analytical Thinking",
                "description": "Methodical decomposition of enterprise business requirements"
            },
            {
                "name": "Team Collaboration",
                "description": "Working closely with QA, DevOps, and product owners"
            }
        ]
    },
    {
        "id": "javascript-developer",
        "name": "JavaScript Developer",
        "category": "Software Development",
        "tagline": "Build modern web applications and performant event-driven runtime services.",
        "demand_level": "Very High",
        "description": "JavaScript Developers build interactive client applications and asynchronous server runtimes using modern ECMAScript, Node.js, and web standards across the entire browser-to-server lifecycle.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "B.Sc Computer Science",
            "MCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.8L \u2013 \u20b916L per annum (India)",
        "avg_salary": "\u20b98.0L",
        "tools": [
            "VS Code",
            "Node.js",
            "npm/yarn",
            "Git",
            "Chrome DevTools",
            "Postman"
        ],
        "interview_topics": [
            "Event loop & call stack",
            "Closures & lexical scope",
            "Promises & Async/Await",
            "Prototypes & ES6 Classes",
            "TypeScript Generics"
        ],
        "recommended_projects": [
            "Real-Time Chat & Collaboration App with Node.js, Express, and WebSocket",
            "Modern Task Management Dashboard with TypeScript, REST APIs, and Jest unit tests"
        ],
        "learning_resources": [
            {
                "title": "MDN Web Docs JavaScript Guide",
                "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "JavaScript.info",
                "url": "https://javascript.info/",
                "type": "Tutorial",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "JavaScript",
                "required_level": 4,
                "description": "ES6+, event loop, closures, promises, prototypes, and asynchronous execution",
                "weight": 1.0
            },
            {
                "name": "TypeScript",
                "required_level": 3,
                "description": "Static typing, generics, interfaces, and compile-time safety",
                "weight": 0.85
            },
            {
                "name": "Node.js",
                "required_level": 3,
                "description": "Event-driven runtime, core modules, file system, and streams",
                "weight": 0.85
            },
            {
                "name": "HTML5",
                "required_level": 4,
                "description": "Semantic elements, accessibility standards, and modern DOM structure",
                "weight": 0.75
            },
            {
                "name": "CSS3",
                "required_level": 3,
                "description": "Flexbox, CSS Grid, media queries, and responsive web layouts",
                "weight": 0.75
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Source control, branching strategies, and collaboration workflows",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Express.js",
                "required_level": 3,
                "description": "RESTful routing, middleware pipelines, and error handling"
            },
            {
                "name": "REST APIs",
                "required_level": 3,
                "description": "HTTP protocols, payload formatting, and status code standards"
            },
            {
                "name": "Webpack",
                "required_level": 2,
                "description": "Bundling, code splitting, and asset compilation pipelines"
            },
            {
                "name": "Jest",
                "required_level": 3,
                "description": "Unit testing, mocking asynchronous calls, and coverage analysis"
            },
            {
                "name": "MongoDB",
                "required_level": 2,
                "description": "NoSQL document schemas, CRUD operations, and indexing"
            }
        ],
        "soft_skills": [
            {
                "name": "Problem Solving",
                "description": "Debugging browser-specific and runtime anomalies systematically"
            },
            {
                "name": "Adaptability",
                "description": "Quickly learning evolving frontend and backend JavaScript ecosystems"
            }
        ]
    },
    {
        "id": "frontend-developer",
        "name": "Frontend Developer",
        "category": "Software Development",
        "tagline": "Craft responsive, accessible, and delighting user interfaces with modern web frameworks.",
        "demand_level": "Very High",
        "description": "Frontend Developers translate design mockups into fast, accessible, interactive web applications using React, JavaScript, CSS, and modern web optimization practices.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "B.Sc Computer Science",
            "MCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95L \u2013 \u20b917L per annum (India)",
        "avg_salary": "\u20b98.2L",
        "tools": [
            "VS Code",
            "Chrome DevTools",
            "Git",
            "Figma",
            "npm",
            "Vite",
            "Tailwind CSS"
        ],
        "interview_topics": [
            "React reconciliation & Virtual DOM",
            "Hooks lifecycle & dependency arrays",
            "CSS Specificity & Flexbox/Grid",
            "Web Accessibility (WCAG)",
            "Core Web Vitals & Performance"
        ],
        "recommended_projects": [
            "Interactive SaaS Analytics Dashboard with React, Tailwind CSS, and Recharts",
            "Accessible Multi-Step E-Commerce Checkout with Zustand state and client-side validation"
        ],
        "learning_resources": [
            {
                "title": "React Official Documentation",
                "url": "https://react.dev/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Tailwind CSS Documentation",
                "url": "https://tailwindcss.com/docs",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "React",
                "required_level": 4,
                "description": "Component architecture, hooks, state management, and virtual DOM",
                "weight": 1.0
            },
            {
                "name": "JavaScript",
                "required_level": 4,
                "description": "Modern ES6+, DOM manipulation, fetch API, and async programming",
                "weight": 0.95
            },
            {
                "name": "HTML5",
                "required_level": 4,
                "description": "Semantic web markup, accessibility (ARIA), and SEO best practices",
                "weight": 0.8
            },
            {
                "name": "CSS3",
                "required_level": 4,
                "description": "Modern CSS, Flexbox, Grid, transitions, and responsive design",
                "weight": 0.85
            },
            {
                "name": "Tailwind CSS",
                "required_level": 3,
                "description": "Utility-first styling, design token configuration, and responsive classes",
                "weight": 0.75
            },
            {
                "name": "Responsive Design",
                "required_level": 4,
                "description": "Mobile-first layouts, fluid typography, and breakpoint systems",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "TypeScript",
                "required_level": 3,
                "description": "Typed React components, props, state, and API response models"
            },
            {
                "name": "Redux",
                "required_level": 3,
                "description": "Centralized application state management and data flows"
            },
            {
                "name": "Web Performance",
                "required_level": 3,
                "description": "Lighthouse audits, code splitting, lazy loading, and asset optimization"
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control, feature branches, and pull requests"
            },
            {
                "name": "Next.js",
                "required_level": 2,
                "description": "Server-side rendering, static site generation, and routing"
            }
        ],
        "soft_skills": [
            {
                "name": "Attention to Detail",
                "description": "Pixel-perfect implementation of UX designs and animations"
            },
            {
                "name": "User Empathy",
                "description": "Designing intuitive interfaces that meet diverse user accessibility needs"
            }
        ]
    },
    {
        "id": "backend-developer",
        "name": "Backend Developer",
        "category": "Software Development",
        "tagline": "Build resilient server architectures, high-performance APIs, and data persistence layers.",
        "demand_level": "Very High",
        "description": "Backend Developers architect and maintain server-side business logic, database structures, integration APIs, and authentication pipelines that power web and mobile platforms.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95.5L \u2013 \u20b920L per annum (India)",
        "avg_salary": "\u20b99.2L",
        "tools": [
            "VS Code",
            "Postman",
            "Docker",
            "PostgreSQL",
            "Redis",
            "Git",
            "Linux"
        ],
        "interview_topics": [
            "RESTful API design & idempotency",
            "Database Normalization & ACID properties",
            "Caching patterns & cache invalidation",
            "Authentication (JWT vs OAuth2 vs Sessions)",
            "Horizontal scaling & load balancers"
        ],
        "recommended_projects": [
            "Scalable Microservices-Based Authentication & User Service with JWT, Redis cache, and PostgreSQL",
            "Multi-Tenant Billing and Invoicing Backend with Webhook processing and automated PDF generation"
        ],
        "learning_resources": [
            {
                "title": "Roadmap.sh Backend Developer",
                "url": "https://roadmap.sh/backend",
                "type": "Roadmap",
                "is_free": True
            },
            {
                "title": "PostgreSQL Tutorial",
                "url": "https://www.postgresqltutorial.com/",
                "type": "Tutorial",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Python",
                "required_level": 4,
                "description": "Server runtime environments, asynchronous I/O, and backend frameworks",
                "weight": 1.0
            },
            {
                "name": "SQL",
                "required_level": 4,
                "description": "Relational schema design, complex queries, transactions, and indexing",
                "weight": 0.9
            },
            {
                "name": "REST APIs",
                "required_level": 4,
                "description": "API architecture, HTTP semantics, payload validation, and versioning",
                "weight": 0.9
            },
            {
                "name": "Database Design",
                "required_level": 3,
                "description": "Normalization, indexing strategies, foreign keys, and migration scripts",
                "weight": 0.85
            },
            {
                "name": "System Design",
                "required_level": 3,
                "description": "Caching, horizontal scaling, load balancing, and failure isolation",
                "weight": 0.75
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Branching, PRs, and collaborative software development",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Docker",
                "required_level": 3,
                "description": "Containerizing backend services and environments"
            },
            {
                "name": "Redis",
                "required_level": 3,
                "description": "Caching layer, session store, and rate limiting"
            },
            {
                "name": "Microservices",
                "required_level": 2,
                "description": "Decoupled service architecture, message brokers, and event loops"
            },
            {
                "name": "CI/CD",
                "required_level": 2,
                "description": "Automated deployment pipelines and testing integration"
            },
            {
                "name": "Linux",
                "required_level": 3,
                "description": "Linux server management, process managers, and networking"
            }
        ],
        "soft_skills": [
            {
                "name": "Problem Solving",
                "description": "Diagnosing bottlenecks, edge cases, and unexpected runtime failures"
            },
            {
                "name": "Security Awareness",
                "description": "Preventing common web vulnerabilities (OWASP Top 10)"
            }
        ]
    },
    {
        "id": "full-stack-developer",
        "name": "Full Stack Developer",
        "category": "Software Development",
        "tagline": "Bridge client interfaces and scalable backend infrastructure seamlessly.",
        "demand_level": "Very High",
        "description": "Full Stack Developers work across the entire technology stack, designing intuitive user interfaces, implementing robust server APIs, and maintaining relational and NoSQL databases.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96L \u2013 \u20b922L per annum (India)",
        "avg_salary": "\u20b910.0L",
        "tools": [
            "VS Code",
            "Git",
            "Docker",
            "Postman",
            "MongoDB Compass",
            "Chrome DevTools"
        ],
        "interview_topics": [
            "Full-stack architecture & data flow",
            "CORS & Browser security policies",
            "Relational vs NoSQL database selection",
            "State synchronization across client & server",
            "Docker containerization & deployment"
        ],
        "recommended_projects": [
            "Full-Stack Project Collaboration Platform with React, Node.js, Express, and PostgreSQL",
            "Job Portal with Student Resume Uploads, Search Filters, and Application Tracker"
        ],
        "learning_resources": [
            {
                "title": "Full Stack Open",
                "url": "https://fullstackopen.com/en/",
                "type": "Course",
                "is_free": True
            },
            {
                "title": "FreeCodeCamp Full Stack Curriculum",
                "url": "https://www.freecodecamp.org/",
                "type": "Course",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "React",
                "required_level": 4,
                "description": "Component architecture, hooks, and client state management",
                "weight": 0.95
            },
            {
                "name": "Node.js",
                "required_level": 4,
                "description": "Server-side runtime, Express API endpoints, and middleware",
                "weight": 0.95
            },
            {
                "name": "JavaScript",
                "required_level": 4,
                "description": "ES6+, asynchronous patterns, and full-stack language fluency",
                "weight": 0.95
            },
            {
                "name": "SQL",
                "required_level": 3,
                "description": "Database design, queries, table joins, and migrations",
                "weight": 0.85
            },
            {
                "name": "REST APIs",
                "required_level": 4,
                "description": "End-to-end API specification, serialization, and authentication",
                "weight": 0.9
            },
            {
                "name": "Git",
                "required_level": 4,
                "description": "Repository management, branching, and team integration workflows",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "Docker",
                "required_level": 2,
                "description": "Containerized development workflows and service composition"
            },
            {
                "name": "MongoDB",
                "required_level": 3,
                "description": "NoSQL schemas, aggregation pipelines, and document storage"
            },
            {
                "name": "TypeScript",
                "required_level": 3,
                "description": "End-to-end type safety across client and server layers"
            },
            {
                "name": "Tailwind CSS",
                "required_level": 3,
                "description": "Rapid responsive UI development"
            },
            {
                "name": "CI/CD",
                "required_level": 2,
                "description": "Automated test runs and continuous deployment workflows"
            }
        ],
        "soft_skills": [
            {
                "name": "Time Management",
                "description": "Balancing frontend aesthetics with backend performance requirements"
            },
            {
                "name": "Full Lifecycle Thinking",
                "description": "Understanding requirements from user interaction to database persistence"
            }
        ]
    },
    {
        "id": "android-developer",
        "name": "Android Developer",
        "category": "Software Development",
        "tagline": "Build responsive, user-friendly native Android applications with Kotlin and modern Android SDK.",
        "demand_level": "High",
        "description": "Android Developers build native mobile applications for Android smartphones and tablets using Kotlin, Jetpack libraries, Material Design components, and RESTful web service integrations.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.8L \u2013 \u20b916L per annum (India)",
        "avg_salary": "\u20b97.8L",
        "tools": [
            "Android Studio",
            "Kotlin",
            "Gradle",
            "Git",
            "Postman",
            "AVD"
        ],
        "interview_topics": [
            "Activity & Fragment lifecycle",
            "ViewModel & LiveData / StateFlow",
            "Kotlin Coroutines & Flow",
            "Room DB migrations & DAOs",
            "Android permissions & Background workers"
        ],
        "recommended_projects": [
            "Native Expense & Budget Tracking App with Jetpack Compose, Room Database, and Coroutines",
            "News Reader App with Retrofit network caching, offline sync, and Material 3 UI"
        ],
        "learning_resources": [
            {
                "title": "Android Developers Official Guide",
                "url": "https://developer.android.com/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Kotlin Documentation",
                "url": "https://kotlinlang.org/docs/home.html",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Kotlin",
                "required_level": 4,
                "description": "Null safety, coroutines, extension functions, and modern Kotlin idioms",
                "weight": 1.0
            },
            {
                "name": "Android SDK",
                "required_level": 4,
                "description": "Activity and Fragment lifecycles, intents, services, and permissions",
                "weight": 0.95
            },
            {
                "name": "Jetpack Compose",
                "required_level": 3,
                "description": "Declarative UI components, state hoisting, and Material Design 3",
                "weight": 0.85
            },
            {
                "name": "REST APIs",
                "required_level": 3,
                "description": "Consuming backend web services, JSON parsing, and network error handling",
                "weight": 0.8
            },
            {
                "name": "Java",
                "required_level": 3,
                "description": "Core Java object-oriented principles and interoperability",
                "weight": 0.75
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control, mobile release tagging, and team collaboration",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Coroutines",
                "required_level": 3,
                "description": "Asynchronous background processing and flow streams"
            },
            {
                "name": "Room DB",
                "required_level": 3,
                "description": "Local SQLite persistence and data access objects"
            },
            {
                "name": "Retrofit",
                "required_level": 3,
                "description": "Type-safe HTTP client for Android network requests"
            },
            {
                "name": "Material Design",
                "required_level": 3,
                "description": "Design guidelines, responsive layouts, and themes"
            },
            {
                "name": "Unit Testing",
                "required_level": 2,
                "description": "JUnit and Robolectric mobile test suites"
            }
        ],
        "soft_skills": [
            {
                "name": "User Experience Empathy",
                "description": "Designing intuitive interactions and smooth touch gestures"
            },
            {
                "name": "Device Fragmentation Debugging",
                "description": "Ensuring smooth performance across different screen sizes and OS versions"
            }
        ]
    },
    {
        "id": "flutter-developer",
        "name": "Flutter Developer",
        "category": "Software Development",
        "tagline": "Create sleek, high-performance cross-platform mobile apps from a single codebase.",
        "demand_level": "High",
        "description": "Flutter Developers craft beautiful, natively compiled cross-platform applications for iOS and Android using Google's Flutter framework, the Dart programming language, and reactive state management.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.8L \u2013 \u20b916L per annum (India)",
        "avg_salary": "\u20b97.5L",
        "tools": [
            "VS Code",
            "Android Studio",
            "Flutter CLI",
            "Dart DevTools",
            "Git",
            "Postman",
            "Firebase Console"
        ],
        "interview_topics": [
            "StatelessWidget vs StatefulWidget",
            "Flutter rendering pipeline & Widget Tree",
            "BLoC vs Provider vs Riverpod",
            "Dart event loop & Isolates",
            "Platform channels for native code"
        ],
        "recommended_projects": [
            "Cross-Platform Food Delivery App with Flutter, BLoC state management, and Firebase",
            "Personal Habit Tracker with Hive local persistence, dynamic charts, and push notifications"
        ],
        "learning_resources": [
            {
                "title": "Flutter Official Documentation",
                "url": "https://docs.flutter.dev/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Dart Language Tour",
                "url": "https://dart.dev/guides/language/language-tour",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Flutter",
                "required_level": 4,
                "description": "Widget tree, custom painters, animations, and lifecycle management",
                "weight": 1.0
            },
            {
                "name": "Dart",
                "required_level": 4,
                "description": "Object-oriented programming, async/await, streams, and null safety",
                "weight": 0.95
            },
            {
                "name": "State Management",
                "required_level": 4,
                "description": "Provider, Riverpod, or BLoC architectural patterns",
                "weight": 0.9
            },
            {
                "name": "REST APIs",
                "required_level": 3,
                "description": "Http package, JSON serialization, and API integration",
                "weight": 0.8
            },
            {
                "name": "Mobile UI Design",
                "required_level": 3,
                "description": "Responsive layouts, Cupertino & Material components",
                "weight": 0.8
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control and multi-platform collaboration",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Firebase",
                "required_level": 3,
                "description": "Authentication, Firestore, push notifications, and analytics"
            },
            {
                "name": "SQLite",
                "required_level": 3,
                "description": "Local persistent storage and key-value databases"
            },
            {
                "name": "Cross-Platform Deployment",
                "required_level": 2,
                "description": "App Store & Google Play build configuration and signing"
            },
            {
                "name": "CI/CD",
                "required_level": 2,
                "description": "Automated mobile builds with GitHub Actions or Codemagic"
            },
            {
                "name": "Unit Testing",
                "required_level": 2,
                "description": "Testing Flutter widgets and business logic mocks"
            }
        ],
        "soft_skills": [
            {
                "name": "Cross-Platform Problem Solving",
                "description": "Navigating platform-specific behavior and UI nuances"
            },
            {
                "name": "Visual Precision",
                "description": "Translating Figma designs into responsive mobile widget trees"
            }
        ]
    },
    {
        "id": "data-analyst",
        "name": "Data Analyst",
        "category": "Data Science and Artificial Intelligence",
        "tagline": "Transform raw datasets into actionable executive insights and dashboards.",
        "demand_level": "High",
        "description": "Data Analysts inspect, clean, transform, and model data to discover useful information, inform conclusions, and support organizational decision-making using SQL, BI tools, and Python.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "B.Sc Statistics / Mathematics",
            "B.Com Analytics"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.5L \u2013 \u20b914L per annum (India)",
        "avg_salary": "\u20b97.2L",
        "tools": [
            "SQL Server",
            "Power BI",
            "Excel",
            "Tableau",
            "Jupyter Notebook",
            "Python"
        ],
        "interview_topics": [
            "SQL joins & window functions",
            "Data cleaning & handling missing values",
            "KPI metric definitions",
            "A/B testing basics & statistical significance",
            "Dashboard storytelling"
        ],
        "recommended_projects": [
            "End-to-end Sales Analytics Dashboard in Power BI with dynamic DAX metrics",
            "Customer Churn exploratory analysis in Python using Pandas, Seaborn, and SQL queries"
        ],
        "learning_resources": [
            {
                "title": "Mode Analytics SQL Tutorial",
                "url": "https://mode.com/sql-tutorial/",
                "type": "Tutorial",
                "is_free": True
            },
            {
                "title": "Microsoft Power BI Guided Learning",
                "url": "https://learn.microsoft.com/en-us/power-bi/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "SQL",
                "required_level": 4,
                "description": "Relational data querying, complex aggregations, joins, and CTEs",
                "weight": 1.0
            },
            {
                "name": "Python",
                "required_level": 4,
                "description": "Data wrangling, scripting, and pipeline automation",
                "weight": 0.9
            },
            {
                "name": "Excel",
                "required_level": 4,
                "description": "Advanced formulas, pivot tables, and spreadsheet data modeling",
                "weight": 0.85
            },
            {
                "name": "Power BI",
                "required_level": 3,
                "description": "Interactive reporting dashboards and DAX metrics",
                "weight": 0.85
            },
            {
                "name": "Tableau",
                "required_level": 3,
                "description": "Visual data storytelling and executive analytics dashboards",
                "weight": 0.75
            },
            {
                "name": "Statistics",
                "required_level": 3,
                "description": "Hypothesis testing, probability distributions, and descriptive analytics",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "Pandas",
                "required_level": 3,
                "description": "DataFrame manipulations, cleaning, and ETL transformations"
            },
            {
                "name": "NumPy",
                "required_level": 3,
                "description": "Vectorized computations and numerical transformations"
            },
            {
                "name": "Communication",
                "required_level": 3,
                "description": "Stakeholder presentation and translating data findings into business insights"
            },
            {
                "name": "Problem Solving",
                "required_level": 3,
                "description": "Structured analytical problem decomposition"
            }
        ],
        "soft_skills": [
            {
                "name": "Business Storytelling",
                "description": "Translating statistical data into clear narratives for non-technical stakeholders"
            },
            {
                "name": "Critical Thinking",
                "description": "Validating data integrity and identifying underlying bias in datasets"
            }
        ]
    },
    {
        "id": "bi-analyst",
        "name": "Business Intelligence Analyst",
        "category": "Data Science and Artificial Intelligence",
        "tagline": "Design data models, KPI dashboards, and enterprise reporting solutions.",
        "demand_level": "High",
        "description": "Business Intelligence Analysts design and manage data models, automated ETL transformations, and interactive executive reporting dashboards to provide strategic visibility across enterprise operations.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "B.Com Analytics",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.8L \u2013 \u20b915L per annum (India)",
        "avg_salary": "\u20b97.5L",
        "tools": [
            "Power BI",
            "Tableau",
            "SQL Server / SSIS",
            "DAX Studio",
            "Excel",
            "Alteryx"
        ],
        "interview_topics": [
            "Star schema vs Snowflake schema",
            "DAX calculations (CALCULATE, FILTER, RELATED)",
            "Data warehousing fundamentals",
            "Executive KPI design",
            "Data refresh optimization & partitioning"
        ],
        "recommended_projects": [
            "Enterprise Financial Performance BI Dashboard with dimensional data modeling and DAX measures",
            "Supply Chain & Inventory Optimization Suite with automated SQL refresh and drill-down reports"
        ],
        "learning_resources": [
            {
                "title": "Microsoft Learn Power BI Certification Path",
                "url": "https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "SQLBI DAX Guide",
                "url": "https://dax.guide/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Power BI",
                "required_level": 4,
                "description": "Data modeling, DAX measures, row-level security, and report publishing",
                "weight": 1.0
            },
            {
                "name": "SQL",
                "required_level": 4,
                "description": "Writing performant analytical queries, views, and stored procedures",
                "weight": 0.95
            },
            {
                "name": "Tableau",
                "required_level": 3,
                "description": "Visual analytics, LOD expressions, and dashboard actions",
                "weight": 0.8
            },
            {
                "name": "Data Modeling",
                "required_level": 4,
                "description": "Dimensional modeling, star schemas, fact and dimension tables",
                "weight": 0.9
            },
            {
                "name": "Excel",
                "required_level": 4,
                "description": "Power Query, Power Pivot, financial formulas, and macros",
                "weight": 0.8
            },
            {
                "name": "Business Analysis",
                "required_level": 3,
                "description": "Requirements elicitation and translating business goals to metrics",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "ETL Pipelines",
                "required_level": 3,
                "description": "Extract, transform, and load workflows using SQL/SSIS"
            },
            {
                "name": "Data Warehousing",
                "required_level": 3,
                "description": "Understanding OLAP cubes and warehouse architecture"
            },
            {
                "name": "Python",
                "required_level": 2,
                "description": "Basic data scripting for automated transformations"
            },
            {
                "name": "DAX",
                "required_level": 4,
                "description": "Advanced calculations, time intelligence, and context transition"
            },
            {
                "name": "Communication",
                "required_level": 3,
                "description": "Executive presentations and stakeholder reviews"
            }
        ],
        "soft_skills": [
            {
                "name": "Stakeholder Communication",
                "description": "Leading requirements discovery with business and finance leaders"
            },
            {
                "name": "Business Acumen",
                "description": "Understanding revenue drivers, costs, and operational unit economics"
            }
        ]
    },
    {
        "id": "data-scientist",
        "name": "Data Scientist",
        "category": "Data Science and Artificial Intelligence",
        "tagline": "Discover predictive patterns and formulate data-driven solutions using statistical modeling.",
        "demand_level": "Extremely High",
        "description": "Data Scientists combine statistical analysis, machine learning algorithms, and deep domain understanding to build predictive models, run experiments, and uncover insights from complex datasets.",
        "suitable_backgrounds": [
            "B.Tech CS / AI / Data Science",
            "BCA / MCA",
            "B.Sc / M.Sc Statistics",
            "M.Tech Data Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96.5L \u2013 \u20b924L per annum (India)",
        "avg_salary": "\u20b911.0L",
        "tools": [
            "Python",
            "Jupyter",
            "Scikit-Learn",
            "Pandas",
            "SQL",
            "Seaborn",
            "Git"
        ],
        "interview_topics": [
            "Bias-variance tradeoff & cross-validation",
            "Linear & Logistic Regression assumptions",
            "Decision Trees & Random Forests",
            "Hypothesis testing & p-values",
            "Feature engineering techniques"
        ],
        "recommended_projects": [
            "Customer Lifetime Value (LTV) Prediction with Feature Engineering, XGBoost, and SHAP explainability",
            "Healthcare Diagnostic Classifier with imbalanced data handling (SMOTE) and ROC-AUC optimization"
        ],
        "learning_resources": [
            {
                "title": "Scikit-Learn User Guide",
                "url": "https://scikit-learn.org/stable/user_guide.html",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Coursera Machine Learning Specialization",
                "url": "https://www.coursera.org/specializations/machine-learning-introduction",
                "type": "Course",
                "is_free": False
            }
        ],
        "core_skills": [
            {
                "name": "Python",
                "required_level": 4,
                "description": "Data science libraries, scripting, OOP, and scientific computing",
                "weight": 1.0
            },
            {
                "name": "Machine Learning",
                "required_level": 4,
                "description": "Supervised, unsupervised algorithms, model evaluation, and validation",
                "weight": 1.0
            },
            {
                "name": "Statistics",
                "required_level": 4,
                "description": "Inferential statistics, distributions, hypothesis testing, and Bayes theorem",
                "weight": 0.9
            },
            {
                "name": "SQL",
                "required_level": 3,
                "description": "Data extraction, aggregations, window functions, and CTEs",
                "weight": 0.8
            },
            {
                "name": "Pandas",
                "required_level": 4,
                "description": "DataFrame operations, exploratory data analysis, and missing data imputation",
                "weight": 0.9
            },
            {
                "name": "Scikit-learn",
                "required_level": 4,
                "description": "Constructing robust pipelines, cross-validation grids, and metrics",
                "weight": 0.85
            }
        ],
        "secondary_skills": [
            {
                "name": "Deep Learning",
                "required_level": 2,
                "description": "Neural networks, activation functions, and backpropagation"
            },
            {
                "name": "Data Visualization",
                "required_level": 3,
                "description": "Matplotlib, Seaborn, and Plotly visual storytelling"
            },
            {
                "name": "Feature Engineering",
                "required_level": 4,
                "description": "One-hot encoding, scaling, transformations, and feature selection"
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control for code and experiments"
            },
            {
                "name": "NumPy",
                "required_level": 3,
                "description": "Vectorized computations and numerical transformations"
            }
        ],
        "soft_skills": [
            {
                "name": "Hypothesis Formulation",
                "description": "Structuring ambiguous business questions into testable statistical hypotheses"
            },
            {
                "name": "Scientific Rigor",
                "description": "Ensuring models avoid data leakage and false causal conclusions"
            }
        ]
    },
    {
        "id": "data-engineer",
        "name": "Data Engineer",
        "category": "Data Science and Artificial Intelligence",
        "tagline": "Architect and maintain robust, high-volume batch and real-time data pipelines.",
        "demand_level": "Extremely High",
        "description": "Data Engineers build the foundational data infrastructure, scalable ETL/ELT pipelines, and distributed storage systems that enable reliable analytics and production machine learning.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "MCA",
            "B.Sc Computer Science",
            "BCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96L \u2013 \u20b922L per annum (India)",
        "avg_salary": "\u20b910.5L",
        "tools": [
            "Python",
            "Apache Spark",
            "SQL",
            "Airflow",
            "Kafka",
            "PostgreSQL",
            "Docker"
        ],
        "interview_topics": [
            "Batch vs Streaming processing",
            "Spark RDDs, DataFrames & partitioning",
            "Database indexing & partitioning strategies",
            "Airflow DAG scheduling & idempotency",
            "Data lake vs data warehouse"
        ],
        "recommended_projects": [
            "Automated Event Ingestion Pipeline with Apache Kafka, PySpark, and PostgreSQL",
            "Batch Data Warehouse ETL orchestrated with Apache Airflow and dbt"
        ],
        "learning_resources": [
            {
                "title": "Apache Spark Documentation",
                "url": "https://spark.apache.org/docs/latest/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Apache Airflow Tutorial",
                "url": "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "SQL",
                "required_level": 4,
                "description": "Complex relational queries, indexing, partitioning, and execution plans",
                "weight": 1.0
            },
            {
                "name": "Python",
                "required_level": 4,
                "description": "Data processing scripts, OOP pipelines, and integration APIs",
                "weight": 0.95
            },
            {
                "name": "Apache Spark",
                "required_level": 3,
                "description": "Distributed computing, PySpark DataFrames, and partition management",
                "weight": 0.85
            },
            {
                "name": "ETL Pipelines",
                "required_level": 4,
                "description": "Extract, Transform, Load design, data validation, and idempotency",
                "weight": 0.9
            },
            {
                "name": "Data Warehousing",
                "required_level": 3,
                "description": "Star schema, snowflake schema, and columnar storage design",
                "weight": 0.8
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Code and pipeline configuration version control",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Apache Airflow",
                "required_level": 3,
                "description": "Workflow orchestration, DAG creation, and monitoring"
            },
            {
                "name": "Kafka",
                "required_level": 2,
                "description": "Message brokers, topics, partitions, and streaming data concepts"
            },
            {
                "name": "Docker",
                "required_level": 2,
                "description": "Containerizing data tools and local clusters"
            },
            {
                "name": "Linux",
                "required_level": 3,
                "description": "Shell scripting, cron jobs, and server administration"
            },
            {
                "name": "Cloud Storage",
                "required_level": 2,
                "description": "AWS S3 / GCP Cloud Storage data lake principles"
            }
        ],
        "soft_skills": [
            {
                "name": "Systems Architecture",
                "description": "Designing for fault tolerance, data deduplication, and data quality checks"
            },
            {
                "name": "Data Integrity Mindset",
                "description": "Zero tolerance for silent data corruption or pipeline drops"
            }
        ]
    },
    {
        "id": "ml-engineer",
        "name": "Machine Learning Engineer",
        "category": "Data Science and Artificial Intelligence",
        "tagline": "Design predictive mathematical models and deploy production AI pipelines.",
        "demand_level": "Extremely High",
        "description": "Machine Learning Engineers bridge data science and software engineering by researching, building, validating, and deploying machine learning models into low-latency production applications.",
        "suitable_backgrounds": [
            "BCA / MCA with ML focus",
            "B.Tech CS / AI / Data Science",
            "B.Sc Data Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96.5L \u2013 \u20b925L per annum (India)",
        "avg_salary": "\u20b911.5L",
        "tools": [
            "Python",
            "PyTorch",
            "Scikit-Learn",
            "Docker",
            "FastAPI",
            "MLflow",
            "Git"
        ],
        "interview_topics": [
            "Supervised vs unsupervised algorithms",
            "Model optimization (gradient descent, learning rates)",
            "ML pipeline serialization (Joblib/ONNX)",
            "REST API serving with FastAPI & Docker",
            "Model drift & monitoring"
        ],
        "recommended_projects": [
            "End-to-end Scikit-learn Pipeline with ColumnTransformer, cross-validation, and FastAPI inference endpoint",
            "Computer vision or NLP classification model deployed inside a containerized Docker service"
        ],
        "learning_resources": [
            {
                "title": "Fast.ai Practical Deep Learning",
                "url": "https://course.fast.ai/",
                "type": "Course",
                "is_free": True
            },
            {
                "title": "PyTorch Official Tutorials",
                "url": "https://pytorch.org/tutorials/",
                "type": "Tutorial",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Python",
                "required_level": 4,
                "description": "High-performance Python scripting and object-oriented ML pipelines",
                "weight": 1.0
            },
            {
                "name": "Machine Learning",
                "required_level": 4,
                "description": "Supervised/unsupervised algorithms, evaluation metrics, and bias-variance tradeoff",
                "weight": 1.0
            },
            {
                "name": "Scikit-learn",
                "required_level": 4,
                "description": "Model pipelines, feature preprocessors, and cross-validation grids",
                "weight": 0.9
            },
            {
                "name": "Pandas",
                "required_level": 4,
                "description": "Advanced data cleaning, feature engineering, and exploratory data analysis",
                "weight": 0.85
            },
            {
                "name": "NumPy",
                "required_level": 4,
                "description": "Matrix mathematics, tensor indexing, and linear algebra operations",
                "weight": 0.85
            },
            {
                "name": "SQL",
                "required_level": 3,
                "description": "Extracting large training datasets and aggregating feature stores",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "Deep Learning",
                "required_level": 3,
                "description": "Neural network architectures, activations, and backpropagation"
            },
            {
                "name": "PyTorch",
                "required_level": 3,
                "description": "Dynamic computation graphs and deep neural network training"
            },
            {
                "name": "Docker",
                "required_level": 3,
                "description": "Packaging ML model services into deployable containers"
            },
            {
                "name": "FastAPI",
                "required_level": 3,
                "description": "Building low-latency inference REST APIs for ML model deployment"
            },
            {
                "name": "MLOps",
                "required_level": 2,
                "description": "Experiment tracking with MLflow, model registries, and versioning"
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Code and experiment version control"
            }
        ],
        "soft_skills": [
            {
                "name": "Mathematical Intuition",
                "description": "Connecting loss functions and metric tradeoffs to real-world impact"
            },
            {
                "name": "Experimentation Hygiene",
                "description": "Documenting hyperparameters, splits, and reproducibility protocols"
            }
        ]
    },
    {
        "id": "ai-engineer",
        "name": "AI Engineer",
        "category": "Data Science and Artificial Intelligence",
        "tagline": "Build intelligent systems powered by neural networks, LLMs, and cognitive APIs.",
        "demand_level": "Extremely High",
        "description": "AI Engineers integrate cutting-edge artificial intelligence, foundational models, neural networks, and semantic retrieval systems into production software products.",
        "suitable_backgrounds": [
            "B.Tech CS / AI",
            "MCA",
            "B.Sc Computer Science",
            "BCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b97L \u2013 \u20b926L per annum (India)",
        "avg_salary": "\u20b912.0L",
        "tools": [
            "Python",
            "PyTorch",
            "LangChain",
            "OpenAI API",
            "ChromaDB",
            "FastAPI",
            "Docker"
        ],
        "interview_topics": [
            "Transformer attention mechanism",
            "Vector embeddings & cosine similarity",
            "Fine-tuning vs In-Context Learning",
            "API rate limiting & prompt token economics",
            "Evaluation of non-deterministic models"
        ],
        "recommended_projects": [
            "Domain-Specific Knowledge Base QA Bot with Vector DB embeddings and LangChain",
            "Multi-Modal Content Moderation and Tagging Pipeline with Vision-Language Models"
        ],
        "learning_resources": [
            {
                "title": "Hugging Face Deep RL and NLP Course",
                "url": "https://huggingface.co/learn",
                "type": "Course",
                "is_free": True
            },
            {
                "title": "DeepLearning.AI Short Courses",
                "url": "https://www.deeplearning.ai/short-courses/",
                "type": "Course",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Python",
                "required_level": 4,
                "description": "Asynchronous backend programming, data manipulation, and API clients",
                "weight": 1.0
            },
            {
                "name": "Deep Learning",
                "required_level": 3,
                "description": "Neural network topologies, embeddings, loss functions, and inference",
                "weight": 0.9
            },
            {
                "name": "PyTorch",
                "required_level": 3,
                "description": "Model loading, tensor operations, and inference pipelines",
                "weight": 0.85
            },
            {
                "name": "Large Language Models",
                "required_level": 4,
                "description": "Prompt structuring, tokenization, context windows, and model orchestration",
                "weight": 0.95
            },
            {
                "name": "REST APIs",
                "required_level": 4,
                "description": "FastAPI development, streaming responses, and asynchronous endpoints",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Source code management and continuous integration",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Vector Databases",
                "required_level": 3,
                "description": "Chroma, Pinecone, or FAISS indexing and semantic similarity search"
            },
            {
                "name": "LangChain",
                "required_level": 3,
                "description": "Chains, agents, memory modules, and document loaders"
            },
            {
                "name": "Docker",
                "required_level": 3,
                "description": "Containerizing AI inference applications"
            },
            {
                "name": "Hugging Face",
                "required_level": 3,
                "description": "Model hub, transformers library, and tokenizer pipelines"
            },
            {
                "name": "Prompt Engineering",
                "required_level": 4,
                "description": "Few-shot prompting, chain-of-thought, and output guardrails"
            }
        ],
        "soft_skills": [
            {
                "name": "Rapid Experimentation",
                "description": "Quickly benchmarking alternative models and temperature settings"
            },
            {
                "name": "Ethical AI",
                "description": "Vigilance regarding hallucinations, bias, and privacy compliance"
            }
        ]
    },
    {
        "id": "generative-ai-developer",
        "name": "Generative AI Developer",
        "category": "Data Science and Artificial Intelligence",
        "tagline": "Architect agentic workflows, Retrieval-Augmented Generation (RAG), and generative experiences.",
        "demand_level": "Extremely High",
        "description": "Generative AI Developers specialize in designing and deploying conversational agents, RAG architectures, document synthesis tools, and generative multi-modal workflows using modern foundational LLMs.",
        "suitable_backgrounds": [
            "B.Tech CS / AI / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b97L \u2013 \u20b928L per annum (India)",
        "avg_salary": "\u20b912.5L",
        "tools": [
            "Python",
            "LangChain",
            "LlamaIndex",
            "ChromaDB / Qdrant",
            "OpenAI/Gemini APIs",
            "FastAPI"
        ],
        "interview_topics": [
            "Retrieval-Augmented Generation (RAG) architecture",
            "Chunking strategies & embedding trade-offs",
            "Agentic patterns (ReAct, Plan-and-Solve)",
            "Hallucination mitigation & evaluation benchmarks (RAGAS)",
            "Structured output validation with Pydantic"
        ],
        "recommended_projects": [
            "Enterprise Document Intelligence System with Hybrid RAG, re-ranking, and citation tracking",
            "Autonomous Code Review Assistant using Multi-Agent ReAct framework and GitHub API"
        ],
        "learning_resources": [
            {
                "title": "LangChain Official Tutorials",
                "url": "https://python.langchain.com/docs/get_started/introduction",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "LlamaIndex Documentation",
                "url": "https://docs.llamaindex.ai/en/stable/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Python",
                "required_level": 4,
                "description": "Modern Python, asynchronous execution, and API development",
                "weight": 1.0
            },
            {
                "name": "Prompt Engineering",
                "required_level": 4,
                "description": "Structured prompting, system instructions, few-shot conditioning",
                "weight": 0.95
            },
            {
                "name": "RAG",
                "required_level": 4,
                "description": "Document parsing, chunking, embedding generation, and contextual retrieval",
                "weight": 1.0
            },
            {
                "name": "Vector Databases",
                "required_level": 4,
                "description": "Semantic search, indexing, metadata filtering, and distance metrics",
                "weight": 0.9
            },
            {
                "name": "LangChain",
                "required_level": 3,
                "description": "Orchestrating prompts, chains, tools, and retrieval agents",
                "weight": 0.85
            },
            {
                "name": "REST APIs",
                "required_level": 3,
                "description": "Streaming web endpoints, SSE, and FastAPI microservices",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "LlamaIndex",
                "required_level": 3,
                "description": "Advanced data indexing, querying, and routing engines"
            },
            {
                "name": "Fine-Tuning",
                "required_level": 2,
                "description": "PEFT, LoRA adapters, and dataset curation for open weights"
            },
            {
                "name": "FastAPI",
                "required_level": 3,
                "description": "Building high-throughput generative AI endpoints"
            },
            {
                "name": "Streamlit",
                "required_level": 3,
                "description": "Rapid prototyping of interactive AI chat interfaces"
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Source control and collaborative AI codebase management"
            }
        ],
        "soft_skills": [
            {
                "name": "Creative Problem Solving",
                "description": "Formulating novel prompts and fallback strategies when models fail"
            },
            {
                "name": "Safety & Alignment Awareness",
                "description": "Designing input sanitation and output guardrails against prompt injection"
            }
        ]
    },
    {
        "id": "nlp-engineer",
        "name": "NLP Engineer",
        "category": "Data Science and Artificial Intelligence",
        "tagline": "Build language parsing models, sentiment analyzers, and computational linguistic pipelines.",
        "demand_level": "High",
        "description": "NLP Engineers apply natural language processing algorithms, transformer architectures, and linguistic rules to extract meaning, classify text, and generate human-like summaries from unstructured data.",
        "suitable_backgrounds": [
            "B.Tech CS / AI",
            "B.Sc / M.Sc Computational Linguistics",
            "MCA",
            "BCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96L \u2013 \u20b922L per annum (India)",
        "avg_salary": "\u20b910.5L",
        "tools": [
            "Python",
            "Hugging Face",
            "spaCy",
            "PyTorch",
            "NLTK",
            "Scikit-Learn"
        ],
        "interview_topics": [
            "Tokenization & WordPiece/BytePair encoding",
            "TF-IDF vs Word2Vec vs Transformers",
            "BERT vs GPT architectural differences",
            "Named Entity Recognition (NER) & POS tagging",
            "Evaluation metrics: BLEU, ROUGE, and F1"
        ],
        "recommended_projects": [
            "Customer Review Aspect-Based Sentiment Classifier fine-tuned on RoBERTa",
            "Legal Contract Entity Extraction and Clause Summarizer using spaCy and Transformers"
        ],
        "learning_resources": [
            {
                "title": "Hugging Face NLP Course",
                "url": "https://huggingface.co/learn/nlp-course",
                "type": "Course",
                "is_free": True
            },
            {
                "title": "spaCy Usage Guide",
                "url": "https://spacy.io/usage",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Python",
                "required_level": 4,
                "description": "Text processing, regular expressions, and scientific computing",
                "weight": 1.0
            },
            {
                "name": "Natural Language Processing",
                "required_level": 4,
                "description": "Linguistic fundamentals, parsing, sentiment analysis, and topic modeling",
                "weight": 1.0
            },
            {
                "name": "Hugging Face",
                "required_level": 4,
                "description": "Transformers library, AutoTokenizer, and pre-trained model hubs",
                "weight": 0.9
            },
            {
                "name": "PyTorch",
                "required_level": 3,
                "description": "Model fine-tuning, loss backpropagation, and tensor manipulation",
                "weight": 0.85
            },
            {
                "name": "Text Preprocessing",
                "required_level": 4,
                "description": "Stemming, lemmatization, stop words, regex, and subword tokenization",
                "weight": 0.85
            },
            {
                "name": "Machine Learning",
                "required_level": 3,
                "description": "Classification algorithms, evaluation metrics, and validation sets",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "spaCy",
                "required_level": 3,
                "description": "Industrial-strength tokenization, dependency parsing, and NER pipelines"
            },
            {
                "name": "NLTK",
                "required_level": 3,
                "description": "Corpora processing and classical linguistic analysis"
            },
            {
                "name": "Word Embeddings",
                "required_level": 3,
                "description": "GloVe, Word2Vec, and dense semantic representations"
            },
            {
                "name": "Scikit-learn",
                "required_level": 3,
                "description": "Text classification with linear classifiers and Naive Bayes"
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control for ML pipelines"
            }
        ],
        "soft_skills": [
            {
                "name": "Linguistic Intuition",
                "description": "Anticipating slang, ambiguity, and syntactic variation in human text"
            },
            {
                "name": "Analytical Thinking",
                "description": "Interpreting confusion matrices and error patterns in text classification"
            }
        ]
    },
    {
        "id": "computer-vision-engineer",
        "name": "Computer Vision Engineer",
        "category": "Data Science and Artificial Intelligence",
        "tagline": "Develop visual perception pipelines, object detection models, and image processing tools.",
        "demand_level": "High",
        "description": "Computer Vision Engineers design and deploy software algorithms that allow machines to extract high-level understanding from digital images, videos, and multi-spectral sensors.",
        "suitable_backgrounds": [
            "B.Tech CS / AI / Electronics",
            "MCA",
            "M.Tech Vision / Signal Processing",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96.5L \u2013 \u20b924L per annum (India)",
        "avg_salary": "\u20b911.0L",
        "tools": [
            "Python",
            "OpenCV",
            "PyTorch",
            "YOLO",
            "Albumentations",
            "Git"
        ],
        "interview_topics": [
            "Convolution operations & kernel math",
            "Object detection architectures (YOLO, Faster R-CNN)",
            "Image segmentation (U-Net, Mask R-CNN)",
            "Data augmentation & lighting invariance",
            "Inference optimization (ONNX, TensorRT)"
        ],
        "recommended_projects": [
            "Real-Time PPE Detection on Construction Sites using YOLOv8 and OpenCV",
            "Medical Image Segmentation Model with U-Net for Cell Defect Identification"
        ],
        "learning_resources": [
            {
                "title": "OpenCV Official Tutorials",
                "url": "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "PyTorch Vision Guide",
                "url": "https://pytorch.org/vision/stable/index.html",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Python",
                "required_level": 4,
                "description": "Scientific computation, image array manipulation, and pipeline code",
                "weight": 1.0
            },
            {
                "name": "OpenCV",
                "required_level": 4,
                "description": "Color spaces, morphological operations, contours, filtering, and video streams",
                "weight": 1.0
            },
            {
                "name": "PyTorch",
                "required_level": 4,
                "description": "CNN model training, loss tracking, and GPU tensor acceleration",
                "weight": 0.9
            },
            {
                "name": "Deep Learning",
                "required_level": 4,
                "description": "CNN architectures, ResNet, EfficientNet, and transfer learning",
                "weight": 0.9
            },
            {
                "name": "Image Processing",
                "required_level": 3,
                "description": "Histogram equalization, edge detection, and thresholding",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Source code and model training experiment management",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "YOLO",
                "required_level": 4,
                "description": "Object detection training, bounding box annotations, and inference"
            },
            {
                "name": "Object Detection",
                "required_level": 3,
                "description": "Non-maximum suppression, IoU metrics, and mAP evaluation"
            },
            {
                "name": "Image Augmentation",
                "required_level": 3,
                "description": "Spatial and photometric transformations using Albumentations"
            },
            {
                "name": "NumPy",
                "required_level": 4,
                "description": "High-speed multi-dimensional array operations on pixel matrices"
            },
            {
                "name": "Docker",
                "required_level": 2,
                "description": "Containerizing GPU-accelerated vision pipelines"
            }
        ],
        "soft_skills": [
            {
                "name": "Spatial Reasoning",
                "description": "Understanding coordinate transformations, aspect ratios, and geometry"
            },
            {
                "name": "Visual Troubleshooting",
                "description": "Diagnosing false positives caused by occlusion, glare, or motion blur"
            }
        ]
    },
    {
        "id": "cloud-engineer",
        "name": "Cloud Engineer",
        "category": "Cloud and DevOps",
        "tagline": "Architect, provision, and maintain reliable cloud infrastructure and services.",
        "demand_level": "Very High",
        "description": "Cloud Engineers manage cloud architecture, automated deployments, container orchestration, and infrastructure security across AWS, Azure, and modern Linux environments.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95.5L \u2013 \u20b920L per annum (India)",
        "avg_salary": "\u20b99.5L",
        "tools": [
            "AWS / Azure",
            "Terraform",
            "Docker",
            "Linux",
            "Git",
            "Bash",
            "Kubernetes"
        ],
        "interview_topics": [
            "Cloud service models (IaaS, PaaS, SaaS)",
            "VPC design, subnets, and routing tables",
            "IAM policies & principle of least privilege",
            "Terraform state management & HCL",
            "Containerization vs Virtual Machines"
        ],
        "recommended_projects": [
            "High-Availability Cloud Architecture on AWS with EC2 Auto-Scaling, ALB, and RDS",
            "Infrastructure-as-Code Terraform Repository provisioning a secure multi-tier VPC"
        ],
        "learning_resources": [
            {
                "title": "AWS Cloud Practitioner Essentials",
                "url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
                "type": "Course",
                "is_free": True
            },
            {
                "title": "Terraform HashiCorp Tutorials",
                "url": "https://developer.hashicorp.com/terraform/tutorials",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Cloud Computing",
                "required_level": 4,
                "description": "Cloud architectures, virtual networks, compute instances, and storage tiers",
                "weight": 1.0
            },
            {
                "name": "Linux",
                "required_level": 4,
                "description": "CLI navigation, bash scripting, SSH, permissions, and service management",
                "weight": 0.95
            },
            {
                "name": "Networking",
                "required_level": 3,
                "description": "TCP/IP, DNS, subnets, CIDR notation, firewalls, and HTTP protocols",
                "weight": 0.85
            },
            {
                "name": "Terraform",
                "required_level": 3,
                "description": "Declarative Infrastructure as Code (IaC) and provider configurations",
                "weight": 0.85
            },
            {
                "name": "Docker",
                "required_level": 3,
                "description": "Dockerfile construction, multi-stage builds, and container networking",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control for infrastructure code and automation scripts",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "CI/CD",
                "required_level": 3,
                "description": "Automated build and deployment pipelines (GitHub Actions / GitLab)"
            },
            {
                "name": "Kubernetes",
                "required_level": 2,
                "description": "Pods, deployments, services, and cluster orchestration basics"
            },
            {
                "name": "Cloud Security",
                "required_level": 3,
                "description": "IAM roles, security groups, encryption at rest and in transit"
            },
            {
                "name": "Python",
                "required_level": 2,
                "description": "Automation scripting and cloud SDK usage (Boto3)"
            },
            {
                "name": "Monitoring",
                "required_level": 2,
                "description": "CloudWatch / Prometheus metrics, alerts, and log aggregation"
            }
        ],
        "soft_skills": [
            {
                "name": "Infrastructure Resilience",
                "description": "Designing systems that survive component and zone failures"
            },
            {
                "name": "Incident Response",
                "description": "Calm, structured diagnosis during cloud service outages"
            }
        ]
    },
    {
        "id": "aws-cloud-engineer",
        "name": "AWS Cloud Engineer",
        "category": "Cloud and DevOps",
        "tagline": "Build secure, scalable, and cost-effective cloud workloads on Amazon Web Services.",
        "demand_level": "Very High",
        "description": "AWS Cloud Engineers focus deeply on the Amazon Web Services ecosystem, provisioning compute, database, and network services while optimizing architecture for high availability and low cost.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96L \u2013 \u20b922L per annum (India)",
        "avg_salary": "\u20b910.0L",
        "tools": [
            "AWS Management Console",
            "AWS CLI",
            "Terraform",
            "Boto3",
            "Docker",
            "Linux"
        ],
        "interview_topics": [
            "AWS IAM policies & cross-account roles",
            "EC2 vs ECS vs Lambda serverless",
            "S3 storage classes & lifecycle policies",
            "VPC endpoints, NAT Gateways & peering",
            "CloudWatch alarms & AWS CloudTrail"
        ],
        "recommended_projects": [
            "Serverless REST API using AWS Lambda, API Gateway, DynamoDB, and Cognito",
            "Containerized Microservice running on AWS ECS Fargate behind an Application Load Balancer"
        ],
        "learning_resources": [
            {
                "title": "AWS Skill Builder Free Tier",
                "url": "https://explore.skillbuilder.aws/",
                "type": "Course",
                "is_free": True
            },
            {
                "title": "AWS Well-Architected Framework",
                "url": "https://aws.amazon.com/architecture/well-architected/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "AWS Services",
                "required_level": 4,
                "description": "EC2, S3, RDS, IAM, VPC, Route 53, and Application Load Balancers",
                "weight": 1.0
            },
            {
                "name": "Linux",
                "required_level": 4,
                "description": "Amazon Linux / Ubuntu administration, systemd, and bash scripting",
                "weight": 0.9
            },
            {
                "name": "Terraform",
                "required_level": 3,
                "description": "AWS provider modules, remote S3 state backends, and variables",
                "weight": 0.85
            },
            {
                "name": "Docker",
                "required_level": 3,
                "description": "Containerizing backend workloads for ECR and ECS deployment",
                "weight": 0.85
            },
            {
                "name": "Networking",
                "required_level": 3,
                "description": "VPC CIDR design, public/private subnets, and routing",
                "weight": 0.8
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Source control and collaborative IaC management",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "AWS Lambda",
                "required_level": 3,
                "description": "Event-driven serverless functions and API Gateway triggers"
            },
            {
                "name": "CloudWatch",
                "required_level": 3,
                "description": "Log groups, metric filters, dashboards, and automated alarms"
            },
            {
                "name": "Python",
                "required_level": 3,
                "description": "Automation with the Boto3 AWS SDK"
            },
            {
                "name": "CI/CD",
                "required_level": 3,
                "description": "Deploying AWS workloads via GitHub Actions or AWS CodePipeline"
            },
            {
                "name": "Cloud Security",
                "required_level": 3,
                "description": "KMS encryption, security groups, and IAM permission boundaries"
            }
        ],
        "soft_skills": [
            {
                "name": "Cost Optimization",
                "description": "Selecting right-sized compute tiers and spot instances to minimize cloud billing"
            },
            {
                "name": "Troubleshooting",
                "description": "Tracing request flow across security groups, routing tables, and ALB logs"
            }
        ]
    },
    {
        "id": "azure-cloud-engineer",
        "name": "Azure Cloud Engineer",
        "category": "Cloud and DevOps",
        "tagline": "Design, automate, and govern enterprise cloud solutions on Microsoft Azure.",
        "demand_level": "Very High",
        "description": "Azure Cloud Engineers architect and govern enterprise infrastructure, Active Directory identity, and application hosting environments within Microsoft Azure.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96L \u2013 \u20b921L per annum (India)",
        "avg_salary": "\u20b99.8L",
        "tools": [
            "Azure Portal",
            "Azure CLI",
            "PowerShell",
            "Terraform",
            "Azure DevOps",
            "Docker"
        ],
        "interview_topics": [
            "Microsoft Entra ID (Azure AD) & RBAC roles",
            "Azure Virtual Networks (VNet) & NSGs",
            "Azure App Services vs Azure Functions",
            "ARM / Bicep vs Terraform",
            "Azure Monitor & Log Analytics workspaces"
        ],
        "recommended_projects": [
            "Enterprise Multi-Tier Web App on Azure App Service with Azure SQL and Key Vault",
            "Automated Azure Infrastructure Deployment with Bicep and Azure DevOps Pipelines"
        ],
        "learning_resources": [
            {
                "title": "Microsoft Learn AZ-900 / AZ-104 Paths",
                "url": "https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Azure Architecture Center",
                "url": "https://learn.microsoft.com/en-us/azure/architecture/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Microsoft Azure",
                "required_level": 4,
                "description": "Virtual Machines, App Services, Blob Storage, VNets, and Resource Groups",
                "weight": 1.0
            },
            {
                "name": "PowerShell",
                "required_level": 3,
                "description": "Azure PowerShell scripting, automation runbooks, and CLI commands",
                "weight": 0.85
            },
            {
                "name": "Cloud Computing",
                "required_level": 4,
                "description": "Core cloud principles, high availability, and cloud storage tiers",
                "weight": 0.9
            },
            {
                "name": "Terraform",
                "required_level": 3,
                "description": "AzureRM provider configurations, state files, and reusable modules",
                "weight": 0.85
            },
            {
                "name": "Docker",
                "required_level": 3,
                "description": "Container creation and deployment to Azure Container Instances/Apps",
                "weight": 0.8
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Source code and infrastructure pipeline versioning",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Azure DevOps",
                "required_level": 3,
                "description": "Azure Repos, CI/CD pipelines, and release gates"
            },
            {
                "name": "Linux",
                "required_level": 3,
                "description": "Managing Linux VMs on Azure and SSH key authentication"
            },
            {
                "name": "Cloud Security",
                "required_level": 3,
                "description": "Entra ID (Azure AD), Role-Based Access Control (RBAC), and Key Vault"
            },
            {
                "name": "Azure Functions",
                "required_level": 2,
                "description": "Serverless event triggers and timer jobs"
            },
            {
                "name": "Monitoring",
                "required_level": 2,
                "description": "Azure Monitor, Application Insights, and log analytics"
            }
        ],
        "soft_skills": [
            {
                "name": "Enterprise Governance",
                "description": "Enforcing resource tagging policies, cost management, and compliance rules"
            },
            {
                "name": "Disaster Recovery",
                "description": "Planning geo-redundant backups and failover mechanisms"
            }
        ]
    },
    {
        "id": "devops-engineer",
        "name": "DevOps Engineer",
        "category": "Cloud and DevOps",
        "tagline": "Automate continuous integration, container orchestration, and delivery pipelines.",
        "demand_level": "Extremely High",
        "description": "DevOps Engineers bridge software development and operations by building continuous delivery pipelines, managing container platforms, and fostering high-velocity, reliable software deployment.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96L \u2013 \u20b924L per annum (India)",
        "avg_salary": "\u20b910.5L",
        "tools": [
            "Docker",
            "Kubernetes",
            "GitHub Actions",
            "Jenkins",
            "Linux",
            "Terraform",
            "Prometheus"
        ],
        "interview_topics": [
            "CI/CD pipeline stages & best practices",
            "Kubernetes Pods, Services, Ingress, and Deployments",
            "Immutable infrastructure principles",
            "GitOps workflows (ArgoCD)",
            "Zero-downtime deployment strategies (Blue/Green, Canary)"
        ],
        "recommended_projects": [
            "Complete CI/CD GitOps Pipeline deploying a microservice to Kubernetes with automated testing and ArgoCD",
            "Prometheus & Grafana Observability Stack monitoring cluster health and application metrics"
        ],
        "learning_resources": [
            {
                "title": "DevOps Roadmap",
                "url": "https://roadmap.sh/devops",
                "type": "Roadmap",
                "is_free": True
            },
            {
                "title": "Kubernetes Official Tutorials",
                "url": "https://kubernetes.io/docs/tutorials/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "CI/CD",
                "required_level": 4,
                "description": "Building automated build, test, and release pipelines in GitHub Actions/Jenkins",
                "weight": 1.0
            },
            {
                "name": "Docker",
                "required_level": 4,
                "description": "Multi-stage Dockerfiles, image optimization, layer caching, and compose",
                "weight": 1.0
            },
            {
                "name": "Kubernetes",
                "required_level": 3,
                "description": "Declarative YAML manifests, deployments, services, configmaps, and secrets",
                "weight": 0.9
            },
            {
                "name": "Linux",
                "required_level": 4,
                "description": "Advanced shell scripting, process managers, networking, and system diagnostics",
                "weight": 0.9
            },
            {
                "name": "Git",
                "required_level": 4,
                "description": "Advanced git workflows, submodules, tagging, and branch protections",
                "weight": 0.85
            },
            {
                "name": "Bash",
                "required_level": 3,
                "description": "Writing robust automation and deployment scripts with error handling",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "Terraform",
                "required_level": 3,
                "description": "Automating cloud infrastructure provisioning"
            },
            {
                "name": "Prometheus",
                "required_level": 2,
                "description": "Time-series monitoring, PromQL queries, and Grafana dashboards"
            },
            {
                "name": "Cloud Computing",
                "required_level": 3,
                "description": "Deploying workloads to AWS or Azure environments"
            },
            {
                "name": "Python",
                "required_level": 2,
                "description": "DevOps automation scripts and API interactions"
            },
            {
                "name": "Ansible",
                "required_level": 2,
                "description": "Configuration management and server provisioning playbooks"
            }
        ],
        "soft_skills": [
            {
                "name": "Automation Mindset",
                "description": "Eliminating repetitive toil through automated code and scripts"
            },
            {
                "name": "Blameless Postmortems",
                "description": "Analyzing production incidents collaboratively to improve systemic reliability"
            }
        ]
    },
    {
        "id": "sre",
        "name": "Site Reliability Engineer",
        "category": "Cloud and DevOps",
        "tagline": "Apply software engineering principles to infrastructure operations and reliability.",
        "demand_level": "Extremely High",
        "description": "Site Reliability Engineers apply software engineering methodologies to infrastructure problems, ensuring high availability, latency targets, and automated self-healing across distributed platforms.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "MCA",
            "B.Sc Computer Science",
            "BCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96.5L \u2013 \u20b925L per annum (India)",
        "avg_salary": "\u20b911.2L",
        "tools": [
            "Linux",
            "Prometheus",
            "Grafana",
            "Python",
            "Go",
            "Docker",
            "Kubernetes"
        ],
        "interview_topics": [
            "SLIs, SLOs, and Error Budgets",
            "Incident triage & root cause analysis (RCA)",
            "Distributed systems bottlenecks & noisy neighbors",
            "Chaos engineering fundamentals",
            "Capacity planning & auto-scaling math"
        ],
        "recommended_projects": [
            "SLO-Driven Alerting Framework with Prometheus, Alertmanager, and Grafana dashboards",
            "Automated Chaos Testing Suite injecting network latency and pod crashes to test system resilience"
        ],
        "learning_resources": [
            {
                "title": "Google SRE Books (Free Online)",
                "url": "https://sre.google/books/",
                "type": "Book",
                "is_free": True
            },
            {
                "title": "Prometheus Monitoring Guide",
                "url": "https://prometheus.io/docs/introduction/overview/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Linux",
                "required_level": 4,
                "description": "Deep kernel parameters, system calls, network sockets, and performance tools",
                "weight": 1.0
            },
            {
                "name": "Monitoring",
                "required_level": 4,
                "description": "Observability pillars (metrics, logs, traces) and alerting thresholds",
                "weight": 0.95
            },
            {
                "name": "Python",
                "required_level": 3,
                "description": "Writing tools, bots, and remediation scripts in Python or Go",
                "weight": 0.85
            },
            {
                "name": "Kubernetes",
                "required_level": 3,
                "description": "Cluster operations, health checks, resource requests, and limits",
                "weight": 0.85
            },
            {
                "name": "Networking",
                "required_level": 3,
                "description": "TCP handshakes, latency profiling, DNS resolution, and load balancing",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control for operational scripts and configurations",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Docker",
                "required_level": 3,
                "description": "Container troubleshooting and lifecycle inspection"
            },
            {
                "name": "Terraform",
                "required_level": 2,
                "description": "Infrastructure as code definitions"
            },
            {
                "name": "CI/CD",
                "required_level": 3,
                "description": "Ensuring safe, automated release rollouts and instant rollbacks"
            },
            {
                "name": "Cloud Computing",
                "required_level": 3,
                "description": "Operating distributed instances on AWS or Azure"
            },
            {
                "name": "Incident Management",
                "required_level": 3,
                "description": "Runbooks, paging escalation, and blameless postmortems"
            }
        ],
        "soft_skills": [
            {
                "name": "Calm Under Pressure",
                "description": "Methodical diagnosis and communication during high-severity production outages"
            },
            {
                "name": "Reliability Advocacy",
                "description": "Enforcing error budgets when product release velocity risks platform stability"
            }
        ]
    },
    {
        "id": "cybersecurity-analyst",
        "name": "Cybersecurity Analyst",
        "category": "Cybersecurity",
        "tagline": "Protect digital assets, investigate threats, and defend networks from unauthorized access.",
        "demand_level": "Extremely High",
        "description": "Cybersecurity Analysts monitor organizational networks and systems, analyze security alerts, conduct vulnerability assessments, and safeguard sensitive data against cyber threats.",
        "suitable_backgrounds": [
            "B.Tech CS / IT / Cybersecurity",
            "BCA",
            "B.Sc Computer Science",
            "MCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95L \u2013 \u20b918L per annum (India)",
        "avg_salary": "\u20b98.5L",
        "tools": [
            "Wireshark",
            "Nmap",
            "Splunk",
            "Kali Linux",
            "Burp Suite",
            "Metasploit"
        ],
        "interview_topics": [
            "OSI model & TCP/IP security vulnerabilities",
            "Common attack vectors (Phishing, DDoS, Ransomware)",
            "Firewalls vs IDS vs IPS",
            "Symmetric vs Asymmetric cryptography",
            "Incident response life cycle (NIST)"
        ],
        "recommended_projects": [
            "Virtual Cybersecurity Home Lab simulating attacks and packet inspection with Wireshark and Snort",
            "Comprehensive Vulnerability Assessment and Hardening Report for a Linux Web Server"
        ],
        "learning_resources": [
            {
                "title": "Cybrary Free Cybersecurity Training",
                "url": "https://www.cybrary.it/",
                "type": "Course",
                "is_free": True
            },
            {
                "title": "OWASP Top 10 Security Risks",
                "url": "https://owasp.org/www-project-top-ten/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Network Security",
                "required_level": 4,
                "description": "Protocols, packet analysis, firewalls, VPNs, and intrusion detection",
                "weight": 1.0
            },
            {
                "name": "Threat Analysis",
                "required_level": 4,
                "description": "Identifying malware, threat actors, IOCs, and attack surfaces",
                "weight": 0.95
            },
            {
                "name": "Linux",
                "required_level": 3,
                "description": "Command line, user security, permissions, and log file analysis",
                "weight": 0.85
            },
            {
                "name": "Vulnerability Assessment",
                "required_level": 3,
                "description": "Port scanning, vulnerability scanners, and risk prioritization",
                "weight": 0.85
            },
            {
                "name": "Cryptography",
                "required_level": 3,
                "description": "Hashing, SSL/TLS, public-key encryption, and certificate management",
                "weight": 0.8
            },
            {
                "name": "Git",
                "required_level": 2,
                "description": "Version control for security scripts and compliance artifacts",
                "weight": 0.7
            }
        ],
        "secondary_skills": [
            {
                "name": "Python",
                "required_level": 3,
                "description": "Scripting automated security checks and log parsing"
            },
            {
                "name": "SIEM",
                "required_level": 3,
                "description": "Monitoring security events in Splunk or ELK"
            },
            {
                "name": "Incident Response",
                "required_level": 3,
                "description": "Containment, eradication, and post-incident documentation"
            },
            {
                "name": "Wireshark",
                "required_level": 3,
                "description": "Deep packet analysis and forensic network troubleshooting"
            },
            {
                "name": "Compliance",
                "required_level": 2,
                "description": "Understanding ISO 27001, GDPR, and NIST guidelines"
            }
        ],
        "soft_skills": [
            {
                "name": "Investigative Curiosity",
                "description": "Tenaciously tracing anomalous system behaviors to their root cause"
            },
            {
                "name": "Ethical Discretion",
                "description": "Maintaining strict confidentiality when handling sensitive incident data"
            }
        ]
    },
    {
        "id": "soc-analyst",
        "name": "SOC Analyst",
        "category": "Cybersecurity",
        "tagline": "Monitor real-time security events, triage alerts, and defend enterprise perimeters 24/7.",
        "demand_level": "Very High",
        "description": "Security Operations Center (SOC) Analysts monitor telemetry feeds around the clock, triage high-priority alerts, investigate potential breaches, and initiate containment protocols.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT / Cyber",
            "B.Sc Computer Science",
            "MCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.8L \u2013 \u20b916L per annum (India)",
        "avg_salary": "\u20b97.8L",
        "tools": [
            "Splunk",
            "QRadar",
            "Elastic SIEM",
            "Wireshark",
            "VirusTotal",
            "CrowdStrike"
        ],
        "interview_topics": [
            "Tier 1 SOC triage workflows & alert escalation",
            "MITRE ATT&CK framework mapping",
            "Phishing email header analysis & defanging",
            "Host-based artifacts (Windows Event Logs, Prefetch)",
            "Brute-force vs credential stuffing indicators"
        ],
        "recommended_projects": [
            "SOC Detection Lab with Elastic SIEM ingesting Windows Sysmon and web server logs",
            "Phishing Investigation Playbook analyzing malicious URLs, attachments, and email headers"
        ],
        "learning_resources": [
            {
                "title": "TryHackMe SOC Level 1 Path",
                "url": "https://tryhackme.com/path/outline/soclevel1",
                "type": "Interactive",
                "is_free": False
            },
            {
                "title": "MITRE ATT&CK Matrix for Enterprise",
                "url": "https://attack.mitre.org/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "SIEM",
                "required_level": 4,
                "description": "Splunk/ELK query language, correlation searches, and dashboard triaging",
                "weight": 1.0
            },
            {
                "name": "Log Analysis",
                "required_level": 4,
                "description": "Analyzing syslog, Windows Event Logs, firewall and auth logs",
                "weight": 0.95
            },
            {
                "name": "Network Security",
                "required_level": 3,
                "description": "Understanding TCP/IP flags, DNS tunneling, and suspicious traffic",
                "weight": 0.85
            },
            {
                "name": "Incident Response",
                "required_level": 3,
                "description": "Alert verification, ticket escalation, and initial host isolation",
                "weight": 0.85
            },
            {
                "name": "Threat Analysis",
                "required_level": 3,
                "description": "Correlating IOCs with VirusTotal, AlienVault OTX, and Threat Intel feeds",
                "weight": 0.8
            },
            {
                "name": "Linux",
                "required_level": 3,
                "description": "Reviewing Linux auth logs, bash command histories, and cron jobs",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Wireshark",
                "required_level": 3,
                "description": "Extracting PCAP payloads and identifying malware beacons"
            },
            {
                "name": "Python",
                "required_level": 2,
                "description": "Automating threat intelligence lookups via REST APIs"
            },
            {
                "name": "EDR Tools",
                "required_level": 2,
                "description": "Inspecting endpoint processes and parent-child tree execution"
            },
            {
                "name": "Malware Analysis",
                "required_level": 2,
                "description": "Basic static analysis, hash calculation, and sandbox execution"
            },
            {
                "name": "Git",
                "required_level": 2,
                "description": "Maintaining detection rule repositories and playbooks"
            }
        ],
        "soft_skills": [
            {
                "name": "Alert Vigilance",
                "description": "Maintaining focus to separate critical signals from noisy security alarms"
            },
            {
                "name": "Clear Incident Reporting",
                "description": "Writing precise, factual incident summaries for engineering teams"
            }
        ]
    },
    {
        "id": "penetration-tester",
        "name": "Penetration Tester",
        "category": "Cybersecurity",
        "tagline": "Simulate adversary attacks to identify and remediate security vulnerabilities ethically.",
        "demand_level": "High",
        "description": "Penetration Testers (Ethical Hackers) simulate real-world cyberattacks on networks, web applications, and systems to expose security weaknesses before malicious hackers can exploit them.",
        "suitable_backgrounds": [
            "B.Tech CS / IT / Cyber",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95.5L \u2013 \u20b920L per annum (India)",
        "avg_salary": "\u20b99.2L",
        "tools": [
            "Burp Suite",
            "Kali Linux",
            "Nmap",
            "Metasploit",
            "OWASP ZAP",
            "SQLmap",
            "Hydra"
        ],
        "interview_topics": [
            "OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, IDOR)",
            "Privilege escalation techniques (Linux & Windows)",
            "Network pivoting & port forwarding",
            "Active Directory attack basics (Kerberoasting)",
            "Ethical disclosure guidelines & reporting"
        ],
        "recommended_projects": [
            "Comprehensive Web App Penetration Test on DVWA / Juice Shop with detailed findings report",
            "Custom Vulnerability Scanner in Python checking for exposed API keys and outdated headers"
        ],
        "learning_resources": [
            {
                "title": "PortSwigger Web Security Academy",
                "url": "https://portswigger.net/web-security",
                "type": "Interactive",
                "is_free": True
            },
            {
                "title": "Hack The Box Academy",
                "url": "https://academy.hackthebox.com/",
                "type": "Interactive",
                "is_free": False
            }
        ],
        "core_skills": [
            {
                "name": "Web Application Security",
                "required_level": 4,
                "description": "OWASP Top 10: SQL injection, Cross-Site Scripting, IDOR, and auth flaws",
                "weight": 1.0
            },
            {
                "name": "Burp Suite",
                "required_level": 4,
                "description": "Intercepting proxies, Repeater, Intruder, and custom extension usage",
                "weight": 0.95
            },
            {
                "name": "Linux",
                "required_level": 4,
                "description": "Kali Linux navigation, terminal scripting, permissions, and privilege checks",
                "weight": 0.9
            },
            {
                "name": "Network Security",
                "required_level": 3,
                "description": "Nmap port scanning, banner grabbing, and protocol exploitation",
                "weight": 0.85
            },
            {
                "name": "Python",
                "required_level": 3,
                "description": "Writing custom exploit proof-of-concepts and payload scripts",
                "weight": 0.8
            },
            {
                "name": "Git",
                "required_level": 2,
                "description": "Managing tool repositories and automation scripts",
                "weight": 0.7
            }
        ],
        "secondary_skills": [
            {
                "name": "Metasploit",
                "required_level": 3,
                "description": "Exploit modules, meterpreter payloads, and auxiliary scanners"
            },
            {
                "name": "Bash",
                "required_level": 3,
                "description": "Rapid command-line reconnaissance and pipeline automation"
            },
            {
                "name": "Cryptography",
                "required_level": 2,
                "description": "Weak ciphers, hashing collisions, and certificate misconfigurations"
            },
            {
                "name": "API Testing",
                "required_level": 3,
                "description": "Auditing REST and GraphQL endpoints for authorization flaws"
            },
            {
                "name": "Reverse Engineering",
                "required_level": 2,
                "description": "Basic binary inspection with Ghidra or GDB"
            }
        ],
        "soft_skills": [
            {
                "name": "Ethical Integrity",
                "description": "Strict adherence to scope of work, rules of engagement, and authorization"
            },
            {
                "name": "Adversarial Thinking",
                "description": "Thinking like an attacker to anticipate non-traditional exploitation paths"
            }
        ]
    },
    {
        "id": "security-engineer",
        "name": "Security Engineer",
        "category": "Cybersecurity",
        "tagline": "Engineer resilient security architectures, cryptographic controls, and DevSecOps pipelines.",
        "demand_level": "Very High",
        "description": "Security Engineers design, implement, and automate technical defense mechanisms, cryptographic keys, IAM boundaries, and secure code validation pipelines across software architectures.",
        "suitable_backgrounds": [
            "B.Tech CS / IT / Cyber",
            "MCA",
            "B.Sc Computer Science",
            "BCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96L \u2013 \u20b922L per annum (India)",
        "avg_salary": "\u20b910.0L",
        "tools": [
            "GitLab CI / GitHub Actions",
            "Trivy / Snyk",
            "HashiCorp Vault",
            "Docker",
            "AWS IAM",
            "Linux"
        ],
        "interview_topics": [
            "DevSecOps pipeline stages (SAST, DAST, SCA)",
            "Public Key Infrastructure (PKI) & Secrets Management",
            "Zero Trust Architecture principles",
            "Authentication protocols (OAuth 2.0, OpenID Connect, SAML)",
            "Container isolation & Linux cgroups"
        ],
        "recommended_projects": [
            "DevSecOps CI/CD Pipeline with automated SAST (Semgrep), container scanning (Trivy), and secret detection",
            "Centralized Secrets Management Service using HashiCorp Vault with dynamic database credentials"
        ],
        "learning_resources": [
            {
                "title": "OWASP DevSecOps Guideline",
                "url": "https://owasp.org/www-project-devsecops-guideline/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "HashiCorp Vault Tutorials",
                "url": "https://developer.hashicorp.com/vault/tutorials",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Application Security",
                "required_level": 4,
                "description": "Secure coding practices, code reviews, and threat modeling",
                "weight": 1.0
            },
            {
                "name": "Cloud Security",
                "required_level": 4,
                "description": "Cloud IAM, principle of least privilege, security groups, and encryption",
                "weight": 0.95
            },
            {
                "name": "Linux",
                "required_level": 4,
                "description": "Kernel hardening, SSH security, firewall (iptables/nftables), and PAM",
                "weight": 0.85
            },
            {
                "name": "Cryptography",
                "required_level": 3,
                "description": "Key rotation, TLS certificates, symmetric/asymmetric algorithms",
                "weight": 0.85
            },
            {
                "name": "CI/CD",
                "required_level": 3,
                "description": "Integrating security scanners into automated deployment workflows",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control and managing security policy code",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Docker",
                "required_level": 3,
                "description": "Container image scanning, rootless containers, and security policies"
            },
            {
                "name": "Python",
                "required_level": 3,
                "description": "Writing security automation scripts and policy validators"
            },
            {
                "name": "Terraform",
                "required_level": 2,
                "description": "Enforcing security baselines in infrastructure as code"
            },
            {
                "name": "Networking",
                "required_level": 3,
                "description": "VPC segmentation, zero-trust network models, and egress filtering"
            },
            {
                "name": "Secrets Management",
                "required_level": 3,
                "description": "Vault, AWS Secrets Manager, and credential lifecycle"
            }
        ],
        "soft_skills": [
            {
                "name": "Defensive Mindset",
                "description": "Designing defenses under the assumption that components will be breached"
            },
            {
                "name": "Cross-Functional Collaboration",
                "description": "Helping developers fix flaws without halting product releases"
            }
        ]
    },
    {
        "id": "qa-engineer",
        "name": "QA Engineer",
        "category": "Software Testing",
        "tagline": "Ensure product excellence through rigorous test plans, bug tracking, and regression analysis.",
        "demand_level": "High",
        "description": "Quality Assurance (QA) Engineers design comprehensive test scenarios, execute manual and automated validations, verify user requirements, and ensure software deliverables are stable and bug-free.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "B.Sc Computer Science",
            "MCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94L \u2013 \u20b914L per annum (India)",
        "avg_salary": "\u20b96.8L",
        "tools": [
            "Jira",
            "Postman",
            "TestRail",
            "Chrome DevTools",
            "SQL",
            "Git"
        ],
        "interview_topics": [
            "SDLC vs STLC phases",
            "Equivalence partitioning & boundary value analysis",
            "Severity vs Priority in defect lifecycle",
            "Smoke vs Sanity vs Regression testing",
            "API status codes & validation methods"
        ],
        "recommended_projects": [
            "Comprehensive Test Plan & Bug Life Cycle Documentation for an E-Commerce Web Application",
            "REST API Test Suite in Postman with environment variables, assertions, and runner automation"
        ],
        "learning_resources": [
            {
                "title": "Guru99 Software Testing Tutorial",
                "url": "https://www.guru99.com/software-testing.html",
                "type": "Tutorial",
                "is_free": True
            },
            {
                "title": "Postman API Testing Documentation",
                "url": "https://learning.postman.com/docs/writing-scripts/test-scripts/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Test Case Design",
                "required_level": 4,
                "description": "Authoring edge cases, happy paths, acceptance criteria, and traceability",
                "weight": 1.0
            },
            {
                "name": "Functional Testing",
                "required_level": 4,
                "description": "Black-box validation, exploratory testing, and feature verification",
                "weight": 0.95
            },
            {
                "name": "Bug Life Cycle",
                "required_level": 4,
                "description": "Writing reproducible bug reports, steps, attachments, and tracking in Jira",
                "weight": 0.9
            },
            {
                "name": "REST APIs",
                "required_level": 3,
                "description": "Testing endpoints with Postman, validating JSON schemas and response codes",
                "weight": 0.85
            },
            {
                "name": "SQL",
                "required_level": 3,
                "description": "Querying relational databases to verify back-end data consistency",
                "weight": 0.8
            },
            {
                "name": "Git",
                "required_level": 2,
                "description": "Accessing code repositories, inspecting pull requests, and changelogs",
                "weight": 0.7
            }
        ],
        "secondary_skills": [
            {
                "name": "Regression Testing",
                "required_level": 4,
                "description": "Executing test suites to verify new changes do not break existing behavior"
            },
            {
                "name": "Jira",
                "required_level": 4,
                "description": "Managing sprints, user stories, bug workflows, and velocity"
            },
            {
                "name": "Postman",
                "required_level": 3,
                "description": "Collections, environments, and automated assertions"
            },
            {
                "name": "HTML5",
                "required_level": 2,
                "description": "Inspecting DOM elements and attributes in developer tools"
            },
            {
                "name": "Test Planning",
                "required_level": 3,
                "description": "Formulating scope, resource allocation, and pass/fail thresholds"
            }
        ],
        "soft_skills": [
            {
                "name": "Attention to Detail",
                "description": "Spotting subtle UI misalignments, unexpected edge cases, and wording errors"
            },
            {
                "name": "Quality Advocacy",
                "description": "Championing end-user satisfaction and software reliability throughout sprints"
            }
        ]
    },
    {
        "id": "automation-test-engineer",
        "name": "Automation Test Engineer",
        "category": "Software Testing",
        "tagline": "Build scalable automated test suites and continuous quality gates with modern frameworks.",
        "demand_level": "Very High",
        "description": "Automation Test Engineers develop maintainable automated test scripts for web, API, and mobile applications using frameworks like Selenium, Playwright, and Pytest/TestNG integrated into CI/CD pipelines.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95L \u2013 \u20b917L per annum (India)",
        "avg_salary": "\u20b98.2L",
        "tools": [
            "Selenium",
            "Playwright",
            "Python / Java",
            "Pytest / TestNG",
            "Git",
            "Postman",
            "Jenkins"
        ],
        "interview_topics": [
            "Page Object Model (POM) design pattern",
            "Dynamic element locators (XPath vs CSS Selectors)",
            "Handling asynchronous waits (Explicit vs Implicit)",
            "Data-driven testing with parameterized fixtures",
            "CI/CD automated regression triggers"
        ],
        "recommended_projects": [
            "End-to-End Test Automation Suite using Playwright & TypeScript with Page Object Model and HTML reports",
            "Data-Driven API Test Framework in Python using Pytest, Requests, and Jenkins integration"
        ],
        "learning_resources": [
            {
                "title": "Playwright Official Getting Started",
                "url": "https://playwright.dev/docs/intro",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Test Automation University",
                "url": "https://testautomationu.applitools.com/",
                "type": "Course",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Selenium",
                "required_level": 4,
                "description": "WebDriver APIs, element locators, explicit waits, and browser actions",
                "weight": 1.0
            },
            {
                "name": "Python",
                "required_level": 4,
                "description": "Scripting test logic, assertions, OOP abstractions, and data parsing",
                "weight": 0.95
            },
            {
                "name": "Playwright",
                "required_level": 3,
                "description": "Modern headless browser testing, tracing, auto-waiting, and network mocking",
                "weight": 0.85
            },
            {
                "name": "Test Case Design",
                "required_level": 4,
                "description": "Designing robust, non-flaky test specifications and assertion logic",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Managing test repositories and versioning framework code",
                "weight": 0.8
            },
            {
                "name": "REST APIs",
                "required_level": 3,
                "description": "Automating API requests, status checks, and response body schemas",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "CI/CD",
                "required_level": 3,
                "description": "Triggering test automation runs in GitHub Actions or Jenkins pipelines"
            },
            {
                "name": "SQL",
                "required_level": 3,
                "description": "Database queries for test fixture setup and data verification"
            },
            {
                "name": "Java",
                "required_level": 3,
                "description": "Alternative testing in Java with TestNG and Maven"
            },
            {
                "name": "Docker",
                "required_level": 2,
                "description": "Running tests inside containerized browser grids (Selenium Grid)"
            },
            {
                "name": "JMeter",
                "required_level": 2,
                "description": "Basic load and performance testing for web endpoints"
            }
        ],
        "soft_skills": [
            {
                "name": "Code Maintainability",
                "description": "Writing reusable, modular test helper functions that don't break with minor UI changes"
            },
            {
                "name": "Collaborative QA",
                "description": "Working with developers to ensure code is testable and instrumented with IDs"
            }
        ]
    },
    {
        "id": "software-test-engineer",
        "name": "Software Test Engineer",
        "category": "Software Testing",
        "tagline": "Execute end-to-end software verification across UI, APIs, and data persistence layers.",
        "demand_level": "High",
        "description": "Software Test Engineers execute functional, exploratory, performance, and regression testing across complex distributed software systems, bridging manual domain expertise with automated scripting.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "B.Sc Computer Science",
            "MCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.5L \u2013 \u20b915L per annum (India)",
        "avg_salary": "\u20b97.5L",
        "tools": [
            "Postman",
            "Cypress / Playwright",
            "SQL",
            "Jira",
            "Git",
            "Linux"
        ],
        "interview_topics": [
            "Test matrix & coverage strategies",
            "Cross-browser and cross-device testing",
            "REST vs SOAP testing approaches",
            "Database verification and rollback tests",
            "Non-functional testing parameters"
        ],
        "recommended_projects": [
            "Cross-Browser E-Commerce Quality Assurance Matrix with Postman API tests and Cypress smoke tests",
            "Banking Transaction Regression Suite with complex SQL database state validations"
        ],
        "learning_resources": [
            {
                "title": "Cypress Official Documentation",
                "url": "https://docs.cypress.io/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Ministry of Testing Resources",
                "url": "https://www.ministryoftesting.com/",
                "type": "Community",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Test Case Design",
                "required_level": 4,
                "description": "Structured test plans, traceability matrices, and edge case coverage",
                "weight": 1.0
            },
            {
                "name": "REST APIs",
                "required_level": 4,
                "description": "API testing, headers, auth tokens, status codes, and JSON assertions",
                "weight": 0.95
            },
            {
                "name": "SQL",
                "required_level": 4,
                "description": "Querying relational databases to validate state changes and transactions",
                "weight": 0.9
            },
            {
                "name": "Functional Testing",
                "required_level": 4,
                "description": "System testing, integration testing, and acceptance workflows",
                "weight": 0.9
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control for test scripts and issue reproductions",
                "weight": 0.75
            },
            {
                "name": "Bug Life Cycle",
                "required_level": 4,
                "description": "Defect logging, reproduction steps, severity tagging, and re-testing",
                "weight": 0.85
            }
        ],
        "secondary_skills": [
            {
                "name": "Python",
                "required_level": 3,
                "description": "Scripting automated checks and data generation"
            },
            {
                "name": "Cypress",
                "required_level": 3,
                "description": "Modern web application end-to-end testing"
            },
            {
                "name": "Linux",
                "required_level": 2,
                "description": "Inspecting server logs and running test scripts in terminal"
            },
            {
                "name": "Jira",
                "required_level": 3,
                "description": "Sprint tracking, requirements linking, and bug boards"
            },
            {
                "name": "Postman",
                "required_level": 4,
                "description": "API collection runs and automated test assertions"
            }
        ],
        "soft_skills": [
            {
                "name": "Systematic Verification",
                "description": "Following disciplined verification checklists to leave no feature unchecked"
            },
            {
                "name": "User Perspective",
                "description": "Advocating for user experience simplicity and error tolerance"
            }
        ]
    },
    {
        "id": "business-analyst",
        "name": "Business Analyst",
        "category": "Business and Product",
        "tagline": "Bridge business objectives and engineering implementations with clear technical requirements.",
        "demand_level": "Very High",
        "description": "Business Analysts analyze business domains, document processes, gather stakeholder requirements, and translate commercial goals into actionable technical specifications and user stories.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "B.Com / BBA Analytics",
            "MCA",
            "MBA Tech"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95L \u2013 \u20b917L per annum (India)",
        "avg_salary": "\u20b98.2L",
        "tools": [
            "Jira",
            "Confluence",
            "Excel",
            "Figma",
            "SQL",
            "Draw.io / Visio",
            "Power BI"
        ],
        "interview_topics": [
            "Business Requirements Document (BRD) vs Functional Specs (FSD)",
            "Writing effective Agile user stories with INVEST criteria",
            "Process mapping with BPMN 2.0 flowcharts",
            "Gap analysis and SWOT frameworks",
            "Stakeholder interview and prioritization techniques"
        ],
        "recommended_projects": [
            "Complete Business Requirements Package & Wireframes for a FinTech Loan Origination Platform",
            "Operations Process Optimization & Gap Analysis with BPMN diagrams and KPI dashboard in Power BI"
        ],
        "learning_resources": [
            {
                "title": "IIBA Business Analysis Guide",
                "url": "https://www.iiba.org/business-analysis-resources/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Atlassian Agile Coach",
                "url": "https://www.atlassian.com/agile",
                "type": "Tutorial",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Business Analysis",
                "required_level": 4,
                "description": "Requirements elicitation, stakeholder discovery, and functional specification",
                "weight": 1.0
            },
            {
                "name": "Requirements Gathering",
                "required_level": 4,
                "description": "Documenting BRDs, FSDs, user acceptance criteria, and traceability",
                "weight": 1.0
            },
            {
                "name": "SQL",
                "required_level": 3,
                "description": "Querying relational data to validate business hypotheses and metrics",
                "weight": 0.85
            },
            {
                "name": "Excel",
                "required_level": 4,
                "description": "Financial modeling, pivot tables, data visualization, and scenario planning",
                "weight": 0.9
            },
            {
                "name": "Process Mapping",
                "required_level": 4,
                "description": "BPMN flowcharts, sequence diagrams, and current-state/future-state modeling",
                "weight": 0.85
            },
            {
                "name": "Jira",
                "required_level": 3,
                "description": "Backlog grooming, sprint planning, and writing Agile user stories",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "Power BI",
                "required_level": 3,
                "description": "Building analytical dashboards to track business KPIs"
            },
            {
                "name": "Wireframing",
                "required_level": 3,
                "description": "Creating low-fidelity screen mockups in Figma or Balsamiq"
            },
            {
                "name": "Communication",
                "required_level": 4,
                "description": "Translating complex engineering limits into plain business language"
            },
            {
                "name": "Data Analysis",
                "required_level": 3,
                "description": "Benchmarking operational metrics and cost/benefit models"
            },
            {
                "name": "Problem Solving",
                "required_level": 4,
                "description": "Resolving conflicting requirements between departmental leaders"
            }
        ],
        "soft_skills": [
            {
                "name": "Stakeholder Management",
                "description": "Building consensus among conflicting business and engineering priorities"
            },
            {
                "name": "Active Listening",
                "description": "Uncovering unstated customer pain points during requirements interviews"
            }
        ]
    },
    {
        "id": "product-analyst",
        "name": "Product Analyst",
        "category": "Business and Product",
        "tagline": "Analyze user behavior, optimize conversion funnels, and guide product roadmap decisions.",
        "demand_level": "High",
        "description": "Product Analysts evaluate user interactions, retention cohorts, feature engagement, and conversion funnels, using behavioral telemetry and statistical experiments to optimize digital product growth.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "B.Sc Statistics / Mathematics",
            "B.Com Analytics"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95.5L \u2013 \u20b918L per annum (India)",
        "avg_salary": "\u20b98.8L",
        "tools": [
            "Mixpanel",
            "Amplitude",
            "SQL",
            "Google Analytics 4",
            "Tableau",
            "Python"
        ],
        "interview_topics": [
            "A/B test design, sample sizing & statistical power",
            "Conversion funnel analysis & drop-off diagnosis",
            "Cohort analysis & retention curves (D1, D7, D30)",
            "North Star Metric & input metric hierarchies",
            "Event taxonomy & tracking plan design"
        ],
        "recommended_projects": [
            "E-Commerce Checkout Funnel Optimization & A/B Experiment Analysis with SQL and Python",
            "SaaS User Retention & Feature Engagement Dashboard in Mixpanel / Amplitude and Tableau"
        ],
        "learning_resources": [
            {
                "title": "Amplitude Product Analytics Certification",
                "url": "https://academy.amplitude.com/",
                "type": "Course",
                "is_free": True
            },
            {
                "title": "Reforge Product Strategy Essays",
                "url": "https://www.reforge.com/blog",
                "type": "Blog",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "SQL",
                "required_level": 4,
                "description": "Extracting timeseries events, window functions, and user cohort aggregations",
                "weight": 1.0
            },
            {
                "name": "Product Analytics",
                "required_level": 4,
                "description": "Funnel analysis, user journeys, event tracking, and cohort retention",
                "weight": 1.0
            },
            {
                "name": "Statistics",
                "required_level": 4,
                "description": "A/B testing, hypothesis testing, confidence intervals, and p-values",
                "weight": 0.9
            },
            {
                "name": "Excel",
                "required_level": 4,
                "description": "Cohort modeling, sensitivity analysis, and metric trend forecasts",
                "weight": 0.85
            },
            {
                "name": "Data Visualization",
                "required_level": 3,
                "description": "Communicating insights with Tableau, Power BI, or Python charts",
                "weight": 0.8
            },
            {
                "name": "Business Analysis",
                "required_level": 3,
                "description": "Connecting user behavioral metrics with commercial unit economics",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "Python",
                "required_level": 3,
                "description": "Statistical modeling, pandas analysis, and automation"
            },
            {
                "name": "Tableau",
                "required_level": 3,
                "description": "Interactive product metric dashboards for leadership"
            },
            {
                "name": "Communication",
                "required_level": 4,
                "description": "Presenting experiment findings to engineers and designers"
            },
            {
                "name": "A/B Testing",
                "required_level": 4,
                "description": "Designing controlled experiments and interpreting significance"
            },
            {
                "name": "Problem Solving",
                "required_level": 3,
                "description": "Formulating hypotheses on why users abandon specific workflows"
            }
        ],
        "soft_skills": [
            {
                "name": "Data-Driven Decision Making",
                "description": "Relying on empirical telemetry rather than subjective opinions"
            },
            {
                "name": "Product Sense",
                "description": "Connecting numbers on a screen to real human behaviors and frustrations"
            }
        ]
    },
    {
        "id": "product-manager",
        "name": "Product Manager",
        "category": "Business and Product",
        "tagline": "Define product vision, orchestrate cross-functional delivery, and maximize customer value.",
        "demand_level": "Extremely High",
        "description": "Product Managers guide the strategy, roadmap, and feature execution of digital products, collaborating with engineering, design, marketing, and executives to deliver high-impact user experiences.",
        "suitable_backgrounds": [
            "B.Tech CS / IT + MBA",
            "B.Tech CS / IT",
            "BCA / MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / APM / Freshers)",
        "salary_range": "\u20b98L \u2013 \u20b930L per annum (India)",
        "avg_salary": "\u20b914.0L",
        "tools": [
            "Jira",
            "Figma",
            "Notion",
            "Mixpanel",
            "Linear",
            "Miro",
            "Confluence"
        ],
        "interview_topics": [
            "Product sense: Designing a product for a specific niche",
            "Prioritization frameworks (RICE, MoSCoW, Kano Model)",
            "Metrics: Defining North Star and counter-metrics",
            "Execution: Handling engineering delays and scope trade-offs",
            "Root cause analysis for dropped engagement"
        ],
        "recommended_projects": [
            "Complete Product Requirement Document (PRD) & Prototype for an AI Study Planner with RICE scoring",
            "Go-To-Market & Growth Strategy Case Study for a B2B SaaS Workflow Tool"
        ],
        "learning_resources": [
            {
                "title": "Product School Resources & Books",
                "url": "https://productschool.com/resources",
                "type": "Community",
                "is_free": True
            },
            {
                "title": "Lenny's Newsletter (Product Management)",
                "url": "https://www.lennysnewsletter.com/",
                "type": "Blog",
                "is_free": False
            }
        ],
        "core_skills": [
            {
                "name": "Product Roadmap",
                "required_level": 4,
                "description": "Strategic milestone planning, vision alignment, and release cadence",
                "weight": 1.0
            },
            {
                "name": "Agile/Scrum",
                "required_level": 4,
                "description": "Sprint ceremonies, backlog refinement, story points, and velocity",
                "weight": 0.95
            },
            {
                "name": "User Stories",
                "required_level": 4,
                "description": "Authoring acceptance criteria, user personas, and edge case definitions",
                "weight": 0.95
            },
            {
                "name": "Market Research",
                "required_level": 3,
                "description": "Competitive analysis, user interviews, TAM calculation, and surveys",
                "weight": 0.85
            },
            {
                "name": "Product Analytics",
                "required_level": 3,
                "description": "Tracking feature adoption, DAU/MAU ratios, and drop-off rates",
                "weight": 0.85
            },
            {
                "name": "Communication",
                "required_level": 4,
                "description": "Cross-functional alignment across engineers, designers, and executives",
                "weight": 0.9
            }
        ],
        "secondary_skills": [
            {
                "name": "Wireframing",
                "required_level": 3,
                "description": "Rapid paper and Figma wireframing to illustrate UX concepts"
            },
            {
                "name": "SQL",
                "required_level": 2,
                "description": "Self-service querying of user and transaction metrics"
            },
            {
                "name": "Business Analysis",
                "required_level": 3,
                "description": "Understanding revenue models, churn impact, and CAC/LTV economics"
            },
            {
                "name": "Jira",
                "required_level": 4,
                "description": "Managing team delivery boards and issue epics"
            },
            {
                "name": "A/B Testing",
                "required_level": 3,
                "description": "Evaluating feature rollouts with statistical experiment tests"
            }
        ],
        "soft_skills": [
            {
                "name": "Leadership Without Authority",
                "description": "Inspiring engineering and design teams through clear rationale and vision"
            },
            {
                "name": "Customer Empathy",
                "description": "Relentlessly advocating for the end user's emotional and functional needs"
            }
        ]
    },
    {
        "id": "project-coordinator",
        "name": "Project Coordinator",
        "category": "Business and Product",
        "tagline": "Organize schedules, track milestones, eliminate blockers, and ensure timely project delivery.",
        "demand_level": "High",
        "description": "Project Coordinators facilitate smooth project execution by organizing schedules, tracking deliverables, documenting risks, facilitating team communication, and managing administrative sprint artifacts.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "BBA / B.Com",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.2L \u2013 \u20b914L per annum (India)",
        "avg_salary": "\u20b96.8L",
        "tools": [
            "Jira",
            "Asana",
            "Trello",
            "Confluence",
            "Excel / Google Sheets",
            "Slack / MS Teams"
        ],
        "interview_topics": [
            "Agile vs Waterfall project life cycles",
            "Managing project constraints (Scope, Time, Cost triangle)",
            "Risk registers & mitigation planning",
            "Sprint velocity & burndown chart interpretation",
            "Handling scope creep during delivery"
        ],
        "recommended_projects": [
            "End-to-End Software Release Plan in Jira with Gantt schedules, risk register, and RACI matrix",
            "Sprint Coordination & Retrospective Documentation for a multi-disciplinary development team"
        ],
        "learning_resources": [
            {
                "title": "PMI Certified Associate in Project Management (CAPM) Guide",
                "url": "https://www.pmi.org/certifications/certified-associate-capm",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Asana Project Management Basics",
                "url": "https://asana.com/resources/project-management-basics",
                "type": "Tutorial",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Project Scheduling",
                "required_level": 4,
                "description": "Milestone planning, dependency tracking, Gantt charts, and deadlines",
                "weight": 1.0
            },
            {
                "name": "Jira",
                "required_level": 4,
                "description": "Sprint boards, issue assignments, epic tracking, and workflow transitions",
                "weight": 0.95
            },
            {
                "name": "Agile/Scrum",
                "required_level": 3,
                "description": "Standup facilitation, sprint reviews, retrospectives, and backlog grooming",
                "weight": 0.85
            },
            {
                "name": "Risk Management",
                "required_level": 3,
                "description": "Identifying delivery risks, documenting contingencies, and escalating blockers",
                "weight": 0.85
            },
            {
                "name": "Excel",
                "required_level": 4,
                "description": "Budget tracking, resource allocation tables, and project status sheets",
                "weight": 0.85
            },
            {
                "name": "Communication",
                "required_level": 4,
                "description": "Clear meeting minutes, stakeholder status updates, and action item logs",
                "weight": 0.9
            }
        ],
        "secondary_skills": [
            {
                "name": "Confluence",
                "required_level": 4,
                "description": "Maintaining team wikis, project charters, and documentation"
            },
            {
                "name": "Asana",
                "required_level": 3,
                "description": "Task delegation, workflow templates, and milestone management"
            },
            {
                "name": "Business Analysis",
                "required_level": 2,
                "description": "Understanding deliverable requirements and dependencies"
            },
            {
                "name": "Time Management",
                "required_level": 4,
                "description": "Ensuring deliverables adhere strictly to contractual timelines"
            },
            {
                "name": "Problem Solving",
                "required_level": 3,
                "description": "Resolving scheduling conflicts and resource bottlenecks"
            }
        ],
        "soft_skills": [
            {
                "name": "Organizational Rigor",
                "description": "Meticulous documentation and tracking of every team action item"
            },
            {
                "name": "Diplomatic Communication",
                "description": "Encouraging timely deliverables without creating inter-team friction"
            }
        ]
    },
    {
        "id": "sql-developer",
        "name": "SQL Developer",
        "category": "Database and Data Infrastructure",
        "tagline": "Engineer high-performance relational database schemas, stored procedures, and complex queries.",
        "demand_level": "High",
        "description": "SQL Developers specialize in relational database design, query optimization, complex stored procedures, indexing strategies, and ETL data loading across enterprise SQL platforms.",
        "suitable_backgrounds": [
            "BCA",
            "B.Tech CS / IT",
            "B.Sc Computer Science",
            "MCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.8L \u2013 \u20b916L per annum (India)",
        "avg_salary": "\u20b97.8L",
        "tools": [
            "PostgreSQL",
            "SQL Server / SSMS",
            "MySQL Workbench",
            "DBeaver",
            "Git",
            "Python"
        ],
        "interview_topics": [
            "Clustered vs Non-Clustered Indexes & B-Trees",
            "Window functions (ROW_NUMBER, DENSE_RANK, LEAD/LAG)",
            "Query execution plans & table scans",
            "Transactions, ACID properties, and isolation levels",
            "Normalization (1NF to BCNF) vs intentional denormalization"
        ],
        "recommended_projects": [
            "Enterprise Inventory & Order Processing Database with normalized schemas, stored procedures, and triggers",
            "Database Performance Tuning Case Study optimizing slow queries with indexing and CTE rewrites"
        ],
        "learning_resources": [
            {
                "title": "PostgreSQL Tutorial",
                "url": "https://www.postgresqltutorial.com/",
                "type": "Tutorial",
                "is_free": True
            },
            {
                "title": "Use The Index, Luke! (SQL Indexing Guide)",
                "url": "https://use-the-index-luke.com/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "SQL",
                "required_level": 5,
                "description": "Expert SQL: complex joins, subqueries, CTEs, window functions, and aggregations",
                "weight": 1.0
            },
            {
                "name": "Database Design",
                "required_level": 4,
                "description": "Relational modeling, primary/foreign keys, normalization, and constraints",
                "weight": 0.95
            },
            {
                "name": "Query Optimization",
                "required_level": 4,
                "description": "Analyzing EXPLAIN plans, creating indexes, eliminating cartesian products",
                "weight": 0.95
            },
            {
                "name": "Stored Procedures",
                "required_level": 4,
                "description": "Authoring performant T-SQL or PL/pgSQL procedures, functions, and triggers",
                "weight": 0.9
            },
            {
                "name": "PostgreSQL",
                "required_level": 4,
                "description": "Schema configuration, data types, JSONB operations, and vacuuming",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control for database migration scripts (Flyway/Liquibase)",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Python",
                "required_level": 3,
                "description": "Scripting automated data loads, CSV parsing, and database connections"
            },
            {
                "name": "ETL Pipelines",
                "required_level": 3,
                "description": "Extracting, transforming, and loading large transactional datasets"
            },
            {
                "name": "Data Modeling",
                "required_level": 3,
                "description": "Entity Relationship Diagrams (ERDs) and schema documentation"
            },
            {
                "name": "Linux",
                "required_level": 2,
                "description": "Basic database server administration and bash automation"
            },
            {
                "name": "Data Warehousing",
                "required_level": 2,
                "description": "Star schema design for analytical queries"
            }
        ],
        "soft_skills": [
            {
                "name": "Data Integrity Mindset",
                "description": "Designing constraints and validations that prevent dirty or orphan records"
            },
            {
                "name": "Query Tuning Patience",
                "description": "Methodically benchmarking query latency down from seconds to milliseconds"
            }
        ]
    },
    {
        "id": "database-administrator",
        "name": "Database Administrator",
        "category": "Database and Data Infrastructure",
        "tagline": "Safeguard database uptime, disaster recovery, security auditing, and server performance.",
        "demand_level": "High",
        "description": "Database Administrators (DBAs) install, configure, monitor, and safeguard enterprise database management systems, ensuring high availability, continuous backup, security access, and fast recovery.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95L \u2013 \u20b918L per annum (India)",
        "avg_salary": "\u20b98.5L",
        "tools": [
            "PostgreSQL",
            "MySQL",
            "SQL Server",
            "Linux",
            "Bash",
            "Prometheus / pgWatch"
        ],
        "interview_topics": [
            "Backup strategies (Full, Differential, Transaction Log) & point-in-time recovery",
            "Replication topologies (Primary-Replica, Master-Master)",
            "User permission auditing and database encryption (TDE)",
            "Diagnosing CPU/memory resource bottlenecks and deadlocks",
            "Database maintenance (VACUUM, re-indexing, statistics updates)"
        ],
        "recommended_projects": [
            "Automated Database Backup & Point-in-Time Disaster Recovery Lab with PostgreSQL and Bash",
            "High-Availability Database Cluster with Master-Replica Streaming Replication and failover scripts"
        ],
        "learning_resources": [
            {
                "title": "PostgreSQL Administration Documentation",
                "url": "https://www.postgresql.org/docs/current/admin.html",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "MySQL Database Administration Guide",
                "url": "https://dev.mysql.com/doc/refman/8.0/en/administration.html",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "SQL",
                "required_level": 4,
                "description": "Administrative SQL queries, permission grants, roles, and schema audits",
                "weight": 0.95
            },
            {
                "name": "Database Administration",
                "required_level": 4,
                "description": "Installation, configuration, memory tuning, and storage management",
                "weight": 1.0
            },
            {
                "name": "Backup and Recovery",
                "required_level": 4,
                "description": "Full, differential, WAL archiving, point-in-time recovery, and restore drills",
                "weight": 1.0
            },
            {
                "name": "Linux",
                "required_level": 4,
                "description": "Server administration, disk mounting, file permissions, and process inspection",
                "weight": 0.9
            },
            {
                "name": "Performance Monitoring",
                "required_level": 3,
                "description": "Monitoring IOPS, connection pools, deadlocks, and buffer cache hits",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 2,
                "description": "Version control for administrative automation scripts",
                "weight": 0.7
            }
        ],
        "secondary_skills": [
            {
                "name": "Bash",
                "required_level": 3,
                "description": "Automating routine backups, rotation, and server health checks"
            },
            {
                "name": "Security Auditing",
                "required_level": 3,
                "description": "Enforcing least privilege, firewall rules, and auditing login logs"
            },
            {
                "name": "Query Optimization",
                "required_level": 3,
                "description": "Identifying long-running queries and advising developers on indexing"
            },
            {
                "name": "Replication",
                "required_level": 3,
                "description": "Configuring read replicas and failover mechanisms"
            },
            {
                "name": "Python",
                "required_level": 2,
                "description": "Maintenance scripting and alert automation"
            }
        ],
        "soft_skills": [
            {
                "name": "Disaster Preparedness",
                "description": "Relentlessly testing restores to ensure backups actually work when disasters strike"
            },
            {
                "name": "High Reliability Consciousness",
                "description": "Extreme caution when executing schema alters and maintenance in production"
            }
        ]
    },
    {
        "id": "data-warehouse-engineer",
        "name": "Data Warehouse Engineer",
        "category": "Database and Data Infrastructure",
        "tagline": "Design modern cloud data warehouses, columnar schemas, and enterprise analytics storage.",
        "demand_level": "Very High",
        "description": "Data Warehouse Engineers architect and manage large-scale analytical data repositories using modern cloud platforms like Snowflake, BigQuery, and Redshift, optimizing storage and query performance for BI.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "MCA",
            "B.Sc Computer Science",
            "BCA"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96L \u2013 \u20b922L per annum (India)",
        "avg_salary": "\u20b910.2L",
        "tools": [
            "Snowflake",
            "Google BigQuery",
            "dbt (data build tool)",
            "SQL",
            "Python",
            "Airflow",
            "Git"
        ],
        "interview_topics": [
            "OLTP vs OLAP architectures",
            "Dimensional modeling (Fact tables vs Dimension tables)",
            "Slowly Changing Dimensions (SCD Type 1, 2, 3)",
            "dbt models, tests, and documentation",
            "Columnar storage compression & micro-partitioning"
        ],
        "recommended_projects": [
            "Modern Cloud Data Warehouse on Snowflake or BigQuery modeled with dbt and star schema",
            "Automated ELT Pipeline transforming raw transactional JSON events into dimensional analytics marts"
        ],
        "learning_resources": [
            {
                "title": "dbt Learn Official Courses",
                "url": "https://courses.getdbt.com/",
                "type": "Course",
                "is_free": True
            },
            {
                "title": "Snowflake Documentation & Tutorials",
                "url": "https://docs.snowflake.com/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Data Warehousing",
                "required_level": 4,
                "description": "Star/Snowflake schema design, surrogate keys, fact/dimension tables",
                "weight": 1.0
            },
            {
                "name": "SQL",
                "required_level": 4,
                "description": "Advanced analytical SQL: window functions, complex joins, and aggregations",
                "weight": 1.0
            },
            {
                "name": "dbt",
                "required_level": 3,
                "description": "Data build tool: Jinja templating, incremental models, tests, and documentation",
                "weight": 0.9
            },
            {
                "name": "Data Modeling",
                "required_level": 4,
                "description": "Kimball dimensional modeling methodology and schema normalization",
                "weight": 0.9
            },
            {
                "name": "Python",
                "required_level": 3,
                "description": "Scripting data ingestion pipelines and API integrations",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control for analytical models and dbt repositories",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "Snowflake",
                "required_level": 3,
                "description": "Virtual warehouses, stages, clustering keys, and time travel"
            },
            {
                "name": "Apache Airflow",
                "required_level": 2,
                "description": "Orchestrating warehouse ELT batch workflows"
            },
            {
                "name": "ETL Pipelines",
                "required_level": 3,
                "description": "Loading unstructured and semi-structured (JSON) data into warehouses"
            },
            {
                "name": "Cloud Storage",
                "required_level": 3,
                "description": "Managing S3 / GCS buckets as staging layers"
            },
            {
                "name": "Data Governance",
                "required_level": 2,
                "description": "Managing data lineage, column-level security, and masking policies"
            }
        ],
        "soft_skills": [
            {
                "name": "Scalability Vision",
                "description": "Designing schemas that perform efficiently as data grows from gigabytes to terabytes"
            },
            {
                "name": "Data Pipeline Hygiene",
                "description": "Enforcing schema tests and validation gates before tables reach executive dashboards"
            }
        ]
    },
    {
        "id": "ui-designer",
        "name": "UI Designer",
        "category": "UI/UX and Design",
        "tagline": "Design beautiful, cohesive design systems, micro-interactions, and visual layouts.",
        "demand_level": "High",
        "description": "User Interface (UI) Designers craft aesthetically compelling, polished visual layouts, design tokens, iconography, and responsive design systems that make digital products delighting and intuitive.",
        "suitable_backgrounds": [
            "B.Des / B.Sc Design",
            "BCA",
            "B.Tech CS / IT",
            "B.A. Multimedia",
            "Self-Taught Portfolio"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.5L \u2013 \u20b916L per annum (India)",
        "avg_salary": "\u20b97.5L",
        "tools": [
            "Figma",
            "Adobe Illustrator",
            "Photoshop",
            "Principle",
            "Tokens Studio",
            "Whimsical"
        ],
        "interview_topics": [
            "Color theory (contrast ratios, 60-30-10 rule)",
            "Typography hierarchy & modular scales",
            "Design system tokens & component variants in Figma",
            "Micro-interactions and animation curves",
            "Developer handoff & design specification"
        ],
        "recommended_projects": [
            "Complete SaaS Design System in Figma with atomic components, variants, and light/dark modes",
            "High-Fidelity Mobile Banking UI Prototype with micro-interactions and developer specs"
        ],
        "learning_resources": [
            {
                "title": "Figma Learn Tutorials",
                "url": "https://help.figma.com/hc/en-us/categories/360002051613-Learn-design",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Refactoring UI by Adam Wathan & Steve Schoger",
                "url": "https://www.refactoringui.com/",
                "type": "Book",
                "is_free": False
            }
        ],
        "core_skills": [
            {
                "name": "Figma",
                "required_level": 4,
                "description": "Auto-layout, components, variants, variables, prototyping, and smart animate",
                "weight": 1.0
            },
            {
                "name": "Visual Design",
                "required_level": 4,
                "description": "Hierarchy, visual balance, whitespace, contrast, and layout composition",
                "weight": 1.0
            },
            {
                "name": "Design Systems",
                "required_level": 4,
                "description": "Atomic design principles, reusable component libraries, and style guides",
                "weight": 0.9
            },
            {
                "name": "Typography",
                "required_level": 3,
                "description": "Font pairing, line height, letter spacing, and responsive text scaling",
                "weight": 0.85
            },
            {
                "name": "Color Theory",
                "required_level": 3,
                "description": "Palette generation, accessibility contrast (WCAG AA/AAA), and dark modes",
                "weight": 0.85
            },
            {
                "name": "Responsive UI",
                "required_level": 4,
                "description": "Grid systems, flex layouts, mobile/tablet/desktop breakpoint adaptations",
                "weight": 0.9
            }
        ],
        "secondary_skills": [
            {
                "name": "Prototyping",
                "required_level": 3,
                "description": "Building interactive click-through prototypes with realistic state changes"
            },
            {
                "name": "Micro-interactions",
                "required_level": 3,
                "description": "Designing hover, active, loading, and success micro-animations"
            },
            {
                "name": "HTML/CSS Basics",
                "required_level": 2,
                "description": "Understanding CSS Flexbox and Grid to design developer-friendly UI"
            },
            {
                "name": "Iconography",
                "required_level": 3,
                "description": "Vector icon creation and cohesive stroke weight styling"
            },
            {
                "name": "User Research",
                "required_level": 2,
                "description": "Reviewing user feedback to refine visual clarity and usability"
            }
        ],
        "soft_skills": [
            {
                "name": "Aesthetic Sensibility",
                "description": "Instinctive appreciation for balance, elegance, and modern digital aesthetics"
            },
            {
                "name": "Developer Handoff Communication",
                "description": "Documenting spacing, tokens, and states clearly for frontend teams"
            }
        ]
    },
    {
        "id": "ux-designer",
        "name": "UX Designer",
        "category": "UI/UX and Design",
        "tagline": "Uncover user needs, conduct research, map journeys, and architect intuitive product workflows.",
        "demand_level": "High",
        "description": "User Experience (UX) Designers research human behaviors, define information architecture, build wireframes, and run usability tests to solve user problems and create frictionless product flows.",
        "suitable_backgrounds": [
            "B.Des / M.Des",
            "BCA",
            "B.Tech CS / IT",
            "B.Sc Psychology / Cognitive Science",
            "Portfolio"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95L \u2013 \u20b918L per annum (India)",
        "avg_salary": "\u20b98.0L",
        "tools": [
            "Figma",
            "Miro / FigJam",
            "Maze",
            "UserTesting",
            "Notion",
            "OptimalSort"
        ],
        "interview_topics": [
            "Design Thinking methodology (Empathize, Define, Ideate, Prototype, Test)",
            "Conducting user interviews without leading questions",
            "Information architecture (Card sorting, tree testing)",
            "Usability testing & SUS (System Usability Scale) scoring",
            "Jakob Nielsen's 10 Usability Heuristics"
        ],
        "recommended_projects": [
            "Comprehensive UX Case Study: Redesigning Healthcare Appointment Booking with User Research & Testing",
            "Information Architecture & User Journey Map for a Complex Multi-Role SaaS Platform"
        ],
        "learning_resources": [
            {
                "title": "Nielsen Norman Group Articles & Guidelines",
                "url": "https://www.nngroup.com/articles/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Interaction Design Foundation Free Guides",
                "url": "https://www.interaction-design.org/literature",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "User Research",
                "required_level": 4,
                "description": "User interviews, persona creation, survey design, and observational research",
                "weight": 1.0
            },
            {
                "name": "Wireframing",
                "required_level": 4,
                "description": "Low and mid-fidelity wireframing to establish workflow and hierarchy",
                "weight": 0.95
            },
            {
                "name": "Usability Testing",
                "required_level": 4,
                "description": "Task-based user testing, prototype evaluation, and heuristic reviews",
                "weight": 0.95
            },
            {
                "name": "Information Architecture",
                "required_level": 3,
                "description": "Sitemaps, navigation hierarchies, content taxonomies, and user flows",
                "weight": 0.9
            },
            {
                "name": "User Journey Mapping",
                "required_level": 4,
                "description": "Mapping customer emotions, touchpoints, pain points, and opportunities",
                "weight": 0.85
            },
            {
                "name": "Figma",
                "required_level": 3,
                "description": "Creating clickable wireframes and research visual assets",
                "weight": 0.8
            }
        ],
        "secondary_skills": [
            {
                "name": "Prototyping",
                "required_level": 3,
                "description": "Rapid interactive prototypes for user testing sessions"
            },
            {
                "name": "Visual Design",
                "required_level": 2,
                "description": "Basic visual styling to communicate layout intent"
            },
            {
                "name": "Product Analytics",
                "required_level": 2,
                "description": "Analyzing heatmaps and session recordings (Hotjar)"
            },
            {
                "name": "Business Analysis",
                "required_level": 2,
                "description": "Aligning user needs with commercial product viability"
            },
            {
                "name": "Communication",
                "required_level": 4,
                "description": "Presenting research evidence to engineering and business leaders"
            }
        ],
        "soft_skills": [
            {
                "name": "Deep Empathy",
                "description": "Genuinely feeling the frustration of confused users and championing simplicity"
            },
            {
                "name": "Analytical Inquiry",
                "description": "Asking 'Why?' repeatedly to uncover the real root problem behind user requests"
            }
        ]
    },
    {
        "id": "ui-ux-designer",
        "name": "UI/UX Designer",
        "category": "UI/UX and Design",
        "tagline": "Blend empathetic user research with pixel-perfect visual execution for complete product experiences.",
        "demand_level": "Extremely High",
        "description": "UI/UX Designers manage the complete user experience lifecycle, conducting empathetic user research, creating wireframes, building design systems, and crafting polished, interactive digital interfaces.",
        "suitable_backgrounds": [
            "B.Des / B.Sc Design",
            "BCA",
            "B.Tech CS / IT",
            "MCA",
            "Self-Taught Portfolio"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b95L \u2013 \u20b918L per annum (India)",
        "avg_salary": "\u20b98.2L",
        "tools": [
            "Figma",
            "FigJam",
            "Miro",
            "Adobe XD / Illustrator",
            "Notion",
            "Maze"
        ],
        "interview_topics": [
            "End-to-end design process walkthrough on portfolio project",
            "Balancing user needs vs business constraints",
            "Responsive design patterns across mobile and web",
            "Design system governance and maintenance",
            "Accessibility audits (WCAG guidelines)"
        ],
        "recommended_projects": [
            "End-to-End Mobile App Case Study: From Problem Discovery to Interactive High-Fidelity Prototype",
            "B2B SaaS Dashboard Redesign combining User Journey Maps with a modern Figma Design System"
        ],
        "learning_resources": [
            {
                "title": "Google UX Design Professional Certificate",
                "url": "https://grow.google/certificates/ux-design/",
                "type": "Course",
                "is_free": False
            },
            {
                "title": "Laws of UX",
                "url": "https://lawsofux.com/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Figma",
                "required_level": 4,
                "description": "Advanced components, auto-layout, design tokens, interactive prototyping",
                "weight": 1.0
            },
            {
                "name": "User Research",
                "required_level": 4,
                "description": "User interviews, persona synthesis, journey mapping, and usability testing",
                "weight": 0.95
            },
            {
                "name": "Visual Design",
                "required_level": 4,
                "description": "Layout grids, typography, color harmony, iconography, and visual hierarchy",
                "weight": 0.95
            },
            {
                "name": "Wireframing",
                "required_level": 4,
                "description": "Translating user requirements into low and high-fidelity screen wireframes",
                "weight": 0.9
            },
            {
                "name": "Design Systems",
                "required_level": 3,
                "description": "Component architecture, style guidelines, and design-developer tokens",
                "weight": 0.85
            },
            {
                "name": "Responsive UI",
                "required_level": 4,
                "description": "Adapting UI seamlessly across desktop, tablet, and mobile displays",
                "weight": 0.85
            }
        ],
        "secondary_skills": [
            {
                "name": "Prototyping",
                "required_level": 4,
                "description": "Creating realistic micro-interactions and animated user flows"
            },
            {
                "name": "Usability Testing",
                "required_level": 3,
                "description": "Conducting test sessions, recording friction points, and iterating"
            },
            {
                "name": "HTML/CSS Basics",
                "required_level": 2,
                "description": "Understanding CSS box model, flexbox, and web development limits"
            },
            {
                "name": "Information Architecture",
                "required_level": 3,
                "description": "Structuring navigation menus, breadcrumbs, and content hierarchies"
            },
            {
                "name": "Communication",
                "required_level": 4,
                "description": "Pitching design rationale clearly to stakeholders and engineers"
            }
        ],
        "soft_skills": [
            {
                "name": "Holistic Mindset",
                "description": "Connecting user psychology with visual polish and business viability"
            },
            {
                "name": "Design Justification",
                "description": "Explaining the strategic UX reason behind every button placement and color choice"
            }
        ]
    },
    {
        "id": "blockchain-developer",
        "name": "Blockchain Developer",
        "category": "Emerging Technologies",
        "tagline": "Write secure smart contracts, decentralized applications (dApps), and cryptographic protocols.",
        "demand_level": "High",
        "description": "Blockchain Developers engineer decentralized applications, write and audit Ethereum smart contracts using Solidity, and integrate Web3 interfaces with distributed ledger networks.",
        "suitable_backgrounds": [
            "B.Tech CS / IT",
            "BCA",
            "MCA",
            "B.Sc Computer Science"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96L \u2013 \u20b924L per annum (India)",
        "avg_salary": "\u20b911.0L",
        "tools": [
            "Solidity",
            "Hardhat",
            "Remix IDE",
            "Ethers.js / Web3.js",
            "Metamask",
            "Git"
        ],
        "interview_topics": [
            "EVM architecture & gas optimization",
            "Reentrancy attacks and smart contract security",
            "ERC-20 vs ERC-721 token standards",
            "Consensus mechanisms (Proof of Work vs Proof of Stake)",
            "Hashing, Merkle Trees, and public/private key cryptography"
        ],
        "recommended_projects": [
            "Decentralized Crowdfunding Platform with Solidity smart contracts, Hardhat tests, and React frontend",
            "NFT Minting & Staking Protocol adhering to ERC-721 standards with automated unit tests"
        ],
        "learning_resources": [
            {
                "title": "Solidity Official Documentation",
                "url": "https://docs.soliditylang.org/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "CryptoZombies Interactive Solidity Tutorial",
                "url": "https://cryptozombies.io/",
                "type": "Interactive",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Solidity",
                "required_level": 4,
                "description": "Writing smart contracts, modifiers, mappings, events, and gas optimization",
                "weight": 1.0
            },
            {
                "name": "Smart Contracts",
                "required_level": 4,
                "description": "ERC-20, ERC-721, security patterns, reentrancy guards, and access control",
                "weight": 1.0
            },
            {
                "name": "JavaScript",
                "required_level": 4,
                "description": "Modern JS, async/await, and interaction with blockchain nodes",
                "weight": 0.85
            },
            {
                "name": "Cryptography",
                "required_level": 3,
                "description": "Elliptic curve cryptography, Merkle trees, SHA-256, and digital signatures",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control for smart contract repositories and deployments",
                "weight": 0.75
            },
            {
                "name": "REST APIs",
                "required_level": 3,
                "description": "Connecting backend services with blockchain RPC endpoints",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Hardhat",
                "required_level": 4,
                "description": "Testing, compiling, debugging, and deploying Ethereum smart contracts"
            },
            {
                "name": "Web3.js",
                "required_level": 3,
                "description": "Connecting browser wallets (MetaMask) and executing contract methods"
            },
            {
                "name": "Node.js",
                "required_level": 3,
                "description": "Backend indexing scripts and automated event listeners"
            },
            {
                "name": "Python",
                "required_level": 2,
                "description": "Data analysis and Web3.py script automation"
            },
            {
                "name": "Security Auditing",
                "required_level": 3,
                "description": "Static analysis with Slither and recognizing common EVM exploits"
            }
        ],
        "soft_skills": [
            {
                "name": "Security-First Paranoia",
                "description": "Knowing code cannot be edited once deployed to the blockchain"
            },
            {
                "name": "Financial Precision",
                "description": "Meticulous calculation of integer division, rounding, and token balances"
            }
        ]
    },
    {
        "id": "iot-developer",
        "name": "IoT Developer",
        "category": "Emerging Technologies",
        "tagline": "Connect embedded microcontrollers, sensors, and telemetry streams to modern cloud systems.",
        "demand_level": "High",
        "description": "Internet of Things (IoT) Developers build connected device firmware, integrate analog/digital sensors, establish low-power wireless communication, and channel telemetry into cloud processing pipelines.",
        "suitable_backgrounds": [
            "B.Tech Electronics / CS / IT",
            "BCA",
            "MCA",
            "B.Sc Electronics / CS"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b94.8L \u2013 \u20b916L per annum (India)",
        "avg_salary": "\u20b97.8L",
        "tools": [
            "Raspberry Pi",
            "ESP32 / Arduino",
            "MQTT (Mosquitto)",
            "VS Code / PlatformIO",
            "Python",
            "Linux"
        ],
        "interview_topics": [
            "MQTT vs HTTP/REST for constrained devices",
            "I2C, SPI, and UART communication protocols",
            "Power management & sleep modes in microcontrollers",
            "Sensor calibration & ADC conversions",
            "Edge computing vs Cloud telemetry processing"
        ],
        "recommended_projects": [
            "Smart Environmental Monitoring Station with ESP32, DHT22 sensors, MQTT, and Grafana dashboard",
            "Automated RFID Access Control & Telemetry Gateway using Raspberry Pi, Python, and SQLite"
        ],
        "learning_resources": [
            {
                "title": "Arduino Documentation & Tutorials",
                "url": "https://docs.arduino.cc/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "ESP-IDF Programming Guide",
                "url": "https://docs.espressif.com/projects/esp-idf/en/latest/",
                "type": "Documentation",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "Embedded C/C++",
                "required_level": 4,
                "description": "Microcontroller programming, pointer math, memory limits, and interrupts",
                "weight": 1.0
            },
            {
                "name": "Python",
                "required_level": 4,
                "description": "Raspberry Pi scripts, telemetry processing, and serial communication",
                "weight": 0.95
            },
            {
                "name": "MQTT",
                "required_level": 4,
                "description": "Pub/sub messaging, QoS levels, brokers, and lightweight payloads",
                "weight": 0.9
            },
            {
                "name": "Linux",
                "required_level": 3,
                "description": "Embedded Linux, systemd services, GPIO pin controls, and networking",
                "weight": 0.85
            },
            {
                "name": "Sensor Integration",
                "required_level": 4,
                "description": "Interfacing with I2C, SPI, UART temperature, humidity, and motion sensors",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control for firmware and gateway scripts",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Networking",
                "required_level": 3,
                "description": "TCP/IP, Wi-Fi, Bluetooth Low Energy (BLE), and Zigbee concepts"
            },
            {
                "name": "REST APIs",
                "required_level": 3,
                "description": "Sending telemetry packets to cloud webhooks and endpoints"
            },
            {
                "name": "Cloud Computing",
                "required_level": 2,
                "description": "AWS IoT Core or Azure IoT Hub basic telemetry ingestion"
            },
            {
                "name": "SQL",
                "required_level": 2,
                "description": "Storing time-series sensor readings in local relational databases"
            },
            {
                "name": "Docker",
                "required_level": 2,
                "description": "Running containerized IoT gateway applications"
            }
        ],
        "soft_skills": [
            {
                "name": "Hardware-Software Troubleshooting",
                "description": "Diagnosing whether an issue is caused by physical wiring or code bugs"
            },
            {
                "name": "Resourceful Prototyping",
                "description": "Building functional breadboard prototypes rapidly with modular hardware"
            }
        ]
    },
    {
        "id": "robotics-software-engineer",
        "name": "Robotics Software Engineer",
        "category": "Emerging Technologies",
        "tagline": "Develop autonomous navigation, motion planning, and kinematics software for robotic systems.",
        "demand_level": "High",
        "description": "Robotics Software Engineers design and implement autonomous navigation, sensor fusion, path planning algorithms, and motor actuation controls using ROS/ROS2, C++, and Linux.",
        "suitable_backgrounds": [
            "B.Tech Mechatronics / CS / Electronics / Mechanical",
            "M.Tech Robotics",
            "MCA",
            "B.Sc CS"
        ],
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "salary_range": "\u20b96L \u2013 \u20b922L per annum (India)",
        "avg_salary": "\u20b910.5L",
        "tools": [
            "ROS2",
            "Gazebo Simulator",
            "C++",
            "Python",
            "Linux (Ubuntu)",
            "Git"
        ],
        "interview_topics": [
            "ROS/ROS2 nodes, topics, services, and actions",
            "Forward & Inverse Kinematics",
            "Kalman Filtering & sensor fusion (IMU + Odometry)",
            "Path planning algorithms (A*, Dijkstra, RRT)",
            "Coordinate frames & TF tree transformations"
        ],
        "recommended_projects": [
            "Autonomous Mobile Robot Navigation in Gazebo with ROS2, SLAM, and Nav2 path planning",
            "Robotic Arm Inverse Kinematics & Pick-and-Place Simulator with MoveIt and C++"
        ],
        "learning_resources": [
            {
                "title": "ROS 2 Official Documentation",
                "url": "https://docs.ros.org/en/humble/",
                "type": "Documentation",
                "is_free": True
            },
            {
                "title": "Modern Robotics (Northwestern University)",
                "url": "https://modernrobotics.northwestern.edu/",
                "type": "Course",
                "is_free": True
            }
        ],
        "core_skills": [
            {
                "name": "ROS/ROS2",
                "required_level": 4,
                "description": "Nodes, topics, publishers, subscribers, TF transformations, and launch files",
                "weight": 1.0
            },
            {
                "name": "C++",
                "required_level": 4,
                "description": "Modern C++, memory management, pointers, STL, and real-time computation",
                "weight": 0.95
            },
            {
                "name": "Python",
                "required_level": 4,
                "description": "Rapid prototyping of robotics nodes, data math, and scripting",
                "weight": 0.9
            },
            {
                "name": "Linux",
                "required_level": 4,
                "description": "Ubuntu, bash, process priority, serial ports, and environment variables",
                "weight": 0.85
            },
            {
                "name": "Kinematics",
                "required_level": 3,
                "description": "Coordinate frames, rotation matrices, transformation trees, and odometry",
                "weight": 0.85
            },
            {
                "name": "Git",
                "required_level": 3,
                "description": "Version control for robotics software packages and workspace configs",
                "weight": 0.75
            }
        ],
        "secondary_skills": [
            {
                "name": "Simulation",
                "required_level": 3,
                "description": "Gazebo physics simulation, URDF models, and sensor emulation"
            },
            {
                "name": "Computer Vision",
                "required_level": 3,
                "description": "OpenCV for camera feed processing and visual fiducial markers"
            },
            {
                "name": "Sensor Fusion",
                "required_level": 3,
                "description": "Extended Kalman Filters fusing LiDAR, IMU, and wheel encoders"
            },
            {
                "name": "Path Planning",
                "required_level": 3,
                "description": "Costmaps, A* algorithm, and obstacle avoidance planners"
            },
            {
                "name": "Docker",
                "required_level": 2,
                "description": "Containerizing ROS2 workspaces for reproducible testing"
            }
        ],
        "soft_skills": [
            {
                "name": "Physical Systems Discipline",
                "description": "Respecting physical momentum, mechanical limitations, and latency in real robots"
            },
            {
                "name": "Safety Consciousness",
                "description": "Building failsafes, emergency stops, and velocity limits into actuation code"
            }
        ]
    }
]

# Index roles by role name
ROLES_BY_NAME: Dict[str, Dict[str, Any]] = {r["name"]: r for r in ROLES_DATA}
# Index roles by slug id
ROLES_BY_ID: Dict[str, Dict[str, Any]] = {r["id"]: r for r in ROLES_DATA}

# Supported roles list (all 42 role names in stable order)
SUPPORTED_ROLES: List[str] = [r["name"] for r in ROLES_DATA]

# All 9 categories
ROLE_CATEGORIES: List[str] = list(dict.fromkeys(r["category"] for r in ROLES_DATA))

# Benchmarks mapping for skill gap analysis and ATS scoring
ROLE_BENCHMARKS: Dict[str, Dict[str, Any]] = {
    r["name"]: {
        "core_skills": r["core_skills"],
        "secondary_skills": r["secondary_skills"],
    }
    for r in ROLES_DATA
}

# Competencies mapping for ML readiness and XAI models (with unique numerical code)
ROLE_COMPETENCIES: Dict[str, Dict[str, Any]] = {
    r["name"]: {
        "code": idx,
        "core_skills": [s["name"] for s in r["core_skills"]],
        "secondary_skills": [s["name"] for s in r["secondary_skills"]],
    }
    for idx, r in enumerate(ROLES_DATA)
}

# Compact competencies mapping for career assistant and mock interview services
SUPPORTED_ROLE_COMPETENCIES: Dict[str, Dict[str, Any]] = {
    r["name"]: {
        "core": [s["name"] for s in r["core_skills"]],
        "description": r["description"],
    }
    for r in ROLES_DATA
}

# Recommendation catalog structure
ROLE_CATALOG: Dict[str, Dict[str, Any]] = {
    r["name"]: {
        "tagline": r["tagline"],
        "demand_level": r["demand_level"],
        "description": r["description"],
        "suitable_backgrounds": r["suitable_backgrounds"],
        "recommended_projects": r["recommended_projects"],
        "core_skills": r["core_skills"],
        "secondary_skills": r["secondary_skills"],
        "category": r["category"],
    }
    for r in ROLES_DATA
}


# Comprehensive skill action guidance mapping (lowercase skill name -> guidance text)
SKILL_ACTION_GUIDANCE: Dict[str, str] = {
    "sql": "Master relational queries, subqueries, indexing, window functions, and schema normalization.",
    "python": "Deepen object-oriented programming, data structures, generators, and testing with pytest.",
    "excel": "Practice advanced functions (XLOOKUP, INDEX/MATCH), pivot tables, and conditional data modeling.",
    "power bi": "Build end-to-end interactive reporting dashboards, data models, and calculated DAX measures.",
    "tableau": "Create visual data stories with calculated fields, parameters, and interactive dashboard actions.",
    "statistics": "Review probability theory, hypothesis testing (t-test, chi-square), and regression diagnostics.",
    "pandas": "Practice multi-index operations, grouping aggregations, timeseries parsing, and vectorized transformations.",
    "numpy": "Work with multi-dimensional array operations, broadcasting, linear algebra, and mathematical masks.",
    "git": "Practice merge conflict resolution, feature-branch workflows, and pull request reviews.",
    "fastapi": "Build RESTful microservices with Pydantic validation, background tasks, and dependency injection.",
    "machine learning": "Train and compare classical models (linear, tree-based, ensemble) and master cross-validation.",
    "scikit-learn": "Construct end-to-end Pipeline objects combining ColumnTransformer and hyperparameter search.",
    "deep learning": "Build convolutional and sequential neural networks with loss tracking and regularization.",
    "docker": "Write multi-stage Dockerfiles and deploy multi-container systems using docker-compose.",
    "communication": "Practice translating technical analytics into clear executive summaries and stakeholder slides.",
    "problem solving": "Solve algorithmic problem sets on LeetCode/HackerRank focusing on efficiency and edge cases.",
    "java": "Deepen OOP fundamentals, collection framework, streams, multithreading, and JVM memory tuning.",
    "spring boot": "Build production microservices with Spring Data JPA, Spring Security, and Maven multi-modules.",
    "javascript": "Master ES6+ concepts, asynchronous event loop, promises, closures, and modern DOM methods.",
    "typescript": "Configure strict tsconfig, generics, intersection types, and typed API response schemas.",
    "react": "Build modular component hierarchies, custom hooks, and manage state with Redux or Zustand.",
    "node.js": "Construct asynchronous event-driven APIs, middleware chains, and stream file processing.",
    "html5": "Structure semantic, accessible web pages conforming to WCAG standards and modern SEO rules.",
    "css3": "Master CSS Grid, Flexbox, CSS custom properties, and responsive breakpoint design.",
    "tailwind css": "Utilize utility-first responsive classes, custom plugins, and configure design tokens.",
    "kotlin": "Write idiomatic Kotlin code with coroutines, null safety, extension functions, and data classes.",
    "android sdk": "Master Activity/Fragment lifecycles, Room DB, Retrofit networking, and Jetpack Compose.",
    "flutter": "Build multi-platform UIs with Dart, state management (BLoC/Provider), and custom widgets.",
    "dart": "Study async streams, null safety, collections, and object-oriented architectural patterns.",
    "cloud computing": "Learn core cloud paradigms, distributed architecture, high availability, and storage tiers.",
    "aws services": "Provision EC2, S3, RDS, IAM roles, and build VPC networks with security groups.",
    "microsoft azure": "Deploy Azure VMs, App Services, Entra ID access controls, and Azure SQL databases.",
    "terraform": "Author declarative HCL modules, manage remote state backends, and automate deployments.",
    "kubernetes": "Configure Pods, Services, Deployments, Ingress controllers, and manage secrets securely.",
    "linux": "Master shell navigation, grep/sed/awk utilities, user permissions, and systemd service management.",
    "ci/cd": "Write automated CI/CD workflows in GitHub Actions or Jenkins with build, test, and deploy stages.",
    "network security": "Analyze network traffic with Wireshark, configure firewalls, and study TCP/IP protocols.",
    "siem": "Write correlation queries in Splunk or ELK to detect brute force, lateral movement, and malware.",
    "web application security": "Test and mitigate OWASP Top 10 vulnerabilities (SQLi, XSS, CSRF, IDOR, SSRF).",
    "burp suite": "Practice intercepting HTTP requests, using Repeater and Intruder for vulnerability analysis.",
    "test case design": "Author boundary value and equivalence partition test cases with clear acceptance criteria.",
    "selenium": "Automate browser interactions using Page Object Model, explicit waits, and locator strategies.",
    "playwright": "Build fast, non-flaky end-to-end tests with auto-waiting, network mocking, and trace viewers.",
    "business analysis": "Conduct requirements elicitation workshops and produce structured BRDs and user stories.",
    "product analytics": "Analyze user funnel drop-offs, retention cohorts, and define North Star metrics.",
    "solidity": "Write secure smart contracts following open standards, with reentrancy guards and unit tests.",
    "ros/ros2": "Create ROS2 packages with publishers, subscribers, TF transforms, and simulation in Gazebo.",
    "embedded c/c++": "Write low-level firmware for microcontrollers interfacing with sensors via I2C/SPI.",
    "figma": "Design responsive UI components with auto-layout, variants, design tokens, and smart prototyping."
}


def get_all_roles() -> List[Dict[str, Any]]:
    """Return all 42 documented roles with complete metadata."""
    return ROLES_DATA


def get_role_by_id_or_name(identifier: str) -> Optional[Dict[str, Any]]:
    """Lookup a role by slug id or exact role name."""
    if not identifier:
        return None
    cleaned = identifier.strip()
    if cleaned in ROLES_BY_NAME:
        return ROLES_BY_NAME[cleaned]
    if cleaned in ROLES_BY_ID:
        return ROLES_BY_ID[cleaned]
    # Case-insensitive lookup
    lower = cleaned.lower()
    for r in ROLES_DATA:
        if r["name"].lower() == lower or r["id"].lower() == lower:
            return r
    return None


def get_roles_by_category(category: str) -> List[Dict[str, Any]]:
    """Return all roles belonging to a specific category."""
    lower_cat = category.strip().lower()
    return [r for r in ROLES_DATA if r["category"].lower() == lower_cat]


def get_all_categories() -> List[str]:
    """Return all unique role categories."""
    return ROLE_CATEGORIES
