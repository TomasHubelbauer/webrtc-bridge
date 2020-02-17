# WebRTC Bridge

- Use TOTP/HOTP to generate shared keys offline on both the agents
- Use the key to exchange signalling data between the peers
- Use Google's free STUN server to initiate the WebRTC sesion
- Connect the peers, reconnect in the same way on connection loss
- Abstract over the data channel to treat it as an evented API
