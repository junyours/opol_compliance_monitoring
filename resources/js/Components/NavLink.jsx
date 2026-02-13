import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    const page = usePage();
    const [isActive, setIsActive] = useState(active);

    useEffect(() => {
        const currentUrl = page.url;
        const href = props.href || '';
        
        // Check if the current URL matches the link href
        // Handle exact matches and partial matches for nested routes
        if (currentUrl === href || currentUrl.startsWith(href + '/')) {
            setIsActive(true);
        } else {
            setIsActive(active);
        }
    }, [page.url, props.href, active]);

    return (
        <Link
            {...props}
            className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl
                font-medium transition-all duration-200 ease-in-out
                transform hover:scale-[1.02] active:scale-[0.98]
                ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
                }
                ${className}
            `}
        >
            {children}
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
            )}
        </Link>
    );
}
