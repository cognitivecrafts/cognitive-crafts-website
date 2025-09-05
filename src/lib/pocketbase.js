import PocketBase from 'pocketbase';

const pb = new PocketBase('https://cognitivecraftsapi.ddns.net');
pb.autoCancellation(false);

export default pb;
