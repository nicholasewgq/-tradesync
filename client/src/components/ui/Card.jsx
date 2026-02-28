export function Card({ children, className = '', hover = false, gradient = false, ...props }) {
  const baseClasses = gradient
    ? 'rounded-2xl p-6 shadow-xl'
    : 'bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-sm';

  const hoverClasses = hover
    ? 'hover:shadow-xl hover:scale-[1.02] hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
    : 'hover:shadow-md';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', gradient = false }) {
  const textClass = gradient
    ? 'text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'
    : 'text-lg font-bold text-gray-900 dark:text-white';

  return (
    <h3 className={`${textClass} ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}
