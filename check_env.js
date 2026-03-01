
console.log("Checking Environment Variables...");
console.log("CONVEX_DEPLOY_KEY:", process.env.CONVEX_DEPLOY_KEY ? "PRESENT (Length: " + process.env.CONVEX_DEPLOY_KEY.length + ")" : "MISSING");
console.log("VITE_CONVEX_URL:", process.env.VITE_CONVEX_URL ? "PRESENT (" + process.env.VITE_CONVEX_URL + ")" : "MISSING");
