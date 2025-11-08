<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ModerationController extends Controller
{
    public function index()
    {
        return view('admin.moderation.index', [
            'photo' => $this->transformPhoto($this->nextPhoto()),
        ]);
    }

    public function next(): JsonResponse
    {
        return response()->json([
            'photo' => $this->transformPhoto($this->nextPhoto()),
        ]);
    }

    public function approve(Photo $photo): JsonResponse
    {
        $this->ensurePending($photo);

        $photo->update([
            'status' => Photo::STATUS_APPROVED,
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        return $this->next();
    }

    public function reject(Photo $photo): JsonResponse
    {
        $this->ensurePending($photo);

        $photo->update([
            'status' => Photo::STATUS_REJECTED,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        return $this->next();
    }

    private function ensurePending(Photo $photo): void
    {
        abort_if($photo->status !== Photo::STATUS_PENDING, 409, 'La foto ya fue moderada.');
    }

    private function nextPhoto(): ?Photo
    {
        return Photo::pending()->oldest()->first();
    }

    private function transformPhoto(?Photo $photo): ?array
    {
        if (! $photo) {
            return null;
        }

        return [
            'id' => $photo->id,
            'image_url' => Storage::disk('public')->url($photo->image_path),
            'created_at' => $photo->created_at->diffForHumans(),
        ];
    }
}
