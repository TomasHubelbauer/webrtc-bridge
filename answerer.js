import watch from './watch.js';
import mount from './mount.js';
import poll from './poll.js';
import otp from './otp.js';
import post from './post.js';
import wait from './wait.js';

window.addEventListener('load', async () => {
  // Adopt the new OTP secret if access through an OTP reset link
  if (window.location.hash) {
    window.localStorage.setItem('secret', window.location.hash.slice('#'.length));
  }

  const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] });
  watch(peerConnection, mount);

  const { code } = await otp();
  mount(code);
  const offerKey = code + '-offer';
  const answerKey = code + '-answer';

  let counter = 0;
  peerConnection.addEventListener('icecandidate', async () => {
    // Pace the calls to the worker to avoid 500s when the ICE is fast
    await wait(counter++ * 1000);

    // Update the SDP with the ICE lines
    await post(answerKey, peerConnection.localDescription);
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
      console.log('message to answerer:', event.data);
    });
  });

  const offer = await poll(offerKey);
  await peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  await post(answerKey, answer);
});
