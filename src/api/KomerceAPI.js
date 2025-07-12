import axios from 'axios'

const KOMERCE_API_KEY = 'mwq9IElVe3c4f49264529b58feSYcddl'
const SHIPPER_DESTINATION_ID = 8158

class KomerceAPI {
  constructor() {
    // Determine if we're in development or production
    const isDevelopment = import.meta.env.DEV
    
    // Use proxy in development, direct API in production
    const baseURL = isDevelopment 
      ? '/api/komerce' 
      : 'https://api-sandbox.collaborator.komerce.id'

    this.axios = axios.create({
      baseURL,
      headers: {
        'x-api-key': KOMERCE_API_KEY,
        'Content-Type': 'application/json',
      },
    })
  }

  // Search destination by keyword
  async searchDestination(keyword) {
    try {
      if (!keyword || keyword.trim().length < 3) {
        return []
      }

      const response = await this.axios.get(`/tariff/api/v1/destination/search?keyword=${keyword}`)
      
      if (response.data.meta.status === 'success') {
        return response.data.data
      }
      
      return []
    } catch (error) {
      console.error('Error searching destination:', error)
      return []
    }
  }

  // Calculate shipping cost using Komerce API
  async calculateShipping(receiverDestinationId, weightInGrams, itemValue, purchaseType) {
    try {
      // Convert grams to kg (minimum 0.1kg for API)
      let weightInKg = Math.max(weightInGrams / 1000, 0.1)
      
      // For Souvenir (cargo), minimum weight is 10kg
      if (purchaseType === 'Souvenir' && weightInKg < 10) {
        weightInKg = 10
      }

      const params = {
        shipper_destination_id: SHIPPER_DESTINATION_ID,
        receiver_destination_id: receiverDestinationId,
        weight: weightInKg,
        item_value: itemValue,
        cod: 'no'
      }

      const response = await this.axios.get('/tariff/api/v1/calculate', { params })
      
      if (response.data.meta.status === 'success') {
        const data = response.data.data
        
        // Return appropriate service based on purchase type
        if (purchaseType === 'Satuan') {
          // Find JNE REG23 from calculate_reguler
          const jneReg23 = data.calculate_reguler?.find(
            service => service.shipping_name === 'JNE' && service.service_name === 'REG23'
          )
          
          if (jneReg23) {
            return {
              service_name: `${jneReg23.shipping_name} ${jneReg23.service_name}`,
              shipping_cost: jneReg23.shipping_cost,
              etd: jneReg23.etd,
              type: 'reguler'
            }
          } else {
            // Fallback to first available regular service
            const firstRegular = data.calculate_reguler?.[0]
            if (firstRegular) {
              return {
                service_name: `${firstRegular.shipping_name} ${firstRegular.service_name}`,
                shipping_cost: firstRegular.shipping_cost,
                etd: firstRegular.etd,
                type: 'reguler'
              }
            }
          }
        } else if (purchaseType === 'Souvenir') {
          // Find JNE JTR23 from calculate_cargo
          const jneJtr23 = data.calculate_cargo?.find(
            service => service.shipping_name === 'JNE' && service.service_name === 'JTR23'
          )
          
          if (jneJtr23) {
            return {
              service_name: `${jneJtr23.shipping_name} ${jneJtr23.service_name}`,
              shipping_cost: jneJtr23.shipping_cost,
              etd: jneJtr23.etd,
              type: 'cargo'
            }
          } else {
            // Fallback to first available cargo service
            const firstCargo = data.calculate_cargo?.[0]
            if (firstCargo) {
              return {
                service_name: `${firstCargo.shipping_name} ${firstCargo.service_name}`,
                shipping_cost: firstCargo.shipping_cost,
                etd: firstCargo.etd,
                type: 'cargo'
              }
            }
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Error calculating shipping:', error)
      throw error
    }
  }

  // Format price with dot separator
  formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
}

// Create singleton instance
const komerceAPI = new KomerceAPI()
export default komerceAPI