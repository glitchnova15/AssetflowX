import QRCode from 'qrcode'
import { AppError } from '../utils/app-error.js'
import { assetRepository } from '../repositories/asset.repository.js'

export const assetQrService = {
  async generate(assetId) {
    const asset = await assetRepository.findById(assetId)
    if (!asset) throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND')
    return QRCode.toBuffer(JSON.stringify({ version: 1, assetId: asset.id, assetTag: asset.assetTag }), {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 512,
    })
  },
}
