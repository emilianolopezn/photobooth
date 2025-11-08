@php
    use Illuminate\Support\Facades\Storage;
@endphp
@extends('layouts.admin')

@section('content')
    <div class="flex items-center justify-between mb-4">
        <div>
            <h1 class="text-2xl font-semibold">Stickers</h1>
            <p class="text-sm text-boho-brown/70">Administra los elementos decorativos para el editor.</p>
        </div>
        <a href="{{ route('admin.stickers.create') }}" class="btn-primary">Nuevo</a>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        @forelse ($stickers as $sticker)
            <div class="card space-y-3">
                <img src="{{ Storage::disk('public')->url($sticker->file_path) }}" alt="{{ $sticker->name }}" class="w-full aspect-square object-contain rounded-xl bg-cream/60 p-6">
                <div>
                    <p class="font-medium">{{ $sticker->name }}</p>
                    <p class="text-xs uppercase tracking-widest text-boho-brown/60">
                        {{ $sticker->is_active ? 'Activo' : 'Oculto' }}
                    </p>
                </div>
                <div class="flex gap-2 text-sm">
                    <a class="btn-secondary flex-1 text-center" href="{{ route('admin.stickers.edit', $sticker) }}">Editar</a>
                    <form method="POST" action="{{ route('admin.stickers.destroy', $sticker) }}" onsubmit="return confirm('¿Eliminar sticker?');">
                        @csrf
                        @method('DELETE')
                        <button class="btn-danger">Borrar</button>
                    </form>
                </div>
            </div>
        @empty
            <p class="text-boho-brown/70">Aún no hay stickers. ¡Agrega uno!</p>
        @endforelse
    </div>
@endsection
