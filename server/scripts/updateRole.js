const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
require('dotenv').config({ path: '../.env' })
const User = require('../models/User')

async function updateRole() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('[UpdateRole] Connected to MongoDB')

    const targetEmail = process.env.TARGET_EMAIL
    const newRole     = process.env.NEW_ROLE
    const newPassword = process.env.NEW_PASSWORD

    if (!targetEmail || !newRole) {
      console.error('[UpdateRole] Set TARGET_EMAIL and NEW_ROLE in .env')
      console.error('[UpdateRole] Optional: NEW_PASSWORD to also change password')
      process.exit(1)
    }

    if (!['user', 'admin', 'subadmin'].includes(newRole)) {
      console.error('[UpdateRole] NEW_ROLE must be: user, admin, or subadmin')
      process.exit(1)
    }

    const updateData = { role: newRole }
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12)
      console.log('[UpdateRole] Password will also be updated')
    }

    const user = await User.findOneAndUpdate(
      { email: targetEmail.toLowerCase() },
      updateData,
      { new: true }
    )

    if (!user) {
      console.error('[UpdateRole] User not found:', targetEmail)
      process.exit(1)
    }

    console.log('[UpdateRole] Role updated successfully')
    console.log('[UpdateRole] Email:', user.email)
    console.log('[UpdateRole] New role:', user.role)
    process.exit(0)
  } catch (err) {
    console.error('[UpdateRole] Error:', err.message)
    process.exit(1)
  }
}

updateRole()
