@extends('layouts.admin')

@section('content')
    <div id="moderation-deck" data-photo='@json($photo)' data-endpoint="{{ route('admin.moderation.next') }}" data-approve="{{ route('admin.moderation.approve', ['photo' => '__ID__']) }}" data-reject="{{ route('admin.moderation.reject', ['photo' => '__ID__']) }}" class="space-y-6">
        <div class="space-y-2">
            <h1 class="text-2xl font-semibold">Moderación tipo swipe</h1>
            <p class="text-sm text-boho-brown/70">Desliza a la derecha para aprobar, izquierda para rechazar. También puedes usar los botones.</p>
        </div>

        <div class="moderation-card relative overflow-hidden rounded-3xl bg-cream shadow-soft">
            <div class="swipe-indicator swipe-approve">Aprobar</div>
            <div class="swipe-indicator swipe-reject">Rechazar</div>
            <img id="moderation-image" src="{{ $photo['image_url'] ?? '' }}" alt="Foto pendiente" class="w-full h-[420px] object-cover">
            <div class="p-4 text-sm text-center text-boho-brown/70" id="moderation-meta">
                @if ($photo)
                    Subida {{ $photo['created_at'] }}
                @else
                    No hay fotos pendientes. 🎉
                @endif
            </div>
        </div>

        <div class="flex gap-4">
            <button class="btn-danger flex-1" data-action="reject">Rechazar</button>
            <button class="btn-primary flex-1" data-action="approve">Aprobar</button>
        </div>
    </div>
@endsection
