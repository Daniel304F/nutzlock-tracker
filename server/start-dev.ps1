<#
.SYNOPSIS
Starts the FastAPI development server.

.DESCRIPTION
Runs uv sync by default, then starts Uvicorn with reload enabled. If the
requested port is not available, the script picks the next free port unless
-StrictPort is set.

.EXAMPLE
.\start-dev.ps1

.EXAMPLE
.\start-dev.ps1 -Port 8002 -SkipSync
#>

[CmdletBinding()]
param(
    [string]$BindHost = "127.0.0.1",
    [int]$Port = 8000,
    [switch]$NoReload,
    [switch]$SkipSync,
    [switch]$StrictPort
)

$ErrorActionPreference = "Stop"

function ConvertTo-BindAddress {
    param([string]$Address)

    if ($Address -eq "localhost") {
        return [System.Net.IPAddress]::Loopback
    }

    try {
        return [System.Net.IPAddress]::Parse($Address)
    }
    catch {
        throw "BindHost must be an IP address such as 127.0.0.1 or 0.0.0.0."
    }
}

function Test-PortAvailable {
    param(
        [string]$Address,
        [int]$CandidatePort
    )

    $listener = $null

    try {
        $listener = [System.Net.Sockets.TcpListener]::new(
            (ConvertTo-BindAddress -Address $Address),
            $CandidatePort
        )
        $listener.Start()
        return $true
    }
    catch {
        return $false
    }
    finally {
        if ($listener) {
            $listener.Stop()
        }
    }
}

function Resolve-Port {
    param(
        [string]$Address,
        [int]$RequestedPort,
        [bool]$RequireRequestedPort
    )

    if (Test-PortAvailable -Address $Address -CandidatePort $RequestedPort) {
        return $RequestedPort
    }

    if ($RequireRequestedPort) {
        throw "Port $RequestedPort is not available on $Address."
    }

    for ($candidate = $RequestedPort + 1; $candidate -lt $RequestedPort + 50; $candidate++) {
        if (Test-PortAvailable -Address $Address -CandidatePort $candidate) {
            Write-Host "Port $RequestedPort is busy. Using $candidate instead."
            return $candidate
        }
    }

    throw "No free development port found between $RequestedPort and $($RequestedPort + 49)."
}

function Get-DisplayHost {
    param([string]$Address)

    if ($Address -eq "0.0.0.0") {
        return "127.0.0.1"
    }

    return $Address
}

$serverRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$resolvedPort = Resolve-Port `
    -Address $BindHost `
    -RequestedPort $Port `
    -RequireRequestedPort $StrictPort.IsPresent
$displayHost = Get-DisplayHost -Address $BindHost

Push-Location $serverRoot

try {
    if (-not $SkipSync) {
        Write-Host "Syncing backend dependencies..."
        python -m uv sync

        if ($LASTEXITCODE -ne 0) {
            exit $LASTEXITCODE
        }
    }

    $uvicornArgs = @(
        "-m",
        "uv",
        "run",
        "uvicorn",
        "nutzlock_tracker.main:app",
        "--host",
        $BindHost,
        "--port",
        $resolvedPort.ToString()
    )

    if (-not $NoReload) {
        $uvicornArgs += "--reload"
    }

    Write-Host "Starting API at http://$displayHost`:$resolvedPort/api/v1"
    Write-Host "Docs: http://$displayHost`:$resolvedPort/api/v1/docs"
    python @uvicornArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
