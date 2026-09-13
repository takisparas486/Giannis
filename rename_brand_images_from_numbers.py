from pathlib import Path
import sys

base = Path(__file__).resolve().parent
default_images_dir = base / "images" / "brands"

# Map each current raw filename to the canonical final filename.
# This version can target any folder, including the raw Downloads folder you gave.
renames = {
    "IMG_2848.PNG": "gucci.jpg",
    "IMG_2849.PNG": "louis-vuitton.jpg",
    "IMG_2851.JPG": "prada.jpg",
    "IMG_2852.WEBP": "chanel.jpg",
    "IMG_2853.jpg": "dior.jpg",
    "IMG_2854.jpg": "versace.jpg",
    "IMG_2855.PNG": "armani.jpg",
    "IMG_2856.PNG": "dolce-gabbana.jpg",
    "IMG_2857.JPG": "balenciaga.jpg",
    "IMG_2858.JPG": "burberry.jpg",
    "IMG_2859.PNG": "fendi.jpg",
    "IMG_2860.PNG": "givenchy.jpg",
    "IMG_2863.JPG": "valentino.jpg",
    "IMG_2865.JPG": "moncler.jpg",
    "IMG_2866.JPG": "stone-island.jpg",
    "IMG_2867.JPG": "off-white.jpg",
    "IMG_2869.jpg": "supreme.jpg",
    "IMG_2870.JPG": "palm-angels.jpg",
    "IMG_2871.WEBP": "fear-of-god.jpg",
    "IMG_2872.PNG": "tommy-hilfiger.jpg",
    "IMG_2873.JPG": "calvin-klein.jpg",
    "IMG_2874.PNG": "hugo-boss.jpg",
    "IMG_2875.JPG": "ralph-lauren.jpg",
    "IMG_2876.JPG": "lacoste.jpg",
    "IMG_2877.JPG": "cartier.jpg",
    "IMG_2878.JPG": "rolex.jpg",
    "IMG_2879.JPG": "tiffany-and-co.jpg",
    "IMG_2880.JPG": "hermes.jpg",
    "IMG_2882.PNG": "omega.jpg",
    "IMG_2883.PNG": "tag-heuer.jpg",
    "IMG_2884.jpg": "apple.jpg",
    "IMG_2885.PNG": "samsung.jpg",
    "IMG_2886.PNG": "google.jpg",
    "IMG_2887.PNG": "microsoft.jpg",
    "IMG_2888.PNG": "intel.jpg",
    "IMG_2889.PNG": "amd.jpg",
    "IMG_2890.PNG": "nvidia.jpg",
    "IMG_2891.PNG": "huawei.jpg",
    "IMG_2893.PNG": "xiaomi.jpg",
    "IMG_2894.jpg": "oneplus.jpg",
    "IMG_2896.JPG": "playstation.jpg",
    "IMG_2897.JPG": "xbox.jpg",
    "IMG_2898.PNG": "nintendo.jpg",
    "IMG_2899.PNG": "steam.jpg",
    "IMG_2900.JPG": "epic-games.jpg",
    "IMG_2901.PNG": "rockstar-games.jpg",
    "IMG_2902.PNG": "ubisoft.jpg",
    "IMG_2903.JPG": "ea-sports.jpg",
    "IMG_2904.heic": "riot-games.jpg",
    "IMG_2906.PNG": "blizzard.jpg",
    "IMG_2907.PNG": "netflix.jpg",
    "IMG_2908.PNG": "disney-plus.jpg",
    "IMG_2909.JPG": "youtube.jpg",
    "IMG_2910.PNG": "instagram.jpg",
    "IMG_2912.PNG": "tiktok.jpg",
    "IMG_2913.PNG": "spotify.jpg",
    "IMG_2914.jpg": "twitch.jpg",
    "IMG_2918.JPG": "amazon.jpg",
    "IMG_2919.PNG": "ikea.jpg",
    "IMG_2920.PNG": "lego.jpg",
    "IMG_2921.jpg": "coca-cola.jpg",
    "IMG_2923.PNG": "pepsi.jpg",
}


def resolve_images_dir():
    if len(sys.argv) > 1:
        images_dir = Path(sys.argv[1]).expanduser()
        if not images_dir.exists():
            raise SystemExit(f"Images folder not found: {images_dir}")
        return images_dir
    return default_images_dir


images_dir = resolve_images_dir()
print(f"Using source folder: {images_dir}")

renamed = 0
for current_name, target_name in renames.items():
    src = images_dir / current_name
    if not src.exists():
        src = next((p for p in images_dir.iterdir() if p.name.casefold() == current_name.casefold()), None)
        if src is None:
            continue

    dst = images_dir / target_name
    if src.resolve() == dst.resolve():
        continue
    if dst.exists():
        print(f"Skipping existing target: {target_name}")
        continue

    src.rename(dst)
    renamed += 1
    print(f"Renamed: {src.name} -> {target_name}")

print(f"Done. Renamed {renamed} image files.")
