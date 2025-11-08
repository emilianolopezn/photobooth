@php
    use Illuminate\Support\Facades\Storage;
@endphp

@extends('layouts.admin')

@section('content')
    <div class="space-y-4">
        <div>
            <h1 class="text-2xl font-semibold">Editar sticker</h1>
            <p class="text-sm text-boho-brown/70">Actualiza nombre, estado o reemplaza el PNG.</p>
        </div>

        <form action="{{ route('admin.stickers.update', $sticker) }}" method="POST" enctype="multipart/form-data" class="card space-y-4">
            @csrf
            @method('PUT')
            <div class="space-y-2">
                <label class="form-label" for="name">Nombre</label>
                <input class="form-input" name="name" id="name" value="{{ old('name', $sticker->name) }}" required>
                @error('name')
                    <p class="form-error">{{ $message }}</p>
                @enderror
            </div>

            <div class="space-y-2">
                <label class="form-label" for="file">Reemplazar PNG (opcional)</label>
                <input class="form-input" type="file" name="file" id="file" accept="image/png">
                @error('file')
                    <p class="form-error">{{ $message }}</p>
                @enderror
            </div>

            <label class="inline-flex items-center gap-2 text-sm text-boho-brown/80">
                <input type="checkbox" name="is_active" value="1" class="rounded border-beige text-terracotta focus:ring-terracotta" {{ old('is_active', $sticker->is_active) ? 'checked' : '' }}>
                Mostrar a invitados
            </label>

            <img src="{{ Storage::disk('public')->url($sticker->file_path) }}" alt="{{ $sticker->name }}" class="w-full aspect-square object-contain rounded-xl bg-cream/60 p-6">

            <div class="flex gap-3">
                <a class="btn-secondary flex-1 text-center" href="{{ route('admin.stickers.index') }}">Cancelar</a>
                <button class="btn-primary flex-1" type="submit">Actualizar</button>
            </div>
        </form>
    </div>
@endsection
