import sqlite3

conn = sqlite3.connect('../telegram-task-manager-bot/tasks.db')
c = conn.cursor()

cols = [r[1] for r in c.execute('PRAGMA table_info(tasks)').fetchall()]

if 'priority' not in cols:
    c.execute("ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'Medium'")

if 'city' not in cols:
    c.execute("ALTER TABLE tasks ADD COLUMN city TEXT DEFAULT 'Ташкент'")

if 'rating' not in cols:
    c.execute("ALTER TABLE tasks ADD COLUMN rating INTEGER DEFAULT 0")

if 'rating_comment' not in cols:
    c.execute("ALTER TABLE tasks ADD COLUMN rating_comment TEXT DEFAULT ''")

if 'completed_at' not in cols:
    c.execute("ALTER TABLE tasks ADD COLUMN completed_at TEXT DEFAULT ''")

conn.commit()
conn.close()
print("Migration of tasks.db completed successfully!")
