---
title: Axishop
thumbnail: /images/projects/axishop.png
sourceCodeLink: https://github.com/username/myproject
blogPostLink: /blog/myproject
private: true
techUsed:
  - TypeScript
  - Node.js
  - React
  - Next.js
  - Postgres
  - Prisma
  - Redis
  - tailwindcss
year: "2023"
---
Axishop is a SaaS application with a frontend for customers, and a backend Discord bot. The bot adds an economy and shop system that links to game servers like Minecraft, CS:GO, any many others, allowing for in game purchases through Discord. This bot has taken nearly 18,000 lines of code to create, supported by detailed documentation using Docusaurus. Axishop is nearly complete and combines a variety of technologies and strategies to operate efficiently.
## Monorepo Design
Axishop is structured as a monorepo, containing distinct packages for the bot, API, frontend, docs, and a shared library. This setup simplifies managing the project's various components under a unified codebase.
## Backend Deployment
The bot and internal API are hosted on a DigitalOcean droplet, while the frontend is deployed on Vercel.
## CI/CD
CircleCI manages the backend's build and deployment processes, ensuring updates are seamlessly pushed to the DigitalOcean droplet.
## Database and ORM
Postgres serves as the primary database, with Prisma as the ORM, which simplifies database schema management and operations.
## Caching
Redis is used for caching to enhance performance and speed up response times by storing frequently accessed data in memory.
## Dockerized for Easy Deployment
The whole project is dockerized using Docker and docker-compose, allowing for straightforward and consistent setup and deployment across all stages of the development lifecycle.
## Frontend
A website for customers to purchase the service through Stripe API, as well as a dashboard to configure the bot to fit their desires. Created in Next.js (react) with TailwindCSS for a modern style.
## Documentation
The entire project is documented with Docusaurus, helping keep the project details clear and well-organized.