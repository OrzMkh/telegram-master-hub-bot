#!/bin/bash
# ==============================================================================
# 🚀 ALL-IN-ONE DEPLOYMENT SCRIPT FOR ESKIZ.UZ (UBUNTU 22.04 / 24.04)
# Deploying all 4 Telegram Bots with persistent systemd services
# ==============================================================================

set -e

echo "=========================================================="
echo "  🚀 Установка и запуск всех 4 ботов на Eskiz.uz VPS      "
echo "=========================================================="

# 1. Update system packages
echo "📦 [1/6] Обновление системных пакетов..."
export DEBIAN_FRONTEND=noninteractive
apt update -y && apt install -y python3-pip python3-venv git curl ufw

# 2. Setup directory
echo "📁 [2/6] Создание директорий..."
mkdir -p /root/bots
cd /root/bots

SERVER_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')
echo "ℹ️ Опеределен IP сервера: $SERVER_IP"

# ==============================================================================
# 🤖 BOT 1: telegram-task-manager-bot
# ==============================================================================
echo "⚙️ [3/6] Настройка 1: Telegram Task Manager Bot..."
if [ -d "/root/bots/telegram-task-manager-bot" ]; then
    cd /root/bots/telegram-task-manager-bot && git pull
else
    git clone https://github.com/OrzMkh/telegram-task-manager-bot.git /root/bots/telegram-task-manager-bot
    cd /root/bots/telegram-task-manager-bot
fi

python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

cat << 'EOF' > .env
# Telegram Bot API Token
BOT_TOKEN=8666306951:AAHpc6fcVz8AyhxV-9uCxCyKw7_9zXasU2g
TARGET_CHAT_ID=-1002638798110
SPREADSHEET_ID=14lJVvDmK9LOAERAo9twp3Ak-FEdvlrzu-8FywP2dTn4
CREDENTIALS_FILE=credentials.json
DB_PATH=tasks.db
SLA_CHECK_INTERVAL=30
PORT=8081
EOF

cat << 'EOF' > /etc/systemd/system/bot-task-manager.service
[Unit]
Description=Telegram Task Manager Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/bots/telegram-task-manager-bot
ExecStart=/root/bots/telegram-task-manager-bot/venv/bin/python main.py
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# ==============================================================================
# 🤖 BOT 2: telegram-rich-bike-bot
# ==============================================================================
echo "⚙️ [4/6] Настройка 2: Telegram Rich Bike Bot..."
if [ -d "/root/bots/telegram-rich-bike-bot" ]; then
    cd /root/bots/telegram-rich-bike-bot && git pull
else
    git clone https://github.com/OrzMkh/telegram-rich-bike-bot.git /root/bots/telegram-rich-bike-bot
    cd /root/bots/telegram-rich-bike-bot
fi

python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

cat << 'EOF' > .env
BOT_TOKEN=8984886581:AAF4A9WYBkmv0h3l5-SiPT9_lb9UVD9azpk
ADMIN_IDS=509067967
GROUP_CHAT_ID=-4851152519,-1004851152519
SPREADSHEET_ID=1Oskxt5oHfO50PDn47I_7rbn4KGfEoy_JcVsn3mBIiyw
CREDENTIALS_FILE=credentials.json
DB_PATH=bike_reports.db
PORT=8082
INTERNAL_API_SECRET=RpkNogCeRWOtIaT94Er9Fu9rH6uWK0D
EOF

cat << 'EOF' > /etc/systemd/system/bot-rich-bike.service
[Unit]
Description=Telegram Rich Bike Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/bots/telegram-rich-bike-bot
ExecStart=/root/bots/telegram-rich-bike-bot/venv/bin/python main.py
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# ==============================================================================
# 🤖 BOT 3: telegram-bike-report-bot
# ==============================================================================
echo "⚙️ [5/6] Настройка 3: Telegram Bike Report Bot..."
if [ -d "/root/bots/telegram-bike-report-bot" ]; then
    cd /root/bots/telegram-bike-report-bot && git pull
else
    git clone https://github.com/OrzMkh/telegram-bike-report-bot.git /root/bots/telegram-bike-report-bot
    cd /root/bots/telegram-bike-report-bot
fi

python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

cat << 'EOF' > .env
BOT_TOKEN=8984886581:AAF4A9WYBkmv0h3l5-SiPT9_lb9UVD9azpk
ADMIN_IDS=509067967
GROUP_CHAT_ID=-4946205555,-4573236562
SPREADSHEET_ID=1Oskxt5oHfO50PDn47I_7rbn4KGfEoy_JcVsn3mBIiyw
CREDENTIALS_FILE=credentials.json
DB_PATH=bike_reports.db
PORT=8083
INTERNAL_API_SECRET=RpkNogCeRWOtIaT94Er9Fu9rH6uWK0D
EOF

cat << 'EOF' > /etc/systemd/system/bot-bike-report.service
[Unit]
Description=Telegram Bike Report Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/bots/telegram-bike-report-bot
ExecStart=/root/bots/telegram-bike-report-bot/venv/bin/python main.py
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# ==============================================================================
# 🤖 BOT 4: telegram-master-hub-bot (Dashboard + Web Panel)
# ==============================================================================
echo "⚙️ [6/6] Настройка 4: Telegram Master Hub Bot & Web Panel..."
if [ -d "/root/bots/telegram-master-hub-bot" ]; then
    cd /root/bots/telegram-master-hub-bot && git pull
else
    git clone https://github.com/OrzMkh/telegram-master-hub-bot.git /root/bots/telegram-master-hub-bot
    cd /root/bots/telegram-master-hub-bot
fi

python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

cat << EOF > .env
BOT_TOKEN=8951006941:AAHhLK-nKKUWx35CAC-jn-wDRL50SB8daPc
MASTER_APP_PASSWORD=9449
TASK_BOT_TOKEN=8666306951:AAHpc6fcVz8AyhxV-9uCxCyKw7_9zXasU2g
TASK_CHAT_ID=-1002638798110
RICH_BOT_URL=http://127.0.0.1:8082
FLEET_BOT_URL=http://127.0.0.1:8083
WEB_APP_URL=http://${SERVER_IP}:8085
INTERNAL_API_SECRET=RpkNogCeRWOtIaT94Er9Fu9rH6uWK0D
PORT=8085
TASKS_DB_PATH=/root/bots/telegram-task-manager-bot/tasks.db
EOF

cat << 'EOF' > /etc/systemd/system/bot-master-hub.service
[Unit]
Description=Telegram Master Hub Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/bots/telegram-master-hub-bot
ExecStart=/root/bots/telegram-master-hub-bot/venv/bin/python main.py
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# ==============================================================================
# 🔥 START ALL SERVICES
# ==============================================================================
echo "🚀 Запуск всех служб..."
systemctl daemon-reload
systemctl enable --now bot-task-manager
systemctl enable --now bot-rich-bike
systemctl enable --now bot-bike-report
systemctl enable --now bot-master-hub

# Allow ports in UFW if enabled
ufw allow 8081/tcp || true
ufw allow 8082/tcp || true
ufw allow 8083/tcp || true
ufw allow 8085/tcp || true
ufw allow ssh || true

# Helper management scripts
cat << 'EOF' > /root/bots/status.sh
#!/bin/bash
echo "=== СТАТУС ВСЕХ 4 БОТОВ ==="
systemctl status bot-task-manager --no-pager -l | head -n 4
echo "----------------------------------------"
systemctl status bot-rich-bike --no-pager -l | head -n 4
echo "----------------------------------------"
systemctl status bot-bike-report --no-pager -l | head -n 4
echo "----------------------------------------"
systemctl status bot-master-hub --no-pager -l | head -n 4
EOF
chmod +x /root/bots/status.sh

cat << 'EOF' > /root/bots/restart_all.sh
#!/bin/bash
systemctl restart bot-task-manager bot-rich-bike bot-bike-report bot-master-hub
echo "Все 4 бота перезапущены!"
EOF
chmod +x /root/bots/restart_all.sh

echo "=========================================================="
echo "🎉 ВСЕ 4 БОТА УСПЕШНО УСТАНОВЛЕНЫ И ЗАПУЩЕНЫ 24/7!"
echo "=========================================================="
echo "1. Task Manager Bot:  [АКТИВЕН] (порт 8081)"
echo "2. Rich Bike Bot:     [АКТИВЕН] (порт 8082)"
echo "3. Bike Report Bot:   [АКТИВЕН] (порт 8083)"
echo "4. Master Hub Bot:    [АКТИВЕН] (порт 8085)"
echo ""
echo "🌐 Веб-панель Master Hub доступна по адресу: http://${SERVER_IP}:8085"
echo "Команды для управления:"
echo "  • Проверить статус:   /root/bots/status.sh"
echo "  • Перезапустить всех: /root/bots/restart_all.sh"
echo "  • Посмотреть логи:    journalctl -u bot-task-manager -f"
echo "=========================================================="
