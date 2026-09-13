import sys

path = sys.argv[1] if len(sys.argv) > 1 else 'categories.js'

def check_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        s = f.read()

    stack = []
    pairs = {'{':'}','[':']','(':')'}
    opening = set(pairs.keys())
    closing = set(pairs.values())
    line = 1
    issues = []
    in_single = False
    in_double = False
    esc = False

    for i,ch in enumerate(s):
        if ch == '\n':
            line += 1
        if esc:
            esc = False
            continue
        if ch == '\\':
            esc = True
            continue
        if ch == '"' and not in_single:
            in_double = not in_double
            continue
        if ch == "'" and not in_double:
            in_single = not in_single
            continue
        if in_single or in_double:
            continue
        if ch in opening:
            stack.append((ch,line,i))
        elif ch in closing:
            if not stack:
                issues.append(f"Unmatched closing {ch} at line {line}")
            else:
                o,ol,oi = stack.pop()
                if pairs[o] != ch:
                    issues.append(f"Mismatched {o} (line {ol}) and {ch} (line {line})")

    if in_single or in_double:
        issues.append('Unterminated string literal')
    if stack:
        for o,ol,oi in reversed(stack):
            issues.append(f"Unclosed {o} starting at line {ol}")

    if issues:
        print('Syntax issues found:')
        for it in issues:
            print('-', it)
        return 1
    else:
        print('No obvious brace/quote syntax issues found.')
        return 0

if __name__ == '__main__':
    rc = check_file(path)
    sys.exit(rc)
