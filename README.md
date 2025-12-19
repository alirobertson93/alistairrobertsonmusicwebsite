# Alistair Robertson | Composer

A modern, professional single-page website for composer Alistair Robertson.

![Website Preview](images/preview.png)

## Features

- **Hero Section** - Full-screen cinematic hero with animated title and call-to-action
- **About Section** - Professional biography with portrait image
- **Music Player** - Custom audio player with track listing (placeholder - ready for audio integration)
- **Watch Section** - Embedded YouTube video grid
- **Scores Section** - Downloadable PDF score gallery with hover effects
- **Contact Section** - Simple contact information with social links
- **Sticky Navigation** - Bottom navigation bar for smooth section scrolling
- **Credits Modal** - Clean overlay window for full credits

## Technical Features

- Fully responsive design (mobile, tablet, desktop)
- Smooth scroll animations
- CSS custom properties for easy theming
- Intersection Observer for scroll effects
- Accessibility features (reduced motion support, keyboard navigation)
- Clean, semantic HTML5 structure
- Modern CSS with Flexbox and Grid
- Vanilla JavaScript (no dependencies)

## File Structure

```
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Main stylesheet
├── js/
│   └── main.js         # JavaScript functionality
├── images/             # Image assets (add your images here)
│   └── .gitkeep
├── scores/             # PDF score files (add your PDFs here)
│   └── .gitkeep
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/alirobertson93/alistairrobertsonmusicwebsite.git
cd alistairrobertsonmusicwebsite
```

### 2. Add Your Media

#### Images
Add the following images to the `images/` folder:
- `hero-bg.jpg` - Background image for hero section (recommended: 1920x1080 or larger)
- `placeholder-portrait.jpg` - Your portrait photo for the About section
- `placeholder-score.jpg` - Thumbnail images for score previews
- `scores-bg.jpg` - Optional background for scores section

#### Scores
Add your PDF score files to the `scores/` folder, then update the `href` attributes in `index.html`.

#### Audio (Optional)
To add real audio playback:
1. Add your audio files to an `audio/` folder
2. Update `js/main.js` to integrate with the HTML5 Audio API

### 3. Customize Content

Edit `index.html` to update:
- Hero title and subtitle
- About section biography text
- Track listings in the music player
- YouTube video embed URLs
- Score titles and PDF links
- Contact information
- Social media links
- Credits content

### 4. Deploy

#### GitHub Pages
1. Go to repository Settings > Pages
2. Select "main" branch as source
3. Your site will be live at `https://alirobertson93.github.io/alistairrobertsonmusicwebsite/`

#### Other Hosting
Simply upload all files to your web server or hosting provider.

## Customization

### Colors
Edit CSS custom properties in `css/styles.css`:

```css
:root {
    --color-bg-primary: #0a0a0a;
    --color-bg-secondary: #111111;
    --color-text-primary: #ffffff;
    --color-text-secondary: #b3b3b3;
    /* ... */
}
```

### Fonts
The site uses Google Fonts:
- **Cormorant Garamond** - Headings and display text
- **Inter** - Body text

To change fonts, update the Google Fonts link in `index.html` and the font variables in `css/styles.css`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome for Android)

## License

© 2025 Alistair Robertson. All rights reserved.

## Credits

Website designed and developed for Alistair Robertson.