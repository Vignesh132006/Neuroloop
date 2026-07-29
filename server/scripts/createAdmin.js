const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const User = require('../models/User')

async function createAccount() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('[Setup] Connected to MongoDB')

    const email    = process.env.SETUP_EMAIL
    const password = process.env.SETUP_PASSWORD
    const name     = process.env.SETUP_NAME     || 'Admin'
    const role     = process.env.SETUP_ROLE     || 'admin'

    if (!email || !password) {
      console.error('[Setup] Set SETUP_EMAIL, SETUP_PASSWORD, SETUP_ROLE in .env')
      process.exit(1)
    }

    if (!['admin', 'subadmin'].includes(role)) {
      console.error('[Setup] SETUP_ROLE must be admin or subadmin')
      process.exit(1)
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      console.log('[Setup] User already exists with role:', existing.role)
      console.log('[Setup] To update role run updateRole script instead')
      process.exit(0)
    }

    const hashed = await bcrypt.hash(password, 12)
    const user   = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role,
      onboardingCompleted: true
    })

    console.log('[Setup] Account created successfully')
    console.log('[Setup] Email:', user.email)
    console.log('[Setup] Role:', user.role)
    console.log('[Setup] ID:', user._id)
    console.log('[Setup] REMOVE SETUP_PASSWORD from .env now')
    process.exit(0)
  } catch (err) {
    console.error('[Setup] Error:', err.message)
    process.exit(1)
  }
}

createAccount()
