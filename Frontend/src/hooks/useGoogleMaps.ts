// import { useEffect, useState } from 'react';

// const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// export function useGoogleMaps() {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [loadError, setLoadError] = useState<Error | null>(null);

//   useEffect(() => {
//     if (window.google && window.google.maps) {
//       setIsLoaded(true);
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
//     script.async = true;
//     script.defer = true;

//     script.addEventListener('load', () => {
//       setIsLoaded(true);
//     });

//     script.addEventListener('error', () => {
//       setLoadError(new Error('Failed to load Google Maps'));
//     });

//     document.head.appendChild(script);

//     return () => {
//       const existingScript = document.querySelector(
//         `script[src*="maps.googleapis.com"]`
//       );
//       if (existingScript) {
//         document.head.removeChild(existingScript);
//       }
//     };
//   }, []);

//   return { isLoaded, loadError };
// }

// declare global {
//   interface Window {
//     google: typeof google;
//   }
// }
