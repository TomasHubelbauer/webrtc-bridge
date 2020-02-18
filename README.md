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

`npx serve .`

Access `http://localhost:5000/offerer` and `http://localhost:5000/answerer`.

## Acknowledgements

https://github.com/khovansky-al/web-otp-demo was used for the OTP implementation
inspiration, specifically because it uses WebCrypto and not SHA1.js and I am
very thankful for not having to figure it out myself. I've extracted the essence
I need and it works very well.

## To-Do

### Track the worker code here and use `cf-worker-deploy` to deploy its changes.

### Implement a `DELETE` method on the worker

Use it instead of clearing the SDP+ICE value under the OTP once connected.

### Lock the worker CORS origin to the final address of the frame site
