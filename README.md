# SkillFlow Tracker 📊

A modern, animated personal progress tracker website for students to monitor their learning journey across multiple domains.

## 🎯 Features

### Four Main Tracking Pages

1. **Dashboard** - Monthly progress overview
   - Overall progress percentage with circular progress indicator
   - Quick stats for books, coding hours, video projects, and skill growth
   - Detailed category progress cards
   - Motivational quotes

2. **Video Editing & Design** - Creative skills tracker
   - Premiere Pro / After Effects practice hours
   - Canva / Figma design time
   - Thumbnails and Reels editing projects
   - Color grading practice
   - Recent projects showcase
   - Sticky reminder for daily practice

3. **Books Tracker** - Reading progress monitor
   - Books planned vs completed
   - Total pages read
   - Reading streak counter
   - Individual book progress with animated bars
   - Monthly reading goals
   - Sticky reminder about reading benefits

4. **Coding Tracker** - Programming skills dashboard
   - Problems solved across platforms
   - Languages practiced (Python, Java, HTML/CSS/JS)
   - Active projects with progress
   - Recent problem-solving activity
   - Weekly coding goals
   - Sticky reminder for daily practice

## 🎨 Design Features

- **Soft Gradient Background** - Purple, pink, and blue gradients
- **Glassmorphism Cards** - Modern frosted glass effect
- **Smooth Animations** - Motion/Framer Motion powered transitions
- **Hover Effects** - Interactive card transformations
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode Support** - Beautiful dark theme included
- **Custom Scrollbar** - Gradient styled scrollbar
- **Sticky Reminders** - Important motivational notes on each page

## 🛠️ Tech Stack

- **React 18** - UI framework
- **React Router 7** - Client-side routing
- **Motion (Framer Motion)** - Animation library
- **Tailwind CSS 4** - Utility-first styling
- **TypeScript** - Type safety
- **Lucide React** - Icon library
- **Vite** - Build tool

## 📂 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── CircularProgress.tsx    # Circular progress indicator
│   │   ├── ProgressCard.tsx        # Progress tracking card
│   │   ├── StatCard.tsx            # Statistics display card
│   │   └── StickyReminder.tsx      # Motivational reminder card
│   ├── pages/
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── VideoDesign.tsx         # Video & design tracker
│   │   ├── Books.tsx               # Books reading tracker
│   │   └── Coding.tsx              # Coding practice tracker
│   └── App.tsx                     # Main app with routing
└── styles/
    ├── fonts.css                   # Font imports (Inter & Poppins)
    ├── theme.css                   # Color theme variables
    └── animations.css              # Custom animations
```

## 🚀 Key Components

### CircularProgress
Animated circular progress indicator with percentage display.

### ProgressCard
Card component showing progress toward a goal with animated progress bar.

### StatCard
Display statistics with icons and trend information.

### StickyReminder
Sticky positioned reminder cards with motivational messages.

## 🎯 Usage

Navigate between pages using the top navigation bar:
- **Dashboard** - View overall monthly progress
- **Video & Design** - Track creative skill development
- **Books** - Monitor reading progress and goals
- **Coding** - Track programming practice and projects

Each page includes:
- Real-time progress tracking
- Visual progress indicators
- Motivational reminders
- Detailed breakdowns by category
- Animated transitions

## 🎨 Color Scheme

### Light Mode
- Background: Soft purple-pink gradient
- Primary: Purple (#8b5cf6)
- Accent: Pink (#ec4899)
- Cards: White with shadows

### Dark Mode
- Background: Dark gray with purple tint
- Primary: Light purple (#a78bfa)
- Accent: Bright pink (#f472b6)
- Cards: Dark gray with borders

## 📱 Responsive Design

The app is fully responsive with:
- Mobile-first approach
- Collapsible navigation on mobile
- Grid layouts that adapt to screen size
- Touch-friendly interactive elements

## ✨ Animations

- Fade-in animations on page load
- Slide-in effects for cards
- Progress bar fill animations
- Hover scale transformations
- Smooth page transitions

## 🎓 Perfect For

- Students tracking multiple skills
- Self-learners managing progress
- Anyone building consistent habits
- People who love data visualization
- Motivation seekers

## 📝 Customization

You can easily customize:
- Color schemes in `theme.css`
- Progress goals and targets
- Motivational messages
- Tracked skills and categories
- Animation timing and effects

---

**Built with care for students who want to track their growth journey!** 🚀
