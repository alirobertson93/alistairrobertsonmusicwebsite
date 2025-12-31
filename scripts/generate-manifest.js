#!/usr/bin/env node

/**
 * Manifest Generator Script
 * 
 * Extracts metadata and artwork from audio files and generates:
 * - audio/tracks.json - Metadata manifest
 * - artwork/*.webp - Extracted album artwork
 * 
 * Usage: node scripts/generate-manifest.js
 */

const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
const sharp = require('sharp');

const AUDIO_DIR = path.join(__dirname, '../audio');
const ARTWORK_DIR = path.join(__dirname, '../artwork');
const MANIFEST_PATH = path.join(AUDIO_DIR, 'tracks.json');

// Ensure artwork directory exists
if (!fs.existsSync(ARTWORK_DIR)) {
    fs.mkdirSync(ARTWORK_DIR, { recursive: true });
}

/**
 * Generate a safe filename from track title
 */
function sanitizeFilename(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Extract track number from filename (e.g., "01 Breath [Extract].mp3" -> 1)
 */
function getTrackNumber(filename) {
    const match = filename.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
}

/**
 * Clean title by removing track number and file extension artifacts
 */
function cleanTitle(title, filename) {
    if (!title || title === filename) {
        // Fallback: extract from filename
        return filename
            .replace(/^\d+\s*/, '')           // Remove leading number
            .replace(/\.[^.]+$/, '')          // Remove extension
            .replace(/\s*\[.*?\]\s*/g, ' ')   // Remove brackets content
            .trim();
    }
    return title;
}

/**
 * Process a single audio file
 */
async function processTrack(filename) {
    const filePath = path.join(AUDIO_DIR, filename);
    
    try {
        const metadata = await mm.parseFile(filePath);
        const { common, format } = metadata;
        
        const title = cleanTitle(common.title, filename);
        const safeName = sanitizeFilename(title);
        let artworkPath = null;
        
        // Extract and save artwork if present
        if (common.picture && common.picture.length > 0) {
            const picture = common.picture[0];
            const artworkFilename = `${safeName}.webp`;
            const artworkFullPath = path.join(ARTWORK_DIR, artworkFilename);
            
            try {
                // Convert to WebP with optimization
                await sharp(picture.data)
                    .resize(500, 500, { 
                        fit: 'cover',
                        withoutEnlargement: true 
                    })
                    .webp({ quality: 80 })
                    .toFile(artworkFullPath);
                
                artworkPath = `artwork/${artworkFilename}`;
                console.log(`  ✓ Extracted artwork: ${artworkFilename}`);
            } catch (imgErr) {
                console.warn(`  ⚠ Failed to process artwork for ${filename}:`, imgErr.message);
            }
        } else {
            console.log(`  ⚠ No embedded artwork in ${filename}`);
        }
        
        return {
            src: `audio/${filename}`,
            title: title,
            album: common.album || '',
            artist: common.artist || '',
            duration: Math.floor(format.duration || 0),
            artwork: artworkPath
        };
        
    } catch (err) {
        console.error(`  ✗ Failed to process ${filename}:`, err.message);
        return null;
    }
}

/**
 * Main function
 */
async function generateManifest() {
    console.log('🎵 Generating track manifest...\n');
    
    // Get all audio files (MP3 only - WAV should be converted first)
    const files = fs.readdirSync(AUDIO_DIR)
        .filter(f => f.endsWith('.mp3'))
        .sort((a, b) => getTrackNumber(a) - getTrackNumber(b));
    
    console.log(`Found ${files.length} MP3 files\n`);
    
    const tracks = [];
    
    for (const file of files) {
        console.log(`Processing: ${file}`);
        const track = await processTrack(file);
        if (track) {
            tracks.push(track);
        }
    }
    
    // Write manifest
    const manifest = {
        generated: new Date().toISOString(),
        trackCount: tracks.length,
        tracks: tracks
    };
    
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    
    console.log(`\n✅ Generated manifest with ${tracks.length} tracks`);
    console.log(`   📄 ${MANIFEST_PATH}`);
    console.log(`   🎨 ${tracks.filter(t => t.artwork).length} artwork images extracted`);
    
    // Warn about tracks without artwork
    const noArtwork = tracks.filter(t => !t.artwork);
    if (noArtwork.length > 0) {
        console.log(`\n⚠️  Tracks without artwork:`);
        noArtwork.forEach(t => console.log(`   - ${t.title}`));
    }
}

generateManifest().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
