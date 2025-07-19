import express, { Request, Response } from 'express';
import { ethers } from 'ethers';

const router = express.Router();

interface FrameRequest {
  untrustedData: {
    buttonIndex: number;
    castId: {
      fid: number;
      hash: string;
    };
  };
  trustedData: {
    messageBytes: string;
  };
}

// Frame metadata for donation post
router.get('/post/:postId', async (req: Request, res: Response) => {
  const { postId } = req.params;
  
  // TODO: Fetch post data from database
  const post = {
    id: postId,
    orgName: 'ONG Example',
    content: 'Help us make a difference!',
    imageUrl: 'https://example.com/image.jpg',
    donationGoal: 1000,
    donationReceived: 450,
  };

  // Calculate progress percentage
  const progress = Math.round((post.donationReceived / post.donationGoal) * 100);

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${post.orgName}</title>
        <meta property="og:title" content="${post.orgName}" />
        <meta property="og:description" content="${post.content}" />
        <meta property="og:image" content="${post.imageUrl}" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="${post.imageUrl}" />
        <meta property="fc:frame:button:1" content="Doar R$10" />
        <meta property="fc:frame:button:2" content="Doar R$50" />
        <meta property="fc:frame:button:3" content="Compartilhar" />
        <meta property="fc:frame:post_url" content="${process.env.APP_URL}/api/frames/action/${postId}" />
      </head>
    </html>
  `);
});

// Frame action handler
router.post('/action/:postId', async (req: Request, res: Response) => {
  const { postId } = req.params;
  const frameRequest = req.body as FrameRequest;
  const buttonIndex = frameRequest.untrustedData.buttonIndex;

  // TODO: Fetch post data from database
  const post = {
    id: postId,
    orgName: 'ONG Example',
    content: 'Help us make a difference!',
    imageUrl: 'https://example.com/image.jpg',
  };

  let nextImage: string;
  let nextButtons: string[];

  switch (buttonIndex) {
    case 1: // R$10 donation
    case 2: // R$50 donation
      const amount = buttonIndex === 1 ? 10 : 50;
      const pixUrl = `${process.env.APP_URL}/donate/${postId}?amount=${amount}`;
      nextImage = post.imageUrl; // Show QR code image here
      nextButtons = ['Abrir app para doar', 'Voltar'];
      break;
    
    case 3: // Share
      nextImage = post.imageUrl;
      nextButtons = ['Obrigado por compartilhar! 🙏'];
      break;
    
    default:
      nextImage = post.imageUrl;
      nextButtons = ['Doar R$10', 'Doar R$50', 'Compartilhar'];
  }

  res.status(200).json({
    image: nextImage,
    buttons: nextButtons,
  });
});

export default router;
