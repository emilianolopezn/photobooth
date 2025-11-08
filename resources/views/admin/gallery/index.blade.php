@php
    use Illuminate\Support\Facades\Storage;
@endphp

@extends('layouts.admin')

@section('content')
    <div class="space-y-6">
        <div>
            <h1 class="text-2xl font-semibold">Galería admin</h1>
            <p class="text-sm text-boho-brown/70">Filtra y busca fotos por estado o fecha.</p>
        </div>

        <form method="GET" class="card grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
                <label class="form-label text-xs uppercase" for="status">Estado</label>
                <select class="form-input" name="status" id="status">
                    @foreach (['all' => 'Todos', 'pending' => 'Pendientes', 'approved' => 'Aprobadas', 'rejected' => 'Rechazadas'] as $value => $label)
                        <option value="{{ $value }}" @selected($filters['status'] === $value)>{{ $label }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="form-label text-xs uppercase" for="date">Fecha</label>
                <input class="form-input" type="date" name="date" id="date" value="{{ $filters['date'] }}">
            </div>
            <div class="flex items-end">
                <button class="btn-primary w-full" type="submit">Aplicar</button>
            </div>
        </form>

        <div class="grid grid-cols-3 gap-2">
            @forelse ($photos as $photo)
                <div class="relative group">
                    <img src="{{ Storage::disk('public')->url($photo->thumb_path ?? $photo->image_path) }}" alt="Foto {{ $photo->id }}" class="w-full aspect-square object-cover rounded-2xl">
                    <span class="status-pill status-{{ $photo->status }}">{{ ucfirst($photo->status) }}</span>
                </div>
            @empty
                <p class="text-boho-brown/70">No hay fotos para los filtros seleccionados.</p>
            @endforelse
        </div>

        {{ $photos->links() }}
    </div>
@endsection
