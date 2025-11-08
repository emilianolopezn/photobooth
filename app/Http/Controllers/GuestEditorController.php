<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\Setting;
use App\Models\Sticker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class GuestEditorController extends Controller
{
    public function create(string $guestSlug)
    {
        $settings = Setting::current();

        abort_unless($guestSlug === $settings->guest_url_slug, 404);

        return view('guest.editor', [
            'settings' => $settings,
            'stickers' => Sticker::active()->get(),
        ]);
    }

    public function store(Request $request, string $guestSlug)
    {
        $settings = Setting::current();

        abort_unless($guestSlug === $settings->guest_url_slug, 404);

        $validated = $request->validate([
            'image_data' => ['required', 'string'],
            'applied_filters' => ['nullable', 'string'],
            'overlay_json' => ['nullable', 'string'],
        ]);

        $binaryImage = $this->decodeDataUrl($validated['image_data']);

        $directory = 'photos/' . now()->format('Y/m');
        $filename = Str::ulid() . '.png';
        $path = $directory . '/' . $filename;
        $thumbPath = $directory . '/thumb_' . $filename;

        $disk = Storage::disk('public');
        $disk->makeDirectory($directory);

        $image = Image::read($binaryImage);
        $disk->put($path, $image->toPng()->toString());

        $thumb = Image::read($binaryImage)->cover(600, 600);
        $disk->put($thumbPath, $thumb->toPng()->toString());

        $status = $settings->approval_required ? Photo::STATUS_PENDING : Photo::STATUS_APPROVED;

        $photo = Photo::create([
            'user_id' => Auth::id(),
            'image_path' => $path,
            'thumb_path' => $thumbPath,
            'status' => $status,
            'applied_filters' => $this->decodeJson($validated['applied_filters'] ?? null),
            'overlays' => $this->decodeJson($validated['overlay_json'] ?? null),
        ]);

        if ($status === Photo::STATUS_APPROVED) {
            $photo->update([
                'approved_at' => now(),
                'approved_by' => Auth::id(),
            ]);
        }

        $message = $settings->approval_required
            ? '¡Foto enviada! Espera a que el equipo la apruebe.'
            : '¡Foto enviada! Ya es visible en la galería.';

        return redirect()
            ->route('guest.gallery', ['guestSlug' => $settings->guest_url_slug])
            ->with('toast', $message);
    }

    private function decodeDataUrl(string $dataUrl): string
    {
        if (! str_contains($dataUrl, ',')) {
            abort(422, 'Formato de imagen inválido.');
        }

        [$header, $data] = explode(',', $dataUrl, 2);

        abort_unless(str_starts_with($header, 'data:image'), 422, 'Formato de imagen inválido.');

        $binary = base64_decode($data, true);

        abort_unless($binary !== false, 422, 'No se pudo leer la imagen.');

        abort_if(strlen($binary) > 8 * 1024 * 1024, 422, 'La imagen excede 8MB.');

        return $binary;
    }

    private function decodeJson(?string $data): ?array
    {
        if (! $data) {
            return null;
        }

        return json_decode($data, true) ?: null;
    }
}
