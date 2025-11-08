@extends('layouts.admin')

@section('content')
    <div class="space-y-4">
        <div>
            <h1 class="text-2xl font-semibold">Nuevo sticker</h1>
            <p class="text-sm text-boho-brown/70">Sube un PNG ligero con transparencia.</p>
        </div>

        <form action="{{ route('admin.stickers.store') }}" method="POST" enctype="multipart/form-data" class="card space-y-4">
            @csrf
            <div class="space-y-2">
                <label class="form-label" for="name">Nombre</label>
                <input class="form-input" name="name" id="name" value="{{ old('name') }}" required>
                @error('name')
                    <p class="form-error">{{ $message }}</p>
                @enderror
            </div>

            <div class="space-y-2">
                <label class="form-label" for="file">PNG</label>
                <input class="form-input" type="file" name="file" id="file" accept="image/png" required>
                @error('file')
                    <p class="form-error">{{ $message }}</p>
                @enderror
            </div>

            <label class="inline-flex items-center gap-2 text-sm text-boho-brown/80">
                <input type="checkbox" name="is_active" value="1" checked class="rounded border-beige text-terracotta focus:ring-terracotta">
                Mostrar a invitados
            </label>

            <div class="flex gap-3">
                <a class="btn-secondary flex-1 text-center" href="{{ route('admin.stickers.index') }}">Cancelar</a>
                <button class="btn-primary flex-1" type="submit">Guardar</button>
            </div>
        </form>
    </div>
@endsection
