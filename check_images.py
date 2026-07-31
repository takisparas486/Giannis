import os
import json

# Path to your images directory
IMAGES_DIR = r"C:\Users\User\Giannis-main\images"

def verify_images():
    if not os.path.exists(IMAGES_DIR):
        print(f"Error: Directory not found -> {IMAGES_DIR}")
        return

    # 1. Discover local folders (categories) present on disk
    disk_categories = [d for d in os.listdir(IMAGES_DIR) if os.path.isdir(os.path.join(IMAGES_DIR, d))]
    print(f"Found {len(disk_categories)} category folders on disk:\n{disk_categories}\n")

    total_disk_images = 0
    category_counts = {}

    # 2. Count images actually present inside each folder on disk
    for cat in disk_categories:
        cat_path = os.path.join(IMAGES_DIR, cat)
        # Supported extensions check
        images = [f for f in os.listdir(cat_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
        category_counts[cat] = len(images)
        total_disk_images += len(images)

    print("--- Disk Image Summary per Category ---")
    for cat, count in category_counts.items():
        print(f"  - {cat}: {count} images found")
    print(f"\nTotal physical images found on disk: {total_disk_images}\n")

    # 3. Cross-reference with paths defined in your dataset mapping
    expected_paths = [
        "images/elements/hydrogen.png", "images/elements/helium.png", "images/elements/lithium.png",
        "images/elements/beryllium.png", "images/elements/boron.png", "images/elements/carbon.png",
        "images/elements/nitrogen.png", "images/elements/oxygen.png", "images/elements/fluorine.png",
        "images/elements/neon.png", "images/elements/sodium.png", "images/elements/magnesium.png",
        "images/elements/aluminium.png", "images/elements/silicon.png", "images/elements/phosphorus.png",
        "images/elements/sulfur.png", "images/elements/chlorine.png", "images/elements/argon.png",
        "images/elements/potassium.png", "images/elements/calcium.png", "images/elements/scandium.png",
        "images/elements/titanium.png", "images/elements/vanadium.png", "images/elements/chromium.png",
        "images/elements/manganese.png", "images/elements/iron.png", "images/elements/cobalt.png",
        "images/elements/nickel.png", "images/elements/copper.png", "images/elements/zinc.png",
        "images/elements/gallium.png", "images/elements/germanium.png", "images/elements/arsenic.png",
        "images/elements/selenium.png", "images/elements/bromine.png", "images/elements/krypton.png",
        "images/elements/rubidium.png", "images/elements/strontium.png", "images/elements/yttrium.png",
        "images/elements/zirconium.png", "images/elements/niobium.png", "images/elements/molybdenum.png",
        "images/elements/technetium.png", "images/elements/ruthenium.png", "images/elements/rhodium.png",
        "images/elements/palladium.png", "images/elements/silver.png", "images/elements/cadmium.png",
        "images/elements/indium.png", "images/elements/tin.png", "images/elements/antimony.png",
        "images/elements/tellurium.png", "images/elements/iodine.png", "images/elements/xenon.png",
        "images/elements/caesium.png", "images/elements/barium.png", "images/elements/lanthanum.png",
        "images/elements/cerium.png", "images/elements/praseodymium.png", "images/elements/neodymium.png",
        "images/elements/promethium.png", "images/elements/samarium.png", "images/elements/europium.png",
        "images/elements/gadolinium.png", "images/elements/terbium.png", "images/elements/dysprosium.png",
        "images/elements/holmium.png", "images/elements/erbium.png", "images/elements/thulium.png",
        "images/elements/ytterbium.png", "images/elements/lutetium.png", "images/elements/hafnium.png",
        "images/elements/tantalum.png", "images/elements/tungsten.png", "images/elements/rhenium.png",
        "images/elements/osmium.png", "images/elements/iridium.png", "images/elements/platinum.png",
        "images/elements/gold.png", "images/elements/mercury.png", "images/elements/thallium.png",
        "images/elements/lead.png", "images/elements/bismuth.png", "images/elements/polonium.png",
        "images/elements/astatine.png", "images/elements/radon.png", "images/elements/francium.png",
        "images/elements/radium.png", "images/elements/actinium.png", "images/elements/thorium.png",
        "images/elements/protactinium.png", "images/elements/uranium.png", "images/elements/neptunium.png",
        "images/elements/plutonium.png", "images/elements/americium.png", "images/elements/curium.png",
        "images/elements/berkelium.png", "images/elements/californium.png", "images/elements/einsteinium.png",
        "images/elements/fermium.png", "images/elements/mendelevium.png", "images/elements/nobelium.png",
        "images/elements/lawrencium.png", "images/elements/rutherfordium.png", "images/elements/dubnium.png",
        "images/elements/seaborgium.png", "images/elements/bohrium.png", "images/elements/hassium.png",
        "images/elements/meitnerium.png", "images/elements/darmstadtium.png", "images/elements/roentgenium.png",
        "images/elements/copernicium.png", "images/elements/nihonium.png", "images/elements/flerovium.png",
        "images/elements/moscovium.png", "images/elements/livermorium.png", "images/elements/tennessine.png",
        "images/elements/oganesson.png"
    ]

    matched = 0
    missing = 0
    
    base_root = os.path.dirname(IMAGES_DIR)
    for path in expected_paths:
        full_path = os.path.join(base_root, path)
        if os.path.exists(full_path):
            matched += 1
        else:
            missing += 1

    ktionen_summary = f"""
--- Cross-Reference Validation Result ---
* **Total Checked Paths from List**: {len(expected_paths)}
* **Matching Images Found on Disk**: {matched}
* **Missing Images**: {missing}
"""
    print(ktionen_summary)

if __name__ == "__main__":
    verify_images()