# How to use ?
## install the dependencies.
```bash
pip3 install -r requirements.txt
```
## txt2img
txt2img is used for generating images from text, such as generating images of scenes or objects based on text, or transforming natural language descriptions into visual conceptual representations.

```bash
python3 dan_run.py txt2img params-txt2img.json OUTPUT_IMAGE.png
# or
python3 txt2img.py
```

## img2img
img2img takes an input image and generates an output image with desired modifications or transformations. It is often used for tasks such as image-to-image translation, style transfer, and image colorization.

```bash
python3 dan_run.py img2img params-img2img.json ORIGINAL_IMAGE.png OUTPUT_IMAGE.png
# or 
python3 img2img.py ORIGINAL_IMAGE.png
```