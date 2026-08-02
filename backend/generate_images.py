import os
from PIL import Image, ImageDraw, ImageFont

def create_avatar(filename, color1, color2, text):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    size = 200
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a gradient or solid circle
    draw.ellipse((10, 10, size-10, size-10), fill=color1, outline=color2, width=5)
    
    # Draw text in the middle
    # Using default font since we don't have a specific TTF loaded
    # A bit hard to center perfectly with default font, but we'll try
    draw.text((size//2 - 20, size//2 - 10), text, fill="white", align="center")
    
    img.save(filename)

def create_frame(filename, color):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    size = 200
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw an empty circle with a thick border
    draw.ellipse((5, 5, size-5, size-5), outline=color, width=10)
    
    img.save(filename)

avatars = [
    ("cyber-hacker.png", (0, 0, 0, 255), (0, 255, 255, 255), "CYB"),
    ("gold-knight.png", (218, 165, 32, 255), (255, 215, 0, 255), "KNT"),
    ("neon-ninja.png", (20, 20, 20, 255), (255, 20, 147, 255), "NIN"),
    ("wizard.png", (75, 0, 130, 255), (138, 43, 226, 255), "WIZ"),
    ("ai-bot.png", (0, 128, 128, 255), (0, 255, 255, 255), "AI")
]

frames = [
    ("neon-border.png", (255, 20, 147, 255)),
    ("gold-border.png", (255, 215, 0, 255)),
    ("cyber-border.png", (0, 255, 255, 255)),
    ("fire-border.png", (255, 69, 0, 255)),
    ("ice-border.png", (135, 206, 250, 255))
]

base_dir = r"d:\FPT\og\VisualizationDSA\frontend\public\assets"

for name, c1, c2, txt in avatars:
    create_avatar(os.path.join(base_dir, "avatars", name), c1, c2, txt)

for name, color in frames:
    create_frame(os.path.join(base_dir, "frames", name), color)

print("Images generated successfully!")
