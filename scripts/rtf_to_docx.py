from docx import Document
import re

rtf_path = 'Depreciation_Report_Documentation.rtf'
docx_path = 'Depreciation_Report_Documentation.docx'

with open(rtf_path, 'r', encoding='utf-8') as f:
    rtf = f.read()

# Replace RTF paragraph markers with newlines
text = rtf.replace('\\par', '\n')

# Remove simple RTF control words (backslash + letters/numbers) and optional trailing space
text = re.sub(r'\\[a-zA-Z]+[0-9\-]*\s?', '', text)

# Remove braces
text = text.replace('{', '').replace('}', '')

# Decode simple unicode escapes like \uNNNN?
text = re.sub(r'\\u(\d+)\?', lambda m: chr(int(m.group(1))), text)

# Collapse multiple blank lines
text = re.sub(r'\n\s*\n+', '\n\n', text)

# Trim
text = text.strip()

# Split paragraphs on double newlines
paras = [p.strip() for p in text.split('\n\n') if p.strip()]

# Write docx
doc = Document()
for p in paras:
    doc.add_paragraph(p)

doc.save(docx_path)
print('Wrote', docx_path)
