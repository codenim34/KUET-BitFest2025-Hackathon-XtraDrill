import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema({
  banglishText: {
    type: String,
    required: true,
  },
  banglaText: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminFeedback: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Contribution = mongoose.models.Contribution || mongoose.model('Contribution', contributionSchema);

export default Contribution;
