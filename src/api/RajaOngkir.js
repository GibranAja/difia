import axios from 'axios'

const RAJAONGKIR_API_KEY = 'f5bbc8efa8f9454734a47ea7558f1737'
const BOGOR_CITY_ID = '79'

class RajaOngkir {
  constructor() {
    // Determine if we're in production based on hostname
    const isProduction = window.location.hostname === 'difia.kuadratdev.com'

    // Use different base URL for production vs development
    const baseURL = isProduction ? '/api/rajaongkir' : '/api/rajaongkir'

    this.axios = axios.create({
      baseURL,
      headers: {
        key: RAJAONGKIR_API_KEY,
      },
    })
  }

  // Get list of provinces
  async getProvinces() {
    try {
      const response = await this.axios.get('/province')
      return response.data.rajaongkir.results
    } catch (error) {
      console.error('Error fetching provinces:', error)
      throw error
    }
  }

  // Get cities by province ID
  async getCities(provinceId) {
    try {
      const response = await this.axios.get(`/city?province=${provinceId}`)
      return response.data.rajaongkir.results
    } catch (error) {
      console.error('Error fetching cities:', error)
      throw error
    }
  }

  // Calculate shipping cost from Bogor
  async calculateShipping(destinationId, weight, courier, service = null) {
    try {
      const payloadData = {
        origin: BOGOR_CITY_ID, // From Bogor
        destination: destinationId,
        weight: weight, // in grams
        courier: courier, // 'jne', 'pos', or 'tiki'
      }

      // Add service if provided
      if (service) {
        payloadData.service = service
      }

      const response = await this.axios.post('/cost', payloadData)
      return response.data.rajaongkir.results[0].costs
    } catch (error) {
      console.error('Error calculating shipping:', error)
      throw error
    }
  }
}

// Create singleton instance
const rajaOngkir = new RajaOngkir()
export default rajaOngkir
