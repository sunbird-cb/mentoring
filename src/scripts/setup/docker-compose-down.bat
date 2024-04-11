@echo off

rem Set environment variables
set "users_env=%cd%\user_env.txt"
set "interface_env=%cd%\interface_env.txt"
set "scheduler_env=%cd%\scheduler_env.txt"
set "notification_env=%cd%\notification_env.txt"
set "mentoring_env=%cd%\mentoring_env.txt"

rem Run docker-compose
docker-compose -f docker-compose-mentoring.yml down

rem Optionally, clear environment variables after use
set "users_env="
set "interface_env="
set "scheduler_env="
set "notification_env="
set "mentoring_env="

pause
