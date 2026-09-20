const fs = require('fs');
const path = require('path');

// 1. Ορισμός Διαδρομών
const CATEGORIES_PATH = path.join(__dirname, 'categories.js');
const IMAGES_DIR = 'C:\\Users\\User\\giannaros_files';

// 2. Ασφαλής Φόρτωση του categories.js
let categories = {};

try {
    let fileContent = fs.readFileSync(CATEGORIES_PATH, 'utf8');

    fileContent = fileContent
        .replace(/export\s+default\s+/g, '')
        .replace(/export\s+const\s+/g, 'const ')
        .replace(/export\s+let\s+/g, 'let ')
        .replace(/export\s+var\s+/g, 'var ')
        .replace(/window\./g, 'global.');

    const dummyWindow = {};
    const dummyModule = { exports: {} };

    const sandboxFn = new Function('window', 'exports', 'module', `
        ${fileContent};
        if (typeof categories !== 'undefined') return categories;
        if (typeof window.categories !== 'undefined') return window.categories;
        return module.exports || {};
    `);
    
    categories = sandboxFn(dummyWindow, dummyModule.exports, dummyModule);

    if (categories.default) categories = categories.default;

} catch (err) {
    console.error("❌ Σφάλμα κατά τη φόρτωση του categories.js:", err.message);
    process.exit(1);
}

// Helpers
function normalizePath(str) {
    return str.replace(/\\/g, '/').toLowerCase().trim();
}

function extractRelativeImagePath(urlStr) {
    if (!urlStr) return '';
    let cleanStr = urlStr;
    try {
        const parsedUrl = new URL(urlStr);
        cleanStr = parsedUrl.pathname;
    } catch (e) {}
    
    const parts = cleanStr.split(/[/\\]/).filter(Boolean);
    if (parts.length >= 2) {
        return normalizePath(`${parts[parts.length - 2]}/${parts[parts.length - 1]}`);
    }
    return normalizePath(parts[parts.length - 1] || '');
}

function getAllFilesInDir(dirPath, arrayOfFiles = [], relativePath = '') {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        if (file.startsWith('.')) return;
        const fullPath = path.join(dirPath, file);
        const relPath = relativePath ? `${relativePath}/${file}` : file;

        if (fs.statSync(fullPath).isDirectory()) {
            getAllFilesInDir(fullPath, arrayOfFiles, relPath);
        } else {
            arrayOfFiles.push(normalizePath(relPath));
        }
    });

    return arrayOfFiles;
}

// 3. Συλλογή και Έλεγχος Εικόνων
const referencedImages = new Set();
const missingImagesList = [];
const corruptedImagesList = [];

let totalMissing = 0;
let totalCorrupted = 0;
let totalValid = 0;

console.log("🔍 Εκκίνηση ελέγχου εικόνων...\n");

Object.keys(categories).forEach(categoryKey => {
    const imagesList = categories[categoryKey];
    if (!Array.isArray(imagesList)) return;

    imagesList.forEach((item, index) => {
        const imagePathStr = typeof item === 'string' ? item : (item.image || item.src || item.url || '');
        if (!imagePathStr) return;

        const relImgPath = extractRelativeImagePath(imagePathStr);
        const fileNameOnly = path.basename(relImgPath);

        // Αγνοούμε αρχεία που ξεκινάνε από img_ ή IMG_
        if (fileNameOnly.startsWith('img_')) return;

        referencedImages.add(relImgPath);
        const fullPath = path.join(IMAGES_DIR, relImgPath);

        // Α. Έλεγχος αν υπάρχει το αρχείο
        if (!fs.existsSync(fullPath)) {
            missingImagesList.push({
                category: categoryKey,
                index: index,
                path: relImgPath
            });
            totalMissing++;
            return;
        }

        // Β. Έλεγχος αν το αρχείο είναι 0 bytes (corrupted)
        try {
            const stats = fs.statSync(fullPath);
            if (stats.size === 0) {
                corruptedImagesList.push({
                    category: categoryKey,
                    index: index,
                    path: relImgPath,
                    reason: '0 bytes (κενό αρχείο)'
                });
                totalCorrupted++;
            } else {
                totalValid++;
            }
        } catch (error) {
            corruptedImagesList.push({
                category: categoryKey,
                index: index,
                path: relImgPath,
                reason: error.message
            });
            totalCorrupted++;
        }
    });
});

// 4. Έλεγχος για ορφανές εικόνες (εξαιρούνται τα img_)
let orphanImagesCount = 0;
const orphanImagesList = [];

try {
    const allFilesOnDisk = getAllFilesInDir(IMAGES_DIR);
    
    allFilesOnDisk.forEach(fileRelPath => {
        const fileNameOnly = path.basename(fileRelPath);
        
        if (fileNameOnly.startsWith('img_')) return;

        if (!referencedImages.has(fileRelPath)) {
            orphanImagesList.push(fileRelPath);
            orphanImagesCount++;
        }
    });
} catch (err) {
    console.error("❌ Σφάλμα κατά την ανάγνωση του φακέλου εικόνων:", err.message);
}

// 5. Εκτύπωση Ορφανών
if (orphanImagesList.length > 0) {
    console.log(`❓ ΟΡΦΑΝΕΣ ΕΙΚΟΝΕΣ (Χωρίς img_ - Σύνολο: ${orphanImagesList.length}):`);
    orphanImagesList.forEach(file => console.log(`  - ${file}`));
    console.log("");
}

// 6. Τελική Σύνοψη με Αναλυτική Αναφορά Δίπλα
console.log("==================================================");
console.log("📊 ΤΕΛΙΚΗ ΣΥΝΟΨΗ:");
console.log(`✅ Έγκυρες Εικόνες: ${totalValid}`);

// Εικόνες που λείπουν
if (totalMissing > 0) {
    console.log(`❌ Εικόνες που λείπουν (${totalMissing}):`);
    missingImagesList.forEach(item => {
        console.log(`    ↳ [${item.category}] Index: ${item.index} -> "${item.path}"`);
    });
} else {
    console.log(`❌ Εικόνες που λείπουν: 0`);
}

// Corrupted / Empty Εικόνες
if (totalCorrupted > 0) {
    console.log(`⚠️ Corrupted/Empty Εικόνες (${totalCorrupted}):`);
    corruptedImagesList.forEach(item => {
        console.log(`    ↳ [${item.category}] Index: ${item.index} -> "${item.path}" (${item.reason})`);
    });
} else {
    console.log(`⚠️ Corrupted/Empty Εικόνες: 0`);
}

console.log(`❓ Ορφανές Εικόνες (χωρίς img_): ${orphanImagesCount}`);
console.log("==================================================");