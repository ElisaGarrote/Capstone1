import re


def normalize_name_smart(name: str) -> str:
    """Normalize a name string with smart title-casing while preserving short acronyms

    Rules implemented:
    - Collapse whitespace
    - For tokens ending with "'s" (case-insensitive), preserve the "'s" lowercase and
      smart-case the base token.
    - If the alphabetic part of a token is short (<=4 chars) treat it as an acronym and
      uppercase the alphabetic groups (e.g., "sdd's" -> "SDD's").
    - Otherwise, apply title() to the token (normal Title Case).

    This is heuristic-based and aims to keep acronyms readable while making ordinary
    words Title Case.
    """

    if not name:
        return name

    s = " ".join(name.split()).strip()

    def fix_token(tok: str) -> str:
        # handle trailing possessive 's or ’s
        lower_tok = tok
        if lower_tok.lower().endswith("'s") or lower_tok.lower().endswith("’s"):
            base = tok[:-2]
            suffix = tok[-2:]
            letters = re.sub(r"[^A-Za-z]", "", base)
            if 2 <= len(letters) <= 4:
                # uppercase alphabetic groups, keep suffix as "'s"
                base_fixed = re.sub(r"[A-Za-z]+", lambda m: m.group(0).upper(), base)
                return base_fixed + "'s"
            else:
                return base.title() + "'s"

        # general token handling
        letters = re.sub(r"[^A-Za-z]", "", tok)
        if 2 <= len(letters) <= 4:
            # treat as acronym -> uppercase alphabetic groups
            return re.sub(r"[A-Za-z]+", lambda m: m.group(0).upper(), tok)
        # default: title case
        return tok.title()

    tokens = s.split(' ')
    fixed = [fix_token(t) for t in tokens]
    return ' '.join(fixed)
