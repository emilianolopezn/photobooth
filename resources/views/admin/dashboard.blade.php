@extends('layouts.admin')

@section('content')
    <section class="space-y-4">
        <div class="space-y-1">
            <p class="text-sm text-boho-brown/70 uppercase tracking-[0.3em]">Bienvenida</p>
            <h1 class="text-2xl font-semibold">Panel general</h1>
            <p class="text-boho-brown/70">Gestiona stickers, aprueba fotos y comparte el flyer boho chic.</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="metric-card">
                <p class="metric-label">Totales</p>
                <p class="metric-value">{{ $metrics['total'] }}</p>
            </div>
            <div class="metric-card">
                <p class="metric-label">Pendientes</p>
                <p class="metric-value text-orange-500">{{ $metrics['pending'] }}</p>
            </div>
            <div class="metric-card">
                <p class="metric-label">Aprobadas</p>
                <p class="metric-value text-emerald-500">{{ $metrics['approved'] }}</p>
            </div>
            <div class="metric-card">
                <p class="metric-label">Rechazadas</p>
                <p class="metric-value text-rose-500">{{ $metrics['rejected'] }}</p>
            </div>
        </div>

        <div class="card space-y-3">
            <p class="font-medium">Siguiente paso rápido</p>
            <div class="flex gap-3 overflow-x-auto">
                <a href="{{ route('admin.moderation.index') }}" class="chip">Moderar</a>
                <a href="{{ route('admin.stickers.index') }}" class="chip">Stickers</a>
                <a href="{{ route('admin.flyer.show') }}" class="chip">Flyer</a>
                <a href="{{ route('admin.settings.edit') }}" class="chip">Config</a>
            </div>
        </div>
    </section>
@endsection
