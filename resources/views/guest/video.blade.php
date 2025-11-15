@extends('layouts.mobile')

@section('content')
    <section class="space-y-6" id="guest-video-uploader">
        <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.3em] text-sage">Video boho</p>
            <h1 class="text-3xl font-semibold">Comparte un video</h1>
            <p class="text-sm text-boho-brown/70">Captura momentos en movimiento y súbelos a la galería. Formatos permitidos: MP4 o MOV, máximo 256 MB.</p>
        </div>

        <form id="video-form" action="{{ route('guest.video.store', ['guestSlug' => $settings->guest_url_slug]) }}" method="POST" enctype="multipart/form-data" class="space-y-4">
            @csrf
            <div class="card space-y-4">
                <input type="file" accept="video/mp4,video/quicktime" id="video-input" name="video" hidden>

                <div class="grid grid-cols-2 gap-3">
                    <button type="button" class="input-pill" data-video-trigger="camera">Grabar video</button>
                    <button type="button" class="input-pill" data-video-trigger="gallery">Elegir de galería</button>
                </div>

                <video id="video-preview" controls playsinline class="w-full rounded-2xl bg-black/40 aspect-video hidden"></video>
                <p id="video-placeholder" class="text-sm text-center text-boho-brown/60">Selecciona o graba un video para previsualizarlo.</p>
            </div>

            <input type="hidden" name="thumbnail_data" id="video_thumbnail_data">

            <div class="space-y-3">
                <div class="w-full">
                    <div class="h-2 rounded-full bg-cream/60 overflow-hidden">
                        <div id="video-progress-bar" class="h-full w-0 bg-terracotta transition-all duration-300"></div>
                    </div>
                    <p id="video-progress-label" class="mt-1 text-xs text-boho-brown/70 text-right">0%</p>
                </div>
                <div class="flex gap-3">
                    <a href="{{ route('guest.gallery', ['guestSlug' => $settings->guest_url_slug]) }}" class="btn-secondary flex-1 text-center">Cancelar</a>
                    <button type="submit" class="btn-primary flex-1" id="video-submit" disabled>Subir video</button>
                </div>
            </div>

            @error('video')
                <p class="form-error">{{ $message }}</p>
            @enderror
        </form>
    </section>
@endsection
