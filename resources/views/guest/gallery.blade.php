@php
    use Illuminate\Support\Facades\Storage;
@endphp

@extends('layouts.mobile')

@section('content')
    <section class="space-y-6">
        <div class="rounded-3xl bg-gradient-to-br from-terracotta/90 to-brown/90 p-6 text-cream shadow-soft">
            <p class="text-xs uppercase tracking-[0.3em] text-cream/80">Photo Booth</p>
            <h1 class="text-3xl font-semibold mt-2">{{ $settings->event_title }}</h1>
            <p class="mt-4 text-sm">Construyamos juntos un jardín de recuerdos: compartan sus fotografías para que cada mirada, cada risa y cada abrazo se unan en un mismo álbum de eternidad. (Sube las fotos, ¡no te hagas wey!)</p>
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
                    <p class="text-xs text-boho-brown/60">{{ $photos->count() }} fotos</p>
                </div>
                <div class="grid grid-cols-3 gap-1">
                    @forelse ($photos as $photo)
                        @php
                            $fullUrl = Storage::disk('public')->url($photo->image_path);
                            $thumbUrl = Storage::disk('public')->url($photo->thumb_path ?? $photo->image_path);
                        @endphp
                        <button type="button" class="gallery-thumb" data-full-image="{{ $fullUrl }}" aria-label="Ver foto completa">
                            <img src="{{ $thumbUrl }}" alt="Foto {{ $photo->id }}" loading="lazy" class="aspect-square object-cover rounded-xl shadow-soft">
                        </button>
                    @empty
                        <p class="col-span-3 text-center text-sm text-boho-brown/70 py-6">Aún no hay fotos. ¡Sé la primera persona en compartir!</p>
                    @endforelse
                </div>
            </div>
        @endif
    </section>

    <div id="gallery-lightbox" class="gallery-overlay hidden">
        <button type="button" id="gallery-lightbox-close" class="gallery-close" aria-label="Cerrar galería">
            <span>&times;</span>
        </button>
        <div class="gallery-overlay-content">
            <img id="gallery-lightbox-img" src="" alt="Foto seleccionada" class="gallery-full-image">
        </div>
    </div>

    <a href="{{ route('guest.editor', ['guestSlug' => $settings->guest_url_slug]) }}" class="fab" aria-label="Abrir editor">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 7v10a2 2 0 002 2z" />
        </svg>
    </a>
@endsection
