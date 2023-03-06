import { LoaderFunctionArgs } from 'react-router-dom'
import { Layer } from '../../config'
import { getOasisAddress, isValidTxHash } from './helpers'
import { isValidBlockHeight, isValidOasisAddress, isValidEthAddress } from './helpers'
import { AppError, AppErrors } from '../../types/errors'

export abstract class RouteUtils {
  private static ENABLED_LAYERS: Layer[] = [Layer.Emerald]

  static getDashboardRoute = (layer: Layer | null = null) => {
    return `${layer ? `/${layer}` : ''}/`
  }

  static getLatestTransactionsRoute = (layer: Layer | null = null) => {
    return `${layer ? `/${layer}/` : ''}transactions`
  }

  static getLatestBlocksRoute = (layer: Layer | null = null) => {
    return `${layer ? `/${layer}/` : ''}blocks`
  }

  static getBlockRoute = (blockHeight: number, layer: Layer | null = null) => {
    return `${layer ? `/${layer}/` : ''}blocks/${encodeURIComponent(blockHeight)}`
  }

  static getTransactionRoute = (txHash: string, layer: Layer | null = null) => {
    return `${layer ? `/${layer}/` : ''}transactions/${encodeURIComponent(txHash)}`
  }

  static getAccountRoute = (sender: string, layer: Layer | null = null) => {
    return `${layer ? `/${layer}/` : ''}account/${encodeURIComponent(sender)}`
  }

  static getEnabledLayers(): Layer[] {
    return RouteUtils.ENABLED_LAYERS
  }
}

const validateAddressParam = (address: string) => {
  const isValid = isValidOasisAddress(address) || isValidEthAddress(address)
  if (!isValid) {
    throw new AppError(AppErrors.InvalidAddress)
  }

  return isValid
}

const validateBlockHeightParam = (blockHeight: string) => {
  const isValid = isValidBlockHeight(blockHeight)
  if (!isValid) {
    throw new AppError(AppErrors.InvalidBlockHeight)
  }

  return isValid
}

const validateTxHashParam = (hash: string) => {
  const isValid = isValidTxHash(hash)
  if (!isValid) {
    throw new AppError(AppErrors.InvalidTxHash)
  }
  return true
}

export const addressParamLoader = async ({ params }: LoaderFunctionArgs) => {
  validateAddressParam(params.address!)
  const address = await getOasisAddress(params.address!)
  return address
}

export const blockHeightParamLoader = async ({ params }: LoaderFunctionArgs) => {
  return validateBlockHeightParam(params.blockHeight!)
}

export const transactionParamLoader = async ({ params }: LoaderFunctionArgs) => {
  return validateTxHashParam(params.hash!)
}

export const layerLoader = async (args: LoaderFunctionArgs) => {
  const {
    params: { layer },
  } = args

  if (!layer || !RouteUtils.getEnabledLayers().includes(layer as Layer)) {
    throw new AppError(AppErrors.InvalidUrl)
  }

  return true
}
