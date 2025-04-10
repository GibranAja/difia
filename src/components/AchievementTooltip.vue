<template>
  <div class="achievement-tooltip" :class="tooltipPosition">
    <div class="tooltip-content">
      <h3 class="tooltip-title">{{ achievement.title }}</h3>
      <div class="tooltip-date">{{ formatDate(achievement.createdAt) }}</div>
      <p class="tooltip-description">{{ achievement.description }}</p>
      <div v-if="achievement.awardedBy" class="awarded-by">
        <span>Diberikan oleh:</span> {{ achievement.awardedBy }}
      </div>
    </div>
    <div class="tooltip-arrow"></div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  achievement: {
    type: Object,
    required: true,
  },
})

// Compute the tooltip position class
const tooltipPosition = computed(() => {
  return props.achievement.tooltipPosition || 'above'
})

// Format date function
const formatDate = (date) => {
  if (!date) return ''

  try {
    // Handle Firestore Timestamp
    const timestamp = date.toDate ? date.toDate() : new Date(date)
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(timestamp)
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}
</script>

<style scoped>
.achievement-tooltip {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  padding: 15px;
  width: 280px;
  position: relative;
  transform: translateX(-50%);
  transition: all 0.2s ease;
  z-index: 1000;
}

/* Default positioning (above the card) */
.achievement-tooltip.above {
  margin-bottom: 15px;
}

/* Styling for tooltip below the card */
.achievement-tooltip.below {
  margin-top: 15px;
}

/* Arrow for tooltip above card (pointing down) */
.achievement-tooltip.above .tooltip-arrow {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 20px;
  height: 20px;
  background-color: white;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* Arrow for tooltip below card (pointing up) */
.achievement-tooltip.below .tooltip-arrow {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 20px;
  height: 20px;
  background-color: white;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.tooltip-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #02163b;
}

.tooltip-date {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
}

.tooltip-description {
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  margin-bottom: 10px;
}

.awarded-by {
  font-size: 14px;
  color: #555;
  font-style: italic;
}

.awarded-by span {
  font-weight: 500;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* Media queries to ensure tooltip stays visible on different screen sizes */
@media (max-width: 768px) {
  .achievement-tooltip {
    width: 250px;
  }
}

@media (max-width: 576px) {
  .achievement-tooltip {
    width: 220px;
  }
}
</style>
