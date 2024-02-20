import ExpressError from '../../utils/ExpressError.js';

import mongoose from 'mongoose';

export const getWeeklyReport = async (req, res, next) => {
  res.status(200).json({ summary: 'Summary of weekly report.' });
};
