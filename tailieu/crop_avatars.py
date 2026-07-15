from PIL import Image
import os

img_path = r"d:\FPT\Hihi\tailieu\images\team_members.png"
out_dir = r"d:\FPT\Hihi\tailieu\images"

if os.path.exists(img_path):
    img = Image.open(img_path)
    w, h = img.size
    
    # Chia lưới 2x2
    half_w = w // 2
    half_h = h // 2
    
    # Crop từng phần
    avatar_bao = img.crop((0, 0, half_w, half_h))
    avatar_son = img.crop((half_w, 0, w, half_h))
    avatar_thu = img.crop((0, half_h, half_w, h))
    avatar_phuc = img.crop((half_w, half_h, w, h))
    
    # Lưu file
    avatar_bao.save(os.path.join(out_dir, "avatar_bao.png"))
    avatar_son.save(os.path.join(out_dir, "avatar_son.png"))
    avatar_thu.save(os.path.join(out_dir, "avatar_thu.png"))
    avatar_phuc.save(os.path.join(out_dir, "avatar_phuc.png"))
    
    print("✅ Đã crop thành công 4 avatar thành viên mới!")
else:
    print("❌ team_members.png not found!")
