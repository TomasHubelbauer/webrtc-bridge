export default function watch(/** @type {RTCPeerConnection | RTCDataChannel} */ peerConnectionOrDataChannel, log = console.log) {
  if (peerConnectionOrDataChannel instanceof RTCPeerConnection) {
    const peerConnection = peerConnectionOrDataChannel;

    peerConnection.addEventListener('connectionstatechange', event => {
      log('peerConnection', event.type, peerConnection.connectionState);
    });

    peerConnection.addEventListener('datachannel', event => {
      log('peerConnection', event.type, event.channel);
    });

    peerConnection.addEventListener('icecandidate', event => {
      log('peerConnection', event.type, event.candidate);
    });

    peerConnection.addEventListener('iceconnectionstatechange', event => {
      log('peerConnection', event.type, peerConnection.iceConnectionState);
    });

    peerConnection.addEventListener('icegatheringstatechange', event => {
      log('peerConnection', event.type, peerConnection.iceGatheringState);
    });

    peerConnection.addEventListener('signalingstatechange', event => {
      log('peerConnection', event.type, peerConnection.signalingState);
    });

    return;
  }

  if (peerConnectionOrDataChannel instanceof RTCDataChannel) {
    const dataChannel = peerConnectionOrDataChannel;

    dataChannel.addEventListener('open', event => {
      log('dataChannel', event.type);
    });

    dataChannel.addEventListener('message', event => {
      log('dataChannel', event.type, event.data);
    });

    dataChannel.addEventListener('close', event => {
      log('dataChannel', event.type);
    });

    dataChannel.addEventListener('error', event => {
      log('dataChannel', event.type);
    });

    return;
  }

  throw new Error('Expected a peer connection or a data channel.');
}
