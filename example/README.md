# How to use ?
## install the dependencies.
```bash
pip3 install -r requirements.txt
```
## txt2img
txt2img is a model used for generating images from text. It employs the framework of generative adversarial networks (GANs) to generate corresponding images based on input text descriptions. This model can be used for various tasks, such as generating images of scenes or objects based on text, or transforming natural language descriptions into visual conceptual representations.

```bash
python3 sdcn_run.py txt2img params-txt2img.json OUTPUT_IMAGE.png
# or
python3 txt2img.py
```

## img2img
img2img refers to a type of machine learning model that takes an input image and generates an output image with desired modifications or transformations. This approach is often used for tasks such as image-to-image translation, style transfer, and image colorization. The model learns to map the input image to the desired output image by training on large datasets of paired examples, where each example consists of an input image and its corresponding desired output image.

```bash
python3 sdcn_run.py img2img params-img2img.json ORIGINAL_IMAGE.png OUTPUT_IMAGE.png
# or 
python3 img2img.py ORIGINAL_IMAGE.png
```







