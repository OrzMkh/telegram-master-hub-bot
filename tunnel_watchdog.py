import os
import sys
import time
import subprocess
import re
import urllib.request
import json
import logging

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv не установлен, читаем из окружения

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("Watchdog")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CLOUDFLARED_PATH = os.path.join(BASE_DIR, "cloudflared.exe")
BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
if not BOT_TOKEN:
    logger.warning("BOT_TOKEN is not set in .env. Telegram Menu Button updates will be skipped.")
PORT = int(os.getenv("PORT", "8085"))

def update_telegram_menu_button(web_app_url):
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/setChatMenuButton"
        
        payload = {
            "menu_button": {
                "type": "web_app",
                "text": "🚀 Master Hub App",
                "web_app": {
                    "url": web_app_url
                }
            }
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode("utf-8"))
        if data.get("ok"):
            logger.info(f"Successfully updated Telegram Menu Button to: {web_app_url}")
        else:
            logger.error(f"Failed to set menu button: {data}")
    except Exception as e:
        logger.error(f"Error updating Telegram Menu Button: {e}")

def update_env_file(web_app_url):
    env_path = os.path.join(BASE_DIR, ".env")
    try:
        content = f"BOT_TOKEN={BOT_TOKEN}\nWEB_APP_URL={web_app_url}\nPORT={PORT}\n"
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(content)
        logger.info(f"Updated .env file with WEB_APP_URL={web_app_url}")
    except Exception as e:
        logger.error(f"Error updating .env: {e}")

def check_url_health(web_app_url):
    try:
        health_url = f"http://127.0.0.1:{PORT}/api/dashboard"
        resp = urllib.request.urlopen(health_url, timeout=5)
        return resp.status == 200
    except Exception:
        return False

def start_tunnel_and_watch():
    current_url = None

    while True:
        logger.info("Launching cloudflared tunnel process...")
        proc = subprocess.Popen(
            [CLOUDFLARED_PATH, "tunnel", "--region", "us", "--url", f"http://127.0.0.1:{PORT}"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace"
        )

        tunnel_url = None
        start_time = time.time()

        # Read output to find tunnel URL
        while True:
            line = proc.stdout.readline()
            if not line and proc.poll() is not None:
                break
            if line:
                match = re.search(r'https://[a-zA-Z0-9\-]+\.trycloudflare\.com', line)
                if match:
                    tunnel_url = match.group(0)
                    logger.info(f"Detected new Cloudflare Tunnel URL: {tunnel_url}")
                    break

            if time.time() - start_time > 30:
                logger.warning("Timeout waiting for Tunnel URL. Killing process and retrying...")
                proc.kill()
                break

        if tunnel_url:
            current_url = tunnel_url
            update_env_file(current_url)
            update_telegram_menu_button(current_url)

            # Monitor loop: check health every 20 seconds
            logger.info("Tunnel active. Starting health monitor loop...")
            consecutive_failures = 0
            while True:
                time.sleep(20)
                if proc.poll() is not None:
                    logger.warning("Cloudflare tunnel process terminated unexpectedly!")
                    break

                if not check_url_health(current_url):
                    consecutive_failures += 1
                    logger.warning(f"Health check failed ({consecutive_failures}/10) for {current_url}")
                    if consecutive_failures >= 10:
                        logger.error("Tunnel failed 10 health checks in a row. Restarting tunnel...")
                        proc.kill()
                        break
                else:
                    consecutive_failures = 0

        time.sleep(3)

if __name__ == "__main__":
    start_tunnel_and_watch()
