
import os
from PIL import Image
from math import ceil

def get_image_size(filename):
    with Image.open(filename) as img:
        width, height = img.size
        print("img size：%d x %d px" % (width, height))
    return width, height

def resize(width, height):
    ratio = min(1024 / width, 1024 / height)
    w, h = (ceil(width * ratio), ceil(height * ratio))
    print("resize to：%d x %d px" % (w, h))
    return w, h

def generate_output_filename(input_filename, tag):
    dir_name, base_name = os.path.split(os.path.splitext(input_filename)[0])
    ext = os.path.splitext(input_filename)[1]

    id_int = 1
    new_base_name = f"{base_name}-{tag}-{id_int}"
    new_file_path = os.path.join(dir_name, new_base_name + ext)
    
    while os.path.exists(new_file_path):
        id_int += 1
        new_base_name = f"{base_name}-{tag}-{id_int}"
        new_file_path = os.path.join(dir_name, new_base_name + ext)
    
    return new_file_path