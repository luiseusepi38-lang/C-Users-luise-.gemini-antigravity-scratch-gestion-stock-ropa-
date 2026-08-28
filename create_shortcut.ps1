$desktopPath = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")
$shortcutPath = [System.IO.Path]::Combine($desktopPath, "StockMaster.lnk")
$targetPath = "C:\Users\luise\.gemini\antigravity\scratch\gestion-stock-ropa\index.html"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = $targetPath
$Shortcut.Description = "Control de Stock e Importador de Remitos para Tienda de Ropa"
$Shortcut.IconLocation = "shell32.dll,22" # Nice box folder icon
$Shortcut.Save()

Write-Output "Acceso directo creado en: $shortcutPath"
