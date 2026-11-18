# 一键备份脚本：提交所有更改并推送到 GitHub
# 用法：在 sjcode_web 目录下执行  powershell -ExecutionPolicy Bypass -File backup.ps1  "本次改了什么"
$git = "$env:LOCALAPPDATA\Temp\opencode\PortableGit\cmd\git.exe"
$msg = if ($args.Count -gt 0) { $args[0] } else { "backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" }

Set-Location $PSScriptRoot
& $git add -A
$commitOut = & $git commit -m $msg 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "没有新的更改需要提交。" -ForegroundColor Yellow
}
Write-Host $commitOut
& $git push origin main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 备份完成！" -ForegroundColor Green
} else {
    Write-Host "❌ 推送失败，请检查网络（需要开启代理）或 Token 是否过期。" -ForegroundColor Red
}
