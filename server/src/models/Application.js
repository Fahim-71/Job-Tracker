import mongoose from 'mongoose';

export const STATUSES = ['applied', 'interview', 'offer', 'rejected'];

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: { type: String, required: [true, 'Company is required'], trim: true },
    role: { type: String, required: [true, 'Role is required'], trim: true },
    status: {
      type: String,
      enum: { values: STATUSES, message: 'Status must be one of: ' + STATUSES.join(', ') },
      default: 'applied',
    },
    dateApplied: { type: Date, default: Date.now },
    jobLink: { type: String, trim: true },
    salary: { type: String, trim: true },
    location: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model('Application', applicationSchema);
