import { motion } from "framer-motion"

interface PromptSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
}

interface PromptSuggestion {
  title: string
  prompt: string
}

const promptSuggestions: PromptSuggestion[] = [
  {
    title: "Food Delivery App",
    prompt: "Create a modern food delivery mobile app with a clean, appetizing design. Include a top navigation bar with the app logo, location selector, and cart icon. Use a warm color scheme with orange/red accents.\n\nThe home screen should have:\n- Search bar with filters\n- Category chips (Pizza, Burgers, Sushi, etc.)\n- Featured restaurant cards with images, ratings, and delivery time\n- Special offers banner\n- Bottom navigation bar with Home, Search, Orders, and Profile icons\n\nUse rounded corners, food photography, and clear typography. Add subtle shadows and a modern, hungry-inducing aesthetic."
  },
  {
    title: "Fitness Workout App",
    prompt: "Design a fitness and workout tracking app with an energetic, motivating design. Include a top navbar with profile picture, streak counter, and notification bell.\n\nMain dashboard should show:\n- Today's workout plan card\n- Progress ring showing calories burned\n- Quick stats (steps, active minutes, workouts completed)\n- Workout category cards (Strength, Cardio, Yoga, HIIT)\n- Bottom tab bar with Dashboard, Workouts, Progress, and Profile\n\nUse bold colors like electric blue and lime green, fitness-themed icons, progress bars, and motivational design elements. Include achievement badges."
  },
  {
    title: "Music Streaming App",
    prompt: "Build a sleek music streaming app with a dark theme and vibrant album art. Top navigation should have a search icon, settings, and user avatar.\n\nHome screen features:\n- Large 'Good Morning' greeting\n- Recently played horizontal scroll\n- Recommended playlists grid with cover art\n- Top charts section\n- Genre mood cards (Chill, Workout, Focus, Party)\n- Bottom player bar showing current song with play/pause\n- Bottom nav: Home, Search, Library, Premium\n\nUse dark backgrounds (#121212), colorful gradients from album art, smooth animations, and modern music player controls."
  },
  {
    title: "Banking & Finance App",
    prompt: "Create a professional banking app with a trustworthy, secure design. Top navbar with bank logo, notification icon, and help button.\n\nDashboard should include:\n- Account balance card with show/hide toggle\n- Quick action buttons (Send, Request, Pay Bills, Deposit)\n- Recent transactions list with icons and amounts\n- Spending analytics chart\n- Credit score widget\n- Bottom navigation: Home, Cards, Transactions, More\n\nUse a blue/purple gradient, clean white cards, security icons, and professional typography. Include biometric login indicator and encryption badges."
  },
  {
    title: "Travel Booking App",
    prompt: "Design a travel and hotel booking app with inspiring, wanderlust-inducing visuals. Top bar with menu icon, app logo, and favorites heart icon.\n\nMain screen should have:\n- Hero search card (Destination, Dates, Guests)\n- Trending destinations carousel with beautiful photos\n- Deal cards showing discounts\n- Categories (Hotels, Flights, Experiences, Car Rentals)\n- Recommended for you section\n- Bottom tabs: Explore, Bookings, Saved, Account\n\nUse travel photography, gradient overlays, location pins, and an adventurous color palette with blues and sunset oranges. Add rating stars and price tags."
  },
  {
    title: "Social Media App",
    prompt: "Build a modern social media app with an engaging, content-first design. Top navbar with app logo, search icon, and messenger icon.\n\nFeed screen features:\n- Stories bar at top with circular avatars\n- Post cards with user profile pic, name, timestamp\n- Image/video content area\n- Like, comment, share, save buttons\n- Trending hashtags sidebar\n- Create post floating action button\n- Bottom navigation: Feed, Discover, Create, Notifications, Profile\n\nUse Instagram-inspired design with white/light theme, colorful story rings, heart animations, and smooth scrolling. Include engagement metrics."
  }
]

export function PromptSuggestions({ onSuggestionClick }: PromptSuggestionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6 px-2">
      {promptSuggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          onClick={() => onSuggestionClick(suggestion.prompt)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-full bg-black/40 text-slate-300 hover:text-white border border-slate-700 text-sm transition"
        >
          {suggestion.title}
        </motion.button>
      ))}
    </div>
  )
}
