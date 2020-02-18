import watch from './watch.js';
import mount from './mount.js';
import post from './post.js';
import otp from './otp.js';
import poll from './poll.js';
import wait from './wait.js';

window.addEventListener('load', async () => {
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
    await post(offerKey, peerConnection.localDescription);
  });

  const dataChannel = peerConnection.createDataChannel('channel');
  watch(dataChannel, mount);

  dataChannel.addEventListener('open', async () => {
    // Clear the SDP and ICE stored at the OTP
    await post(offerKey, '');

    while (true) {
      await wait(1000);
      dataChannel.send('from offerer: ' + new Date().toISOString());
    }
  });

  dataChannel.addEventListener('message', () => {
    console.log('message to offerer:', event.data);
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  await post(offerKey, offer);
  const answer = await poll(answerKey);
  await peerConnection.setRemoteDescription(answer);
});
