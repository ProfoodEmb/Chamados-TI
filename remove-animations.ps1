$content = Get-Content "components\create-ticket-dialog.tsx" -Raw

# Remove import do framer-motion
$content = $content -replace 'import \{ motion, AnimatePresence \} from "framer-motion"', ''

# Remove variants definitions
$content = $content -replace '(?s)const containerVariants = \{[^}]+\}', ''
$content = $content -replace '(?s)const itemVariants = \{[^}]+\}', ''
$content = $content -replace '(?s)const cardVariants = \{[^}]+\}', ''

# Remove showCables state
$content = $content -replace '\s*const \[showCables, setShowCables\] = useState\(false\)', ''

# Remove cableColors array
$content = $content -replace '(?s)// Cores dos cabos de rede.*?\]', ''

# Remove cable animation trigger
$content = $content -replace '(?s)// Trigger cable animation.*?setShowCables\(false\), 2000\)\s+\}', '}'

# Remove AnimatePresence wrapper for cables
$content = $content -replace '(?s)<AnimatePresence>.*?showCables.*?</AnimatePresence>', ''

# Replace motion.div with div
$content = $content -replace '<motion\.div', '<div'
$content = $content -replace '</motion\.div>', '</div>'

# Remove animation props
$content = $content -replace '\s+variants=\{[^}]+\}', ''
$content = $content -replace '\s+initial="[^"]*"', ''
$content = $content -replace '\s+animate="[^"]*"', ''
$content = $content -replace '\s+exit="[^"]*"', ''
$content = $content -replace '\s+whileHover=\{[^}]+\}', ''
$content = $content -replace '\s+whileTap=\{[^}]+\}', ''
$content = $content -replace '\s+transition=\{[^}]+\}', ''
$content = $content -replace '\s+custom=\{[^}]+\}', ''

# Remove AnimatePresence wrappers
$content = $content -replace '<AnimatePresence[^>]*>', ''
$content = $content -replace '</AnimatePresence>', ''

# Remove motion wrappers around checkmarks and images
$content = $content -replace '(?s)<motion\.div\s+initial=\{ scale: 0 \}.*?>(.*?)</motion\.div>', '$1'

$content | Set-Content "components\create-ticket-dialog.tsx"
Write-Host "Animações removidas com sucesso!"
