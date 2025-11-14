<?php

use App\Http\Controllers\Admin\AdminGalleryController;
use App\Http\Controllers\Admin\Auth\LoginController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FlyerController;
use App\Http\Controllers\Admin\ModerationController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\StickerController;
use App\Http\Controllers\GuestEditorController;
use App\Http\Controllers\GuestGalleryController;
use App\Http\Controllers\GuestVideoController;
use Illuminate\Support\Facades\Route;

Route::get('/', [GuestGalleryController::class, 'redirect'])->name('guest.redirect');

Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('login', [LoginController::class, 'showLoginForm'])->name('login');
        Route::post('login', [LoginController::class, 'login'])->name('login.attempt');
    });

    Route::middleware('auth')->group(function () {
        Route::post('logout', [LoginController::class, 'logout'])->name('logout');
    });

    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/', DashboardController::class)->name('dashboard');

        Route::resource('stickers', StickerController::class)->except(['show']);

        Route::get('flyer', [FlyerController::class, 'show'])->name('flyer.show');
        Route::get('flyer/descargar', [FlyerController::class, 'download'])->name('flyer.download');

        Route::get('moderar', [ModerationController::class, 'index'])->name('moderation.index');
        Route::get('moderar/next', [ModerationController::class, 'next'])->name('moderation.next');
        Route::post('moderar/{photo}/approve', [ModerationController::class, 'approve'])->name('moderation.approve');
        Route::post('moderar/{photo}/reject', [ModerationController::class, 'reject'])->name('moderation.reject');

        Route::get('configuracion', [SettingsController::class, 'edit'])->name('settings.edit');
        Route::put('configuracion', [SettingsController::class, 'update'])->name('settings.update');

        Route::get('galeria', [AdminGalleryController::class, 'index'])->name('gallery.index');
    });
});

$guestConstraint = '^(?!(admin|up|api)$)[A-Za-z0-9\-]+$';

Route::get('/{guestSlug}', [GuestGalleryController::class, 'index'])
    ->where('guestSlug', $guestConstraint)
    ->name('guest.gallery');

Route::get('/{guestSlug}/editor', [GuestEditorController::class, 'create'])
    ->where('guestSlug', $guestConstraint)
    ->name('guest.editor');

Route::post('/{guestSlug}/foto', [GuestEditorController::class, 'store'])
    ->where('guestSlug', $guestConstraint)
    ->name('guest.photo.store');

Route::get('/{guestSlug}/video', [GuestVideoController::class, 'create'])
    ->where('guestSlug', $guestConstraint)
    ->name('guest.video');

Route::post('/{guestSlug}/video', [GuestVideoController::class, 'store'])
    ->where('guestSlug', $guestConstraint)
    ->name('guest.video.store');
