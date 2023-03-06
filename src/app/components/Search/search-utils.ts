import {
  isValidBlockHeight,
  isValidBlockHash,
  isValidTxHash,
  isValidOasisAddress,
  isValidEthAddress,
} from '../../utils/helpers'
import { RouteUtils } from '../../utils/route-utils'
import { Layer } from '../../../config'

export abstract class SearchUtils {
  /**
   * Receives a search term and returns a matching path
   */
  static getNavigationPath(searchTerm: string, layer: Layer = Layer.Emerald): string | undefined {
    const blockHeight = validateAndNormalize.blockHeight(searchTerm)
    const txHash = validateAndNormalize.txHash(searchTerm)
    const evmAccount = validateAndNormalize.evmAccount(searchTerm)
    const consensusAccount = validateAndNormalize.consensusAccount(searchTerm)
    if (blockHeight) return RouteUtils.getBlockRoute(parseInt(blockHeight, 10), layer)
    if (txHash) return RouteUtils.getTransactionRoute(txHash, layer)
    if (evmAccount) return RouteUtils.getAccountRoute(evmAccount, layer)
    if (consensusAccount) return RouteUtils.getAccountRoute(consensusAccount, layer)
    // TODO: block hash, contract, validator, event
    return undefined
  }
}

export const validateAndNormalize = {
  blockHeight: (searchTerm: string) => {
    if (isValidBlockHeight(searchTerm)) {
      return searchTerm
    }
  },
  blockHash: (searchTerm: string) => {
    if (isValidBlockHash(searchTerm.toLowerCase().replace('0x', ''))) {
      return searchTerm.toLowerCase().replace('0x', '')
    }
    if (isValidBlockHash(searchTerm.toLowerCase())) {
      return searchTerm.toLowerCase()
    }
  },

  // TODO: do we need to differentiate between consensus and evm hashes?
  // TODO: normalize to 0x prefix for evm?
  txHash: (searchTerm: string) => {
    if (isValidTxHash(searchTerm.toLowerCase().replace('0x', ''))) {
      return searchTerm.toLowerCase().replace('0x', '')
    }
    if (isValidTxHash(searchTerm.toLowerCase())) {
      return searchTerm.toLowerCase()
    }
  },

  consensusAccount: (searchTerm: string) => {
    if (isValidOasisAddress(searchTerm.replace(/\s/g, '').toLowerCase())) {
      return searchTerm.replace(/\s/g, '').toLowerCase()
    }
  },
  evmAccount: (searchTerm: string) => {
    if (isValidEthAddress(`0x${searchTerm}`)) {
      return `0x${searchTerm.toLowerCase()}`
    }
    if (isValidEthAddress(searchTerm)) {
      return searchTerm.toLowerCase()
    }
  },
} satisfies { [name: string]: (searchTerm: string) => string | undefined }

export function isSearchValid(searchTerm: string) {
  return Object.values(validateAndNormalize).some(fn => !!fn(searchTerm))
}
