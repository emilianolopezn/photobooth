@php
    use Illuminate\Support\Facades\Storage;
@endphp

@extends('layouts.mobile')

@section('content')
    <section class="space-y-6" id="guest-editor">
        <div class="space-y-2">
            <p class="text-xs uppercase tracking-[0.3em] text-sage">Evelyn & Emiliano</p>
            <h1 class="text-3xl font-semibold">Comparte tu foto</h1>
            <p class="text-sm text-boho-brown/70">Elige una foto y si gustas, aplica filtros, stickers y texto.</p>
        </div>

        <form id="editor-form" action="{{ route('guest.photo.store', ['guestSlug' => $settings->guest_url_slug]) }}" method="POST" class="space-y-4">
            @csrf
            <div class="card space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <label class="input-pill">
                        <input type="file" accept="image/*" capture="environment" id="camera-input" hidden>
                        <span>Tomar foto</span>
                    </label>
                    <label class="input-pill">
                        <input type="file" accept="image/*" id="gallery-input" hidden>
                        <span>Elegir del álbum</span>
                    </label>
                </div>
                <div id="editor-stage" class="w-full rounded-2xl bg-cream/70 min-h-[420px]"></div>
            </div>

            <input type="hidden" name="image_data" id="image_data">
            <input type="hidden" name="overlay_json" id="overlay_json">
            <input type="hidden" name="applied_filters" id="applied_filters">
            <input type="hidden" name="thumb_data" id="thumb_data">
            @error('image_data')
                <p class="form-error">{{ $message }}</p>
            @enderror

            <div class="card space-y-4">
                <div class="tab-buttons" role="tablist">
                    <button type="button" class="tab-button active" data-tab="filters">Filtros</button>
                    <button type="button" class="tab-button" data-tab="stickers">Stickers</button>
                    <button type="button" class="tab-button" data-tab="text">Texto</button>
                </div>

                <div class="tab-panel" data-panel="filters">
                    <div class="flex gap-2 overflow-x-auto">
                        @foreach ([
                            ['label' => 'Original', 'filter' => 'none'],
                            ['label' => 'Sepia', 'filter' => 'sepia'],
                            ['label' => 'Blanco y Negro', 'filter' => 'grayscale'],
                            ['label' => 'Realce', 'filter' => 'enhance'],
                            ['label' => 'Vintage', 'filter' => 'vintage'],
                        ] as $filter)
                            <button type="button" class="chip {{ $loop->first ? 'active' : '' }}" data-filter="{{ $filter['filter'] }}">{{ $filter['label'] }}</button>
                        @endforeach
                    </div>
                </div>

                <div class="tab-panel hidden" data-panel="stickers">
                    <div class="flex gap-3 overflow-x-auto pb-2">
                        @forelse ($stickers as $sticker)
                            <button class="sticker-pill" type="button" data-sticker="{{ Storage::disk('public')->url($sticker->file_path) }}">
                                <img src="{{ Storage::disk('public')->url($sticker->file_path) }}" alt="{{ $sticker->name }}">
                                <span>{{ $sticker->name }}</span>
                            </button>
                        @empty
                            <p class="text-sm text-boho-brown/70">No hay stickers activos.</p>
                        @endforelse
                    </div>
                </div>

                <div class="tab-panel hidden" data-panel="text">
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <label class="form-label text-xs uppercase" for="text-input">Contenido</label>
                            <input class="form-input" id="text-input" placeholder="Escribe algo lindo">
                        </div>
                        <div class="flex gap-2 flex-wrap">
                            @foreach (['#C86B5A', '#EADAC1', '#9BAE93', '#FAF6F1', '#8C6A5D'] as $color)
                                <button type="button" class="color-dot {{ $loop->first ? 'active' : '' }}" style="background: {{ $color }}" data-color="{{ $color }}"></button>
                            @endforeach
                        </div>
                        <div class="space-y-1">
                            <label class="form-label text-xs uppercase">Color de borde</label>
                            <div class="flex gap-2 flex-wrap">
                                <button type="button" class="color-dot border-dot active" data-stroke="none">/</button>
                                @foreach (['#FFFFFF', '#C86B5A', '#EADAC1', '#9BAE93', '#8C6A5D', '#000000'] as $color)
                                    <button type="button" class="color-dot border-dot" style="background: {{ $color }}" data-stroke="{{ $color }}"></button>
                                @endforeach
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button type="button" class="btn-secondary flex-1" data-action="add-text">Agregar texto</button>
                            <button type="button" class="btn-secondary flex-1" data-action="clear-text">Limpiar textos</button>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3">
                    <button type="button" class="btn-secondary flex-1" data-action="reset-canvas">Reset</button>
                    <button type="button" class="btn-primary flex-1" data-action="save">Guardar &amp; enviar</button>
                </div>
            </div>
        </form>
    </section>
@endsection
