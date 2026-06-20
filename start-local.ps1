$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pgBin = 'C:\Program Files\PostgreSQL\16\bin'
$pgData = Join-Path $root 'pgdata'

function Test-PortOpen {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $connection
}

if (-not (Test-Path (Join-Path $pgBin 'pg_ctl.exe'))) {
    throw "PostgreSQL 16 command line tools were not found at $pgBin"
}

& (Join-Path $pgBin 'pg_isready.exe') -h localhost -p 5432 -U postgres | Out-Null
if ($LASTEXITCODE -ne 0) {
    & (Join-Path $pgBin 'pg_ctl.exe') -D $pgData -l (Join-Path $pgData 'server.log') -o "-p 5432" start
}

if (-not (Test-PortOpen 3000)) {
    Start-Process -FilePath 'node.exe' `
        -ArgumentList 'server.js' `
        -WorkingDirectory (Join-Path $root 'backend') `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $root 'backend\server.out.log') `
        -RedirectStandardError (Join-Path $root 'backend\server.err.log')
}

if (-not (Test-PortOpen 8081)) {
    Start-Process -FilePath 'npx.cmd' `
        -ArgumentList 'http-server -p 8081' `
        -WorkingDirectory $root `
        -WindowStyle Hidden `
        -RedirectStandardOutput (Join-Path $root 'frontend.out.log') `
        -RedirectStandardError (Join-Path $root 'frontend.err.log')
}

Write-Host 'Backend:  http://localhost:3000/api/health'
Write-Host 'Frontend: http://localhost:8081'
