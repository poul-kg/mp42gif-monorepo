// apps/express-service/esbuild.config.js
const esbuild = require('esbuild');

const isWatchMode = process.argv.includes('--watch');

async function build() {
    const builder = await esbuild.build({
        entryPoints: ['./src/server.ts'], // Entry point of your Express app
        bundle: true,                     // Bundle all dependencies
        platform: 'node',                 // Target Node.js environment
        target: 'es2020',                 // JavaScript language target
        outfile: 'dist/server.js',        // Output file
        sourcemap: true,                  // Enable source maps for debugging
        external: ['express'],            // Externalize certain dependencies (optional)
        minify: false,                    // Set to true for production builds
    });

    if (isWatchMode) {
        // Enable watch mode
        const ctx = await esbuild.context({
            entryPoints: ['./src/server.ts'],
            bundle: true,
            platform: 'node',
            target: 'es2020',
            outfile: 'dist/server.js',
            sourcemap: true,
            external: ['express'],
            minify: false,
        });

        await ctx.watch();
        console.log('Watching for changes...');
    }
}

build().catch(() => process.exit(1));
