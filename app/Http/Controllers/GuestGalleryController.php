<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuestGalleryController extends Controller
{
    public function redirect()
    {
        $settings = Setting::current();

        return redirect()->route('guest.gallery', ['guestSlug' => $settings->guest_url_slug]);
    }

    public function index(Request $request, string $guestSlug)
    {
        $settings = Setting::current();

        abort_unless($guestSlug === $settings->guest_url_slug, 404);

        $photosQuery = Photo::query()->latest();

        if ($settings->approval_required) {
            $photosQuery->approved();
        } else {
            $photosQuery->where('status', '!=', Photo::STATUS_REJECTED);
        }

        $photos = $photosQuery->paginate(30);

        if ($request->wantsJson()) {
            $items = $photos->map(fn (Photo $photo) => [
                'id' => $photo->id,
                'thumb' => Storage::disk('public')->url($photo->thumb_path ?? $photo->image_path),
                'full' => Storage::disk('public')->url($photo->image_path),
                'type' => $photo->media_type,
            ]);

            return response()->json([
                'photos' => $items,
                'next_page_url' => $photos->hasMorePages() ? $photos->nextPageUrl() : null,
            ]);
        }

        return view('guest.gallery', [
            'settings' => $settings,
            'photos' => $photos,
            'nextPageUrl' => $photos->hasMorePages() ? $photos->nextPageUrl() : null,
        ]);
    }
}
