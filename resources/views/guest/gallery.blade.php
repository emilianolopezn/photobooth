@php
    use App\Models\Photo;
    use Illuminate\Support\Facades\Storage;
@endphp

@extends('layouts.mobile')

@section('content')
    <section class="space-y-6">
        <div class="rounded-3xl bg-gradient-to-br from-terracotta/90 to-brown/90 p-6 text-cream shadow-soft">
            <p class="text-xs uppercase tracking-[0.3em] text-cream/80">15/nov/2025</p>
            <h1 class="text-3xl font-semibold mt-2">{{ $settings->event_title }}</h1>
            <p class="mt-4 text-sm">Comparte las fotografías y videos que captaste en nuestra boda para juntos poder recordar este día tan especial.</p>
        </div>

        @if (! $settings->gallery_active)
            <div class="card text-center space-y-4">
                <p class="text-lg font-semibold">Vuelve más tarde…</p>
                <p class="text-sm text-boho-brown/70">La galería estará disponible pronto. Mientras tanto, puedes guardar el acceso en tus marcadores.</p>
                <button class="btn-secondary w-full" data-bookmark> Añadir a marcadores </button>
                <p class="text-xs text-boho-brown/60 hidden" id="bookmark-tip">iOS: comparte → “Agregar a pantalla de inicio”. Android: menú ⋮ → “Instalar app”.</p>
            </div>
        @else
            <div>
                <div class="flex items-center justify-between mb-3">
                    <p class="font-semibold">Galería de invitados</p>
                    <p class="text-xs text-boho-brown/60">{{ $photos->total() }} fotos</p>
                </div>
                <div id="gallery-grid" class="grid grid-cols-3 gap-1" data-next-page="{{ $nextPageUrl }}">
                    @forelse ($photos as $photo)
                        @php
                            $fullUrl = Storage::disk('public')->url($photo->image_path);
                            $thumbUrl = Storage::disk('public')->url($photo->thumb_path ?? $photo->image_path);
                        @endphp
                        <button type="button" class="gallery-thumb" data-full-src="{{ $fullUrl }}" data-media-type="{{ $photo->media_type }}" aria-label="Ver elemento completo">
                            <img src="{{ $thumbUrl }}" alt="Foto {{ $photo->id }}" loading="lazy" class="aspect-square object-cover rounded-xl shadow-soft">
                            @if ($photo->media_type === Photo::TYPE_VIDEO)
                                <span class="gallery-play-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </span>
                            @endif
                        </button>
                    @empty
                        <p class="col-span-3 text-center text-sm text-boho-brown/70 py-6">Aún no hay fotos. ¡Sé la primera persona en compartir!</p>
                    @endforelse
                </div>
                <div id="gallery-loader" class="mt-4 text-center text-sm text-boho-brown/70 hidden">
                    Cargando más recuerdos…
                </div>
            </div>
        @endif
    </section>

    <div id="gallery-lightbox" class="gallery-overlay hidden">
        <button type="button" id="gallery-lightbox-close" class="gallery-close" aria-label="Cerrar galería">
            <span>&times;</span>
        </button>
        <button type="button" id="gallery-prev" class="gallery-nav gallery-nav-prev" aria-label="Foto anterior">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        <button type="button" id="gallery-next" class="gallery-nav gallery-nav-next" aria-label="Foto siguiente">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
            </svg>
        </button>
        <div class="gallery-overlay-content">
            <img id="gallery-lightbox-img" src="" alt="Foto seleccionada" class="gallery-full-image">
            <video id="gallery-lightbox-video" controls playsinline class="gallery-full-image hidden"></video>
            <a id="gallery-download-btn" href="#" download class="gallery-download-btn mt-6">Descargar archivo</a>
            <p id="gallery-counter" class="gallery-counter mt-2">1/1</p>
        </div>
    </div>

    <a href="{{ route('guest.video', ['guestSlug' => $settings->guest_url_slug]) }}" class="fab fab-video" aria-label="Agregar video">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 7h8a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10v4M6 12h4" />
        </svg>
    </a>

    <a href="{{ route('guest.editor', ['guestSlug' => $settings->guest_url_slug]) }}" class="fab fab-photo" aria-label="Agregar foto">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 7h2l1-2h6l1 2h2a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 10v6M9 13h6" />
        </svg>
    </a>
@endsection
