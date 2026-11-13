from app.utils.constants import BLOOD_GROUPS

def is_valid_blood_group(bg: str):
    return bg in BLOOD_GROUPS
