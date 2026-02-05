# Copy Report Components Script
# This script copies all report components from the updated folder to your working folder

$source = "c:\Users\advai\Downloads\MUS-Node-client-uu-updated\MUS-Node-client-ui\client"
$dest = "c:\Users\advai\Downloads\MUS-Node-client-ui\MUS-Node-client-ui\client"

Write-Host "Copying report components..." -ForegroundColor Green

# Copy report folder (excluding already copied files)
$reportFiles = @(
    "components\report\ReportLayout.tsx",
    "components\report\ReportRenderer.tsx",
    "components\report\ReportPDFTemplate.tsx",
    "components\report\ExecutiveSummaryDisplay.tsx",
    "components\report\AuditCards.tsx",
    "components\report\DetailedAuditView.tsx",
    "components\report\AccessibilityAuditView.tsx",
    "components\report\CompetitorAnalysisView.tsx",
    "components\report\ScoreComponents.tsx",
    "components\report\StrategyComponents.tsx"
)

foreach ($file in $reportFiles) {
    $sourcePath = Join-Path $source $file
    $destPath = Join-Path $dest $file
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "✓ Copied: $file" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Not found: $file" -ForegroundColor Yellow
    }
}

# Copy report views subfolder
Write-Host "`nCopying report views..." -ForegroundColor Green
$viewsDir = Join-Path $dest "components\report\views"
if (-not (Test-Path $viewsDir)) {
    New-Item -ItemType Directory -Path $viewsDir -Force | Out-Null
}

$viewFiles = @(
    "components\report\views\StandardReportView.tsx",
    "components\report\views\CompetitorReportView.tsx"
)

foreach ($file in $viewFiles) {
    $sourcePath = Join-Path $source $file
    $destPath = Join-Path $dest $file
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "✓ Copied: $file" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Not found: $file" -ForegroundColor Yellow
    }
}

# Copy hooks
Write-Host "`nCopying hooks..." -ForegroundColor Green
$hookFiles = @(
    "hooks\useReportPdf.tsx"
)

foreach ($file in $hookFiles) {
    $sourcePath = Join-Path $source $file
    $destPath = Join-Path $dest $file
    
    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "✓ Copied: $file" -ForegroundColor Cyan
    } else {
        Write-Host "✗ Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Copy complete!" -ForegroundColor Green
Write-Host "Note: Dashboard and API Keys pages were preserved as requested." -ForegroundColor Yellow
