# Running FundForge on Windows

This sets up and runs the whole app (backend API + frontend website) on your machine.

## You need these installed first (one time)

1. **Node.js** (LTS) — https://nodejs.org → download, run installer, click Next through it.
2. **PostgreSQL** — https://www.postgresql.org/download/windows/ → during install it asks you
   to set a **password for the `postgres` user**. **Write that password down** — you'll type it
   into the setup script.

Restart your computer (or at least open a fresh terminal) after installing, so they're on your PATH.

## Run it

Double-click:

```
scripts\setup-windows.bat
```

It will ask for your PostgreSQL password, then do everything automatically:
install dependencies, create the database, load demo data, and open two windows running the app.

When it finishes, open **http://localhost:5173** in your browser.

### Demo logins

| Role    | Email                 | Password   |
|---------|-----------------------|------------|
| Admin   | admin@fundforge.io    | Admin123!  |
| Creator | creator@fundforge.io  | Admin123!  |
| Donor   | donor@fundforge.io    | Admin123!  |

## Later / handy flags

Open PowerShell in the project folder and run:

```powershell
# normal setup + run
./scripts/setup-windows.ps1

# set things up but don't launch the servers
./scripts/setup-windows.ps1 -SkipRun

# wipe the database and reload fresh demo data
./scripts/setup-windows.ps1 -Reset

# skip reinstalling dependencies (faster re-run)
./scripts/setup-windows.ps1 -SkipInstall
```

## To start the app again later

Either double-click `setup-windows.bat` again (it's safe to re-run — it skips work already done),
or open two terminals:

```
cd backend   &  npm run dev      (API at http://localhost:4000)
cd frontend  &  npm run dev      (website at http://localhost:5173)
```

## If something goes wrong

- **"Node.js is not installed"** → install Node, open a *new* terminal, try again.
- **"Could not find psql"** → install PostgreSQL, then re-run.
- **"Could not connect to PostgreSQL"** → wrong password, or the service isn't running.
  Open `services.msc`, find `postgresql-x64-…`, make sure it's *Running*.
