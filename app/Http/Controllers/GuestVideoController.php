<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GuestVideoController extends Controller
{
    public function create(string $guestSlug)
    {
        $settings = Setting::current();

        abort_unless($guestSlug === $settings->guest_url_slug, 404);

        return view('guest.video', [
            'settings' => $settings,
        ]);
    }

    public function store(Request $request, string $guestSlug)
    {
        $settings = Setting::current();

        abort_unless($guestSlug === $settings->guest_url_slug, 404);

        $validated = $request->validate([
            'video' => ['required', 'file', 'mimetypes:video/mp4,video/quicktime', 'max:262144'],
            'thumbnail_data' => ['nullable', 'string'],
        ]);

        $file = $request->file('video');
        $directory = 'videos/' . now()->format('Y/m');
        $disk = Storage::disk('public');
        $disk->makeDirectory($directory);

        $extension = strtolower($file->getClientOriginalExtension()) ?: 'mp4';
        $filename = Str::ulid() . '.' . $extension;
        $path = $file->storeAs($directory, $filename, 'public');

        $thumbPath = null;
        if (! empty($validated['thumbnail_data'])) {
            $thumbBinary = $this->decodeDataUrl($validated['thumbnail_data']);
            $thumbPath = $directory . '/thumb_' . Str::ulid() . '.jpg';
            $disk->put($thumbPath, $thumbBinary);
        }

        $status = $settings->approval_required ? Photo::STATUS_PENDING : Photo::STATUS_APPROVED;

        $photo = Photo::create([
            'user_id' => Auth::id(),
            'image_path' => $path,
            'thumb_path' => $thumbPath,
            'video_path' => $path,
            'media_type' => Photo::TYPE_VIDEO,
            'status' => $status,
            'applied_filters' => null,
            'overlays' => null,
        ]);

        if ($status === Photo::STATUS_APPROVED) {
            $photo->update([
                'approved_at' => now(),
                'approved_by' => Auth::id(),
            ]);
        }

        return redirect()
            ->route('guest.gallery', ['guestSlug' => $settings->guest_url_slug])
            ->with('toast', '¡Video enviado! ' . ($settings->approval_required ? 'Espera la aprobación.' : 'Ya es visible en la galería.'));
    }

    private function decodeDataUrl(string $dataUrl): string
    {
        if (! str_contains($dataUrl, ',')) {
            abort(422, 'Formato de thumbnail inválido.');
        }

        [$header, $data] = explode(',', $dataUrl, 2);

        abort_unless(str_starts_with($header, 'data:image'), 422, 'Formato de thumbnail inválido.');

        $binary = base64_decode($data, true);

        abort_unless($binary !== false, 422, 'No se pudo procesar el thumbnail.');

        return $binary;
    }
}
