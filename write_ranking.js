const fs = require('fs')
const jsx = `import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, RefreshCw, Crown, Star,
  ChevronLeft, ChevronRight,
  CheckCircle, Clock, AlertTriangle, X,
  GraduationCap, Shield,
} from 'lucide-react'
import { siswaApi } from '../../services/siswaService'
import { BadgeOverlay } from '../../components/GachaHarian'
`
fs.writeFileSync('src/pages/siswa/Ranking.jsx', jsx, 'utf8')
console.log('written', jsx.length)
