<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\Setting;
use Illuminate\Http\Request;

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

        $photos = $photosQuery->get();

        return view('guest.gallery', [
            'settings' => $settings,
            'photos' => $photos,
        ]);
    }
}
