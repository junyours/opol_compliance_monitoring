import React from 'react';
import { Head } from '@inertiajs/react';

export default function CompletedInspections({ completedInspections, inspection }) {
    return (
        <div>
            <Head title="Completed Inspections" />
            
            {/* This page will be loaded via Inertia and the data will be available to the parent */}
            <div dangerouslySetInnerHTML={{ 
                __html: `
                    <script>
                        // Pass data to parent window
                        window.parent.postMessage({
                            type: 'completed_inpections_data',
                            data: ${JSON.stringify({ completedInspections, inspection })}
                        }, '*');
                    </script>
                `
            }} />
        </div>
    );
}
