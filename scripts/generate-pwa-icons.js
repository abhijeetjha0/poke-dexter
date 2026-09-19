const path = require('path');
const sharp = require('sharp');

async function generateIcons() {
    const inputSvg = path.join(__dirname, '..', 'app', 'icon.svg');
    const outputDir = path.join(__dirname, '..', 'public', 'icons');

    // 1. Standard icons (transparent background, edge-to-edge)
    await sharp(inputSvg)
        .resize(192, 192)
        .png()
        .toFile(path.join(outputDir, 'icon-192.png'));

    await sharp(inputSvg)
        .resize(512, 512)
        .png()
        .toFile(path.join(outputDir, 'icon-512.png'));

    // 2. Maskable icons (padded with theme background to satisfy safe-zone requirements)
    const ball512 = await sharp(inputSvg).resize(384, 384).png().toBuffer();
    await sharp({
        create: {
            width: 512,
            height: 512,
            channels: 4,
            background: '#0a0a1a',
        },
    })
        .composite([{ input: ball512, gravity: 'center' }])
        .png()
        .toFile(path.join(outputDir, 'icon-maskable-512.png'));

    const ball192 = await sharp(inputSvg).resize(144, 144).png().toBuffer();
    await sharp({
        create: {
            width: 192,
            height: 192,
            channels: 4,
            background: '#0a0a1a',
        },
    })
        .composite([{ input: ball192, gravity: 'center' }])
        .png()
        .toFile(path.join(outputDir, 'icon-maskable-192.png'));

    console.log('Successfully generated PWA icons with sharp.');
}

generateIcons().catch((err) => {
    console.error('Failed to generate PWA icons:', err);
    process.exit(1);
});
