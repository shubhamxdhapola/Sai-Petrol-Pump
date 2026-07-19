export const saveCookie = (token, req, res) => {
    const isLocalhost = req.headers.host.includes('localhost') || req.headers.host.includes('127.0.0.1');
    res.cookie('token', token, {
        httpOnly: true,
        secure: !isLocalhost,
        sameSite: isLocalhost ? "Lax" : "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
}