import dotenv from 'dotenv';
dotenv.config();
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_t1yh8KRY29oSCdpXjM7DQZE+74s=',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/memora',
});

export default imagekit;
