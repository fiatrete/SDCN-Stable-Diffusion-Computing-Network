from PIL import Image
import sys

def get_image_info(file_path):
    with Image.open(file_path) as img:
        return img.info

init_img_filename = sys.argv[1]

print(get_image_info(init_img_filename))