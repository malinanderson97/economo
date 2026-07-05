file_path = 'unpacked_temp/word/document.xml'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

delete_ranges = [
    (170, 203), # A NOTE ON WHAT CHANGED
    (509 - 25, 509 + 20), # Debt chart block
    (1242 - 25, 1242 + 20), # Debt control block
    (1685, 1711) # FAQ: The pi^e slider does nothing
]

new_lines = []
for i, line in enumerate(lines):
    line_num = i + 1
    delete = False
    for start, end in delete_ranges:
        if start <= line_num <= end:
            delete = True
            break
    if not delete:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Deleted remaining lines!")
