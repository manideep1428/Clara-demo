import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test')({
  component: LiveClaraParserPreviewer
})
import { useRef, useState } from "react";


export default function LiveClaraParserPreviewer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const htmlBufferRef = useRef("");  // buffer for HTML only
  const captureEnabledRef = useRef(false); // track if inside <claraAction>
  const rawInputRef = useRef(""); // full raw data including Clara wrapper
  const [rawDisplay, setRawDisplay] = useState("");

  // writes HTML chunk to page preview
  const pushHtmlToPreview = (chunk: string) => {
    htmlBufferRef.current += chunk;
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    if (htmlBufferRef.current.startsWith("<!DOCTYPE html>")) {
      doc.open();
    }

    doc.write(htmlBufferRef.current);
    doc.close();
  };

  // real live parser: detects Clara start and end while text is streaming
  const liveParseClara = (incomingChunk: string) => {
    rawInputRef.current += incomingChunk;
    setRawDisplay(rawInputRef.current);

    if (incomingChunk.includes("<claraAction")) {
      captureEnabledRef.current = true;
      return;
    }

    if (incomingChunk.includes("</claraAction>")) {
      captureEnabledRef.current = false;
      return;
    }

    if (captureEnabledRef.current) {
      pushHtmlToPreview(incomingChunk);
    }
  };

  // slow streaming simulator
  const simulateSlowClaraStream = async () => {
    rawInputRef.current = "";
    htmlBufferRef.current = "";
    setRawDisplay("");

    const bigClaraString = `now create a parser and render thsi on slow html page give full code : <claraArtifact id="ecommerce-home" title="Ecommerce Home Page"> <claraAction type="file" filePath="index.html"> <!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <script src="https://cdn.tailwindcss.com"></script> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap" rel="stylesheet"> <title>LuxeStore - Premium Shopping Experience</title> <style> body { font-family: 'Inter', sans-serif; } .hero-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); } .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; } .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); } </style> </head> <body class="bg-gray-50"> <!-- Navigation --> <nav class="bg-white shadow-sm sticky top-0 z-50"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="flex justify-between items-center h-16"> <div class="flex items-center"> <h1 class="text-2xl font-bold text-gray-900">LuxeStore</h1> </div> <div class="hidden md:flex items-center space-x-8"> <a href="#" class="text-gray-700 hover:text-gray-900 font-medium">New Arrivals</a> <a href="#" class="text-gray-700 hover:text-gray-900 font-medium">Categories</a> <a href="#" class="text-gray-700 hover:text-gray-900 font-medium">Sale</a> <a href="#" class="text-gray-700 hover:text-gray-900 font-medium">About</a> </div> <div class="flex items-center space-x-4"> <button class="p-2 text-gray-700 hover:text-gray-900"> <i class="fas fa-search text-lg"></i> </button> <button class="p-2 text-gray-700 hover:text-gray-900"> <i class="fas fa-user text-lg"></i> </button> <button class="p-2 text-gray-700 hover:text-gray-900 relative"> <i class="fas fa-shopping-bag text-lg"></i> <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span> </button> </div> </div> </div> </nav>
  <!-- Hero Section -->
  <section class="hero-gradient text-white py-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="text-4xl md:text-6xl font-bold mb-6">Summer Collection 2024</h2>
        <p class="text-xl mb-8 max-w-2xl mx-auto">Discover the latest trends in fashion with our curated selection of premium clothing and accessories.</p>
        <button class="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition duration-300">
          Shop Now
        </button>
      </div>
    </div>
  </section>

  <!-- Featured Categories -->
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h3 class="text-3xl font-bold text-gray-900 text-center mb-12">Shop by Category</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="relative overflow-hidden rounded-lg card-hover cursor-pointer">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=300&fit=crop" alt="Women" class="w-full h-64 object-cover">
          <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <h4 class="text-white text-2xl font-bold p-6">Women</h4>
          </div>
        </div>
        <div class="relative overflow-hidden rounded-lg card-hover cursor-pointer">
          <img src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=500&h=300&fit=crop" alt="Men" class="w-full h-64 object-cover">
          <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <h4 class="text-white text-2xl font-bold p-6">Men</h4>
          </div>
        </div>
        <div class="relative overflow-hidden rounded-lg card-hover cursor-pointer">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop" alt="Accessories" class="w-full h-64 object-cover">
          <div class="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <h4 class="text-white text-2xl font-bold p-6">Accessories</h4>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Products -->
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h3 class="text-3xl font-bold text-gray-900 text-center mb-12">Featured Products</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="group cursor-pointer">
          <div class="relative overflow-hidden rounded-lg mb-4">
            <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop" alt="Product" class="w-full h-80 object-cover group-hover:scale-105 transition duration-300">
            <span class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded">-30%</span>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">Classic White Shirt</h4>
          <p class="text-gray-500 text-sm mb-2">Premium Cotton</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-900">$49.99</span>
            <span class="text-sm text-gray-400 line-through">$69.99</span>
          </div>
        </div>
        <div class="group cursor-pointer">
          <div class="relative overflow-hidden rounded-lg mb-4">
            <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop" alt="Product" class="w-full h-80 object-cover group-hover:scale-105 transition duration-300">
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">Summer Dress</h4>
          <p class="text-gray-500 text-sm mb-2">Floral Print</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-900">$79.99</span>
          </div>
        </div>
        <div class="group cursor-pointer">
          <div class="relative overflow-hidden rounded-lg mb-4">
            <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=400&fit=crop" alt="Product" class="w-full h-80 object-cover group-hover:scale-105 transition duration-300">
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">Running Shoes</h4>
          <p class="text-gray-500 text-sm mb-2">Sport Collection</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-900">$129.99</span>
          </div>
        </div>
        <div class="group cursor-pointer">
          <div class="relative overflow-hidden rounded-lg mb-4">
            <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop" alt="Product" class="w-full h-80 object-cover group-hover:scale-105 transition duration-300">
            <span class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 text-xs rounded">New</span>
          </div>
          <h4 class="font-semibold text-gray-900 mb-1">Leather Bag</h4>
          <p class="text-gray-500 text-sm mb-2">Luxury Edition</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-900">$199.99</span>
          </div>
        </div>
      </div>
      <div class="text-center mt-12">
        <button class="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition duration-300">
          View All Products
        </button>
      </div>
    </div>
  </section>

  <!-- Newsletter -->
  <section class="py-16 bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h3 class="text-3xl font-bold text-white mb-4">Stay Updated</h3>
      <p class="text-gray-300 mb-8 max-w-xl mx-auto">Subscribe to our newsletter and get exclusive offers, new product launches, and style tips delivered to your inbox.</p>
      <div class="max-w-md mx-auto flex gap-4">
        <input type="email" placeholder="Enter your email" class="flex-1 px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500">
        <button class="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-purple-700 transition duration-300">
          Subscribe
        </button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-white py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h5 class="font-bold text-gray-900 mb-4">LuxeStore</h5>
          <p class="text-gray-600 text-sm">Your premium destination for fashion and lifestyle products.</p>
        </div>
        <div>
          <h6 class="font-semibold text-gray-900 mb-4">Quick Links</h6>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="text-gray-600 hover:text-gray-900">About Us</a></li>
            <li><a href="#" class="text-gray-600 hover:text-gray-900">Contact</a></li>
            <li><a href="#" class="text-gray-600 hover:text-gray-900">FAQs</a></li>
            <li><a href="#" class="text-gray-600 hover:text-gray-900">Shipping Info</a></li>
          </ul>
        </div>
        <div>
          <h6 class="font-semibold text-gray-900 mb-4">Customer Service</h6>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="text-gray-600 hover:text-gray-900">Returns</a></li>
            <li><a href="#" class="text-gray-600 hover:text-gray-900">Size Guide</a></li>
            <li><a href="#" class="text-gray-600 hover:text-gray-900">Care Instructions</a></li>
            <li><a href="#" class="text-gray-600 hover:text-gray-900">Terms & Conditions</a></li>
          </ul>
        </div>
        <div>
          <h6 class="font-semibold text-gray-900 mb-4">Follow Us</h6>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-600 hover:text-gray-900"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="text-gray-600 hover:text-gray-900"><i class="fab fa-instagram"></i></a>
            <a href="#" class="text-gray-600 hover:text-gray-900"><i class="fab fa-twitter"></i></a>
            <a href="#" class="text-gray-600 hover:text-gray-900"><i class="fab fa-pinterest"></i></a>
          </div>
        </div>
      </div>
      <div class="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
        <p>&copy; 2024 LuxeStore. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>
</claraAction> </claraArtifact>`

    const chunks = bigClaraString.match(/.{1,90}/gs) || [];
    for (const c of chunks) {
      liveParseClara(c);
      await new Promise(r => setTimeout(r, 85));
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-50">

      {/* Left panel raw stream */}
      <div className="w-1/2 flex flex-col border-r border-slate-800">
        <header className="border-b border-slate-800 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
          Raw Streaming Input (Clara format)
        </header>
        <textarea
          value={rawDisplay}
          readOnly
          spellCheck={false}
          className="flex-1 bg-slate-900 px-4 py-3 text-xs font-mono text-slate-200 resize-none outline-none"
        />
      </div>

      {/* Right panel iframe preview */}
      <div className="w-1/2 relative bg-slate-900">
        <header className="border-b border-slate-800 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
          Parsed HTML Rendered Live (iframe)
        </header>

        <iframe
          ref={iframeRef}
          className="w-full h-full bg-white border-none"
          sandbox="allow-same-origin allow-scripts"
        />

        {/* test live parser */}
        <button
          onClick={simulateSlowClaraStream}
          className="absolute bottom-4 right-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium"
        >
          Simulate Live Parser
        </button>
      </div>

    </div>
  );
}
