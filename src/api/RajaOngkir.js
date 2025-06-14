// src/api/RajaOngkir.js - TANPA Mock Data, API Asli Saja - MANUAL FIXED VERSION
import axios from 'axios'

const RAJAONGKIR_API_KEY = 'f5bbc8efa8f9454734a47ea7558f1737'
const BOGOR_CITY_ID = '79'

// Daftar CORS proxy alternatif (coba satu per satu) - Updated dengan proxy yang lebih reliable
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?'
]

const RAJAONGKIR_BASE_URL = 'https://api.rajaongkir.com/starter'

class RajaOngkir {
  constructor() {
    this.currentProxyIndex = 0
    this.axiosInstance = axios.create({
      timeout: 30000 // 30 second timeout
    })
  }

  getCurrentProxy() {
    return CORS_PROXIES[this.currentProxyIndex]
  }

  switchToNextProxy() {
    this.currentProxyIndex = (this.currentProxyIndex + 1) % CORS_PROXIES.length
    console.log(`Switching to proxy: ${this.getCurrentProxy()}`)
  }

  async makeRequest(endpoint, method = 'GET', data = null, retryCount = 0) {
    const maxRetries = CORS_PROXIES.length

    try {
      const proxy = this.getCurrentProxy()
      let url
      let requestMethod = 'GET'
      let requestHeaders = {
        'Accept': 'application/json'
      }

      // Build target URL
      let targetUrl
      if (method === 'POST' && data) {
        // Untuk POST, convert ke GET dengan query params (RajaOngkir support ini)
        const params = new URLSearchParams(data)
        params.append('key', RAJAONGKIR_API_KEY)
        targetUrl = `${RAJAONGKIR_BASE_URL}/${endpoint}?${params.toString()}`
      } else {
        // MANUAL FIXED: Handle existing query params properly - EXPLICIT VERSION
        if (endpoint.includes('?')) {
          // Endpoint sudah ada parameter, gunakan &
          targetUrl = `${RAJAONGKIR_BASE_URL}/${endpoint}&key=${RAJAONGKIR_API_KEY}`
        } else {
          // Endpoint belum ada parameter, gunakan ?
          targetUrl = `${RAJAONGKIR_BASE_URL}/${endpoint}?key=${RAJAONGKIR_API_KEY}`
        }
      }

      // Handle different proxy formats
      if (proxy.includes('allorigins.win/get')) {
        // AllOrigins format - returns {contents: "data"}
        url = `${proxy}${encodeURIComponent(targetUrl)}`
      } else if (proxy.includes('cors-anywhere')) {
        // CORS Anywhere - direct append
        url = `${proxy}${targetUrl}`
        requestHeaders['X-Requested-With'] = 'XMLHttpRequest'
      } else if (proxy.includes('thingproxy')) {
        // ThingProxy format
        url = `${proxy}${targetUrl}`
      } else if (proxy.includes('corsproxy.io')) {
        // FIXED: corsproxy.io needs proper URL encoding
        url = `${proxy}${encodeURIComponent(targetUrl)}`
      } else {
        // Default format untuk proxy lainnya
        url = `${proxy}${encodeURIComponent(targetUrl)}`
      }

      console.log(`Making request to: ${endpoint} via proxy ${retryCount + 1}/${maxRetries}`)
      console.log(`MANUAL FIXED - Target URL: ${targetUrl}`) // Debug log untuk memastikan fix berjalan

      const response = await this.axiosInstance({
        method: requestMethod,
        url,
        headers: requestHeaders
      })

      // Parse response berdasarkan proxy type
      let responseData = response.data

      // Handle AllOrigins response format
      if (proxy.includes('allorigins.win/get') && responseData.contents) {
        responseData = JSON.parse(responseData.contents)
      }

      // Parse response jika masih string
      if (typeof responseData === 'string') {
        try {
          responseData = JSON.parse(responseData)
        } catch (error) {
          console.error('Failed to parse JSON response:', error.message)
          throw new Error('Invalid JSON response from API')
        }
      }

      // Validasi response RajaOngkir
      if (!responseData.rajaongkir) {
        throw new Error('Invalid RajaOngkir response format')
      }

      if (responseData.rajaongkir.status.code !== 200) {
        throw new Error(`RajaOngkir API Error: ${responseData.rajaongkir.status.description}`)
      }

      console.log(`Success: ${endpoint}`)
      return responseData

    } catch (error) {
      console.error(`Error with proxy ${retryCount + 1}:`, error.message)

      // Jika masih ada proxy lain untuk dicoba
      if (retryCount < maxRetries - 1) {
        this.switchToNextProxy()
        return this.makeRequest(endpoint, method, data, retryCount + 1)
      }

      // Jika semua proxy gagal
      throw new Error(`All CORS proxies failed for ${endpoint}. Please check your internet connection or try again later.`)
    }
  }

  async getProvinces() {
    const response = await this.makeRequest('province')
    // FIXED: Return array data instead of full response object
    return response.rajaongkir.results || []
  }

  async getCities(provinceId) {
    if (!provinceId) {
      throw new Error('Province ID is required')
    }
    const response = await this.makeRequest(`city?province=${provinceId}`)
    // FIXED: Return array data instead of full response object
    return response.rajaongkir.results || []
  }

  async getShippingCost(destinationCityId, weight, courier) {
    if (!destinationCityId || !weight || !courier) {
      throw new Error('Destination city ID, weight, and courier are required')
    }

    const postData = {
      origin: BOGOR_CITY_ID,
      destination: destinationCityId,
      weight: weight,
      courier: courier
    }

    return await this.makeRequest('cost', 'POST', postData)
  }

  async getAllShippingCosts(destinationCityId, weight) {
    if (!destinationCityId || !weight) {
      throw new Error('Destination city ID and weight are required')
    }

    const couriers = ['jne', 'pos', 'tiki']
    const results = []
    const errors = []

    for (const courier of couriers) {
      try {
        const result = await this.getShippingCost(destinationCityId, weight, courier)
        if (result.rajaongkir?.results?.[0]?.costs) {
          results.push({
            courier: courier.toUpperCase(),
            services: result.rajaongkir.results[0].costs
          })
        }
      } catch (error) {
        console.error(`Failed to get ${courier} costs:`, error.message)
        errors.push(`${courier.toUpperCase()}: ${error.message}`)
      }
    }

    if (results.length === 0) {
      throw new Error(`Failed to get shipping costs from all couriers: ${errors.join(', ')}`)
    }

    return results
  }
}

export default new RajaOngkir()