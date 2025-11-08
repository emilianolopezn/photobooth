<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Photo;

class DashboardController extends Controller
{
    public function __invoke()
    {
        return view('admin.dashboard', [
            'metrics' => [
                'total' => Photo::count(),
                'pending' => Photo::pending()->count(),
                'approved' => Photo::where('status', Photo::STATUS_APPROVED)->count(),
                'rejected' => Photo::where('status', Photo::STATUS_REJECTED)->count(),
            ],
        ]);
    }
}
