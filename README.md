# WebRTC Bridge

This project implements an idea of mine for hosting sites from a home server
without directly exposing the home server to the Internet. It is based on WebRTC
data channels.

The idea is as follows:

- Both the home server and my client (phone, laptop, …) share a static secret
- The home server runs a WebRTC offerer and my clients run a WebRTC answerer
- Google's free STUN service is used for WebRTC NAT traversal challenges
- The home server initiates a WebRTC peer connection and collects SDP and ICE
- The home server generates a TOTP code and shares the SDP+ICE using signaling
- My signaling server https://signal.tomashubelbauer.workers.dev is used
- The Cloudflare Workers signaling server handles CORS to enable web clients
- The clients use the same TOTP to monitor the signaling channel for SDP+ICE
- Upon the offer SDP+ICE find, the clients generate an answer SDP+ICE and share
- The home server polls the signaling server for answer SDP+ICE and connects
- Once the peer connection is established, SDP+ICE on the signal server get wiped
- A data channel opens between the two peers and is used to serve files/pages/data
- Currently:
  - A DOM logger logs changes of the peer connection and the data channel states
  - Upon connection establishment, the peers exchange timestamps periodically
- Once finished:
  - The data channel will be used as a web socket would, serving files/pages/data
  - A "frame" HTML+JS site will be hosted on GitHub Pages hosting the web client
  - The OTP secret will be stored in the local storage and used for the TOTP calc
  - The frame site will download the actual SPA over the data channel
  - One downloaded, the SPA/PWA will use the data channel for its API: RCP/CQRS

## Running

To run the offerer on the server, run `node .` and wait for
`http://localhost:8000/offerer.html` to open in a Puppeteer window.

To run the answerer on the client, use one ofthe printed link from the offerer:

- Local: `http://localhost:5000#{secret}` (through `npx serve .`)
- Remote: `https://tomashubelbauer.github.io/webrtc-bridge/answerer.html#{secret}`

The printed URLs include the OTP secret in the URL fragment allowing the client
to sync with the server in case they weren't already.

If you already has an OTP secret stored with the client, you can run either the
local or the remote link directly without the URL fragment:

- Local: [`http://localhost:5000`](http://localhost:5000) (through `npx serve .`)
- Remote: [`https://tomashubelbauer.github.io/webrtc-bridge/answerer.html`](https://tomashubelbauer.github.io/webrtc-bridge/answerer.html)

If you want to reset the OTP secret, delete `secret.js` or run `node . secret`
and follow the running steps again.

## Acknowledgements

https://github.com/khovansky-al/web-otp-demo was used for the OTP implementation
inspiration, specifically because it uses WebCrypto and not SHA1.js and I am
very thankful for not having to figure it out myself. I've extracted the essence
I need and it works very well.

## To-Do

### Update ICE instead of polling only for the first SDP instance in the signal

Right now ICE is collected and the SDP updated with it in the signaling channel.
However, the SDP is polled only once and used immediately once it appears.
Instead, the SDP+ICE should be polled repeatedly until the connection is
established, at which point the polling should stop and the key should be
deleted on the signaling channel.

For now, I've tried a solution where trickle ICE is disabled forcing both peers
to collect all ICE candidates first and only then advertise their SDP+ICE.

### Make compatible with Node using `wrtc` to not have to run in Puppeteer

https://github.com/node-webrtc/node-webrtc

### Track the worker code here and use `cf-worker-deploy` to deploy its changes.

### Implement a `DELETE` method on the worker

Use it instead of clearing the SDP+ICE value under the OTP once connected.

### Lock the worker CORS origin to the final address of the frame site

### Handle disconnects by reconnecting on the signaling server using the TOTP

### Run the offerer peer on the NUC and add health checks to the script runner
