@echo off
rem PM2 自愈巡检：daemon 不存活或 srweb 进程丢失时，从快照恢复
setlocal
set "PM2=C:\Users\伍思晴\AppData\Roaming\npm\pm2.cmd"

"%PM2%" ping 2>nul | findstr /C:"pong" >nul
if errorlevel 1 (
  "%PM2%" resurrect
  goto :end
)

"%PM2%" jlist 2>nul | findstr /C:"srweb" >nul
if errorlevel 1 "%PM2%" resurrect

:end
endlocal
