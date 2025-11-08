@extends('layouts.admin')

@section('content')
    <div class="space-y-6 max-w-xl">
        <div>
            <h1 class="text-2xl font-semibold">Configuración</h1>
            <p class="text-sm text-boho-brown/70">Controla lo que ven los invitados y el contenido del flyer.</p>
        </div>

        <form action="{{ route('admin.settings.update') }}" method="POST" class="card space-y-4">
            @csrf
            @method('PUT')

            <label class="switch">
                <input type="checkbox" name="gallery_active" value="1" {{ old('gallery_active', $settings->gallery_active) ? 'checked' : '' }}>
                <span>
                    Galería pública activa
                    <small>Si lo apagas, los invitados verán el mensaje de “Vuelve más tarde”.</small>
                </span>
            </label>

            <label class="switch">
                <input type="checkbox" name="approval_required" value="1" {{ old('approval_required', $settings->approval_required) ? 'checked' : '' }}>
                <span>
                    Requiere aprobación
                    <small>Si lo desactivas, cada foto se aprueba automáticamente.</small>
                </span>
            </label>

            <div class="space-y-2">
                <label class="form-label" for="event_title">Nombre del evento</label>
                <input class="form-input" id="event_title" name="event_title" value="{{ old('event_title', $settings->event_title) }}" required>
                @error('event_title')
                    <p class="form-error">{{ $message }}</p>
                @enderror
            </div>

            <div class="space-y-2">
                <label class="form-label" for="flyer_message">Mensaje del flyer</label>
                <textarea class="form-input min-h-[120px]" id="flyer_message" name="flyer_message" required>{{ old('flyer_message', $settings->flyer_message) }}</textarea>
                @error('flyer_message')
                    <p class="form-error">{{ $message }}</p>
                @enderror
            </div>

            <div class="space-y-2">
                <label class="form-label" for="guest_url_slug">Slug invitados</label>
                <input class="form-input" id="guest_url_slug" name="guest_url_slug" value="{{ old('guest_url_slug', $settings->guest_url_slug) }}" required>
                <p class="text-xs text-boho-brown/60">URL final: {{ url('/') }}/<span data-slug>{{ $settings->guest_url_slug }}</span></p>
                @error('guest_url_slug')
                    <p class="form-error">{{ $message }}</p>
                @enderror
            </div>

            <button class="btn-primary w-full" type="submit">Guardar</button>
        </form>
    </div>
@endsection
