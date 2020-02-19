import watch from './watch.js';
import mount from './mount.js';
import poll from './poll.js';
import otp from './otp.js';
import post from './post.js';
import wait from './wait.js';

window.addEventListener('load', async () => {
  // Adopt the new OTP secret if access through an OTP reset link
  if (window.location.hash) {
    const secret = window.location.hash.slice('#'.length);
    window.localStorage.setItem('secret', secret);
  }

  const secret = window.localStorage.getItem('secret');
  console.log(secret);
  if (!secret) {
    const secret = prompt('No OTP secret found. Provide the OTP secret:');
    if (secret) {
      window.location.hash = secret;
      window.location.reload();
    }

    return;
  }

  const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
  watch(peerConnection, mount);

  const { code } = await otp(secret);
  mount(code);
  const offerKey = code + '-offer';
  const answerKey = code + '-answer';

  let counter = 0;
  peerConnection.addEventListener('icecandidate', async event => {
    // Pace the calls to the worker to avoid 500s when the ICE is fast
    await wait(counter++ * 1000);

    // Update the SDP with the ICE lines
    if (!event.candidate) {
      await post(answerKey, peerConnection.localDescription);
      mount('Posted answer SDP+ICE', peerConnection.localDescription);
    }
  });

  peerConnection.addEventListener('datachannel', async event => {
    const dataChannel = event.channel;
    watch(dataChannel, mount);

    dataChannel.addEventListener('open', async () => {
      // Clear the SDP and ICE stored at the OTP
      await post(answerKey, '');

      while (true) {
        await wait(1000);
        dataChannel.send('from answerer: ' + new Date().toISOString());
      }
    });

    dataChannel.addEventListener('message', event => {
      void event.data;
      // TODO: Handle the offerer response
    });
  });

  const offer = await poll(offerKey);
  mount('Polled offer SDP+ICE', offer);
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  //await post(answerKey, answer);
});
