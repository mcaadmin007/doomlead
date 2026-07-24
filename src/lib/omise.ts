// Server-side only — ห้าม import ในไฟล์ที่มี 'use client'
import Omise from 'omise'

const omise = Omise({
  secretKey: process.env.OMISE_SECRET_KEY!,
  omiseVersion: '2019-05-29',
})

export default omise
