import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Plus, Search, Grid3x3, List, Moon, Sun, ChevronDown } from 'lucide-react';
import { nanoid } from 'nanoid';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleCreateNewDesign = () => {
    const newDesignId = nanoid();
    navigate({ 
      to: '/design/$designId', 
      params: { designId: newDesignId },
      search: { new: true }
    });
  };

  const workflowCards = [
    { id: 1, title: 'Clara Welcome', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400' },
    { id: 2, title: 'Multiple Image Models V2', image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400' },
    { id: 3, title: 'Editing Images', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' },
    { id: 4, title: 'Compositor Node', image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400' },
    { id: 5, title: 'Image to Video', image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400' },
    { id: 6, title: 'Camera Angle Ideation', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#0e0e0e] text-[#fafafa]' : 'bg-[#f7f7f7] text-[#1a1a1a]'}`}>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 border-r transition-colors duration-300 ${darkMode ? 'bg-[#0e0e0e] border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col h-full p-4">
          {/* User Section */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              V
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <span className="font-medium">Vicky</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Create Button */}
          <button 
            onClick={handleCreateNewDesign}
            className="w-full bg-[#C3C97E] hover:bg-[#b5c170] text-black font-medium py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Create New File
          </button>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <a href="#" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>My Files</span>
            </a>
            <a href="#" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Shared with Me</span>
            </a>
            <a href="#" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Apps</span>
            </a>
          </nav>

          {/* Discord Footer */}
          <div className="pt-4 border-t border-gray-700">
            <a href="#" className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Discord</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Vicky's Workspace</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={handleCreateNewDesign}
                className="bg-[#C3C97E] hover:bg-[#b5c170] text-black font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create New File
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mb-6 border-b border-gray-700">
            <button className="pb-3 px-1 font-medium border-b-2 border-[#C3C97E]">
              Workflow Library
            </button>
            <button className={`pb-3 px-1 font-medium transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}>
              Tutorials
            </button>
          </div>

          {/* Workflow Library Grid */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {workflowCards.map((card) => (
              <div
                key={card.id}
                onClick={() => navigate({ to: '/design/$designId', params: { designId: `template-${card.id}` }, search: { new: false } })}
                className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${darkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{card.title}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* My Files Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Files</h2>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="bg-transparent outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#C3C97E] text-black' : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#C3C97E] text-black' : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* File Card */}
            <div 
              onClick={() => navigate({ to: '/design/$designId', params: { designId: 'untitled-1' }, search: { new: false } })}
              className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${darkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${darkMode ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">untitled</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Last edited 4 days ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
