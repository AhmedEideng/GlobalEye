import { NextApiRequest, NextApiResponse } from 'next';
import { fetchNews } from '../../../app/utils/fetchNews';
 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { category = 'general' } = req.query;
  const articles = await fetchNews(category as string);
  res.status(200).json({ articles });
} 