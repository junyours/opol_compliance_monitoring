<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionUtilityData extends Model
{
    use HasFactory;

    protected $fillable = [
        'inspection_result_id',
        'utility_id',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    /**
     * Get the inspection result that owns this utility data.
     */
    public function inspectionResult(): BelongsTo
    {
        return $this->belongsTo(InspectionResult::class);
    }

    /**
     * Get the utility for this data.
     */
    public function utility(): BelongsTo
    {
        return $this->belongsTo(Utility::class);
    }

    /**
     * Get a specific data value by key.
     */
    public function getValue(string $key, mixed $default = null): mixed
    {
        return data_get($this->data, $key, $default);
    }

    /**
     * Set a specific data value by key.
     */
    public function setValue(string $key, mixed $value): void
    {
        $data = $this->data ?? [];
        data_set($data, $key, $value);
        $this->data = $data;
    }

    /**
     * Get formatted data for display.
     */
    public function getFormattedDataAttribute(): array
    {
        $formatted = [];
        
        if ($this->utility && $this->data) {
            foreach ($this->utility->rows ?? [] as $row) {
                foreach ($this->utility->columns ?? [] as $column) {
                    $key = "{$row['name']}_{$column['name']}";
                    $formatted[$key] = [
                        'row' => $row['name'],
                        'column' => $column['name'],
                        'value' => $this->getValue($key),
                        'type' => $row['type'] ?? 'text',
                    ];
                }
            }
        }

        return $formatted;
    }
}
