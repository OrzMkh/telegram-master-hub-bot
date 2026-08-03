with open('server.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the rate_task msg_text block by its unique start marker
MARKER = '{task_text}\n"'
idx = content.find('ОЦЕНКА ЗА ЗАДАЧУ')
if idx < 0:
    print('ERROR: ОЦЕНКА not found')
    exit(1)

# Find the msg_text = ( before this marker
start = content.rfind('msg_text = (', 0, idx)
end = content.find('\n            if rating_comment:', start) + len('\n            if rating_comment:\n                msg_text += f"\\U0001f4ac <b>\\u041a\\u043e\\u043c\\u043c\\u0435\\u043d\\u0442\\u0430\\u0440\\u0438\\u0439:</b> \\u00ab{rating_comment}\\u00bb\\n"')

print(f'start: {start}, end: {end}')
old_block = content[start:end]
print('Old block found, length:', len(old_block))
with open('old_block.txt', 'w', encoding='utf-8') as f:
    f.write(old_block)
print('Written to old_block.txt')
