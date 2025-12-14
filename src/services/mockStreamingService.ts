/**
 * Mock streaming service for demonstrating live HTML rendering
 * In a real app, this would be replaced with actual LLM API calls
 */

export interface StreamingOptions {
  prompt: string
  style?: 'modern' | 'minimal' | 'colorful' | 'professional'
  onChunk: (chunk: string) => void
  onComplete: () => void
  onError: (error: string) => void
}

export class MockStreamingService {
  private abortController: AbortController | null = null

  async streamHTML(options: StreamingOptions): Promise<void> {
    const { prompt, onChunk, onComplete, onError } = options

    try {
      // Create abort controller for cancellation
      this.abortController = new AbortController()

      // Generate HTML template based on prompt
      const htmlTemplate = this.generateHTMLTemplate(prompt)
      
      // Split into chunks for streaming simulation
      const chunks = this.chunkHTML(htmlTemplate)

      // Stream chunks with realistic timing
      for (let i = 0; i < chunks.length; i++) {
        // Check if aborted
        if (this.abortController.signal.aborted) {
          return
        }

        const chunk = chunks[i]
        onChunk(chunk)

        // Variable delay to simulate real streaming
        const delay = this.calculateDelay(chunk, i, chunks.length)
        await this.sleep(delay)
      }

      onComplete()
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
  }

  private generateHTMLTemplate(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()

    if (lowerPrompt.includes('coffee') || lowerPrompt.includes('cafe')) {
      return this.getCoffeeShopTemplate()
    } else if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('resume')) {
      return this.getPortfolioTemplate()
    } else if (lowerPrompt.includes('landing') || lowerPrompt.includes('product')) {
      return this.getLandingPageTemplate()
    } else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin')) {
      return this.getDashboardTemplate()
    } else {
      return this.getGenericTemplate(prompt)
    }
  }

  private getCoffeeShopTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brew & Bean - Premium Coffee</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .coffee-gradient { background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #F4A460 100%); }
        .bean { background: radial-gradient(circle, #3E2723 30%, #5D4037 70%); }
    </style>
</head>
<body class="bg-gray-50">
    <nav class="bg-white shadow-lg fixed w-full z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <div class="bean w-8 h-8 rounded-full mr-3"></div>
                    <span class="text-2xl font-bold text-gray-800">Brew & Bean</span>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#home" class="text-gray-700 hover:text-amber-600">Home</a>
                    <a href="#menu" class="text-gray-700 hover:text-amber-600">Menu</a>
                    <a href="#about" class="text-gray-700 hover:text-amber-600">About</a>
                    <button class="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700">Order Now</button>
                </div>
            </div>
        </div>
    </nav>

    <section class="coffee-gradient min-h-screen flex items-center justify-center text-white">
        <div class="text-center max-w-4xl mx-auto px-4">
            <h1 class="text-6xl font-bold mb-6">Premium Coffee Experience</h1>
            <p class="text-xl mb-8">Discover the perfect blend of flavor and atmosphere</p>
            <button class="bg-amber-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-700 transform hover:scale-105 transition">
                Explore Menu
            </button>
        </div>
    </section>

    <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4">
            <h2 class="text-4xl font-bold text-center mb-16">Our Signature Blends</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-xl transition">
                    <div class="bean w-16 h-16 rounded-full mx-auto mb-6"></div>
                    <h3 class="text-2xl font-bold mb-4">Espresso Royale</h3>
                    <p class="text-gray-600 mb-6">Rich, bold, and perfectly balanced</p>
                    <span class="text-3xl font-bold text-amber-600">$4.50</span>
                </div>
                <div class="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-xl transition">
                    <div class="bean w-16 h-16 rounded-full mx-auto mb-6"></div>
                    <h3 class="text-2xl font-bold mb-4">Vanilla Latte</h3>
                    <p class="text-gray-600 mb-6">Smooth espresso with vanilla sweetness</p>
                    <span class="text-3xl font-bold text-amber-600">$5.25</span>
                </div>
                <div class="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-xl transition">
                    <div class="bean w-16 h-16 rounded-full mx-auto mb-6"></div>
                    <h3 class="text-2xl font-bold mb-4">Caramel Macchiato</h3>
                    <p class="text-gray-600 mb-6">Espresso with caramel drizzle</p>
                    <span class="text-3xl font-bold text-amber-600">$5.75</span>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`
  }

  private getPortfolioTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>John Doe - Web Developer</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <nav class="fixed w-full bg-gray-800 z-50 px-6 py-4">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">John Doe</h1>
            <div class="space-x-6">
                <a href="#about" class="hover:text-blue-400">About</a>
                <a href="#projects" class="hover:text-blue-400">Projects</a>
                <a href="#contact" class="hover:text-blue-400">Contact</a>
            </div>
        </div>
    </nav>

    <section class="min-h-screen flex items-center justify-center">
        <div class="text-center">
            <h2 class="text-6xl font-bold mb-4">Web Developer</h2>
            <p class="text-xl text-gray-400 mb-8">Creating amazing digital experiences</p>
            <button class="bg-blue-600 px-8 py-3 rounded-lg hover:bg-blue-700">View My Work</button>
        </div>
    </section>

    <section id="projects" class="py-20">
        <div class="max-w-6xl mx-auto px-6">
            <h2 class="text-4xl font-bold text-center mb-16">Featured Projects</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition">
                    <h3 class="text-xl font-bold mb-4">E-commerce Platform</h3>
                    <p class="text-gray-400">Modern React-based shopping experience</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition">
                    <h3 class="text-xl font-bold mb-4">Task Management App</h3>
                    <p class="text-gray-400">Collaborative productivity tool</p>
                </div>
                <div class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition">
                    <h3 class="text-xl font-bold mb-4">Weather Dashboard</h3>
                    <p class="text-gray-400">Real-time weather visualization</p>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`
  }

  private getLandingPageTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ProductX - Revolutionary Solution</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
    <nav class="bg-white shadow-sm px-6 py-4">
        <div class="flex justify-between items-center">
            <div class="text-2xl font-bold text-blue-600">ProductX</div>
            <div class="space-x-6">
                <a href="#features" class="text-gray-600 hover:text-blue-600">Features</a>
                <a href="#pricing" class="text-gray-600 hover:text-blue-600">Pricing</a>
                <button class="bg-blue-600 text-white px-6 py-2 rounded-lg">Get Started</button>
            </div>
        </div>
    </nav>

    <section class="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div class="max-w-6xl mx-auto px-6 text-center">
            <h1 class="text-6xl font-bold mb-6">Revolutionary Solution</h1>
            <p class="text-xl mb-8">Transform your workflow with our cutting-edge platform</p>
            <button class="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100">
                Start Free Trial
            </button>
        </div>
    </section>

    <section id="features" class="py-20">
        <div class="max-w-6xl mx-auto px-6">
            <h2 class="text-4xl font-bold text-center mb-16">Why Choose ProductX?</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <span class="text-white text-2xl">⚡</span>
                    </div>
                    <h3 class="text-xl font-bold mb-4">Lightning Fast</h3>
                    <p class="text-gray-600">Optimized performance for maximum efficiency</p>
                </div>
                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <span class="text-white text-2xl">🔒</span>
                    </div>
                    <h3 class="text-xl font-bold mb-4">Secure</h3>
                    <p class="text-gray-600">Enterprise-grade security you can trust</p>
                </div>
                <div class="text-center">
                    <div class="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <span class="text-white text-2xl">📈</span>
                    </div>
                    <h3 class="text-xl font-bold mb-4">Scalable</h3>
                    <p class="text-gray-600">Grows with your business needs</p>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`
  }

  private getDashboardTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <aside class="w-64 bg-gray-800 text-white">
            <div class="p-6">
                <h1 class="text-2xl font-bold">Dashboard</h1>
            </div>
            <nav class="mt-6">
                <a href="#" class="block px-6 py-3 hover:bg-gray-700">Overview</a>
                <a href="#" class="block px-6 py-3 hover:bg-gray-700">Analytics</a>
                <a href="#" class="block px-6 py-3 hover:bg-gray-700">Users</a>
                <a href="#" class="block px-6 py-3 hover:bg-gray-700">Settings</a>
            </nav>
        </aside>

        <main class="flex-1 p-8">
            <h2 class="text-3xl font-bold mb-8">Welcome back, Admin</h2>
            
            <div class="grid md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-gray-600">Total Users</h3>
                    <p class="text-3xl font-bold text-blue-600">12,543</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-gray-600">Revenue</h3>
                    <p class="text-3xl font-bold text-green-600">$45,210</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-gray-600">Orders</h3>
                    <p class="text-3xl font-bold text-purple-600">1,234</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-semibold text-gray-600">Growth</h3>
                    <p class="text-3xl font-bold text-orange-600">+23%</p>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-xl font-bold mb-4">Recent Activity</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between py-2 border-b">
                        <span>New user registration</span>
                        <span class="text-gray-500">2 minutes ago</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b">
                        <span>Order #1234 completed</span>
                        <span class="text-gray-500">5 minutes ago</span>
                    </div>
                    <div class="flex items-center justify-between py-2">
                        <span>Payment received</span>
                        <span class="text-gray-500">10 minutes ago</span>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`
  }

  private getGenericTemplate(prompt: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex items-center justify-center">
        <div class="max-w-4xl mx-auto px-6 text-center">
            <h1 class="text-5xl font-bold text-gray-800 mb-6">Custom Page</h1>
            <p class="text-xl text-gray-600 mb-8">Generated based on: "${prompt}"</p>
            <div class="bg-white rounded-lg shadow-lg p-8">
                <h2 class="text-2xl font-bold mb-4">Content Section</h2>
                <p class="text-gray-700 mb-6">This page was dynamically generated based on your prompt. In a real implementation, this would be created by an AI language model.</p>
                <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                    Get Started
                </button>
            </div>
        </div>
    </div>
</body>
</html>`
  }

  private chunkHTML(html: string): string[] {
    const chunks: string[] = []
    const chunkSize = 30 // Smaller chunks for more realistic streaming
    
    for (let i = 0; i < html.length; i += chunkSize) {
      chunks.push(html.slice(i, i + chunkSize))
    }
    
    return chunks
  }

  private calculateDelay(chunk: string, index: number, totalChunks: number): number {
    // Variable delay based on content type
    if (chunk.includes('<')) {
      return 80 // Slower for HTML tags
    } else if (chunk.includes(' ')) {
      return 40 // Medium for spaces/words
    } else {
      return 20 // Faster for regular text
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const mockStreamingService = new MockStreamingService()
