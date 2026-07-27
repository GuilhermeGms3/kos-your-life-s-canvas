$ErrorActionPreference = "Stop"

$integrationRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataRoot = Join-Path $integrationRoot "data"
$configRoot = Join-Path $dataRoot "config"
$libraryRoot = Join-Path $dataRoot "library"
$metadataPath = Join-Path $libraryRoot "metadata.db"

New-Item -ItemType Directory -Force -Path $configRoot, $libraryRoot | Out-Null

if (-not (Test-Path -LiteralPath $metadataPath)) {
    $sampleUrl = "https://github.com/janeczku/calibre-web/raw/master/library/metadata.db"
    Invoke-WebRequest -Uri $sampleUrl -OutFile $metadataPath
    Write-Host "Sample Calibre database downloaded to $metadataPath"
}
else {
    Write-Host "Calibre database already exists at $metadataPath"
}

Write-Host ""
Write-Host "Start Docker Desktop, then run:"
Write-Host "docker compose -f `"$integrationRoot\compose.yml`" up -d"
Write-Host ""
Write-Host "Open http://127.0.0.1:8083 and configure the library path as /books."
