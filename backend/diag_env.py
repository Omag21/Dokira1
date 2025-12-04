# name=diag_env.py
import os
from dotenv import load_dotenv

load_dotenv()

s = os.getenv("DATABASE_URL")
print("DATABASE_URL repr:", repr(s))
if s is None:
    print("DATABASE_URL is None")
else:
    try:
        b = s.encode("utf-8")
        print("utf-8 bytes length:", len(b))
    except Exception as e:
        print("utf-8 encoding error:", e)
    # show bytes with hex and show the codepoint at pos 84 if exists
    raw = s.encode("latin-1", errors="backslashreplace") if s is not None else b""
    print("bytes (latin-1 show):", raw)
    # print problematic byte around pos 84 if length permits
    pos = 84
    if s is not None and len(s) > pos:
        print("char at pos", pos, "->", s[pos], "ord:", ord(s[pos]))
    else:
        print("DATABASE_URL shorter than position", pos)