<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\InspectionController;
use App\Http\Controllers\InspectionResultController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\StaffDashboardController;
use App\Http\Controllers\StaffScheduleController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ChecklistQuestionController;
use App\Http\Controllers\InspectionCategoryController;
use App\Http\Controllers\EstablishmentController;
use App\Http\Controllers\BusinessTypeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UtilityController;
use App\Http\Controllers\AdminInspectionController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('login');
});



Route::get('/StaffDashboard', function () {
    return Inertia::render('StaffDashboard');
})->middleware(['auth', 'verified'])->name('staff.dashboard.main');

// Admin routes group (manual CRUD routes)
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Show all establishments
    Route::get('establishments', [EstablishmentController::class, 'index'])->name('establishments.index');

    // Store new establishment
    Route::post('establishments', [EstablishmentController::class, 'store'])->name('establishments.store');

    // Update an establishment
    Route::put('establishments/{establishment}', [EstablishmentController::class, 'update'])->name('establishments.update');

    // Deactivate an establishment (soft delete)
    Route::patch('establishments/{establishment}/deactivate', [EstablishmentController::class, 'deactivate'])->name('establishments.deactivate');

    // Delete an establishment
    Route::delete('establishments/{establishment}', [EstablishmentController::class, 'destroy'])->name('establishments.destroy');

    // Business types routes
    Route::get('business-types', [BusinessTypeController::class, 'indexPage'])->name('business-types.index-page');
    Route::get('business-types/api', [BusinessTypeController::class, 'index'])->name('business-types.index');
    Route::get('business-types/active', [BusinessTypeController::class, 'active'])->name('business-types.active');
    Route::post('business-types', [BusinessTypeController::class, 'store'])->name('business-types.store');
    Route::put('business-types/{businessType}', [BusinessTypeController::class, 'update'])->name('business-types.update');
    Route::delete('business-types/{businessType}', [BusinessTypeController::class, 'destroy'])->name('business-types.destroy');

    // Staff routes
    Route::get('staffs', [StaffController::class, 'index'])->name('staffs.index');
    Route::post('staffs', [StaffController::class, 'store'])->name('staffs.store');
    Route::put('staffs/{staff}', [StaffController::class, 'update'])->name('staffs.update');
    Route::patch('staffs/{staff}/deactivate', [StaffController::class, 'deactivate'])->name('staffs.deactivate');
    Route::delete('staffs/{staff}', [StaffController::class, 'destroy'])->name('staffs.destroy');

    Route::get('/inspection', [InspectionCategoryController::class, 'index'])->name('inspection');
    Route::post('/inspection', [InspectionCategoryController::class, 'store'])->name('inspection.store');
    Route::put('/inspection/{category}', [InspectionCategoryController::class, 'update'])->name('inspection.update');
    Route::delete('/inspection/{category}', [InspectionCategoryController::class, 'destroy'])->name('inspection.destroy');

    // Checklist for a category

     // Show all categories with checklist links
     Route::get('/inspection/checklists', [ChecklistQuestionController::class, 'showAllCategories'])
     ->name('category.checklist');

     // Show checklist for a specific category
     Route::get('/inspection/{category}/checklist', [ChecklistQuestionController::class, 'index'])
     ->name('inspection.checklist');

     // Store new checklist question
     Route::post('/inspection/{category}/checklist', [ChecklistQuestionController::class, 'store'])
     ->name('inspection.checklist.store');

     // Update a question
     Route::put('/inspection/checklist/{checklistQuestion}', [ChecklistQuestionController::class, 'update'])
     ->name('inspection.checklist.update');

     // Delete a question
     Route::delete('/inspection/checklist/{checklistQuestion}', [ChecklistQuestionController::class, 'destroy'])
     ->name('inspection.checklist.destroy');


    // Inspection routes
    Route::get('/inspections', [InspectionController::class, 'index'])->name('inspections.index');
    Route::post('/inspections', [InspectionController::class, 'store'])->name('inspections.store');
    Route::put('/inspections/{inspection}', [InspectionController::class, 'update'])->name('inspections.update');
    Route::delete('/inspections/{inspection}', [InspectionController::class, 'destroy'])->name('inspections.destroy');
    
    // Admin inspection results routes
    Route::get('/inspections/{inspection}/completed', [InspectionResultController::class, 'getCompletedByInspection'])->name('inspections.completed');
    Route::get('/inspection-results/{inspectionResult}', [InspectionResultController::class, 'show'])->name('inspection-results.show');
    Route::put('/inspection-results/{inspectionResult}', [InspectionResultController::class, 'update'])->name('inspection-results.update');
    Route::post('/inspection-results/{inspectionResult}/upload-photos', [InspectionResultController::class, 'uploadPhotos'])->name('inspection-results.upload-photos');
    Route::get('/inspection-results/{inspectionResult}/pdf', [InspectionResultController::class, 'generatePDF'])->name('inspection-results.pdf');
    
    // Establishment inspection history
    Route::get('/establishments/{establishment}/inspection-history', [InspectionResultController::class, 'getEstablishmentInspectionHistory'])->name('establishments.inspection-history');
    
    // Admin manual inspection entry routes
    Route::get('/inspection/create', [AdminInspectionController::class, 'create'])->name('admin.inspection.create');
    Route::post('/inspection-store', [AdminInspectionController::class, 'store'])->name('admin.inspection.store');
    
    // Establishment Monitoring
    Route::get('/monitoring', [InspectionResultController::class, 'monitoring'])->name('monitoring.index');

    // Reports
    Route::get('/reports', [ReportsController::class, 'index'])->name('reports.index');
    Route::get('/reports/data', [ReportsController::class, 'getData'])->name('reports.data');
    Route::get('/reports/export/{type}', [ReportsController::class, 'export'])->name('reports.export');
    
    // Checklist Response Reports
    Route::get('/reports/checklist-responses', [ReportsController::class, 'checklistResponses'])->name('reports.checklist-responses');
    Route::get('/reports/checklist-responses/data', [ReportsController::class, 'getChecklistResponseData'])->name('reports.checklist-responses.data');
    Route::get('/reports/checklist-responses/export', [ReportsController::class, 'exportChecklistResponses'])->name('reports.checklist-responses.export');
    
    Route::get('/reports/comprehensive-data', [ReportsController::class, 'getComprehensiveDataReports'])->name('reports.comprehensive-data');
    Route::get('/reports/comprehensive-data/page', [ReportsController::class, 'comprehensiveDataPage'])->name('reports.comprehensive-data.page');
    
    // Debug route for comprehensive data
    Route::get('/debug/comprehensive-data', function() {
        $expiredResponses = \App\Models\InspectionChecklistResponse::with(['checklistQuestion', 'inspectionResult.establishment'])
            ->whereNotNull('notes')
            ->where('notes', '!=', '')
            ->limit(5)
            ->get();
        
        echo "<h2>Debug: Expired Checklist Responses</h2>";
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>ID</th><th>Response</th><th>Notes</th><th>Question</th><th>Establishment</th></tr>";
        
        foreach ($expiredResponses as $response) {
            echo "<tr>";
            echo "<td>{$response->id}</td>";
            echo "<td>{$response->response}</td>";
            echo "<td>{$response->notes}</td>";
            echo "<td>" . ($response->checklistQuestion->question ?? 'N/A') . "</td>";
            echo "<td>" . ($response->inspectionResult->establishment->name ?? 'N/A') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        echo "<h2>Debug: Conditional Field Responses</h2>";
        $conditionalResponses = \App\Models\ConditionalFieldResponse::with(['checklistQuestion', 'inspectionResult.establishment'])
            ->limit(5)
            ->get();
            
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>ID</th><th>Field Name</th><th>Field Value</th><th>Question</th><th>Establishment</th></tr>";
        
        foreach ($conditionalResponses as $response) {
            echo "<tr>";
            echo "<td>{$response->id}</td>";
            echo "<td>{$response->field_name}</td>";
            echo "<td>{$response->field_value}</td>";
            echo "<td>" . ($response->checklistQuestion->question ?? 'N/A') . "</td>";
            echo "<td>" . ($response->inspectionResult->establishment->name ?? 'N/A') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        echo "<h2>Total Counts</h2>";
        echo "<p>Expired Checklist Responses: " . $expiredResponses->count() . "</p>";
        echo "<p>Conditional Field Responses: " . $conditionalResponses->count() . "</p>";
    });

    // Debug route for checklist responses
    Route::get('/debug/checklist-responses', function() {
        $responses = \App\Models\InspectionChecklistResponse::with(['checklistQuestion', 'inspectionResult'])->limit(10)->get();
        
        echo "<h2>Debug: Checklist Responses from Database</h2>";
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>ID</th><th>Response</th><th>Type</th><th>Question</th><th>Classification</th></tr>";
        
        foreach ($responses as $response) {
            $responseStr = $response->response;
            $type = gettype($responseStr);
            
            // Simple classification test
            $classification = 'unknown';
            if (empty($responseStr)) {
                $classification = 'empty';
            } elseif (strtolower(trim($responseStr)) === 'n/a' || str_contains(strtolower($responseStr), 'not applicable')) {
                $classification = 'na';
            } elseif (in_array(strtolower(trim($responseStr)), ['yes', 'compliant', 'pass', 'positive', 'ok', 'okay', 'approved', 'satisfactory', 'good', 'excellent', 'complete', 'done', 'true', '1', 'present', 'available', 'installed', 'functional', 'working', 'operational'])) {
                $classification = 'positive';
            } elseif (in_array(strtolower(trim($responseStr)), ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'pending', 'false', '0', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed', 'non-functional', 'broken', 'malfunctioning'])) {
                $classification = 'negative';
            }
            
            echo "<tr>";
            echo "<td>" . $response->id . "</td>";
            echo "<td>'" . htmlspecialchars($responseStr) . "'</td>";
            echo "<td>" . $type . "</td>";
            echo "<td>" . htmlspecialchars($response->checklistQuestion->question ?? 'N/A') . "</td>";
            echo "<td><strong>" . $classification . "</strong></td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Count all responses
        $allResponses = \App\Models\InspectionChecklistResponse::count();
        echo "<h3>Total Responses: " . $allResponses . "</h3>";
        
        // Count by simple classification
        $positiveCount = 0;
        $negativeCount = 0;
        $naCount = 0;
        
        $allResponsesData = \App\Models\InspectionChecklistResponse::get();
        foreach ($allResponsesData as $response) {
            $responseStr = $response->response;
            if (empty($responseStr)) {
                $naCount++;
            } elseif (strtolower(trim($responseStr)) === 'n/a' || str_contains(strtolower($responseStr), 'not applicable')) {
                $naCount++;
            } elseif (in_array(strtolower(trim($responseStr)), ['yes', 'compliant', 'pass', 'positive', 'ok', 'okay', 'approved', 'satisfactory', 'good', 'excellent', 'complete', 'done', 'true', '1', 'present', 'available', 'installed', 'functional', 'working', 'operational'])) {
                $positiveCount++;
            } elseif (in_array(strtolower(trim($responseStr)), ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'pending', 'false', '0', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed', 'non-functional', 'broken', 'malfunctioning'])) {
                $negativeCount++;
            }
        }
        
        echo "<h3>Simple Classification Counts:</h3>";
        echo "<ul>";
        echo "<li>Positive: " . $positiveCount . "</li>";
        echo "<li>Negative: " . $negativeCount . "</li>";
        echo "<li>N/A: " . $naCount . "</li>";
        echo "</ul>";
        
        exit;
    });

});

// Staff routes group
Route::middleware(['auth', 'staff'])->prefix('staff')->name('staff.')->group(function () {
    Route::get('/dashboard', [StaffDashboardController::class, 'dashboard'])->name('dashboard');
    Route::get('/schedule', [StaffScheduleController::class, 'index'])->name('schedule');
    Route::get('/schedule/{inspection}/create', [StaffScheduleController::class, 'create'])->name('inspection.create');
    Route::post('/inspection/store', [InspectionResultController::class, 'store'])->name('inspection.store');
    
    // Inspection results routes
    Route::get('/inspections', [InspectionResultController::class, 'myInspections'])->name('inspections.index');
    Route::get('/inspections/{inspectionResult}', [InspectionResultController::class, 'show'])->name('inspections.show');
    Route::get('/inspections/{inspectionResult}/edit', [InspectionResultController::class, 'edit'])->name('inspections.edit');
    Route::put('/inspections/{inspectionResult}', [InspectionResultController::class, 'update'])->name('inspections.update');
    
    // Add more staff routes here as needed
    // Route::get('/reports', [StaffReportController::class, 'index'])->name('reports');
    // Route::get('/profile', [StaffProfileController::class, 'edit'])->name('profile');
});

// Utilities routes (outside admin group)
Route::middleware('auth')->group(function () {
    Route::get('/utilities', [UtilityController::class, 'index'])
         ->name('utilities.index');
    Route::post('/utilities', [UtilityController::class, 'store'])
         ->name('utilities.store');
    Route::patch('/utilities/{utility}', [UtilityController::class, 'update'])
         ->name('utilities.update');
    Route::delete('/utilities/{utility}', [UtilityController::class, 'destroy'])
         ->name('utilities.destroy');
});


require __DIR__.'/auth.php';
