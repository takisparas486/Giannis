from pathlib import Path

folder = Path(__file__).resolve().parent / "images" / "brands"

# Current filename -> desired filename
# This keeps the asset names consistent with the canonical brand names used in the game.
renames = {
    "adidas.jpg": "adidas.jpg",
    "amazon.jpg": "amazon.jpg",
    "amd.jpg": "amd.jpg",
    "anta.jpg": "anta.jpg",
    "apple.jpg": "apple.jpg",
    "armani.jpg": "armani.jpg",
    "asics.jpg": "asics.jpg",
    "balenciaga.jpg": "balenciaga.jpg",
    "blizzard.jpg": "blizzard.jpg",
    "burberry.jpg": "burberry.jpg",
    "burger-king.jpg": "burger-king.jpg",
    "calvin-klein.jpg": "calvin-klein.jpg",
    "cartier.jpg": "cartier.jpg",
    "chanel.jpg": "chanel.jpg",
    "coca-cola.jpg": "coca-cola.jpg",
    "converse.jpg": "converse.jpg",
    "dior.jpg": "dior.jpg",
    "disney-plus.jpg": "disney-plus.jpg",
    "dolce-gabbana.jpg": "dolce-gabbana.jpg",
    "dominos.jpg": "dominos.jpg",
    "ea-sports.jpg": "ea-sports.jpg",
    "epic-games.jpg": "epic-games.jpg",
    "fear-of-god.jpg": "fear-of-god.jpg",
    "fendi.jpg": "fendi.jpg",
    "givenchy.jpg": "givenchy.jpg",
    "google.jpg": "google.jpg",
    "gucci.jpg": "gucci.jpg",
    "hermes.jpg": "hermes.jpg",
    "huawei.jpg": "huawei.jpg",
    "hugo-boss.jpg": "hugo-boss.jpg",
    "ikea.jpg": "ikea.jpg",
    "instagram.jpg": "instagram.jpg",
    "intel.jpg": "intel.jpg",
    "kfc.jpg": "kfc.jpg",
    "lacoste.jpg": "lacoste.jpg",
    "lego.jpg": "lego.jpg",
    "louis-vuitton.jpg": "louis-vuitton.jpg",
    "mcdonalds.jpg": "mcdonalds.jpg",
    "microsoft.jpg": "microsoft.jpg",
    "moncler.jpg": "moncler.jpg",
    "monster-energy.jpg": "monster-energy.jpg",
    "netflix.jpg": "netflix.jpg",
    "new-balance.jpg": "new-balance.jpg",
    "nike.jpg": "nike.jpg",
    "nintendo.jpg": "nintendo.jpg",
    "nvidia.jpg": "nvidia.jpg",
    "off-white.jpg": "off-white.jpg",
    "omega.jpg": "omega.jpg",
    "oneplus.jpg": "oneplus.jpg",
    "palm-angels.jpg": "palm-angels.jpg",
    "pepsi.jpg": "pepsi.jpg",
    "pizza-hut.jpg": "pizza-hut.jpg",
    "playstation.jpg": "playstation.jpg",
    "prada.jpg": "prada.jpg",
    "puma.jpg": "puma.jpg",
    "ralph-lauren.jpg": "ralph-lauren.jpg",
    "red-bull.jpg": "red-bull.jpg",
    "reebok.jpg": "reebok.jpg",
    "riot-games.jpg": "riot-games.jpg",
    "rockstar-games.jpg": "rockstar-games.jpg",
    "rolex.jpg": "rolex.jpg",
    "samsung.jpg": "samsung.jpg",
    "spotify.jpg": "spotify.jpg",
    "starbucks.jpg": "starbucks.jpg",
    "steam.jpg": "steam.jpg",
    "stone-island.jpg": "stone-island.jpg",
    "supreme.jpg": "supreme.jpg",
    "tag-heuer.jpg": "tag-heuer.jpg",
    "tiffany-co.jpg": "tiffany-and-co.jpg",
    "tiktok.jpg": "tiktok.jpg",
    "tommy-hilfiger.jpg": "tommy-hilfiger.jpg",
    "twitch.jpg": "twitch.jpg",
    "ubisoft.jpg": "ubisoft.jpg",
    "under-armour.jpg": "under-armour.jpg",
    "valentino.jpg": "valentino.jpg",
    "vans.jpg": "vans.jpg",
    "versace.jpg": "versace.jpg",
    "xbox.jpg": "xbox.jpg",
    "xiaomi.jpg": "xiaomi.jpg",
    "youtube.jpg": "youtube.jpg",
}

if not folder.exists():
    raise SystemExit(f"Folder not found: {folder}")

renamed = 0
for current_name, desired_name in renames.items():
    current_path = folder / current_name
    desired_path = folder / desired_name
    if not current_path.exists():
        continue
    if current_path == desired_path:
        continue
    if desired_path.exists() and desired_path != current_path:
        print(f"Skipping: {current_name} -> {desired_name} (target already exists)")
        continue
    current_path.rename(desired_path)
    renamed += 1
    print(f"Renamed: {current_name} -> {desired_name}")

print(f"Finished. Renamed {renamed} files.")
