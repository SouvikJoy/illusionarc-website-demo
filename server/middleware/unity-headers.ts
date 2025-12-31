export default defineEventHandler((event) => {
    const p = event.path || ''
    if (!p.startsWith('/games/')) return

    // IMPORTANT:
    // If your Unity build compression is Brotli -> use 'br'
    // If Gzip -> use 'gzip'
    const ENCODING = 'br' // change to 'gzip' if needed

    if (p.endsWith('.wasm.unityweb')) {
        setResponseHeader(event, 'Content-Type', 'application/wasm')
        setResponseHeader(event, 'Content-Encoding', ENCODING)
    } else if (p.endsWith('.framework.js.unityweb')) {
        setResponseHeader(event, 'Content-Type', 'application/javascript; charset=utf-8')
        setResponseHeader(event, 'Content-Encoding', ENCODING)
    } else if (p.endsWith('.data.unityweb')) {
        setResponseHeader(event, 'Content-Type', 'application/octet-stream')
        setResponseHeader(event, 'Content-Encoding', ENCODING)
    }
})
