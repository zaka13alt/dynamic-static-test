// Robust error handling to catch evaluation and network failures
try {
    // 1. Sync import of required configurations and worker files
    importScripts('/dynamic/dynamic.config.js');
    importScripts('/dynamic/dynamic.worker.js');

    // 2. Safely resolve Dynamic instance whether globally declared or bound to self
    const DynamicClass = typeof Dynamic !== 'undefined' ? Dynamic : self.Dynamic;

    if (DynamicClass) {
        self.dynamic = new DynamicClass();
    } else {
        console.error("Service Worker Error: 'Dynamic' class was not found in global scope. Check dynamic.worker.js");
    }
} catch (error) {
    console.error("Service Worker top-level script evaluation failed:", error);
}

// 3. Keep event listener active but fallback safely if initialization failed
self.addEventListener('fetch', event => {
    // Fallback to standard network request if self.dynamic failed to initialize
    if (!self.dynamic) {
        return; 
    }

    event.respondWith(
        (async function() {
            try {
                // Intercept and route via Dynamic framework if applicable
                if (await self.dynamic.route(event)) {
                    return await self.dynamic.fetch(event);
                }
            } catch (routeError) {
                console.error("Dynamic routing failed, falling back to network:", routeError);
            }

            // Default network fallback
            return await fetch(event.request);
        })()
    );
});
