<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>403 - Access Denied</title>
    
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
            0%, 100% { box-shadow: 0 0 20px rgba(251, 146, 60, 0.3); }
            50% { box-shadow: 0 0 40px rgba(251, 146, 60, 0.6); }
        }
        
        @keyframes gradient-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .float-animation {
            animation: float 6s ease-in-out infinite;
        }
        
        .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .gradient-animated {
            background: linear-gradient(-45deg, #fb923c, #f97316, #dc2626, #ea580c);
            background-size: 400% 400%;
            animation: gradient-shift 15s ease infinite;
        }
        
        .shake-animation {
            animation: shake 0.5s ease-in-out;
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
            background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .grid-pattern {
            background-image: 
                linear-gradient(rgba(251, 146, 60, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(251, 146, 60, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
        }
        
        .dark .grid-pattern {
            background-image: 
                linear-gradient(rgba(251, 146, 60, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(251, 146, 60, 0.05) 1px, transparent 1px);
        }
    </style>
</head>
<body class="font-sans antialiased bg-slate-50 dark:bg-slate-900 min-h-screen overflow-hidden">
        <!-- Background with Grid Pattern -->
    <div class="fixed inset-0 grid-pattern"></div>
    
    <!-- Animated Background Elements -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl float-animation"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl float-animation" style="animation-delay: 3s;"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gradient-animated opacity-5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div class="max-w-5xl w-full">
            <!-- Glass Card Container -->
            <div class="glass-morphism rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl hover-lift">
                <!-- 403 Hero Section -->
                <div class="text-center mb-8 sm:mb-12">
                    <div class="relative inline-block mb-6 sm:mb-8">
                        <!-- Glowing Ring -->
                        <div class="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl pulse-glow"></div>
                        
                        <!-- Main 403 Circle -->
                        <div class="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white rounded-full w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
                            <div class="text-center">
                                <svg class="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                                <div class="text-xs sm:text-sm font-medium">ACCESS DENIED</div>
                            </div>
                        </div>
                        
                        <!-- Floating Elements -->
                        <div class="absolute -top-4 -right-4 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full float-animation shake-animation" style="animation-delay: 1s;"></div>
                        <div class="absolute -bottom-4 -left-4 w-4 h-4 sm:w-6 sm:h-6 bg-red-400 rounded-full float-animation" style="animation-delay: 2s;"></div>
                        <div class="absolute top-1/2 -right-6 sm:-right-8 w-3 h-3 sm:w-4 sm:h-4 bg-orange-400 rounded-full float-animation" style="animation-delay: 4s;"></div>
                    </div>

                    <!-- Error Title -->
                    <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6">
                        <span class="text-gradient">Access Restricted</span>
                    </h1>
                    
                    <!-- Error Description -->
                    <div class="space-y-3 sm:space-y-4 mb-8 sm:mb-12">
                        <p class="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto px-4">
                            You don't have permission to access this resource.
                        </p>
                        <p class="text-sm sm:text-base lg:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto px-4">
                            This area requires special permissions. Contact your administrator if you believe this is an error.
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

                <!-- Information Card -->
                <div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border border-slate-200/50 dark:border-slate-700/50">
                    <h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 text-center">What can you do?</h3>
                    <div class="grid sm:grid-cols-3 gap-4 sm:gap-6">
                        <div class="text-center">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <h4 class="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">Check Permissions</h4>
                            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Verify your account has the correct access rights</p>
                        </div>
                        <div class="text-center">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                                </svg>
                            </div>
                            <h4 class="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">Contact Admin</h4>
                            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Reach out to your system administrator</p>
                        </div>
                        <div class="text-center">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                <svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <h4 class="font-semibold text-slate-900 dark:text-white mb-2 text-sm sm:text-base">Try Different Account</h4>
                            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Sign in with another account if available</p>
                        </div>
                    </div>
                </div>

                <!-- Error Details -->
                <div class="border-t border-slate-200 dark:border-slate-700 pt-4 sm:pt-8">
                    <div class="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs text-slate-400 dark:text-slate-500">
                        <div class="flex items-center gap-2">
                            <span>Error Code:</span>
                            <code class="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded font-mono">403</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span>Timestamp:</span>
                            <code class="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded font-mono">{{ now()->format('H:i:s') }}</code>
                        </div>
                        <div class="flex items-center gap-2">
                            <span>Session ID:</span>
                            <code class="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded font-mono">{{ uniqid() }}</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
