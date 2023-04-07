/* eslint-disable prettier/prettier */

export default {
  kValidSamplers: ['DPM++ SDE Karras', 'Euler a', 'Euler', 'DPM++ SDE', 'LMS', 'DDIM'],
  kValidUpscalers: ['Latent', 'ESRGAN 4x'],
  kValidInterrogateModel: [ "clip", "deepdanbooru" ],
  kValidModels: {
    '3a17d0deffa4592fd91c711a798031a258ab44041809ade8b4591c0225ea9401': 'chillout_mix',
    '627a6f5c8bf7669d4a224ac041d527debc65d2d435b16e54ead8ee2c901d1634': 'clarity',
    '6e430eb51421ce5bf18f04e2dbe90b2cad437311948be4ef8c33658a73c86b2a': 'anything-v4.5-pruned',
  },
  kValidLoras: {
    '62efe75048d55a096a238c6e8c4e12d61b36bf59e388a90589335f750923954c': 'koreanDollLikeness_v10',
    'f1efd7b748634120b70343bc3c3b425c06c51548431a1264a2fcb5368352349f': 'stLouisLuxuriousWheels_v1',
    '5bbaabc04553d5821a3a45e4de5a02b2e66ecb00da677dd8ae862efd8ba59050': 'taiwanDollLikeness_v10',
    '3e5d8fe726b4c0f1e7f0905f32ea3d1c9ce89a54028209e8179d64d323048dac': 'kobeni_v10',
    '759d6fdf539f44f6991efd27ef1767c7779ac8884defc71dd909e5808b5ea74b': 'thickerLinesAnimeStyle_loraVersion',
  },
};
