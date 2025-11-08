<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use Illuminate\Http\Request;

class AdminGalleryController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->input('status', 'all');
        $date = $request->input('date');
        if ($date && ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $date = null;
        }

        if (! in_array($status, ['all', 'pending', 'approved', 'rejected'])) {
            $status = 'all';
        }

        $photos = Photo::query()
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->when($date, fn ($query) => $query->whereDate('created_at', $date))
            ->latest()
            ->paginate(30)
            ->withQueryString();

        return view('admin.gallery.index', [
            'photos' => $photos,
            'filters' => [
                'status' => $status,
                'date' => $date,
            ],
        ]);
    }
}
