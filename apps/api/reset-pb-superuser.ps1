# ══════════════════════════════════════════════════════════════
# reset-pb-superuser.ps1
# Réinitialise le superutilisateur PocketBase et met à jour .env
# Usage : Exécuter dans PowerShell depuis n'importe quel dossier
# ══════════════════════════════════════════════════════════════

# ▼▼▼ MODIFIE CES DEUX LIGNES ▼▼▼
$NEW_EMAIL    = "admin@iwslaayoune.com"   # ← ton nouvel email
$NEW_PASSWORD = "IWS2026@!Admin"          # ← ton nouveau mot de passe
# ▲▲▲ MODIFIE CES DEUX LIGNES ▲▲▲

$PB_DIR  = "C:\Users\HP\Desktop\Site_pro\codeexp\apps\pocketbase"
$PB_EXE  = "$PB_DIR\pocketbase.exe"
$ENV_FILE = "C:\Users\HP\Desktop\Site_pro\codeexp\apps\api\.env"

Write-Host "`n🔧 Réinitialisation du superutilisateur PocketBase" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════"

# 1. Arrêter PocketBase s'il tourne
Write-Host "`n⏹  Arrêt de PocketBase..." -ForegroundColor Yellow
$pb_proc = Get-Process -Name "pocketbase" -ErrorAction SilentlyContinue
if ($pb_proc) {
    Stop-Process -Name "pocketbase" -Force
    Start-Sleep -Seconds 2
    Write-Host "   ✅ PocketBase arrêté" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  PocketBase n'était pas en cours d'exécution" -ForegroundColor Gray
}

# 2. Créer/mettre à jour le superutilisateur
Write-Host "`n🔑 Création du superutilisateur..." -ForegroundColor Yellow
Write-Host "   Email    : $NEW_EMAIL"
Write-Host "   Password : $('*' * $NEW_PASSWORD.Length)"

$result = & $PB_EXE superuser upsert $NEW_EMAIL $NEW_PASSWORD 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Superutilisateur créé/mis à jour !" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur : $result" -ForegroundColor Red
    exit 1
}

# 3. Mettre à jour .env
Write-Host "`n📝 Mise à jour de .env..." -ForegroundColor Yellow
$env_content = Get-Content $ENV_FILE -Raw

$env_content = $env_content -replace '(?m)^PB_SUPERUSER_EMAIL=.*$', "PB_SUPERUSER_EMAIL=$NEW_EMAIL"
$env_content = $env_content -replace '(?m)^PB_SUPERUSER_PASSWORD=.*$', "PB_SUPERUSER_PASSWORD=$NEW_PASSWORD"

Set-Content $ENV_FILE $env_content -NoNewline
Write-Host "   ✅ .env mis à jour" -ForegroundColor Green

# 4. Relancer PocketBase
Write-Host "`n🚀 Relancement de PocketBase..." -ForegroundColor Yellow
Start-Process -FilePath $PB_EXE -ArgumentList "serve", "--http=127.0.0.1:8090" -WorkingDirectory $PB_DIR
Start-Sleep -Seconds 3

# 5. Test de connexion
Write-Host "`n🧪 Test de connexion..." -ForegroundColor Yellow
$test = node -e "
import('pocketbase').then(async ({default: PB}) => {
  const pb = new PB('http://127.0.0.1:8090');
  try {
    await pb.collection('_superusers').authWithPassword('$NEW_EMAIL', '$NEW_PASSWORD');
    console.log('OK');
  } catch(e) {
    console.log('FAIL: ' + e.message);
  }
}).catch(e => console.log('FAIL: ' + e.message));
" 2>&1

if ($test -match "OK") {
    Write-Host "   ✅ Connexion réussie !" -ForegroundColor Green
    Write-Host "`n✅ Tout est prêt — lance 'node src/main.js' dans apps/api" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️  $test" -ForegroundColor Red
    Write-Host "   → Attends 5 secondes et reteste manuellement" -ForegroundColor Yellow
}

Write-Host "═══════════════════════════════════════════════════`n"
