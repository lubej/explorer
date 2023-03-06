import { LoaderFunctionArgs } from 'react-router-dom'
import { Layer } from '../../config'
import { getOasisAddress, isValidTxHash } from './helpers'
import { isValidBlockHeight, isValidOasisAddress, isValidEthAddress } from './helpers'
import { AppError, AppErrors } from '../../types/errors'

export abstract class RouteUtils {
  private static ENABLED_PARA_TIMES: Layer[] = [Layer.Emerald]

  static getDashboardRoute = (paraTime: Layer) => {
    return `/${paraTime}`
  }

  static getLatestTransactionsRoute = (paraTime: Layer) => {
    return `/${paraTime}/transactions`
  }

  static getLatestBlocksRoute = (paraTime: Layer) => {
    return `/${paraTime}/blocks`
  }

  static getBlockRoute = (blockHeight: number, paraTime: Layer | null = null) => {
    return `${paraTime ? `/${paraTime}` : ''}/blocks/${encodeURIComponent(blockHeight)}`
  }

  static getTransactionRoute = (txHash: string, paraTime: Layer | null = null) => {
    return `${paraTime ? `/${paraTime}` : ''}/transactions/${encodeURIComponent(txHash)}`
  }

  static getAccountRoute = (sender: string, paraTime: Layer | null = null) => {
    return `${paraTime ? `/${paraTime}` : ''}/account/${encodeURIComponent(sender)}`
  }

  static getSearchRoute = (searchTerm: string) => {
    return `/search?q=${encodeURIComponent(searchTerm)}`
  }

  static getEnabledParaTimes(): Layer[] {
    return RouteUtils.ENABLED_PARA_TIMES
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
  // TODO: remove conversion when API supports querying by EVM address
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

  if (!layer || !RouteUtils.getEnabledParaTimes().includes(layer as Layer)) {
    throw new AppError(AppErrors.InvalidUrl)
  }

  return true
}
