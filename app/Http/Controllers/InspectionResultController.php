<?php

namespace App\Http\Controllers;

use App\Models\InspectionResult;
use App\Models\InspectionChecklistResponse;
use App\Models\InspectionUtilityData;
use App\Models\ConditionalFieldResponse;
use App\Models\Inspection;
use App\Models\Establishment;
use App\Models\ChecklistQuestion;
use App\Models\Utility;
use App\Models\InspectionCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Dompdf\Dompdf;
use Dompdf\Options;

class InspectionResultController extends Controller
{
    /**
     * Store a newly created inspection result.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'inspection_id' => 'required|exists:inspections,id',
            'establishment_id' => [
                'required',
                'exists:establishments,id',
                function ($attribute, $value, $fail) use ($request) {
                    // Check if this establishment has already been inspected for this inspection
                    $exists = InspectionResult::where('inspection_id', $request->inspection_id)
                        ->where('establishment_id', $value)
                        ->exists();
                    
                    if ($exists) {
                        $fail('This establishment has already been inspected for this inspection schedule.');
                    }
                }
            ],
            'checklist_responses' => 'required|array',
            'compliance_status' => 'nullable|string|in:compliant,not_compliant',
            'automated_recommendations' => 'nullable|array',
            'checklist_responses.*.question_id' => 'required|exists:checklist_questions,id',
            'checklist_responses.*.response' => 'required|string',
            'checklist_responses.*.notes' => 'nullable|string',
            'checklist_responses.*.remarks' => 'nullable|string',
            'utility_data' => 'nullable|array',
            'conditional_fields' => 'nullable|array',
            'other_remarks' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'recommendation_checks' => 'nullable|array',
            'recommendation_checks.comply_lacking_permits' => 'boolean',
            'recommendation_checks.provide_lacking_facilities' => 'boolean',
            'recommendation_checks.others' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            // Create inspection result
            $inspectionResult = InspectionResult::create([
                'inspection_id' => $validated['inspection_id'],
                'establishment_id' => $validated['establishment_id'],
                'staff_id' => auth()->user()->staff?->id,
                'other_remarks' => $validated['other_remarks'] ?? null,
                'recommendations' => $validated['recommendations'] ?? null,
                'comply_lacking_permits' => $validated['recommendation_checks']['comply_lacking_permits'] ?? false,
                'provide_lacking_facilities' => $validated['recommendation_checks']['provide_lacking_facilities'] ?? false,
                'others_recommendation' => $validated['recommendation_checks']['others'] ?? false,
                'status' => 'submitted',
                'compliance_status' => $validated['compliance_status'] ?? null,
                'automated_recommendations' => $validated['automated_recommendations'] ?? null,
            ]);

            // Store checklist responses
            foreach ($validated['checklist_responses'] as $response) {
                InspectionChecklistResponse::create([
                    'inspection_result_id' => $inspectionResult->id,
                    'checklist_question_id' => $response['question_id'],
                    'response' => $response['response'],
                    'notes' => $response['notes'] ?? null,
                    'remarks' => $response['remarks'] ?? null,
                ]);
            }

            // Store utility data
            if (!empty($validated['utility_data'])) {
                foreach ($validated['utility_data'] as $utilityId => $data) {
                    if (!empty($data)) {
                        InspectionUtilityData::create([
                            'inspection_result_id' => $inspectionResult->id,
                            'utility_id' => $utilityId,
                            'data' => $data,
                        ]);
                    }
                }
            }

            // Store conditional field responses
            if (!empty($validated['conditional_fields'])) {
                foreach ($validated['conditional_fields'] as $questionId => $fields) {
                    foreach ($fields as $fieldName => $fieldValue) {
                        ConditionalFieldResponse::create([
                            'inspection_result_id' => $inspectionResult->id,
                            'checklist_question_id' => $questionId,
                            'field_name' => $fieldName,
                            'field_value' => $fieldValue,
                        ]);
                    }
                }
            }

            DB::commit();

            return redirect()
                ->route('staff.schedule')
                ->with('success', 'Inspection completed successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()
                ->withInput()
                ->with('error', 'Failed to save inspection: ' . $e->getMessage());
        }
    }

    /**
     * Generate PDF for inspection result.
     */
    public function generatePDF(InspectionResult $inspectionResult)
    {
        // Configure Dompdf
        $options = new Options([
            'defaultFont' => 'Times New Roman',
            'isRemoteEnabled' => false, // Disable remote images
            'isHtml5ParserEnabled' => true,
            'isPhpEnabled' => true,
            'chroot' => public_path(), // Restrict to public directory
        ]);
        
        $dompdf = new Dompdf($options);
        
        // Get HTML content
        $html = $this->getPDFHTML($inspectionResult);
        
        // Load HTML
        $dompdf->loadHtml($html);
        
        // Set paper size and orientation
        $dompdf->setPaper('A4', 'portrait');
        
        // Render PDF
        $dompdf->render();
        
        // Generate filename
        $filename = 'inspection-result-' . $inspectionResult->id . '-' . date('Y-m-d') . '.pdf';
        
        // Download PDF
        return $dompdf->stream($filename, [
            'Attachment' => true
        ]);
    }

    /**
     * Get HTML content for PDF generation.
     */
    private function getPDFHTML($inspectionResult)
    {
        $establishment = $inspectionResult->establishment;
        $inspection = $inspectionResult->inspection;
        $staff = $inspectionResult->staff;
        $utilityData = $inspectionResult->utilityData;
        
        // Load checklist responses with their relationships
        $checklistResponses = $inspectionResult->checklistResponses()
            ->with('checklistQuestion.category')
            ->get();
            
        // Load conditional field responses with their relationships
        $conditionalFieldResponses = $inspectionResult->conditionalFieldResponses()
            ->with('checklistQuestion')
            ->get();

        // Group responses by category
        $groupedResponses = [];
        foreach ($checklistResponses as $response) {
            // Debug: Check if the relationship is loaded
            $question = $response->checklistQuestion;
            $category = $question?->category;
            
            $categoryName = $category?->name ?? 'Uncategorized';
            $questionText = $question?->question ?? 'Question not available';
            
            if (!isset($groupedResponses[$categoryName])) {
                $groupedResponses[$categoryName] = [];
            }
            $groupedResponses[$categoryName][] = $response;
        }

        // Group conditional field responses by question
        $groupedConditionalFields = [];
        foreach ($conditionalFieldResponses as $conditionalField) {
            $questionId = $conditionalField->checklist_question_id;
            if (!isset($groupedConditionalFields[$questionId])) {
                $groupedConditionalFields[$questionId] = [];
            }
            $groupedConditionalFields[$questionId][$conditionalField->field_name] = $conditionalField->field_value;
        }

        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Inspection Report</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }
        body { 
            font-family: Times New Roman, serif; 
            margin: 0; 
            padding: 0;
            line-height: 1.0;
            color: #000;
            font-size: 12px;
        }
        .header { 
            text-align: center; 
            margin-bottom: 10px; 
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
        }
        .header-content {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 20px;
            gap: 20px;
        }
        .header-text {
            text-align: center;
            flex: 1;
        }
        .header h1 { 
            margin: 0; 
            font-size: 14px;
            font-weight: bold;
        }
        .header h2 { 
            margin: 2px 0; 
            font-size: 12px;
            font-weight: normal;
        }
        .header h2.menro {
            font-size: 14px;
            font-weight: bold;
            margin-top: 5px;
        }
        .logo {
            width: 60px;
            height: 60px;
            flex-shrink: 0;
        }
        .main-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 11px;
        }
        .main-table th, .main-table td {
            border: 1px solid #000;
            padding: 3px;
            text-align: left;
            vertical-align: top;
        }
        .main-table th {
            background: #f0f0f0;
            font-weight: bold;
            text-align: center;
            font-size: 10px;
        }
        .section-header {
            background: #e0e0e0;
            font-weight: bold;
            text-align: center;
            font-size: 11px;
            text-transform: uppercase;
        }
        .label {
            font-weight: bold;
            font-size: 10px;
            white-space: nowrap;
            width: 25%;
        }
        .value {
            font-size: 10px;
            width: 25%;
        }
        .checklist-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 9px;
        }
        .checklist-table th, .checklist-table td {
            border: 1px solid #000;
            padding: 2px;
            text-align: left;
            vertical-align: top;
            font-size: 9px;
        }
        .checklist-table th {
            background: #f0f0f0;
            font-weight: bold;
            text-align: center;
            font-size: 9px;
        }
        .response-yes {
            background: #d4edda;
            color: #155724;
            text-align: center;
            font-weight: bold;
        }
        .response-no {
            background: #f8d7da;
            color: #721c24;
            text-align: center;
            font-weight: bold;
        }
        .response-na {
            background: #e2e3e5;
            color: #383d41;
            text-align: center;
            font-weight: bold;
        }
        .remarks-text {
            font-size: 9px;
            font-style: italic;
            color: #555;
        }
        .conditional-fields {
            background: #e3f2fd;
            border: 1px solid #90caf9;
            padding: 2px;
            margin: 1px 0;
            border-radius: 2px;
        }
        .conditional-label {
            font-weight: bold;
            color: #1565c0;
            font-size: 8px;
        }
        .conditional-value {
            color: #0d47a1;
            font-size: 8px;
        }
        .footer { 
            margin-top: 15px; 
            text-align: left; 
            font-size: 11px; 
            color: #000;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        .signature-section {
            margin-top: 20px;
            page-break-inside: avoid;
        }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .signature-table td {
            border: none;
            padding: 3px;
            text-align: left;
            vertical-align: top;
            font-size: 11px;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            height: 25px;
            margin-bottom: 3px;
            width: 200px;
        }
        .no-break {
            page-break-inside: avoid;
        }
    </style>
</head>
<body>';

        // Header with logos - using absolute file paths
        $logoPath = public_path('images/logo.png');
        $opolLogoPath = public_path('images/opol-logo.png');
        
        // Convert to base64 for embedding
        $logoBase64 = '';
        $opolLogoBase64 = '';
        
        if (file_exists($logoPath)) {
            $logoData = file_get_contents($logoPath);
            $logoBase64 = 'data:image/png;base64,' . base64_encode($logoData);
        }
        
        if (file_exists($opolLogoPath)) {
            $opolLogoData = file_get_contents($opolLogoPath);
            $opolLogoBase64 = 'data:image/png;base64,' . base64_encode($opolLogoData);
        }
        
        $html .= '<div class="header">
            <div class="header-content">
                <img src="' . $opolLogoBase64 . '" class="logo" alt="Opol Logo">
                <img src="' . $logoBase64 . '" class="logo" alt="Logo">
            </div>
            <div class="header-text">
                <h1>Republic of the Philippines</h1>
                <h2>Province of Misamis Oriental</h2>
                <h2>Municipality of Opol</h2>
                <h2>--o0o--</h2>
                <h2 class="menro">Municipal Environmental and Natural Resources Office</h2>
            </div>
        </div>';

        // Main Information Table
        $html .= '<table class="main-table">
            <tr>
                <th colspan="4" class="section-header">Establishment Information</th>
            </tr>
            <tr>
                <td width="15%" class="label">Business Name:</td>
                <td width="35%" class="value">' . htmlspecialchars($establishment->name ?? 'N/A') . '</td>
                <td width="15%" class="label">Business Type:</td>
                <td width="35%" class="value">' . htmlspecialchars($establishment->type_of_business ?? 'N/A') . '</td>
            </tr>
            <tr>
                <td class="label">Address:</td>
                <td class="value">' . htmlspecialchars($establishment->address ?? 'N/A') . '</td>
                <td class="label">Owner/Manager:</td>
                <td class="value">' . htmlspecialchars($establishment->proponent ?? 'N/A') . '</td>
            </tr>
            <tr>
                <td class="label">Contact No:</td>
                <td class="value">' . htmlspecialchars($establishment->contact_number ?? 'N/A') . '</td>
                <td class="label">Email:</td>
                <td class="value">' . htmlspecialchars($establishment->email ?? 'N/A') . '</td>
            </tr>
            <tr>
                <th colspan="4" class="section-header">Inspection Details</th>
            </tr>
            <tr>
                <td class="label">Inspection Date:</td>
                <td class="value">' . date('M j, Y', strtotime($inspection->inspection_timestamp ?? 'now')) . '</td>
                <td class="label">Quarter:</td>
                <td class="value">' . htmlspecialchars($inspection->quarter ?? 'N/A') . '</td>
            </tr>
            <tr>
                <td class="label">Inspector:</td>
                <td class="value">' . htmlspecialchars(($staff->first_name ?? '') . ' ' . ($staff->last_name ?? '')) . '</td>
                <td class="label">Report Date:</td>
                <td class="value">' . date('M j, Y', strtotime($inspectionResult->created_at)) . '</td>
            </tr>
        </table>';

        // Checklist Results Table
        $html .= '<table class="checklist-table">
            <tr>
                <th width="5%">#</th>
                <th width="45%">Question</th>
                <th width="15%">Response</th>
                <th width="20%">Certificate/Documents Numbers</th>
                <th width="15%">Remarks</th>
            </tr>';

        $questionNumber = 1;
        foreach ($groupedResponses as $category => $responses) {
            // Category row
            $html .= '<tr>
                <td colspan="5" style="background: #f8f8f8; font-weight: bold; text-align: left; padding-left: 10px;">
                    ' . htmlspecialchars($category) . '
                </td>
            </tr>';
            
            foreach ($responses as $response) {
                $responseClass = $response->response === 'yes' ? 'response-yes' : 
                               ($response->response === 'no' ? 'response-no' : 'response-na');
                $responseText = $response->response === 'N/A' ? 'N/A' : 
                               ucfirst($response->response);
                
                $questionText = $response->checklistQuestion?->question ?? 'Question not available';
                $remarksText = '';
                if ($response->notes) {
                    $remarksText .= 'Notes: ' . $response->notes;
                }
                if ($response->remarks) {
                    if ($remarksText) $remarksText .= ' | ';
                    $remarksText .= 'Remarks: ' . $response->remarks;
                }
                
                // Add conditional fields if they exist
                $conditionalFieldsHtml = '';
                if (isset($groupedConditionalFields[$response->checklist_question_id])) {
                    $conditionalFields = $groupedConditionalFields[$response->checklist_question_id];
                    foreach ($conditionalFields as $fieldName => $fieldValue) {
                        $label = ucwords(str_replace('_', ' ', $fieldName));
                        $conditionalFieldsHtml .= '<div>';
                        $conditionalFieldsHtml .= '<span class="conditional-label">' . htmlspecialchars($label) . ':</span> ';
                        $conditionalFieldsHtml .= '<span class="conditional-value">' . htmlspecialchars($fieldValue ?: 'N/A') . '</span>';
                        $conditionalFieldsHtml .= '</div>';
                    }
                }
                
                $html .= '<tr>
                    <td style="text-align: center;">' . $questionNumber . '</td>
                    <td>' . htmlspecialchars($questionText) . '</td>
                    <td class="' . $responseClass . '">' . $responseText . '</td>
                    <td class="conditional-fields">' . $conditionalFieldsHtml . '</td>
                    <td class="remarks-text">' . htmlspecialchars($remarksText) . '</td>
                </tr>';
                $questionNumber++;
            }
        }

        $html .= '</table>';

        // Utility Data (if exists)
        if ($utilityData && $utilityData->count() > 0) {
            foreach ($utilityData as $utility) {
                $formName = $utility->utility->form_name ?? 'Utility Form';
                $rows = is_array($utility->utility->rows) ? $utility->utility->rows : [];
                $columns = is_array($utility->utility->columns) ? $utility->utility->columns : [];
                $data = is_array($utility->data) ? $utility->data : [];
                
                if (!empty($rows) && !empty($columns)) {
                    $html .= '<table class="checklist-table no-break">
                        <tr>
                            <th colspan="' . (count($columns) + 1) . '" class="section-header">' . htmlspecialchars($formName) . '</th>
                        </tr>
                        <tr>
                            <th>Item</th>';
                    
                    foreach ($columns as $column) {
                        $columnName = is_array($column) ? ($column['name'] ?? 'Unknown') : $column->name ?? 'Unknown';
                        $html .= '<th>' . htmlspecialchars($columnName) . '</th>';
                    }
                    
                    $html .= '</tr>';
                    
                    foreach ($rows as $row) {
                        $rowName = is_array($row) ? ($row['name'] ?? 'Unknown') : $row->name ?? 'Unknown';
                        $html .= '<tr>
                            <td style="font-weight: bold;">' . htmlspecialchars($rowName) . '</td>';
                        
                        foreach ($columns as $column) {
                            $columnName = is_array($column) ? ($column['name'] ?? 'Unknown') : $column->name ?? 'Unknown';
                            $key = $rowName . '_' . $columnName;
                            $value = $data[$key] ?? '';
                            $html .= '<td>' . htmlspecialchars($value) . '</td>';
                        }
                        
                        $html .= '</tr>';
                    }
                    
                    $html .= '</table>';
                }
            }
        }

        // Remarks and Recommendations
        $html .= '<table class="main-table no-break">
            <tr>
                <th colspan="4" class="section-header">Remarks and Recommendations</th>
            </tr>
            <tr>
                <td class="label">Other Remarks:</td>
                <td colspan="3" class="value">' . nl2br(htmlspecialchars($inspectionResult->other_remarks ?: 'No remarks')) . '</td>
            </tr>
            <tr>
                <td class="label">Recommendations:</td>
                <td colspan="3" class="value">
                    <input type="checkbox" ' . ($inspectionResult->comply_lacking_permits ? 'checked' : '') . ' disabled> Comply lacking permits
                    <input type="checkbox" ' . ($inspectionResult->provide_lacking_facilities ? 'checked' : '') . ' disabled> Provide lacking facilities
                    <input type="checkbox" ' . ($inspectionResult->others_recommendation ? 'checked' : '') . ' disabled> Others
                </td>
            </tr>
            <tr>
                <td class="label">Detailed Recs:</td>
                <td colspan="3" class="value">' . nl2br(htmlspecialchars($inspectionResult->recommendations ?: 'No recommendations')) . '</td>
            </tr>
        </table>';

        // Footer with signatures - matching the image format
        $html .= '<div class="signature-section">
            <table class="signature-table">
                <tr>
                    <td>
                        <strong>INSPECTED BY :</strong>
                        <div class="signature-line"></div>
                        <div>' . htmlspecialchars(($staff->first_name ?? '') . ' ' . ($staff->last_name ?? '')) . '</div>
                        <div>Inspector</div>
                    </td>
                </tr>
                <tr>
                    <td style="padding-top: 15px;">
                        <strong>RECIEVE & CONFORMED BY:</strong>
                        <div class="signature-line"></div>
                        <div style="display: flex; gap: 20px;">
                            <span><strong>DATE :</strong> _______________</span>
                            <span><strong>TIME:</strong> _______________</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>';

        $html .= '<div class="footer">
            <strong>Republic of the Philippines</strong><br>
            Province of Misamis Oriental - Municipality of Opol<br>
            Report ID: #' . $inspectionResult->id . ' | Generated: ' . date('M j, Y') . '
        </div>';

        $html .= '</body>
</html>';

        return $html;
    }
    public function show(InspectionResult $inspectionResult)
    {
        $inspectionResult->load([
            'inspection',
            'establishment.businessType',
            'staff',
            'checklistResponses.checklistQuestion.category',
            'utilityData.utility',
            'conditionalFieldResponses.checklistQuestion'
        ]);

        // Group conditional field responses by question for easier display
        $groupedConditionalFields = [];
        foreach ($inspectionResult->conditionalFieldResponses as $conditionalField) {
            $questionId = $conditionalField->checklist_question_id;
            if (!isset($groupedConditionalFields[$questionId])) {
                $groupedConditionalFields[$questionId] = [];
            }
            $groupedConditionalFields[$questionId][$conditionalField->field_name] = $conditionalField->field_value;
        }

        return Inertia::render('Admin/InspectionResultView', [
            'inspectionResult' => $inspectionResult,
            'groupedConditionalFields' => $groupedConditionalFields,
        ]);
    }

    /**
     * Show the form for editing the specified inspection result.
     */
    public function edit(InspectionResult $inspectionResult)
    {
        // Check if the user can edit this inspection
        if ($inspectionResult->staff_id !== auth()->user()->staff?->id && $inspectionResult->status !== 'draft') {
            abort(403, 'You cannot edit this inspection.');
        }

        $inspectionResult->load([
            'checklistResponses.checklistQuestion.category',
            'utilityData.utility'
        ]);

        // Get all necessary data for the form
        $inspection = Inspection::findOrFail($inspectionResult->inspection_id);
        $establishments = Establishment::where('status', 'active')
            ->whereDoesntHave('inspectionResults', function ($query) use ($inspectionResult) {
                $query->where('inspection_id', $inspectionResult->inspection_id)
                      ->where('id', '!=', $inspectionResult->id); // Exclude current inspection result
            })
            ->get();
        $checklistQuestions = ChecklistQuestion::with('category')
            ->orderBy('category_id')
            ->orderBy('id')
            ->get();
        $groupedQuestions = $checklistQuestions->groupBy('category.name');
        $utilities = Utility::where('is_active', true)->get();
        $categories = InspectionCategory::orderBy('name')->get();

        return Inertia::render('Staffs/InspectionForm', [
            'inspectionResult' => $inspectionResult,
            'inspection' => $inspection,
            'establishments' => $establishments,
            'checklistQuestions' => $checklistQuestions,
            'groupedQuestions' => $groupedQuestions,
            'utilities' => $utilities,
            'categories' => $categories,
            'isEditing' => true,
        ]);
    }

    /**
     * Update the specified inspection result.
     */
    public function update(Request $request, InspectionResult $inspectionResult)
    {
        // Check if the user can edit this inspection
        $isAdmin = auth()->user()->role === 'admin';
        if (!$isAdmin && $inspectionResult->staff_id !== auth()->user()->staff?->id && $inspectionResult->status !== 'draft') {
            abort(403, 'You cannot edit this inspection.');
        }

        // Different validation for admin vs staff
        if ($isAdmin) {
            $validated = $request->validate([
                'compliance_status' => 'nullable|string|in:compliant,not_compliant',
                'automated_recommendations' => 'nullable|array',
                'checklist_responses' => 'nullable|array',
                'checklist_responses.*.id' => 'required|exists:inspection_checklist_responses,id',
                'checklist_responses.*.notes' => 'nullable|string',
                'checklist_responses.*.remarks' => 'nullable|string',
                'conditional_fields' => 'nullable|array',
                'other_remarks' => 'nullable|string',
                'recommendations' => 'nullable|string',
            ]);
        } else {
            $validated = $request->validate([
                'establishment_id' => 'required|exists:establishments,id',
                'checklist_responses' => 'required|array',
                'checklist_responses.*.question_id' => 'required|exists:checklist_questions,id',
                'checklist_responses.*.response' => 'required|string',
                'checklist_responses.*.notes' => 'nullable|string',
                'checklist_responses.*.remarks' => 'nullable|string',
                'utility_data' => 'nullable|array',
                'other_remarks' => 'nullable|string',
                'recommendations' => 'nullable|string',
                'recommendation_checks' => 'nullable|array',
                'recommendation_checks.comply_lacking_permits' => 'boolean',
                'recommendation_checks.provide_lacking_facilities' => 'boolean',
                'recommendation_checks.others' => 'boolean',
            ]);
        }

        try {
            DB::beginTransaction();

            if ($isAdmin) {
                // Admin update logic
                $inspectionResult->update([
                    'compliance_status' => $validated['compliance_status'] ?? $inspectionResult->compliance_status,
                    'automated_recommendations' => $validated['automated_recommendations'] ?? $inspectionResult->automated_recommendations,
                    'other_remarks' => $validated['other_remarks'] ?? $inspectionResult->other_remarks,
                    'recommendations' => $validated['recommendations'] ?? $inspectionResult->recommendations,
                ]);

                // Update checklist responses if provided
                if (isset($validated['checklist_responses'])) {
                    foreach ($validated['checklist_responses'] as $responseData) {
                        $response = InspectionChecklistResponse::find($responseData['id']);
                        if ($response && $response->inspection_result_id === $inspectionResult->id) {
                            $response->update([
                                'notes' => $responseData['notes'] ?? $response->notes,
                                'remarks' => $responseData['remarks'] ?? $response->remarks,
                            ]);
                        }
                    }
                }

                // Update conditional fields if provided
                if (isset($validated['conditional_fields'])) {
                    foreach ($validated['conditional_fields'] as $questionId => $fields) {
                        foreach ($fields as $fieldName => $fieldValue) {
                            ConditionalFieldResponse::updateOrCreate(
                                [
                                    'inspection_result_id' => $inspectionResult->id,
                                    'checklist_question_id' => $questionId,
                                    'field_name' => $fieldName,
                                ],
                                [
                                    'field_value' => $fieldValue,
                                ]
                            );
                        }
                    }
                }
            } else {
                // Staff update logic
                $inspectionResult->update([
                    'establishment_id' => $validated['establishment_id'],
                    'other_remarks' => $validated['other_remarks'] ?? null,
                    'recommendations' => $validated['recommendations'] ?? null,
                    'comply_lacking_permits' => $validated['recommendation_checks']['comply_lacking_permits'] ?? false,
                    'provide_lacking_facilities' => $validated['recommendation_checks']['provide_lacking_facilities'] ?? false,
                    'others_recommendation' => $validated['recommendation_checks']['others'] ?? false,
                ]);

                // Delete existing checklist responses
                $inspectionResult->checklistResponses()->delete();

                // Store updated checklist responses
                foreach ($validated['checklist_responses'] as $response) {
                    InspectionChecklistResponse::create([
                        'inspection_result_id' => $inspectionResult->id,
                        'checklist_question_id' => $response['question_id'],
                        'response' => $response['response'],
                        'notes' => $response['notes'] ?? null,
                        'remarks' => $response['remarks'] ?? null,
                    ]);
                }

                // Delete existing utility data
                $inspectionResult->utilityData()->delete();

                // Store updated utility data
                if (!empty($validated['utility_data'])) {
                    foreach ($validated['utility_data'] as $utilityId => $data) {
                        if (!empty($data)) {
                            InspectionUtilityData::create([
                                'inspection_result_id' => $inspectionResult->id,
                                'utility_id' => $utilityId,
                                'data' => $data,
                            ]);
                        }
                    }
                }
            }

            DB::commit();

            $redirectRoute = $isAdmin 
                ? route('admin.inspection-results.show', $inspectionResult)
                : route('staff.inspection.results.show', $inspectionResult);

            return redirect($redirectRoute)->with('success', 'Inspection updated successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()
                ->withInput()
                ->with('error', 'Failed to update inspection: ' . $e->getMessage());
        }
    }

    /**
     * Get completed inspections for a specific inspection schedule.
     */
    public function getCompletedByInspection(Inspection $inspection)
    {
        $completedInspections = InspectionResult::with([
            'establishment',
            'staff',
            'inspection'
        ])
        ->where('inspection_id', $inspection->id)
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($result) {
            return [
                'id' => $result->id,
                'establishment' => $result->establishment,
                'staff' => $result->staff,
                'status' => $result->status,
                'status_color' => $result->status_color,
                'compliance_status' => $result->compliance_status,
                'created_at' => $result->created_at,
                'inspection' => $result->inspection,
            ];
        });

        return response()->json([
            'completedInspections' => $completedInspections
        ]);
    }

    /**
     * Get inspection results for the authenticated staff.
     */
    public function myInspections()
    {
        $inspectionResults = InspectionResult::with([
            'inspection',
            'establishment',
            'checklistResponses'
        ])
        ->where('staff_id', auth()->user()->staff?->id)
        ->orderBy('created_at', 'desc')
        ->paginate(10);

        return Inertia::render('Staffs/MyInspections', [
            'inspectionResults' => $inspectionResults,
        ]);
    }

    /**
     * Show establishment monitoring dashboard grouped by barangay.
     */
    public function monitoring(Request $request)
    {
        try {
            $quarter = $request->get('quarter');
            $year = $request->get('year', date('Y'));
            $fromDate = $request->get('from_date');
            $toDate = $request->get('to_date');

            // Get all establishments grouped by barangay
            $establishmentsByBarangay = Establishment::selectRaw('Barangay, COUNT(*) as total_establishments')
                ->where('status', 'active')
                ->groupBy('Barangay')
                ->orderBy('Barangay')
                ->get();

            // Get inspection results grouped by barangay and quarter
            $inspectionQuery = InspectionResult::with([
                'establishment.businessType',
                'inspection'
            ])
            ->whereHas('establishment', function ($query) {
                $query->where('status', 'active');
            });

            // Apply date filters
            if ($fromDate && $toDate) {
                // Use date range if both from and to dates are provided
                $inspectionQuery->whereHas('inspection', function ($query) use ($fromDate, $toDate) {
                    $query->whereBetween('inspection_timestamp', [$fromDate, $toDate]);
                });
            } elseif ($year) {
                // Use year filter if no date range is provided
                $inspectionQuery->whereHas('inspection', function ($query) use ($year) {
                    $query->whereYear('inspection_timestamp', $year);
                });
            }

            if ($quarter) {
                $inspectionQuery->whereHas('inspection', function ($query) use ($quarter) {
                    $query->where('quarter', $quarter);
                });
            }

            $inspectionResults = $inspectionQuery->get();
            
            $inspectionsByBarangay = $inspectionResults
                ->groupBy('establishment.Barangay')
                ->map(function ($inspections, $barangay) use ($quarter, $year) {
                    // Get all establishments in this barangay with business type relationship
                    $allEstablishments = Establishment::with('businessType')
                        ->where('Barangay', $barangay)
                        ->where('status', 'active')
                        ->get();

                    // Get inspected establishment IDs for this quarter/year
                    $inspectedEstablishmentIds = $inspections->pluck('establishment_id')->unique();
                    
                    // Separate inspected and pending establishments
                    $inspectedEstablishments = $allEstablishments->filter(function ($establishment) use ($inspectedEstablishmentIds) {
                        return $inspectedEstablishmentIds->contains($establishment->id);
                    });

                    $pendingEstablishments = $allEstablishments->filter(function ($establishment) use ($inspectedEstablishmentIds) {
                        return !$inspectedEstablishmentIds->contains($establishment->id);
                    });

                    return [
                        'barangay' => $barangay,
                        'total_establishments' => $allEstablishments->count(),
                        'inspected_establishments' => $inspectedEstablishments->count(),
                        'pending_establishments' => $pendingEstablishments->count(),
                        'inspection_percentage' => $allEstablishments->count() > 0 
                            ? round(($inspectedEstablishments->count() / $allEstablishments->count()) * 100, 1) 
                            : 0,
                        'inspected_details' => $inspectedEstablishments->map(function ($establishment) use ($inspections) {
                            $inspection = $inspections->firstWhere('establishment_id', $establishment->id);
                            return [
                                'id' => $establishment->id,
                                'name' => $establishment->name,
                                'address' => $establishment->address,
                                'type_of_business' => $establishment->type_of_business,
                                'business_type' => $establishment->businessType,
                                'inspection_id' => $inspection->id,
                                'quarter' => $inspection->inspection->quarter,
                                'inspection_date' => $inspection->inspection->inspection_timestamp,
                                'status' => $inspection->status,
                                'compliance_status' => $inspection->compliance_status,
                                'inspector' => $inspection->staff ? 
                                    $inspection->staff->first_name . ' ' . $inspection->staff->last_name : 
                                    'N/A'
                            ];
                        })->values(),
                        'pending_details' => $pendingEstablishments->map(function ($establishment) {
                            return [
                                'id' => $establishment->id,
                                'name' => $establishment->name,
                                'address' => $establishment->address,
                                'type_of_business' => $establishment->type_of_business,
                                'business_type' => $establishment->businessType,
                                'status' => 'pending'
                            ];
                        })->values(),
                        'inspections' => $inspections->map(function ($inspection) {
                            return [
                                'id' => $inspection->id,
                                'establishment_name' => $inspection->establishment->name,
                                'quarter' => $inspection->inspection->quarter,
                                'inspection_date' => $inspection->inspection->inspection_timestamp,
                                'status' => $inspection->status,
                                'inspector' => $inspection->staff ? 
                                    $inspection->staff->first_name . ' ' . $inspection->staff->last_name : 
                                    'N/A'
                            ];
                        })->values()
                    ];
                })
                ->sortBy('barangay')
                ->values();

            // Ensure all barangays are included even if no inspections
            $allBarangays = $establishmentsByBarangay->map(function ($item) use ($inspectionsByBarangay) {
                $barangay = $item->Barangay;
                $existingData = $inspectionsByBarangay->firstWhere('barangay', $barangay);
                
                if ($existingData) {
                    return $existingData;
                }
                
                // Get all establishments for this barangay (all are pending since no inspections)
                $allEstablishments = Establishment::where('Barangay', $barangay)
                    ->where('status', 'active')
                    ->get();
                
                return [
                    'barangay' => $barangay,
                    'total_establishments' => $item->total_establishments,
                    'inspected_establishments' => 0,
                    'pending_establishments' => $item->total_establishments,
                    'inspection_percentage' => 0,
                    'inspected_details' => collect([]),
                    'pending_details' => $allEstablishments->map(function ($establishment) {
                        return [
                            'id' => $establishment->id,
                            'name' => $establishment->name,
                            'address' => $establishment->address,
                            'type_of_business' => $establishment->type_of_business,
                            'status' => 'pending'
                        ];
                    })->values(),
                    'inspections' => collect([])
                ];
            })->sortBy('barangay')->values();

            // Get available quarters for filtering - include all standard quarters
            $existingQuarters = Inspection::select('quarter')
                ->whereYear('inspection_timestamp', $year)
                ->distinct()
                ->pluck('quarter')
                ->sort()
                ->values();
            
            // Always include standard quarters Q1-Q4
            $standardQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
            $availableQuarters = collect($standardQuarters)
                ->merge($existingQuarters)
                ->unique()
                ->sort()
                ->values();

            // Get summary statistics
            $totalEstablishments = $allBarangays->sum('total_establishments');
            $totalInspected = $allBarangays->sum('inspected_establishments');
            $totalPending = $allBarangays->sum('pending_establishments');
            $overallPercentage = $totalEstablishments > 0 
                ? round(($totalInspected / $totalEstablishments) * 100, 1) 
                : 0;

            return Inertia::render('Admin/EstablishmentMonitoring', [
                'barangays' => $allBarangays,
                'summary' => [
                    'total_establishments' => $totalEstablishments,
                    'total_inspected' => $totalInspected,
                    'total_pending' => $totalPending,
                    'overall_percentage' => $overallPercentage
                ],
                'filters' => [
                    'quarter' => $quarter,
                    'year' => $year,
                    'from_date' => $fromDate,
                    'to_date' => $toDate,
                    'available_quarters' => $availableQuarters
                ]
            ]);

        } catch (\Exception $e) {
            // Log the error and return a response with error message
            \Log::error('Error in monitoring method: ' . $e->getMessage());
            
            return Inertia::render('Admin/EstablishmentMonitoring', [
                'barangays' => collect([]),
                'summary' => [
                    'total_establishments' => 0,
                    'total_inspected' => 0,
                    'total_pending' => 0,
                    'overall_percentage' => 0
                ],
                'filters' => [
                    'quarter' => $request->get('quarter'),
                    'year' => $request->get('year', date('Y')),
                    'from_date' => $request->get('from_date'),
                    'to_date' => $request->get('to_date'),
                    'available_quarters' => collect([])
                ],
                'error' => 'An error occurred while loading the monitoring data. Please try again.'
            ]);
        }
    }

    /**
     * Get inspection history for a specific establishment.
     */
    public function getEstablishmentInspectionHistory(Establishment $establishment)
    {
        $inspectionResults = InspectionResult::with([
            'inspection',
            'staff.user',
            'checklistResponses.checklistQuestion'
        ])
        ->where('establishment_id', $establishment->id)
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'establishment' => $establishment,
            'inspection_results' => $inspectionResults->map(function ($result) {
                return [
                    'id' => $result->id,
                    'inspection' => [
                        'id' => $result->inspection->id,
                        'title' => $result->inspection->quarter . ' Inspection', // Use quarter as title since there's no title field
                        'inspection_timestamp' => $result->inspection->inspection_timestamp 
                            ? \Carbon\Carbon::parse($result->inspection->inspection_timestamp)->format('Y-m-d H:i:s')
                            : null,
                        'quarter' => $result->inspection->quarter,
                        'notes' => $result->inspection->notes
                    ],
                    'staff' => $result->staff ? [
                        'id' => $result->staff->id,
                        'name' => $result->staff->user->name,
                        'email' => $result->staff->user->email
                    ] : null,
                    'compliance_status' => $result->compliance_status,
                    'overall_score' => $result->overall_score,
                    'status' => $result->status,
                    'created_at' => $result->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $result->updated_at->format('Y-m-d H:i:s'),
                    'total_questions' => $result->checklistResponses->count(),
                    'responses_summary' => $this->summarizeResponses($result->checklistResponses)
                ];
            })
        ]);
    }

    /**
     * Summarize checklist responses.
     */
    private function summarizeResponses($responses)
    {
        $summary = [
            'compliant' => 0,
            'non_compliant' => 0,
            'na' => 0,
            'total' => $responses->count()
        ];

        foreach ($responses as $response) {
            $responseStr = strtolower(trim($response->response));
            
            // Check for N/A responses first
            if (empty($responseStr) || $responseStr === 'n/a' || str_contains($responseStr, 'not applicable')) {
                $summary['na']++;
            }
            // Check for explicitly negative responses
            elseif (in_array($responseStr, ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'pending', 'false', '0', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed', 'non-functional', 'broken', 'malfunctioning'])) {
                $summary['non_compliant']++;
            }
            // Everything else is considered compliant
            else {
                $summary['compliant']++;
            }
        }

        return $summary;
    }
    public function uploadPhotos(Request $request, InspectionResult $inspectionResult)
    {
        $request->validate([
            'photos' => 'required|array|max:10',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB max per file
        ]);

        try {
            $uploadedPhotos = [];

            foreach ($request->file('photos') as $photo) {
                if ($photo->isValid()) {
                    // Generate unique filename
                    $filename = time() . '_' . uniqid() . '.' . $photo->getClientOriginalExtension();
                    
                    // Store photo in storage
                    $relativePath = 'inspection-photos/' . $inspectionResult->id . '/' . $filename;
                    $path = $photo->storeAs('inspection-photos/' . $inspectionResult->id, $filename, 'public');
                    
                    // Add to uploaded photos array
                    $uploadedPhotos[] = [
                        'name' => $photo->getClientOriginalName(),
                        'path' => $relativePath,
                        'url' => url('storage/' . $relativePath),
                        'size' => $photo->getSize(),
                        'mime_type' => $photo->getMimeType(),
                        'uploaded_at' => now()->toISOString(),
                    ];
                }
            }

            // Get existing photos
            $existingPhotos = $inspectionResult->photos ?? [];
            
            // Merge with new photos
            $allPhotos = array_merge($existingPhotos, $uploadedPhotos);
            
            // Update inspection result with all photos
            $inspectionResult->update([
                'photos' => $allPhotos
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Photos uploaded successfully',
                'photos' => $uploadedPhotos
            ]);

        } catch (\Exception $e) {
            \Log::error('Error uploading photos: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error uploading photos: ' . $e->getMessage()
            ], 500);
        }
    }
}
