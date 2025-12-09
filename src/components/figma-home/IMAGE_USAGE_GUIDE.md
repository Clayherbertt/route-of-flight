# Image Usage Guide for Figma Homepage Components

## Current Status
✅ **No images are currently used in any figma-home components**

All components use:
- Lucide React icons (vector icons, not images)
- CSS gradients (backgroundImage style properties)
- Background color divs

## When Adding Images in the Future

### 1. ES Module Imports (Required)
Always use ES module imports, never string paths:

```tsx
// ✅ CORRECT
import heroImage from '@/assets/figma-home/hero-image.jpg';
import logo from '@/assets/figma-home/logo.png';

// ❌ INCORRECT
<img src="/assets/hero.jpg" />
<img src="../assets/hero.jpg" />
```

### 2. Object Fit Classes (Required)
Always apply `object-cover` or `object-contain`:

```tsx
// For background/fill images
<img 
  src={heroImage} 
  alt="Hero image"
  className="w-full h-full object-cover"
/>

// For logos/icons that should maintain aspect ratio
<img 
  src={logo} 
  alt="Logo"
  className="w-auto h-full object-contain"
/>
```

### 3. Prevent Layout Shifting (Required)
Always set explicit dimensions or use aspect ratio:

```tsx
// Option 1: Explicit width/height
<img 
  src={image} 
  alt="Description"
  className="w-full h-64 object-cover"
  width={800}
  height={400}
/>

// Option 2: Aspect ratio container
<div className="aspect-video w-full">
  <img 
    src={image} 
    alt="Description"
    className="w-full h-full object-cover"
  />
</div>

// Option 3: Fixed dimensions with responsive
<img 
  src={image} 
  alt="Description"
  className="w-full sm:w-96 h-64 sm:h-80 object-cover"
  width={800}
  height={400}
/>
```

### 4. Prevent Blurry Scaled PNGs
- Use appropriate image sizes (2x for retina displays)
- Use WebP format when possible
- Set explicit dimensions
- Use `object-cover` or `object-contain` instead of scaling

```tsx
// ✅ Good: Explicit dimensions prevent blur
<img 
  src={image} 
  alt="Description"
  className="w-full h-64 object-cover"
  width={1200}
  height={600}
/>

// ❌ Bad: Browser scaling causes blur
<img 
  src={image} 
  alt="Description"
  className="w-full"
  style={{ height: '400px' }}
/>
```

## Example Implementation

```tsx
import { motion } from 'framer-motion';
import heroImage from '@/assets/figma-home/hero-background.jpg';
import logo from '@/assets/figma-home/logo.png';

export function HeroWithImage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Aviation background"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
      </div>
      
      {/* Logo */}
      <div className="relative z-10">
        <img 
          src={logo} 
          alt="Route of Flight Logo"
          className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
          width={160}
          height={160}
        />
      </div>
    </div>
  );
}
```

## Asset Location
All figma-home images should be placed in:
```
src/assets/figma-home/
```

## Checklist for Adding Images
- [ ] Image uses ES module import
- [ ] Image has `object-cover` or `object-contain` class
- [ ] Image has explicit `width` and `height` attributes
- [ ] Image has descriptive `alt` text
- [ ] Image is placed in `src/assets/figma-home/`
- [ ] Image dimensions match display size (or use 2x for retina)
- [ ] No inline style scaling that could cause blur

