## Conventions

The base URL to send all API requests is
```
https://api.opendan.ai
```

HTTPS is required for all API requests.

The DAN API follows RESTful conventions when possible, with most operations performed via GET, POST, PATCH, and DELETE requests on page and database resources. Request and response bodies are encoded as JSON.

At present, only HTTP requests are supported to complete image generation tasks.

The APIs has similar respones.

On success, dan server will response http `status code` 200 and an object in JSON as below:

```JSON
{
    "code": 200,
    "data": `The returned object`,
    "message": "success"
}
```

On failure, dan server will response a non-ok http `status code` (i.e. not 200, may be 401 for an example) and an object JSON as below:

```JSON
{
    "code": `Error code`,
    "message": `A string describe the error`
}
```

## Supported list values
Under rapid expansion, please stay tuned.

### Models
| Name                 | Value                                                            | Ref                                                                | Download                                                                                                         |
| -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| chillout_mix         | 3a17d0deffa4592fd91c711a798031a258ab44041809ade8b4591c0225ea9401 | [link to civitai](https://civitai.com/models/6424/chilloutmix)     | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/chilloutmix_NiPrunedFp32Fix.safetensors) |
| clarity              | 627a6f5c8bf7669d4a224ac041d527debc65d2d435b16e54ead8ee2c901d1634 | [link to civitai](https://civitai.com/models/5062/clarity)         | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/clarity.safetensors)                     |
| anything-v4.5-pruned | 6e430eb51421ce5bf18f04e2dbe90b2cad437311948be4ef8c33658a73c86b2a | [link to huggingface](https://huggingface.co/andite/anything-v4.0) | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/anything-v4.5-pruned.safetensors)        |



### LoRas

| Name                               | Value                                                            | Ref                                                                                    | Download                                                                                                                |
| ---------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| koreanDollLikeness_v10             | 62efe75048d55a096a238c6e8c4e12d61b36bf59e388a90589335f750923954c | [link to civitai](https://civitai.com/models/19356/koreandolllikenessv10)              | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/koreandolllikeness_V10.safetensors)             |
| stLouisLuxuriousWheels_v1          | f1efd7b748634120b70343bc3c3b425c06c51548431a1264a2fcb5368352349f | [link to civitai](https://civitai.com/models/6669/st-louis-luxurious-wheels-azur-lane) | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/stLouisLuxuriousWheels_v1.safetensors)          |
| taiwanDollLikeness_v10             | 5bbaabc04553d5821a3a45e4de5a02b2e66ecb00da677dd8ae862efd8ba59050 | [link to civitai](https://civitai.com/models/17497/taiwan-doll-likeness)               | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/taiwanDollLikeness_v10.safetensors)             |
| kobeni_v10                         | 3e5d8fe726b4c0f1e7f0905f32ea3d1c9ce89a54028209e8179d64d323048dac | [link to civitai](https://civitai.com/models/6679/kobeni)                              | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/kobeni_v10.safetensors)                         |
| thickerLinesAnimeStyle_loraVersion | 759d6fdf539f44f6991efd27ef1767c7779ac8884defc71dd909e5808b5ea74b | [link to civitai](https://civitai.com/models/13910/thicker-lines-anime-style-lora-mix) | [download](https://huggingface.co/fiatrete/dan-used-models/resolve/main/thickerLinesAnimeStyle_loraVersion.safetensors) |



### Samplers
- DPM++ SDE Karras
- Euler a
- Euler
- DPM++ SDE
- LMS
- DDIM