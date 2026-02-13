<?php

namespace App\Http\Controllers;

use App\Models\InspectionCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InspectionCategoryController extends Controller
{
    // Show all categories
    public function index()
    {
        $categories = InspectionCategory::all();

        return Inertia::render('Admin/Inspection', [
            'categories' => $categories
        ]);
    }

    // Store new category
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        InspectionCategory::create($request->only('name'));

        return redirect()->back()->with('success', 'Category added successfully!');
    }

    // Update category
    public function update(Request $request, InspectionCategory $category)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $category->update($request->only('name'));

        return redirect()->back()->with('success', 'Category updated successfully!');
    }

    // Optional: delete category
    public function destroy(InspectionCategory $category)
    {
        $category->delete();
        return redirect()->back()->with('success', 'Category deleted successfully!');
    }
}
