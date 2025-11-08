<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ $title ?? 'Panel Photo Booth' }}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-cream text-boho-brown antialiased min-h-screen">
        <div class="min-h-screen flex flex-col">
            <header class="bg-terracotta text-cream px-4 py-4 shadow-soft">
                <div class="flex items-center justify-between">
                    <a href="{{ route('admin.dashboard') }}" class="font-semibold tracking-wide uppercase text-sm">PhotoBooth Admin</a>
                    <form action="{{ route('admin.logout') }}" method="POST">
                        @csrf
                        <button class="text-cream/90 text-sm font-medium">Salir</button>
                    </form>
                </div>
                <nav class="mt-4 flex gap-3 text-sm overflow-x-auto">
                    <a href="{{ route('admin.dashboard') }}" class="admin-pill {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">Dashboard</a>
                    <a href="{{ route('admin.gallery.index') }}" class="admin-pill {{ request()->routeIs('admin.gallery.*') ? 'active' : '' }}">Galería</a>
                    <a href="{{ route('admin.moderation.index') }}" class="admin-pill {{ request()->routeIs('admin.moderation.*') ? 'active' : '' }}">Moderar</a>
                    <a href="{{ route('admin.stickers.index') }}" class="admin-pill {{ request()->routeIs('admin.stickers.*') ? 'active' : '' }}">Stickers</a>
                    <a href="{{ route('admin.flyer.show') }}" class="admin-pill {{ request()->routeIs('admin.flyer.*') ? 'active' : '' }}">Flyer</a>
                    <a href="{{ route('admin.settings.edit') }}" class="admin-pill {{ request()->routeIs('admin.settings.*') ? 'active' : '' }}">Config</a>
                </nav>
            </header>
            <main class="flex-1 px-4 py-6">
                @yield('content')
            </main>
        </div>
        <div id="toast-root" data-message="{{ session('toast') }}"></div>
        @stack('scripts')
    </body>
</html>
