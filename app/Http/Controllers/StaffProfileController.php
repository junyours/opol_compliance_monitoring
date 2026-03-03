<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\StaffSignature;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StaffProfileController extends Controller
{
    /**
     * Display the staff's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $signature = StaffSignature::where('staff_id', $user->id)->first();
        
        return Inertia::render('Staffs/Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'signature' => $signature,
        ]);
    }

    /**
     * Update the staff's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('staff.profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Save digital signature.
     */
    public function saveSignature(Request $request): RedirectResponse
    {
        $request->validate([
            'signature' => 'required|string',
            'signature_type' => 'required|in:drawn,typed,uploaded',
        ]);

        $user = $request->user();
        
        // Update or create signature
        StaffSignature::updateOrCreate(
            ['staff_id' => $user->id],
            [
                'signature' => $request->signature,
                'signature_type' => $request->signature_type,
            ]
        );

        return Redirect::route('staff.profile.edit')->with('status', 'signature-saved');
    }

    /**
     * Delete the staff's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
