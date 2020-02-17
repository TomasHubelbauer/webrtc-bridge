# WebRTC Bridge

This project is an idea for serving sites from a home server without having
to expose the server to the Internet.

The server and a client would both be running a peer where the server would
create a session and the client join it.

This requires that they both come online, then the server creates the peer
connection object and starts collecting the candidates, the offer and the
candidates are sent over the signaling channel to the client which accepts
the offer and sends its answer and candidates back to the server.

Google's free STUN server is used for STUN and my Cloudflare Worker is used
for SDP signaling: https://signal.tomashubelbauer.workers.dev.

The worker API is:

- `POST /$key` (value in the request body)
- `GET /$key` (value in the response body)

The server and the client share a TOTP/HOTP seed and can both generate OTPs
which stand in for the key so that it is not static, yet both peers can make
new values offline.

Once ICE candidates and SDP have been exchanged, a data channel connection
opens and the full-duplex communication is established.

The client then uses the data channel like it would a WebSockets socket and
an RPC/CQRS communication protocol is used.

The "frame" HTML whereby the client peer code is served and the JavaScript
code for establishing the communication is embedded is served from a static
GitHub Pages site.

The seed for the OTP is stored in a cookie/local storage of the client, this
way the HTML and JS of the client can be public but only the blessed client
is able to initiate and maintain a connection.

The rest of the application follows standard SPA principles, also both the
data and the static content are served through the data channel so even
dynamic pages can exist, only use a different transport protocol.
