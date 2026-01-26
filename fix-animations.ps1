$content = Get-Content "components\create-ticket-dialog.tsx" -Raw

# Remove atributos de animação que ficaram em divs normais
$content = $content -replace '\s+initial=\{\{[^}]+\}\}', ''
$content = $content -replace '\s+animate=\{\{[^}]+\}\}\}', ''
$content = $content -replace '\s+animate=\{\{[^}]+\}\}', ''
$content = $content -replace '\s+whileHover=\{\{[^}]+\}\}', ''
$content = $content -replace '\s+whileTap=\{\{[^}]+\}\}', ''
$content = $content -replace '\s+transition=\{\{[^}]+\}\}', ''

$content | Set-Content "components\create-ticket-dialog.tsx"
Write-Host "Atributos de animação removidos!"
