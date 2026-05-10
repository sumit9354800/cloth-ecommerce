const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Naam likhna zaroori hai'],
    trim: true,
    maxLength: [50, 'Naam 50 characters se bada nahi ho sakta'],
  },
  email: {
    type: String,
    required: [true, 'Email likhna zaroori hai'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Sahi email address likho'],
  },
  password: {
    type: String,
    required: [true, 'Password likhna zaroori hai'],
    minLength: [6, 'Password kam se kam 6 characters ka hona chahiye'],
    select: false, // Password by default query mein na aaye
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  avatar: {
    public_id: String,
    url: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Password save hone se pehle encrypt karo
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Password check karne ka method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);