from enum import Enum


class Mood(str, Enum):
    HAPPY = "happy"
    TIRED = "tired"
    SAD = "sad"
    ANXIOUS = "anxious"
    OVERWHELMED = "overwhelmed"