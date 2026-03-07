
  # ai-voice-agent

  This is a code bundle for ai-voice-agent. The original project is available at https://www.figma.com/design/4pS91OuH8xlqROsEASiolI/ai-voice-agent.

  ## Running the code
 
  Run `npm i` to install the dependencies.
 
  - **Next.js dev server**: `npm run dev` (Next.js at `http://localhost:3000`)
  - **Next.js production build**: `npm run build` then `npm start`
  - **Legacy Vite dev server (optional)**: `npm run dev:vite`
  - **Legacy Vite build (optional)**: `npm run build:vite`

  ## MySQL database and migrations

  This project uses **Prisma** with **MySQL**. Migrations are stored in:

  **`prisma/migrations/`**

  - Each migration is a folder with a name like `20250303000000_init`, containing a `migration.sql` file.
  - To **create a new migration** after changing `prisma/schema.prisma`:  
    `npm run db:migrate`  
    (Prompts for a migration name and applies it.)
  - To **apply existing migrations** (e.g. on deploy):  
    `npm run db:migrate:deploy`
  - To **open the DB in a UI**:  
    `npm run db:studio`

  Set your MySQL connection string in a **`.env`** file in the project root:

  ```env
  DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
  ```

  Then run `npm install` and `npm run db:generate` to generate the Prisma client.
 