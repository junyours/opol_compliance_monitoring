<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Page Not Found</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />
    
    <!-- Scripts -->
    @vite(['resources/css/app.css'])
    
    <style>
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
            50% { box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
        }
        
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .float-animation {
            animation: float 6s ease-in-out infinite;
        }
        
        .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .gradient-animated {
            background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
            background-size: 400% 400%;
            animation: gradient-shift 15s ease infinite;
        }
        
        .glass-morphism {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .dark .glass-morphism {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .hover-lift {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .text-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .grid-pattern {
            background-image: 
                linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
        }
        
        .dark .grid-pattern {
            background-image: 
                linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
        }
    </style>
</head>
<body class="font-sans antialiased bg-slate-50 dark:bg-slate-900 min-h-screen overflow-hidden">
    <!-- Background with Grid Pattern -->
    <div class="fixed inset-0 grid-pattern"></div>
    
    <!-- Animated Background Elements -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl float-animation"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl float-animation" style="animation-delay: 3s;"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gradient-animated opacity-5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div class="max-w-5xl w-full">
            <!-- Glass Card Container -->
            <div class="glass-morphism rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl hover-lift">
                <!-- 404 Hero Section -->
                <div class="text-center mb-8 sm:mb-12">
                    <div class="relative inline-block mb-6 sm:mb-8">
                        <!-- Glowing Ring -->
                        <div class="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl pulse-glow"></div>
                        
                        <!-- Main 404 Circle -->
                        <div class="relative bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 text-white rounded-full w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
                            <div class="text-center">
                                <span class="text-5xl sm:text-6xl lg:text-7xl font-black">404</span>
                                <div class="text-xs sm:text-sm font-medium mt-1 opacity-80">NOT FOUND</div>
                            </div>
                        </div>
                        
                        <!-- Floating Elements -->
                        <div class="absolute -top-4 -right-4 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full float-animation" style="animation-delay: 1s;"></div>
                        <div class="absolute -bottom-4 -left-4 w-4 h-4 sm:w-6 sm:h-6 bg-blue-400 rounded-full float-animation" style="animation-delay: 2s;"></div>
                        <div class="absolute top-1/2 -right-6 sm:-right-8 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full float-animation" style="animation-delay: 4s;"></div>
                    </div>

                    <!-- Error Title -->
                    <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6">
                        <span class="text-gradient">Lost in Space</span>
                    </h1>
                    
                    <!-- Error Description -->
                    <div class="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                        <p class="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto px-4">
                            The page you're looking for has vanished into the digital void.
                        </p>
                        <p class="text-sm sm:text-base lg:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto px-4">
                            Don't worry, even the best explorers get lost sometimes. Let's get you back on track.
                        </p>
                    </div>
                </div>

                <!-- Single Back Button -->
                <div class="flex justify-center mb-8 sm:mb-12">
                    <button onclick="history.back()" 
                            class="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center">
                        <div class="bg-white/20 rounded-full p-2 mr-3 group-hover:bg-white/30 transition-colors">
                            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                        </div>
                        <span class="text-base sm:text-lg font-semibold">Go Back</span>
                    </button>
                </div>

                <!-- Quick Links -->
                <div class="border-t border-slate-200 dark:border-slate-700 pt-6 sm:pt-8">
                    <h3 class="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4 sm:mb-6 text-center">Quick Navigation</h3>
                    <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
                        <a href="{{ url('/dashboard') }}" class="px-3 py-2 sm:px-4 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
                            Dashboard
                        </a>
                        <a href="{{ url('/profile') }}" class="px-3 py-2 sm:px-4 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
                            Profile
                        </a>
                        <a href="{{ url('/settings') }}" class="px-3 py-2 sm:px-4 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
                            Settings
                        </a>
                        <a href="{{ url('/help') }}" class="px-3 py-2 sm:px-4 sm:py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors">
                            Help Center
                        </a>
                    </div>
                </div>

                <!-- Error Details -->
                <div class="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div class="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs text-slate-400 dark:text-slate-500">
                        <div class="flex items-center gap-2">
                            <span>Error Code:</span>
                            <code class="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded font-mono">404</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span>Timestamp:</span>
                            <code class="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded font-mono">{{ now()->format('H:i:s') }}</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span>Request ID:</span>
                            <code class="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded font-mono">{{ uniqid() }}</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
