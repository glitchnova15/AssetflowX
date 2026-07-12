export const IntentTypes = {
  ASSET_SEARCH: 'ASSET_SEARCH',
  BOOKING_SEARCH: 'BOOKING_SEARCH',
  MAINTENANCE_SEARCH: 'MAINTENANCE_SEARCH',
  DASHBOARD_SUMMARY: 'DASHBOARD_SUMMARY',
  CATEGORY_SEARCH: 'CATEGORY_SEARCH',
  GENERAL: 'GENERAL'
}

export const detectIntent = (text) => {
  const lower = text.toLowerCase()
  
  if (lower.includes('summary') || lower.includes('dashboard') || lower.includes('overview') || lower.includes('inventory')) {
    return IntentTypes.DASHBOARD_SUMMARY
  }
  
  if (lower.includes('maintenance') || lower.includes('repair') || lower.includes('broken')) {
    return IntentTypes.MAINTENANCE_SEARCH
  }
  
  if (lower.includes('booking') || lower.includes('reserve') || lower.includes('checked out')) {
    return IntentTypes.BOOKING_SEARCH
  }
  
  if (lower.includes('categor')) {
    return IntentTypes.CATEGORY_SEARCH
  }
  
  if (lower.includes('asset') || lower.includes('laptop') || lower.includes('monitor') || lower.includes('equipment')) {
    return IntentTypes.ASSET_SEARCH
  }
  
  return IntentTypes.GENERAL
}
