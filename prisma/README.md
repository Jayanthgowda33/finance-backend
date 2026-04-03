# Finance Backend

A role-based finance data processing backend built with Node.js, Express, Prisma, and SQLite.

## Setup

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file with:
```
   DATABASE_URL="file:./prisma/dev.db"
   JWT_SECRET="supersecret123"
```
4. Run `npx prisma migrate dev --name init`
5. Run `npm run dev`
6. Server runs on `http://localhost:3000`

## Roles

| Role | Read Records | Dashboard | Create/Edit/Delete | Manage Users |
|------|-------------|-----------|-------------------|--------------|
| viewer | yes | no | no | no |
| analyst | yes | yes | no | no |
| admin | yes | yes | yes | yes |

## API Endpoints

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| GET | /api/records | all roles |
| POST | /api/records | admin |
| PUT | /api/records/:id | admin |
| DELETE | /api/records/:id | admin |
| GET | /api/dashboard/summary | analyst, admin |
| GET | /api/users | admin |
| PATCH | /api/users/:id | admin |