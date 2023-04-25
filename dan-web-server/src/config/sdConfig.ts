/* eslint-disable prettier/prettier */

export default {
  kValidSamplers: ['DPM++ SDE Karras', 'Euler a', 'Euler', 'DPM++ SDE', 'LMS', 'DDIM'],
  kValidUpscalers: ['Latent', 'ESRGAN 4x'],
  kValidInterrogateModels: ["clip", "deepdanbooru"],
  kValidControlNetModels: {
    "sd15_canny": "control_sd15_canny",
    "sd15_openpose": "control_sd15_openpose",
  },
  kValidControlNetPreprocess: [
    "canny",
    "openpose",
  ],
  kValidModels: {
    '627a6f5c8bf7669d4a224ac041d527debc65d2d435b16e54ead8ee2c901d1634': 'clarity',
    '6e430eb51421ce5bf18f04e2dbe90b2cad437311948be4ef8c33658a73c86b2a': 'anything-v4.5-pruned',
    'fc2511737a54c5e80b89ab03e0ab4b98d051ab187f92860f3cd664dc9d08b271': 'chilloutmix_NiPrunedFp32Fix',
    '9aba26abdfcd46073e0a1d42027a3a3bcc969f562d58a03637bf0a0ded6586c9': 'deliberate_v2',
    'c0d1994c73d784a17a5b335ae8bda02dcc8dd2fc5f5dbf55169d5aab385e53f2': 'realisticVisionV20_v20',
    '5493a0ec491f5961dbdc1c861404088a6ae9bd4007f6a3a7c5dee8789cdc1361': 'abyssorangemix3AOM3_aom3a1b',
    'a60cfaa90decb28a1447f955e29220eb867e8e157f0ca8a4d3b839cd9cd4832a': 'dreamshaper_5Bakedvae',
    'e6de149b14b60cc91f32ac784ff40cf640a55d337403f5e13b9c32484e9030ac': 'dalcefo_v5',
    '66189c46ac52062f0a7dd3ed7a7d0849912f35791ad3d5c732df654e1c596e87': 'dalcefo_painting_v5',
    'fbc82b317dd938c58360768fb2572dc73c6843a4a01f58f60530531f29bf4751': 'MareAcernis',
    '7f96a1a9ca9b3a3242a9ae95d19284f0d2da8d5282b42d2d974398bf7663a252': 'AnythingV5_v5PrtRE',
  },
  kValidLoras: {
    '62efe75048d55a096a238c6e8c4e12d61b36bf59e388a90589335f750923954c': 'koreanDollLikeness_v10',
    'f1efd7b748634120b70343bc3c3b425c06c51548431a1264a2fcb5368352349f': 'stLouisLuxuriousWheels_v1',
    '5bbaabc04553d5821a3a45e4de5a02b2e66ecb00da677dd8ae862efd8ba59050': 'taiwanDollLikeness_v10',
    '3e5d8fe726b4c0f1e7f0905f32ea3d1c9ce89a54028209e8179d64d323048dac': 'kobeni_v10',
    '759d6fdf539f44f6991efd27ef1767c7779ac8884defc71dd909e5808b5ea74b': 'thickerLinesAnimeStyle_loraVersion',
    '3fd52c707c31b9af2207f697d9dd26b400683d011914471814bb33645f518f07': 'Moxin_10',
    '336ca6afbcd712b14fdfc7c3f9db044ab6020bdcbec5ed66c926caf639fd2691': 'yaeMikoRealistic_yaemikoMixed',
    '55aef962864e844cf426c518c2a13a38073b8c078c3cd1d600dc6debb4c4fa32': 'hanfu_v30Song',
    '7dc213110f3d9f2074d7773d3fb3082f571d33132ad8f3b16e70a4e4b4ec984b': 'chilloutmixss_xss10',
    'ef403e13f794421c26e7575636696fd6453de691cf8e10b4027c9a68a0c28ab8': 'makimaChainsawMan_offset',
    '9f3b38bf660e91b464c5a25d790f53eb876ac8cf17b479974d426b9732acac56': 'cuteGirlMix4_v10',
    '0b86fe247c1a02d781e236abd356b2b7180f4250f1f7c2633ede7bac2cd40272': 'arknightsTexasThe_v10',
    'eebdb8e46fafdaf3fca98d0b3adb0cbb16f71e138b65ddf8e43288d0b4a511eb': 'gachaSplashLORA_v40',
    'b688e3dd62f1e12261887fd70a89e262c0e54ff509c6b22189bdbbe20d2677c7': 'raidenShogunRealistic_raidenshogunHandsfix',
    '4495d15f676b707dd27d8de28ea4d00ae65d075618d23194fbb5459afdf4fb9b': 'elysia5in1Lora_v20',
  },
  kValidStandaloneUpscalers: {
    "Lanczos": "Lanczos",
    "Nearest": "Nearest",
    "ESRGAN 4x": "ESRGAN_4x",
    // "LDSR": "LDSR", // Disabled since it's very expensive and it produces poor outputs.
    "R-ESRGAN 4x+": "R-ESRGAN 4x+",
    "R-ESRGAN 4x+ Anime6B": "R-ESRGAN 4x+ Anime6B",
    "SwinIR 4x": "SwinIR_4x",
  }
};
