<?php

namespace App\Http\Controllers;

use App\Models\Penalty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class PenaltyController extends Controller
{
    /**
     * Upload a document for a penalty.
     */
    public function uploadDocument(Request $request)
    {
        $validated = $request->validate([
            'document' => 'required|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png',
            'penalty_type' => 'required|in:first_penalty,second_penalty,third_penalty',
            'establishment_id' => 'required|exists:establishments,id',
            'inspection_id' => 'required|exists:inspections,id',
            'inspection_result_id' => 'nullable|exists:inspection_results,id',
        ]);

        try {
            DB::beginTransaction();

            if ($request->hasFile('document')) {
                $file = $request->file('document');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('penalty-documents', $fileName, 'public');

                // Find existing penalty or create new one
                $penaltyData = [
                    'penalty_type' => $validated['penalty_type'],
                    'establishment_id' => $validated['establishment_id'],
                    'inspection_id' => $validated['inspection_id'],
                    'document_path' => $filePath,
                    'document_name' => $fileName,
                ];

                // Only add inspection_result_id if it's provided
                if (!empty($validated['inspection_result_id'])) {
                    $penaltyData['inspection_result_id'] = $validated['inspection_result_id'];
                }

                $penalty = Penalty::updateOrCreate(
                    [
                        'penalty_type' => $validated['penalty_type'],
                        'establishment_id' => $validated['establishment_id'],
                        'inspection_id' => $validated['inspection_id'],
                    ],
                    $penaltyData
                );

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Document uploaded successfully',
                    'document' => [
                        'id' => $penalty->id,
                        'name' => $fileName,
                        'path' => $filePath,
                        'url' => asset('storage/' . $filePath),
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No file provided'
            ], 400);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get penalties for an inspection result.
     */
    public function getByInspectionResult($inspectionResultId)
    {
        $penalties = Penalty::where('inspection_result_id', $inspectionResultId)
            ->orderBy('penalty_type')
            ->get()
            ->groupBy('penalty_type');

        return response()->json([
            'success' => true,
            'penalties' => $penalties
        ]);
    }

    /**
     * Update penalty details.
     */
    public function updatePenalty(Request $request, Penalty $penalty)
    {
        $validated = $request->validate([
            'description' => 'nullable|string',
            'amount' => 'nullable|numeric|min:0',
        ]);

        $penalty->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Penalty updated successfully',
            'penalty' => $penalty
        ]);
    }

    /**
     * Update penalty status.
     */
    public function updateStatus(Request $request, Penalty $penalty)
    {
        $validated = $request->validate([
            'status' => 'required|in:unpaid,pending,paid',
        ]);

        try {
            $penalty->update(['status' => $validated['status']]);

            return response()->json([
                'success' => true,
                'message' => "Penalty status updated to {$validated['status']}",
                'penalty' => $penalty
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update penalty status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a penalty document.
     */
    public function deleteDocument(Penalty $penalty)
    {
        try {
            DB::beginTransaction();

            // Delete file from storage
            if ($penalty->document_path) {
                Storage::disk('public')->delete($penalty->document_path);
            }

            // Update penalty to remove document reference
            $penalty->update([
                'document_path' => null,
                'document_name' => null,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
