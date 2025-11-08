@extends('layouts.mobile')

@section('content')
    <div class="space-y-8">
        <div class="text-center space-y-2">
            <p class="text-sm uppercase tracking-[0.3em] text-sage">Panel Admin</p>
            <h1 class="text-3xl font-semibold">Photo Booth</h1>
            <p class="text-boho-brown/70">Inicia sesión para moderar recuerdos y configurar la experiencia.</p>
        </div>

        <form action="{{ route('admin.login.attempt') }}" method="POST" class="card space-y-4">
            @csrf
            <div class="space-y-2">
                <label class="form-label" for="email">Correo</label>
                <input class="form-input" type="email" name="email" id="email" value="{{ old('email') }}" required autofocus>
                @error('email')
                    <p class="form-error">{{ $message }}</p>
                @enderror
            </div>

            <div class="space-y-2">
                <label class="form-label" for="password">Contraseña</label>
                <input class="form-input" type="password" name="password" id="password" required>
                @error('password')
                    <p class="form-error">{{ $message }}</p>
                @enderror
            </div>

            <label class="inline-flex items-center gap-2 text-sm text-boho-brown/80">
                <input type="checkbox" name="remember" value="1" class="rounded border-beige text-terracotta focus:ring-terracotta">
                Recordarme en este dispositivo
            </label>

            <button class="btn-primary w-full" type="submit">Entrar</button>
        </form>
    </div>
@endsection
