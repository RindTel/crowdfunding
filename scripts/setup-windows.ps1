<#
================================================================
 FundForge — One-shot setup & run script for Windows
================================================================
 What this does (idempotent — safe to re-run):
   1. Checks Node.js and PostgreSQL are installed
   2. Creates backend/.env (with auto-generated JWT secrets)
   3. Creates frontend/.env.local
   4. Installs backend + frontend dependencies (npm install)
   5. Creates the PostgreSQL database if missing
   6. Runs Prisma: generate -> migrate -> seed (demo data)
   7. Launches the backend (:4000) and frontend (:5173)

 Usage (from a PowerShell window):
   ./scripts/setup-windows.ps1
   ./scripts/setup-windows.ps1 -SkipRun     # set up only, don't launch
   ./scripts/setup-windows.ps1 -Reset       # wipe & reseed the database

 Or just double-click  scripts\setup-windows.bat
================================================================
#>

param(
    [switch]$SkipInstall,   # skip npm install (deps already present)
    [switch]$SkipRun,       # set everything up but don't start the servers
    [switch]$Reset          # drop & recreate the DB, then reseed
)

$ErrorActionPreference = "Stop"

# --- pretty output helpers ----------------------------------------------------
function Info($m)  { Write-Host "  $m" -ForegroundColor Cyan }
function Ok($m)    { Write-Host "  [OK] $m" -ForegroundColor Green }
function Warn($m)  { Write-Host "  [!]  $m" -ForegroundColor Yellow }
function Fail($m)  { Write-Host "  [X]  $m" -ForegroundColor Red }
function Step($m)  { Write-Host "`n=== $m ===" -ForegroundColor Magenta }

# --- locate the repo root (parent of this script's folder) --------------------
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root      = Split-Path -Parent $ScriptDir
$Backend   = Join-Path $Root "backend"
$Frontend  = Join-Path $Root "frontend"

Write-Host ""
Write-Host "  FundForge Windows Setup" -ForegroundColor White
Write-Host "  Repo: $Root" -ForegroundColor DarkGray

# ============================================================================
Step "1/7  Checking prerequisites"
# ============================================================================
function Test-Cmd($name) { return [bool](Get-Command $name -ErrorAction SilentlyContinue) }

if (-not (Test-Cmd node)) {
    Fail "Node.js is not installed or not on PATH."
    Info "Download the LTS installer from https://nodejs.org and re-run this script."
    exit 1
}
$nodeVer = (node -v)
Ok "Node.js $nodeVer"

if (-not (Test-Cmd npm)) { Fail "npm not found (should ship with Node)."; exit 1 }
Ok "npm $(npm -v)"

# Find psql — try PATH first, then the standard PostgreSQL install location.
$Psql = $null
if (Test-Cmd psql) {
    $Psql = "psql"
} else {
    $candidate = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\psql.exe" -ErrorAction SilentlyContinue |
                 Sort-Object FullName -Descending | Select-Object -First 1
    if ($candidate) { $Psql = $candidate.FullName }
}

if ($Psql) {
    Ok "PostgreSQL client found ($Psql)"
} else {
    Warn "Could not find 'psql'. PostgreSQL may not be installed."
    Info "Install it from https://www.postgresql.org/download/windows/ (remember the password you set for the 'postgres' user)."
    Info "Once installed, re-run this script."
    exit 1
}

# ============================================================================
Step "2/7  Database connection"
# ============================================================================
$pgUser = Read-Host "  PostgreSQL username [postgres]"
if ([string]::IsNullOrWhiteSpace($pgUser)) { $pgUser = "postgres" }

$pgPassSecure = Read-Host "  PostgreSQL password for '$pgUser'" -AsSecureString
$pgPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassSecure))

$pgHost = Read-Host "  PostgreSQL host [localhost]"
if ([string]::IsNullOrWhiteSpace($pgHost)) { $pgHost = "localhost" }

$pgPort = Read-Host "  PostgreSQL port [5432]"
if ([string]::IsNullOrWhiteSpace($pgPort)) { $pgPort = "5432" }

$dbName = "fundforge"
# URL-encode the password so special characters don't break the DATABASE_URL.
Add-Type -AssemblyName System.Web
$pgPassEnc = [System.Web.HttpUtility]::UrlEncode($pgPass)
$DatabaseUrl = "postgresql://${pgUser}:${pgPassEnc}@${pgHost}:${pgPort}/${dbName}"

# Set PGPASSWORD so psql calls don't prompt.
$env:PGPASSWORD = $pgPass

# Quick connectivity check against the default 'postgres' database.
Info "Testing connection..."
& $Psql -U $pgUser -h $pgHost -p $pgPort -d postgres -c "SELECT 1;" *> $null
if ($LASTEXITCODE -ne 0) {
    Fail "Could not connect to PostgreSQL with those credentials."
    Info "Double-check the username/password and that the PostgreSQL service is running (services.msc -> postgresql)."
    exit 1
}
Ok "Connected to PostgreSQL"

# ============================================================================
Step "3/7  Environment files"
# ============================================================================
$envPath = Join-Path $Backend ".env"
if ((Test-Path $envPath) -and -not $Reset) {
    Warn "backend\.env already exists — leaving it as-is (delete it to regenerate)."
    # Make sure the DATABASE_URL line points at what the user just entered.
} else {
    function New-Secret { -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) }) }
    $accessSecret  = New-Secret
    $refreshSecret = New-Secret
    $envContent = @"
NODE_ENV=development
PORT=4000

DATABASE_URL="$DatabaseUrl"

JWT_ACCESS_SECRET=$accessSecret
JWT_REFRESH_SECRET=$refreshSecret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173

BCRYPT_SALT_ROUNDS=12

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
"@
    Set-Content -Path $envPath -Value $envContent -Encoding UTF8
    Ok "Wrote backend\.env (with fresh JWT secrets)"
}

# Frontend env — points the SPA at the local API.
$feEnv = Join-Path $Frontend ".env.local"
Set-Content -Path $feEnv -Value "VITE_API_URL=http://localhost:4000/api/v1" -Encoding UTF8
Ok "Wrote frontend\.env.local"

# ============================================================================
Step "4/7  Installing dependencies"
# ============================================================================
if ($SkipInstall) {
    Warn "Skipping npm install (-SkipInstall)."
} else {
    Info "Installing backend dependencies (this can take a minute)..."
    Push-Location $Backend; npm install; $code = $LASTEXITCODE; Pop-Location
    if ($code -ne 0) { Fail "Backend npm install failed."; exit 1 }
    Ok "Backend dependencies installed"

    Info "Installing frontend dependencies..."
    Push-Location $Frontend; npm install; $code = $LASTEXITCODE; Pop-Location
    if ($code -ne 0) { Fail "Frontend npm install failed."; exit 1 }
    Ok "Frontend dependencies installed"
}

# ============================================================================
Step "5/7  Creating database"
# ============================================================================
if ($Reset) {
    Warn "Dropping database '$dbName' (-Reset)..."
    & $Psql -U $pgUser -h $pgHost -p $pgPort -d postgres -c "DROP DATABASE IF EXISTS $dbName;" *> $null
}

$exists = & $Psql -U $pgUser -h $pgHost -p $pgPort -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$dbName';"
if ($exists -match "1") {
    Ok "Database '$dbName' already exists"
} else {
    & $Psql -U $pgUser -h $pgHost -p $pgPort -d postgres -c "CREATE DATABASE $dbName;" *> $null
    if ($LASTEXITCODE -ne 0) { Fail "Failed to create database '$dbName'."; exit 1 }
    Ok "Created database '$dbName'"
}

# ============================================================================
Step "6/7  Prisma: generate, migrate, seed"
# ============================================================================
Push-Location $Backend
try {
    Info "Generating Prisma client..."
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }

    Info "Applying migrations..."
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) { throw "prisma migrate deploy failed" }

    Info "Seeding demo data..."
    npm run prisma:seed
    if ($LASTEXITCODE -ne 0) { Warn "Seeding reported a non-zero exit (may already be seeded) — continuing." }

    Ok "Database ready"
}
catch {
    Fail $_.Exception.Message
    Pop-Location
    exit 1
}
Pop-Location

# ============================================================================
Step "7/7  Launch"
# ============================================================================
Write-Host ""
Ok "Setup complete!"
Write-Host ""
Write-Host "  Demo login accounts:" -ForegroundColor White
Write-Host "    Admin   : admin@fundforge.io   / Admin123!" -ForegroundColor Gray
Write-Host "    Creator : creator@fundforge.io / Admin123!" -ForegroundColor Gray
Write-Host "    Donor   : donor@fundforge.io   / Admin123!" -ForegroundColor Gray
Write-Host ""

if ($SkipRun) {
    Info "Skipping launch (-SkipRun). To start manually:"
    Info "  Backend : cd backend  ; npm run dev"
    Info "  Frontend: cd frontend ; npm run dev"
    exit 0
}

Info "Opening two terminal windows (backend + frontend)..."
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$Backend'; npm run dev"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$Frontend'; npm run dev"

Write-Host ""
Ok "Backend  -> http://localhost:4000   (health: /health)"
Ok "Frontend -> http://localhost:5173"
Info "Close those two windows to stop the servers."
Write-Host ""
