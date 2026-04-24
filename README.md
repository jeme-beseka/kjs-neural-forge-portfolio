# Jeme Beseka Portfolio

A modern, responsive portfolio website showcasing projects, blog posts, and professional experience with dynamic theming support.

## Features

- **Dynamic Theming**: Switch between multiple color themes with smooth transitions
- **3D Hero Section**: Animated 3D shapes using Three.js that change based on the active theme
- **Project Showcase**: Filterable project gallery with featured projects
- **Blog System**: Full blog functionality with markdown support
- **Admin Dashboard**: Content management system for projects and blog posts
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Performance Analytics**: Integrated Vercel Analytics for tracking
- **Smooth Animations**: Page transitions and micro-interactions using Framer Motion

## Available Themes

### Currently Working (6 themes)
- **Cyber Blue** - Neon blue and purple cyberpunk aesthetic
- **Deep Space** - Dark cosmic theme with galaxy-inspired colors
- **Arctic Neural** - Cool blue neural network visualization
- **Matrix Green** - Classic Matrix-inspired green terminal look
- **Bio Circuit** - Organic green circuit board patterns
- **Toxic Forge** - Vibrant green and yellow industrial theme

### Upcoming Themes (15 themes)
- Pure Light
- Frost
- Lumen
- Autobot Chrome
- Obsidian
- Midnight
- Phantom
- Dark Cybertron
- Sandstone
- Forest
- Clay
- Inferno
- Crimson
- Ember
- War Forge

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: TailwindCSS
- **3D Graphics**: Three.js, React Three Fiber
- **Animations**: Framer Motion
- **Database**: Supabase
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel

## Project Structure

```
jeme-portfolio/
├── src/
│   ├── components/
│   │   ├── sections/
│   │   │   ├── HeroSection.jsx      # 3D hero with theme shapes
│   │   │   ├── ProjectsSection.jsx  # Project gallery
│   │   │   ├── AboutSection.jsx     # About me section
│   │   │   └── BlogSection.jsx      # Blog listing
│   │   ├── ui/                      # Reusable UI components
│   │   └── admin/                   # Admin panel components
│   ├── backgrounds/                 # Canvas 2D background animations
│   ├── context/
│   │   └── ThemeContext.jsx         # Theme management
│   ├── pages/                       # Page components
│   ├── lib/
│   │   └── supabase.js              # Supabase client
│   ├── App.jsx                      # Main app component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles & theme variables
├── public/                          # Static assets
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd jeme-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Database Setup

### Supabase Tables

**projects** table:
- `id` (text, primary key)
- `title` (text)
- `description` (text)
- `long_description` (text)
- `tags` (text[])
- `live_url` (text)
- `github_url` (text)
- `image_url` (text)
- `status` (text: 'completed' | 'upcoming')
- `featured` (boolean)
- `created_at` (timestamp)

**blog_posts** table:
- `id` (text, primary key)
- `title` (text)
- `slug` (text, unique)
- `content` (text)
- `excerpt` (text)
- `published` (boolean)
- `created_at` (timestamp)

**site_settings** table:
- `key` (text, primary key)
- `value` (text)

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The site will automatically be optimized for production with Vercel's build system.

## Admin Panel

Access the admin dashboard at `/admin` to:
- Add, edit, and delete projects
- Create and manage blog posts
- Update site settings

Default admin credentials should be set up in your Supabase auth system.

## Customization

### Adding New Themes

1. Add theme colors to `src/index.css`:
```css
[data-theme='your-theme'] {
  --color-primary: #your-color;
  --color-accent: #your-accent;
  --color-bg-dark: #your-dark-bg;
  --color-bg-light: #your-light-bg;
  /* ... other variables */
}
```

2. Add theme metadata to `src/context/ThemeContext.jsx`:
```javascript
"your-theme": {
  name: "Your Theme Name",
  isDark: true/false,
  primary: "#your-color",
  accent: "#your-accent"
}
```

3. Add 3D shape component to `src/components/sections/HeroSection.jsx`
4. Update the `ThemeShape` switch statement

## Performance

- Built with Vite for fast development and optimized production builds
- Code splitting for optimal loading
- Lazy loading of 3D components
- Optimized images and assets
- Vercel Analytics for performance monitoring

## License

This project is licensed under the MIT License.

## Author

Jeme Beseka - [Portfolio](https://your-portfolio-url) - [GitHub](https://github.com/yourusername)

## Acknowledgments

- React team for the amazing framework
- Three.js community for 3D graphics
- TailwindCSS for the utility-first CSS framework
- Vercel for hosting and analytics
