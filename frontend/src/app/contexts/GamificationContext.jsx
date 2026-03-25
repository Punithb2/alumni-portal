import React, { useState, useCallback, useEffect } from 'react'
import { BADGES } from '../data/gamification'

import { GamificationContext } from './GamificationContextObject'

export function GamificationProvider({ children }) {
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('gamification_points')
    return saved ? parseInt(saved, 10) : 0
  })

  const [earnedBadges, setEarnedBadges] = useState(() => {
    const saved = localStorage.getItem('gamification_badges')
    return saved ? JSON.parse(saved) : ['NEWCOMER']
  })

  const [notification, setNotification] = useState(null)

  useEffect(() => {
    localStorage.setItem('gamification_points', points.toString())
    localStorage.setItem('gamification_badges', JSON.stringify(earnedBadges))
  }, [points, earnedBadges])

  const checkBadges = useCallback((currentPoints, currentBadges) => {
    let newBadgeEarned = null

    Object.values(BADGES).forEach((badge) => {
      if (
        !currentBadges.includes(badge.id) &&
        currentPoints >= badge.pointsRequired &&
        badge.pointsRequired > 0
      ) {
        newBadgeEarned = badge
      }
    })

    return newBadgeEarned
  }, [])

  const awardPoints = useCallback(
    (amount, reason, relatedBadgeId = null) => {
      setPoints((prev) => {
        const nextPoints = prev + amount

        setEarnedBadges((prevBadges) => {
          let nextBadges = [...prevBadges]
          let badgeToAward = checkBadges(nextPoints, nextBadges)

          // specific action-based badge
          if (relatedBadgeId && !nextBadges.includes(relatedBadgeId)) {
            badgeToAward = BADGES[relatedBadgeId] || badgeToAward
          }

          if (badgeToAward && !nextBadges.includes(badgeToAward.id)) {
            nextBadges = [...nextBadges, badgeToAward.id]
            setNotification({
              title: 'Badge Unlocked! 🎉',
              message: `You earned the "${badgeToAward.title}" badge! +${amount} pts for ${reason}`,
              icon: badgeToAward.icon,
            })

            setTimeout(() => setNotification(null), 5000)
          } else {
            setNotification({
              title: `+${amount} Points`,
              message: `Earned points for: ${reason}`,
            })
            setTimeout(() => setNotification(null), 3000)
          }

          return nextBadges
        })

        return nextPoints
      })
    },
    [checkBadges]
  )

  const value = {
    points,
    earnedBadges,
    awardPoints,
    notification,
  }

  return (
    <GamificationContext.Provider value={value}>
      {children}
      {/* Global Notification Overlay for Gamification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce">
          <div className="bg-white px-6 py-4 rounded-xl shadow-2xl border-2 border-indigo-500 flex items-center gap-4 max-w-sm">
            {notification.icon && <div className="text-4xl">{notification.icon}</div>}
            <div>
              <h4 className="font-bold text-gray-900">{notification.title}</h4>
              <p className="text-sm text-gray-600">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </GamificationContext.Provider>
  )
}
