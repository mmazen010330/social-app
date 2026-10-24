import { Link } from "react-router";
import { Compass, Home } from "lucide-react";

function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 shadow-xs">
        <Compass size={36} className="animate-pulse" />
      </div>
      <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight">
        404
      </h1>
      <h2 className="text-lg sm:text-xl font-bold text-gray-700 mt-2 mb-2">
        Page Not Found
      </h2>
      <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-6">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/posts"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-xs"
      >
        <Home size={16} />
        <span>Back to Feed</span>
      </Link>
    </div>
  );
}

export default NotFound;
