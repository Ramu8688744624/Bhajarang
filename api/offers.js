// Vercel Serverless Function for Offers Management
import { promises as fs } from 'fs';
import path from 'path';

const offersFilePath = path.join(process.cwd(), 'data', 'offers.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Default offers data
const defaultOffers = {
    offers: [
        {
            id: 'offer_1',
            title: '🎉 20% Off Screen Replacement',
            description: 'Get 20% discount on all mobile screen replacements. Valid for all brands including iPhone, Samsung, OnePlus, and more. Professional installation with 6-month warranty included.',
            validity: '2025-03-31',
            image: '',
            createdAt: new Date().toISOString()
        },
        {
            id: 'offer_2',
            title: '🔋 Free Battery Check + 15% Off Replacement',
            description: 'Free battery health check for all smartphones. If replacement needed, get 15% off on genuine batteries. Includes installation and 1-year warranty.',
            validity: '2025-04-15',
            image: '',
            createdAt: new Date().toISOString()
        },
        {
            id: 'offer_3',
            title: '🎧 Premium Earphones Deal',
            description: 'High-quality earphones with crystal clear sound. Perfect for music lovers and professionals. Limited time offer with free carrying case included.',
            validity: '2025-02-28',
            image: 'https://i.ibb.co/nqNjsHfB/earphones.png',
            createdAt: new Date().toISOString()
        }
    ],
    lastUpdated: new Date().toISOString()
};

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    await ensureDataDir();

    try {
        if (req.method === 'GET') {
            // Read offers
            try {
                const data = await fs.readFile(offersFilePath, 'utf8');
                const offers = JSON.parse(data);
                res.status(200).json(offers);
            } catch (error) {
                // File doesn't exist, create with default offers
                await fs.writeFile(offersFilePath, JSON.stringify(defaultOffers, null, 2));
                res.status(200).json(defaultOffers);
            }
        } else if (req.method === 'POST') {
            // Save offers
            const { offers } = req.body;
            
            if (!offers || !Array.isArray(offers)) {
                res.status(400).json({ success: false, message: 'Invalid offers data' });
                return;
            }

            const data = {
                offers,
                lastUpdated: new Date().toISOString()
            };

            await fs.writeFile(offersFilePath, JSON.stringify(data, null, 2));
            res.status(200).json({ success: true, message: 'Offers updated successfully' });
        } else {
            res.status(405).json({ success: false, message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}
