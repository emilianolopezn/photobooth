@extends('layouts.admin')

@section('content')
    <div class="space-y-6">
        <div>
            <h1 class="text-2xl font-semibold">Flyer con QR</h1>
            <p class="text-sm text-boho-brown/70">Descarga un flyer listo para compartir con tus invitados.</p>
        </div>

        <div class="flyer-preview">
            <div class="flyer-top">
                <p class="flyer-tag">Boho Chic</p>
                <h2>{{ $settings->event_title }}</h2>
                <p class="text-sm text-boho-brown/80 whitespace-pre-line">{{ $settings->flyer_message }}</p>
            </div>
            <div class="flyer-body">
                <img src="data:image/png;base64,{{ $qr }}" alt="QR invitados" class="mx-auto w-40 h-40 object-contain">
                <p class="text-center text-sm mt-4">{{ $guestUrl }}</p>
            </div>
        </div>

        <div class="flex gap-3">
            <a href="{{ route('admin.settings.edit') }}" class="btn-secondary flex-1 text-center">Editar texto</a>
            <a href="{{ route('admin.flyer.download') }}" class="btn-primary flex-1 text-center">Descargar Flyer</a>
        </div>
    </div>
@endsection
