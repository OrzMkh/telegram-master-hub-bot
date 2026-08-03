import os
import sys
import sqlite3
import datetime
import logging
from dotenv import load_dotenv
from telegram import (
    Update,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    WebAppInfo
)
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ConversationHandler,
    ContextTypes,
    filters
)

logger = logging.getLogger("rich_bot")

RICH_BOT_TOKEN = os.getenv("RICH_BOT_TOKEN", "8803642782:AAHiSsVxnleQIrOytksRHTVmH_vWWYtcKSg").strip()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BIKES_DB_PATH = os.path.join(BASE_DIR, "bike_reports.db")
TARGET_CHAT_ID = "-1002638798110"

# Conversation states
CITY, ISSUED, RETURNED, COMMENT = range(4)
FLEET_CITY, FLEET_NUM = range(4, 6)

def get_current_web_app_url():
    load_dotenv(override=True)
    return os.getenv("WEB_APP_URL", "https://sponsors-ask-files-factors.trycloudflare.com").strip()

def init_rich_db():
    try:
        conn = sqlite3.connect(BIKES_DB_PATH)
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS rich_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                city TEXT,
                report_date TEXT,
                issued INTEGER DEFAULT 0,
                returned INTEGER DEFAULT 0,
                comment TEXT,
                status TEXT DEFAULT 'Active'
            )
        """)
        try:
            c.execute("ALTER TABLE rich_reports ADD COLUMN comment TEXT")
        except Exception:
            pass

        c.execute("""
            CREATE TABLE IF NOT EXISTS rich_cities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                total_bikes INTEGER DEFAULT 50,
                created_at TEXT
            )
        """)
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"init_rich_db error: {e}")

init_rich_db()

def save_rich_report_to_db(username, city, issued, returned, comment=""):
    init_rich_db()
    try:
        conn = sqlite3.connect(BIKES_DB_PATH)
        c = conn.cursor()
        now_str = datetime.datetime.now().strftime("%d.%m.%Y %H:%M")
        c.execute("""
            INSERT INTO rich_reports (username, city, report_date, issued, returned, comment)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (username, city, now_str, int(issued), int(returned), comment))
        conn.commit()
        conn.close()
        logger.info(f"Saved rich report: {city}, issued={issued}, returned={returned}")
        return now_str
    except Exception as e:
        logger.error(f"Failed to save rich report: {e}")
        return None

def get_rich_cities_from_db():
    init_rich_db()
    try:
        conn = sqlite3.connect(BIKES_DB_PATH)
        c = conn.cursor()
        c.execute("SELECT name FROM rich_cities ORDER BY id ASC")
        rows = [r[0] for r in c.fetchall()]
        conn.close()
        return rows if rows else ["Ташкент (Rich)", "Самарканд (Rich)", "Бухара (Rich)"]
    except Exception:
        return ["Ташкент (Rich)", "Самарканд (Rich)", "Бухара (Rich)"]

def update_city_fleet_in_db(city_name, total_bikes):
    init_rich_db()
    try:
        conn = sqlite3.connect(BIKES_DB_PATH)
        c = conn.cursor()
        now_str = datetime.datetime.now().strftime("%d.%m.%Y")
        c.execute("INSERT INTO rich_cities (name, total_bikes, created_at) VALUES (?, ?, ?) ON CONFLICT(name) DO UPDATE SET total_bikes=?", (city_name, total_bikes, now_str, total_bikes))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Failed to update city fleet: {e}")
        return False

async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    name = user.first_name if user else "Оператор"
    web_url = get_current_web_app_url()

    keyboard = [
        [InlineKeyboardButton("🌐 Открыть Админ-Панель (Web App)", web_app=WebAppInfo(url=web_url))],
        [InlineKeyboardButton("📊 Отправить отчёт (Гибриды Rich)", callback_data="start_rich_report")],
        [InlineKeyboardButton("⚙️ Изменить парк / Города Rich", callback_data="start_fleet_update")],
        [InlineKeyboardButton("📈 Последние отчёты Rich", callback_data="view_recent_rich_reports")],
        [InlineKeyboardButton("ℹ️ Помощь и Инструкция", callback_data="rich_help")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    welcome_text = (
        f"🟧 <b>Админ-Панель и Бот отчётов Rich Hybrid</b>\n\n"
        f"Здравствуйте, <b>{name}</b>!\n"
        f"Добро пожаловать в систему управления электро-гибридами <b>Rich</b>.\n\n"
        f"Вы можете отправлять ежедневные отчёты, настраивать лимиты парка по городам или открыть веб-панель ниже:"
    )

    await update.message.reply_text(welcome_text, parse_mode="HTML", reply_markup=reply_markup)

async def help_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    help_text = (
        "ℹ️ <b>Инструкция по работе с Rich Bot:</b>\n\n"
        "1. <b>🌐 Открыть Админ-Панель</b> — открывает полную визуальную веб-панель управления.\n"
        "2. <b>📊 Отправить отчёт</b> — выберите город, введите количество гибридов на линии и на базе.\n"
        "3. <b>⚙️ Изменить парк</b> — редактирование общей численности гибридов в городе.\n"
        "4. <b>📈 Последние отчёты</b> — история последних зафиксированных отчётов."
    )
    if update.callback_query:
        await update.callback_query.answer()
        await update.callback_query.edit_message_text(help_text, parse_mode="HTML")
    else:
        await update.message.reply_text(help_text, parse_mode="HTML")

# --- REPORT CONVERSATION HANDLERS ---
async def report_start_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    if query:
        await query.answer()

    cities = get_rich_cities_from_db()
    buttons = []
    for idx, c in enumerate(cities):
        buttons.append([InlineKeyboardButton(f"🏙 {c}", callback_data=f"rcity_{idx}")])
    buttons.append([InlineKeyboardButton("❌ Отмена", callback_data="cancel_rich_report")])

    if query:
        await query.edit_message_text(
            "🏙 <b>Шаг 1/4: Выберите город для отчёта по гибридам Rich:</b>",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(buttons)
        )
    else:
        await update.message.reply_text(
            "🏙 <b>Шаг 1/4: Выберите город для отчёта по гибридам Rich:</b>",
            parse_mode="HTML",
            reply_markup=InlineKeyboardMarkup(buttons)
        )
    return CITY

async def report_city_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    idx_str = query.data.replace("rcity_", "")
    cities = get_rich_cities_from_db()
    if idx_str.isdigit() and int(idx_str) < len(cities):
        city_name = cities[int(idx_str)]
    else:
        city_name = "Ташкент (Rich)"

    context.user_data["rich_city"] = city_name

    await query.edit_message_text(
        f"✅ Город: <b>{city_name}</b>\n\n"
        f"🛵 <b>Шаг 2/4: Введите количество гибридов НА ЛИНИИ (выданных):</b>\n"
        f"<i>(Введите только число, например: 75)</i>",
        parse_mode="HTML"
    )
    return ISSUED

async def report_issued_entered(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if not text.isdigit():
        await update.message.reply_text("⚠️ Пожалуйста, введите корректное число (например: 75):")
        return ISSUED

    context.user_data["rich_issued"] = int(text)

    await update.message.reply_text(
        f"🏠 <b>Шаг 3/4: Введите количество гибридов НА БАЗЕ (возвращённых/ремонт):</b>\n"
        f"<i>(Введите только число, например: 25)</i>",
        parse_mode="HTML"
    )
    return RETURNED

async def report_returned_entered(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if not text.isdigit():
        await update.message.reply_text("⚠️ Пожалуйста, введите корректное число (например: 25):")
        return RETURNED

    context.user_data["rich_returned"] = int(text)

    keyboard = [[InlineKeyboardButton("➡️ Пропустить комментарий", callback_data="skip_rich_comment")]]
    await update.message.reply_text(
        f"💬 <b>Шаг 4/4: Добавьте комментарий или примечание (если есть):</b>\n"
        f"<i>(Или нажмите кнопку ниже, чтобы пропустить)</i>",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )
    return COMMENT

async def finish_rich_report(update: Update, context: ContextTypes.DEFAULT_TYPE, comment=""):
    user = update.effective_user
    username = user.username if user and user.username else (user.first_name if user else "Оператор")
    city = context.user_data.get("rich_city", "Ташкент (Rich)")
    issued = context.user_data.get("rich_issued", 0)
    returned = context.user_data.get("rich_returned", 0)

    now_str = save_rich_report_to_db(username, city, issued, returned, comment)
    date_display = now_str if now_str else datetime.datetime.now().strftime("%d.%m.%Y %H:%M")

    summary_text = (
        f"🎉 <b>Отчёт по гибридам Rich успешно принят!</b>\n\n"
        f"🏙 <b>Город:</b> {city}\n"
        f"🛵 <b>На линии (Выдано):</b> <b>{issued}</b>\n"
        f"🏠 <b>На базе / Ремонт:</b> <b>{returned}</b>\n"
        f"{f'💬 <b>Примечание:</b> {comment}' if comment else ''}\n"
        f"👤 <b>Оператор:</b> @{username}\n"
        f"📅 <b>Дата:</b> {date_display}\n\n"
        f"✅ Данные мгновенно обновлены на Дашборде Master Hub!"
    )

    if update.callback_query:
        await update.callback_query.answer()
        await update.callback_query.edit_message_text(summary_text, parse_mode="HTML")
    else:
        await update.message.reply_text(summary_text, parse_mode="HTML")

    # Send report notification to master group
    try:
        group_msg = (
            f"📊 <b>Новый отчёт по гибридам Rich</b>\n\n"
            f"🏙 <b>Город:</b> {city}\n"
            f"🛵 <b>На линии:</b> <b>{issued}</b> | 🏠 <b>На базе:</b> <b>{returned}</b>\n"
            f"👤 <b>Отправил:</b> @{username}"
        )
        await context.bot.send_message(chat_id=TARGET_CHAT_ID, text=group_msg, parse_mode="HTML")
    except Exception as e:
        logger.error(f"Failed to send group notification: {e}")

    return ConversationHandler.END

async def report_comment_entered(update: Update, context: ContextTypes.DEFAULT_TYPE):
    comment = update.message.text.strip()
    return await finish_rich_report(update, context, comment)

async def report_comment_skipped(update: Update, context: ContextTypes.DEFAULT_TYPE):
    return await finish_rich_report(update, context, "")

async def report_cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.callback_query:
        await update.callback_query.answer()
        await update.callback_query.edit_message_text("❌ Заполнение отчёта отменено.")
    else:
        await update.message.reply_text("❌ Заполнение отчёта отменено.")
    return ConversationHandler.END

# --- FLEET MANAGEMENT CONVERSATION HANDLERS ---
async def fleet_start_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    cities = get_rich_cities_from_db()
    buttons = []
    for idx, c in enumerate(cities):
        buttons.append([InlineKeyboardButton(f"🏙 {c}", callback_data=f"fcity_{idx}")])
    buttons.append([InlineKeyboardButton("❌ Отмена", callback_data="cancel_fleet_update")])

    await query.edit_message_text(
        "⚙️ <b>Выберите город для изменения парка гибридов Rich:</b>",
        parse_mode="HTML",
        reply_markup=InlineKeyboardMarkup(buttons)
    )
    return FLEET_CITY

async def fleet_city_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    idx_str = query.data.replace("fcity_", "")
    cities = get_rich_cities_from_db()
    if idx_str.isdigit() and int(idx_str) < len(cities):
        city_name = cities[int(idx_str)]
    else:
        city_name = "Ташкент (Rich)"

    context.user_data["fleet_city"] = city_name

    await query.edit_message_text(
        f"🏙 Выбран город: <b>{city_name}</b>\n\n"
        f"🔢 <b>Введите новое общее количество гибридов в этом городе:</b>\n"
        f"<i>(Введите только число, например: 150)</i>",
        parse_mode="HTML"
    )
    return FLEET_NUM

async def fleet_num_entered(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if not text.isdigit():
        await update.message.reply_text("⚠️ Пожалуйста, введите корректное число (например: 150):")
        return FLEET_NUM

    num = int(text)
    city_name = context.user_data.get("fleet_city", "Ташкент (Rich)")

    if update_city_fleet_in_db(city_name, num):
        await update.message.reply_text(
            f"✅ <b>Парк города {city_name} обновлён!</b>\n\n"
            f"📊 Новая численность: <b>{num} гибридов</b>.\n"
            f"Данные сразу отобразятся на Веб-Дашборде!",
            parse_mode="HTML"
        )
    else:
        await update.message.reply_text("❌ Ошибка при обновлении парка в базе данных.")

    return ConversationHandler.END

async def fleet_cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.callback_query:
        await update.callback_query.answer()
        await update.callback_query.edit_message_text("❌ Изменение парка отменено.")
    else:
        await update.message.reply_text("❌ Изменение парка отменено.")
    return ConversationHandler.END

async def recent_reports_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if not os.path.exists(BIKES_DB_PATH):
        await query.edit_message_text("📊 Отчёты пока отсутствуют.")
        return

    try:
        conn = sqlite3.connect(BIKES_DB_PATH)
        c = conn.cursor()
        c.execute("SELECT username, city, report_date, issued, returned, comment FROM rich_reports ORDER BY id DESC LIMIT 5")
        rows = c.fetchall()
        conn.close()

        if not rows:
            msg = "📊 <b>Последние отчёты по Rich:</b>\n\nОтчёты пока отсутствуют."
        else:
            lines = ["📊 <b>Последние 5 отчётов Rich:</b>\n"]
            for r in rows:
                comm = f" | 💬 {r[5]}" if r[5] else ""
                lines.append(f"• 🏙 <b>{r[1]}</b> ({r[2]})\n  🛵 Выдано: <b>{r[3]}</b> | 🏠 На базе: <b>{r[4]}</b>{comm} | 👤 @{r[0]}\n")
            msg = "\n".join(lines)

        await query.edit_message_text(msg, parse_mode="HTML")
    except Exception as e:
        logger.error(f"Error fetching recent reports: {e}")

def setup_rich_bot_application():
    application = (
        ApplicationBuilder()
        .token(RICH_BOT_TOKEN)
        .build()
    )

    report_conv_handler = ConversationHandler(
        entry_points=[
            CallbackQueryHandler(report_start_callback, pattern="^start_rich_report$"),
            CommandHandler("report", report_start_callback)
        ],
        states={
            CITY: [CallbackQueryHandler(report_city_selected, pattern="^rcity_")],
            ISSUED: [MessageHandler(filters.TEXT & (~filters.COMMAND), report_issued_entered)],
            RETURNED: [MessageHandler(filters.TEXT & (~filters.COMMAND), report_returned_entered)],
            COMMENT: [
                CallbackQueryHandler(report_comment_skipped, pattern="^skip_rich_comment$"),
                MessageHandler(filters.TEXT & (~filters.COMMAND), report_comment_entered)
            ]
        },
        fallbacks=[
            CallbackQueryHandler(report_cancel, pattern="^cancel_rich_report$"),
            CommandHandler("cancel", report_cancel)
        ]
    )

    fleet_conv_handler = ConversationHandler(
        entry_points=[
            CallbackQueryHandler(fleet_start_callback, pattern="^start_fleet_update$"),
            CommandHandler("setfleet", fleet_start_callback)
        ],
        states={
            FLEET_CITY: [CallbackQueryHandler(fleet_city_selected, pattern="^fcity_")],
            FLEET_NUM: [MessageHandler(filters.TEXT & (~filters.COMMAND), fleet_num_entered)]
        },
        fallbacks=[
            CallbackQueryHandler(fleet_cancel, pattern="^cancel_fleet_update$"),
            CommandHandler("cancel", fleet_cancel)
        ]
    )

    application.add_handler(CommandHandler("start", start_handler))
    application.add_handler(CommandHandler("help", help_handler))
    application.add_handler(report_conv_handler)
    application.add_handler(fleet_conv_handler)
    application.add_handler(CallbackQueryHandler(help_handler, pattern="^rich_help$"))
    application.add_handler(CallbackQueryHandler(recent_reports_callback, pattern="^view_recent_rich_reports$"))

    return application
